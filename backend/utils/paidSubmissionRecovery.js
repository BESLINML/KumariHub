const { pool } = require('../db');
const { normalizePhone, camelize } = require('./records');
const { getChargeBreakdown } = require('./billingSettings');
const { sendBusinessPaymentReceipt } = require('./sendBusinessPaymentReceipt');

async function saveBusinessFromOrder(order, paymentId) {
  const details = order.businessDetails || {};
  const customer = order.customer || {};
  const email = String(customer.email || details.email || '').trim().toLowerCase();
  if (!email || !details.businessName || !details.category || !details.location || !details.address || !details.phone || !details.aboutBusness) {
    throw new Error('The saved business listing details are incomplete.');
  }
  const values = [
    String(details.ownerName || customer.ownerName || details.businessName).trim(), email,
    String(details.businessName).trim(), String(details.category).trim(), String(details.address).trim(),
    String(details.location).trim(), normalizePhone(details.phone), normalizePhone(details.whatsapp || details.phone),
    JSON.stringify(Array.isArray(details.services) ? details.services : []), String(details.aboutBusness).trim(),
    String(details.img || ''), JSON.stringify(details.timing || {}), String(details.locationLink || ''),
    Boolean(details.delivery), new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), paymentId,
  ];
  const inserted = await pool.query(
    `INSERT INTO businesses
      ("ownerName", email, "businessName", category, address, location, phone, whatsapp, services,
       "aboutBusness", img, timing, "locationLink", delivery, status, premium, "expiryDate", "paymentId")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11,$12::jsonb,$13,$14,'pending',FALSE,$15,$16)
     ON CONFLICT ("paymentId") WHERE "paymentId" IS NOT NULL DO NOTHING
     RETURNING *`, values,
  );
  if (inserted.rowCount) return camelize(inserted.rows[0]);
  const existing = await pool.query('SELECT * FROM businesses WHERE "paymentId"=$1', [paymentId]);
  if (!existing.rowCount) throw new Error('Could not save the paid business listing.');
  return camelize(existing.rows[0]);
}

async function sendReceiptOnce(order, paymentId, amountPaise) {
  const claim = await pool.query(
    `INSERT INTO payment_notifications ("paymentId", type) VALUES ($1, 'succeeded')
     ON CONFLICT ("paymentId") DO NOTHING RETURNING "paymentId"`, [paymentId],
  );
  if (!claim.rowCount) {
    const existing = await pool.query('SELECT type FROM payment_notifications WHERE "paymentId"=$1', [paymentId]);
    return existing.rows[0]?.type === 'succeeded';
  }
  const customer = order.customer || {};
  const isAdvertisement = Boolean(order.details && !order.businessDetails);
  const details = isAdvertisement ? order.details : order.businessDetails || {};
  const email = isAdvertisement ? details.email : customer.email;
  if (!email) {
    await pool.query('DELETE FROM payment_notifications WHERE "paymentId"=$1 AND type=\'succeeded\'', [paymentId]);
    return false;
  }
  const adBaseAmountPaise = Number(order.baseAmountPaise || order.expectedAmountPaise || amountPaise);
  const effectiveSettings = isAdvertisement && !order.settings
    ? { ...order.settings, gstRate: 0 }
    : order.settings;
  const taxBreakdown = getChargeBreakdown(isAdvertisement
    ? { ...effectiveSettings, baseAmount: adBaseAmountPaise / 100 }
    : order.settings);
  const purchaseDescription = isAdvertisement
    ? `Advertisement placement (${order.durationDays} days)`
    : 'Business listing fee';
  const businessDetails = isAdvertisement ? {
    category: details.category,
    location: details.place,
    phone: details.phone,
    aboutBusness: details.description,
  } : details;
  try {
    const sent = await sendBusinessPaymentReceipt({
      email, ownerName: isAdvertisement ? details.ownerName : customer.ownerName || details.ownerName,
      businessName: isAdvertisement ? details.companyName : details.businessName || customer.businessName,
      paymentId, amount: amountPaise / 100, billingSettings: effectiveSettings,
      taxBreakdown, businessDetails, purchaseDescription, isAdvertisement,
    });
    if (!sent) await pool.query('DELETE FROM payment_notifications WHERE "paymentId"=$1 AND type=\'succeeded\'', [paymentId]);
    return sent;
  } catch (error) {
    await pool.query('DELETE FROM payment_notifications WHERE "paymentId"=$1 AND type=\'succeeded\'', [paymentId]);
    console.error('Could not send business payment receipt:', error.message);
    return false;
  }
}

