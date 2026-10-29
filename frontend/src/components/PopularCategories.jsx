import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import beautyParlour from '../assets/svg/beauty-parlour.svg';
import construction from '../assets/svg/construction.svg';
import education from '../assets/svg/education.svg';
import gym from '../assets/svg/gym.svg';
import homeAppliances from '../assets/svg/home-appliances.svg';
import homeService from '../assets/svg/home-service.svg';
import hospital from '../assets/svg/hospital.svg';
import hotels from '../assets/svg/hotels.svg';
import market from '../assets/svg/market.svg';
import medical from '../assets/svg/medical.svg';
import restaurant from '../assets/svg/restaurant.svg';
import salon from '../assets/svg/salon.svg';
import shop from '../assets/svg/shop.svg';
import showroom from '../assets/svg/showroom.svg';
import store from '../assets/svg/store.svg';
import superMarket from '../assets/svg/super-market.svg';
import travel from '../assets/svg/travel.svg';
import turf from '../assets/svg/turf.svg';
import video from '../assets/svg/video.svg';
import wedding from '../assets/svg/wedding.svg';

export const categoryIcons = {
  'Beauty Parlour': beautyParlour,
  Construction: construction,
  Education: education,
  Gym: gym,
  'Home Appliances': homeAppliances,
  'Home Services': homeService,
  Hospital: hospital,
  Hotels: hotels,
  Market: market,
  Medical: medical,
  Restaurant: restaurant,
  Salon: salon,
  Shop: shop,
  Showroom: showroom,
  Store: store,
  'Super Market': superMarket,
  Travel: travel,
  Turf: turf,
  Video: video,
  Wedding: wedding,
};

const categorySlug = (name) => name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const PopularCategories = ({ category, selectedCategory }) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let intervalId;

    const startAutoScroll = () => {
      intervalId = setInterval(() => {
        if (scrollContainer) {
          if (scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth - 10) {
            scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            scrollContainer.scrollBy({ left: 200, behavior: 'smooth' });
          }
        }
      }, 1000);
    };

    startAutoScroll();

    const stopAutoScroll = () => clearInterval(intervalId);

    scrollContainer.addEventListener('mouseenter', stopAutoScroll);
    scrollContainer.addEventListener('mouseleave', startAutoScroll);

    return () => {
      stopAutoScroll();
      if (scrollContainer) {
        scrollContainer.removeEventListener('mouseenter', stopAutoScroll);
        scrollContainer.removeEventListener('mouseleave', startAutoScroll);
      }
    };
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (

    <section className="mt-6 px-4 sm:px-[5%] w-full">
      <div className="flex justify-between items-center mb-4">
        <p className="text-[#1C1813] text-2xl sm:text-3xl font-serif font-bold">Popular Categories</p>

        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 transition shadow-sm cursor-pointer"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 transition shadow-sm cursor-pointer"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 pb-4 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {category && category.map((item, i) => (
          <Link
          key={i}
          to={`/${categorySlug(item.name)}`}
          >
          <div
            key={i}
            className={`snap-start h-full bg-linear-to-b bg-white rounded-xl w-28 sm:w-30 p-3 py-5 shadow-md text-white flex flex-col justify-center text-center gap-2 items-center shrink-0 border-2 cursor-pointer transition-all ${selectedCategory === item.name ? 'border-amber-700 scale-105' : 'border-transparent'}`}
          >
            <img src={item.img || categoryIcons[item.name]} className="w-8 h-8 object-cover object-center bg-white p-1 rounded-full shadow" alt={item.name} />
            <h3 className="text-xs  font-bold w-full text-black">{item.name}</h3>
            {/* <Link
              to={`/category/${item.name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-gray-800 px-3 py-1 rounded-full text-[11px] font-bold shadow hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Explore
            </Link> */}
          </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default PopularCategories;
