import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star, MapPin, Phone, MessageCircle, ShieldCheck, Clock,
  User, Globe, Share2, Award, ThumbsUp, Headphones, Send, Link2
} from 'lucide-react';
import BusinessSEO from './BusinessSEO';

export default function UserBusinessProfile() {
  const { category, location, businessName } = useParams();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const [business, setBusiness] = useState(null);
  const [relatedBusinesses, setRelatedBusinesses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);


  const [newReview, setNewReview] = useState({ rating: 5, comment: '', userName: '' });
  const [submitting, setSubmitting] = useState(false);
  const [visibleReviewsCount] = useState(3);

  const fetchBusinessDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_URL}/api/businesses/slug?category=${category}&location=${location}&name=${businessName}`
      );
      const data = await res.json();

      if (res.ok) {
        setBusiness(data.business);
        setReviews(data.reviews || []);
        setRelatedBusinesses(data.related || []);
      } else {
        console.error("Business not found");
      }
    } catch (err) {
      console.error("Error fetching business profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinessDetails();
  }, [category, location, businessName]);


  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!newReview.userName || !newReview.comment) {
      return alert("Full every fields");
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${API_URL}/api/reviews/${business._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: Number(newReview.rating),
          comment: newReview.comment,
          userName: newReview.userName
        })
      });

      const data = await res.json();

      if (res.ok) {
        await fetchBusinessDetails();
        setNewReview({ rating: 5, comment: '', userName: '' });
        alert("Review added successfully!");
      } else {
        console.error("BACKEND ERROR:", data);
        alert(data.error || "Failed to submit review");
      }
    } catch (err) {
      console.error("Error posting review:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-500 font-medium">Loading Business Profile...</p>
    </div>
  );

  if (!business) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-2">
      <h2 className="text-2xl font-bold text-gray-800">Oops!</h2>
      <p className="text-red-500 font-medium">Business not found!</p>
    </div>
  );

  const totalReviewsCount = reviews.length;
  const avgRating = totalReviewsCount > 0
    ? (reviews.reduce((acc, item) => acc + item.rating, 0) / totalReviewsCount).toFixed(1)
    : (business.avgRating || '5.0');

  const formatSlug = (text) => text ? text.toLowerCase().replace(/\s+/g, '-') : '';

  return (
    <div className="bg-[#f4f5f7] min-h-screen py-8 font-sans">
      <BusinessSEO business={business}/>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT & CENTER: Main Business Section */}
        <div className="lg:col-span-2 space-y-6">

          {/* Top Banner / Hero Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="relative h-72 sm:h-80 w-full bg-white">
              <img
                src={business.img || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=1000"}
                alt={business.businessName}
                className="w-full h-full object-cover"
              />

              {/* Top-Left Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {business.premium && (
                  <span className="bg-linear-to-r from-amber-500 to-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-1 shadow-md">
                    ⭐ Premium Listing
                  </span>
                )}
                <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-1 shadow-md">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Business
                </span>
                <span className="bg-slate-900/80 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-md">
                  {business.category}
                </span>
              </div>

              {/* Share Button Top Right */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Profile link copied to clipboard!");
                }}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur transition cursor-pointer shadow"
              >
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
            </div>

            {/* Profile Info Section */}
            <div className="px-6 pb-6 pt-16 relative">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 -mt-16 sm:-mt-20 mb-4">
                <div className="flex items-end gap-4">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white p-1 shadow-lg border-4 border-[#DBA55C] shrink-0 overflow-hidden flex items-center justify-center">
                    <img
                      src={business.img || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=300"}
                      alt="Logo"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <div className="pt-2 sm:pt-0">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{business.businessName}</h1>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1 flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-orange-500 shrink-0" /> {business.address}, {business.location}
                    </p>
                  </div>
                </div>

                {/* Rating Badge */}
                <div className="flex items-center gap-2.5 bg-[#1C1813] text-white px-4 py-2.5 rounded-xl shadow-md self-start sm:self-auto">
                  <span className="text-2xl font-black text-[#DBA55C]">{avgRating}</span>
                  <div className="border-l border-white/20 pl-2.5 text-xs">
                    <div className="flex text-amber-400 gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span key={star} className={star <= Math.round(Number(avgRating)) ? "text-amber-400" : "text-gray-650"}>
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-gray-300 font-medium">{totalReviewsCount} Ratings</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                <a
                  href={`tel:${business.phone}`}
                  className="flex items-center justify-center gap-2 bg-[#DBA55C] hover:bg-[#c8934d] text-white font-bold py-3 px-4 rounded-xl shadow-sm transition"
                >
                  <Phone className="w-4 h-4" /> Call: +91 {business.phone}
                </a>
                <a
                  href={`https://wa.me/${business.whatsapp || business.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white font-bold py-3 px-4 rounded-xl shadow-sm transition"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp Chat
                </a>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">
              About {business.businessName}
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              {business.aboutBusness || "This business delivers exceptional solutions with high customer satisfaction. Reach out to experience quality service."}
            </p>
          </div>

          {/* Services Offered Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">Services Offered</h3>
            <div className="flex flex-wrap gap-2.5">
              {(business.services && business.services.length > 0 ? business.services : []).map((service, index) => (
                <span key={index} className="bg-orange-50 text-orange-800 border border-orange-200/60 text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5">
                  ✓ {service}
                </span>
              ))}
            </div>
          </div>

          {/* Timings & Location Map Link Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-base font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" /> Business Timings
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                {typeof business.timing === 'object' && business.timing !== null ? (
                  Object.entries(business.timing).map(([day, time]) => {
                    const timeStr = typeof time === 'object' && time !== null
                      ? `${time.open || time.from || ''} - ${time.close || time.to || ''}`
                      : String(time);

                    const isClosed = timeStr.toLowerCase().includes('closed');

                    return (
                      <div key={day} className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0">
                        <span className="font-medium capitalize text-gray-700">{day}</span>
                        <span className={isClosed ? "text-red-600 bg-red-50 px-2 py-0.5 rounded-md font-semibold text-xs" : "text-gray-600"}>
                          {timeStr}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p>{String(business.timing || 'Timings not available')}</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-2 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-orange-500" /> Location Direction
                </h3>
                <p className="text-xs text-gray-500 mb-3">Find us on Google Maps and get directions.</p>
                <div className="w-full h-28 bg-gray-100 rounded-xl mb-4 overflow-hidden relative border border-gray-200 flex items-center justify-center">
                  <div className="absolute inset-0 opacity-60 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-position-[12px_12px]"></div>
                  <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce">
                    <MapPin className="w-4 h-4" />
                  </div>
                </div>
              </div>
              <a
                href={business.locationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-[#1C1813] hover:bg-black text-white text-xs font-bold py-3 px-4 rounded-xl transition shadow"
              >
                Open in Google Maps ↗
              </a>
            </div>
          </div>

          {/* Reviews & Ratings Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Customer Reviews & Ratings</h3>
              <span className="text-xs bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg font-bold border border-amber-200">{totalReviewsCount} Reviews</span>
            </div>

            <form onSubmit={handleReviewSubmit} className="bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4">
              <h4 className="font-bold text-gray-900 text-sm">Write a Review</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newReview.userName}
                  onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                  placeholder="Your Name"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                  required
                />
                <select
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-amber-500 font-medium"
                >
                  <option value={5}>⭐⭐⭐⭐⭐</option>
                  <option value={4}>⭐⭐⭐⭐</option>
                  <option value={3}>⭐⭐⭐</option>
                  <option value={2}>⭐⭐</option>
                  <option value={1}>⭐</option>
                </select>
              </div>

              <textarea
                rows="3"
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="Share your experience..."
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-amber-500"
                required
              ></textarea>

              <button
                type="submit"
                disabled={submitting}
                className="bg-[#DBA55C] hover:bg-[#c8934d] text-white font-bold text-xs uppercase tracking-wider py-3 px-6 rounded-xl transition flex items-center gap-2 cursor-pointer shadow"
              >
                {submitting ? 'Submitting...' : <>Submit Review <Send className="w-3.5 h-3.5" /></>}
              </button>
            </form>

            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-sm font-medium text-gray-600">No Reviews yet, Be the first to Review</p>
              ) : (
                reviews.slice(0, visibleReviewsCount).map((rev, index) => (
                  <div key={rev._id || index} className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-5">

                    <div className="w-10 h-10 rounded-full bg-[#DBA55C] flex justify-center items-center">
                      <p className="font-bold text-2xl uppercase text-white">{rev.userName.charAt(0)}</p>
                    </div>

                    <div>
                      <div className="flex justify-between items-center gap-3">
                        <span className="font-semibold text-gray-800 text-sm">{rev.userName}</span>
                        <span className="text-amber-500 text-xs">{"★".repeat(rev.rating)}</span>
                      </div>
                      <p className="text-gray-600 text-xs sm:text-sm">{rev.comment}</p>
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Similar Businesses, Why Choose, Owner CTA, Social Share */}
        <div className="space-y-6">

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 text-base mb-4 pb-2 border-b border-gray-100">
              Similar Businesses in {business.location}
            </h3>

            <div className="space-y-3">
              {relatedBusinesses.length === 0 ? (
                <p className="text-xs text-gray-500">No related businesses found.</p>
              ) : (
                relatedBusinesses.map((item) => (
                  <Link
                    key={item._id}
                    to={`/${formatSlug(item.category)}/${formatSlug(item.location)}/${formatSlug(item.businessName)}`}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.img || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=200"}
                        alt={item.businessName}
                        className="w-12 h-12 object-cover rounded-lg shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-900 text-xs truncate">{item.businessName}</h4>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">{item.category}</p>
                      </div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-lg shrink-0">
                      ★ {item.avgRating || '4.0'}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-4">
            <h3 className="font-bold text-gray-900 text-base pb-2 border-b border-gray-100">
              Why Choose This Business?
            </h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-50 text-amber-700 rounded-lg shrink-0"><ShieldCheck className="w-4 h-4" /></div>
                <div>
                  <p className="font-bold text-gray-800">Verified & Trusted</p>
                  <p className="text-gray-500 text-[11px]">Verified by our team for authenticity</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-50 text-amber-700 rounded-lg shrink-0"><Award className="w-4 h-4" /></div>
                <div>
                  <p className="font-bold text-gray-800">Premium Quality</p>
                  <p className="text-gray-500 text-[11px]">High-quality services guaranteed</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-50 text-amber-700 rounded-lg shrink-0"><Clock className="w-4 h-4" /></div>
                <div>
                  <p className="font-bold text-gray-800">On-time Delivery</p>
                  <p className="text-gray-500 text-[11px]">Committed to delivering on time</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-50 text-amber-700 rounded-lg shrink-0"><Headphones className="w-4 h-4" /></div>
                <div>
                  <p className="font-bold text-gray-800">24/7 Support</p>
                  <p className="text-gray-500 text-[11px]">Always here to help you</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-50 text-amber-700 rounded-lg shrink-0"><ThumbsUp className="w-4 h-4" /></div>
                <div>
                  <p className="font-bold text-gray-800">100% Customer Satisfaction</p>
                  <p className="text-gray-500 text-[11px]">Customer satisfaction is our priority</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1C1813] text-white rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 opacity-10">
              <Award className="w-32 h-32 text-[#DBA55C]" />
            </div>
            <div className="text-2xl mb-2">👑</div>
            <h3 className="text-lg font-serif font-bold text-[#DBA55C]">Are you a Business Owner?</h3>
            <p className="text-gray-300 text-xs mt-2 mb-5">List your business and reach thousands of potential customers.</p>
            <Link
              to="/list-business"
              className="inline-block bg-linear-to-r from-[#DBA55C] to-[#c8934d] hover:from-[#c8934d] hover:to-[#b6823d] text-gray-900 font-bold text-xs uppercase tracking-wider py-3 px-6 rounded-xl shadow transition"
            >
              List Your Business →
            </Link>
          </div>

          {/* Social Share Box */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 text-center">
            <h3 className="font-bold text-gray-900 text-sm mb-1">Share This Business</h3>
            <p className="text-xs text-gray-500 mb-4">Help others discover great businesses</p>

            <div className="flex justify-center gap-3">
              {/* Facebook Icon */}
              <button
                onClick={() => window.open(`https://facebook.com/sharer/sharer.php?u=${window.location.href}`)}
                className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition cursor-pointer shadow-sm"
                title="Share on Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </button>

              {/* WhatsApp Icon */}
              <button
                onClick={() => window.open(`https://api.whatsapp.com/send?text=${window.location.href}`)}
                className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition cursor-pointer shadow-sm"
                title="Share on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </button>

              {/* Twitter / X Icon */}
              <button
                onClick={() => window.open(`https://twitter.com/intent/tweet?url=${window.location.href}`)}
                className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-black transition cursor-pointer shadow-sm"
                title="Share on Twitter"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>

              {/* LinkedIn Icon */}
              <button
                onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`)}
                className="w-10 h-10 rounded-full bg-blue-700 text-white flex items-center justify-center hover:bg-blue-800 transition cursor-pointer shadow-sm"
                title="Share on LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </button>

              {/* Copy Link Button */}
              <button
                onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Copied!"); }}
                className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-300 transition cursor-pointer shadow-sm"
                title="Copy Link"
              >
                <Link2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-[#1C1813] text-white rounded-2xl p-6 text-center border border-amber-500/20 shadow-lg">
            <div className="inline-block p-3 bg-[#DBA55C]/20 rounded-full text-[#DBA55C] mb-2">
              <Award className="w-8 h-8" />
            </div>
            <h4 className="font-serif font-bold text-base text-[#DBA55C]">Your Trust, Our Priority</h4>
            <p className="text-gray-300 text-xs mt-2">All businesses are verified and trusted by our community.</p>
          </div>

        </div>

      </div>
    </div>
  );
}