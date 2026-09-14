import React, { useEffect, useState } from 'react';
import { handlePayment } from '../utils/payment';

const ListYourBusinessButton = ({navbar}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categoriesList, setCategoriesList] = useState([]);
  const [locationsList, setLocationsList] = useState([]);
  const [issubmiting, setIsSubmiting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;


  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const catRes = await fetch(`${API_URL}/api/categories`);
        const catData = await catRes.json();
        if (catRes.ok) {
          setCategoriesList(catData.map(cat => cat.name));
        }

        const locRes = await fetch(`${API_URL}/api/locations`);
        const locData = await locRes.json();
        if (locRes.ok) {
          setLocationsList(locData.map(loc => loc.locationName));
        }
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      fetchDropdownData();
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);


  const [formData, setFormData] = useState({
    ownerName: '',
    businessName: '',
    category: '',
    customCategory: '',
    location: '',
    customLocation: '',
    address: '',
    aboutBusness: '',
    phone: '',
    whatsapp: '',
    locationLink: '',
    services: '',
    img: '',
    timing: {
      monday: { open: "9.00 am", close: "5.00 pm", closed: false },
      tuesday: { open: "9.00 am", close: "5.00 pm", closed: false },
      wednesday: { open: "9.00 am", close: "5.00 pm", closed: false },
      thursday: { open: "9.00 am", close: "5.00 pm", closed: false },
      friday: { open: "9.00 am", close: "5.00 pm", closed: false },
      saturday: { open: "9.00 am", close: "5.00 pm", closed: false },
      sunday: { open: "00.00", close: "00.00", closed: true }
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTimingChange = (day, field, value) => {
    setFormData({
      ...formData,
      timing: {
        ...formData.timing,
        [day]: {
          ...formData.timing[day],
          [field]: field === 'closed' ? value === 'true' : value
        }
      }
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, img: reader.result });
      reader.readAsDataURL(file);
    }
  };


  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   const finalCategory = formData.category === "Other" ? formData.customCategory : formData.category;
  //   const finalLocation = formData.location === "Other" ? formData.customLocation : formData.location;

  //   const formattedServices = formData.services
  //     ? formData.services.split(',').map(s => s.trim()).filter(Boolean)
  //     : [];

  //   const newSubmission = {
  //     ownerName: formData.ownerName,
  //     businessName: formData.businessName,
  //     category: finalCategory,
  //     location: finalLocation,
  //     address: formData.address,
  //     aboutBusness: formData.aboutBusness,
  //     phone: Number(formData.phone),
  //     whatsapp: Number(formData.whatsapp) || Number(formData.phone),
  //     locationLink: formData.locationLink || "",
  //     services: formattedServices,
  //     img: formData.img || "",
  //     timing: formData.timing,
  //     status: "pending",
  //     premium: false,
  //     reviewCount: 0,
  //     avgRating: 0,
  //     busnessReview: []
  //   };

  //   try {
  //     const response = await fetch(`${API_URL}/api/businesses/add`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(newSubmission),
  //     });

  //     const data = await response.json();

  //     if (response.ok) {
  //       alert("Business submitted successfully! It is sent to the Admin for approval.");
  //       setIsOpen(false);
  //       setFormData({
  //         ownerName: '', businessName: '', category: '', customCategory: '', location: '', customLocation: '',
  //         address: '', aboutBusness: '', phone: '', whatsapp: '', locationLink: '', services: '', img: '',
  //         timing: formData.timing
  //       });
  //     } else {
  //       alert("Error: " + (data.error || "Failed to submit business"));
  //     }
  //   } catch (error) {
  //     console.error("Network Error:", error);
  //     alert("Failed to connect to backend server!");
  //   }
  // };


const handleSubmit = async (e) => {
  setIsSubmiting(true)
  e.preventDefault();
  
  const finalCategory = formData.category === "Other" ? formData.customCategory : formData.category;
  const finalLocation = formData.location === "Other" ? formData.customLocation : formData.location;

  const formattedServices = formData.services
    ? formData.services.split(',').map(s => s.trim()).filter(Boolean)
    : [];

  const businessBasicData = {
    ownerName: formData.ownerName,
    businessName: formData.businessName,
    category: finalCategory,
    location: finalLocation,
    address: formData.address,
    aboutBusness: formData.aboutBusness,
    phone: Number(formData.phone),
    whatsapp: Number(formData.whatsapp) || Number(formData.phone),
    locationLink: formData.locationLink || "",
    services: formattedServices,
    img: formData.img || "",
    timing: formData.timing,
    status: "pending",
    premium: false,
    reviewCount: 0,
    avgRating: 0,
    busnessReview: []
  };

  // 1. Trigger Razorpay Payment First (₹199)
  handlePayment(API_URL, { businessName: formData.businessName, phone: formData.phone }, async (paymentResponse) => {
    try {
      // 2. Add paymentId to the submission object after payment succeeds
      const newSubmission = {
        ...businessBasicData,
        paymentId: paymentResponse.razorpay_payment_id
      };

      // 3. Send data to backend MongoDB
      const response = await fetch(`${API_URL}/api/businesses/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSubmission),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Payment successful & Business submitted for Admin approval!");
        setIsOpen(false);
        setFormData({
          ownerName: '', businessName: '', category: '', customCategory: '', location: '', customLocation: '',
          address: '', aboutBusness: '', phone: '', whatsapp: '', locationLink: '', services: '', img: '',
          timing: formData.timing
        });
      } else {
        alert("Payment successful, but error saving business: " + (data.error || "Failed to submit"));
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("Failed to connect to backend server after payment!");
    }
    setIsSubmiting(false);
  });
};
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="bg-linear-to-r from-[#E6C594] to-[#DBA55C] text-[#1C1813] font-bold lg:px-10 px-4 py-2 text-[10px] md:text-sm lg:text-base rounded-full hover:scale-95 hover:shadow-lg hover:shadow-amber-300/25 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer lg:w-70"
      >
        <span className="bg-[#1C1813] text-[#DBA55C] rounded-full w-3 h-3 text-center md:w-5 md:h-5 flex items-center justify-center text-xs font-bold">+</span>
        List Your Business
      </button>

      {isOpen && (
        <div className={`fixed inset-0 bg-black/40 backdrop-blur-md z-50 overflow-y-auto flex flex-col justify-center items-center p-4 lg:p-10 ${navbar ? "w-screen h-screen" : "w-full h-full"}`}>
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">

            <div className="sticky top-0 bg-[#FCF7EF] border-b border-gray-200 px-6 lg:px-12 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-xl lg:text-2xl font-bold font-serif text-[#1A2E26]">List Your Business</h2>
                <p className="text-xs text-gray-500">Fill in your business details below for admin approval.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 max-w-5xl w-full mx-auto p-6 lg:p-10">
              <form onSubmit={handleSubmit} className="space-y-6 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {/* Owner Name */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Owner Name *</label>
                    <input type="text" name="ownerName" required value={formData.ownerName} onChange={handleChange} placeholder="e.g. John Doe" className="w-full mt-1.5 border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#DBA55C]" />
                  </div>

                  {/* Business Name */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Business Name *</label>
                    <input type="text" name="businessName" required value={formData.businessName} onChange={handleChange} placeholder="e.g. Elite Showroom" className="w-full mt-1.5 border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#DBA55C]" />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Category *</label>
                    <select name="category" required value={formData.category} onChange={handleChange} className="w-full mt-1.5 border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none bg-white focus:border-[#DBA55C]">
                      <option value="">Select a category</option>
                      {categoriesList.map((cat, idx) => (<option key={idx} value={cat}>{cat}</option>))}
                      <option value="Other">Others (please specify)</option>
                    </select>
                  </div>

                  {formData.category === "Other" && (
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-gray-600">Specify Custom Category *</label>
                      <input type="text" name="customCategory" required value={formData.customCategory} onChange={handleChange} placeholder="Enter category..." className="w-full mt-1.5 border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#DBA55C]" />
                    </div>
                  )}

                  {/* Location */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Location *</label>
                    <select name="location" required value={formData.location} onChange={handleChange} className="w-full mt-1.5 border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none bg-white focus:border-[#DBA55C]">
                      <option value="">Select Location</option>
                      {locationsList.map((loc, idx) => (<option key={idx} value={loc}>{loc}</option>))}
                      <option value="Other">Others (please specify)</option>
                    </select>
                  </div>

                  {formData.location === "Other" && (
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-gray-600">Specify Custom Location *</label>
                      <input type="text" name="customLocation" required value={formData.customLocation} onChange={handleChange} placeholder="Enter location..." className="w-full mt-1.5 border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#DBA55C]" />
                    </div>
                  )}

                  {/* Phone Number */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600">Phone Number *</label>
                    <input type="number" name="phone" required value={formData.phone} onChange={handleChange} placeholder="9876543210" className="w-full mt-1.5 border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#DBA55C]" />
                  </div>

                  {/* WhatsApp Number */}
                  <div>
                    <label className="text-xs font-semibold text-gray-600">WhatsApp Number</label>
                    <input type="number" name="whatsapp" value={formData.whatsapp} onChange={handleChange} placeholder="9876543210" className="w-full mt-1.5 border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#DBA55C]" />
                  </div>

                  {/* Services */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-gray-600">Services (Comma Separated)</label>
                    <input type="text" name="services" value={formData.services} onChange={handleChange} placeholder="Electronics, Appliances, Home Delivery" className="w-full mt-1.5 border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#DBA55C]" />
                  </div>

                  {/* Cover Photo */}
                  <div className="md:col-span-2">
                    <label className="text-xs font-semibold text-gray-600">Cover Photo *</label>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="w-full mt-1.5 border border-gray-300 rounded-xl px-3 py-2 text-xs bg-white cursor-pointer" />
                  </div>
                </div>

                {/* Full Address */}
                <div>
                  <label className="text-xs font-semibold text-gray-600">Address *</label>
                  <input type="text" name="address" required value={formData.address} onChange={handleChange} placeholder="Kuzhithurai Bypass, Kuzhithurai" className="w-full mt-1.5 border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#DBA55C]" />
                </div>

                {/* About Business */}
                <div>
                  <label className="text-xs font-semibold text-gray-600">About *</label>
                  <textarea name="aboutBusness" rows="3" required value={formData.aboutBusness} onChange={handleChange} placeholder="Elite Showroom offers a wide range of..." className="w-full mt-1.5 border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#DBA55C]" />
                </div>

                {/* Google Map Link */}
                <div>
                  <label className="text-xs font-semibold text-gray-600">Google Map Link</label>
                  <input type="url" name="locationLink" value={formData.locationLink} onChange={handleChange} placeholder="https://maps.app.goo.gl/..." className="w-full mt-1.5 border border-gray-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#DBA55C]" />
                </div>

                {/* Timing configuration section */}
                <div className="border-t border-gray-200 pt-4">
                  <label className="text-sm font-bold text-gray-700 block mb-3">Opening & Closing Hours *</label>
                  <div className="space-y-3">
                    {daysOfWeek.map((day) => (
                      <div key={day} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-center bg-gray-50 p-2 rounded-xl">
                        <span className="capitalize text-xs font-semibold text-gray-700">{day}</span>
                        <input
                          type="text"
                          value={formData.timing[day].open}
                          onChange={(e) => handleTimingChange(day, 'open', e.target.value)}
                          placeholder="Open (e.g. 9.00 am)"
                          className="border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white"
                        />
                        <input
                          type="text"
                          value={formData.timing[day].close}
                          onChange={(e) => handleTimingChange(day, 'close', e.target.value)}
                          placeholder="Close (e.g. 5.00 pm)"
                          className="border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white"
                        />
                        <select
                          value={formData.timing[day].closed}
                          onChange={(e) => handleTimingChange(day, 'closed', e.target.value)}
                          className="border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white"
                        >
                          <option value="false">Open</option>
                          <option value="true">Closed</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 pb-10">
                  <button type="button" onClick={() => setIsOpen(false)} className="md:px-6 md:py-3 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-100 cursor-pointer">Cancel</button>
                  <button type="submit" className="bg-linear-to-r from-[#E6C594] to-[#DBA55C] text-[#1C1813] px-3 md:px-8 py-1 md:py-3 rounded-full text-sm font-semibold cursor-pointer shadow-lg hover:opacity-90">{issubmiting?"Submiting":"Submit Listing"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
};

export default ListYourBusinessButton; 