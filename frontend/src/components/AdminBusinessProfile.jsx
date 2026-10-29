import { adminFetch } from '../utils/adminFetch';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL;

const AdminBusinessProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [updating, setUpdating] = useState(false);


  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [busRes, catRes, locRes] = await Promise.all([
        adminFetch(`${API_URL}/api/businesses/${id}`),
        adminFetch(`${API_URL}/api/categories`),
        adminFetch(`${API_URL}/api/locations`)
      ]);

      const busData = await busRes.json();
      const catData = await catRes.json();
      const locData = await locRes.json();

      if (busRes.ok) {
        setBusiness(busData);

        setFormData({
          ...busData,
          expiryDate: busData.expiryDate ? busData.expiryDate.split('T')[0] : '',
          timing: busData.timing || {
            Monday: { open: '09:00', close: '18:00', closed: false },
            Tuesday: { open: '09:00', close: '18:00', closed: false },
            Wednesday: { open: '09:00', close: '18:00', closed: false },
            Thursday: { open: '09:00', close: '18:00', closed: false },
            Friday: { open: '09:00', close: '18:00', closed: false },
            Saturday: { open: '09:00', close: '18:00', closed: false },
            Sunday: { open: '09:00', close: '18:00', closed: true },
          }
        });
      }
      if (catRes.ok) setCategories(catData);
      if (locRes.ok) setLocations(locData);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAllData();
    }
  }, [id]);


  const handleToggleStatus = async () => {

    const endpoint = business.status === 'active' ? 'inactive' : 'activate';

    try {
      const res = await adminFetch(`${API_URL}/api/businesses/${endpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (res.ok) {
        setBusiness(data);
        alert(`Business status updated successfully!`);
      } else {
        alert("Failed to update status: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Network error while updating status");
    }
  };


  const handleDeleteBusiness = async () => {
    if (window.confirm("Are you sure you want to delete this business?")) {
      try {
        const res = await adminFetch(`${API_URL}/api/businesses/${id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          alert("Business deleted successfully!");
          navigate(-1);
        } else {
          alert("Failed to delete business");
        }
      } catch (error) {
        console.error("Error deleting business:", error);
        alert("Network error while deleting");
      }
    }
  };


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };


  const handleTimingChange = (day, field, value) => {
    setFormData({
      ...formData,
      timing: {
        ...formData.timing,
        [day]: {
          ...formData.timing[day],
          [field]: value
        }
      }
    });
  };


  const handleServicesChange = (e) => {
    const servicesArray = e.target.value.split(',').map((s) => s.trim());
    setFormData({ ...formData, services: servicesArray });
  };


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, img: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };


  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await adminFetch(`${API_URL}/api/businesses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setBusiness(data);
        setIsEditing(false);
        alert("Business details updated successfully!");
      } else {
        console.error("Server Error Response:", data);
        alert("Failed to update business details: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error updating business:", error);
      alert("Network error while saving");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="w-10 h-10 border-4 border-[#1A2E26]/20 border-t-[#D4AF37] rounded-full animate-spin mb-4"></div>
        <p className="text-xs font-semibold text-[#1A2E26]">Loading Business Profile...</p>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
        <p className="text-sm font-bold text-gray-500 mb-4 text-center">Business not found.</p>
        <button onClick={() => navigate(-1)} className="text-xs bg-[#1A2E26] text-white px-4 py-2 rounded-xl cursor-pointer">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EAEFEA]/30 p-3 sm:p-6 relative">
      <div className="max-w-4xl mx-auto space-y-6">

        <div className="bg-white p-4 sm:p-8 rounded-3xl shadow-sm border border-gray-200 space-y-6">
          <div className="flex flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div className="flex sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
              {business.img ? (
                <img src={business.img} alt={business.businessName} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-gray-200 shadow-sm shrink-0" />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-2xl flex items-center justify-center text-xs font-bold text-gray-400 border border-gray-200 shrink-0">No Image</div>
              )}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-sm md:text-lg sm:text-xl font-serif font-bold text-[#1A2E26] truncate">{business.businessName}</h1>
                  {business.premium && (
                    <span className="bg-amber-100 text-amber-800 text-[7px] md:text-[10px] font-bold px-0.5 md:px-2 py-0.5 rounded-md border border-amber-200 shrink-0">
                      Premium
                    </span>
                  )}
                  <div className="flex items-center gap-2 md:self-center">
                    <span className={`text-[7px] md:text-[10px]  font-semibold px-1 md:px-3 py-0.5 md:py-1.5 rounded-xl capitalize ${business.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : business.status === 'expired'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                      {business.status}
                    </span>
                  </div>
                </div>

                <p className="text-[8px] md:text-xs font-semibold text-[#D4AF37] mt-1">{business.category} • {business.location}</p>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-[#EAEFEA]/40 p-4 sm:p-5 rounded-2xl border border-gray-100 space-y-3">
              <h3 className="text-xs font-bold text-[#1A2E26] uppercase tracking-wider mb-2">Contact & Owner Info</h3>
              <div className="text-xs space-y-2 text-gray-600 wrap-break-word">
                <p><span className="font-semibold text-[#1A2E26]">Owner Name:</span> {business.ownerName || 'N/A'}</p>
                <p><span className="font-semibold text-[#1A2E26]">Phone:</span> {business.phone || 'N/A'}</p>
                <p><span className="font-semibold text-[#1A2E26]">WhatsApp:</span> {business.whatsapp || 'N/A'}</p>
                <p><span className="font-semibold text-[#1A2E26]">Address:</span> {business.address || 'N/A'}</p>
              </div>
            </div>

            <div className="bg-[#EAEFEA]/40 p-4 sm:p-5 rounded-2xl border border-gray-100 space-y-3">
              <h3 className="text-xs font-bold text-[#1A2E26] uppercase tracking-wider mb-2">Metadata & Expiry</h3>
              <div className="text-xs space-y-2 text-gray-600 break-all">
                <p><span className="font-semibold text-[#1A2E26]">Created At:</span> {business.createdAt ? new Date(business.createdAt).toLocaleDateString() : 'N/A'}</p>
                <p><span className="font-semibold text-[#1A2E26]">Expiry Date:</span> <span className="text-amber-700 font-semibold">{business.expiryDate ? new Date(business.expiryDate).toLocaleDateString() : 'Not Set'}</span></p>
                <p><span className="font-semibold text-[#1A2E26]">Business ID:</span> <span className="font-mono">{business._id}</span></p>
              </div>
            </div>
          </div>


          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-[#1A2E26] uppercase tracking-wider">Business Timings</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {business.timing ? (
                Object.entries(business.timing).map(([day, time]) => (
                  <div key={day} className="bg-gray-50 border border-gray-100 p-2.5 sm:p-3 rounded-xl text-center">
                    <p className="text-[11px] font-bold text-gray-800">{day}</p>
                    {time.closed ? (
                      <span className="text-[10px] text-rose-500 font-semibold block mt-1">Closed</span>
                    ) : (
                      <p className="text-[10px] text-gray-600 mt-1">{time.open} - {time.close}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 col-span-full">No timing configuration found.</p>
              )}
            </div>
          </div>

          {business.services && business.services.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold text-[#1A2E26] uppercase tracking-wider">Services Offered</h3>
              <div className="flex flex-wrap gap-2">
                {business.services.map((s, idx) => (
                  <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-3 py-1.5 rounded-xl border border-gray-200">{s}</span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold text-[#1A2E26] uppercase tracking-wider">About Business</h3>
            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
              {business.aboutBusness || "No description provided."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button onClick={() => setIsEditing(true)} className="text-[9px] md:text-xs font-semibold px-2 md:px-4 py-1 md:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer flex-1 sm:flex-none text-center">
              Edit Details
            </button>
            <button
              onClick={handleToggleStatus}
              className={`text-[9px] md:text-xs font-semibold px-2 md:px-4 py-1 md:py-2.5 rounded-xl text-white shadow-sm cursor-pointer flex-1 sm:flex-none text-center ${business.status === 'active'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
            >
              {business.status === 'active' ? 'Make Inactive' : 'Make Active'}
            </button>
            <button onClick={handleDeleteBusiness} className="text-[9px] md:text-xs font-semibold px-2 md:px-4 py-1 md:py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-sm cursor-pointer flex-1 sm:flex-none text-center">
              Delete
            </button>
          </div>
        </div>

      </div>


      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-xl scrollbar-none my-auto">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-sm font-bold uppercase tracking-wider underline underline-offset-2 text-yellow-500">Edit Business Details</h2>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600 text-base font-bold cursor-pointer p-1">✕</button>
            </div>

            <form onSubmit={handleUpdateSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700">Business Name</label>
                  <input type="text" name="businessName" value={formData.businessName || ''} onChange={handleChange} className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#D4AF37]" required />
                </div>
                <div>
                  <label className="font-semibold text-gray-700">Owner Name</label>
                  <input type="text" name="ownerName" value={formData.ownerName || ''} onChange={handleChange} className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#D4AF37]" required />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700">Category (From DB)</label>
                  <select name="category" value={formData.category || ''} onChange={handleChange} className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#D4AF37] bg-white" required>
                    <option value="">Select Category</option>
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat.categoryName || cat.name || cat}>{cat.categoryName || cat.name || cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-700">Location (From DB)</label>
                  <select name="location" value={formData.location || ''} onChange={handleChange} className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#D4AF37] bg-white" required>
                    <option value="">Select Location</option>
                    {locations.map((loc, idx) => (
                      <option key={idx} value={loc.locationName || loc.name || loc}>{loc.locationName || loc.name || loc}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700">Phone</label>
                  <input type="number" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#D4AF37]" required />
                </div>
                <div>
                  <label className="font-semibold text-gray-700">WhatsApp</label>
                  <input type="number" name="whatsapp" value={formData.whatsapp || ''} onChange={handleChange} className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#D4AF37]" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700">Expiry Date</label>
                  <input type="date" name="expiryDate" value={formData.expiryDate || ''} onChange={handleChange} className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#D4AF37]" />
                </div>
                <div className="flex items-center pt-0 sm:pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="premium" checked={formData.premium || false} onChange={handleChange} className="w-4 h-4 text-[#D4AF37] rounded border-gray-300 focus:ring-[#D4AF37]" />
                    <span className="font-semibold text-gray-700">Mark as Premium Listing</span>
                  </label>
                </div>
              </div>


              <div className="space-y-2 pt-2 border-t border-gray-100">
                <label className="font-semibold text-gray-700 block">Operating Timings By Day</label>
                <div className="space-y-2 p-2 border border-gray-100 rounded-xl bg-gray-50/50">
                  {formData.timing && Object.keys(formData.timing).map((day) => (
                    <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-2.5 sm:p-2 rounded-lg border border-gray-100">
                      <span className="w-20 font-semibold text-gray-800 capitalize">{day}</span>
                      <div className="flex items-center justify-between sm:justify-start gap-3">
                        <label className="flex items-center gap-1 text-[11px] text-gray-500 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.timing[day].closed}
                            onChange={(e) => handleTimingChange(day, 'closed', e.target.checked)}
                          />
                          Closed
                        </label>
                        {!formData.timing[day].closed && (
                          <div className="flex items-center gap-1">
                            <input
                              type="time"
                              value={formData.timing[day].open || '09:00'}
                              onChange={(e) => handleTimingChange(day, 'open', e.target.value)}
                              className="border p-1 rounded text-[11px] bg-white"
                            />
                            <span>to</span>
                            <input
                              type="time"
                              value={formData.timing[day].close || '18:00'}
                              onChange={(e) => handleTimingChange(day, 'close', e.target.value)}
                              className="border p-1 rounded text-[11px] bg-white"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700">Address</label>
                <input type="text" name="address" value={formData.address || ''} onChange={handleChange} className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#D4AF37]" required />
              </div>

              <div>
                <label className="font-semibold text-gray-700">Services (Comma Separated)</label>
                <input type="text" value={formData.services ? formData.services.join(', ') : ''} onChange={handleServicesChange} placeholder="e.g. Web Design, App Development" className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#D4AF37]" />
              </div>

              <div>
                <label className="font-semibold text-gray-700">Location Link (Map URL)</label>
                <input type="text" name="locationLink" value={formData.locationLink || ''} onChange={handleChange} className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#D4AF37]" />
              </div>

              <div>
                <label className="font-semibold text-gray-700">Business Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} className="w-full mt-1 p-2 rounded-xl border border-gray-200 text-xs bg-gray-50 cursor-pointer" />
              </div>

              <div>
                <label className="font-semibold text-gray-700">About Business</label>
                <textarea name="aboutBusness" rows="3" value={formData.aboutBusness || ''} onChange={handleChange} className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#D4AF37]"></textarea>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sticky bottom-0 bg-white py-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 font-semibold cursor-pointer w-full sm:w-auto text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2.5 rounded-xl bg-[#1A2E26] text-white font-semibold cursor-pointer disabled:opacity-50 w-full sm:w-auto text-center"
                >
                  {updating ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminBusinessProfile;
