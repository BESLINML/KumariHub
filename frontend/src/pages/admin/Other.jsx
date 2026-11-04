import React, { useEffect, useMemo, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BusinessProfileCard from '../../components/BusinessProfileCard';
import { categoryIcons } from '../../components/PopularCategories';
import { Shapes } from 'lucide-react';

const Other = () => {

  const { adminFetch } = useAdmin();
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view') === 'locations' ? 'locations' : 'categories';

  const [category, setCategory] = useState(() => {
    const saved = localStorage.getItem('admin_categories');
    return saved ? JSON.parse(saved) : [];
  });

  const [locationsList, setLocationsList] = useState(() => {
    const saved = localStorage.getItem('admin_locations');
    return saved ? JSON.parse(saved) : [];
  });

  const [businessCounts, setBusinessCounts] = useState({ categories: [], locations: [] });
  const [selection, setSelection] = useState(null);
  const [relatedBusinesses, setRelatedBusinesses] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [relatedError, setRelatedError] = useState('');

  useEffect(() => {
    let isMounted = true;
    adminFetch(`${API_URL}/api/businesses/admin/counts`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not load business counts.');
        if (isMounted) setBusinessCounts(data);
      })
      .catch((error) => console.error('Could not load location and category counts:', error));
    return () => { isMounted = false; };
  }, []);

  const categoryCounts = useMemo(() => {
    const counts = new Map();
    businessCounts.categories.forEach(({ name, businessCount }) => counts.set(String(name).trim().toLocaleLowerCase(), businessCount));
    return counts;
  }, [businessCounts.categories]);
  const locationCounts = useMemo(() => {
    const counts = new Map();
    businessCounts.locations.forEach(({ name, businessCount }) => counts.set(String(name).trim().toLocaleLowerCase(), businessCount));
    return counts;
  }, [businessCounts.locations]);
  const rankedCategories = useMemo(() => [...category].sort((left, right) => {
    const leftName = typeof left === 'object' && left !== null ? (left.name || left.categoryName || '') : left;
    const rightName = typeof right === 'object' && right !== null ? (right.name || right.categoryName || '') : right;
    const countDifference = (categoryCounts.get(String(rightName).trim().toLocaleLowerCase()) || 0) - (categoryCounts.get(String(leftName).trim().toLocaleLowerCase()) || 0);
    return countDifference || String(leftName).localeCompare(String(rightName));
  }), [category, categoryCounts]);
  const rankedLocations = useMemo(() => [...locationsList].sort((left, right) => {
    const leftName = typeof left === 'object' && left !== null ? left.locationName : left;
    const rightName = typeof right === 'object' && right !== null ? right.locationName : right;
    const countDifference = (locationCounts.get(String(rightName).trim().toLocaleLowerCase()) || 0) - (locationCounts.get(String(leftName).trim().toLocaleLowerCase()) || 0);
    return countDifference || String(leftName).localeCompare(String(rightName));
  }), [locationsList, locationCounts]);

  const selectItem = async (type, name) => {
    setSelection({ type, name });
    setRelatedBusinesses([]);
    setRelatedLoading(true);
    setRelatedError('');
    try {
      const params = new URLSearchParams({ type, name });
      const response = await adminFetch(`${API_URL}/api/businesses/admin/related?${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not load related businesses.');
      setRelatedBusinesses(Array.isArray(data) ? data : []);
    } catch (error) {
      setRelatedError(error.message || 'Could not load related businesses.');
    } finally {
      setRelatedLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-y-scroll p-5">
      <div className={`grid grid-cols-1 gap-6 ${view === 'both' ? 'lg:grid-cols-2' : ''}`}>


        {view !== 'locations' && <div className="space-y-3 bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
          <p className="flex items-center gap-2 text-base font-serif font-bold text-[#1A2E26]"><Shapes aria-hidden="true" className="w-5 h-5 text-[#D4AF37] shrink-0" />Top Categories</p>
          <div className="space-y-3 lg:p-5">
            {rankedCategories.map((cat, idx) => {
              const catName = typeof cat === 'object' && cat !== null ? (cat.name || cat.categoryName) : cat;
              const businessCount = categoryCounts.get(String(catName).trim().toLocaleLowerCase()) || 0;
              return (

                <button type="button" key={cat.id || catName || idx} onClick={() => selectItem('category', catName)} className={`bg-[#EAEFEA]/50 w-full rounded-2xl p-3 flex items-center justify-between text-left hover:bg-[#EAEFEA] ${selection?.type === 'category' && selection.name === catName ? 'ring-2 ring-[#DBA55C]' : ''}`}>
                  <div className="flex items-center gap-5">
                    <img src={cat.img || categoryIcons[catName]} className="w-10 h-10 sm:w-8 sm:h-8 rounded-full object-cover object-center bg-white p-1 shrink-0 shadow" alt={catName} />
                  <div className="min-w-0"><p className="text-xs font-bold text-[#1A2E26] truncate">{catName}</p><p className="text-[10px] text-gray-500">{businessCount} {businessCount === 1 ? 'business' : 'businesses'}</p></div>
                  </div>
                  <span aria-hidden="true" className="text-gray-400">›</span>
                </button>
              );
            })}
          </div>
        </div>}

        {view === 'locations' && <div className="space-y-3 bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
          <p className="text-base font-serif font-bold text-[#1A2E26]">Top Location</p>
          <div className="space-y-3 lg:p-5">
            {rankedLocations.map((loc, idx) => {
              const locName = typeof loc === 'object' && loc !== null ? loc.locationName : loc;
              const businessCount = locationCounts.get(String(locName).trim().toLocaleLowerCase()) || 0;
              return (
                <button type="button" key={loc.id || locName || idx} onClick={() => selectItem('location', locName)} className={`bg-[#EAEFEA]/50 w-full rounded-2xl p-3 flex items-center justify-between text-left hover:bg-[#EAEFEA] ${selection?.type === 'location' && selection.name === locName ? 'ring-2 ring-[#DBA55C]' : ''}`}>
                  <div className="flex items-center gap-5">
                    <div><p className="text-xs font-bold text-[#1A2E26] truncate">{locName}</p><p className="text-[10px] text-gray-500">{businessCount} {businessCount === 1 ? 'business' : 'businesses'}</p></div>
                  </div>
                  <span aria-hidden="true" className="text-gray-400">›</span>
                </button>
              );
            })}
          </div>
        </div>}

      </div>
      {selection && <section className="mt-6 space-y-3 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-serif font-bold text-[#1A2E26]">Businesses in {selection.name}</h2>
          <button type="button" onClick={() => { setSelection(null); setRelatedBusinesses([]); setRelatedError(''); }} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">Close</button>
        </div>
        {relatedLoading ? <p className="py-8 text-center text-sm text-gray-500">Loading businesses…</p>
          : relatedError ? <p role="alert" className="py-8 text-center text-sm text-red-600">{relatedError}</p>
            : relatedBusinesses.length ? <div className="space-y-3">{relatedBusinesses.map((business) => <div key={business._id} role="button" tabIndex={0} onClick={() => navigate(`/admin-dashboard/business/${business._id}`)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); navigate(`/admin-dashboard/business/${business._id}`); } }} className="cursor-pointer rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"><BusinessProfileCard businessName={business.businessName} location={business.location} category={business.category} businessIMG={business.img} businessStatus={business.status} /></div>)}</div>
              : <p className="py-8 text-center text-sm text-gray-500">No businesses are listed in this {selection.type} yet.</p>}
      </section>}
    </div>
  );
};

export default Other;