async function completeBusinessOrder(order, paymentId, amountPaise) {
  const business = await saveBusinessFromOrder(order, paymentId);
  const receiptEmailSent = await sendReceiptOnce(order, paymentId, amountPaise);
  return { business, receiptEmailSent };
}

async function saveAdvertisementFromOrder(order, paymentId) {
  const details = order.details || {};
  const digits = String(normalizePhone(details.phone)).replace(/\D/g, '');
  const phoneCandidates = [digits, digits.slice(-10)];
  const eligibility = await pool.query(
    `SELECT id FROM businesses
     WHERE LOWER(BTRIM("businessName"))=LOWER(BTRIM($1))
       AND regexp_replace(phone, '\\D', '', 'g')=ANY($2::text[])
     LIMIT 1`, [details.companyName, phoneCandidates],
  );
  if (!eligibility.rowCount) throw new Error('Advertisement business listing could not be verified.');
  const days = Number(order.durationDays);
  const amount = Number(order.baseAmountPaise || order.expectedAmountPaise) / 100;
  const inserted = await pool.query(
    `INSERT INTO advertisements
      ("companyName", place, phone, category, "coverPhoto", description, "durationDays", amount, "paymentId", "expiresAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW()+($7::integer*INTERVAL '1 day'))
     ON CONFLICT ("paymentId") DO NOTHING RETURNING *`,
    [String(details.companyName).trim(), String(details.place).trim(), normalizePhone(details.phone), String(details.category).trim(),
      String(details.coverPhoto), String(details.description).trim(), days, amount, paymentId],
  );
  let advertisement;
  if (inserted.rowCount) advertisement = camelize(inserted.rows[0]);
  else {
    const existing = await pool.query('SELECT * FROM advertisements WHERE "paymentId"=$1', [paymentId]);
    if (!existing.rowCount) throw new Error('Could not save the paid advertisement.');
    advertisement = camelize(existing.rows[0]);
  }
  const receiptEmailSent = order.details?.email
    ? await sendReceiptOnce(order, paymentId, Number(order.expectedAmountPaise))
    : false;
  return { advertisement, receiptEmailSent };
}

async function recoverCapturedPayment(payment) {
  if (!payment?.id || !payment.order_id || payment.status !== 'captured' || payment.currency !== 'INR') {
    throw new Error('Captured payment details are invalid.');
  }
  const listing = (await pool.query('SELECT * FROM billing_orders WHERE "orderId"=$1', [payment.order_id])).rows[0];
  if (listing) {
    if (Number(payment.amount) !== Number(listing.expectedAmountPaise)) throw new Error('Captured listing amount does not match its order.');
    return completeBusinessOrder(listing, payment.id, Number(payment.amount));
  }
  const advertisement = (await pool.query('SELECT * FROM advertisement_orders WHERE "orderId"=$1', [payment.order_id])).rows[0];
  if (advertisement) {
    if (Number(payment.amount) !== Number(advertisement.expectedAmountPaise)) throw new Error('Captured advertisement amount does not match its order.');
    return saveAdvertisementFromOrder(advertisement, payment.id);
  }
  throw new Error('Captured payment order was not found.');
}

module.exports = { completeBusinessOrder, saveAdvertisementFromOrder, recoverCapturedPayment };
