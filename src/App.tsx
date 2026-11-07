import React, { useEffect, useMemo, useState } from 'react';
import {
  CATEGORY_LABELS,
  MEMBERS,
  TEAM_INFO,
  type AceVivaMember,
  type MemberCategory,
} from './data/members';
import { MemberPortrait } from './components/MemberPortrait';
import { MemberDetailDialog } from './components/MemberDetailDialog';
import { GirlSeatRecommendationSection } from './components/GirlSeatRecommendationSection';
import { SeatFinderSection } from './components/SeatFinderSection';
import { ScheduleSection } from './components/ScheduleSection';
import { ZodiacIcon, isCurrentMonthBirthday } from './components/ZodiacIcon';
import {
  STATION_ROTATION_SCHEDULES,
  getSeatPositionMapping,
  type AceZoneId,
} from './data/schedule';

type RosterFilter = 'all' | MemberCategory | 'favorites' | 'birthday_month';
type SortOption = 'default' | 'number_asc' | 'birthday_asc';

const FAVORITES_STORAGE_KEY = 'ace_viva_favorites_v1';
const USER_SEAT_STORAGE_KEY = 'ace_viva_user_seat_v1';

function parseBirthdaySortKey(birthdayStr: string): number {
  const match = birthdayStr.match(/(\d+)\s*月\s*(\d+)\s*日/);
  if (!match) return 9999;
  return parseInt(match[1], 10) * 100 + parseInt(match[2], 10);
}

