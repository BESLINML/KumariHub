import React, { useState } from 'react';
import { adminFetch } from '../../utils/adminFetch';
import BusinessProfileCard from '../../components/BusinessProfileCard';
import { useAdmin } from '../../context/AdminContext';
import { useSearchParams } from 'react-router-dom';
import { categoryIcons } from '../../components/PopularCategories';
import { Shapes } from 'lucide-react';

const Other = () => {

  const { businesses } = useAdmin();
  const API_URL = import.meta.env.VITE_API_URL;
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

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);


  const handleDeleteCategory = async (catToDelete) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete the category, It may colapce the link of the business created at this category "${catToDelete}"?`);
    if (!isConfirmed) return;

    try {

      const response = await adminFetch(`${API_URL}/api/categories/${encodeURIComponent(catToDelete)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete from database');
      }


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


  const handleDeleteLocation = async (locToDelete) => {
    const isConfirmed = window.confirm(`Are you sure you want to delete the location, It may colapce the link of the business created at this Location "${locToDelete}"?`);
    if (!isConfirmed) return;

    try {

      const response = await adminFetch(`${API_URL}/api/locations/${encodeURIComponent(locToDelete)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete from database');
      }


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
      <div className={`grid grid-cols-1 gap-6 ${view === 'both' ? 'lg:grid-cols-2' : ''}`}>


        {view !== 'locations' && <div className="space-y-3 bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
          <p className="flex items-center gap-2 text-base font-serif font-bold text-[#1A2E26]"><Shapes aria-hidden="true" className="w-5 h-5 text-[#D4AF37] shrink-0" />Top Categories</p>
          <div className="space-y-3 h-70 overflow-y-scroll scrollbar-none lg:p-5">
            {category.map((cat, idx) => {
              const catName = typeof cat === 'object' && cat !== null ? (cat.name || cat.categoryName) : cat;
              return (

                <div key={cat.id || catName || idx} className="bg-[#EAEFEA]/50 w-full rounded-2xl p-3 flex justify-between" >
                  <div className="flex items-center gap-5">
                    <img src={cat.img || categoryIcons[catName]} className="w-10 h-10 sm:w-8 sm:h-8 rounded-full object-cover object-center bg-white p-1 shrink-0 shadow" alt={catName} />
                    <p className="text-xs font-bold text-[#1A2E26] truncate">{catName}</p>
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
        </div>}

        {view === 'locations' && <div className="space-y-3 bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
          <p className="text-base font-serif font-bold text-[#1A2E26]">Top Location</p>
          <div className="space-y-3 h-70 overflow-y-scroll scrollbar-none lg:p-5">
            {locationsList.map((loc, idx) => {
              const locName = typeof loc === 'object' && loc !== null ? loc.locationName : loc;
              return (
                <div key={loc.id || locName || idx} className="bg-[#EAEFEA]/50 w-full rounded-2xl p-3 flex justify-between h-13" >
                  <div className="flex items-center gap-5">
                    <p className="text-xs  font-bold text-[#1A2E26] truncate">{locName}</p>
                  </div>
                  <button onClick={() => handleDeleteLocation (locName)} className="text-[10px] text-center sm:text-xs font-semibold sm:inline-block bg-white px-3 rounded-md border border-red-200 text-red-500 hover:bg-red-500 hover:text-white">Delete</button>
                </div>
              );
            })}
          </div>
        </div>}

      </div>
    </div>
  );
};

export default Other;
