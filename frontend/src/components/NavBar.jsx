import { MoveRightIcon, Search } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import SearchBox from './SearchBox';
import ListYourBusinessButton from './ListYourBusinessButton';

const NavBar = ({ onScrollToBusiness, advertisement, onAdvertisementClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();


  const isHomePage = location.pathname === '/';

  useEffect(() => {

    if (!isHomePage) return;

    const handleScroll = () => {
      if (window.scrollY > 500) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => { window.removeEventListener("scroll", handleScroll) }
  }, [isHomePage]);


  const navVisibilityClass = isHomePage
    ? `fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ${isScrolled ? 'translate-y-0' : '-translate-y-full'}`
    : `sticky top-0 left-0 right-0 z-50`;

  return (
    <nav className={navVisibilityClass}>
      <div className="flex items-center justify-between gap-3 px-4 lg:px-10 bg-[#FCF7EF] py-2 md:h-15 shadow-sm transition-all">

        {/* Top/Main Row for Logo and Actions */}
        <div className="flex items-center justify-between w-auto h-11 md:h-full">
          <p className="text-[#DBA55C] font-bold font-serif lg:w-40 text-sm md:text-lg flex">
            Kumari <span className="text-black">HUB</span>
          </p>

        </div>

        <div className="h-10 min-w-0 md:flex-[3]">
          <SearchBox navbar={true}/>
        </div>

        {advertisement && (
          <button
            type="button"
            onClick={() => onAdvertisementClick?.(advertisement)}
            className="hidden min-w-0 items-center gap-2 rounded-xl border border-amber-200 bg-white/90 p-1.5 text-left shadow-sm transition hover:border-[#DBA55C] hover:shadow-md md:flex md:flex-[2]"
            aria-label={`View ${advertisement.companyName} business details`}
          >
            <img src={advertisement.coverPhoto} alt="" className="h-11 w-14 shrink-0 rounded-lg object-cover" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-bold text-[#1A2E26]">{advertisement.companyName}</span>
              <span className="block truncate text-[10px] text-gray-500">{advertisement.description}</span>
              <span className="block truncate text-[9px] text-gray-500">{advertisement.phone} · {advertisement.place}</span>
            </span>
          </button>
        )}



        {/* <div className="hidden md:block shrink-0">
          <Button onclick={onScrollToBusiness} />
        </div> */}
        <div className="hidden min-w-0 md:block md:flex-1">
          <ListYourBusinessButton navbar={true} buttonLabel="Add" />
        </div>


      </div>
    </nav>
  )
}

export default NavBar
