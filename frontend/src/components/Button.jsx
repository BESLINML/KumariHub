import React from 'react'

const Button = ({ onclick }) => {
  return (
    <button onClick={onclick} className="bg-linear-to-r from-[#E6C594] to-[#DBA55C] text-[#1C1813] font-semibold text-[7px] md:text-sm px-2 lg:px-8 py-2 lg:py-3.5 rounded-full shadow-[0_0_25px_rgba(219,165,92,0.3)] hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer md:w-40 lg:w-70">
      <span className="hidden bg-[#1C1813] text-[#DBA55C] rounded-full md:w-5 md:h-5 lex items-center justify-center md:text-xs font-bold">+</span>
      List Your Business
    </button>
  )
}

export default Button