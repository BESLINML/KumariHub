import { LucideLollipop, MapPin, Phone, Star, Store, Tag, Timer } from 'lucide-react'
import React from 'react'
import whatsapp from "../assets/svg/whatsapp.svg"

const BusinessCard = ({
    img,
    categories,
    location,
    bussinessName,
    address,
    openTime,
    avgReview,
    reviewCount,
    onclick,
    phone,
    whatsappNumber,
    locationLink
}) => {
    const rating = Math.round(avgReview || 0);


    let isClosedNow = false;
    let open = "N/A";
    let close = "N/A";

    if (openTime && typeof openTime === 'object') {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const todayName = days[new Date().getDay()];
        const todayTiming = openTime[todayName];

        if (todayTiming) {
            const { closed, open: openStr, close: closeStr } = todayTiming;
            open = openStr || "N/A";
            close = closeStr || "N/A";

            if (closed) {
                isClosedNow = true;
            } else if (open && close) {
                const parseTimeToMinutes = (timeStr) => {
                    if (!timeStr) return 0;
                    const cleanStr = timeStr.toLowerCase().replace(':', '.');
                    const parts = cleanStr.split(' ');
                    const timePart = parts[0];
                    const modifier = parts[1];

                    let [hours, minutes] = timePart.split('.').map(Number);
                    if (modifier === 'pm' && hours < 12) hours += 12;
                    if (modifier === 'am' && hours === 12) hours = 0;

                    return hours * 60 + (minutes || 0);
                };

                const now = new Date();
                const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
                const openingTimeInMinutes = parseTimeToMinutes(open);
                const closingTimeInMinutes = parseTimeToMinutes(close);

                const isBeforeOpening = currentTimeInMinutes < openingTimeInMinutes;
                const isAfterClosing = currentTimeInMinutes > closingTimeInMinutes;

                isClosedNow = isBeforeOpening || isAfterClosing;
            }
        }
    }

    return (
        <section className="">
            <div className="bg-white rounded-4xl shadow-sm border border-gray-100 overflow-hidden hover:-translate-y-2 hover:border-[#DBA55C] hover:shadow-2xl duration-500 transition-all">

                {/* Image & Tags Section */}
                <div className="relative h-40 overflow-hidden">
                    <img
                        src={img || "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=400"}
                        alt={bussinessName || "Business Image"}
                        className="rounded-t-4xl w-full h-full object-cover object-center"
                    />
                    <p className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-[#424345] text-[#F5E1B0] text-xs font-medium rounded-full px-2.5 py-0.5 shadow-md">
                        <Tag className="w-3.5 h-3.5 text-[#F5E1B0] shrink-0" />
                        <span className="truncate max-w-30">{categories}</span>
                    </p>
                    <p className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-[#1C1813] text-[#DBA55C] text-xs font-medium rounded-full px-2.5 py-0.5 shadow-md">
                        <LucideLollipop className="w-3.5 h-3.5 text-[#F5E1B0] shrink-0" />
                        <span className="truncate max-w-25 text-[#F5E1B0]">{location}</span>
                    </p>
                </div>

                {/* Content Section */}
                <div className="p-4 sm:p-5 space-y-3">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Store className="w-5 h-5 text-[#DBA55C] shrink-0" />
                            <button
                                onClick={onclick}
                                className="text-lg font-[650] text-gray-800 hover:text-[#DBA55C] cursor-pointer text-left truncate "
                            >
                                {bussinessName}
                            </button>
                        </div>

                        <div className="flex items-center gap-1.5 mt-1">
                            <MapPin className="w-4 h-4 text-[#1C1813] shrink-0" />
                            <p className="text-[#442b0f] font-medium text-xs sm:text-sm truncate">{address}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 ps-1 mt-2">
                            <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${isClosedNow ? 'bg-red-600' : 'bg-green-700'}`}></div>
                                <p className="text-xs font-medium text-gray-700">{isClosedNow ? 'Closed' : 'Open'}</p>
                            </div>

                            <div className="flex items-center gap-1 text-gray-500">
                                <Timer className="w-3.5 h-3.5 shrink-0" />
                                <p className="text-xs font-medium">{open} - {close}</p>
                            </div>
                        </div>
                    </div>

                    {/* Ratings Section */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className="w-3.5 h-3.5 shrink-0"
                                    fill={star <= rating ? "#DBA55C" : "none"}
                                    stroke="#DBA55C"
                                />
                            ))}
                        </div>
                        <p className="text-sm font-bold text-gray-800">{avgReview || '0.0'}</p>
                        <p className="text-xs text-gray-500">({reviewCount || 0} reviews)</p>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-2 border-t border-gray-200">

                        <a
                            href={`tel:${phone}`}
                            className="flex items-center justify-center gap-1 text-[11px] sm:text-xs font-medium border border-green-300 text-green-700 bg-green-50 hover:bg-green-100 rounded-full transition py-1.5 px-1 truncate shadow-2xs"
                        >
                            <Phone className="w-3 h-3 shrink-0" fill="#166534" /> Call
                        </a>

                        {whatsappNumber ? (
                            <a
                                href={`https://wa.me/${whatsappNumber}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-1 text-[11px] sm:text-xs font-medium border border-sky-300 text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-full transition py-1.5 px-1 truncate shadow-2xs"
                            >
                                <img src={whatsapp} className="w-3 h-3 shrink-0" alt="whatsapp" />WhatsApp
                            </a>
                        ) : (
                            <button disabled className="flex items-center justify-center gap-1 text-[11px] sm:text-xs font-medium border border-gray-200 text-gray-400 bg-gray-50 rounded-full py-1.5 px-1 cursor-not-allowed">
                                WA
                            </button>
                        )}

                        {locationLink ? (
                            <a
                                href={locationLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-1 text-[11px] sm:text-xs font-medium border border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 rounded-full transition py-1.5 px-1 truncate shadow-2xs"
                            >
                                <MapPin className="w-3 h-3 text-yellow-700 shrink-0" /> Map
                            </a>
                        ) : (
                            <button disabled className="flex items-center justify-center gap-1 text-[11px] sm:text-xs font-medium border border-gray-200 text-gray-400 bg-gray-50 rounded-full py-1.5 px-1 cursor-not-allowed">
                                Map
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </section>
    )
}

export default BusinessCard