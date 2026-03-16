import React, { useState } from 'react';
import { Icons } from '../../data/links';
import { uploadCompressed } from '../../services/storage';

const Icon = ({ name, size = 24, className = "" }) => {
    const Comp = Icons[name] || Icons.HelpCircle;
    return Comp ? <Comp size={size} className={className} /> : null;
};

const TABS = [
    { id: 'brand', label: '브랜드', icon: 'Palette' },
    { id: 'chat', label: '채팅 설정', icon: 'MessageCircle' },
    { id: 'phone', label: '전화 설정', icon: 'Phone' },
];

export function SettingsView({ settings, setSettings, showToast, pageConfigs = {} }) {
    const [activeTab, setActiveTab] = useState('brand');

    // pageConfigs에서 상품 탭 목록 파생
    const productTabs = Object.entries(pageConfigs)
        .map(([id, cfg]) => ({
            id,
            label: cfg?.header?.tabLabel || cfg?.meta?.label || id,
            icon: cfg?.meta?.icon || '📦',
            order: cfg?.meta?.order ?? 0,
        }))
        .sort((a, b) => a.order - b.order);

    const handleSave = () => {
        showToast('환경 설정 내역이 안전하게 저장되었습니다.');
    };

    const handleProfileUpload = async (e) => {
        if (e.target.files && e.target.files[0]) {
            showToast('프로필 사진 최적화 중...');
            const url = await uploadCompressed(e.target.files[0], 'settings');
            setSettings({ ...settings, profileImage: url });
            showToast('새로운 프로필이 고화질로 적용되었습니다.');
        }
    };

    return (
        <div className="space-y-6 slide-in-from-bottom-4 max-w-4xl">
            {/* 탭 네비게이션 */}
            <div className="flex gap-2 bg-neutral-900 p-2 rounded-2xl border border-neutral-800">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                            activeTab === tab.id
                                ? 'bg-lime-400 text-neutral-900'
                                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                        }`}
                    >
                        <Icon name={tab.icon} size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* 브랜드 탭 */}
            {activeTab === 'brand' && (
                <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8">
                    <h3 className="text-xl font-bold text-white mb-6 border-b border-neutral-800 pb-4">Brand Identity</h3>
                    <div className="space-y-6">
                        <div className="flex items-center gap-6">
                            <label htmlFor="profile-upload" className="w-24 h-24 rounded-full bg-neutral-950 border border-neutral-700 flex items-center justify-center shrink-0 text-neutral-500 hover:border-lime-400 transition-all cursor-pointer overflow-hidden group relative">
                                {settings.profileImage ? (
                                    <img src={settings.profileImage} className="w-full h-full object-cover" alt="Profile" />
                                ) : (
                                    <Icon name="Image" size={24} />
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><span className="text-[10px] text-white font-bold">변경</span></div>
                            </label>
                            <input type="file" id="profile-upload" accept="image/*" className="hidden" onChange={handleProfileUpload} />

                            <div className="flex-1 space-y-2">
                                <label className="text-xs font-bold text-neutral-400 uppercase">스튜디오 프로필 이미지</label>
                                <p className="text-sm text-neutral-500 mb-2">권장 크기: 500x500px 이상 (자동 최적화 및 썸네일 변환 지원)</p>
                                <button onClick={() => document.getElementById('profile-upload').click()} className="bg-neutral-800 text-white px-4 py-2 rounded-lg text-sm font-medium border border-neutral-700 hover:bg-neutral-700">이미지 업로드</button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-400 uppercase">브랜드 / 스튜디오명</label>
                            <input type="text" value={settings.brandName} onChange={(e) => setSettings({ ...settings, brandName: e.target.value })} className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-white focus:border-lime-400 outline-none transition-colors" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-400 uppercase">브랜드 인사말</label>
                            <textarea rows="2" value={settings.greeting} onChange={(e) => setSettings({ ...settings, greeting: e.target.value })} className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-white focus:border-lime-400 outline-none transition-colors resize-none"></textarea>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-neutral-950 border border-neutral-800 rounded-xl">
                            <div>
                                <div className="text-white font-medium mb-1">인스타그램 연동 노출</div>
                                <div className="text-sm text-neutral-500">각 상품 상세 페이지 하단에 인스타그램 링크를 표시합니다.</div>
                            </div>
                            <div className="w-12 h-6 bg-lime-500 rounded-full relative cursor-pointer shadow-inner shadow-lime-700/50">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 채팅 설정 탭 */}
            {activeTab === 'chat' && (
                <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8">
                    <h3 className="text-xl font-bold text-white mb-6 border-b border-neutral-800 pb-4 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-yellow-400 flex items-center justify-center">
                            <Icon name="MessageCircle" size={16} className="text-white" />
                        </div>
                        카카오톡 채팅 상담 설정
                    </h3>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-400 uppercase">대표 카카오톡 채널 URL</label>
                            <p className="text-sm text-neutral-500 mb-2">모든 상품에 공통 적용되는 기본 URL입니다. 상품별 URL이 없으면 이 URL이 사용됩니다.</p>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={settings.kakaoUrl}
                                    onChange={(e) => setSettings({ ...settings, kakaoUrl: e.target.value })}
                                    placeholder="https://pf.kakao.com/..."
                                    className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-white focus:border-lime-400 outline-none transition-colors"
                                />
                                <button
                                    onClick={() => settings.kakaoUrl ? window.open(settings.kakaoUrl, '_blank') : showToast('URL을 입력해주세요.')}
                                    className="bg-neutral-800 hover:bg-neutral-700 text-white px-6 rounded-xl text-sm font-bold border border-neutral-700 shrink-0 transition-colors"
                                >연결확인</button>
                            </div>
                        </div>

                        {/* 상품별 카카오 URL */}
                        {productTabs.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-neutral-400 uppercase">상품별 카카오톡 채널 URL</label>
                                <p className="text-sm text-neutral-500 mb-2">각 상품마다 다른 카카오톡 채널로 연결하려면 개별 URL을 입력하세요.</p>
                                <div className="space-y-3">
                                    {productTabs.map((tab) => (
                                        <div key={tab.id} className="flex gap-3 items-center">
                                            <div className="flex items-center gap-2 w-28 shrink-0">
                                                <span className="text-lg">{tab.icon}</span>
                                                <span className="text-sm font-medium text-neutral-300 truncate">{tab.label}</span>
                                            </div>
                                            <input
                                                type="text"
                                                value={(settings.kakaoUrls || {})[tab.id] || ''}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    kakaoUrls: { ...(settings.kakaoUrls || {}), [tab.id]: e.target.value }
                                                })}
                                                placeholder={settings.kakaoUrl || 'https://pf.kakao.com/...'}
                                                className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-white text-sm focus:border-lime-400 outline-none transition-colors"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-400 uppercase">채팅 상담 안내 문구</label>
                            <p className="text-sm text-neutral-500 mb-2">하단 네비게이션의 채팅상담 클릭 시 표시되는 안내 메시지입니다.</p>
                            <input
                                type="text"
                                value={settings.chatGreeting || ''}
                                onChange={(e) => setSettings({ ...settings, chatGreeting: e.target.value })}
                                placeholder="상품을 선택하면 카카오톡 채팅 상담으로 연결됩니다."
                                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-white focus:border-lime-400 outline-none transition-colors"
                            />
                        </div>

                        {/* 미리보기 */}
                        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5">
                            <div className="text-xs font-bold text-neutral-500 uppercase mb-3">미리보기</div>
                            <div className="bg-white rounded-2xl p-4 max-w-[280px] mx-auto">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
                                        <Icon name="MessageCircle" size={14} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[13px] text-neutral-900">카카오톡 채팅 상담</p>
                                        <p className="text-[11px] text-neutral-500">{settings.chatGreeting || '상품을 선택해주세요'}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {productTabs.length > 0 ? productTabs.map((tab) => (
                                        <div key={tab.id} className="bg-neutral-50 rounded-xl p-3 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm">{tab.icon}</span>
                                                <span className="text-[12px] font-medium text-neutral-600">{tab.label}</span>
                                            </div>
                                            <Icon name="ExternalLink" size={12} className="text-neutral-400" />
                                        </div>
                                    )) : (
                                        <>
                                            <div className="bg-neutral-50 rounded-xl p-3 flex items-center justify-between">
                                                <span className="text-[12px] font-medium text-neutral-600">가족사진</span>
                                                <Icon name="ExternalLink" size={12} className="text-neutral-400" />
                                            </div>
                                            <div className="bg-neutral-50 rounded-xl p-3 flex items-center justify-between">
                                                <span className="text-[12px] font-medium text-neutral-600">프로필</span>
                                                <Icon name="ExternalLink" size={12} className="text-neutral-400" />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 전화 설정 탭 */}
            {activeTab === 'phone' && (
                <section className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8">
                    <h3 className="text-xl font-bold text-white mb-6 border-b border-neutral-800 pb-4 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                            <Icon name="Phone" size={16} className="text-white" />
                        </div>
                        전화 문의 설정
                    </h3>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-400 uppercase">대표 상담 전화번호</label>
                            <p className="text-sm text-neutral-500 mb-2">고객이 전화 문의 버튼을 누르면 이 번호로 연결됩니다.</p>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={settings.phone}
                                    onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                    placeholder="010-0000-0000"
                                    className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-white focus:border-lime-400 outline-none transition-colors"
                                />
                                <button
                                    onClick={() => settings.phone ? window.open(`tel:${settings.phone}`, '_self') : showToast('전화번호를 입력해주세요.')}
                                    className="bg-neutral-800 hover:bg-neutral-700 text-white px-6 rounded-xl text-sm font-bold border border-neutral-700 shrink-0 transition-colors"
                                >연결확인</button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-400 uppercase">운영시간 안내</label>
                            <p className="text-sm text-neutral-500 mb-2">전화 문의 팝업에 표시되는 운영시간입니다.</p>
                            <textarea
                                rows="3"
                                value={settings.businessHours || ''}
                                onChange={(e) => setSettings({ ...settings, businessHours: e.target.value })}
                                placeholder="평일 10:00 - 18:00&#10;주말/공휴일 휴무"
                                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-white focus:border-lime-400 outline-none transition-colors resize-none"
                            ></textarea>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-400 uppercase">전화 안내 메시지</label>
                            <p className="text-sm text-neutral-500 mb-2">전화 연결 전 고객에게 표시되는 안내 문구입니다.</p>
                            <input
                                type="text"
                                value={settings.phoneGuideMessage || ''}
                                onChange={(e) => setSettings({ ...settings, phoneGuideMessage: e.target.value })}
                                placeholder="전화 상담은 운영시간 내에 가능합니다."
                                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-white focus:border-lime-400 outline-none transition-colors"
                            />
                        </div>

                        {/* 미리보기 */}
                        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5">
                            <div className="text-xs font-bold text-neutral-500 uppercase mb-3">미리보기</div>
                            <div className="bg-white rounded-2xl p-4 max-w-[280px] mx-auto">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                        <Icon name="Phone" size={14} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-[13px] text-neutral-900">전화 문의</p>
                                        <p className="text-[11px] text-neutral-500">{settings.brandName || '스튜디오'} 대표번호</p>
                                    </div>
                                </div>
                                <div className="bg-neutral-50 rounded-xl p-4 text-center mb-3">
                                    <p className="text-[11px] text-neutral-500 mb-1">대표 상담 전화번호</p>
                                    <p className="text-[18px] font-bold text-neutral-900">{settings.phone || '전화번호 미등록'}</p>
                                </div>
                                {settings.businessHours && (
                                    <div className="bg-blue-50 rounded-xl p-3 flex items-start gap-2 mb-3">
                                        <Icon name="Clock" size={14} className="text-blue-500 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-[11px] font-bold text-blue-900 mb-0.5">운영시간</p>
                                            <p className="text-[11px] text-blue-700 whitespace-pre-line">{settings.businessHours}</p>
                                        </div>
                                    </div>
                                )}
                                <div className="bg-blue-500 text-white rounded-xl p-2.5 text-center text-[12px] font-bold">
                                    전화 연결하기
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* 저장 버튼 */}
            <div className="flex justify-end">
                <button onClick={handleSave} className="bg-lime-400 text-neutral-950 px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-lime-500 transition-colors shadow-lg shadow-lime-400/10">
                    설정 저장하기
                </button>
            </div>
        </div>
    );
}
