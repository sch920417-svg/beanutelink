import React from 'react';
import { Icons } from '../../data/links';

const Icon = ({ name, size = 24, className = "" }) => {
    const Comp = Icons[name] || Icons.HelpCircle;
    return Comp ? <Comp size={size} className={className} /> : null;
};

export function MobilePreviewDrawer({ isOpen, onClose, currentProductId, hideBackdrop = false }) {
    if (!isOpen) return null;

    // Ensure currentProductId is a valid product ID (1, 2, or 3), otherwise default to service view
    const isValidId = ['1', '2', '3'].includes(String(currentProductId));
    const previewUrl = isValidId ? `/detail/${currentProductId}` : "/service";

    return (
        <div className={`fixed top-0 right-0 bottom-0 z-[100] flex justify-end ${hideBackdrop ? 'pointer-events-none w-[400px]' : 'inset-0'}`}>
            {!hideBackdrop && <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity pointer-events-auto" onClick={onClose}></div>}
            <div className="relative w-[400px] bg-neutral-900 border-l border-neutral-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right-8 z-50 pointer-events-auto">
                <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-neutral-900 z-10 shrink-0">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Icon name="Smartphone" size={20} className="text-lime-400" /> Live Preview
                    </h3>
                    <button onClick={onClose} className="p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white rounded-lg transition-colors">
                        <Icon name="X" size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto flex items-center justify-center p-4 bg-neutral-950/50 custom-scrollbar">
                    <div className="w-[393px] h-[852px] bg-white rounded-[3rem] border-[14px] border-neutral-800 shadow-2xl overflow-hidden relative font-sans text-neutral-900 flex flex-col ring-1 ring-neutral-700 shrink-0 scale-[0.85] origin-center">

                        {/* Dynamic Island / Notch Overlay - pointer events none so you can click under it if needed */}
                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[120px] h-[35px] bg-black rounded-full z-50 pointer-events-none"></div>

                        {/* iOS Status Bar Overlay */}
                        <div className="absolute top-0 inset-x-0 h-12 w-full flex justify-between items-end px-8 pb-2 text-[12px] font-bold text-neutral-900 z-40 pointer-events-none mix-blend-difference text-white">
                            <span>12:00</span>
                            <div className="flex gap-1.5 items-center mb-0.5">
                                <div className="w-4 h-3 rounded-full bg-white"></div>
                                <div className="w-5 h-2.5 bg-white rounded-sm"></div>
                            </div>
                        </div>

                        {/* LIVE IFRAME */}
                        <iframe
                            src={previewUrl}
                            className="w-full h-full border-0 absolute inset-0 z-10 bg-[#f8f9fa]"
                            title="Live Preview"
                        />

                        {/* Home Indicator Overlay */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-1/3 h-1.5 bg-neutral-900/40 rounded-full z-50 pointer-events-none"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
