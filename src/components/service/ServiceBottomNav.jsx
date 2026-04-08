import React from 'react';
import { ShoppingBag, BookOpen, MessageCircle, Phone } from 'lucide-react';

/**
 * 하단 내비게이션 바
 * 홈 / 상품 / 블로그 / 채팅상담 / 전화문의
 * 활성 탭: 아이콘 fill + 굵은 텍스트 (다크모드 효과)
 */

const navItems = [
  { id: 'product', label: '상품', icon: ShoppingBag },
  { id: 'blog', label: '블로그', icon: BookOpen },
  { id: 'chat', label: '채팅상담', icon: MessageCircle },
  { id: 'phone', label: '전화문의', icon: Phone },
];

export default function ServiceBottomNav({ activeNav = 'product', onNavChange }) {
  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-neutral-200 z-50">
      <div className="flex items-center justify-around py-2 pb-[env(safe-area-inset-bottom,8px)]">
        {navItems.map((item) => {
          const isActive = activeNav === item.id;
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavChange?.(item.id)}
              className="flex flex-col items-center gap-1 min-w-[48px] py-1 transition-all duration-200"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                isActive ? 'bg-neutral-900' : ''
              }`}>
                <IconComponent
                  size={20}
                  strokeWidth={isActive ? 2 : 1.5}
                  fill={isActive ? 'white' : 'none'}
                  className={isActive ? 'text-white' : 'text-neutral-400'}
                />
              </div>
              <span
                className={`text-[10px] transition-all duration-200 ${
                  isActive ? 'text-neutral-900 font-bold' : 'text-neutral-400 font-medium'
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
