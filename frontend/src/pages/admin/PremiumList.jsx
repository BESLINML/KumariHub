import React, { useState, useEffect } from 'react';
import BusinessProfileCard from '../../components/BusinessProfileCard';
import { useAdmin } from '../../context/AdminContext';

const PremiumList = () => {

  const API_URL = import.meta.env.VITE_API_URL;
  const { businesses } = useAdmin()

  const [premiumList, setPremiumList] = useState([]);
  const [nonPremiumList, setNonPremiumList] = useState([]);
  const [subTab, setSubTab] = useState('premium');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const prem = businesses.filter(b => b.premium === true);
    const nonPrem = businesses.filter(b => b.premium === false)
    setPremiumList(prem || []);
    setNonPremiumList(nonPrem || []);
    setLoading(false);
  }, []);

  const currentList = subTab === 'premium' ? premiumList : nonPremiumList;

  if (loading) return <div className="bg-white p-6 rounded-2xl shadow-sm text-center text-xs text-gray-400">Loading listings...</div>;

  return (
    <div className="p-4 sm:p-6 h-screen overflow-y-scroll">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-800 uppercase tracking-wider">
          {subTab === 'premium' ? 'Premium Listings' : 'Non-Premium Listings'}
        </h2>

        {/* Toggle Buttons */}
        <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setSubTab('premium')}
            className={`flex-1 sm:flex-initial text-xs font-bold px-3 sm:px-4 py-2 rounded-lg transition-all cursor-pointer ${subTab === 'premium' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
          >
            Premium ({premiumList.length})
          </button>
          <button
            onClick={() => setSubTab('nonPremium')}
            className={`flex-1 sm:flex-initial text-xs font-bold px-3 sm:px-4 py-2 rounded-lg transition-all cursor-pointer ${subTab === 'nonPremium' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
          >
            Non-Premium ({nonPremiumList.length})
          </button>
        </div>
      </div>

      <div className="space-y-3  overflow-y-auto pr-1">
        {currentList.length > 0 ? (
          currentList.map((item) => (
            <BusinessProfileCard
              key={item._id}
              category={item.category}
              location={item.location}
              createdAt={item.createdAt}
              renewalat={item.expiryDate}
              buttonOnClick={() => window.open(`/admin-dashBoard/business/${item._id}`, '_blank')}
              businessIMG={item.img}
              businessName={item.businessName}
              businessStatus={item.status}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-xs text-gray-400 font-medium">No listings found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumList;