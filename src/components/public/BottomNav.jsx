import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Camera, FileText, MessageCircle, Phone } from 'lucide-react';

const navItems = [
  { id: 'home', label: '홈', icon: Home, path: '/', exact: true },
  { id: 'service', label: '상품', icon: Camera, path: '/service' },
  { id: 'blogs', label: '블로그', icon: FileText, path: '/blogs' },
  { id: 'chat', label: '채팅문의', icon: MessageCircle, path: null },
  { id: 'contact', label: '전화문의', icon: Phone, path: '/contact' },
];

export default function BottomNav({ onChatPress }) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (item) => {
    if (item.id === 'chat') return false;
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  const handlePress = (item) => {
    if (item.id === 'chat') {
      onChatPress?.();
      return;
    }
    navigate(item.path);
  };

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-neutral-200 z-50">
      <div className="flex items-center justify-around py-2 pb-[env(safe-area-inset-bottom,8px)]">
        {navItems.map((item) => {
          const active = isActive(item);
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => handlePress(item)}
              className="flex flex-col items-center gap-1 min-w-[48px] py-1 transition-colors"
            >
              <IconComponent
                size={22}
                strokeWidth={active ? 2.5 : 1.5}
                className={active ? 'text-black' : 'text-neutral-400'}
              />
              <span
                className={`text-[10px] font-medium ${
                  active ? 'text-black' : 'text-neutral-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
