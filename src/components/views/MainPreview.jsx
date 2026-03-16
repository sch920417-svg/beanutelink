import React from 'react';
import { Icons } from '../../data/links';

const Icon = ({ name, size = 24, className = "" }) => {
    const Comp = Icons[name] || Icons.HelpCircle;
    return Comp ? <Comp size={size} className={className} /> : null;
};

export function MainPreview({ products, settings }) {
    return (
        <div className="flex justify-center slide-in-from-bottom-4 pb-10">
            <div className="w-[430px] h-[932px] bg-[#f8f9fa] rounded-[3.5rem] border-[16px] border-neutral-800 shadow-2xl overflow-hidden relative font-sans text-neutral-900 flex flex-col ring-1 ring-neutral-700 scale-95 origin-top">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[125px] h-[37px] bg-black rounded-full z-30"></div>
                <div className="h-14 w-full bg-[#f8f9fa] flex justify-between items-end px-8 pb-3 text-[14px] font-bold text-neutral-800 sticky top-0 z-20">
                    <span>12:00</span>
                    <div className="flex gap-1.5 items-center mb-0.5">
                        <div className="w-4 h-3.5 rounded-full bg-neutral-300"></div>
                        <div className="w-5 h-3 bg-neutral-800 rounded-sm"></div>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden relative">
                    <iframe
                        src="/service"
                        className="w-full h-full border-0 absolute inset-0 bg-white"
                        title="Main Preview"
                    />
                </div>
                <div className="absolute bottom-6 right-6 w-16 h-16 bg-neutral-900 text-white rounded-full flex items-center justify-center shadow-lg shadow-neutral-900/20 cursor-pointer animate-pulse-slow z-30">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                </div>
            </div>
        </div>
    );
}
