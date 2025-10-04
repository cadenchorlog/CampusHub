import React from 'react';

export default function Loader({ label = "Loading..." }) {
  return (
    <div className="inline-flex items-center gap-3">
      <div className="w-6 h-6 rounded-full border-2 border-gray-300 border-t-[#0A84FF] animate-spin" />
      <span className="text-gray-700 font-medium select-none">{label}</span>
    </div>
  );
}
