import React, { useMemo } from 'react';
import { getStats } from '../../utils/analytics';

export function DashboardView({ products, blogs }) {
    const stats = useMemo(() => getStats('month'), []);

    const { funnel, summary, recentEvents } = stats;

    const dashCards = [
        {
            id: 1,
            title: '이달의 방문자',
            value: `${funnel.pageViews}명`,
            increase: summary.pageViewChange,
        },
        {
            id: 2,
            title: '상품 조회',
            value: `${funnel.productViewers}건`,
            increase: summary.productViewChange,
        },
        {
            id: 3,
            title: '상담 전환',
            value: `${funnel.ctaClicks}건`,
            increase: summary.ctaChange,
        },
    ];

    return (
        <div className="space-y-8 slide-in-from-bottom-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {dashCards.map((stat) => (
                    <div key={stat.id} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between hover:border-neutral-700 transition-colors group">
                        <span className="text-sm font-medium text-neutral-400">{stat.title}</span>
                        <div className="flex items-end justify-between mt-4">
                            <span className="text-3xl font-bold text-white group-hover:text-lime-400 transition-colors">{stat.value}</span>
                            {stat.increase && (
                                <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                                    stat.increase.startsWith('+') ? 'text-lime-400 bg-lime-400/10' : 'text-red-400 bg-red-400/10'
                                }`}>{stat.increase}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* 오늘의 요약 + 최근 활동 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 오늘의 요약 */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
                    <h4 className="text-sm font-bold text-neutral-400 mb-5 uppercase tracking-wider">오늘의 요약</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center bg-neutral-950 rounded-xl px-4 py-3 border border-neutral-800">
                            <span className="text-sm text-neutral-400">페이지 방문</span>
                            <span className="text-white font-bold">{summary.todayPageViews}회</span>
                        </div>
                        <div className="flex justify-between items-center bg-neutral-950 rounded-xl px-4 py-3 border border-neutral-800">
                            <span className="text-sm text-neutral-400">상품 조회</span>
                            <span className="text-white font-bold">{summary.todayProductViews}회</span>
                        </div>
                        <div className="flex justify-between items-center bg-neutral-950 rounded-xl px-4 py-3 border border-neutral-800">
                            <span className="text-sm text-neutral-400">상담 신청</span>
                            <span className="text-lime-400 font-bold">{summary.todayCTAClicks}회</span>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-neutral-800 flex justify-between text-sm text-neutral-500">
                        <span>등록 상품</span>
                        <span><strong className="text-lime-400">{products.length}</strong>개</span>
                    </div>
                    <div className="flex justify-between text-sm text-neutral-500 mt-1">
                        <span>작성 게시글</span>
                        <span><strong className="text-lime-400">{Object.values(blogs).flat().length}</strong>개</span>
                    </div>
                </div>

                {/* 최근 고객 활동 */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6">
                    <h4 className="text-sm font-bold text-neutral-400 mb-5 uppercase tracking-wider">최근 고객 활동</h4>
                    {recentEvents.length > 0 ? (
                        <div className="space-y-2">
                            {recentEvents.slice(0, 7).map((event) => (
                                <div key={event.id} className="flex items-center gap-3 bg-neutral-950 rounded-xl px-4 py-3 border border-neutral-800">
                                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                                        event.type === 'cta_click' ? 'bg-lime-400' :
                                        event.type === 'product_select' || event.type === 'product_view' ? 'bg-blue-400' :
                                        'bg-neutral-500'
                                    }`} />
                                    <span className="text-sm text-white flex-1 truncate">{event.label}</span>
                                    <span className="text-xs text-neutral-500 font-medium shrink-0">{event.timeAgo}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-sm text-neutral-500">아직 고객 활동 데이터가 없습니다.</p>
                            <p className="text-xs text-neutral-600 mt-1">고객이 페이지를 방문하면 여기에 표시됩니다.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
