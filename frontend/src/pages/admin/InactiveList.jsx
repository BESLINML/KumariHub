import React, { useState, useEffect } from 'react';
import { adminFetch } from '../../utils/adminFetch';
import { useAdmin } from '../../context/AdminContext';

const InactiveList = () => {

  const API_URL = import.meta.env.VITE_API_URL;
  const { businesses } = useAdmin();

  const [inactiveBusiness, setInactiveBusiness] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const inactive = businesses.filter(b => b.status === 'inactive');
    setInactiveBusiness(inactive);
    setLoading(false);
  }, []);


  const handleActivate = async (id) => {
    try {
      const response = await adminFetch(`${API_URL}/api/businesses/activate/${id}`, {
        method: 'PUT',
      });

      if (response.ok) {
        alert("Business activated successfully!");
        fetchInactiveData();
      } else {
        alert("Failed to activate business");
      }
    } catch (error) {
      console.error("Error activating:", error);
    }
  };


  const handleDelete = async (id) => {
    try {
      const response = await adminFetch(`${API_URL}/api/businesses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert("Business deleted successfully!");
        fetchInactiveData();
      } else {
        alert("Failed to delete business");
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  if (loading) return <p className="text-xs text-gray-500 py-3">Loading inactive businesses...</p>;

  return (
    <div className="p-4 sm:p-6 mb-8  h-screen overflow-y-scroll">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h3 className="text-base sm:text-lg font-serif font-bold text-[#1A2E26] flex items-center gap-2">
          Inactive List
          <span className="bg-[#D4AF37]/20 text-[#8a7022] text-xs px-2.5 py-0.5 rounded-full font-sans">
            {inactiveBusiness.length}
          </span>
        </h3>
      </div>

      {inactiveBusiness.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {inactiveBusiness.map((business) => (
            <div key={business._id || business.id} className="border border-gray-100 bg-[#EAEFEA]/30 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
              <div>
                {business.img ? (
                  <img src={business.img} alt={business.businessName || "Business"} className="w-full h-32 sm:h-36 object-cover rounded-xl mb-3" />
                ) : (
                  <div className="w-full h-32 sm:h-36 bg-gray-200 rounded-xl mb-3 flex items-center justify-center text-xs text-gray-400 font-medium">No Image</div>
                )}

                <div className="flex justify-between items-start gap-2 mb-1">
                  <h4 className="font-bold text-sm text-[#1A2E26] line-clamp-1">{business.businessName}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-100 text-rose-700 shrink-0">
                    {business.status}
                  </span>
                </div>

                <p className="text-[11px] text-[#D4AF37] font-semibold truncate mb-2">{business.category} â€¢ {business.location}</p>
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{business.aboutBusness}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-200/60 flex items-center justify-between gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleActivate(business._id)}
                    className="bg-emerald-600 text-white text-[11px] px-3 py-1.5 rounded-full font-semibold hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs"
                  >
                    Activate
                  </button>
                  <button
                    onClick={() => handleDelete(business._id)}
                    className="bg-red-100 text-red-600 text-[11px] px-3 py-1.5 rounded-full font-semibold hover:bg-red-200 transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
                <span className="text-[10px] text-gray-400 font-medium shrink-0">
                  {business.createdAt && new Date(business.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-xs text-gray-500 font-medium">No Inactive business found</p>
        </div>
      )}
    </div>
  );
};

export default InactiveList;
