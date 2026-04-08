import { useState, useEffect } from "react";
import {
    Link2, LayoutGrid, Type, GalleryHorizontal, Video, Minus, Calendar, BookOpen, Image, HelpCircle,
    LayoutDashboard, Package, PencilRuler, FileText, PieChart, Settings, MonitorPlay, ExternalLink, Rocket, Menu, Smartphone, X, Plus, GripVertical, Trash2, ArrowUpRight, Play, Eye, Inbox, Camera, ChevronLeft, ChevronRight,
    Save, ImagePlus, ChevronUp, ChevronDown, AlignLeft, AlignCenter, AlignRight, Bold, Underline,
    Home, MessageCircle, Phone
} from "lucide-react";

export const Icons = {
    Link2,
    LayoutGrid,
    Type,
    GalleryHorizontal,
    Video,
    Minus,
    Calendar,
    BookOpen,
    Image,
    HelpCircle,
    LayoutDashboard,
    Package,
    PencilRuler,
    FileText,
    PieChart,
    Settings,
    MonitorPlay,
    ExternalLink,
    Rocket,
    Menu,
    Smartphone,
    X,
    Plus,
    GripVertical,
    Trash2,
    ArrowUpRight,
    Play,
    Eye,
    Inbox,
    Camera,
    ChevronLeft,
    ChevronRight,
    Save,
    ImagePlus,
    ChevronUp,
    ChevronDown,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Bold,
    Underline,
    Home,
    MessageCircle,
    Phone
};

export const BLOCK_TYPES = [
    { id: 'link', label: '링크', icon: 'Link2', color: 'bg-orange-500', iconColor: 'text-orange-100' },
    { id: 'collection', label: '컬렉션', icon: 'LayoutGrid', color: 'bg-yellow-500', iconColor: 'text-yellow-100' },
    { id: 'text', label: '텍스트', icon: 'Type', color: 'bg-emerald-500', iconColor: 'text-emerald-100' },
    { id: 'image', label: '이미지', icon: 'Image', color: 'bg-blue-500', iconColor: 'text-blue-100' },
    { id: 'slide', label: '슬라이드', icon: 'GalleryHorizontal', color: 'bg-pink-500', iconColor: 'text-pink-100' },
    { id: 'video', label: '동영상', icon: 'Video', color: 'bg-indigo-500', iconColor: 'text-indigo-100' },
    { id: 'divider', label: '구분선', icon: 'Minus', color: 'bg-lime-500', iconColor: 'text-lime-100' },
    { id: 'schedule', label: '일정', icon: 'Calendar', color: 'bg-rose-500', iconColor: 'text-rose-100' },
    { id: 'diary', label: '일기', icon: 'BookOpen', color: 'bg-neutral-600', iconColor: 'text-neutral-100' }
];

export const initialBlocks = {
    1: [
        { id: 1, type: 'slide', title: '포트레이트 화보 슬라이더', icon: 'GalleryHorizontal' },
        { id: 2, type: 'text', title: '포트레이트 소개 문구', icon: 'Type' }
    ],
    2: [
        { id: 3, type: 'text', title: '가족의 따뜻함을 기록합니다', icon: 'Type' },
        { id: 4, type: 'collection', title: '헤리티지 패밀리 갤러리', icon: 'LayoutGrid' }
    ],
    3: [
        { id: 5, type: 'video', title: '시즈널 커플 스냅 스케치', icon: 'Video' },
        { id: 6, type: 'schedule', title: '계절 화보 예약 캘린더', icon: 'Calendar' }
    ]
};
