import React from 'react'

const BusinessProfileCard = ({ businessName, dis, buttonOnClick, businessIMG, businessStatus }) => {
    return (
        <div className="flex items-center justify-between p-3 bg-[#EAEFEA]/50 rounded-2xl border border-gray-300 gap-3">

            {/* Left Side: Image & Business Details */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
                {businessIMG ? (
                    <img
                        src={businessIMG}
                        alt={businessName || "Business"}
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover shrink-0 shadow-2xs"
                    />
                ) : ("")}

                <div className="min-w-0 flex-1">
                    <h4 className="text-xs sm:text-sm font-bold text-[#1A2E26] truncate">{businessName}</h4>
                    <p className="text-[10px] sm:text-xs text-gray-500 truncate">{dis}</p>
                </div>
            </div>

            {/* Right Side: Status & View Button */}
            <div className="flex items-center gap-2 shrink-0">
                {businessStatus && (
                    <span className="text-[10px] sm:text-xs font-semibold text-gray-600 hidden sm:inline-block bg-white px-2 py-0.5 rounded-md border border-gray-200">
                        {businessStatus}
                    </span>
                )}

                <button
                    onClick={buttonOnClick}
                    className="text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full border border-transparent cursor-pointer hover:text-amber-600 hover:bg-amber-50 hover:border-amber-200 transition-all duration-150 shadow-2xs"
                >
                    View
                </button>
            </div>
        </div>
    )
}

export default BusinessProfileCard