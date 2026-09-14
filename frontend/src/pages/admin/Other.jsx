import React, { useState } from 'react';
import BusinessProfileCard from '../../components/BusinessProfileCard';
import { useAdmin } from '../../context/AdminContext';

const Other = () => {

  const { businesses } = useAdmin();
  const API_URL = import.meta.env.VITE_API_URL;

  const [category, setCategory] = useState(() => {
    const saved = localStorage.getItem('admin_categories');
    return saved ? JSON.parse(saved) : [];
  });

  const [locationsList, setLocationsList] = useState(() => {
    const saved = localStorage.getItem('admin_locations');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);

// Delete Category with DB & LocalStorage sync
  const handleDeleteCategory = async (catToDelete) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete the category, It may colapce the link of the business created at this category "${catToDelete}"?`);
    if (!isConfirmed) return;

    try {
      // 1. Database-kku delete request anuppuvathu (Endpoint ungaloda backend route-ku etha maatri maathikonga)
      const response = await fetch(`${API_URL}/api/categories/${encodeURIComponent(catToDelete)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete from database');
      }

      // 2. Local State & LocalStorage update panrathu
      const updatedCategories = category.filter((cat) => {
        const name = typeof cat === 'object' && cat !== null ? (cat.name || cat.categoryName) : cat;
        return name !== catToDelete;
      });
      setCategory(updatedCategories);
      localStorage.setItem('admin_categories', JSON.stringify(updatedCategories));
      
      alert("Category deleted successfully from Database & LocalStorage! ");
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category from database.");
    }
  };

  // Delete Location with DB & LocalStorage sync
  const handleDeleteLocation = async (locToDelete) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete the location, It may colapce the link of the business created at this Location "${locToDelete}"?`);
    if (!isConfirmed) return;

    try {
      // 1. Database-kku delete request anuppuvathu
      const response = await fetch(`${API_URL}/api/locations/${encodeURIComponent(locToDelete)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete from database');
      }

      // 2. Local State & LocalStorage update panrathu
      const updatedLocations = locationsList.filter((loc) => {
        const name = typeof loc === 'object' && loc !== null ? loc.locationName : loc;
        return name !== locToDelete;
      });
      setLocationsList(updatedLocations);
      localStorage.setItem('admin_locations', JSON.stringify(updatedLocations));
      
      alert("Location deleted successfully from Database & LocalStorage!");
    } catch (error) {
      console.error("Error deleting location:", error);
      alert("Failed to delete location from database.");
    }
  };
  const filteredBusinesses = businesses.filter(b => {
    if (selectedCategory) return b.category === selectedCategory;
    if (selectedLocation) return b.location === selectedLocation;
    return true;
  });

  return (
    <div className="flex flex-col h-screen overflow-y-scroll p-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Categories Section */}
        <div className="space-y-3 bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
          <p className="text-base font-serif font-bold text-[#1A2E26]">Top Categories</p>
          <div className="space-y-3 h-70 overflow-y-scroll scrollbar-none lg:p-5">
            {category.map((cat, idx) => {
              const catName = typeof cat === 'object' && cat !== null ? (cat.name || cat.categoryName) : cat;
              return (

                <div className="bg-[#EAEFEA]/50 w-full rounded-2xl p-3 flex justify-between" >
                  <div className="flex items-center gap-5">
                    <img src={cat.img} className="w-10 h-10 sm:w-8 sm:h-8 rounded-xl object-cover shrink-0 shadow-2xs" />
                    <p className="text-xs  font-bold text-[#1A2E26] truncate">{catName}</p>
                  </div>
                  <button onClick={() => handleDeleteCategory(catName)} className="text-[10px] text-center sm:text-xs font-semibold sm:inline-block bg-white px-3 rounded-md border border-red-200 text-red-500 hover:bg-red-500 hover:text-white">Delete</button>
                </div>
                // <BusinessProfileCard
                //   key={idx}
                //   businessIMG={cat.img}
                //   businessName={catName}
                //   businessStatus="Delete" // Optional: Card-la status-ku pathila text kaattalam
                //   buttonOnClick={() => handleDeleteCategory(catName)}
                // />
              );
            })}
          </div>
        </div>

        {/* Top Locations Section */}
        <div className="space-y-3 bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
          <p className="text-base font-serif font-bold text-[#1A2E26]">Top Location</p>
          <div className="space-y-3 h-70 overflow-y-scroll scrollbar-none lg:p-5">
            {locationsList.map((loc, idx) => {
              const locName = typeof loc === 'object' && loc !== null ? loc.locationName : loc;
              return (
                <div className="bg-[#EAEFEA]/50 w-full rounded-2xl p-3 flex justify-between h-13" >
                  <div className="flex items-center gap-5">
                    <p className="text-xs  font-bold text-[#1A2E26] truncate">{locName}</p>
                  </div>
                  <button onClick={() => handleDeleteLocation (locName)} className="text-[10px] text-center sm:text-xs font-semibold sm:inline-block bg-white px-3 rounded-md border border-red-200 text-red-500 hover:bg-red-500 hover:text-white">Delete</button>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Other;

// import React, { useState } from 'react';
// import BusinessProfileCard from '../../components/BusinessProfileCard';
// import { useAdmin } from '../../context/AdminContext';

// const Other = () => {

//   const { businesses } = useAdmin();

//   const [category] = useState(() => {
//     const saved = localStorage.getItem('admin_categories');
//     return saved ? JSON.parse(saved) : [];
//   });

//   const [locationsList] = useState(() => {
//     const saved = localStorage.getItem('admin_locations');
//     return saved ? JSON.parse(saved) : [];
//   });

//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [selectedLocation, setSelectedLocation] = useState(null);

//   const filteredBusinesses = businesses.filter(b => {
//     if (selectedCategory) return b.category === selectedCategory;
//     if (selectedLocation) return b.location === selectedLocation;
//     return true;
//   });

//   return (
//     <div className="flex flex-col  h-screen overflow-y-scroll p-5">
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

//         {/* Top Categories Section */}
//         <div className="space-y-3 bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
//           <p className="text-base font-serif font-bold text-[#1A2E26]">Top Categories</p>
//           <div className="space-y-3 h-70 overflow-y-scroll scrollbar-none lg:p-5">
//             {category.map((cat, idx) => {
//               const catName = typeof cat === 'object' && cat !== null ? (cat.name || cat.categoryName) : cat;
//               return (
//                 <BusinessProfileCard
//                   key={idx}
//                   businessIMG={cat.img}
//                   businessName={catName}
//                   buttonOnClick={() => { setSelectedCategory(catName); setSelectedLocation(null); }}
//                 />
//               );
//             })}
//           </div>
//         </div>

//         {/* Top Locations Section */}
//         <div className="space-y-3 bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
//           <p className="text-base font-serif font-bold text-[#1A2E26]">Top Location</p>
//           <div className="space-y-3 h-70 overflow-y-scroll scrollbar-none lg:p-5">
//             {locationsList.map((loc, idx) => {
//               const locName = typeof loc === 'object' && loc !== null ? loc.locationName : loc;
//               return (
//                 <BusinessProfileCard
//                   key={idx}
//                   businessName={locName}
//                   buttonOnClick={() => { setSelectedLocation(locName); setSelectedCategory(null); }}
//                 />
//               );
//             })}
//           </div>
//         </div>

//       </div>

//       {/* Filtered Businesses Section
//       <div className="mt-8 bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
//         <div className="flex justify-between items-center mb-4">
//           <h3 className="text-base font-serif font-bold text-[#1A2E26]">
//             {selectedCategory ? `Businesses in Category: ${selectedCategory}` :
//               selectedLocation ? `Businesses in Location: ${selectedLocation}` :
//                 "All Businesses"}
//           </h3>
//           {(selectedCategory || selectedLocation) && (
//             <button
//               onClick={() => { setSelectedCategory(null); setSelectedLocation(null); }}
//               className="text-[11px] bg-rose-100 text-rose-600 px-3 py-1 rounded-lg font-semibold cursor-pointer"
//             >
//               Clear Filter
//             </button>
//           )}
//         </div>

//         <div className="space-y-3 max-h-112.5 overflow-y-auto pr-1 scrollbar-none">
//           {filteredBusinesses.length > 0 ? (
//             filteredBusinesses.map((bus, i) => (
//               <BusinessProfileCard
//                 key={bus._id || i}
//                 businessIMG={bus.img}
//                 businessName={bus.businessName}
//                 businessStatus={bus.status}
//                 category={bus.category}
//                 createdAt={bus.createdAt}
//                 location={bus.location}
//                 renewalat={bus.expDate}
//                 buttonOnClick={() => window.open(`/admin-dashBoard/business/${bus._id}`, '_blank')}
//               />
//             ))
//           ) : (
//             <p className="text-xs text-gray-400 col-span-2 py-4 text-center">No businesses found for this filter.</p>
//           )}
//         </div>
//       </div> */}
//     </div>
//   );
// };

// export default Other;