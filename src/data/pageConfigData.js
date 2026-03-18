/**
 * 페이지 빌더 설정 데이터
 * 동적 탭/섹션 관리 시스템
 */

// 섹션 타입 레지스트리 (사용 가능한 모든 섹션 정의)
export const SECTION_REGISTRY = {
  splash:     { label: '스플래시 & 헤더', icon: '🎨', group: 'header' },
  hero:       { label: '히어로 슬라이더', icon: '🖼️', group: 'media' },
  video:      { label: '영상',           icon: '🎬', group: 'media' },
  gallery:    { label: '이미지 갤러리',   icon: '📷', group: 'media' },
  slideReview:{ label: '슬라이드 리뷰형', icon: '🎠', group: 'media' },
  guide:      { label: '촬영 가이드 카드', icon: '📋', group: 'guide' },
  quote:      { label: '동적 견적 계산기', icon: '🧮', group: 'segment-quote' },
  priceTable: { label: '가격표',          icon: '💰', group: 'segment-quote' },
  review:     { label: '리뷰',           icon: '⭐', group: 'segment-quote' },
  faq:        { label: 'FAQ',            icon: '❓', group: 'segment-quote' },
  framePrice: { label: '액자 가격표',    icon: '🖼️', group: 'segment-quote' },
  blog:       { label: '블로그 콘텐츠 연결', icon: '📝', group: 'segment-blog' },
  richText:   { label: '블로그 에디터',     icon: '✏️', group: 'content' },
};

// 한 페이지에 여러 개 추가 가능한 섹션 타입
export const MULTI_INSTANCE_TYPES = ['richText'];

// 섹션 그룹 정의
export const SECTION_GROUPS = [
  { id: 'header',        label: '헤더' },
  { id: 'media',         label: '사진/영상 섹션' },
  { id: 'guide',         label: '촬영 가이드 섹션' },
  { id: 'content',       label: '자유 콘텐츠' },
  { id: 'segment-quote', label: '세그먼트 · 견적 계산하기' },
  { id: 'segment-blog',  label: '세그먼트 · 블로그 보기' },
];

// 섹션 타입 → config 데이터 키 매핑
export const SECTION_DATA_KEY = {
  splash: 'splash',
  hero: 'heroImages',
  video: 'video',
  gallery: 'gallery',
  slideReview: 'slideReview',
  guide: 'guide',
  quote: 'quoteBuilder',
  priceTable: 'priceTable',
  review: 'reviews',
  faq: 'faq',
  blog: 'blogMapping',
  framePrice: 'framePrice',
  richText: 'richTextData',
};

// 배지 생성 함수 (섹션 타입별)
export const getSectionBadge = (type, config) => {
  switch (type) {
    case 'hero': return `${(config.heroImages || []).length}장`;
    case 'guide': return `${(config.guide?.cards || []).length}개`;
    case 'quote': return `상품 ${(config.quoteBuilder?.products || []).length}`;
    case 'review': return `${(config.reviews?.items || []).length}개`;
    case 'faq': return `${(config.faq?.items || []).length}개`;
    case 'video': return `${(config.video?.items || []).length}개`;
    case 'gallery': return `${(config.gallery?.images || []).length}장`;
    case 'slideReview': return `${(config.slideReview?.slides || []).length}개`;
    case 'richText': return null;
    default: return null;
  }
};

// 이모지 옵션 (탭 아이콘 선택용)
export const TAB_ICON_OPTIONS = [
  '📸', '👨‍👩‍👧‍👦', '🧘', '🪪', '💪', '👗', '🎓', '💍',
  '🐾', '👶', '🎨', '🏋️', '📦', '🌟', '🎭', '🎬',
];

const createDefaultSections = (tabId) => [
  { id: `${tabId}-sec-splash`,     type: 'splash',     enabled: true },
  { id: `${tabId}-sec-hero`,       type: 'hero',       enabled: true },
  { id: `${tabId}-sec-guide`,      type: 'guide',      enabled: true },
  { id: `${tabId}-sec-quote`,      type: 'quote',      enabled: true },
  { id: `${tabId}-sec-priceTable`, type: 'priceTable',  enabled: true },
  { id: `${tabId}-sec-review`,     type: 'review',     enabled: true },
  { id: `${tabId}-sec-faq`,        type: 'faq',        enabled: true },
  { id: `${tabId}-sec-blog`,       type: 'blog',       enabled: true },
];

