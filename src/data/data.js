export const initialProducts = [
    { id: 1, title: '아이덴티티 포트레이트', desc: '단 한 명의 개성을 온전히 담아내는 특별한 초상화 촬영', bg: 'bg-neutral-800', ratio: '16:9', kakaoUrl: '' },
    { id: 2, title: '헤리티지 패밀리', desc: '시간이 지나도 변치 않는 가족의 따뜻함을 기록합니다', bg: 'bg-neutral-800', ratio: '1:1', kakaoUrl: '' },
    { id: 3, title: '시즈널 커플 스냅', desc: '계절의 변화와 함께 두 사람의 자연스러운 순간을', bg: 'bg-neutral-800', ratio: '4:5', kakaoUrl: '' }
];

export const initialBlogs = {
    1: [
        { id: 1, title: '나를 마주하는 시간, 아이덴티티 촬영장 스케치', tag: '아이덴티티 포트레이트', date: '2026.02.28', views: 305 },
        { id: 4, title: '나만의 매력을 찾는 첫 단계', tag: '프로필', date: '2026.02.10', views: 120 }
    ],
    2: [
        { id: 2, title: '봄날의 따뜻함을 담은 가족사진 후기', tag: '헤리티지 패밀리', date: '2026.03.02', views: 142 },
        { id: 5, title: '리마인드 웨딩, 부모님께 드릴 수 있는 최고의 선물', tag: '헤리티지', date: '2026.01.15', views: 502 }
    ],
    3: [
        { id: 3, title: '사진 촬영 전 준비하면 좋은 3가지 팁', tag: '스튜디오 공통', date: '2026.02.15', views: 890 }
    ]
};

export const initialStats = [
    { id: 1, title: '이달의 신규 예약', value: '24건', increase: '+12%' },
    { id: 2, title: '촬영 대기', value: '8팀', increase: null },
    { id: 3, title: '완료된 촬영', value: '156건', increase: '+5%' },
];
