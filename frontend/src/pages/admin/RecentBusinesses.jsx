import React, { useState, useEffect } from 'react';
import BusinessProfileCard from '../../components/BusinessProfileCard';
import { useAdmin } from '../../context/AdminContext';

const RecentBusinesses = () => {

  const API_URL = import.meta.env.VITE_API_URL;
  const { businesses } = useAdmin();


  return (
    <div>
      <div className="p-6 h-screen overflow-y-scroll">
        <h3 className="text-base font-serif font-bold text-[#1A2E26] mb-4">Recent Businesses</h3>
        <div className="space-y-3">
          {businesses.length > 0 ? (
            businesses.map((b, idx) => (
              <BusinessProfileCard
                key={b._id || idx}
                businessName={b.businessName}
                location={b.location}
                createdAt={b.createdAt}
                renewalat={b.expiryDate}
                category={b.category}
                businessIMG={b.img}
                businessStatus={b.status}
                buttonOnClick={() => window.open(`/admin-dashBoard/business/${b._id}`, '_blank')}
              />
            ))
          ) : (
            <p className="text-xs text-gray-500 py-3">No businesses found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecentBusinesses;