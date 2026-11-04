import React, { useEffect, useMemo, useState } from 'react';
import { adminFetch } from '../../utils/adminFetch';

const initialSettings = {
  baseAmount: 168,
  gstRate: 0,
  sellerName: 'KumariHub',
  sellerGstin: '',
  invoiceMessage: 'Thank you for listing your business with KumariHub.',
  paymentFailureMessage: 'Please retry the payment. If you were charged, contact us with your payment reference.',
};

const BillingSettings = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  useEffect(() => {
    let mounted = true;
    adminFetch(`${API_URL}/api/admin/billing-settings`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load billing settings.');
        if (mounted) setSettings({ ...initialSettings, ...data });
      })
      .catch((error) => mounted && setNotice({ type: 'error', text: error.message }))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [API_URL]);

  const breakdown = useMemo(() => {
    const base = Number(settings.baseAmount) || 0;
    const gst = Math.round(base * (Number(settings.gstRate) || 0)) / 100;
    return { base, gst, halfGst: gst / 2, total: base + gst };
  }, [settings.baseAmount, settings.gstRate]);

  const updateField = (event) => setSettings((current) => ({ ...current, [event.target.name]: event.target.value }));

  const saveSettings = async (event) => {
    event.preventDefault();
    setNotice(null);
    setSaving(true);
    try {
      const response = await adminFetch(`${API_URL}/api/admin/billing-settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not save billing settings.');
      setSettings({ ...initialSettings, ...data });
      setNotice({ type: 'success', text: 'Billing and invoice settings saved.' });
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const previewInvoice = async () => {
    setPreviewLoading(true);
    setNotice(null);
    try {
      const response = await adminFetch(`${API_URL}/api/admin/billing-settings/preview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Could not create the invoice preview.');
      }
      const nextUrl = URL.createObjectURL(await response.blob());
      setPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return nextUrl;
      });
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setPreviewLoading(false);
    }
  };

  const fieldClass = 'mt-1.5 w-full rounded-xl border border-[#e7e1d8] bg-white px-4 py-3 text-sm text-[#1C1813] outline-none focus:border-[#D4AF37]';

  if (loading) return <div className="p-8 text-sm text-gray-500">Loading billing settings…</div>;

  return (
    <section className="mx-auto max-w-4xl p-4 sm:p-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9a7526]">Admin settings</p>
          <h1 className="mt-2 text-2xl font-bold text-[#1C1813] sm:text-3xl">Listing fee & invoice</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">Set the listing base price and seller details used for payment orders and emailed receipts.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={previewInvoice} disabled={previewLoading} className="rounded-xl border border-[#1A2E26] px-5 py-3 text-sm font-semibold text-[#1A2E26] transition hover:bg-[#f5f4f0] disabled:cursor-wait disabled:opacity-60">
            {previewLoading ? 'Preparing PDF...' : 'Preview PDF'}
          </button>
          <button type="submit" form="billing-settings-form" disabled={saving} className="rounded-xl bg-[#1A2E26] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#284638] disabled:cursor-wait disabled:opacity-60">
            {saving ? 'Saving...' : 'Save settings'}
          </button>
        </div>
      </header>

      {notice && <p role="status" className={`mb-5 rounded-xl px-4 py-3 text-sm ${notice.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>{notice.text}</p>}

      <form id="billing-settings-form" onSubmit={saveSettings} className="space-y-6 rounded-2xl border border-[#eee7dc] bg-white p-5 shadow-sm sm:p-7">
        <div>
          <h2 className="text-lg font-semibold text-[#1C1813]">Payment price</h2>
          <p className="mt-1 text-sm text-gray-500">The GST amount is added to the base price when calculating the checkout total.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-gray-700">Base listing amount (INR)
              <input className={fieldClass} name="baseAmount" type="number" min="1" max="1000000" step="0.01" required value={settings.baseAmount} onChange={updateField} />
            </label>
            <label className="text-sm font-medium text-gray-700">GST rate (%)
              <input className={fieldClass} name="gstRate" type="number" min="0" max="100" step="0.01" required value={settings.gstRate} onChange={updateField} />
            </label>
          </div>
          <div className="mt-4 rounded-xl bg-[#FCF7EF] p-4 text-sm text-[#51473a]">
            <div className="flex justify-between"><span>Base amount</span><span>₹{breakdown.base.toFixed(2)}</span></div>
            {Number(settings.gstRate) > 0 && <>
              <div className="mt-2 flex justify-between"><span>CGST ({(Number(settings.gstRate) / 2).toFixed(2)}%)</span><span>₹{breakdown.halfGst.toFixed(2)}</span></div>
              <div className="mt-2 flex justify-between"><span>SGST ({(Number(settings.gstRate) / 2).toFixed(2)}%)</span><span>₹{breakdown.halfGst.toFixed(2)}</span></div>
            </>}
            <div className="mt-3 flex justify-between border-t border-[#e3d9c9] pt-3 font-bold"><span>Checkout total</span><span>₹{breakdown.total.toFixed(2)}</span></div>
          </div>
        </div>

        <div className="border-t border-[#eee7dc] pt-6">
          <h2 className="text-lg font-semibold text-[#1C1813]">Seller details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-gray-700">Seller legal name
              <input className={fieldClass} name="sellerName" maxLength="120" required value={settings.sellerName} onChange={updateField} />
            </label>
            <label className="text-sm font-medium text-gray-700">GSTIN{Number(settings.gstRate) > 0 ? ' *' : ''}
              <input className={fieldClass} name="sellerGstin" maxLength="15" required={Number(settings.gstRate) > 0} value={settings.sellerGstin} onChange={updateField} placeholder="15-character GSTIN" />
            </label>
          </div>
        </div>

        <div className="border-t border-[#eee7dc] pt-6">
          <h2 className="text-lg font-semibold text-[#1C1813]">Invoice email</h2>
          <label className="mt-4 block text-sm font-medium text-gray-700">Message shown on the payment receipt/invoice
            <textarea className={fieldClass} name="invoiceMessage" maxLength="1000" rows="3" value={settings.invoiceMessage} onChange={updateField} />
          </label>
          <label className="mt-4 block text-sm font-medium text-gray-700">Message shown when a payment fails
            <textarea className={fieldClass} name="paymentFailureMessage" maxLength="1000" rows="3" value={settings.paymentFailureMessage} onChange={updateField} />
          </label>
          <p className="mt-2 text-xs leading-5 text-gray-500">Receipt emails are sent after successful payment when Brevo is configured on the backend.</p>
        </div>

        <div className="flex justify-end border-t border-[#eee7dc] pt-5">
          <button type="submit" disabled={saving} className="rounded-xl bg-[#1A2E26] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#284638] disabled:cursor-wait disabled:opacity-60">
            {saving ? 'Saving…' : 'Save billing settings'}
          </button>
        </div>
      </form>
      {previewUrl && <div role="dialog" aria-modal="true" aria-label="Invoice PDF demo" className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6" onClick={(event) => event.target === event.currentTarget && setPreviewUrl('')}>
        <div className="flex h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#eee7dc] px-4 py-3 sm:px-6">
            <div><h2 className="font-semibold text-[#1C1813]">Invoice PDF demo</h2><p className="text-xs text-gray-500">Sample customer and payment details</p></div>
            <div className="flex items-center gap-2">
              <a href={previewUrl} download="KumariHub-Invoice-Demo.pdf" className="rounded-lg bg-[#1A2E26] px-3 py-2 text-sm font-semibold text-white">Download PDF</a>
              <button type="button" onClick={() => setPreviewUrl('')} aria-label="Close preview" className="rounded-lg border px-3 py-2 text-sm text-gray-700">Close</button>
            </div>
          </div>
          <iframe title="Sample invoice PDF" src={previewUrl} className="min-h-0 flex-1" />
        </div>
      </div>}
    </section>
  );
};

export default BillingSettings;
