const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));

const formatInr = (amount) => `INR ${Number(amount).toFixed(2)}`;
const createInvoicePdf = require('./createInvoicePdf');

async function sendBusinessPaymentReceipt({ email, ownerName, businessName, paymentId, amount, billingSettings, taxBreakdown, businessDetails, purchaseDescription = 'Business listing fee', isAdvertisement = false }) {
  if (!process.env.BREVO_API_KEY || !process.env.MAIL_FROM_EMAIL) {
    console.warn('Payment receipt email skipped: BREVO_API_KEY or MAIL_FROM_EMAIL is not configured.');
    return false;
  }

  const taxRate = Number(billingSettings?.gstRate || 0);
  const gstin = billingSettings?.sellerGstin?.trim();
  const sellerName = billingSettings?.sellerName || process.env.MAIL_FROM_NAME || 'KumariHub';
  const includesTax = Boolean(gstin && taxRate > 0 && taxRate <= 100 && taxBreakdown?.taxPaise > 0);
  const total = Number(amount);
  const baseAmount = taxBreakdown ? Number(taxBreakdown.basePaise) / 100 : Number(billingSettings?.baseAmount || total);
  const halfTax = includesTax ? Number(taxBreakdown.taxPaise) / 200 : 0;
  const taxRows = includesTax
    ? `<tr><td>CGST (${(taxRate / 2).toFixed(2)}%)</td><td>${formatInr(halfTax)}</td></tr>
       <tr><td>SGST (${(taxRate / 2).toFixed(2)}%)</td><td>${formatInr(halfTax)}</td></tr>`
    : '';
  const sellerRows = `<p><strong>Seller:</strong> ${escapeHtml(sellerName)}${gstin ? `<br><strong>GSTIN:</strong> ${escapeHtml(gstin)}` : ''}</p>`;
  const documentTitle = includesTax ? 'Payment tax invoice' : 'Payment receipt';
  const date = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
  const message = billingSettings?.invoiceMessage || 'Thank you for listing your business with KumariHub.';
  const safeBusiness = escapeHtml(businessName);
  const invoicePdf = createInvoicePdf({
    sellerName, sellerGstin: gstin,
    issueDate: date, ownerName, email, businessName, businessDetails, purchaseDescription, paymentId,
    baseAmount, gstRate: includesTax ? taxRate : 0,
    taxAmount: includesTax ? Number(taxBreakdown.taxPaise) / 100 : 0,
    totalAmount: total, message,
  });
  const detailRows = [
    ['Category', businessDetails?.category],
    ['Address', businessDetails?.address],
    ['Location', businessDetails?.location],
    ['Phone', businessDetails?.phone],
    ['WhatsApp', businessDetails?.whatsapp],
    ['Services', businessDetails?.services],
    ['Description', businessDetails?.aboutBusness],
    ['Delivery', businessDetails?.delivery ? 'Available' : 'Not selected'],
  ].filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([label, value]) => `<tr><td>${label}</td><td>${escapeHtml(Array.isArray(value) ? value.join(', ') : value)}</td></tr>`)
    .join('');
  const html = `<div style="font-family:Arial,sans-serif;color:#222;max-width:600px;margin:auto">
    <h2>${escapeHtml(sellerName)}</h2><h3>${documentTitle}</h3>
    <p>Hello ${escapeHtml(ownerName || businessName)}, your payment for ${escapeHtml(purchaseDescription)} was successful.${isAdvertisement ? ' Your advertisement has been added.' : ' Your business listing has been submitted for admin approval.'} A copy of your bill/invoice is attached as a PDF.</p>
    ${sellerRows}<table style="border-collapse:collapse;width:100%" cellpadding="8" border="1">
      <tr><td>${isAdvertisement ? 'Company' : 'Business'}</td><td>${safeBusiness}</td></tr>${detailRows}<tr><td>Payment ID</td><td>${escapeHtml(paymentId)}</td></tr>
      <tr><td>Date</td><td>${date}</td></tr><tr><td>${escapeHtml(purchaseDescription)}</td><td>${formatInr(baseAmount)}</td></tr>${taxRows}<tr><td><strong>Total paid</strong></td><td><strong>${formatInr(total)}</strong></td></tr>
    </table><p>${escapeHtml(message)}</p></div>`;

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'accept': 'application/json', 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({
      sender: { name: sellerName, email: process.env.MAIL_FROM_EMAIL },
      to: [{ email, name: ownerName || businessName }],
      subject: `${documentTitle} for ${businessName}`,
      htmlContent: html,
      attachment: [{
        name: `KumariHub-Receipt-${String(paymentId).replace(/[^a-zA-Z0-9_-]/g, '-')}.pdf`,
        content: invoicePdf.toString('base64'),
      }],
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Brevo email request failed (${response.status}): ${detail.slice(0, 300)}`);
  }
  return true;
}

async function sendBusinessPaymentFailureNotice({ email, ownerName, businessName, paymentId, amount, failureReason, billingSettings, taxBreakdown }) {
  if (!process.env.BREVO_API_KEY || !process.env.MAIL_FROM_EMAIL) {
    console.warn('Payment failure email skipped: BREVO_API_KEY or MAIL_FROM_EMAIL is not configured.');
    return false;
  }
  const sellerName = billingSettings?.sellerName || process.env.MAIL_FROM_NAME || 'KumariHub';
  const sellerGstin = billingSettings?.sellerGstin?.trim();
  const taxRate = Number(billingSettings?.gstRate || 0);
  const hasTax = Boolean(sellerGstin && taxRate > 0 && taxBreakdown?.taxPaise > 0);
  const baseAmount = Number(taxBreakdown?.basePaise || Math.round(Number(billingSettings?.baseAmount || 0) * 100)) / 100;
  const total = Number(amount || (Number(taxBreakdown?.totalPaise || 0) / 100));
  const halfTax = Number(taxBreakdown?.taxPaise || 0) / 200;
  const message = billingSettings?.paymentFailureMessage || 'Please retry the payment or contact KumariHub with your payment reference.';
  const html = `<div style="font-family:Arial,sans-serif;color:#222;max-width:600px;margin:auto">
    <h2>${escapeHtml(sellerName)}</h2><h3>Payment was not successful</h3>
    <p>Hello ${escapeHtml(ownerName || businessName)}, your payment for the business listing could not be completed.</p>
    <p><strong>Seller:</strong> ${escapeHtml(sellerName)}${sellerGstin ? `<br><strong>GSTIN:</strong> ${escapeHtml(sellerGstin)}` : ''}</p>
    <table style="border-collapse:collapse;width:100%" cellpadding="8" border="1">
      <tr><td>Business</td><td>${escapeHtml(businessName)}</td></tr><tr><td>Payment reference</td><td>${escapeHtml(paymentId)}</td></tr>
      <tr><td>Listing base amount</td><td>${formatInr(baseAmount)}</td></tr>
      ${hasTax ? `<tr><td>CGST (${(taxRate / 2).toFixed(2)}%)</td><td>${formatInr(halfTax)}</td></tr><tr><td>SGST (${(taxRate / 2).toFixed(2)}%)</td><td>${formatInr(halfTax)}</td></tr>` : ''}
      <tr><td>Attempted total</td><td>${formatInr(total)}</td></tr>
    </table>
    ${failureReason ? `<p><strong>Details:</strong> ${escapeHtml(failureReason)}</p>` : ''}
    <p>${escapeHtml(message)}</p></div>`;
  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'accept': 'application/json', 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({
      sender: { name: sellerName, email: process.env.MAIL_FROM_EMAIL },
      to: [{ email, name: ownerName || businessName }],
      subject: `Payment not completed for ${businessName}`,
      htmlContent: html,
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Brevo failure email request failed (${response.status}): ${detail.slice(0, 300)}`);
  }
  return true;
}

module.exports = { sendBusinessPaymentReceipt, sendBusinessPaymentFailureNotice };