export const createDefaultConfig = (tabLabel, tabId, order = 0, icon = '📦') => ({
  meta: { label: tabLabel, icon, order },

  sections: createDefaultSections(tabId),
  sectionGroupOrder: SECTION_GROUPS.map(g => g.id),

  // 섹션 데이터
  splash: { logoImage: '', logoText: 'BEANUTE' },
  header: { tabLabel },
  heroImages: [
    { id: `${tabId}-hero-1`, url: '', alt: `${tabLabel} 배너 1` },
    { id: `${tabId}-hero-2`, url: '', alt: `${tabLabel} 배너 2` },
    { id: `${tabId}-hero-3`, url: '', alt: `${tabLabel} 배너 3` },
  ],
  guide: { title: `${tabLabel} 촬영 가이드`, cards: [] },
  quoteBuilder: {
    products: [],
    additionalOptions: [],
    extraPersonCost: 22000,
    petFreeCount: 1,
    petExtraCost: 22000,
    quoteFields: [
      { key: 'people', enabled: true },
      { key: 'pets', enabled: true },
      { key: 'retouchedPhotos', enabled: true },
      { key: 'frame', enabled: true },
      { key: 'originalPhoto', enabled: true },
    ],
    ctaText: '카카오톡 채팅 상담하기 →',
    ctaUrl: '',
    disclaimer: '해당 견적 이외에 추가비용은 절대 발생하지 않습니다.',
  },
  priceTable: { title: '촬영 상품 가격표', enabled: true, image: '' },
  faq: { title: '자주 묻는 질문', items: [] },
  framePrice: {
    title: '액자 가격표 참고',
    notice: '모든 촬영상품엔 아크릴 우드 프레임이 포함되어있습니다.',
    tables: [
      {
        id: 'wood',
        name: '아크릴 우드 프레임 액자',
        rows: [
          { size: '5R', cm: '약 13x18 cm', price: 20000 },
          { size: '8R', cm: '약 20x30 cm', price: 40000 },
          { size: '12R', cm: '약 30x43 cm', price: 80000 },
          { size: '16R', cm: '약 40x50 cm', price: 100000 },
          { size: '20R', cm: '약 50x61 cm', price: 150000 },
          { size: '24R', cm: '약 61x86 cm', price: 180000 },
          { size: '30R', cm: '약 76x102 cm', price: 250000 },
        ],
      },
      {
        id: 'acrylic',
        name: '아크릴 프레임 리스 액자',
        rows: [
          { size: '5R', cm: '약 13x18 cm', price: 30000 },
          { size: '8R', cm: '약 20x30 cm', price: 50000 },
          { size: '12R', cm: '약 30x43 cm', price: 100000 },
          { size: '16R', cm: '약 40x50 cm', price: 130000 },
          { size: '20R', cm: '약 50x61 cm', price: 180000 },
          { size: '24R', cm: '약 61x86 cm', price: 230000 },
          { size: '30R', cm: '약 76x102 cm', price: 300000 },
        ],
      },
    ],
  },
  blogMapping: { categoryFilter: tabLabel, selectedBlogIds: [] },
  reviews: { title: '리뷰', items: [] },
  video: { title: '영상', items: [] },
  gallery: { title: '갤러리', images: [] },
  slideReview: { title: '내가 이 스튜디오를 예약한 이유', subtitle: '실제 고객님의 생생한 리뷰', bgColor: '#000000', textColor: '#ffffff', slides: [] },
  richTextData: {},
});

