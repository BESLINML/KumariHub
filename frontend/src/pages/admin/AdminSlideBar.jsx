import { BarChart3, Building2, DiamondPlus, FolderPlus, LayoutDashboard, MapPinPlus, PlusCircle, PresentationIcon, Settings, Wallet } from 'lucide-react';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const AdminSlideBar = ({ setModalType, setIsModalOpen }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("")

  return (
    <aside className="h-full bg-[#1A2E26] text-[#A3C1AD] flex flex-col justify-between p-3 md:p-6 shadow-xl">
      <div>
        {/* Admin Profile (Desktop Only) */}
        <div className="hidden md:flex items-center gap-4 mb-8 pb-6 border-b border-[#2A473C]">
          <div className="w-12 h-12 rounded-full bg-[#D4AF37] flex items-center justify-center font-bold text-[#1A2E26] text-lg shadow-md shrink-0">
            AJ
          </div>
          <div className="overflow-hidden">
            <h2 className="text-white font-serif font-bold text-base tracking-wide truncate">ALEX JOHNSON</h2>
            <p className="text-xs text-[#8FA89B] truncate">alex.johnson@gmail.com</p>
          </div>
        </div>

        {/* Navigation Links (Horizontal scroll on mobile, Vertical on desktop) */}
        <nav className="flex md:flex-col gap-2 overflow-x-scroll md:overflow-x-visible pb-2 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] scrollbar-none">

          <button
            onClick={() => { navigate("/admin-dashBoard"), setActiveTab("dashboard") }}
            className={`flex items-center gap-2 md:gap-3.5 px-3.5 md:px-4 py-2.5 md:py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${activeTab === 'dashboard' ? "bg-white/10 text-white shadow-xs" : "hover:bg-white/5 hover:text-white"
              }`}
          >
            <LayoutDashboard className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => { navigate("/admin-dashBoard/inactive-list"), setActiveTab("inactive") }}
            className={`flex items-center gap-2 md:gap-3.5 px-3.5 md:px-4 py-2.5 md:py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${activeTab === 'inactive' ? "bg-white/10 text-white shadow-xs" : "hover:bg-white/5 hover:text-white"
              }`}
          >
            <Building2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <span>Inactive List</span>
          </button>

          <button
            onClick={() => { navigate("/admin-dashBoard/pending-submission"), setActiveTab("pending") }}
            className={`flex items-center gap-2 md:gap-3.5 px-3.5 md:px-4 py-2.5 md:py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${activeTab === 'pending' ? "bg-white/10 text-white shadow-xs" : "hover:bg-white/5 hover:text-white"
              }`}
          >
            <Wallet className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <span>Pending Submissions</span>
          </button>

          <button
            onClick={() => { navigate("/admin-dashBoard/recent-businesses"), setActiveTab("recent") }}
            className={`flex items-center gap-2 md:gap-3.5 px-3.5 md:px-4 py-2.5 md:py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${activeTab === 'recent' ? "bg-white/10 text-white shadow-xs" : "hover:bg-white/5 hover:text-white"
              }`}
          >
            <BarChart3 className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <span>Recent Businesses</span>
          </button>

          <button
            onClick={() => { navigate("/admin-dashBoard/premium-list"), setActiveTab("premium") }}
            className={`flex items-center gap-2 md:gap-3.5 px-3.5 md:px-4 py-2.5 md:py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${activeTab === 'premium' ? "bg-white/10 text-white shadow-xs" : "hover:bg-white/5 hover:text-white"
              }`}
          >
            <PresentationIcon className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <span>Premium List</span>
          </button>

          <button
            onClick={() => { navigate("/admin-dashBoard/renewal-list"), setActiveTab("renewal") }}
            className={`flex items-center gap-2 md:gap-3.5 px-3.5 md:px-4 py-2.5 md:py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${activeTab === 'renewal' ? "bg-white/10 text-white shadow-xs" : "hover:bg-white/5 hover:text-white"
              }`}
          >
            <DiamondPlus className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <span>Renewal List</span>
          </button>

          <button
            onClick={() => { navigate("/admin-dashBoard/other"), setActiveTab("others") }}
            className={`flex items-center gap-2 md:gap-3.5 px-3.5 md:px-4 py-2.5 md:py-3 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${activeTab === 'others' ? "bg-white/10 text-white shadow-xs" : "hover:bg-white/5 hover:text-white"
              }`}
          >
            <Settings className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <span>Others</span>
          </button>

        </nav>
      </div>

      {/* Quick Action Buttons in Sidebar (Desktop View) */}
      <div className="hidden md:block space-y-2 pt-4 border-t border-[#2A473C] mt-4">
        <button
          onClick={() => { setModalType?.('business'); setIsModalOpen?.(true); }}
          className="w-full bg-[#D4AF37] text-[#1A2E26] px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#c29d30] transition-colors cursor-pointer shadow-md"
        >
          <PlusCircle className="w-4 h-4" /> Add Business
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => { setModalType?.('category'); setIsModalOpen?.(true); }}
            className="bg-[#2A473C] text-white px-3 py-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 hover:bg-[#335649] transition-colors cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5 text-[#D4AF37]" /> Category
          </button>
          <button
            onClick={() => { setModalType?.('location'); setIsModalOpen?.(true); }}
            className="bg-[#2A473C] text-white px-3 py-2 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1 hover:bg-[#335649] transition-colors cursor-pointer"
          >
            <MapPinPlus className="w-3.5 h-3.5 text-[#D4AF37]" /> Location
          </button>
        </div>
      </div>
    </aside>
  )
}

export default AdminSlideBar;