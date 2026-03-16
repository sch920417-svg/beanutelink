import React, { useEffect } from 'react';
import { Routes, Route, Link, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../../data/links';
import { trackEvent, EVENT_TYPES, initLocationDetection } from '../../utils/analytics';

const Icon = ({ name, size = 24, className = "" }) => {
    const Comp = Icons[name] || Icons.HelpCircle;
    return Comp ? <Comp size={size} className={className} /> : null;
};

// 페이지 트랜지션용 variants
const pageVariants = {
    initial: { opacity: 0, y: 15, scale: 0.99 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.3, ease: 'easeInOut' } }
};

// 아이템 스태거 애니메이션
const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

// 공유 헤더 컴포넌트 (프로필 + 네비게이션 + 탭)
function PublicHeader({ settings, product, isDetail, blogsCount, productId }) {
    return (
        <div className="w-full bg-white/80 backdrop-blur-xl z-40 sticky top-0 border-b border-black/5">
            {/* 1. 프로필 영역 (메인 디테일 헤더) */}
            <div className="bg-gradient-to-b from-neutral-50/50 to-white/80 pt-24 pb-6 px-6 text-center flex flex-col items-center justify-center gap-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none"></div>
                
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="relative group cursor-pointer"
                >
                    {settings.profileImage ? (
                        <div className="relative pt-4 px-4 pb-2">
                            <div className="absolute inset-x-4 top-4 bottom-2 rounded-full bg-neutral-900 blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                            <img src={settings.profileImage} className="w-24 h-24 rounded-full object-cover shadow-xl ring-[6px] ring-white relative z-10 transition-transform duration-500 group-hover:scale-105" alt="Profile" />
                        </div>
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-neutral-100 flex items-center justify-center ring-[6px] ring-white text-neutral-300 shadow-xl relative z-10 transition-transform duration-500 group-hover:scale-105">
                            <Icon name="Camera" size={32} />
                        </div>
                    )}
                </motion.div>
                
                <div className="z-10 space-y-1">
                    <h1 className="font-extrabold text-[22px] tracking-tight text-neutral-900">{settings.brandName || '비뉴뜨 스튜디오'}</h1>
                    <p className="text-neutral-500 text-[13px] font-medium tracking-wide">{settings.greeting || '당신이 가장 빛나는 찰나를 기록합니다.'}</p>
                </div>
            </div>

            {/* 2. 네비게이션 영역 */}
            <div className="px-6 py-4 flex items-center justify-between border-t border-black/5 bg-white/50">
                <Link to="/" className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-400 hover:text-neutral-900 transition-colors tracking-[0.2em] uppercase w-20 group">
                    <motion.div whileHover={{ x: -2 }} className="flex items-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1 group-hover:text-neutral-900 transition-colors"><path d="m15 18-6-6 6-6" /></svg>
                        HOME
                    </motion.div>
                </Link>
                <h2 className="font-bold text-[14px] tracking-tight text-neutral-900 flex-1 text-center truncate px-2">{product.title}</h2>
                <div className="w-20"></div>
            </div>

            {/* 3. 탭 영역 */}
            <div className="px-6 pb-4 bg-white/50">
                <div className="flex bg-neutral-100/80 p-1.5 rounded-[1.25rem] relative">
                    <Link to={`/detail/${productId}`} className="flex-1 text-center py-3.5 relative z-10">
                        <span className={`text-[13px] font-bold transition-colors duration-300 ${isDetail ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-700'}`}>
                            상품 상세
                        </span>
                    </Link>
                    <Link to={`/blog/${productId}`} className="flex-1 text-center py-3.5 relative z-10 flex items-center justify-center gap-1.5 group/tab">
                        <span className={`text-[13px] font-bold transition-colors duration-300 ${!isDetail ? 'text-neutral-900' : 'text-neutral-500 group-hover/tab:text-neutral-700'}`}>
                            블로그
                        </span>
                    </Link>
                    
                    {/* Animated Tab Background */}
                    <motion.div 
                        className="absolute inset-y-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.06)] border border-black/[0.02]"
                        initial={false}
                        animate={{ left: isDetail ? '6px' : 'calc(50% + 3px)' }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                </div>
            </div>
        </div>
    );
}

// 메인 대표 링크 뷰
export function PublicMainView({ products, settings }) {
    useEffect(() => {
        initLocationDetection().then(() => {
            trackEvent(EVENT_TYPES.PAGE_VIEW, { page: '/' });
        });
    }, []);

    return (
        <AnimatePresence mode="wait">
            <motion.div 
                key="main"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="min-h-screen bg-neutral-50 flex flex-col items-center selection:bg-neutral-900 selection:text-white"
            >
                <div className="w-full max-w-md bg-white min-h-screen shadow-[0_0_40px_rgba(0,0,0,0.05)] flex flex-col relative font-sans text-neutral-900 overflow-hidden">
                    
                    {/* Hero Section */}
                    <div className="bg-gradient-to-b from-neutral-100/50 to-white pt-16 pb-12 px-6 text-center flex flex-col items-center justify-center gap-5 relative">
                        {/* Soft Ambient Glows */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-lime-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-200/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3"></div>

                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0, y: 20 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }} 
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className="relative group"
                        >
                            <div className="absolute inset-0 rounded-full bg-neutral-900 blur-xl opacity-10 group-hover:opacity-20 transition-opacity duration-700"></div>
                            {settings.profileImage ? (
                                <img src={settings.profileImage} className="w-[100px] h-[100px] rounded-full object-cover shadow-2xl ring-8 ring-white relative z-10 transition-transform duration-700 group-hover:scale-[1.03]" alt="Profile" />
                            ) : (
                                <div className="w-[100px] h-[100px] rounded-full bg-neutral-100 flex items-center justify-center ring-8 ring-white text-neutral-300 shadow-2xl relative z-10 transition-transform duration-700 group-hover:scale-[1.03]">
                                    <Icon name="Camera" size={36} />
                                </div>
                            )}
                        </motion.div>
                        
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: 0.1, duration: 0.6 }}
                            className="z-10 space-y-2 mt-2"
                        >
                            <h1 className="font-extrabold text-3xl tracking-tighter text-neutral-900">{settings.brandName || '비뉴뜨 스튜디오'}</h1>
                            <p className="text-neutral-500 text-[14px] font-medium tracking-wide leading-relaxed px-4">{settings.greeting || '당신이 가장 빛나는 찰나를 기록합니다.'}</p>
                        </motion.div>
                    </div>

                    <div className="flex-1 px-6 pb-20 bg-white relative z-10 rounded-t-[2.5rem] pt-8 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] border-t border-neutral-100">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-neutral-200 to-transparent"></div>
                            <div className="text-center">
                                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.3em]">Signature</span>
                                <h2 className="text-[17px] font-extrabold text-neutral-900 tracking-tight mt-0.5">Services</h2>
                            </div>
                            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-neutral-200 to-transparent"></div>
                        </div>

                        <motion.div 
                            variants={containerVariants}
                            initial="initial"
                            animate="animate"
                            className="space-y-6"
                        >
                            {products.map((p, idx) => (
                                <motion.div key={p.id} variants={itemVariants}>
                                    <Link to={`/detail/${p.id}`} className="block rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 active:scale-[0.97] flex flex-col group relative bg-white border border-neutral-100/80">
                                        <div className={`${p.ratio === '1:1' ? 'aspect-square' : p.ratio === '4:5' ? 'aspect-[4/5]' : 'aspect-video'} bg-neutral-100 flex items-center justify-center relative shrink-0 overflow-hidden`}>
                                            {p.image ? (
                                                <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-[0.22,1,0.36,1]" alt={p.title} />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
                                                    <Icon name="Image" size={40} className="text-neutral-300 group-hover:scale-110 transition-transform duration-700" />
                                                </div>
                                            )}
                                            
                                            {/* Advanced Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-7 text-white opacity-90 group-hover:opacity-100 transition-opacity duration-500">
                                                <motion.div 
                                                    className="translate-y-2 group-hover:translate-y-0 transition-transform duration-500 ease-[0.22,1,0.36,1]"
                                                >
                                                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold tracking-widest uppercase mb-3 text-white/90 shadow-sm border border-white/10">
                                                        PORTFOLIO {String(idx + 1).padStart(2, '0')}
                                                    </span>
                                                    <h3 className="text-2xl font-extrabold mb-2 tracking-tight drop-shadow-lg leading-tight">{p.title}</h3>
                                                    <p className="text-[14px] text-white/80 font-medium leading-relaxed drop-shadow-md line-clamp-2">{p.desc}</p>
                                                </motion.div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

// 상품 상세 블록 뷰
export function PublicProductView({ products, blocks, blogs, settings }) {
    const { productId } = useParams();
    const product = products.find(p => p.id === parseInt(productId));
    const currentBlocks = blocks[productId] || [];
    const blogsCount = (blogs[productId] || []).length;

    useEffect(() => {
        if (product) {
            trackEvent(EVENT_TYPES.PRODUCT_VIEW, { productId: parseInt(productId), productTitle: product.title });
        }
    }, [productId, product]);

    if (!product) return <div className="p-8 text-center text-neutral-500">상품을 찾을 수 없습니다.</div>;

    const renderBlock = (b) => {
        switch (b.type) {
            case 'text':
                return (
                    <div className="py-2 px-1">
                        <p className="text-neutral-700 leading-[1.8] whitespace-pre-wrap text-[15px] font-medium tracking-wide">
                            {b.content || b.title}
                        </p>
                    </div>
                );
            case 'image':
                return (
                    <div className="rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-black/[0.03]">
                        {b.image ? (
                            <img src={b.image} className="w-full object-cover" alt="" />
                        ) : (
                            <div className="aspect-[4/3] bg-neutral-100 flex items-center justify-center">
                                <Icon name="Image" size={32} className="text-neutral-300" />
                            </div>
                        )}
                    </div>
                );
            case 'link':
                return (
                    <a href={b.url} target="_blank" rel="noreferrer" className="block p-5 bg-white flex items-center justify-between border border-neutral-200/60 hover:border-neutral-400 hover:shadow-lg active:scale-[0.98] transition-all duration-300 rounded-[1.5rem] font-bold text-neutral-900 group shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                        <span className="flex items-center gap-4">
                            <span className="w-12 h-12 rounded-[1rem] bg-neutral-50 flex items-center justify-center text-neutral-500 group-hover:bg-neutral-900 group-hover:text-white transition-colors duration-300">
                                <Icon name="Link2" size={20} />
                            </span>
                            <span className="text-[15px] tracking-tight">{b.title}</span>
                        </span>
                        <div className="w-8 h-8 rounded-full bg-neutral-50 flex items-center justify-center group-hover:bg-neutral-100 transition-colors">
                            <Icon name="ArrowUpRight" size={16} className="text-neutral-400 group-hover:text-black transition-colors" />
                        </div>
                    </a>
                );
            case 'divider':
                return (
                    <div className="flex items-center justify-center py-8">
                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 mx-1"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 mx-1 opacity-50"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 mx-1 opacity-25"></div>
                    </div>
                );
            case 'collection':
            case 'slide':
                return (
                    <div className="py-4 -mx-6">
                        <p className="font-extrabold text-neutral-900 mb-4 text-xl px-8 tracking-tight">{b.title}</p>
                        <div className="flex gap-4 overflow-x-auto pb-6 pt-2 custom-scrollbar px-6 snap-x snap-mandatory">
                            {[1, 2, 3].map((i) => (
                                <motion.div 
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    key={i} 
                                    className="w-[260px] aspect-[4/5] bg-neutral-100 shrink-0 rounded-[2rem] snap-center shadow-[0_8px_20px_rgba(0,0,0,0.04)] border border-black/[0.02] flex items-center justify-center"
                                >
                                    <Icon name="Image" className="text-neutral-300 opacity-50" size={32} />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                );
            case 'video':
                if (b.videoObjectUrl) {
                    return (
                        <div className="rounded-[2rem] overflow-hidden shadow-2xl">
                            <video src={b.videoObjectUrl} controls className="w-full" preload="metadata" />
                        </div>
                    );
                }
                return (
                    <div className="aspect-[16/9] bg-neutral-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500"></div>
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white ring-1 ring-white/30 group-hover:scale-110 transition-transform duration-500">
                            <Icon name="Play" size={24} className="ml-1" />
                        </div>
                    </div>
                );
            case 'schedule':
                return (
                    <div className="p-8 bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-neutral-100">
                        <h4 className="font-extrabold mb-6 text-center text-lg tracking-tight text-neutral-900">{b.title}</h4>
                        <div className="aspect-square bg-neutral-50 rounded-[1.5rem] flex items-center justify-center text-neutral-400 border border-neutral-200/50">
                            <div className="text-center space-y-2">
                                <Icon name="Calendar" size={32} className="mx-auto mb-3 opacity-50" />
                                <p className="font-medium text-sm">연동된 캘린더 위젯</p>
                            </div>
                        </div>
                    </div>
                );
            case 'diary':
                return (
                    <div className="p-8 bg-neutral-900 rounded-[2rem] text-center text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/20 blur-3xl rounded-full pointer-events-none"></div>
                        <h4 className="font-extrabold mb-3 text-lg tracking-tight relative z-10">{b.title}</h4>
                        <p className="text-[13px] font-medium text-white/60 relative z-10 w-3/4 mx-auto leading-relaxed">
                            이 영역에는 작성된 스토리보드나 다이어리가 연동되어 표시됩니다.
                        </p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div 
                key="detail"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="min-h-screen bg-neutral-50 flex flex-col items-center selection:bg-neutral-900 selection:text-white pb-32"
            >
                <div className="w-full max-w-md bg-white min-h-screen shadow-[0_0_40px_rgba(0,0,0,0.05)] flex flex-col relative font-sans text-neutral-900">
                    <PublicHeader settings={settings} product={product} isDetail={true} blogsCount={blogsCount} productId={productId} />

                    {/* Blocks */}
                    <div className="px-6 py-8 space-y-10 flex-1 bg-white">
                        {currentBlocks.length > 0 ? (
                            <motion.div 
                                variants={containerVariants}
                                initial="initial"
                                animate="animate"
                                className="space-y-10"
                            >
                                {currentBlocks.map(b => (
                                    <motion.div key={b.id} variants={itemVariants}>
                                        {renderBlock(b)}
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <div className="py-20 text-center flex flex-col items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mb-4">
                                    <Icon name="Inbox" size={24} className="text-neutral-300" />
                                </div>
                                <p className="text-neutral-400 font-medium text-sm">등록된 콘텐츠가 없습니다.</p>
                            </div>
                        )}
                    </div>

                    {/* 
                    Reservation Button temporarily hidden 
                    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none flex justify-center">
                        ...
                    </div>
                    */}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

// 상품별 블로그 리스트 뷰
export function PublicBlogListView({ products, blogs, settings }) {
    const { productId } = useParams();
    const product = products.find(p => p.id === parseInt(productId));
    const currentBlogs = blogs[productId] || [];
    const blogsCount = currentBlogs.length;

    useEffect(() => {
        if (product) {
            trackEvent(EVENT_TYPES.BLOG_VIEW, { productId: parseInt(productId), productTitle: product.title });
        }
    }, [productId, product]);

    if (!product) return <div className="p-8 text-center">상품을 찾을 수 없습니다.</div>;

    return (
        <AnimatePresence mode="wait">
            <motion.div 
                key="blog"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="min-h-screen bg-neutral-50 flex flex-col items-center selection:bg-neutral-900 selection:text-white"
            >
                <div className="w-full max-w-md bg-white min-h-screen shadow-[0_0_40px_rgba(0,0,0,0.05)] flex flex-col relative font-sans text-neutral-900">
                    <PublicHeader settings={settings} product={product} isDetail={false} blogsCount={blogsCount} productId={productId} />

                    <div className="px-6 py-8 flex-1 bg-white">
                        <motion.div 
                            variants={containerVariants}
                            initial="initial"
                            animate="animate"
                            className="grid grid-cols-2 gap-4"
                        >
                            {currentBlogs.length > 0 ? (
                                currentBlogs.map(b => (
                                    <motion.a variants={itemVariants} href="#" key={b.id} className="block group flex flex-col h-full">
                                        <div className="aspect-square bg-neutral-100 rounded-[1.5rem] overflow-hidden mb-3 relative shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-black/[0.02] shrink-0">
                                            <div className="w-full h-full flex items-center justify-center text-neutral-300 bg-neutral-50 group-hover:scale-[1.05] transition-transform duration-700 ease-[0.22,1,0.36,1]">
                                                <Icon name="Image" size={32} className="opacity-50" />
                                            </div>
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500"></div>
                                        </div>
                                        <div className="px-1 flex-1 flex flex-col">
                                            <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-neutral-100/80 text-neutral-500 mb-2 self-start tracking-wide truncate max-w-full">{b.tag}</span>
                                            <h3 className="text-[14px] font-bold text-neutral-900 leading-[1.4] group-hover:text-neutral-500 transition-colors tracking-tight line-clamp-2">{b.title}</h3>
                                        </div>
                                    </motion.a>
                                ))
                            ) : (
                                <div className="py-20 text-center flex flex-col items-center justify-center">
                                    <div className="w-16 h-16 rounded-full bg-neutral-50 flex items-center justify-center mb-4">
                                        <Icon name="FileText" size={24} className="text-neutral-300" />
                                    </div>
                                    <p className="text-neutral-400 font-medium text-sm">등록된 블로그 게시글이 없습니다.</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
