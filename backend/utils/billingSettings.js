const DEFAULT_BILLING_SETTINGS = Object.freeze({
  baseAmount: 168,
  gstRate: 0,
  sellerName: 'KumariHub',
  sellerGstin: '',
  invoiceMessage: 'Thank you for listing your business with KumariHub.',
  paymentFailureMessage: 'Please retry the payment. If you were charged, contact us with your payment reference.',
});

const getChargeBreakdown = (settings) => {
  const basePaise = Math.round(Number(settings.baseAmount) * 100);
  const taxPaise = Math.round(basePaise * Number(settings.gstRate || 0) / 100);
  return { basePaise, taxPaise, totalPaise: basePaise + taxPaise };
};

async function loadBillingSettings(pool) {
  const result = await pool.query('SELECT settings FROM billing_settings WHERE id=1');
  return { ...DEFAULT_BILLING_SETTINGS, ...(result.rows[0]?.settings || {}) };
}

function validateBillingSettings(input) {
  const settings = {
    baseAmount: Number(input.baseAmount),
    gstRate: Number(input.gstRate),
    sellerName: String(input.sellerName || '').trim(),
    sellerGstin: String(input.sellerGstin || '').trim().toUpperCase(),
    invoiceMessage: String(input.invoiceMessage || '').trim(),
    paymentFailureMessage: String(input.paymentFailureMessage || '').trim(),
  };

  if (!Number.isFinite(settings.baseAmount) || settings.baseAmount < 1 || settings.baseAmount > 1000000) {
    return { error: 'Base listing amount must be between ₹1 and ₹10,00,000.' };
  }
  if (!Number.isFinite(settings.gstRate) || settings.gstRate < 0 || settings.gstRate > 100) {
    return { error: 'GST rate must be between 0% and 100%.' };
  }
  if (!settings.sellerName || settings.sellerName.length > 120) return { error: 'Enter a seller name (up to 120 characters).' };
  if (settings.invoiceMessage.length > 1000 || settings.paymentFailureMessage.length > 1000) {
    return { error: 'Payment message is too long.' };
  }
  if (settings.gstRate > 0 && !settings.sellerGstin) {
    return { error: 'GSTIN is required when GST is charged.' };
  }
  if (settings.sellerGstin && !/^[0-9A-Z]{15}$/.test(settings.sellerGstin)) {
    return { error: 'GSTIN must contain 15 letters and numbers.' };
  }
  return { settings };
}

module.exports = { DEFAULT_BILLING_SETTINGS, getChargeBreakdown, loadBillingSettings, validateBillingSettings };
