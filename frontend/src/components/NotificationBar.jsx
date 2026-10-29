import React from 'react';

export default function NotificationBar({ isOpen, title, message, type = 'success', onClose }) {
  if (!isOpen) return null;
console.log("notification ")
  const isSuccess = type === 'success';

  return (
    <div className="fixed inset-0 z-50 flex justify-center backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl mt-10 p-6 w-96 shadow-2xl transform transition-all text-left scale-100 h-max">
        <div>
            <h3 className={`text-lg font-bold mb-1 uppercase ${isSuccess?"text-emerald-600":"text-red-600"}`}>{title}</h3>
            <p className="text-sm text-gray-600">{message}</p>
        </div>

        <div className=" text-right">
            <button
          onClick={onClose}
          className={`w-max h-max text-xs py-1 px-4 rounded-xl hover:text-white font-medium transition-all ${
            isSuccess ?  'border border-emerald-600 text-emerald-600 hover:bg-emerald-700' : 'border text-red-600 border-red-600 hover:bg-red-700'
          }`}
        >
          OK
        </button>
        </div>

      </div>
    </div>
  );
}