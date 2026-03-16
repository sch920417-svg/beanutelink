/**
 * 서비스 페이지 폴백 데이터
 * Firebase 미연결 시 사용하는 기본 데이터
 * Admin 패널에서 Firestore에 저장한 데이터와 동일한 구조
 */

export const defaultServiceConfig = {
  // 스플래시 설정
  splash: {
    logoText: 'BEANUTE',
    duration: 1.8, // 초
  },

  // 상단 탭 바 메뉴 (initialPageConfigs와 동기화)
  tabs: [
    { id: 'family', label: '가족사진' },
    { id: 'profile', label: '프로필' },
    { id: 'pilates', label: '필라테스' },
    { id: 'id-photo', label: '증명사진' },
  ],
  // Note: Firebase 연결 시 tabs는 page_configs에서 동적 파생됩니다.

  // 탭별 히어로 이미지 (여러 장 슬라이드)
  heroImages: {
    family: [
      { id: 1, url: '', alt: '가족사진 배너 1' },
      { id: 2, url: '', alt: '가족사진 배너 2' },
      { id: 3, url: '', alt: '가족사진 배너 3' },
    ],
    profile: [
      { id: 1, url: '', alt: '프로필 배너 1' },
    ],
    pilates: [
      { id: 1, url: '', alt: '필라테스 배너 1' },
    ],
    'id-photo': [
      { id: 1, url: '', alt: '증명사진 배너 1' },
    ],
  },

  // 탭별 촬영 가이드
  guides: {
    family: {
      title: '가족사진 촬영 가이드',
      cards: [
        {
          id: 1,
          emoji: '📋',
          title: '가족사진',
          subtitle: 'A-Z 촬영 가이드',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-100',
        },
        {
          id: 2,
          emoji: '👗',
          title: '인생샷 남기는',
          subtitle: '가족사진 의상 꿀팁',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-100',
        },
      ],
    },
    profile: {
      title: '프로필 촬영 가이드',
      cards: [
        {
          id: 1,
          emoji: '📸',
          title: '프로필 촬영',
          subtitle: 'A-Z 가이드',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-100',
        },
        {
          id: 2,
          emoji: '💄',
          title: '촬영 전 준비',
          subtitle: '메이크업 팁',
          bgColor: 'bg-pink-50',
          borderColor: 'border-pink-100',
        },
      ],
    },
    pilates: {
      title: '필라테스 촬영 가이드',
      cards: [
        {
          id: 1,
          emoji: '🧘',
          title: '필라테스 촬영',
          subtitle: 'A-Z 가이드',
          bgColor: 'bg-teal-50',
          borderColor: 'border-teal-100',
        },
        {
          id: 2,
          emoji: '👟',
          title: '촬영용 의상',
          subtitle: '추천 가이드',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-100',
        },
      ],
    },
    'id-photo': {
      title: '증명사진 촬영 가이드',
      cards: [
        {
          id: 1,
          emoji: '🪪',
          title: '증명사진 촬영',
          subtitle: 'A-Z 가이드',
          bgColor: 'bg-sky-50',
          borderColor: 'border-sky-100',
        },
        {
          id: 2,
          emoji: '👔',
          title: '증명사진 의상',
          subtitle: '꿀팁 가이드',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-100',
        },
      ],
    },
  },
};

// 견적 계산 가격 설정
export const defaultPriceConfig = {
  prices: {
    family: { weekday: 300000, weekend: 330000, basePeople: 4, extraPersonCost: 22000 },
    maternity: { weekday: 250000, weekend: 270000, fixedPeople: 2 },
    couple: { weekday: 200000, weekend: 220000, fixedPeople: 2 },
  },
  priceTableImage: null, // 관리자 패널에서 업로드한 가격표 이미지 URL
  consultationLink: 'http://pf.kakao.com/_udVXG',
  consultationText: '카카오톡 채팅 상담하기 →',
  bottomNoticeText: '해당 견적 이외에 추가비용은 절대 발생하지 않습니다.',
};

// FAQ 데이터
export const defaultFaqs = [
  { question: '예약금은 얼마인가요?', answer: '예약금은 5만원이며, 촬영 당일 총 결제금액에서 제외됩니다.' },
  { question: '의상 대여가 가능한가요?', answer: '네, 스튜디오에 다양한 사이즈의 드레스와 정장, 구두가 준비되어 있습니다.\n물론 대여 가능합니다.' },
  { question: '원본 사진은 전부 제공되나요?', answer: '네! 촬영된 원본 사진은 색감 보정 후 모두 고화질로 제공해드리고 있습니다.' },
];

// 고객 리뷰 (이미지 URL - 빈 값은 플레이스홀더 표시)
export const defaultReviewImages = [];

// 견적 계산용 상품 데이터
export const defaultServiceProducts = [
  {
    id: 'family-photo',
    title: '가족사진',
    subtitle: '3인 이상',
    tabId: 'family',
    options: [
      { id: 'people', label: '촬영 인원', type: 'counter', min: 3, max: 10, default: 3, pricePerUnit: 30000 },
      { id: 'print', label: '인화 장수', type: 'counter', min: 0, max: 20, default: 5, pricePerUnit: 5000 },
    ],
  },
  {
    id: 'maternity',
    title: '만삭사진',
    subtitle: '2인 고정',
    tabId: 'family',
    options: [
      { id: 'concept', label: '컨셉 수', type: 'counter', min: 1, max: 5, default: 1, pricePerUnit: 50000 },
    ],
  },
  {
    id: 'couple',
    title: '부부/커플',
    subtitle: '2인 고정',
    tabId: 'family',
    options: [
      { id: 'concept', label: '컨셉 수', type: 'counter', min: 1, max: 5, default: 1, pricePerUnit: 40000 },
    ],
  },
];

// 블로그 포스트 데이터
export const defaultServicePosts = [
  {
    id: 1,
    category: '칠순 기념',
    title: '손자들이 준비한 할머니의 칠순 선물',
    thumbnail: '',
    tabId: 'family',
  },
  {
    id: 2,
    category: '퇴직 기념',
    title: '그 동안 수고하신 아버님께 드리는 선물',
    thumbnail: '',
    tabId: 'family',
  },
  {
    id: 3,
    category: '졸업 기념',
    title: '대학생이 된 형제가 감사함을 전하는 선물',
    thumbnail: '',
    tabId: 'family',
  },
  {
    id: 4,
    category: '첫 돌 기념',
    title: '사랑하는 아들의 생애 첫 생일 선물',
    thumbnail: '',
    tabId: 'family',
  },
  {
    id: 5,
    category: '경기 스위시',
    title: '우리 가족의 특별한 순간을 기록하다',
    thumbnail: '',
    tabId: 'family',
  },
  {
    id: 6,
    category: '웨딩 기념',
    title: '결혼 10주년 리마인드 웨딩 촬영',
    thumbnail: '',
    tabId: 'family',
  },
];
