import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, User, Dumbbell, IdCard } from 'lucide-react';
import { setVisitPurpose } from '../../utils/analytics';

const TAB_ICONS = {
  family: Camera,
  profile: User,
  pilates: Dumbbell,
  'id-photo': IdCard,
};

const TAB_COLORS = {
  family: 'bg-amber-50 text-amber-600 border-amber-200',
  profile: 'bg-blue-50 text-blue-600 border-blue-200',
  pilates: 'bg-green-50 text-green-600 border-green-200',
  'id-photo': 'bg-purple-50 text-purple-600 border-purple-200',
};

export default function VisitPurposeModal({ isOpen, tabs = [], onSelect }) {
  if (!isOpen || tabs.length === 0) return null;

  const handleSelect = (tab) => {
    setVisitPurpose(tab.id, tab.label);
    onSelect(tab.id);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9998] bg-white flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[430px] px-8 py-12"
          >
            <div className="text-center mb-10">
              <h2 className="text-[22px] font-extrabold text-neutral-900 tracking-tight mb-2">
                어떤 촬영을 원하시나요?
              </h2>
              <p className="text-[13px] text-neutral-500">
                원하시는 촬영 종류를 선택해주세요
              </p>
            </div>

            <div className="space-y-3">
              {tabs.map((tab, index) => {
                const Icon = TAB_ICONS[tab.id] || Camera;
                const colorClass = TAB_COLORS[tab.id] || 'bg-neutral-50 text-neutral-600 border-neutral-200';

                return (
                  <motion.button
                    key={tab.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + index * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    onClick={() => handleSelect(tab)}
                    className="w-full flex items-center gap-4 p-5 bg-white border border-neutral-200 rounded-2xl hover:border-neutral-400 active:scale-[0.98] transition-all"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${colorClass}`}>
                      <Icon size={22} />
                    </div>
                    <span className="font-bold text-[16px] text-neutral-900">{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
