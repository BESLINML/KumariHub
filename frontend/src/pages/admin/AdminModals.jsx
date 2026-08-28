import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';

const AdminModals = ({ modalType, isModalOpen, setIsModalOpen }) => {
  const { addBusiness, addCategory, addLocation, category: categoriesList, locationsList } = useAdmin();


  const [businessData, setBusinessData] = useState({
    ownerName: '',
    businessName: '',
    category: '',
    customCategory: '',
    location: '',
    customLocation: '',
    phone: '',
    whatsapp: '',
    services: '',
    address: '',
    aboutBusness: '',
    locationLink: '',
  });

  const [newCategory, setNewCategory] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isModalOpen) return null;


  const handleBusinessSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const finalCategory = businessData.category === 'Other' ? businessData.customCategory : businessData.category;
      const finalLocation = businessData.location === 'Other' ? businessData.customLocation : businessData.location;

      await addBusiness({
        ...businessData,
        category: finalCategory,
        location: finalLocation,
        status: 'active',
        createdAt: new Date().toISOString()
      });

      setIsModalOpen(false);
      setBusinessData({
        ownerName: '', businessName: '', category: '', customCategory: '',
        location: '', customLocation: '', phone: '', whatsapp: '', services: '',
        address: '', aboutBusness: '', locationLink: ''
      });
    } catch (error) {
      console.error("Error adding business:", error);
    } finally {
      setLoading(false);
    }
  };


  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setLoading(true);
    try {
      await addCategory(newCategory.trim());
      setIsModalOpen(false);
      setNewCategory('');
    } catch (error) {
      console.error("Error adding category:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSubmit = async (e) => {
    e.preventDefault();
    if (!newLocation.trim()) return;
    setLoading(true);
    try {
      await addLocation(newLocation.trim());
      setIsModalOpen(false);
      setNewLocation('');
    } catch (error) {
      console.error("Error adding location:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full h-full bg-black/50 backdrop-blur-xs z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative p-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]">

        {/* Close Button */}
        <button
          onClick={() => setIsModalOpen(false)}
          className="absolute top-5 right-5 bg-gray-100 hover:bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
        >
          ✕
        </button>

        {/* 1. ADD BUSINESS MODAL */}
        {modalType === 'business' && (
          <div>
            <h2 className="text-xl font-serif font-bold text-[#1A2E26] mb-1">Add New Business</h2>
            <p className="text-xs text-gray-500 mb-6">Enter details to register a business directly as admin.</p>

            <form onSubmit={handleBusinessSubmit} className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600">Owner Name *</label>
                  <input type="text" required value={businessData.ownerName} onChange={(e) => setBusinessData({ ...businessData, ownerName: e.target.value })} placeholder="John Doe" className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#D4AF37]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Business Name *</label>
                  <input type="text" required value={businessData.businessName} onChange={(e) => setBusinessData({ ...businessData, businessName: e.target.value })} placeholder="Elite Store" className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#D4AF37]" />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="text-xs font-semibold text-gray-600">Category *</label>
                  <select required value={businessData.category} onChange={(e) => setBusinessData({ ...businessData, category: e.target.value })} className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none bg-white focus:border-[#D4AF37]">
                    <option value="">Select Category</option>
                    {categoriesList?.map((cat, idx) => <option key={idx} value={cat}>{cat}</option>)}
                    <option value="Other">Others (Specify)</option>
                  </select>
                </div>

                {businessData.category === 'Other' && (
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Custom Category *</label>
                    <input type="text" required value={businessData.customCategory} onChange={(e) => setBusinessData({ ...businessData, customCategory: e.target.value })} placeholder="Enter category" className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#D4AF37]" />
                  </div>
                )}

                {/* Location Selection */}
                <div>
                  <label className="text-xs font-semibold text-gray-600">Location *</label>
                  <select required value={businessData.location} onChange={(e) => setBusinessData({ ...businessData, location: e.target.value })} className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none bg-white focus:border-[#D4AF37]">
                    <option value="">Select Location</option>
                    {locationsList?.map((loc, idx) => <option key={idx} value={loc}>{loc}</option>)}
                    <option value="Other">Others (Specify)</option>
                  </select>
                </div>

                {businessData.location === 'Other' && (
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Custom Location *</label>
                    <input type="text" required value={businessData.customLocation} onChange={(e) => setBusinessData({ ...businessData, customLocation: e.target.value })} placeholder="Enter location" className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#D4AF37]" />
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-gray-600">Phone Number *</label>
                  <input type="number" required value={businessData.phone} onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })} placeholder="9876543210" className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#D4AF37]" />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">Address *</label>
                <input type="text" required value={businessData.address} onChange={(e) => setBusinessData({ ...businessData, address: e.target.value })} placeholder="Street, City" className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#D4AF37]" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">About Business *</label>
                <textarea rows="3" required value={businessData.aboutBusness} onChange={(e) => setBusinessData({ ...businessData, aboutBusness: e.target.value })} placeholder="Brief description..." className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#D4AF37]" />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button type="submit" disabled={loading} className="bg-[#D4AF37] text-[#1A2E26] px-6 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-[#c29d30]">
                  {loading ? 'Adding...' : 'Add Business'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 2. ADD CATEGORY MODAL */}
        {modalType === 'category' && (
          <div>
            <h2 className="text-xl font-serif font-bold text-[#1A2E26] mb-1">Add New Category</h2>
            <p className="text-xs text-gray-500 mb-6">Create a new business category list item.</p>

            <form onSubmit={handleCategorySubmit} className="space-y-4 text-left">
              <div>
                <label className="text-xs font-semibold text-gray-600">Category Name *</label>
                <input type="text" required value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="e.g. Restaurants, Electronics" className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#D4AF37]" />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button type="submit" disabled={loading} className="bg-[#D4AF37] text-[#1A2E26] px-6 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-[#c29d30]">
                  {loading ? 'Adding...' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 3. ADD LOCATION MODAL */}
        {modalType === 'location' && (
          <div>
            <h2 className="text-xl font-serif font-bold text-[#1A2E26] mb-1">Add New Location</h2>
            <p className="text-xs text-gray-500 mb-6">Create a new business area/location option.</p>

            <form onSubmit={handleLocationSubmit} className="space-y-4 text-left">
              <div>
                <label className="text-xs font-semibold text-gray-600">Location Name *</label>
                <input type="text" required value={newLocation} onChange={(e) => setNewLocation(e.target.value)} placeholder="e.g. Kuzhithurai, Marthandam" className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#D4AF37]" />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer">Cancel</button>
                <button type="submit" disabled={loading} className="bg-[#D4AF37] text-[#1A2E26] px-6 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-[#c29d30]">
                  {loading ? 'Adding...' : 'Add Location'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminModals;