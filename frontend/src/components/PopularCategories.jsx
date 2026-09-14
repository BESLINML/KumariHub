import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
    // <section className="mt-6 px-4 sm:px-[5%] w-full">
    //   <div className="flex justify-between items-center mb-4">
    //     <p className="text-[#1C1813] text-2xl sm:text-3xl font-serif font-bold">Popular Categories</p>

    //     <div className="flex gap-2">
    //       <button
    //         onClick={() => scroll('left')}
    //         className="p-2 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 transition shadow-sm cursor-pointer"
    //         aria-label="Previous"
    //       >
    //         <ChevronLeft className="w-5 h-5" />
    //       </button>
    //       <button
    //         onClick={() => scroll('right')}
    //         className="p-2 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 transition shadow-sm cursor-pointer"
    //         aria-label="Next"
    //       >
    //         <ChevronRight className="w-5 h-5" />
    //       </button>
    //     </div>
    //   </div>

    //   <div
    //     ref={scrollRef}
    //     className="flex gap-4 pb-4 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    //   >
    //     {category && category.map((item, i) => (
    //       <div
    //         key={i}
    //         className={`snap-start bg-linear-to-b from-[#FFD1A9] to-[#eda863] rounded-xl w-28 sm:w-30 p-3 py-5 shadow-md text-white flex flex-col justify-between text-center gap-2 items-center shrink-0 border-2 cursor-pointer transition-all ${selectedCategory === item.name ? 'border-amber-700 scale-105' : 'border-transparent'}`}
    //       >
    //         <img src={item.img} className="w-8 h-8 object-cover object-center bg-white p-1 rounded-full shadow" alt={item.name} />
    //         <h3 className="text-xs sm:text-sm font-bold font-serif truncate w-full">{item.name}</h3>
    //         <Link
    //           to={`/category/${item.name}`}
    //           target="_blank"
    //           rel="noopener noreferrer"
    //           className="bg-white text-gray-800 px-3 py-1 rounded-full text-[11px] font-bold shadow hover:bg-gray-100 transition-colors cursor-pointer"
    //         >
    //           Explore
    //         </Link>
    //       </div>
    //     ))}
    //   </div>
    // </section>

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
          to={`/category/${item.name}`}
          target="_blank"
          rel="noopener noreferrer"
          >
          <div
            key={i}
            className={`snap-start h-full bg-linear-to-b bg-white rounded-xl w-28 sm:w-30 p-3 py-5 shadow-md text-white flex flex-col justify-center text-center gap-2 items-center shrink-0 border-2 cursor-pointer transition-all ${selectedCategory === item.name ? 'border-amber-700 scale-105' : 'border-transparent'}`}
          >
            <img src={item.img} className="w-8 h-8 object-cover object-center bg-white p-1 rounded-full shadow" alt={item.name} />
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