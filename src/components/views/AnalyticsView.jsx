import React, { useState, useMemo, useEffect } from 'react';
import { Icons } from '../../data/links';
import { getStats, clearEvents, getDateRange } from '../../utils/analytics';
import { loadAnalyticsEvents } from '../../services/firestore';

const Icon = ({ name, size = 24, className = "" }) => {
    const Comp = Icons[name] || Icons.HelpCircle;
    return Comp ? <Comp size={size} className={className} /> : null;
};

const PERIOD_OPTIONS = [
    { value: 'today', label: '오늘' },
    { value: 'yesterday', label: '어제' },
    { value: 'week', label: '최근 7일' },
    { value: 'twoWeeks', label: '최근 2주' },
    { value: 'month', label: '최근 1개월' },
    { value: 'custom', label: '기간 선택' },
];

// 퍼널 화살표 SVG
const FunnelArrow = () => (
    <div className="hidden md:flex items-center justify-center text-neutral-700">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
    </div>
);

export function AnalyticsView() {
    const [period, setPeriod] = useState('month');
    const [refreshKey, setRefreshKey] = useState(0);
    const [customFrom, setCustomFrom] = useState('');
    const [customTo, setCustomTo] = useState('');
    const [quoteProductFilter, setQuoteProductFilter] = useState('all');
    const [blogProductFilter, setBlogProductFilter] = useState('all');

    const customRange = period === 'custom' && customFrom && customTo
        ? { dateFrom: customFrom, dateTo: customTo }
        : null;

    // Firestore에서 분석 이벤트 로드
    const [firestoreEvents, setFirestoreEvents] = useState(null);
    const [loadingFirestore, setLoadingFirestore] = useState(true);

    useEffect(() => {
        setLoadingFirestore(true);
        const { dateFrom, dateTo } = getDateRange(period, customRange);
        loadAnalyticsEvents(dateFrom, dateTo)
            .then((events) => {
                setFirestoreEvents(events.length > 0 ? events : null);
            })
            .finally(() => setLoadingFirestore(false));
    }, [period, refreshKey, customFrom, customTo]);

    // Firestore 데이터가 있으면 사용, 없으면 localStorage 폴백
    const stats = useMemo(
        () => getStats(period, customRange, firestoreEvents),
        [period, refreshKey, customFrom, customTo, firestoreEvents]
    );

    const handleClear = () => {
        if (window.confirm('모든 분석 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            clearEvents();
            setRefreshKey(k => k + 1);
        }
    };

    const [expandedRegion, setExpandedRegion] = useState(null);

    const {
        funnel, productRatios, dailyCounts, faqEngagement,
        quoteInsights, quoteProductStats, quoteDetails,
        blogRankings, phoneDailyList, regionStats, purposeStats, summary,
    } = stats;

    // 일별 차트 최대값
    const maxDaily = Math.max(...dailyCounts.map(d => d.pageViews), 1);

    // 견적 상세 필터링
    const filteredQuoteDetails = quoteProductFilter === 'all'
        ? quoteDetails
        : quoteDetails.filter(d => d.productTitle === quoteProductFilter);

    // 견적 상세에서 고유 상품 목록 추출
    const quoteProductNames = [...new Set(quoteDetails.map(d => d.productTitle))];

    // 블로그 상품 목록
    const blogProductNames = Object.keys(blogRankings);

    // 현재 선택된 블로그 순위
    const currentBlogRankings = blogProductFilter === 'all'
        ? Object.values(blogRankings).flat().sort((a, b) => b.count - a.count)
        : blogRankings[blogProductFilter] || [];

    return (
        <div className="space-y-6 slide-in-from-bottom-4">
            {/* 헤더 + 기간 선택 */}
            <div className="bg-neutral-900 p-6 rounded-3xl border border-neutral-800">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">기간별 고객 여정 분석</h3>
                    <div className="flex items-center gap-2">
                        <select
                            value={period}
                            onChange={e => setPeriod(e.target.value)}
                            className="bg-neutral-950 border border-neutral-700 text-sm text-white px-4 py-2 rounded-lg outline-none"
                        >
                            {PERIOD_OPTIONS.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => setRefreshKey(k => k + 1)}
                            className="p-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-400 hover:text-lime-400 transition-colors"
                            title="새로고침"
                        >
                            <Icon name="RefreshCw" size={16} />
                        </button>
                        <button
                            onClick={handleClear}
                            className="p-2 bg-neutral-950 border border-neutral-700 rounded-lg text-neutral-400 hover:text-red-400 transition-colors"
                            title="데이터 초기화"
                        >
                            <Icon name="Trash2" size={16} />
                        </button>
                    </div>
                </div>

                {/* 커스텀 기간 선택 */}
                {period === 'custom' && (
                    <div className="flex items-center gap-3 mt-4">
                        <input
                            type="date"
                            value={customFrom}
                            onChange={e => setCustomFrom(e.target.value)}
                            className="bg-neutral-950 border border-neutral-700 text-sm text-white px-3 py-2 rounded-lg outline-none"
                        />
                        <span className="text-neutral-500 text-sm">~</span>
                        <input
                            type="date"
                            value={customTo}
                            onChange={e => setCustomTo(e.target.value)}
                            className="bg-neutral-950 border border-neutral-700 text-sm text-white px-3 py-2 rounded-lg outline-none"
                        />
                    </div>
                )}
            </div>

            {/* 고객 여정 퍼널 + 전화문의 */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8">
                <h4 className="text-sm font-bold text-neutral-400 mb-6 uppercase tracking-wider">고객 여정 퍼널 (Funnel)</h4>
                <div className="flex flex-col md:flex-row gap-4 items-stretch">
                    {/* 1단계: 링크 접속 */}
                    <div className="flex-1 bg-neutral-950 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-neutral-800"></div>
                        <div className="text-neutral-500 text-sm font-medium mb-2">1단계: 링크 접속</div>
                        <div className="text-3xl font-bold text-white mb-1">
                            {funnel.pageViews.toLocaleString()}<span className="text-base text-neutral-500 ml-1">명</span>
                        </div>
                        <p className="text-[10px] text-neutral-600 mt-1">세션 기반 고유 방문자 (30분 내 재방문 제외)</p>
                        {summary.pageViewChange && (
                            <div className={`text-xs font-bold px-2 py-0.5 rounded inline-block mt-2 ${
                                summary.pageViewChange.startsWith('+') ? 'text-lime-400 bg-lime-400/10' : 'text-red-400 bg-red-400/10'
                            }`}>{summary.pageViewChange}</div>
                        )}
                    </div>
                    <FunnelArrow />
                    {/* 2단계: 상품 조회자 (견적 완료) */}
                    <div className="flex-1 bg-neutral-950 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-lime-500/30"></div>
                        <div className="text-neutral-500 text-sm font-medium mb-2">2단계: 상품 조회자</div>
                        <div className="text-3xl font-bold text-white mb-1">
                            {funnel.quoteCompletes.toLocaleString()}<span className="text-base text-neutral-500 ml-1">명</span>
                        </div>
                        <p className="text-[10px] text-neutral-600 mt-1">견적서 금액까지 확인한 사용자</p>
                        <div className="text-xs font-bold text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded inline-block mt-2">
                            전환율 {funnel.conversionRate1}%
                        </div>
                        {summary.quoteCompleteChange && (
                            <div className={`text-xs font-bold px-2 py-0.5 rounded inline-block mt-2 ml-1 ${
                                summary.quoteCompleteChange.startsWith('+') ? 'text-lime-400 bg-lime-400/10' : 'text-red-400 bg-red-400/10'
                            }`}>{summary.quoteCompleteChange}</div>
                        )}
                    </div>
                    <FunnelArrow />
                    {/* 3단계: 상담/예약 */}
                    <div className="flex-1 bg-neutral-950 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-lime-400"></div>
                        <div className="text-neutral-500 text-sm font-medium mb-2">3단계: 상담/예약</div>
                        <div className="text-3xl font-bold text-white mb-1">
                            {funnel.ctaClicks.toLocaleString()}<span className="text-base text-neutral-500 ml-1">명</span>
                        </div>
                        <p className="text-[10px] text-neutral-600 mt-1">카카오톡 채널 클릭 + 상담 신청 합산</p>
                        <div className="text-xs font-bold text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded inline-block mt-2">
                            최종 전환율 {funnel.overallRate}%
                        </div>
                        {summary.ctaChange && (
                            <div className={`text-xs font-bold px-2 py-0.5 rounded inline-block mt-2 ml-1 ${
                                summary.ctaChange.startsWith('+') ? 'text-lime-400 bg-lime-400/10' : 'text-red-400 bg-red-400/10'
                            }`}>{summary.ctaChange}</div>
                        )}
                    </div>

                    {/* 전화문의 별도 카드 */}
                    <div className="md:w-[160px] bg-neutral-950 border border-blue-500/30 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-blue-400"></div>
                        <div className="text-blue-400 text-sm font-medium mb-2">전화문의</div>
                        <div className="text-3xl font-bold text-white mb-1">
                            {funnel.phoneClicks.toLocaleString()}<span className="text-base text-neutral-500 ml-1">건</span>
                        </div>
                        {phoneDailyList.length > 0 && (
                            <div className="text-[10px] text-neutral-600 mt-1">
                                오늘: {phoneDailyList.find(d => d.date === new Date().toISOString().slice(0, 10))?.count || 0}건
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 방문 목적 분포 */}
            {purposeStats && purposeStats.length > 0 && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8">
                    <h4 className="text-sm font-bold text-neutral-400 mb-6 uppercase tracking-wider">방문 목적 분포</h4>
                    <div className="space-y-4">
                        {(() => {
                            const maxPurpose = Math.max(...purposeStats.map(p => p.count), 1);
                            return purposeStats.map((item, idx) => (
                                <div key={item.productTitle}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-white flex items-center gap-2">
                                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                                                idx === 0 ? 'bg-lime-400/20 text-lime-400' :
                                                idx === 1 ? 'bg-neutral-700 text-neutral-300' :
                                                'bg-neutral-800 text-neutral-400'
                                            }`}>{idx + 1}</span>
                                            {item.productTitle}
                                        </span>
                                        <span className="text-neutral-400 font-bold">{item.percentage}% ({item.count}명)</span>
                                    </div>
                                    <div className="w-full h-3 bg-neutral-950 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                idx === 0 ? 'bg-lime-400' : idx === 1 ? 'bg-lime-500/60' : 'bg-neutral-600'
                                            }`}
                                            style={{ width: `${(item.count / maxPurpose) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            ));
                        })()}
                    </div>
                    <p className="text-[10px] text-neutral-600 mt-4">방문자가 첫 진입 시 선택한 촬영 목적 기준</p>
                </div>
            )}

            {/* 상품 선택 순위 + 일별 추이 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 상품 선택 순위 (전체) */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8">
                    <h4 className="text-sm font-bold text-neutral-400 mb-6 uppercase tracking-wider">가장 많이 선택된 상품</h4>
                    {productRatios.length > 0 ? (
                        <div className="space-y-5">
                            {productRatios.map((item, idx) => (
                                <div key={item.title}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-white flex items-center gap-2">
                                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                                                idx === 0 ? 'bg-lime-400/20 text-lime-400' :
                                                idx === 1 ? 'bg-neutral-700 text-neutral-300' :
                                                'bg-neutral-800 text-neutral-400'
                                            }`}>{idx + 1}</span>
                                            {item.title}
                                        </span>
                                        <span className="text-neutral-400 font-bold">{item.percentage}% ({item.count}건)</span>
                                    </div>
                                    <div className="w-full h-3 bg-neutral-950 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${
                                                idx === 0 ? 'bg-lime-400' : idx === 1 ? 'bg-lime-500/60' : 'bg-neutral-600'
                                            }`}
                                            style={{ width: `${item.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Icon name="BarChart3" size={32} className="text-neutral-700 mx-auto mb-3" />
                            <p className="text-sm text-neutral-500">아직 상품 선택 데이터가 없습니다.</p>
                        </div>
                    )}
                </div>

                {/* 일별 방문 추이 (CSS 바 차트) */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8">
                    <h4 className="text-sm font-bold text-neutral-400 mb-6 uppercase tracking-wider">일별 방문 추이</h4>
                    {dailyCounts.length > 0 ? (
                        <div className="flex items-end gap-1 h-[180px]">
                            {dailyCounts.slice(-14).map((day) => {
                                const height = Math.max((day.pageViews / maxDaily) * 100, 4);
                                const dateLabel = day.date.slice(5); // MM-DD
                                return (
                                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group">
                                        <div className="text-[10px] text-neutral-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                            {day.pageViews}
                                        </div>
                                        <div
                                            className="w-full bg-lime-400/80 rounded-t-md hover:bg-lime-400 transition-colors min-h-[4px]"
                                            style={{ height: `${height}%` }}
                                            title={`${day.date}: ${day.pageViews}회 방문`}
                                        />
                                        <div className="text-[9px] text-neutral-600 font-medium mt-1">{dateLabel}</div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Icon name="TrendingUp" size={32} className="text-neutral-700 mx-auto mb-3" />
                            <p className="text-sm text-neutral-500">아직 방문 데이터가 없습니다.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 견적 인사이트 */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8">
                <h4 className="text-sm font-bold text-neutral-400 mb-6 uppercase tracking-wider">견적 인사이트</h4>

                {/* 상품별 견적계산기 조회 횟수 */}
                {quoteProductStats.length > 0 ? (
                    <div className="space-y-6">
                        {/* 요약 카드 */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-neutral-950 rounded-2xl p-4 border border-neutral-800">
                                <div className="text-neutral-500 text-xs font-medium mb-1">가장 많이 선택된 상품</div>
                                <div className="text-white font-bold text-lg">{quoteInsights.topProduct}</div>
                            </div>
                            <div className="bg-neutral-950 rounded-2xl p-4 border border-neutral-800">
                                <div className="text-neutral-500 text-xs font-medium mb-1">평균 인원수</div>
                                <div className="text-white font-bold text-lg">{quoteInsights.avgPeopleCount}명</div>
                            </div>
                        </div>

                        {/* 상품별 견적계산기 조회/완료 테이블 */}
                        <div>
                            <h5 className="text-xs font-bold text-neutral-500 mb-3">상품별 견적계산기 조회 횟수</h5>
                            <div className="bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-neutral-800">
                                            <th className="text-left px-4 py-3 text-neutral-500 font-medium text-xs">상품</th>
                                            <th className="text-right px-4 py-3 text-neutral-500 font-medium text-xs">조회</th>
                                            <th className="text-right px-4 py-3 text-neutral-500 font-medium text-xs">견적완료</th>
                                            <th className="text-right px-4 py-3 text-neutral-500 font-medium text-xs">전환율</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {quoteProductStats.map((item) => (
                                            <tr key={item.title} className="border-b border-neutral-800/50 last:border-0">
                                                <td className="px-4 py-3 text-white font-medium">{item.title}</td>
                                                <td className="px-4 py-3 text-right text-neutral-300">{item.views}회</td>
                                                <td className="px-4 py-3 text-right text-lime-400 font-bold">{item.completes}회</td>
                                                <td className="px-4 py-3 text-right text-neutral-400">{item.conversionRate}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* 일자별 견적 데이터 상세 */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <h5 className="text-xs font-bold text-neutral-500">일자별 견적 데이터</h5>
                                <select
                                    value={quoteProductFilter}
                                    onChange={e => setQuoteProductFilter(e.target.value)}
                                    className="bg-neutral-950 border border-neutral-700 text-xs text-white px-3 py-1.5 rounded-lg outline-none"
                                >
                                    <option value="all">전체 상품</option>
                                    {quoteProductNames.map(name => (
                                        <option key={name} value={name}>{name}</option>
                                    ))}
                                </select>
                            </div>
                            {filteredQuoteDetails.length > 0 ? (
                                <div className="bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden max-h-[400px] overflow-y-auto">
                                    <table className="w-full text-sm">
                                        <thead className="sticky top-0 bg-neutral-950">
                                            <tr className="border-b border-neutral-800">
                                                <th className="text-left px-4 py-3 text-neutral-500 font-medium text-xs">날짜</th>
                                                <th className="text-left px-4 py-3 text-neutral-500 font-medium text-xs">상품</th>
                                                <th className="text-center px-4 py-3 text-neutral-500 font-medium text-xs">일정</th>
                                                <th className="text-center px-4 py-3 text-neutral-500 font-medium text-xs">인원</th>
                                                <th className="text-center px-4 py-3 text-neutral-500 font-medium text-xs">반려동물</th>
                                                <th className="text-right px-4 py-3 text-neutral-500 font-medium text-xs">견적금액</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredQuoteDetails.map((item, idx) => (
                                                <tr key={idx} className="border-b border-neutral-800/50 last:border-0">
                                                    <td className="px-4 py-3 text-neutral-400 text-xs">{item.date}</td>
                                                    <td className="px-4 py-3 text-white font-medium text-xs">{item.productTitle}</td>
                                                    <td className="px-4 py-3 text-center text-neutral-300 text-xs">
                                                        {item.dateType === 'weekday' ? '평일' : item.dateType === 'weekend' ? '주말' : item.dateType}
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-neutral-300 text-xs">
                                                        {item.people !== '-' ? `${item.people}명` : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-neutral-300 text-xs">
                                                        {item.pets !== '-' && item.pets > 0 ? `${item.pets}마리` : item.pets === 0 ? '없음' : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-lime-400 font-bold text-xs">
                                                        {item.totalCost !== '-' ? `${Number(item.totalCost).toLocaleString()}원` : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="bg-neutral-950 rounded-2xl border border-neutral-800 py-8 text-center">
                                    <p className="text-sm text-neutral-500">아직 견적 데이터가 없습니다.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <Icon name="Calculator" size={32} className="text-neutral-700 mx-auto mb-3" />
                        <p className="text-sm text-neutral-500">아직 견적 데이터가 없습니다.</p>
                    </div>
                )}
            </div>

            {/* 지역별 방문자 분석 */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8">
                <h4 className="text-sm font-bold text-neutral-400 mb-6 uppercase tracking-wider">지역별 방문자 분석</h4>
                {regionStats && regionStats.length > 0 ? (() => {
                    const maxVisits = Math.max(...regionStats.map(r => r.visits), 1);
                    return (
                        <div className="space-y-3">
                            {regionStats.map((item, idx) => (
                                <div key={item.region}>
                                    <button
                                        onClick={() => setExpandedRegion(expandedRegion === item.region ? null : item.region)}
                                        className="w-full text-left"
                                    >
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-white flex items-center gap-2">
                                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                                                    idx === 0 ? 'bg-lime-400/20 text-lime-400' :
                                                    idx === 1 ? 'bg-neutral-700 text-neutral-300' :
                                                    'bg-neutral-800 text-neutral-400'
                                                }`}>{idx + 1}</span>
                                                {item.region}
                                            </span>
                                            <span className="text-neutral-400 text-xs flex items-center gap-3">
                                                <span>방문 <b className="text-white">{item.visits}</b></span>
                                                <span>견적 <b className="text-lime-400">{item.quoteCompletes}</b></span>
                                                <span>상담 <b className="text-yellow-400">{item.ctaClicks}</b></span>
                                            </span>
                                        </div>
                                        <div className="w-full h-2.5 bg-neutral-950 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    idx === 0 ? 'bg-lime-400' : idx === 1 ? 'bg-lime-500/60' : 'bg-neutral-600'
                                                }`}
                                                style={{ width: `${(item.visits / maxVisits) * 100}%` }}
                                            />
                                        </div>
                                    </button>

                                    {/* 도시별 세부 목록 (확장) */}
                                    {expandedRegion === item.region && item.cities.length > 0 && (
                                        <div className="mt-2 ml-8 space-y-1.5 pb-2">
                                            {item.cities.map(c => (
                                                <div key={c.city} className="flex justify-between items-center text-xs bg-neutral-950 rounded-lg px-3 py-2 border border-neutral-800">
                                                    <span className="text-neutral-300">{c.city}</span>
                                                    <span className="text-neutral-500 font-bold">{c.visits}명</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    );
                })() : (
                    <div className="text-center py-8">
                        <Icon name="PieChart" size={32} className="text-neutral-700 mx-auto mb-3" />
                        <p className="text-sm text-neutral-500">아직 지역 데이터가 없습니다.</p>
                        <p className="text-xs text-neutral-600 mt-1">방문자가 접속하면 IP 기반으로 지역이 자동 감지됩니다.</p>
                    </div>
                )}
            </div>

            {/* 블로그 조회수 순위 + FAQ 인기 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 블로그 조회수 순위 */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6">
                        <h4 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">블로그 조회수 순위</h4>
                        <select
                            value={blogProductFilter}
                            onChange={e => setBlogProductFilter(e.target.value)}
                            className="bg-neutral-950 border border-neutral-700 text-xs text-white px-3 py-1.5 rounded-lg outline-none"
                        >
                            <option value="all">전체</option>
                            {blogProductNames.map(name => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                    </div>
                    {currentBlogRankings.length > 0 ? (
                        <div className="space-y-3">
                            {currentBlogRankings.slice(0, 10).map((blog, idx) => (
                                <div key={blog.blogTitle} className="bg-neutral-950 rounded-xl p-3.5 border border-neutral-800 flex items-center gap-3">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                                        idx === 0 ? 'bg-lime-400/20 text-lime-400' :
                                        idx === 1 ? 'bg-neutral-700 text-neutral-300' :
                                        'bg-neutral-800 text-neutral-400'
                                    }`}>
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm font-medium truncate">{blog.blogTitle}</p>
                                    </div>
                                    <span className="text-neutral-500 text-xs font-bold shrink-0">{blog.count}회</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Icon name="FileText" size={32} className="text-neutral-700 mx-auto mb-3" />
                            <p className="text-sm text-neutral-500">아직 블로그 조회 데이터가 없습니다.</p>
                        </div>
                    )}
                </div>

                {/* FAQ 인기 순위 */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8">
                    <h4 className="text-sm font-bold text-neutral-400 mb-6 uppercase tracking-wider">FAQ 관심도 TOP</h4>
                    {faqEngagement.length > 0 ? (
                        <div className="space-y-3">
                            {faqEngagement.slice(0, 5).map((faq, idx) => (
                                <div key={faq.question} className="bg-neutral-950 rounded-xl p-3.5 border border-neutral-800 flex items-center gap-3">
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                                        idx === 0 ? 'bg-lime-400/20 text-lime-400' : 'bg-neutral-800 text-neutral-400'
                                    }`}>
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm font-medium truncate">{faq.question}</p>
                                    </div>
                                    <span className="text-neutral-500 text-xs font-bold shrink-0">{faq.openCount}회</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Icon name="HelpCircle" size={32} className="text-neutral-700 mx-auto mb-3" />
                            <p className="text-sm text-neutral-500">아직 FAQ 데이터가 없습니다.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 전화문의 일별 현황 */}
            {phoneDailyList.length > 0 && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 md:p-8">
                    <h4 className="text-sm font-bold text-neutral-400 mb-6 uppercase tracking-wider">전화문의 일별 현황</h4>
                    <div className="bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-neutral-800">
                                    <th className="text-left px-4 py-3 text-neutral-500 font-medium text-xs">날짜</th>
                                    <th className="text-right px-4 py-3 text-neutral-500 font-medium text-xs">전화문의 횟수</th>
                                </tr>
                            </thead>
                            <tbody>
                                {phoneDailyList.slice(0, 14).map(item => (
                                    <tr key={item.date} className="border-b border-neutral-800/50 last:border-0">
                                        <td className="px-4 py-3 text-neutral-300">{item.date}</td>
                                        <td className="px-4 py-3 text-right text-blue-400 font-bold">{item.count}건</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