export const initialPageConfigs = {
  home: createDefaultConfig('홈', 'home', -1, '🏠'),

  family: {
    ...createDefaultConfig('가족사진', 'family', 0, '👨‍👩‍👧‍👦'),
    guide: {
      title: '가족사진 촬영 가이드',
      cards: [
        { id: 'family-guide-1', emoji: '📋', title: '한눈에 보는 가족사진', subtitle: 'A-Z 촬영 가이드', bgColor: '#f0fdf4', borderColor: '#dcfce7' },
        { id: 'family-guide-2', emoji: '👗', title: '인생샷 남기는', subtitle: '가족사진 의상 꿀팁', bgColor: '#faf5ff', borderColor: '#f3e8ff' },
      ],
    },
    quoteBuilder: {
      products: [
        { id: 'family-photo', title: '가족사진', subtitle: '3인 이상', basePeople: 4, minPeople: 3, fixedPeople: false, maxPeople: 30, extraPersonCost: 22000, weekdayPrice: 300000, weekendPrice: 330000, retouchedPhotos: 2, frame: '16R(약 40x50cm)', originalIncluded: true, showEvent: true, eventEmoji: '🎉', eventTitle: '이벤트 안내', eventNote: '마케팅 활용 동의 고객님께\n보정본 2장 또는 액자 사이즈 업그레이드 혜택을 드립니다.', eventBgColor: '#fffbeb', eventBorderColor: '#fef3c7', eventTextColor: '#92400e' },
        { id: 'maternity', title: '만삭사진', subtitle: '2인 고정', basePeople: 2, fixedPeople: true, maxPeople: 2, weekdayPrice: 250000, weekendPrice: 270000, retouchedPhotos: 2, frame: '12R(약 30x40cm)', originalIncluded: true, eventNote: '' },
        { id: 'couple', title: '부부/커플', subtitle: '2인 고정', basePeople: 2, fixedPeople: true, maxPeople: 2, weekdayPrice: 200000, weekendPrice: 220000, retouchedPhotos: 2, frame: '12R(약 30x40cm)', originalIncluded: true, eventNote: '' },
      ],
      extraPersonCost: 22000,
      petFreeCount: 1,
      petExtraCost: 22000,
      quoteFields: [
        { key: 'people', enabled: true },
        { key: 'pets', enabled: true },
        { key: 'retouchedPhotos', enabled: true },
        { key: 'frame', enabled: true },
        { key: 'originalPhoto', enabled: true },
      ],
      additionalOptions: [
        { id: 'ao1', label: '인원 추가', price: '22,000원(1인)' },
        { id: 'ao2', label: '반려동물', price: '1마리까지 무료' },
        { id: 'ao3', label: '반려동물 추가', price: '22,000원(1마리)' },
        { id: 'ao4', label: '보정본 추가', price: '30,000원(2인 이하)' },
        { id: 'ao5', label: '보정본 추가', price: '50,000원(4인 이하)' },
        { id: 'ao6', label: '보정본 추가', price: '60,000원(8인 이하)' },
      ],
      ctaText: '카카오톡 채팅 상담하기 →',
      ctaUrl: '',
      disclaimer: '해당 견적 이외에 추가비용은 절대 발생하지 않습니다.',
    },
    faq: {
      title: '자주 묻는 질문',
      items: [
        { id: 'faq1', question: '혹시 추가금도 있나요?', answer: '아니요, 안내된 가격 외 추가 비용은 발생하지 않습니다.' },
        { id: 'faq2', question: '원본 제공되나요?', answer: '네, 고화질 원본 전체가 무료로 제공됩니다.' },
        { id: 'faq3', question: '스튜디오에서 영상 촬영해도 되나요?', answer: '네, 개인 소장용 영상 촬영은 자유롭게 가능합니다.' },
        { id: 'faq4', question: '예약은 어떻게 진행되나요?', answer: '카카오톡 채팅 상담을 통해 예약이 진행됩니다.' },
        { id: 'faq5', question: '촬영 진행 과정과 소요 시간이 궁금해요.', answer: '촬영은 약 1시간~1시간 30분 소요되며, 상담 → 예약 → 촬영 → 보정 → 전달 순으로 진행됩니다.' },
        { id: 'faq6', question: '의상 대여가 가능한가요?', answer: '기본 의상 대여 서비스를 제공하고 있습니다.' },
        { id: 'faq7', question: '의상 꿀팁이 있나요?', answer: '촬영 가이드 카드의 의상 꿀팁을 참고해주세요!' },
        { id: 'faq8', question: '메이크업은 필수인가요?', answer: '필수는 아니지만, 더 좋은 결과물을 위해 권장합니다.' },
        { id: 'faq9', question: '액자 업그레이드시 비용이 많이 드나요?', answer: '사이즈에 따라 차이가 있으며, 상담을 통해 안내 드립니다.' },
        { id: 'faq10', question: '주차는 가능한가요?', answer: '네, 스튜디오 건물 내 무료 주차가 가능합니다.' },
      ],
    },
    reviews: {
      title: '리뷰',
      items: [
        { id: 'rev1', image: '', text: '친절하게 맞이해주시고 조금 어색했는데, 적응할 수 있도록 준비시간도 여유있게 주셔서 좋았구요, 촬영도 같이 웃어주고 해서 너무 재밌게 촬영했어요ㅋㅋㅋ', author: '비뉴뜨 가족사진/만삭사진/커플사진', tags: ['보정을 꼼꼼하게 해줘요', '친절해요', '분위기가 편안해요'] },
      ],
    },
  },

  profile: {
    ...createDefaultConfig('프로필', 'profile', 1, '📸'),
    guide: {
      title: '프로필 촬영 가이드',
      cards: [
        { id: 'profile-guide-1', emoji: '📸', title: '프로필 촬영', subtitle: 'A-Z 가이드', bgColor: '#eff6ff', borderColor: '#dbeafe' },
        { id: 'profile-guide-2', emoji: '💄', title: '촬영 전 준비', subtitle: '메이크업 팁', bgColor: '#fdf2f8', borderColor: '#fce7f3' },
      ],
    },
    quoteBuilder: {
      products: [
        { id: 'profile-basic', title: '프로필 기본', subtitle: '1인', basePeople: 1, fixedPeople: true, maxPeople: 1, weekdayPrice: 150000, weekendPrice: 170000, retouchedPhotos: 3, frame: '', originalIncluded: true, eventNote: '' },
        { id: 'profile-premium', title: '프로필 프리미엄', subtitle: '1인 + 헤메', basePeople: 1, fixedPeople: true, maxPeople: 1, weekdayPrice: 250000, weekendPrice: 280000, retouchedPhotos: 5, frame: '', originalIncluded: true, eventNote: '' },
      ],
      extraPersonCost: 0,
      petFreeCount: 0,
      petExtraCost: 0,
      quoteFields: [
        { key: 'people', enabled: true },
        { key: 'retouchedPhotos', enabled: true },
        { key: 'originalPhoto', enabled: true },
      ],
      additionalOptions: [],
      ctaText: '카카오톡 채팅 상담하기 →',
      ctaUrl: '',
      disclaimer: '해당 견적 이외에 추가비용은 절대 발생하지 않습니다.',
    },
    faq: { title: '자주 묻는 질문', items: [] },
    reviews: { title: '리뷰', items: [] },
  },

  pilates: {
    ...createDefaultConfig('필라테스', 'pilates', 2, '🧘'),
    guide: {
      title: '필라테스 촬영 가이드',
      cards: [
        { id: 'pilates-guide-1', emoji: '🧘', title: '필라테스 촬영', subtitle: 'A-Z 가이드', bgColor: '#f0fdfa', borderColor: '#ccfbf1' },
        { id: 'pilates-guide-2', emoji: '👟', title: '촬영용 의상', subtitle: '추천 가이드', bgColor: '#fff7ed', borderColor: '#ffedd5' },
      ],
    },
    quoteBuilder: {
      products: [
        { id: 'pilates-basic', title: '필라테스 베이직', subtitle: '1인', basePeople: 1, fixedPeople: false, maxPeople: 20, extraPersonCost: 100000, weekdayPrice: 180000, weekendPrice: 200000, retouchedPhotos: 3, frame: '', originalIncluded: true, eventNote: '' },
      ],
      extraPersonCost: 0,
      petFreeCount: 0,
      petExtraCost: 0,
      quoteFields: [
        { key: 'people', enabled: true },
        { key: 'retouchedPhotos', enabled: true },
        { key: 'originalPhoto', enabled: true },
      ],
      additionalOptions: [],
      ctaText: '카카오톡 채팅 상담하기 →',
      ctaUrl: '',
      disclaimer: '해당 견적 이외에 추가비용은 절대 발생하지 않습니다.',
    },
    faq: { title: '자주 묻는 질문', items: [] },
    reviews: { title: '리뷰', items: [] },
  },

  'id-photo': {
    ...createDefaultConfig('증명사진', 'id-photo', 3, '🪪'),
    guide: {
      title: '증명사진 촬영 가이드',
      cards: [
        { id: 'id-guide-1', emoji: '🪪', title: '증명사진 촬영', subtitle: 'A-Z 가이드', bgColor: '#f0f9ff', borderColor: '#e0f2fe' },
        { id: 'id-guide-2', emoji: '👔', title: '증명사진 의상', subtitle: '꿀팁 가이드', bgColor: '#fffbeb', borderColor: '#fef3c7' },
      ],
    },
    quoteBuilder: {
      products: [
        { id: 'id-standard', title: '증명사진 표준', subtitle: '1인', basePeople: 1, fixedPeople: true, maxPeople: 1, weekdayPrice: 50000, weekendPrice: 60000, retouchedPhotos: 1, frame: '', originalIncluded: true, eventNote: '' },
      ],
      extraPersonCost: 0,
      petFreeCount: 0,
      petExtraCost: 0,
      quoteFields: [
        { key: 'retouchedPhotos', enabled: true },
        { key: 'originalPhoto', enabled: true },
      ],
      additionalOptions: [],
      ctaText: '카카오톡 채팅 상담하기 →',
      ctaUrl: '',
      disclaimer: '해당 견적 이외에 추가비용은 절대 발생하지 않습니다.',
    },
    faq: { title: '자주 묻는 질문', items: [] },
    reviews: { title: '리뷰', items: [] },
  },
};

// 하위 호환: PRODUCT_TABS를 pageConfigs에서 파생
export const PRODUCT_TABS = Object.entries(initialPageConfigs)
  .map(([id, cfg]) => ({ id, label: cfg.meta.label, icon: cfg.meta.icon, order: cfg.meta.order }))
  .sort((a, b) => a.order - b.order);
