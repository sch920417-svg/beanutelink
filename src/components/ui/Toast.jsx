import React from 'react';

export function Toast({ message, isVisible, type = 'success' }) {
    if (!isVisible) return null;

    const iconMap = {
        success: (
            <div className="w-6 h-6 rounded-full bg-lime-400 text-neutral-950 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
        ),
        loading: (
            <div className="w-6 h-6 rounded-full border-2 border-lime-400 border-t-transparent animate-spin shrink-0" />
        ),
        error: (
            <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
        ),
    };

    return (
        <div className="fixed bottom-6 right-6 z-[200] flex items-center gap-3 bg-neutral-800 text-white px-5 py-3 rounded-xl shadow-2xl border border-neutral-700 fade-in slide-in-from-bottom-4">
            {iconMap[type] || iconMap.success}
            <span className="text-sm font-medium">{message}</span>
        </div>
    );
}
