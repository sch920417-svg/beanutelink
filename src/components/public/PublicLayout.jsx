import React, { useState } from 'react';
import BottomNav from './BottomNav';
import KakaoChannelModal from './KakaoChannelModal';

export default function PublicLayout({ children, products = [] }) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <div className="pb-[72px]">
        {children}
      </div>
      <BottomNav onChatPress={() => setIsChatOpen(true)} />
      <KakaoChannelModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        products={products}
      />
    </>
  );
}
