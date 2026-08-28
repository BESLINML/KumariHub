import { MoveRightIcon, Search } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import Button from './Button';
import SearchBox from './SearchBox';

const NavBar = ({ onScrollToBusiness }) => {
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
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 px-4 lg:px-10 bg-[#FCF7EF] py-2 md:h-15 shadow-sm transition-all">

        {/* Top/Main Row for Logo and Actions */}
        <div className="flex items-center justify-between w-full md:w-auto h-11 md:h-full">
          <p className="text-[#DBA55C] font-bold font-serif lg:w-40 text-sm md:text-base">
            Kumari <span className="text-black">HUB</span>
          </p>

          <div className="flex items-center gap-3 md:hidden">
            {/* Mobile Search Toggle or Direct Action Button */}
            <Button onclick={onScrollToBusiness} />
          </div>
        </div>

        <SearchBox />

        {/* Desktop Action Button */}
        <div className="hidden md:block shrink-0">
          <Button onclick={onScrollToBusiness} />
        </div>

      </div>
    </nav>
  )
}

export default NavBar