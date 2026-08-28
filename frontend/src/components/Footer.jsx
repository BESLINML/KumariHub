import React from 'react';
import { MessageCircle, Megaphone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#1C1813] text-amber-100/70 pt-16 pb-8 border-t border-white/10 w-full">
      <div className="w-[88%] mx-auto">


        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12">


          <div className="space-y-4">
            <h3 className="text-[#DBA55C] font-serif font-bold text-base tracking-wide">Company</h3>
            <ul className="space-y-2.5 text-xs font-light">
              <li><a href="#" className="hover:text-[#DBA55C] hover:ps-1 transition-all duration-300">About Kumari HUB</a></li>
              <li><a href="#" className="hover:text-[#DBA55C] hover:ps-1 transition-all duration-300">Contact Us</a></li>
              <li><a href="#" className="hover:text-[#DBA55C] hover:ps-1 transition-all duration-300">Advertise with us</a></li>
              <li><a href="#" className="text-[#DBA55C] font-medium hover:underline">List Your Business – ₹199/year</a></li>
            </ul>
          </div>


          <div className="space-y-4">
            <h3 className="text-[#DBA55C] font-serif font-bold text-base tracking-wide">Support</h3>
            <ul className="space-y-2.5 text-xs font-light">
              <li><a href="#" className="hover:text-[#DBA55C] transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-[#DBA55C] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#DBA55C] transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-[#DBA55C] transition-colors">Refund Policy</a></li>
            </ul>
          </div>


          <div className="space-y-4">
            <h3 className="text-[#DBA55C] font-serif font-bold text-base tracking-wide">For Businesses</h3>
            <ul className="space-y-2.5 text-xs font-light">
              <li><a href="#" className="hover:text-[#DBA55C] transition-all ">Why Kumari HUB?</a></li>
              <li><a href="#" className="hover:text-[#DBA55C] transition-all">Premium Features</a></li>
              <li><a href="#" className="hover:text-[#DBA55C] transition-all">Success Stories</a></li>
              <li><a href="#" className="hover:text-[#DBA55C] transition-all">Advertise</a></li>
            </ul>
          </div>


          <div className="space-y-4">
            <h3 className="text-[#DBA55C] font-serif font-bold text-base tracking-wide">Connect</h3>


            <div className="flex flex-col text-xs  gap-4 text-[#DBA55C]">
              <a href="#" className="hover:text-white transition-all ">Facebook</a>
              <a href="#" className="hover:text-white transition-all ">Instagram</a>
              <a href="#" className="hover:text-white transition-all ">Youtube</a>
              <a href="#" className="hover:text-white transition-all ">Twitter</a>
            </div>


            <div className="space-y-1.5 text-xs font-light pt-1">
              <p>support@kumarihub.com</p>
              <p>+91 98765 43210</p>
            </div>
          </div>

        </div>


        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between text-[11px] text-amber-100/50 font-light text-center gap-3">
          <p>© 2026 Kumari HUB Project — Premium Business Directory | Rated by Local Customers</p>

          <div className="flex items-center gap-1.5">
            <Megaphone className="w-3.5 h-3.5 text-[#DBA55C]" />
            <span>Advertise with us</span>
            <a href="#" className="text-[#DBA55C] font-medium underline hover:text-white transition-colors">Click Here</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;