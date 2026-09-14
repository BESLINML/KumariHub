import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useNavigate } from 'react-router-dom';

const PendingSubmissions = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { businesses, refreshData } = useAdmin();
  const navigate = useNavigate();

  const [todaysListings, setTodaysListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (businesses) {
      setLoading(true);
      const pendingItems = businesses.filter(item => item.status && item.status.toLowerCase() === 'pending');
      setTodaysListings(pendingItems || []);
      setLoading(false);
    }
  }, [businesses]);

  // const handleApprove = async (id) => {
  //   try {
  //     const response = await fetch(`${API_URL}/api/businesses/approve/${id}`, {
  //       method: 'PUT',
  //     });

  //     if (response.ok) {
  //       alert("Business approved successfully!");
  //       refreshData();

  //       // Database-la irunthu varra category, location, businessName-ai vachi URL-ai generate panrathu
  //       const savedCategory = data.category || data.business?.category || finalCategory;
  //       const savedLocation = data.location || data.business?.location || finalLocation;
  //       const savedName = data.businessName || data.business?.businessName || formData.businessName;

  //       // URL-kku anuppa spaces-ai hyphen (-) ah maathurathu (slug format)
  //       const createSlug = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  //       if (savedCategory && savedLocation && savedName) {
  //         const catSlug = createSlug(savedCategory);
  //         const locSlug = createSlug(savedLocation);
  //         const nameSlug = createSlug(savedName);

  //         // Neenga sonna model link format-laye redirect aagum!
  //         navigate(`/${catSlug}/${locSlug}/${nameSlug}`);
  //       }
  //     } else {
  //       alert("Failed to approve business");
  //     }
  //   } catch (error) {
  //     console.error("Error approving:", error);
  //   }
  // };

  const handleApprove = async (business) => { // <--- Inga business object-ai parameters-ah pass panrom
    try {
      const response = await fetch(`${API_URL}/api/businesses/approve/${business._id}`, {
        method: 'PUT',
      });

      const data = await response.json(); // <--- Response data-ai catch panrom

      if (response.ok) {
        alert("Business approved successfully!");
        refreshData();
        
        // Backend data-va illa pasing pannura business object-ai fallback-ah use panrathu
        const savedCategory = data.category || data.business?.category || business.category;
        const savedLocation = data.location || data.business?.location || business.location;
        const savedName = data.businessName || data.business?.businessName || business.businessName;

        // URL-kku anuppa spaces-ai hyphen (-) ah maathurathu (slug format)
        const createSlug = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        if (savedCategory && savedLocation && savedName) {
          const catSlug = createSlug(savedCategory);
          const locSlug = createSlug(savedLocation);
          const nameSlug = createSlug(savedName);

          // Pending page-la irunthu antha approved business profile page-kku redirect aagum!
          navigate(`/${catSlug}/${locSlug}/${nameSlug}`);
        }
      } else {
        alert(data.message || "Failed to approve business");
      }
    } catch (error) {
      console.error("Error approving:", error);
      alert("Server error!");
    }
  };



  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/businesses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert("Business rejected successfully!");
        refreshData();
      } else {
        alert("Failed to reject business");
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  if (loading) return <p className="text-xs text-gray-500 py-3">Loading pending submissions...</p>;

  return (
    <div className="p-4 sm:p-6 mb-8 h-screen overflow-y-scroll">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h3 className="text-base sm:text-lg font-serif font-bold text-[#1A2E26] flex items-center gap-2">
          Pending Submissions
          <span className="bg-[#D4AF37]/20 text-[#8a7022] text-xs px-2.5 py-0.5 rounded-full font-sans">
            {todaysListings.length}
          </span>
        </h3>
      </div>

      {todaysListings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {todaysListings.map((business) => (
            <div key={business._id} className="border border-gray-100 bg-[#EAEFEA]/30 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
              <div>
                {business.img ? (
                  <img src={business.img} alt={business.businessName || "Pending Business"} className="w-full h-32 sm:h-36 object-cover rounded-xl mb-3" />
                ) : (
                  <div className="w-full h-32 sm:h-36 bg-gray-200 rounded-xl mb-3 flex items-center justify-center text-xs text-gray-400 font-medium">No Image</div>
                )}

                <h4 className="font-bold text-sm text-[#1A2E26] line-clamp-1 mb-1">{business.businessName}</h4>
                <p className="text-[11px] text-[#D4AF37] font-semibold truncate mb-2">{business.category} • {business.location}</p>
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{business.aboutBusness}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200/60 flex items-center justify-between gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(business)}
                    className="bg-emerald-600 text-white text-[11px] px-3 py-1.5 rounded-full font-semibold hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleDelete(business._id)}
                    className="bg-red-100 text-red-600 text-[11px] px-3 py-1.5 rounded-full font-semibold hover:bg-red-200 transition-colors cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
                <span className="text-[10px] text-gray-400 font-medium shrink-0">
                  {business.createdAt && new Date(business.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-xs text-gray-500 font-medium">No pending business submissions found.</p>
        </div>
      )}
    </div>
  );
};

export default PendingSubmissions;