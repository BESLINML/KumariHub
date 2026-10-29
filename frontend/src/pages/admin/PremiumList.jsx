import React, { useEffect, useState } from 'react';
import { adminFetch } from '../../utils/adminFetch';

const API_URL = import.meta.env.VITE_API_URL;

const formatDate = (value) => value ? new Date(value).toLocaleDateString() : 'â€”';

const PremiumList = () => {
  const [advertisements, setAdvertisements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  return (
    <div className="p-4 sm:p-6 h-screen overflow-y-scroll">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-800 uppercase tracking-wider">Advertisement List</h2>
      </div>

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
    </div>
  );
};

export default PremiumList;
