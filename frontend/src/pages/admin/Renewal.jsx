import React, { useState } from 'react';
import BusinessProfileCard from '../../components/BusinessProfileCard';
import { useAdmin } from '../../context/AdminContext';

const Renewal = () => {


  const { businesses, loading } = useAdmin();
  const [subTab, setSubTab] = useState('expired');


  const currentDate = new Date();


  const expiredList = businesses.filter(b =>
    b.status === 'expired' || (b.expiryDate && new Date(b.expiryDate) < currentDate)
  );


  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  nextWeek.setHours(23, 59, 59, 999);

  const upcomingList = businesses.filter(b => {
    if (b.status !== 'active' || !b.expiryDate) return false;
    const expDate = new Date(b.expiryDate);
    return expDate >= today && expDate <= nextWeek;
  });

  const currentList = subTab === 'expired' ? expiredList : upcomingList;

  if (loading && businesses.length === 0) {
    return <div className="bg-white p-6 rounded-2xl shadow-sm text-center text-xs text-gray-400">Loading renewals...</div>;
  }

  return (
    <div className="p-4 sm:p-6 h-screen overflow-y-scroll">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-800 uppercase tracking-wider">
          {subTab === 'expired' ? 'Expired Listings' : 'Upcoming Renewals'}
        </h2>


        <div className="flex bg-gray-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setSubTab('expired')}
            className={`flex-1 sm:flex-initial text-xs font-bold px-3 sm:px-4 py-2 rounded-lg transition-all cursor-pointer ${subTab === 'expired' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
          >
            Expired ({expiredList.length})
          </button>
          <button
            onClick={() => setSubTab('upcoming')}
            className={`flex-1 sm:flex-initial text-xs font-bold px-3 sm:px-4 py-2 rounded-lg transition-all cursor-pointer ${subTab === 'upcoming' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
              }`}
          >
            Upcoming ({upcomingList.length})
          </button>
        </div>
      </div>

      <div className="space-y-3 max-h-112.5 overflow-y-auto pr-1">
        {currentList.length > 0 ? (
          currentList.map((item) => (
            <BusinessProfileCard
              key={item._id}
              buttonOnClick={() => window.open(`/admin-dashBoard/business/${item._id}`, '_blank')}
              businessIMG={item.img}
              businessName={item.businessName}
              businessStatus={item.status}
              category={item.category}
              createdAt={item.createdAt}
              location={item.location}
              renewalat={item.expDate}
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

export default Renewal;