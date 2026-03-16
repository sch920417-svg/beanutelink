import React from 'react';
import { Icons } from '../../data/links';
import { uploadCompressed } from '../../services/storage';

const Icon = ({ name, size = 24, className = "" }) => {
  const Comp = Icons[name] || Icons.HelpCircle;
  return Comp ? <Comp size={size} className={className} /> : null;
};

export function SplashHeaderSection({ config, updateConfig, showToast }) {
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    showToast('로고 이미지 업로드 중...');
    const compressed = await uploadCompressed(file, 'splash');
    updateConfig('splash', { ...config.splash, logoImage: compressed });
  };

  return (
    <div className="space-y-5">
      {/* Logo */}
      <div>
        <label className="text-xs font-bold text-neutral-400 mb-2 block">로고 이미지</label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center overflow-hidden relative group">
            {config.splash.logoImage ? (
              <>
                <img src={config.splash.logoImage} className="w-full h-full object-contain p-2" alt="Logo" />
                <button
                  onClick={() => updateConfig('splash', { ...config.splash, logoImage: '' })}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <Icon name="Trash2" size={16} className="text-red-400" />
                </button>
              </>
            ) : (
              <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer text-neutral-500 hover:text-lime-400 transition-colors">
                <Icon name="ImagePlus" size={20} />
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </label>
            )}
          </div>
          <div className="flex-1">
            <label className="text-xs font-bold text-neutral-500 mb-1 block">또는 텍스트 로고</label>
            <input
              value={config.splash.logoText}
              onChange={(e) => updateConfig('splash', { ...config.splash, logoText: e.target.value })}
              className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-white font-bold text-sm outline-none focus:border-lime-500/50 transition-colors"
              placeholder="BEANUTE"
            />
          </div>
        </div>
      </div>

      {/* Tab Label */}
      <div>
        <label className="text-xs font-bold text-neutral-400 mb-2 block">탭 메뉴 이름</label>
        <input
          value={config.header.tabLabel}
          onChange={(e) => updateConfig('header', { ...config.header, tabLabel: e.target.value })}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-lime-500/50 transition-colors"
          placeholder="가족사진"
        />
        <p className="text-[11px] text-neutral-600 mt-1.5">고객용 페이지 상단 탭에 표시되는 이름입니다.</p>
      </div>
    </div>
  );
}
