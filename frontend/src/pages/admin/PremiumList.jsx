import React, { useEffect, useState } from 'react';
import { adminFetch } from '../../utils/adminFetch';

const API_URL = import.meta.env.VITE_API_URL;

const formatDate = (value) => value ? new Date(value).toLocaleDateString() : 'â€”';

const emptyForm = { companyName: '', place: '', phone: '', category: '', coverPhoto: '', description: '' };

const PremiumList = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    let isMounted = true;

    adminFetch(`${API_URL}/api/advertisements?all=true`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load advertisements.');
        return data;
      })
      .then((data) => {
        if (isMounted) setAdvertisements(Array.isArray(data) ? data : []);
      })
      .catch((loadError) => {
        if (isMounted) setError(loadError.message || 'Could not load advertisements.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const startEditing = (item) => {
    setEditing(item);
    setForm({ companyName: item.companyName || '', place: item.place || '', phone: item.phone || '', category: item.category || '', coverPhoto: item.coverPhoto || '', description: item.description || '' });
    setActionError('');
  };

  const saveAdvertisement = async (event) => {
    event.preventDefault();
    setSaving(true);
    setActionError('');
    try {
      const response = await adminFetch(`${API_URL}/api/advertisements/${editing._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not update advertisement.');
      setAdvertisements((current) => current.map((item) => item._id === data._id ? data : item));
      setEditing(null);
    } catch (saveError) {
      setActionError(saveError.message || 'Could not update advertisement.');
    } finally { setSaving(false); }
  };

  const deleteAdvertisement = async (item) => {
    if (!window.confirm(`Delete the advertisement for ${item.companyName}?`)) return;
    setActionError('');
    try {
      const response = await adminFetch(`${API_URL}/api/advertisements/${item._id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not delete advertisement.');
      setAdvertisements((current) => current.filter((ad) => ad._id !== item._id));
    } catch (deleteError) { setActionError(deleteError.message || 'Could not delete advertisement.'); }
  };

  return (
    <div className="p-4 sm:p-6 h-screen overflow-y-scroll">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-800 uppercase tracking-wider">Advertisement List</h2>
      </div>
      {actionError && !editing && <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-700">{actionError}</p>}

      <div className="space-y-3 overflow-y-auto pr-1">
        {loading ? (
          <div className="bg-white p-6 rounded-2xl shadow-sm text-center text-xs text-gray-400">Loading advertisements...</div>
        ) : error ? (
          <div role="alert" className="text-center py-12 bg-red-50 rounded-2xl border border-red-100">
            <p className="text-xs text-red-600 font-medium">{error}</p>
          </div>
        ) : advertisements.length > 0 ? (
          advertisements.map((item) => {
            const isActive = item.expiresAt && new Date(item.expiresAt) > new Date();
            return (
              <article key={item._id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-[#EAEFEA]/50 rounded-2xl border border-gray-300">
                {item.coverPhoto && (
                  <img src={item.coverPhoto} alt={item.companyName || 'Advertisement'} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-[#1A2E26] truncate">{item.companyName}</h3>
                  <p className="text-xs text-gray-600">{item.category} Â· {item.place}</p>
                  <p className="text-xs text-gray-600">{item.phone}</p>
                  {item.description && <p className="mt-1 text-xs text-gray-500 line-clamp-2">{item.description}</p>}
                </div>
                <div className="flex flex-wrap sm:flex-col gap-2 sm:items-end shrink-0">
                  <span className={`text-[10px] font-semibold px-2 py-1 rounded-md ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>
                    {isActive ? 'Active' : 'Expired'}
                  </span>
                  <span className="text-[10px] font-semibold text-gray-600">Paid: {formatDate(item.createdAt)}</span>
                  <span className="text-[10px] font-semibold text-gray-600">Expires: {formatDate(item.expiresAt)}</span>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => startEditing(item)} className="rounded-lg bg-[#1A2E26] px-3 py-1.5 text-[10px] font-semibold text-white">Edit</button>
                    <button type="button" onClick={() => deleteAdvertisement(item)} className="rounded-lg border border-red-200 px-3 py-1.5 text-[10px] font-semibold text-red-600">Delete</button>
                  </div>
                  <span className="text-[10px] text-gray-500">{item.durationDays} days Â· â‚¹{item.amount}</span>
                </div>
              </article>
            );
          })
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-xs text-gray-400 font-medium">No advertisements found.</p>
          </div>
        )}
      </div>
      {editing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <form onSubmit={saveAdvertisement} className="max-h-[90vh] w-full max-w-xl space-y-4 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
          <div className="flex items-center justify-between"><h3 className="text-lg font-bold text-[#1A2E26]">Edit advertisement</h3><button type="button" disabled={saving} onClick={() => setEditing(null)} aria-label="Close" className="text-xl text-gray-500">×</button></div>
          {actionError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-xs text-red-700">{actionError}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            {[['companyName', 'Business name'], ['place', 'Place'], ['phone', 'Phone'], ['category', 'Category'], ['coverPhoto', 'Cover photo URL']].map(([name, label]) => <label key={name} className="text-xs font-semibold text-gray-700">{label}<input required value={form[name]} onChange={(event) => setForm({ ...form, [name]: event.target.value })} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal" /></label>)}
            <label className="text-xs font-semibold text-gray-700 sm:col-span-2">Description<textarea required rows={4} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-normal" /></label>
          </div>
          <div className="flex justify-end gap-2"><button type="button" disabled={saving} onClick={() => setEditing(null)} className="rounded-full border px-4 py-2 text-sm">Cancel</button><button type="submit" disabled={saving} className="rounded-full bg-[#DBA55C] px-5 py-2 text-sm font-semibold text-[#1A2E26] disabled:opacity-60">{saving ? 'Saving…' : 'Save changes'}</button></div>
        </form>
      </div>}
    </div>
  );
};

export default PremiumList;