export const App: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<RosterFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [selectedMember, setSelectedMember] = useState<AceVivaMember | null>(
    null
  );
  const [isTeamIntroOpen, setIsTeamIntroOpen] = useState(false);
  const [scheduleMemberFilter, setScheduleMemberFilter] = useState<
    string | 'all' | 'favorites'
  >('all');
  const [seatSimulatorJump, setSeatSimulatorJump] = useState<{
    matchId: string;
    zone: AceZoneId;
    seat: number;
    girlId?: string;
    timestamp: number;
  } | null>(null);
  const [currentUserSeat, setCurrentUserSeat] = useState<{
    matchId: string;
    zone: AceZoneId;
    seat: number;
  }>(() => {
    try {
      const saved = localStorage.getItem(USER_SEAT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.zone && parsed.seat) {
          return {
            matchId: parsed.matchId || '2026-11-07',
            zone: parsed.zone as AceZoneId,
            seat: Number(parsed.seat) || 12,
          };
        }
      }
    } catch {
      // Ignore storage errors
    }
    return { matchId: '2026-11-07', zone: 'B', seat: 12 };
  });
  const [copiedCardKey, setCopiedCardKey] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(
        USER_SEAT_STORAGE_KEY,
        JSON.stringify(currentUserSeat)
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [currentUserSeat]);

  const currentMonth = new Date().getMonth() + 1;

  const handleCopyMemberInfo = async (
    text: string,
    key: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopiedCardKey(key);
    window.setTimeout(() => {
      setCopiedCardKey((prev) => (prev === key ? null : prev));
    }, 1800);
  };

  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['yuri', 'chayounghyun'];
    } catch {
      return ['yuri', 'chayounghyun'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteIds));
    } catch {
      // Ignore storage quota errors
    }
  }, [favoriteIds]);

  const toggleFavorite = (id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectScheduleMemberFromModal = (memberId: string) => {
    setScheduleMemberFilter(memberId);
    const el = document.getElementById('schedule-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Compute category counts
  const categoryCounts = useMemo(() => {
    return {
      all: MEMBERS.length,
      leader: MEMBERS.filter((m) => m.category === 'leader').length,
      mc: MEMBERS.filter((m) => m.category === 'mc').length,
      tw_member: MEMBERS.filter((m) => m.category === 'tw_member').length,
      kr_member: MEMBERS.filter((m) => m.category === 'kr_member').length,
      favorites: favoriteIds.length,
      birthday_month: MEMBERS.filter((m) =>
        isCurrentMonthBirthday(m.birthday, currentMonth)
      ).length,
    };
  }, [favoriteIds, currentMonth]);

  // 計算「自己座位正前方女孩」映射表（依據使用者目前選擇的場次、區域與座位號 1-23 號）
  const frontSeatMemberMap = useMemo(() => {
    const schedule =
      STATION_ROTATION_SCHEDULES.find(
        (s) => s.matchId === currentUserSeat.matchId
      ) ?? STATION_ROTATION_SCHEDULES[0];
    const slotIndex = getSeatPositionMapping(currentUserSeat.seat).slotIndex;
    const map = new Map<
      string,
      {
        order: number;
        setsList: string[];
        setsLabel: string;
        setsShortLabel: string;
      }
    >();

    let orderCounter = 0;
    for (const setObj of schedule.sets) {
      // 破 10 分後佔單局 60% 時間，優先列入同局正前方順序，其次為開局 0-10 分
      const after10GirlId =
        setObj.after10Points[currentUserSeat.zone][slotIndex];
      const initGirlId = setObj.initial[currentUserSeat.zone][slotIndex];

      for (const gId of [after10GirlId, initGirlId]) {
        if (!gId) continue;
        const existing = map.get(gId);
        if (!existing) {
          orderCounter += 1;
          map.set(gId, {
            order: orderCounter,
            setsList: [setObj.setShortLabel],
            setsLabel: setObj.setShortLabel,
            setsShortLabel: setObj.setShortLabel.replace(/\s+/g, ''),
          });
        } else if (!existing.setsList.includes(setObj.setShortLabel)) {
          existing.setsList.push(setObj.setShortLabel);
          existing.setsLabel = existing.setsList.join('、');
          existing.setsShortLabel = existing.setsList
            .join('/')
            .replace(/\s+/g, '');
        }
      }
    }
    return map;
  }, [currentUserSeat]);

  // Filtered and sorted members (1. 主推成員最優先 -> 2. 自己座位前面的女孩次之 -> 3. 其餘成員)
  const displayedMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = MEMBERS.filter((m) => {
      if (activeCategory === 'favorites') {
        if (!favoriteIds.includes(m.id)) return false;
      } else if (activeCategory === 'birthday_month') {
        if (!isCurrentMonthBirthday(m.birthday, currentMonth)) return false;
      } else if (activeCategory !== 'all' && m.category !== activeCategory) {
        return false;
      }

      if (!q) return true;
      const haystack = [
        m.name,
        m.realOrAltName ?? '',
        m.englishOrKoreanName,
        m.number,
        `#${m.number}`,
        m.mbti,
        m.instagramHandle,
        m.roleBadge,
        m.bio,
        ...m.dualTeams,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });

    return [...filtered].sort((a, b) => {
      // 第一優先：我的主推成員
      const aFavIndex = favoriteIds.indexOf(a.id);
      const bFavIndex = favoriteIds.indexOf(b.id);
      const aIsFav = aFavIndex !== -1;
      const bIsFav = bFavIndex !== -1;
      if (aIsFav !== bIsFav) {
        return aIsFav ? -1 : 1;
      }

      // 第二優先：自己座位正前面的女孩
      const aFront = frontSeatMemberMap.get(a.id);
      const bFront = frontSeatMemberMap.get(b.id);
      const aIsFront = Boolean(aFront);
      const bIsFront = Boolean(bFront);
      if (aIsFront !== bIsFront) {
        return aIsFront ? -1 : 1;
      }

      // 同為座位正前方女孩且預設排序時，依登場局數順序排列
      if (aFront && bFront && sortBy === 'default') {
        if (aFront.order !== bFront.order) {
          return aFront.order - bFront.order;
        }
      }

      // 第三層：依使用者選擇的排序條件（背號 / 生日 / 預設編制）
      if (sortBy === 'number_asc') {
        return a.numericOrder - b.numericOrder;
      }
      if (sortBy === 'birthday_asc') {
        return (
          parseBirthdaySortKey(a.birthday) - parseBirthdaySortKey(b.birthday)
        );
      }
      if (aIsFav && bIsFav) {
        return aFavIndex - bFavIndex;
      }
      return 0;
    });
  }, [
    activeCategory,
    searchQuery,
    sortBy,
    favoriteIds,
    currentMonth,
    frontSeatMemberMap,
  ]);

  // Featured members for Hero Bento
  const captainYuri = MEMBERS.find((m) => m.id === 'yuri')!;
  const leaderMamai = MEMBERS.find((m) => m.id === 'mamai')!;
  const koreanAces = MEMBERS.filter((m) => m.category === 'kr_member');

  return (
    <div className="relative min-h-[100dvh] w-full overflow-x-hidden bg-[#F4FAF8] pb-20 text-[#212047] lg:pb-0">
      {/* Fixed Film Grain Overlay */}
      <div className="editorial-grain" aria-hidden="true" />

      {/* Responsive Top Navigation Bar (Single-Row Non-Wrapping on Mobile + Full Pill on Desktop) */}
      <header className="fixed inset-x-0 top-0 z-30 flex justify-center px-2 pt-2.5 pointer-events-none sm:px-4 sm:pt-4">
        <nav
          aria-label="主要導覽列"
          className="pointer-events-auto flex w-full max-w-[calc(100vw-1rem)] items-center justify-between gap-1 rounded-full bg-[#212047]/95 p-1.5 text-white shadow-[0_16px_40px_rgba(33,32,71,0.32)] ring-1 ring-[#5ECBC0]/30 backdrop-blur-2xl sm:max-w-fit sm:gap-2 sm:px-3 lg:gap-2.5 lg:px-4 lg:py-2"
        >
          <a
            href="#roster-section"
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 py-1 pr-2.5 pl-1.5 text-xs font-extrabold tracking-wider text-white whitespace-nowrap transition-colors hover:bg-white/20 sm:gap-2 sm:pr-3 lg:text-sm"
          >
            <img
              src={TEAM_INFO.logoPath}
              alt="粉絲自製應援雷達圖示"
              className="h-5 w-5 shrink-0 rounded-lg object-contain sm:h-6 sm:w-6 lg:h-7 lg:w-7"
            />
            <span>連莊女孩</span>
            <span className="hidden rounded-full bg-[#5BAE84]/35 px-2 py-0.5 font-mono-num text-[9px] font-bold tracking-normal text-[#7ADAD0] ring-1 ring-[#5ECBC0]/40 sm:inline-block lg:text-xs">
              粉絲自製
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-1.5 lg:flex">
            <a
              href="#roster-section"
              className="rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-extrabold text-white whitespace-nowrap transition-colors hover:bg-white/20 hover:text-[#7ADAD0] xl:text-base"
            >
              成員圖鑑 ({MEMBERS.length})
            </a>
            <a
              href="#girl-seat-guide-section"
              className="rounded-full bg-[#5BAE84] px-4 py-1.5 text-sm font-extrabold text-white whitespace-nowrap transition-colors hover:bg-[#4FA87D] xl:text-base"
            >
              女孩選位推薦
            </a>
            <a
              href="#seat-finder-section"
              className="rounded-full bg-[#5BAE84]/20 px-3.5 py-1.5 text-sm font-extrabold text-[#7ADAD0] whitespace-nowrap ring-1 ring-[#5ECBC0]/35 transition-colors hover:bg-[#5BAE84] hover:text-white xl:text-base"
            >
              23 席面前女孩查詢
            </a>
            <a
              href="#schedule-section"
              className="rounded-full px-3.5 py-1.5 text-sm font-semibold text-white/80 whitespace-nowrap transition-colors hover:bg-white/10 hover:text-[#7ADAD0] xl:text-base"
            >
              應援班表
            </a>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
            {/* 頁首「啦啦隊介紹」點選開啟按鈕（手機與電腦皆常駐於頁首） */}
            <button
              type="button"
              onClick={() => setIsTeamIntroOpen(true)}
              className="flex items-center gap-1 rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-extrabold text-[#7ADAD0] whitespace-nowrap ring-1 ring-[#5ECBC0]/45 transition-all hover:bg-[#5BAE84] hover:text-white sm:px-3 sm:py-1.5 sm:text-xs lg:px-3.5 lg:text-sm"
            >
              <span>啦啦隊介紹</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveCategory('favorites');
                document
                  .getElementById('roster-section')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1 rounded-full bg-[#5BAE84]/25 px-2 py-1 text-[11px] font-bold text-[#7ADAD0] whitespace-nowrap ring-1 ring-[#5BAE84]/45 transition-all hover:bg-[#5BAE84] hover:text-white sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs lg:px-3.5 lg:text-sm"
            >
              <span>我的主推</span>
              <span className="rounded-full bg-[#5BAE84] px-1.5 py-0.2 font-mono-num text-[10px] font-extrabold text-white lg:text-xs">
                {favoriteIds.length}
              </span>
            </button>

            <a
              href={TEAM_INFO.officialInstagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center gap-1 rounded-full bg-[#5BAE84] px-2.5 py-1 text-[11px] font-extrabold text-white whitespace-nowrap transition-transform hover:bg-[#4FA87D] active:scale-[0.97] sm:px-3 sm:py-1.5 sm:text-xs lg:px-4 lg:text-sm"
            >
              <span>官方 IG</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </nav>
      </header>

      {/* Mobile Fixed Bottom Quick-Navigation Bar (Thumb-Friendly 4 Core Sections - Pure Chinese) */}
      <nav
        aria-label="手機版底部快速導覽列"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-[#5ECBC0]/25 bg-[#212047]/95 px-2 py-2 text-white shadow-[0_-10px_30px_rgba(33,32,71,0.28)] backdrop-blur-xl lg:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1.5">
          <a
            href="#roster-section"
            className="flex flex-col items-center justify-center rounded-xl bg-white/10 py-1.5 text-center text-[11px] font-extrabold text-white whitespace-nowrap active:bg-[#5BAE84]"
          >
            <span className="font-mono-num text-[9px] text-[#7ADAD0]">
              18 位成員
            </span>
            <span>成員圖鑑</span>
          </a>
          <a
            href="#girl-seat-guide-section"
            className="flex flex-col items-center justify-center rounded-xl bg-[#5BAE84] py-1.5 text-center text-[11px] font-extrabold text-white whitespace-nowrap shadow-xs active:bg-[#4FA87D]"
          >
            <span className="font-mono-num text-[9px] text-white/90">
              選位攻略
            </span>
            <span>女孩選位</span>
          </a>
          <a
            href="#seat-finder-section"
            className="flex flex-col items-center justify-center rounded-xl bg-white/10 py-1.5 text-center text-[11px] font-extrabold text-[#7ADAD0] whitespace-nowrap ring-1 ring-[#5ECBC0]/35 active:bg-[#5BAE84] active:text-white"
          >
            <span className="font-mono-num text-[9px] text-white/80">
              A/B/C 區
            </span>
            <span>23 席查詢</span>
          </a>
          <a
            href="#schedule-section"
            className="flex flex-col items-center justify-center rounded-xl bg-white/10 py-1.5 text-center text-[11px] font-extrabold text-white whitespace-nowrap active:bg-[#5BAE84]"
          >
            <span className="font-mono-num text-[9px] text-[#7ADAD0]">
              主題週
            </span>
            <span>應援班表</span>
          </a>
        </div>
      </nav>

      {/* Main Roster Directory Section (Page Starts Directly with Member Directory!) */}
      <section
        id="roster-section"
        className="mx-auto max-w-[1440px] px-2.5 pt-20 pb-12 sm:px-6 sm:pt-26 sm:pb-20 lg:px-10 lg:pt-28"
      >
        {/* Section Heading */}
        <div className="flex flex-col justify-between gap-4 border-b border-[#212047]/10 pb-5 sm:gap-5 sm:pb-8 lg:flex-row lg:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#5BAE84]/15 px-3 py-1 font-mono-num text-[11px] font-bold tracking-[0.08em] text-[#212047] ring-1 ring-[#5BAE84]/30 lg:text-sm">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#5BAE84]" />
                <span>2026–2027 粉絲整理成員圖鑑 · 連莊女孩全體 18 人陣容</span>
              </span>
              <button
                type="button"
                onClick={() => setIsTeamIntroOpen(true)}
                className="inline-flex items-center gap-1 rounded-full bg-[#212047] px-3 py-1 text-[11px] font-extrabold text-[#7ADAD0] shadow-2xs ring-1 ring-[#5ECBC0]/40 transition-colors hover:bg-[#5BAE84] hover:text-white lg:text-xs"
              >
                <span>點此查看啦啦隊介紹與成軍誌要</span>
                <span>↗</span>
              </button>
            </div>
            <h1 className="mt-2.5 text-2xl font-black tracking-tight text-[#212047] sm:mt-3 sm:text-5xl">
              連莊女孩全體成員應援圖鑑
            </h1>
            <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-[#212047]/70 sm:mt-2.5 sm:text-base lg:text-lg">
              自動依「<strong className="font-extrabold text-[#3F8E67]">1. 我的主推成員</strong> → <strong className="font-extrabold text-[#212047]">2. 你的座位（{currentUserSeat.zone} 區 {currentUserSeat.seat} 號）正前方女孩</strong> → 3. 其餘成員」優先排列；點擊卡片上方的 IG 按鈕即可一鍵開啟成員官方 Instagram。
            </p>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2.5">
            <div className="relative">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋姓名、背號、MBTI、雙棲球隊..."
                aria-label="搜尋成員姓名、背號、MBTI、IG 或雙棲球隊"
                className="w-full rounded-full bg-white py-2 pr-4 pl-9 text-xs font-medium text-[#212047] ring-1 ring-[#5BAE84]/35 transition-shadow placeholder:text-[#212047]/40 focus:ring-2 focus:ring-[#212047] focus:outline-none sm:w-64 sm:py-2.5 sm:pl-10 lg:w-72 lg:py-3 lg:text-sm"
              />
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#4FA87D]"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
              </svg>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              aria-label="成員排序方式"
              className="rounded-full bg-white px-3.5 py-2 text-xs font-bold text-[#212047] ring-1 ring-[#5BAE84]/35 focus:ring-2 focus:ring-[#212047] focus:outline-none sm:px-4 sm:py-2.5 lg:px-5 lg:py-3 lg:text-sm"
            >
              <option value="default">排序：主推 → 座位面前 → 預設</option>
              <option value="number_asc">排序：主推 → 座位面前 → 背號</option>
              <option value="birthday_asc">排序：主推 → 座位面前 → 生日</option>
            </select>
          </div>
        </div>

        {/* Priority Order & Current Seat Quick-Sync Strip */}
        <div className="mt-3.5 flex flex-col gap-2 rounded-2xl bg-[#212047] px-3 py-2.5 text-white shadow-xs ring-1 ring-[#5ECBC0]/35 sm:mt-5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-4 sm:py-3">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:gap-2 sm:text-xs">
            <span className="font-mono-num font-bold text-[#7ADAD0]">
              優先顯示順序：
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#5BAE84] px-2.5 py-0.5 font-extrabold text-white">
              <span>1. ★ 我的主推 ({favoriteIds.length})</span>
            </span>
            <span className="text-white/50">→</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 font-extrabold text-[#5ECBC0] ring-1 ring-[#5ECBC0]/50">
              <span>
                2. ▲ 座位（{currentUserSeat.zone} 區 {currentUserSeat.seat} 號）面前女孩 ({frontSeatMemberMap.size})
              </span>
            </span>
          </div>

          {/* Inline Quick Seat Switcher so User Can Immediately Adjust "My Seat" in Roster */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs">
            <span className="font-mono-num text-white/75">設定你的座位：</span>
            <select
              value={currentUserSeat.matchId}
              onChange={(e) => {
                const next = { ...currentUserSeat, matchId: e.target.value };
                setCurrentUserSeat(next);
                setSeatSimulatorJump({ ...next, timestamp: Date.now() });
              }}
              aria-label="選擇場次日期"
              className="rounded-lg bg-white/12 px-2 py-1 font-mono-num text-[11px] font-bold text-[#7ADAD0] ring-1 ring-white/20 focus:outline-none sm:text-xs"
            >
              {STATION_ROTATION_SCHEDULES.map((s) => (
                <option
                  key={s.matchId}
                  value={s.matchId}
                  className="bg-[#212047] text-white"
                >
                  {s.dayLabel}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1">
              {(['A', 'B', 'C'] as AceZoneId[]).map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => {
                    const next = { ...currentUserSeat, zone: z };
                    setCurrentUserSeat(next);
                    setSeatSimulatorJump({ ...next, timestamp: Date.now() });
                  }}
                  className={`rounded-lg px-2 py-0.5 font-mono-num text-[11px] font-extrabold transition-all sm:text-xs ${
                    currentUserSeat.zone === z
                      ? 'bg-[#5BAE84] text-white'
                      : 'bg-white/10 text-white/75 hover:bg-white/20'
                  }`}
                >
                  {z}區
                </button>
              ))}
            </div>

            <select
              value={currentUserSeat.seat}
              onChange={(e) => {
                const next = {
                  ...currentUserSeat,
                  seat: Number(e.target.value),
                };
                setCurrentUserSeat(next);
                setSeatSimulatorJump({ ...next, timestamp: Date.now() });
              }}
              aria-label="選擇座位號碼"
              className="rounded-lg bg-white/12 px-2 py-1 font-mono-num text-[11px] font-bold text-white ring-1 ring-white/20 focus:outline-none sm:text-xs"
            >
              {Array.from({ length: 23 }, (_, i) => i + 1).map((n) => (
                <option
                  key={n}
                  value={n}
                  className="bg-[#212047] text-white"
                >
                  {n} 號席
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="no-scrollbar -mx-1 mt-3.5 flex gap-1.5 overflow-x-auto px-1 pb-1.5 sm:mx-0 sm:mt-6 sm:flex-wrap sm:gap-2 sm:overflow-visible sm:px-0 sm:pb-0">
          {(['all', 'leader', 'mc', 'tw_member', 'kr_member'] as const).map(
            (catKey) => {
              const info = CATEGORY_LABELS[catKey];
              const isActive = activeCategory === catKey;
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setActiveCategory(catKey)}
                  className={`group flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold whitespace-nowrap transition-all active:scale-[0.97] sm:gap-2 sm:px-5 sm:py-2.5 sm:text-xs lg:px-6 lg:py-3 lg:text-base ${
                    isActive
                      ? 'bg-[#212047] text-white shadow-[0_10px_25px_-8px_rgba(33,32,71,0.45)]'
                      : 'bg-white text-[#212047]/80 ring-1 ring-[#212047]/10 hover:bg-[#E6F5F1]'
                  }`}
                >
                  <span>{info.label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 font-mono-num text-[9px] sm:px-2 sm:py-0.5 sm:text-[10px] lg:text-xs ${
                      isActive
                        ? 'bg-[#5BAE84] text-white'
                        : 'bg-[#E6F5F1] text-[#3F8E67]'
                    }`}
                  >
                    {categoryCounts[catKey]}
                  </span>
                </button>
              );
            }
          )}

          <button
            type="button"
            onClick={() => setActiveCategory('favorites')}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold whitespace-nowrap transition-all active:scale-[0.97] sm:gap-2 sm:px-5 sm:py-2.5 sm:text-xs lg:px-6 lg:py-3 lg:text-base ${
              activeCategory === 'favorites'
                ? 'bg-[#5BAE84] text-white shadow-sm'
                : 'bg-[#5BAE84]/15 text-[#212047] hover:bg-[#5BAE84]/25'
            }`}
          >
            <span>我的主推收藏</span>
            <span className="rounded-full bg-[#212047]/15 px-1.5 py-0.2 font-mono-num text-[9px] sm:px-2 sm:py-0.5 sm:text-[10px] lg:text-xs">
              {categoryCounts.favorites}
            </span>
          </button>

          {categoryCounts.birthday_month > 0 && (
            <button
              type="button"
              onClick={() =>
                setActiveCategory(
                  activeCategory === 'birthday_month' ? 'all' : 'birthday_month'
                )
              }
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black whitespace-nowrap transition-all active:scale-[0.97] sm:gap-2 sm:px-5 sm:py-2.5 sm:text-xs lg:px-6 lg:py-3 lg:text-base ${
                activeCategory === 'birthday_month'
                  ? 'bg-amber-500 text-white shadow-sm ring-2 ring-[#212047]'
                  : 'bg-amber-400/20 text-[#212047] ring-1 ring-amber-500/60 hover:bg-amber-400/35'
              }`}
            >
              <span>★ {currentMonth} 月壽星</span>
              <span className="rounded-full bg-[#212047] px-1.5 py-0.2 font-mono-num text-[9px] text-amber-300 sm:px-2 sm:py-0.5 sm:text-[10px] lg:text-xs">
                {categoryCounts.birthday_month}
              </span>
            </button>
          )}
        </div>

        {/* Empty State */}
        {displayedMembers.length === 0 && (
          <div className="mt-10 rounded-[2rem] bg-white p-10 text-center ring-1 ring-[#212047]/10">
            <p className="text-base font-extrabold text-[#212047] sm:text-lg">
              找不到符合條件的連莊女孩成員
            </p>
            <p className="mt-2 text-xs text-[#212047]/65 sm:text-sm">
              請嘗試調整搜尋關鍵字或切換上方分類篩選標籤。
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="mt-4 rounded-full bg-[#212047] px-5 py-2.5 text-xs font-bold text-white"
            >
              重置所有篩選條件
            </button>
          </div>
        )}

        {/* Member Cards Grid: 3 Columns Compact on Mobile (6-9+ Visible at Once) / 2-4 Columns on Tablet & Desktop */}
        <div className="mt-3.5 grid grid-cols-3 gap-2 sm:mt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {displayedMembers.map((member) => {
            const isFav = favoriteIds.includes(member.id);
            const frontInfo = frontSeatMemberMap.get(member.id);
            const isBirthdayStar = isCurrentMonthBirthday(
              member.birthday,
              currentMonth
            );
            const nameCopyKey = `${member.id}:name`;
            const igCopyKey = `${member.id}:ig`;

            return (
              <article
                key={member.id}
                className={`group relative min-w-0 rounded-2xl p-0.5 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_24px_60px_-15px_rgba(33,32,71,0.18)] sm:rounded-[2rem] sm:p-1.5 ${
                  isFav
                    ? 'bg-[#5BAE84] ring-2 ring-[#5BAE84] shadow-[0_10px_28px_-8px_rgba(91,174,132,0.45)]'
                    : frontInfo
                      ? 'bg-[#212047]/20 ring-2 ring-[#5ECBC0] shadow-[0_10px_25px_-8px_rgba(33,32,71,0.2)]'
                      : isBirthdayStar
                        ? 'bg-gradient-to-br from-amber-300 via-[#5ECBC0] to-amber-400 ring-2 ring-amber-500 shadow-[0_14px_35px_-10px_rgba(245,158,11,0.35)]'
                        : 'bg-[#D5EFE9]/80 ring-1 ring-[#5BAE84]/30 hover:bg-[#5BAE84]/30'
                }`}
              >
                {/* Inner Core */}
                <div className="flex h-full flex-col justify-between overflow-hidden rounded-[calc(1rem-2px)] bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] sm:rounded-[calc(2rem-0.375rem)]">
                  <div>
                    {/* Portrait Wrapper + Priority Ribbon + Floating Favorite Heart */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setSelectedMember(member)}
                        aria-label={`開啟 ${member.name} 的詳細個人檔案`}
                        className="block w-full text-left focus:outline-none"
                      >
                        {/* Mobile: Compact 5:4 Face-Centered Close-Up (Fits 3x2 = 6 to 3x3 = 9 Cards per Screen); Tablet/Desktop: 3:4 Portrait */}
                        <MemberPortrait
                          member={member}
                          variant="avatar"
                          className="aspect-[5/4] w-full sm:hidden"
                        />
                        <MemberPortrait
                          member={member}
                          variant="card"
                          className="hidden aspect-[3/4] w-full sm:block"
                        />
                      </button>

                      {/* Top-Left Priority / Birthday Badge */}
                      {isFav ? (
                        <div className="pointer-events-none absolute top-1.5 left-1.5 z-20 inline-flex items-center gap-0.5 rounded-full bg-[#5BAE84] px-1.5 py-0.5 font-mono-num text-[9px] font-black text-white shadow-xs ring-1 ring-white sm:top-3.5 sm:left-3.5 sm:px-3 sm:py-1 sm:text-xs">
                          <span>★ 主推</span>
                        </div>
                      ) : frontInfo ? (
                        <div className="pointer-events-none absolute top-1.5 left-1.5 z-20 inline-flex items-center gap-0.5 rounded-full bg-[#212047]/90 px-1.5 py-0.5 font-mono-num text-[9px] font-black text-[#5ECBC0] shadow-xs ring-1 ring-[#5ECBC0] sm:top-3.5 sm:left-3.5 sm:px-3 sm:py-1 sm:text-xs">
                          <span>
                            ▲ {currentUserSeat.zone}
                            {currentUserSeat.seat}面前
                          </span>
                        </div>
                      ) : isBirthdayStar ? (
                        <div className="pointer-events-none absolute top-1.5 left-1.5 z-20 inline-flex items-center gap-0.5 rounded-full bg-amber-500 px-1.5 py-0.5 font-mono-num text-[9px] font-black text-white shadow-xs ring-1 ring-white sm:top-3.5 sm:left-3.5 sm:px-3 sm:py-1 sm:text-xs">
                          <span>★ {currentMonth}月壽星</span>
                        </div>
                      ) : null}

                      {/* Favorite Toggle Pill */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(member.id);
                        }}
                        aria-label={
                          isFav
                            ? `將 ${member.name} 從我的主推移除`
                            : `將 ${member.name} 加入我的主推`
                        }
                        className={`absolute top-1.5 right-1.5 z-20 flex h-6 w-6 items-center justify-center rounded-full transition-all active:scale-90 sm:top-3.5 sm:right-3.5 sm:h-9 sm:w-9 lg:h-10 lg:w-10 ${
                          isFav
                            ? 'bg-[#5BAE84] text-white shadow-md'
                            : 'bg-[#212047]/65 text-white hover:bg-[#212047] hover:text-[#7ADAD0]'
                        }`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill={isFav ? 'currentColor' : 'none'}
                          stroke="currentColor"
                          strokeWidth="1.5"
                          className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-5 lg:w-5"
                        >
                          <path
                            d="M12 20.5s-7.5-4.35-9.5-8.6C1.1 8.8 3.2 5 6.8 5c2.1 0 3.9 1.2 5.2 2.9C13.3 6.2 15.1 5 17.2 5c3.6 0 5.7 3.8 4.3 6.9-2 4.25-9.5 8.6-9.5 8.6z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Card Body Info: Compact on Mobile (<sm) / Full Editorial on Tablet & Desktop (sm+) */}
                    <div className="p-1.5 sm:p-5 lg:p-6">
                      {/* Mobile Compact Body */}
                      <div className="sm:hidden">
                        <div className="flex items-baseline justify-between gap-1">
                          <h3 className="truncate text-xs font-black tracking-tight text-[#212047]">
                            <button
                              type="button"
                              onClick={() => setSelectedMember(member)}
                              className="truncate text-left focus:outline-none"
                            >
                              {member.name}
                            </button>
                          </h3>
                          <span className="shrink-0 font-mono-num text-[10px] font-extrabold text-[#4FA87D]">
                            #{member.number}
                          </span>
                        </div>

                        {frontInfo ? (
                          <div className="mt-0.5 truncate rounded bg-[#E6F5F1] px-1 py-0.2 font-mono-num text-[9px] font-extrabold text-[#212047]">
                            ▲ {frontInfo.setsShortLabel}面前
                          </div>
                        ) : (
                          <div className="mt-0.5 flex items-center justify-between gap-0.5 text-[9px] font-bold text-[#212047]/70">
                            <span
                              className={
                                isBirthdayStar
                                  ? 'font-black text-amber-700'
                                  : 'truncate'
                              }
                            >
                              {isBirthdayStar ? '★' : ''}
                              {member.birthday.replace(/\s+/g, '')}
                            </span>
                            <ZodiacIcon
                              zodiac={member.zodiac}
                              className="h-3 w-3 shrink-0"
                            />
                          </div>
                        )}
                      </div>

                      {/* Tablet / Desktop Full Body */}
                      <div className="hidden sm:block">
                        <div className="flex items-baseline justify-between gap-1.5">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <h3 className="text-xl font-black tracking-tight text-[#212047] lg:text-2xl">
                                <button
                                  type="button"
                                  onClick={() => setSelectedMember(member)}
                                  className="text-left hover:text-[#4FA87D] focus:outline-none"
                                >
                                  {member.name}
                                </button>
                              </h3>
                              <span className="rounded-md bg-[#E6F5F1] px-2 py-0.5 font-mono-num text-[10px] font-bold text-[#3F8E67] lg:text-xs">
                                {member.mbti}
                              </span>
                            </div>

                            {frontInfo && (
                              <div className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#212047] px-2.5 py-0.5 font-mono-num text-[11px] font-extrabold text-[#5ECBC0]">
                                <span>
                                  ▲ 你的座位 {currentUserSeat.zone}
                                  {currentUserSeat.seat} 正前方（
                                  {frontInfo.setsLabel}）
                                </span>
                              </div>
                            )}

                            {/* Birthday + Custom Zodiac Icon */}
                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono-num text-[11px] font-bold lg:text-xs ${
                                  isBirthdayStar
                                    ? 'bg-amber-400/25 font-black text-amber-900 ring-1 ring-amber-500'
                                    : 'bg-[#F4FAF8] text-[#212047]/70 ring-1 ring-[#212047]/10'
                                }`}
                              >
                                {isBirthdayStar && (
                                  <span className="text-amber-600">★</span>
                                )}
                                <span>{member.birthday}</span>
                                {isBirthdayStar && <span>· 本月壽星</span>}
                              </span>

                              <span className="inline-flex items-center gap-1 rounded-full bg-[#F4FAF8] py-0.5 pr-2 pl-0.5 text-[11px] font-bold text-[#212047]/80 ring-1 ring-[#5BAE84]/30 lg:text-xs">
                                <ZodiacIcon
                                  zodiac={member.zodiac}
                                  className="h-4.5 w-4.5"
                                />
                                <span>{member.zodiac}</span>
                              </span>
                            </div>
                          </div>

                          <span className="shrink-0 font-editorial text-3xl font-bold text-[#4FA87D] italic lg:text-4xl">
                            #{member.number}
                          </span>
                        </div>

                        <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-[#212047]/70 lg:text-sm">
                          {member.tagline}
                        </p>

                        {/* Dual Team Chips */}
                        <div className="mt-3.5 flex flex-wrap gap-1.5">
                          {member.dualTeams.map((team) => (
                            <span
                              key={team}
                              className="rounded-md bg-[#F4FAF8] px-2 py-0.5 text-[11px] font-semibold text-[#212047] ring-1 ring-[#5BAE84]/30 lg:px-2.5 lg:py-1 lg:text-xs"
                            >
                              {team}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Prominent 1-Click Open IG Button + Quick Copy on Both Mobile & Desktop */}
                  <div className="flex flex-col gap-1 border-t border-[#212047]/[0.07] bg-[#F4FAF8] px-1.5 py-1.5 sm:gap-2 sm:px-4 sm:py-3.5 lg:px-5 lg:py-4">
                    {/* Prominent 1-Click Open Instagram Button (Visible on Both Mobile & Desktop!) */}
                    <a
                      href={member.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`一鍵開啟 ${member.name} 的官方 Instagram (@${member.instagramHandle})`}
                      className="flex w-full items-center justify-between gap-1 rounded-lg bg-gradient-to-r from-[#212047] via-[#2C2A5E] to-[#3F8E67] px-2 py-1 text-white shadow-xs ring-1 ring-[#5ECBC0]/40 transition-all hover:brightness-110 active:scale-95 sm:rounded-xl sm:px-3.5 sm:py-2"
                    >
                      <span className="flex min-w-0 items-center gap-1 sm:gap-2">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="h-3 w-3 shrink-0 text-[#5ECBC0] sm:h-4 sm:w-4"
                        >
                          <rect x="2" y="2" width="20" height="20" rx="5" />
                          <circle cx="12" cy="12" r="4" />
                          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                        </svg>
                        <span className="truncate font-mono-num text-[10px] font-black tracking-tight text-white sm:hidden">
                          IG ↗
                        </span>
                        <span className="hidden truncate font-mono-num text-xs font-black text-white sm:inline lg:text-sm">
                          IG @{member.instagramHandle}
                        </span>
                      </span>
                      <span className="hidden shrink-0 rounded-full bg-[#5BAE84] px-2 py-0.5 text-[10px] font-extrabold text-white sm:inline-block lg:text-xs">
                        一鍵開啟 ↗
                      </span>
                    </a>

                    {/* Secondary Row: Copy Name / Copy @IG / Open Profile */}
                    <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 sm:gap-1.5">
                      <button
                        type="button"
                        onClick={(e) =>
                          handleCopyMemberInfo(member.name, nameCopyKey, e)
                        }
                        className={`truncate rounded-md px-1 py-0.5 font-mono-num text-[9px] font-bold transition-all active:scale-95 sm:rounded-lg sm:px-1.5 sm:py-1 sm:text-[10px] lg:py-1.5 lg:text-xs ${
                          copiedCardKey === nameCopyKey
                            ? 'bg-[#5BAE84] text-white'
                            : 'bg-white text-[#212047] ring-1 ring-[#212047]/12 hover:bg-[#E6F5F1]'
                        }`}
                      >
                        {copiedCardKey === nameCopyKey
                          ? '已複製'
                          : '複製名'}
                      </button>

                      <button
                        type="button"
                        onClick={(e) =>
                          handleCopyMemberInfo(
                            `@${member.instagramHandle}`,
                            igCopyKey,
                            e
                          )
                        }
                        className={`truncate rounded-md px-1 py-0.5 font-mono-num text-[9px] font-bold transition-all active:scale-95 sm:rounded-lg sm:px-1.5 sm:py-1 sm:text-[10px] lg:py-1.5 lg:text-xs ${
                          copiedCardKey === igCopyKey
                            ? 'bg-[#5BAE84] text-white'
                            : 'bg-[#212047]/90 text-[#7ADAD0] hover:bg-[#212047]'
                        }`}
                      >
                        {copiedCardKey === igCopyKey
                          ? '已複製'
                          : '複製@IG'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedMember(member)}
                        className="hidden items-center justify-center gap-0.5 rounded-lg bg-[#E6F5F1] px-1.5 py-1 text-[10px] font-extrabold text-[#212047] ring-1 ring-[#5BAE84]/35 transition-colors hover:bg-[#5BAE84] hover:text-white sm:inline-flex lg:py-1.5 lg:text-xs"
                      >
                        <span>詳細檔案</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Girl-Centric Seat Recommendation Guide */}
      <GirlSeatRecommendationSection
        favoriteIds={favoriteIds}
        onOpenMemberDetail={(m) => setSelectedMember(m)}
        onJumpToSeatSimulator={(matchId, zone, seat, girlId) => {
          setCurrentUserSeat({ matchId, zone, seat });
          setSeatSimulatorJump({
            matchId,
            zone,
            seat,
            girlId,
            timestamp: Date.now(),
          });
          document
            .getElementById('seat-finder-section')
            ?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Interactive 2F ACE Zone (A/B/C · 23 Seats) Seat & Girl Station Finder */}
      <SeatFinderSection
        favoriteIds={favoriteIds}
        externalSelection={seatSimulatorJump}
        onSeatChange={setCurrentUserSeat}
        onOpenMemberDetail={(m) => setSelectedMember(m)}
      />

      {/* Bidirectional Home Match Attendance Schedule Section */}
      <ScheduleSection
        selectedMemberId={scheduleMemberFilter}
        favoriteIds={favoriteIds}
        onSelectMemberFilter={setScheduleMemberFilter}
        onOpenMemberDetail={(m) => setSelectedMember(m)}
      />

      {/* Dedicated Disclaimer & Official Announcement Notice Section + Footer */}
      <footer
        id="disclaimer-section"
        className="border-t border-[#212047]/10 bg-[#212047] text-white"
      >
        <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
          {/* Prominent Fan-Made Disclaimer Banner */}
          <div className="mb-10 rounded-[1.75rem] border border-[#5ECBC0]/35 bg-white/[0.06] p-5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] sm:p-7 lg:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#5BAE84] px-3 py-1 font-mono-num text-[10px] font-extrabold tracking-[0.14em] text-white lg:text-xs">
                  粉絲自製與免責聲明
                </span>
                <span className="font-mono-num text-xs font-bold text-[#7ADAD0] lg:text-sm">
                  非官方應援網站 · 請以官方實際公告為準
                </span>
              </div>
              <a
                href={TEAM_INFO.officialInstagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-[#7ADAD0] transition-colors hover:bg-[#5BAE84] hover:text-white lg:px-4 lg:py-1.5 lg:text-sm"
              >
                <span>前往連莊女孩官方 IG 查閱最新公告</span>
                <span>↗</span>
              </a>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 text-xs leading-relaxed text-white/80 md:grid-cols-3 lg:text-sm">
              <div className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10 lg:p-5">
                <div className="font-mono-num text-[10px] font-bold tracking-[0.15em] text-[#7ADAD0] lg:text-xs">
                  01 · 網站性質說明
                </div>
                <div className="mt-1 font-extrabold text-white lg:text-base">
                  純粉絲自製之非營利應援工具
                </div>
                <p className="mt-1.5 text-white/75">
                  本網站由支持臺中連莊職業排球隊與連莊女孩（Ace Viva）之球迷粉絲獨立製作與維護，旨在方便球迷查詢成員資料、應援班表與集氣區視角，與球團及經紀公司無任何官方委任或商業從屬關係。
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10 lg:p-5">
                <div className="font-mono-num text-[10px] font-bold tracking-[0.15em] text-[#7ADAD0] lg:text-xs">
                  02 · 班表與座位推算免責
                </div>
                <div className="mt-1 font-extrabold text-white lg:text-base">
                  一律以官方最新實際公告為準
                </div>
                <p className="mt-1.5 text-white/75">
                  站內所列之出席名單、2F 集氣區（A / B / C 區）各局站位、破 10 分換位規則、1–23 號座位視角對應與主推距離計算，均為依據官方公開貼文所作之輔助推算；若遇現場座位編號調整、動線變更或成員臨時異動，概以官方與現場實際公告為準。
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10 lg:p-5">
                <div className="font-mono-num text-[10px] font-bold tracking-[0.15em] text-[#7ADAD0] lg:text-xs">
                  03 · 圖像與商標權歸屬
                </div>
                <div className="mt-1 font-extrabold text-white lg:text-base">
                  權利歸屬原官方與成員所有
                </div>
                <p className="mt-1.5 text-white/75">
                  本站引用之成員形象照及相關名稱，其著作權、商標權與肖像權均歸屬臺中連莊職業排球隊、LEXX 原質娛樂及各成員本人所有，本站僅作非營利應援推廣與資訊索引使用。
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-10">
            <div className="md:col-span-6">
              <div className="flex flex-wrap items-center gap-3">
                <img
                  src={TEAM_INFO.logoPath}
                  alt="粉絲自製應援雷達圖示"
                  className="h-10 w-10 shrink-0 rounded-xl object-contain lg:h-12 lg:w-12"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-2xl font-black tracking-wider text-[#7ADAD0] lg:text-3xl">
                    連莊女孩應援指南
                  </span>
                  <span className="rounded-md bg-white/10 px-2 py-0.5 font-mono-num text-[10px] font-bold text-white/80 lg:text-xs">
                    粉絲自製非官方網站
                  </span>
                </div>
              </div>
              <p className="mt-3 max-w-lg text-xs leading-relaxed text-white/75 lg:text-sm">
                粉絲自製之台灣職業排球聯盟（TPVL）臺中連莊職業排球隊啦啦隊應援介紹、2F 集氣區選位推薦與班表查詢平台。資料來源整理自維基百科「Ace Viva」條目與官方 Instagram (@ace_viva_official) 公開資訊，實際資訊請以官方公告為準。
              </p>
            </div>

            <div className="md:col-span-6">
              <div className="rounded-2xl border border-[#5ECBC0]/25 bg-white/[0.05] p-4 sm:p-5 lg:p-6">
                <div className="font-mono-num text-[10px] font-bold tracking-[0.2em] text-[#7ADAD0] lg:text-xs">
                  官方資訊查證管道
                </div>
                <p className="mt-2 text-xs leading-relaxed text-white/80 lg:text-sm">
                  購票選位前或進場應援當日，建議先前往以下官方社群確認最新班表與現場活動公告：
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={TEAM_INFO.officialInstagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-[#5BAE84] px-3.5 py-1.5 text-xs font-extrabold text-white transition-colors hover:bg-[#4FA87D] lg:px-4 lg:py-2 lg:text-sm"
                  >
                    連莊女孩官方 IG (@{TEAM_INFO.officialInstagramHandle}) ↗
                  </a>
                  <a
                    href={TEAM_INFO.clubInstagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/20 lg:px-4 lg:py-2 lg:text-sm"
                  >
                    臺中連莊球團 IG (@{TEAM_INFO.clubInstagramHandle}) ↗
                  </a>
                  <a
                    href={TEAM_INFO.wikipediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/20 lg:px-4 lg:py-2 lg:text-sm"
                  >
                    維基百科條目 ↗
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/55 sm:mt-10 sm:pt-8 lg:text-sm">
            <span>
              © 2026–2027 連莊女孩粉絲自製應援網站（非官方，所有資訊以官方實際公告為準）
            </span>
            <div className="flex flex-wrap items-center gap-5">
              <a
                href={TEAM_INFO.officialInstagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#7ADAD0]"
              >
                官方 IG (@ace_viva_official)
              </a>
              <a
                href={TEAM_INFO.wikipediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#7ADAD0]"
              >
                維基百科 Ace Viva
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* 頁首點選開啟之「啦啦隊介紹与成軍誌要」收納彈窗（平常不佔用頁面空間） */}
      {isTeamIntroOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#212047]/80 p-3 backdrop-blur-md sm:p-6"
          onClick={() => setIsTeamIntroOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="連莊女孩啦啦隊介紹與成軍誌要"
            className="max-h-[90dvh] w-full max-w-4xl overflow-y-auto rounded-[1.75rem] bg-[#D5EFE9] p-1.5 shadow-2xl ring-1 ring-[#5ECBC0]/45 sm:rounded-[2rem] sm:p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="rounded-[calc(1.75rem-0.375rem)] bg-white p-4 sm:rounded-[calc(2rem-0.375rem)] sm:p-7">
              {/* Top Modal Header */}
              <div className="flex items-center justify-between gap-3 border-b border-[#212047]/10 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={TEAM_INFO.logoPath}
                    alt="粉絲自製應援雷達圖示"
                    className="h-10 w-10 shrink-0 rounded-xl object-contain sm:h-12 sm:w-12"
                  />
                  <div>
                    <span className="inline-block rounded-full bg-[#212047] px-2.5 py-0.5 text-[10px] font-bold text-[#7ADAD0] sm:text-xs">
                      臺中連莊職業排球隊專屬啦啦隊
                    </span>
                    <h2 className="mt-0.5 text-lg font-black text-[#212047] sm:text-2xl">
                      連莊女孩（Ace Viva）啦啦隊介紹與成軍誌要
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTeamIntroOpen(false)}
                  className="shrink-0 rounded-full bg-[#212047]/10 px-4 py-1.5 text-xs font-extrabold text-[#212047] transition-colors hover:bg-[#212047] hover:text-white"
                >
                  關閉 ✕
                </button>
              </div>

              {/* Team Introduction Text & Metrics */}
              <div className="mt-4 rounded-2xl bg-[#F4FAF8] p-4 ring-1 ring-[#5BAE84]/30 sm:p-5">
                <p className="text-xs leading-relaxed text-[#212047]/85 sm:text-sm lg:text-base">
                  2025 年台灣職業排球聯盟（TPVL）成立，臺中連莊職業排球隊於 2026 年 8 月新賽季重新組建專屬啦啦隊品牌「Ace Viva（連莊女孩）」，由 LEXX 原質娛樂負責經紀營運。團隊由創隊首任隊長{' '}
                  <strong className="font-black text-[#212047]">
                    Yuri（#6 陳洛心）
                  </strong>
                  、應援團長{' '}
                  <strong className="font-black text-[#212047]">
                    馬妹（#41）
                  </strong>
                  、主場雙主持人{' '}
                  <strong className="font-black text-[#212047]">
                    巫苡萱（#111）與心璇（#25）
                  </strong>
                  ，以及韓國職棒「韓籍三本柱」{' '}
                  <strong className="font-black text-[#212047]">
                    車榮玹（#21）、李珠熙（#20）、鄭熙靜（#42）
                  </strong>{' '}
                  等共 18 位成員組成。
                </p>

                <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  <div className="rounded-xl bg-white p-3 ring-1 ring-[#5BAE84]/25">
                    <div className="font-mono-num text-lg font-black text-[#212047] sm:text-xl">
                      16 + 2 人
                    </div>
                    <div className="text-xs font-bold text-[#212047]/65">
                      16 位隊員與 2 位主持
                    </div>
                  </div>
                  <div className="rounded-xl bg-white p-3 ring-1 ring-[#5BAE84]/25">
                    <div className="font-mono-num text-lg font-black text-[#4FA87D] sm:text-xl">
                      韓籍三本柱
                    </div>
                    <div className="text-xs font-bold text-[#212047]/65">
                      車榮玹 · 李珠熙 · 鄭熙靜
                    </div>
                  </div>
                  <div className="rounded-xl bg-white p-3 ring-1 ring-[#5BAE84]/25">
                    <div className="font-mono-num text-lg font-black text-[#212047] sm:text-xl">
                      2026 年 8 月
                    </div>
                    <div className="text-xs font-bold text-[#212047]/65">
                      LEXX 原質娛樂經紀
                    </div>
                  </div>
                  <div className="rounded-xl bg-white p-3 ring-1 ring-[#5BAE84]/25">
                    <div className="font-mono-num text-lg font-black text-[#4FA87D] sm:text-xl">
                      臺中台體大
                    </div>
                    <div className="text-xs font-bold text-[#212047]/65">
                      2F 集氣區 A / B / C 應援
                    </div>
                  </div>
                </div>
              </div>

              {/* Core Leaders Quick Cards (Captain, Cheer Leader, Korean 3 Pillars) */}
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsTeamIntroOpen(false);
                    setSelectedMember(captainYuri);
                  }}
                  className="flex items-center gap-3 rounded-2xl bg-[#212047] p-3.5 text-left text-white ring-1 ring-[#5ECBC0]/40 transition-transform hover:scale-[1.01]"
                >
                  <MemberPortrait
                    member={captainYuri}
                    variant="avatar"
                    className="h-14 w-14 shrink-0 rounded-full ring-2 ring-[#5ECBC0]"
                  />
                  <div className="min-w-0">
                    <span className="rounded-full bg-[#5BAE84] px-2 py-0.5 text-[10px] font-bold text-white">
                      創隊首任隊長 #6
                    </span>
                    <div className="mt-1 text-base font-black">
                      Yuri 陳洛心
                    </div>
                    <div className="text-xs text-[#7ADAD0]">點此檢視檔案 →</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsTeamIntroOpen(false);
                    setSelectedMember(leaderMamai);
                  }}
                  className="flex items-center gap-3 rounded-2xl bg-[#212047] p-3.5 text-left text-white ring-1 ring-[#5ECBC0]/40 transition-transform hover:scale-[1.01]"
                >
                  <MemberPortrait
                    member={leaderMamai}
                    variant="avatar"
                    className="h-14 w-14 shrink-0 rounded-full ring-2 ring-[#5ECBC0]"
                  />
                  <div className="min-w-0">
                    <span className="rounded-full bg-[#5BAE84] px-2 py-0.5 text-[10px] font-bold text-white">
                      應援團長 #41
                    </span>
                    <div className="mt-1 text-base font-black">馬妹</div>
                    <div className="text-xs text-[#7ADAD0]">點此檢視檔案 →</div>
                  </div>
                </button>

                <div className="flex flex-col justify-center rounded-2xl bg-[#E6F5F1] p-3.5 ring-1 ring-[#5BAE84]/40">
                  <div className="text-[11px] font-extrabold text-[#3F8E67]">
                    韓籍三本柱強勢加盟
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {koreanAces.map((kr) => (
                      <button
                        key={kr.id}
                        type="button"
                        onClick={() => {
                          setIsTeamIntroOpen(false);
                          setSelectedMember(kr);
                        }}
                        className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-black text-[#212047] ring-1 ring-[#212047]/15 hover:bg-[#212047] hover:text-white"
                      >
                        <MemberPortrait
                          member={kr}
                          variant="avatar"
                          className="h-5 w-5 rounded-full"
                        />
                        <span>
                          #{kr.number} {kr.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Historical Milestones */}
              <div className="mt-4">
                <div className="text-xs font-extrabold text-[#212047]">
                  品牌成軍重要里程碑
                </div>
                <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  {TEAM_INFO.historyMilestones.map((milestone) => (
                    <div
                      key={milestone.date}
                      className="rounded-2xl bg-[#212047] p-4 text-white"
                    >
                      <div className="font-mono-num text-xs font-bold text-[#7ADAD0]">
                        {milestone.date}
                      </div>
                      <div className="mt-1 text-sm font-extrabold text-white">
                        {milestone.title}
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-white/75">
                        {milestone.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Official Channels & Fan Disclaimer Footer */}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#212047]/10 pt-4">
                <div className="flex flex-wrap gap-2">
                  <a
                    href={TEAM_INFO.officialInstagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-[#5BAE84] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#4FA87D]"
                  >
                    連莊女孩官方 IG (@{TEAM_INFO.officialInstagramHandle}) ↗
                  </a>
                  <a
                    href={TEAM_INFO.clubInstagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-[#212047] px-4 py-2 text-xs font-bold text-white hover:bg-[#2E2C5E]"
                  >
                    臺中連莊球團 IG (@{TEAM_INFO.clubInstagramHandle}) ↗
                  </a>
                  <a
                    href={TEAM_INFO.wikipediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-[#F4FAF8] px-4 py-2 text-xs font-bold text-[#212047] ring-1 ring-[#212047]/15 hover:bg-[#E6F5F1]"
                  >
                    維基百科條目 ↗
                  </a>
                </div>
                <span className="text-[11px] font-semibold text-[#212047]/65">
                  ※ 本站為粉絲自製非官方應援工具，實際資訊請以官方公告為準。
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Native <dialog> Member Detail Modal */}
      <MemberDetailDialog
        member={selectedMember}
        isFavorite={
          selectedMember ? favoriteIds.includes(selectedMember.id) : false
        }
        onToggleFavorite={toggleFavorite}
        onClose={() => setSelectedMember(null)}
        onSelectScheduleMember={handleSelectScheduleMemberFromModal}
      />
    </div>
  );
};

export default App;
