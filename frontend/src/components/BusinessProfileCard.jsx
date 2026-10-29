import React from 'react'

const BusinessProfileCard = ({ businessName, location, category, buttonOnClick, businessIMG, businessStatus, createdAt, renewalat }) => {
    return (
        <div
            className={`lg:flex-row lg:items-center justify-between p-3 bg-[#EAEFEA]/50 rounded-2xl border border-gray-300 gap-3 ${createdAt || renewalat ? "flex flex-col" : "flex"} ${buttonOnClick ? "cursor-pointer hover:bg-[#EAEFEA] hover:border-emerald-400 transition-colors" : ""}`}
            onClick={buttonOnClick}
            onKeyDown={buttonOnClick ? (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    buttonOnClick();
                }
            } : undefined}
            role={buttonOnClick ? "button" : undefined}
            tabIndex={buttonOnClick ? 0 : undefined}
        >


            <div className="flex items-center gap-3 min-w-0 flex-1">
                {businessIMG ? (
                    <img
                        src={businessIMG}
                        alt={businessName || "Business"}
                        className="w-10 h-10 sm:w-8 sm:h-8 rounded-xl object-cover shrink-0 shadow-2xs"
                    />
                ) : ("")}

                <div className="min-w-0 flex-1">
                    <h4 className="text-xs  font-bold text-[#1A2E26] truncate">{businessName}</h4>
                    {location || category ?(
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate flex flex-col md:flex-row md:items-center md:gap-1">{location} <span className="text-black font-bold text-base hidden md:block">•</span> <span>{category}</span></p>
                    ):""}
                    </div>
            </div>


            <div className="flex items-center justify-between gap-5 shrink-0 ">

                {createdAt || renewalat ?(
                    <div className="flex flex-col md:flex-row gap-2 md:gap-5 ">
                        <p className="text-[10px] sm:text-xs font-semibold text-gray-600 sm:inline-block bg-white px-2 py-0.5 rounded-md border border-gray-200">Paid on: {createdAt && new Date(createdAt).toLocaleDateString()}</p>
                        <p className="text-[10px] sm:text-xs font-semibold text-gray-600 sm:inline-block bg-white px-2 py-0.5 rounded-md border border-gray-200">Renewal on: {renewalat && new Date(renewalat).toLocaleDateString()}</p>
                    </div>
                ):""}

                <div className="flex flex-col md:flex-row gap-2 md:gap-5">
                    {businessStatus && (
                        <span className="text-[10px] text-center sm:text-xs font-semibold text-gray-600 sm:inline-block bg-white px-2 py-0.5 rounded-md border border-gray-200">
                          {businessStatus}
                      </span>
                    )}

                   <span
                      aria-hidden="true"
                      className="text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-0.5 rounded-full border border-transparent hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200 transition-all duration-150 shadow-2xs"
                    >
                      View
                    </span>
                </div>

            </div>
        </div>
    )
}

export default BusinessProfileCard
