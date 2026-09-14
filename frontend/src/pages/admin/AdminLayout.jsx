import React, { useEffect, useState } from 'react'
import AdminSlideBar from './AdminSlideBar'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAdmin } from '../../context/AdminContext';
import { X, Clock, ImageIcon } from 'lucide-react';

const AdminLayout = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const {
    businesses,
    fetchAdminData,
    loading,
    loadPercentage
  } = useAdmin();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('business');


  const [category, setCategory] = useState(() => {
    const saved = localStorage.getItem('admin_categories');
    return saved ? JSON.parse(saved) : [];
  });

  const [locationsList, setLocationsList] = useState(() => {
    const saved = localStorage.getItem('admin_locations');
    return saved ? JSON.parse(saved) : [];
  });

  const [newCatName, setNewCatName] = useState('');
  const [newLocName, setNewLocName] = useState('');
  const [newCatImg, setNewCatImg] = useState('');


  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    category: '',
    customCategory: '',
    location: '',
    customLocation: '',
    address: '',
    aboutBusness: '',
    phone: '',
    whatsapp: '',
    locationLink: '',
    img: '',
    services: '',
    premium: false,
    timing: {
      sunday: { open: "00.00", close: "00.00", closed: true },
      monday: { open: "9.00 am", close: "5.00 pm", closed: false },
      tuesday: { open: "9.00 am", close: "5.00 pm", closed: false },
      wednesday: { open: "9.00 am", close: "5.00 pm", closed: false },
      thursday: { open: "9.00 am", close: "5.00 pm", closed: false },
      friday: { open: "9.00 am", close: "5.00 pm", closed: false },
      saturday: { open: "9.00 am", close: "5.00 pm", closed: false }
    }
  });


  useEffect(() => {
    if (businesses.length === 0) {
      fetchAdminData();
    }
  }, []);

  const allCategories = category.map(c => c.name || c);
  const allLocations = locationsList.map(l => l.locationName || l);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
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

  const handleCatImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCatImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
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


  const handleBusinessSubmit = async (e) => {
    e.preventDefault();
    const finalCategory = formData.category === "Other" ? formData.customCategory : formData.category;
    const finalLocation = formData.location === "Other" ? formData.customLocation : formData.location;

    const servicesArray = typeof formData.services === 'string'
      ? formData.services.split(',').map(s => s.trim()).filter(Boolean)
      : formData.services;

    const newBusinessObject = {
      businessName: formData.businessName,
      ownerName: formData.ownerName,
      category: finalCategory,
      location: finalLocation,
      address: formData.address,
      aboutBusness: formData.aboutBusness,
      premium: formData.premium,
      phone: Number(formData.phone),
      whatsapp: Number(formData.whatsapp || formData.phone),
      services: servicesArray,
      timing: formData.timing,
      locationLink: formData.locationLink,
      img: formData.img,
      status: "active"
    };

    try {
      const response = await fetch(`${API_URL}/api/businesses/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBusinessObject)
      });

      const data = await response.json();

      if (response.ok) {
        alert("Business Added & Saved Successfully to Database!");
        setIsModalOpen(false);
        fetchAdminData();
        setFormData({
          businessName: '', ownerName: '', category: '', customCategory: '', location: '', customLocation: '',
          address: '', aboutBusness: '', phone: '', whatsapp: '', locationLink: '', img: '', services: '', premium: false,
          timing: formData.timing
        });

        // Database-la irunthu varra category, location, businessName-ai vachi URL-ai generate panrathu
        const savedCategory = data.category || data.business?.category || finalCategory;
        const savedLocation = data.location || data.business?.location || finalLocation;
        const savedName = data.businessName || data.business?.businessName || formData.businessName;

        // URL-kku anuppa spaces-ai hyphen (-) ah maathurathu (slug format)
        const createSlug = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        if (savedCategory && savedLocation && savedName) {
          const catSlug = createSlug(savedCategory);
          const locSlug = createSlug(savedLocation);
          const nameSlug = createSlug(savedName);

          // Neenga sonna model link format-laye redirect aagum!
          navigate(`/${catSlug}/${locSlug}/${nameSlug}`);
        }

      } else {
        alert(data.message || data.error || "Failed to add business");
      }
    } catch (error) {
      console.error("Server Error:", error);
      alert("Server error!");
    }
  };


  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/categories/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName.trim(), img: newCatImg }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Category Added Successfully!");
        setNewCatName('');
        setNewCatImg('');
        setIsModalOpen(false);

        const catRes = await fetch(`${API_URL}/api/categories`);
        const catData = await catRes.json();
        if (catRes.ok) {
          setCategory(catData);
          localStorage.setItem('admin_categories', JSON.stringify(catData));
        }
      } else {
        alert(data.message || "Failed to add category");
      }
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Server error!");
    }
  };


  const handleAddLocation = async (e) => {
    e.preventDefault();
    if (!newLocName.trim()) return;

    try {
      const response = await fetch(`${API_URL}/api/locations/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationName: newLocName.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Location Added Successfully!");
        setNewLocName('');
        setIsModalOpen(false);

        const locRes = await fetch(`${API_URL}/api/locations`);
        const locData = await locRes.json();
        if (locRes.ok) {
          setLocationsList(locData);
          localStorage.setItem('admin_locations', JSON.stringify(locData));
        }
      } else {
        alert(data.message || "Failed to add location");
      }
    } catch (error) {
      console.error("Error adding location:", error);
      alert("Server error!");
    }
  };
  

  return (
    <div className="bg-white md:h-screen flex flex-col overflow-hidden mb-15 md:mb-0">
      <div className='flex flex-col-reverse md:flex-row h-full'>
        {/* Sidebar Fixed Width */}
        <div className="w-full md:w-[30%] xl:w-[20%] md:h-full shrink-0 fixed md:static z-50">
          <AdminSlideBar setModalType={setModalType} setIsModalOpen={setIsModalOpen} />
        </div>

        {/* Main Content Area */}
        <main className="md:w-[70%] xl:w-[80%]">
          {loading?(
            <div className="flex justify-center items-center py-10 gap-3 sm:gap-5 h-screen">
            <div className="w-8 h-8 border-4 border-[#1A2E26]/20 border-t-[#D4AF37] rounded-full animate-spin"></div>
            <p className="font-bold text-sm text-[#D4AF37]">Loading...{loadPercentage}%</p>
          </div>
          ):
            <Outlet />
          }
          
        </main>
      </div>

      {/* Global Modals (Add Business, Category, Location) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">

          {/* 1. ADD BUSINESS MODAL */}
          {modalType === 'business' && (
            <div className="bg-white rounded-3xl w-full max-w-3xl p-6 sm:p-8 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1A2E26] mb-6">Add New Business</h2>

              <form onSubmit={handleBusinessSubmit} className="space-y-5 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Owner Name</label>
                    <input type="text" name="ownerName" required value={formData.ownerName} onChange={handleChange} placeholder="e.g. Bala Ram S" className="w-full mt-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37]" />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600">Business Name</label>
                    <input type="text" name="businessName" required value={formData.businessName} onChange={handleChange} placeholder="e.g. Green Valley Turf" className="w-full mt-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37]" />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600">Category</label>
                    <select name="category" required value={formData.category} onChange={handleChange} className="w-full mt-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37] bg-white">
                      <option value="">Select Category</option>
                      {allCategories.map((cat, idx) => (
                        <option key={idx} value={cat}>{cat}</option>
                      ))}
                      <option value="Other">Other (Type Custom)</option>
                    </select>
                  </div>

                  {formData.category === "Other" && (
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-gray-600">Type Custom Category</label>
                      <input type="text" name="customCategory" required value={formData.customCategory} onChange={handleChange} placeholder="Enter category name..." className="w-full mt-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37]" />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-gray-600">Location</label>
                    <select name="location" required value={formData.location} onChange={handleChange} className="w-full mt-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37] bg-white">
                      <option value="">Select Location</option>
                      {allLocations.map((loc, idx) => (
                        <option key={idx} value={loc}>{loc}</option>
                      ))}
                      <option value="Other">Other (Type Custom)</option>
                    </select>
                  </div>

                  {formData.location === "Other" && (
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-gray-600">Type Custom Location</label>
                      <input type="text" name="customLocation" required value={formData.customLocation} onChange={handleChange} placeholder="Enter location name..." className="w-full mt-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37]" />
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-gray-600">Phone Number</label>
                    <input type="number" name="phone" required value={formData.phone} onChange={handleChange} placeholder="9876543210" className="w-full mt-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37]" />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600">WhatsApp Number</label>
                    <input type="number" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="9488532629" className="w-full mt-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37]" />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-[#D4AF37]" /> Business Image
                    </label>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2 text-xs file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#1A2E26] file:text-[#D4AF37] hover:file:bg-black cursor-pointer bg-white" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600">Full Address</label>
                  <input type="text" name="address" required value={formData.address} onChange={handleChange} placeholder="Cape Road, Nagercoil" className="w-full mt-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37]" />
                </div>

                <div className="md:col-span-2">
                  <label className="text-xs font-semibold text-gray-600">Services (Comma separated)</label>
                  <input type="text" name="services" value={formData.services} onChange={handleChange} placeholder="Web Development, App Design, SEO" className="w-full mt-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37]" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600">About Business</label>
                  <textarea name="aboutBusness" rows="3" required value={formData.aboutBusness} onChange={handleChange} placeholder="Provide description..." className="w-full mt-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37]" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600">Google Map Link</label>
                  <input type="url" name="locationLink" value={formData.locationLink} onChange={handleChange} placeholder="https://maps.app.goo.gl/..." className="w-full mt-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37]" />
                </div>

                {/* Timings */}
                <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-[#D4AF37]" />
                    <h3 className="text-sm font-bold text-[#1A2E26]">Weekly Business Timings</h3>
                  </div>
                  <div className="space-y-3">
                    {Object.keys(formData.timing).map((day) => (
                      <div key={day} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-white p-3 rounded-xl border border-gray-100">
                        <span className="capitalize font-medium text-xs w-24 text-gray-800">{day}</span>
                        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                          <label className="flex items-center gap-1.5 text-xs text-red-600 font-medium mr-2">
                            <input type="checkbox" checked={formData.timing[day].closed} onChange={(e) => handleTimingChange(day, 'closed', e.target.checked)} className="accent-red-600 w-3.5 h-3.5" />
                            Closed
                          </label>
                          {!formData.timing[day].closed && (
                            <div className="flex items-center gap-1">
                              <input type="text" value={formData.timing[day].open} onChange={(e) => handleTimingChange(day, 'open', e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1 text-xs w-20 sm:w-24 text-center outline-none focus:border-[#D4AF37]" placeholder="Open" />
                              <span className="text-gray-400 text-xs">to</span>
                              <input type="text" value={formData.timing[day].close} onChange={(e) => handleTimingChange(day, 'close', e.target.value)} className="border border-gray-200 rounded-lg px-2 py-1 text-xs w-20 sm:w-24 text-center outline-none focus:border-[#D4AF37]" placeholder="Close" />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Premium Badge Checkbox */}
                <div className="flex items-center gap-2 pt-2">
                  <input type="checkbox" name="premium" id="premiumCheckbox" checked={formData.premium} onChange={handleChange} className="w-4 h-4 accent-[#D4AF37] cursor-pointer" />
                  <label htmlFor="premiumCheckbox" className="text-xs font-semibold text-gray-700 cursor-pointer">
                    Mark as Premium Listing ⭐
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button type="submit" className="w-full bg-[#1A2E26] text-[#D4AF37] py-3 rounded-xl font-bold text-sm hover:bg-black transition-colors cursor-pointer shadow-lg">
                    Save & Publish Business
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 2. ADD CATEGORY MODAL */}
          {modalType === 'category' && (
            <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1A2E26] mb-6">Add New Category</h2>

              <form onSubmit={handleAddCategory} className="space-y-4 text-left">
                <div>
                  <label className="text-xs font-semibold text-gray-600">Category Name</label>
                  <input type="text" required value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="e.g. Organic Farms" className="w-full mt-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37]" />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#D4AF37]" /> Category Icon / Image
                  </label>
                  <input type="file" accept="image/*" onChange={handleCatImageChange} className="w-full mt-1 border border-gray-300 rounded-xl px-3 py-2 text-xs file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#1A2E26] file:text-[#D4AF37] hover:file:bg-black cursor-pointer bg-white" />
                </div>

                {newCatImg && (
                  <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl border border-gray-200">
                    <img src={newCatImg} alt="Preview" className="w-10 h-10 object-cover rounded-lg" />
                    <span className="text-[11px] text-gray-500">Image loaded successfully</span>
                  </div>
                )}

                <div className="pt-4">
                  <button type="submit" className="w-full bg-[#1A2E26] text-[#D4AF37] py-3 rounded-xl font-bold text-sm hover:bg-black transition-colors cursor-pointer shadow-lg">
                    Save Category
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* 3. ADD LOCATION MODAL */}
          {modalType === 'location' && (
            <div className="bg-white rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 cursor-pointer">
                <X className="w-6 h-6" />
              </button>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1A2E26] mb-6">Add New Location</h2>

              <form onSubmit={handleAddLocation} className="space-y-4 text-left">
                <div>
                  <label className="text-xs font-semibold text-gray-600">Location Name</label>
                  <input type="text" required value={newLocName} onChange={(e) => setNewLocName(e.target.value)} placeholder="e.g. Kanyakumari" className="w-full mt-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37]" />
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full bg-[#1A2E26] text-[#D4AF37] py-3 rounded-xl font-bold text-sm hover:bg-black transition-colors cursor-pointer shadow-lg">
                    Save Location
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      )}
    </div>
  )
}

export default AdminLayout;