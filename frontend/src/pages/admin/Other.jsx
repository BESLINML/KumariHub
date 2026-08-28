import React, { useState } from 'react';
import BusinessProfileCard from '../../components/BusinessProfileCard';
import { useAdmin } from '../../context/AdminContext';

const Other = () => {

  const { businesses } = useAdmin();

  const [category] = useState(() => {
    const saved = localStorage.getItem('admin_categories');
    return saved ? JSON.parse(saved) : [];
  });

  const [locationsList] = useState(() => {
    const saved = localStorage.getItem('admin_locations');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const filteredBusinesses = businesses.filter(b => {
    if (selectedCategory) return b.category === selectedCategory;
    if (selectedLocation) return b.location === selectedLocation;
    return true;
  });

  return (
    <div className="flex flex-col  h-screen overflow-y-scroll p-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Categories Section */}
        <div className="space-y-3 bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
          <p className="text-base font-serif font-bold text-[#1A2E26]">Top Categories</p>
          <div className="space-y-3 h-70 overflow-y-scroll scrollbar-none p-5">
            {category.map((cat, idx) => {
              const catName = typeof cat === 'object' && cat !== null ? (cat.name || cat.categoryName) : cat;
              return (
                <BusinessProfileCard
                  key={idx}
                  businessIMG={cat.img}
                  businessName={catName}
                  buttonOnClick={() => { setSelectedCategory(catName); setSelectedLocation(null); }}
                />
              );
            })}
          </div>
        </div>

        {/* Top Locations Section */}
        <div className="space-y-3 bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
          <p className="text-base font-serif font-bold text-[#1A2E26]">Top Location</p>
          <div className="space-y-3 h-70 overflow-y-scroll scrollbar-none p-5">
            {locationsList.map((loc, idx) => {
              const locName = typeof loc === 'object' && loc !== null ? loc.locationName : loc;
              return (
                <BusinessProfileCard
                  key={idx}
                  businessName={locName}
                  buttonOnClick={() => { setSelectedLocation(locName); setSelectedCategory(null); }}
                />
              );
            })}
          </div>
        </div>

      </div>

      {/* Filtered Businesses Section */}
      <div className="mt-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-serif font-bold text-[#1A2E26]">
            {selectedCategory ? `Businesses in Category: ${selectedCategory}` :
              selectedLocation ? `Businesses in Location: ${selectedLocation}` :
                "All Businesses"}
          </h3>
          {(selectedCategory || selectedLocation) && (
            <button
              onClick={() => { setSelectedCategory(null); setSelectedLocation(null); }}
              className="text-[11px] bg-rose-100 text-rose-600 px-3 py-1 rounded-lg font-semibold cursor-pointer"
            >
              Clear Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 ">
          {filteredBusinesses.length > 0 ? (
            filteredBusinesses.map((bus, i) => (
              <BusinessProfileCard
                key={bus._id || i}
                businessIMG={bus.img}
                businessName={bus.businessName}
                dis={bus.location}
                businessStatus={bus.status}
                buttonOnClick={() => window.open(`/admin-dashBoard/business/${bus._id}`, '_blank')}
              />
            ))
          ) : (
            <p className="text-xs text-gray-400 col-span-2 py-4 text-center">No businesses found for this filter.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Other;