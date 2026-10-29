import React, { useEffect, useState, useRef } from 'react';
import { MapPinned, Phone, Tag } from 'lucide-react';
import BusinessCard from '../components/BusinessCard.jsx';
import ListYourBusinessButton from '../components/ListYourBusinessButton.jsx';
import NavBar from '../components/NavBar.jsx';
import { useNavigate, Link } from 'react-router-dom';
import SearchBox from '../components/SearchBox.jsx';
import PopularCategories from '../components/PopularCategories.jsx';
import fallbackBusinessImage from '../assets/avif/pexels-photo-1954524.avif';

const Home = ({ searchTerm, setSearchTerm }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [businessData, setBusinessData] = useState([]);
  const [advertisements, setAdvertisements] = useState([]);
  const [advertisementIndex, setAdvertisementIndex] = useState(0);
  const currentAdvertisement = advertisements[advertisementIndex];

  const [category, setCategory] = useState(() => {
    const saved = localStorage.getItem('home_categories');
    return saved ? JSON.parse(saved) : [];
  });

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [locationsList, setLocationsList] = useState([]);
  const [visibleCount, setVisibleCount] = useState(9);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const handleNewAdvertisement = (event) => {
      if (!event.detail) return;
      setAdvertisements((current) => [event.detail, ...current.filter((ad) => ad._id !== event.detail._id)]);
      setAdvertisementIndex(0);
    };

    fetch(`${API_URL}/api/advertisements`)
      .then((response) => response.ok ? response.json() : [])
      .then((data) => { if (isMounted) setAdvertisements(Array.isArray(data) ? data : []); })
      .catch((error) => console.error('Could not load advertisements:', error));

    window.addEventListener('kumarihub:advertisement-created', handleNewAdvertisement);
    return () => {
      isMounted = false;
      window.removeEventListener('kumarihub:advertisement-created', handleNewAdvertisement);
    };
  }, [API_URL]);

  useEffect(() => {
    if (advertisements.length < 2) return undefined;
    const interval = window.setInterval(() => {
      setAdvertisementIndex((index) => (index + 1) % advertisements.length);
    }, 7000);
    return () => window.clearInterval(interval);
  }, [advertisements.length]);

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

          }
        } catch (bgError) {
          console.error("Background fetch error:", bgError);
        }
      }, 800);
    };

    fetchBusinesses();
  }, [API_URL]);
  const businessSectionRef = useRef(null);
  const scrollToBusiness = () => {
    businessSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const handleAdvertisementClick = (advertisement) => {
    if (!advertisement) return;
    const matchingBusiness = businessData.find((business) =>
      business.businessName?.trim().toLowerCase() === advertisement.companyName?.trim().toLowerCase() &&
      business.location?.trim().toLowerCase() === advertisement.place?.trim().toLowerCase()
    ) || businessData.find((business) =>
      business.businessName?.trim().toLowerCase() === advertisement.companyName?.trim().toLowerCase()
    );
    const business = matchingBusiness || {
      businessName: advertisement.companyName,
      category: advertisement.category,
      location: advertisement.place,
    };
    const slug = (value) => value ? value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '';
    navigate(`/${slug(business.category)}/${slug(business.location)}/${slug(business.businessName)}`);
  };

  return (
    <div className="overflow-x-hidden">
      <NavBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onScrollToBusiness={scrollToBusiness}
        advertisement={currentAdvertisement}
        onAdvertisementClick={handleAdvertisementClick}
      />

      <div className="flex flex-col items-center gap-6 md:gap-10">

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


        <section className="bg-[#1C1813] w-[92%] sm:w-[88%] h-150 md:h-60 rounded-3xl py-6 px-4 sm:px-8">
          <div className="w-full h-full flex flex-col md:flex-row items-center justify-between gap-6">
            {currentAdvertisement ? (
              <div className="w-full md:w-[70%] text-white flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 transition-all duration-300 overflow-hidden text-center sm:text-left">
                <img src={currentAdvertisement.coverPhoto || fallbackBusinessImage} alt={currentAdvertisement.companyName || 'Advertisement'} className="w-32 h-28 sm:w-44 sm:h-36 object-cover object-center rounded-2xl shrink-0" />
                <div className="space-y-2 w-full min-w-0">
                  <p className="text-[#DBA55C] text-xs uppercase tracking-widest">Featured Advertisement</p>
                  <h2 className="text-xl sm:text-3xl font-bold font-serif truncate">{currentAdvertisement.companyName}</h2>
                  <p className="text-amber-100/70 text-xs sm:text-sm max-w-xl line-clamp-3">{currentAdvertisement.description}</p>
                  <div className="flex flex-wrap gap-3 sm:gap-5 items-center justify-center sm:justify-start text-amber-100/70 font-light text-xs pt-1">
                    <span className="flex gap-2 items-center"><Tag className="w-4 text-[#DBA55C]" />{currentAdvertisement.category}</span>
                    <span className="flex gap-2 items-center"><MapPinned className="w-4 text-[#DBA55C]" />{currentAdvertisement.place}</span>
                    <a href={`tel:${currentAdvertisement.phone}`} className="flex gap-2 items-center hover:text-[#DBA55C]"><Phone className="w-3 text-[#DBA55C]" />{currentAdvertisement.phone}</a>
                  </div>
                  {advertisements.length > 1 && <p className="text-[10px] text-white/40">Ad {advertisementIndex + 1} of {advertisements.length}</p>}
                </div>
              </div>
            ) : (
              <div className="w-full md:w-[70%] h-32 text-amber-100/70 flex items-center justify-center text-xs sm:text-sm">
                {loading ? "Loading advertisements..." : "No active advertisements yet. Advertise your business to be featured here."}
              </div>
            )}

            <div className="flex flex-col items-center justify-center gap-2 w-full md:w-[30%] border-t md:border-t-0 md:border-s border-white/20 text-white pt-5 md:pt-0 md:ps-6 text-center">
              <p className="text-[#DBA55C] text-xl sm:text-2xl font-serif">Advertise With Us ✦</p>
              <p className="text-amber-100/70 text-xs">Get your ad in this banner instantly! Fill form & go live.</p>
              <div className="mt-2">
                <ListYourBusinessButton buttonLabel="Advertise Your Business" isAdvertisement />
              </div>
            </div>
          </div>
        </section>


        <PopularCategories category={category} />


        <section ref={businessSectionRef} className="w-[92%] sm:w-[88%]">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
            <p className="text-[#1C1813] text-2xl sm:text-3xl font-serif font-bold">
              {selectedCategory === "All" ? "Business Listings" : `${selectedCategory} Businesses`}
            </p>


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
