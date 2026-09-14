import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeftCircle, ArrowRightCircle, MapPinned, MoveRightIcon, Phone, Search, Star, Tag } from 'lucide-react';
import BusinessCard from '../components/BusinessCard.jsx';
import ListYourBusinessButton from '../components/ListYourBusinessButton.jsx';
import NavBar from '../components/NavBar.jsx';
import { useNavigate, Link } from 'react-router-dom';
import SearchBox from '../components/SearchBox.jsx';
import PopularCategories from '../components/PopularCategories.jsx';

const Home = ({ searchTerm, setSearchTerm }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [businessData, setBusinessData] = useState([]);

  const [premiumUser, setPremiumUser] = useState(() => {
    const saved = localStorage.getItem('home_premium');
    return saved ? JSON.parse(saved) : [];
  });

  const [category, setCategory] = useState(() => {
    const saved = localStorage.getItem('home_categories');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [locationsList, setLocationsList] = useState([]);
  const [visibleCount, setVisibleCount] = useState(9);

  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const catRes = await fetch(`${API_URL}/api/categories`);
        const catData = await catRes.json();

        if (catRes.ok) {
          const formattedCategories = catData.map((cat) => ({
            name: cat.name,
            img: cat.img
          }));

          const localCategories = localStorage.getItem('home_categories');
          const parsedLocal = localCategories ? JSON.parse(localCategories) : [];

          if (JSON.stringify(formattedCategories) !== JSON.stringify(parsedLocal)) {
            setCategory(formattedCategories);
            localStorage.setItem('home_categories', JSON.stringify(formattedCategories));
          }
        }

        const locRes = await fetch(`${API_URL}/api/locations`);
        const locData = await locRes.json();
        if (locRes.ok) setLocationsList(locData);
      } catch (error) {
        console.error("Error fetching metadata:", error);
      }
    };
    fetchMetadata();
  }, [API_URL]);

  useEffect(() => {
    const fetchBusinesses = async () => {
      const cachedData = sessionStorage.getItem('home_businesses');

      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        setBusinessData(parsed);

        const premiums = parsed.filter(item => item.premium === true);
        setPremiumUser(premiums);

      } else {
        try {
          setLoading(true);
          const res = await fetch(`${API_URL}/api/businesses?page=1&limit=9`);
          const data = await res.json();

          if (res.ok) {
            const businessesList = data.businesses || data;
            const currentDate = new Date();

            const activeBusinesses = businessesList.filter((item) => {
              const isActive = item.status === "active";
              let isNotExpired = true;
              if (item.expiredDate) {
                const expiry = new Date(item.expiredDate);
                isNotExpired = !isNaN(expiry.getTime()) && expiry >= currentDate;
              }
              const hasValidCreatedDate = !item.createdAt || !isNaN(new Date(item.createdAt).getTime());
              return isActive && isNotExpired && hasValidCreatedDate;
            });

            activeBusinesses.sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA;
            });

            setBusinessData(activeBusinesses);

            const activePremiums = activeBusinesses
              .filter((item) => item.premium)
              .map((item) => ({
                _id: item._id,
                businessName: item.businessName,
                aboutBusness: item.aboutBusness,
                category: item.category,
                phone: item.phone,
                avgRating: item.avgRating,
                reviewCount: item.reviewCount,
                img: item.img,
                location: item.location,
                premium: item.premium
              }));

            const localPremiums = localStorage.getItem('home_premium');
            const parsedLocalPremiums = localPremiums ? JSON.parse(localPremiums) : [];

            if (JSON.stringify(activePremiums) !== JSON.stringify(parsedLocalPremiums)) {
              setPremiumUser(activePremiums);
              localStorage.setItem('home_premium', JSON.stringify(activePremiums));
            }

            const initialOptimized = activeBusinesses.map((item) => ({
              _id: item._id,
              businessName: item.businessName,
              ownerName: item.ownerName,
              category: item.category,
              location: item.location,
              address: item.address,
              phone: item.phone,
              whatsapp: item.whatsapp,
              img: item.img,
              avgRating: item.avgRating,
              reviewCount: item.reviewCount,
              services: item.services,
              timing: item.timing,
              aboutBusness: item.aboutBusness,
              locationLink: item.locationLink,
              premium: item.premium
            }));

            sessionStorage.setItem('home_businesses', JSON.stringify(initialOptimized));
          }
        } catch (error) {
          console.error("Initial fetch error:", error);
        } finally {
          setLoading(false);
        }
      }

      setTimeout(async () => {
        try {
          const bgRes = await fetch(`${API_URL}/api/businesses?limit=1000`);
          const bgData = await bgRes.json();

          if (bgRes.ok) {
            const businessesList = bgData.businesses || bgData;
            const currentDate = new Date();

            const allActiveBusinesses = businessesList.filter((item) => {
              const isActive = item.status === "active";
              let isNotExpired = true;
              if (item.expiredDate) {
                const expiry = new Date(item.expiredDate);
                isNotExpired = !isNaN(expiry.getTime()) && expiry >= currentDate;
              }
              const hasValidCreatedDate = !item.createdAt || !isNaN(new Date(item.createdAt).getTime());
              return isActive && isNotExpired && hasValidCreatedDate;
            });

            allActiveBusinesses.sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA;
            });

            const optimizedBusinesses = allActiveBusinesses.map((item) => ({
              _id: item._id,
              businessName: item.businessName,
              ownerName: item.ownerName,
              category: item.category,
              location: item.location,
              address: item.address,
              phone: item.phone,
              whatsapp: item.whatsapp,
              img: item.img,
              avgRating: item.avgRating,
              reviewCount: item.reviewCount,
              services: item.services,
              timing: item.timing,
              aboutBusness: item.aboutBusness,
              locationLink: item.locationLink,
              premium: item.premium
            }));

            setBusinessData(allActiveBusinesses);
            sessionStorage.setItem('home_businesses', JSON.stringify(optimizedBusinesses));

            const activePremiums = allActiveBusinesses
              .filter((item) => item.premium)
              .map((item) => ({
                _id: item._id,
                businessName: item.businessName,
                aboutBusness: item.aboutBusness,
                category: item.category,
                phone: item.phone,
                avgRating: item.avgRating,
                reviewCount: item.reviewCount,
                img: item.img,
                location: item.location,
                premium: item.premium
              }));

            const localPremiums = localStorage.getItem('home_premium');
            const parsedLocalPremiums = localPremiums ? JSON.parse(localPremiums) : [];

            if (JSON.stringify(activePremiums) !== JSON.stringify(parsedLocalPremiums)) {
              setPremiumUser(activePremiums);
              localStorage.setItem('home_premium', JSON.stringify(activePremiums));
            }
          }
        } catch (bgError) {
          console.error("Background fetch error:", bgError);
        }
      }, 800);
    };

    fetchBusinesses();
  }, [API_URL]);
  useEffect(() => {
    if (premiumUser.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % premiumUser.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [premiumUser]);

  const businessSectionRef = useRef(null);
  const scrollToBusiness = () => {
    businessSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleNext = () => {
    if (premiumUser.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % premiumUser.length);
  };

  const handlePrev = () => {
    if (premiumUser.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex - 1 + premiumUser.length) % premiumUser.length);
  };

  const filteredBusinesses = businessData.filter((business) => {
    const categoryMatch = selectedCategory === "All"
      ? true
      : (business.category?.toLowerCase() || '') === selectedCategory.toLowerCase();

    const locationMatch = selectedLocation === "All" || !selectedLocation
      ? true
      : (business.location?.toLowerCase() || '') === selectedLocation.toLowerCase();

    const searchMatch = searchTerm
      ? (business.businessName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (business.category?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (business.location?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      : true;

    return categoryMatch && locationMatch && searchMatch;
  });

  const displayedBusinesses = filteredBusinesses.slice(0, visibleCount);

  const formatSlug = (text) => text ? text.toLowerCase().replace(/\s+/g, '-') : '';

  const handleCardClick = (business) => {
    const categorySlug = formatSlug(business.category);
    const locationSlug = formatSlug(business.location);
    const nameSlug = formatSlug(business.businessName);
    const url = `/${categorySlug}/${locationSlug}/${nameSlug}`;
    window.open(url, '_blank');

  };

  const currentItem = premiumUser.length > 0 ? premiumUser[currentIndex] : null;

  return (
    <div className="overflow-x-hidden">
      <NavBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onScrollToBusiness={scrollToBusiness}
      />

      <div className="flex flex-col items-center gap-6 md:gap-10">
        {/* Hero Section */}
        <section className="bg-[#1C1813] rounded-b-4xl sm:rounded-b-[3rem] w-full px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex justify-between items-center py-4 sm:py-5 border-b border-white/10">
            <p className="text-[#DBA55C] md:text-3xl font-bold font-serif ">Kumari HUB</p>
            <ListYourBusinessButton />
          </div>

          <div className="text-white flex flex-col justify-center items-center md:space-y-6 lg:space-y-6 sm:space-y-10 py-10 sm:py-15 max-w-4xl mx-auto">
            <p className="text-[#DBA55C] text-[10px] sm:text-xs font-bold tracking-[2px] flex items-center gap-2 bg-white/10 px-4 sm:px-5 py-1.5 rounded-full">
              <span><MapPinned className="w-3" /></span>KANYAKUMARI DISTRICT
            </p>

            <h1 className="text-center text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold leading-tight sm:leading-22 md:leading-13 lg:leading-16  xl:leading-22 w-screen p-3">
              Discover <span className="text-[#DBA55C] inline-block">Local Businesses</span> <br className="hidden sm:block" />In Kanyakumari
            </h1>

            <p className="text-center text-white/60 text-xs sm:text-sm font-semibold px-2">
              Restaurants, salons, electricians, Shops & more — trusted businesses in Nagercoil,<br className="hidden md:block" /> Marthandam, Kuzhithurai, Thuckalay, Colachel & More
            </p>

            <div className="w-60 md:w-xl h-10 md:h-15">
              <SearchBox />
            </div>
            
          </div>
        </section>

        {/* Premium Banner Section */}
        <section className="bg-[#1C1813] w-[92%] sm:w-[88%] h-150 md:h-60 rounded-3xl py-6 px-4 sm:px-8">
          <div className="w-full h-full flex flex-col md:flex-row items-center justify-between gap-6">
            {currentItem ? (
              <div className="w-full md:w-[70%] text-white flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 transition-all duration-300 overflow-hidden text-center sm:text-left">
                <img src={currentItem.img || demo} className="w-24 h-24 sm:w-30 sm:h-30 object-cover object-center rounded-full shrink-0" />
                <div className="space-y-2 w-full">
                  <button onClick={() => handleCardClick(currentItem)} className="text-[#DBA55C] text-xl sm:text-3xl font-bold font-serif overflow-hidden cursor-pointer hover:underline transition-all duration-300 block w-full sm:w-auto truncate">{currentItem.businessName}</button>
                  <p className="text-amber-100/70 text-xs sm:text-sm max-w-xl">
                    {currentItem.aboutBusness && currentItem.aboutBusness.length > 180
                      ? `${currentItem.aboutBusness.slice(0, 180)}...`
                      : currentItem.aboutBusness}
                  </p>
                  <div className="flex flex-wrap gap-3 sm:gap-5 items-center justify-center sm:justify-start text-amber-100/70 font-light text-xs pt-1">
                    <p className="flex gap-2 items-center">
                      <span className="text-black"><Tag className="w-4" fill="#DBA55C" /></span>
                      {currentItem.category}
                    </p>
                    <p className="flex gap-2 items-center">
                      <span className="text-[#DBA55C]"><Phone className="w-3" fill="#DBA55C" /></span>
                      +91 {currentItem.phone}
                    </p>
                    <div className="flex items-baseline gap-1 bg-[#DBA55C]/50 px-3 py-0.5 rounded-full text-white">
                      <p className="flex items-center">
                        {currentItem.avgRating || 0}
                        <span className="ps-1"><Star className="text-[#DBA55C] w-3.5" fill="#DBA55C" /></span>
                      </p>
                      <p className="text-[8px]">{currentItem.reviewCount || 0}+</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-6 text-amber-10 pt-2">
                    <p onClick={handlePrev} className="cursor-pointer"><ArrowLeftCircle fill="#DBA55C" className="text-black w-6 h-6" /></p>
                    <p onClick={handleNext} className="cursor-pointer"><ArrowRightCircle fill="#DBA55C" className="text-black w-6 h-6" /></p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full md:w-[70%] h-32 text-amber-100/70 flex items-center justify-center text-xs sm:text-sm">
                {loading ? "Loading featured businesses..." : "No premium businesses available."}
              </div>
            )}

            <div className="flex flex-col items-center justify-center gap-2 w-full md:w-[30%] border-t md:border-t-0 md:border-s border-white/20 text-white pt-5 md:pt-0 md:ps-6 text-center">
              <p className="text-[#DBA55C] text-xl sm:text-2xl font-serif">Advertise With Us ✦</p>
              <p className="text-amber-100/70 text-xs">Get your ad in this banner instantly! Fill form & go live.</p>
              <div className="mt-2">
                <ListYourBusinessButton />
              </div>
            </div>
          </div>
        </section>

        {/* Popular Categories Icons Section */}

        <PopularCategories category={category} />

        {/* Business Listings Section with Filters */}
        <section ref={businessSectionRef} className="w-[92%] sm:w-[88%]">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
            <p className="text-[#1C1813] text-2xl sm:text-3xl font-serif font-bold">
              {selectedCategory === "All" ? "Business Listings" : `${selectedCategory} Businesses`}
            </p>

            {/* Filters Bar */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 text-xs sm:text-sm rounded-lg px-3 py-2 outline-none cursor-pointer shadow-sm flex-1 sm:flex-none"
              >
                <option value="All">All Categories</option>
                {category.map((cat, idx) => (
                  <option key={idx} value={cat.name}>{cat.name}</option>
                ))}
              </select>

              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 text-xs sm:text-sm rounded-lg px-3 py-2 outline-none cursor-pointer shadow-sm flex-1 sm:flex-none"
              >
                <option value="All">All Locations</option>
                {locationsList.map((loc, idx) => {
                  const locName = typeof loc === 'object' ? (loc.locationName || loc.name) : loc;
                  return (
                    <option key={idx} value={locName}>{locName}</option>
                  );
                })}
              </select>

              <button
                disabled={selectedCategory === "All" && selectedLocation === "All"}
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedLocation("All");
                }}
                className={`text-xs px-3 py-2 rounded-lg font-medium transition-colors ${(selectedCategory !== "All" || selectedLocation !== "All")
                    ? "bg-amber-100 hover:bg-amber-200 text-amber-900 cursor-pointer"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
              >
                Clear Filters
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16 gap-2">
              <div className="w-8 h-8 border-4 border-[#1A2E26]/20 border-t-[#D4AF37] rounded-full animate-spin"></div>
              <p className="font-bold text-sm text-[#D4AF37]">Loading...</p>
            </div>
          ) : displayedBusinesses.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-5">
                {displayedBusinesses.map((item, i) => (
                  <div key={item._id || i}>
                    <BusinessCard
                      img={item.img}
                      openTime={item.timing}
                      address={item.address}
                      avgReview={item.avgRating}
                      bussinessName={item.businessName}
                      categories={item.category}
                      location={item.location}
                      reviewCount={item.reviewCount}
                      onclick={() => handleCardClick(item)}
                      phone={item.phone}
                      locationLink={(item.locationLink) ? item.locationLink : ""}
                      whatsappNumber={item.whatsapp}
                    />
                  </div>
                ))}
              </div>

              <p className="text-center text-xs text-gray-400 mt-6">
                Total: {filteredBusinesses.length} | Visible: {visibleCount}
              </p>

              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 9)}
                  className={`bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full text-xs sm:text-sm px-6 py-2.5 font-medium transition-all shadow-sm ${(filteredBusinesses.length>visibleCount)?"cursor-pointer" :"cursor-not-allowed hidden"}`}
                >
                  Load More
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-gray-500 text-sm sm:text-base">
              No businesses found matching your criteria.
            </div>
          )}
        </section>

        {/* Footer Call-to-action */}
        <section className="w-[92%] sm:w-[88%] mx-auto mb-10">
          <div className="bg-[#1C1813] rounded-4xl sm:rounded-[2.5rem] py-10 sm:py-14 px-6 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
            <h2 className="text-[#E6C594] text-2xl sm:text-4xl font-serif font-bold flex items-center gap-2">
              Own a business? <span className="text-xl">✌️</span>
            </h2>
            <p className="text-amber-100/70 text-xs sm:text-sm font-light mt-2 max-w-md">
              Get listed today and reach thousands of local customers across Kanyakumari district
            </p>
            <div className="mt-4">
              <ListYourBusinessButton />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;