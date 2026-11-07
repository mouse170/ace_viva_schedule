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
import type { AceZoneId } from './data/schedule';

type RosterFilter = 'all' | MemberCategory | 'favorites';
type SortOption = 'default' | 'number_asc' | 'birthday_asc';

const FAVORITES_STORAGE_KEY = 'ace_viva_favorites_v1';

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
    };
  }, [favoriteIds]);

  // Filtered and sorted members
  const displayedMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = MEMBERS.filter((m) => {
      if (activeCategory === 'favorites') {
        if (!favoriteIds.includes(m.id)) return false;
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

    if (sortBy === 'number_asc') {
      return [...filtered].sort((a, b) => a.numericOrder - b.numericOrder);
    }
    if (sortBy === 'birthday_asc') {
      return [...filtered].sort(
        (a, b) =>
          parseBirthdaySortKey(a.birthday) - parseBirthdaySortKey(b.birthday)
      );
    }
    return filtered;
  }, [activeCategory, searchQuery, sortBy, favoriteIds]);

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
          className="pointer-events-auto flex w-full max-w-[calc(100vw-1rem)] items-center justify-between gap-1 rounded-full bg-[#212047]/95 p-1.5 text-white shadow-[0_16px_40px_rgba(33,32,71,0.32)] ring-1 ring-[#5ECBC0]/30 backdrop-blur-2xl sm:max-w-fit sm:gap-2 sm:px-3 lg:gap-3 lg:px-4 lg:py-2"
        >
          <a
            href="#top"
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 py-1 pr-2.5 pl-1.5 text-xs font-extrabold tracking-wider text-white whitespace-nowrap transition-colors hover:bg-white/20 sm:gap-2 sm:pr-3 lg:text-sm"
          >
            <img
              src={TEAM_INFO.logoPath}
              alt="Ace Viva Logo"
              className="h-5 w-5 shrink-0 rounded-full bg-white object-contain p-0.5 sm:h-6 sm:w-6 lg:h-7 lg:w-7"
            />
            <span>ACE VIVA</span>
            <span className="hidden rounded-full bg-[#5BAE84]/35 px-2 py-0.5 font-mono-num text-[9px] font-bold tracking-normal text-[#7ADAD0] ring-1 ring-[#5ECBC0]/40 sm:inline-block lg:text-xs">
              粉絲自製
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-1.5 lg:flex">
            <a
              href="#about-section"
              className="rounded-full px-3.5 py-1.5 text-sm font-semibold text-white/80 whitespace-nowrap transition-colors hover:bg-white/10 hover:text-[#7ADAD0] xl:text-base"
            >
              團隊誌要
            </a>
            <a
              href="#roster-section"
              className="rounded-full px-3.5 py-1.5 text-sm font-semibold text-white/80 whitespace-nowrap transition-colors hover:bg-white/10 hover:text-[#7ADAD0] xl:text-base"
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
            <button
              type="button"
              onClick={() => {
                setActiveCategory('favorites');
                document
                  .getElementById('roster-section')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex items-center gap-1 rounded-full bg-[#5BAE84]/25 px-2 py-1 text-[11px] font-bold text-[#7ADAD0] whitespace-nowrap ring-1 ring-[#5BAE84]/45 transition-all hover:bg-[#5BAE84] hover:text-white sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs lg:px-4 lg:text-sm"
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
              <span>IG 官方</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </nav>
      </header>

      {/* Mobile Fixed Bottom Quick-Navigation Bar (Thumb-Friendly 4 Core Sections) */}
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
              18 MEMBERS
            </span>
            <span>成員圖鑑</span>
          </a>
          <a
            href="#girl-seat-guide-section"
            className="flex flex-col items-center justify-center rounded-xl bg-[#5BAE84] py-1.5 text-center text-[11px] font-extrabold text-white whitespace-nowrap shadow-xs active:bg-[#4FA87D]"
          >
            <span className="font-mono-num text-[9px] text-white/90">
              RECOMMEND
            </span>
            <span>女孩選位</span>
          </a>
          <a
            href="#seat-finder-section"
            className="flex flex-col items-center justify-center rounded-xl bg-white/10 py-1.5 text-center text-[11px] font-extrabold text-[#7ADAD0] whitespace-nowrap ring-1 ring-[#5ECBC0]/35 active:bg-[#5BAE84] active:text-white"
          >
            <span className="font-mono-num text-[9px] text-white/80">
              ZONE A/B/C
            </span>
            <span>23 席查詢</span>
          </a>
          <a
            href="#schedule-section"
            className="flex flex-col items-center justify-center rounded-xl bg-white/10 py-1.5 text-center text-[11px] font-extrabold text-white whitespace-nowrap active:bg-[#5BAE84]"
          >
            <span className="font-mono-num text-[9px] text-[#7ADAD0]">
              SCHEDULE
            </span>
            <span>應援班表</span>
          </a>
        </div>
      </nav>

      {/* Hero Section: Editorial Split + Asymmetrical Bento */}
      <section
        id="top"
        className="relative flex items-center overflow-hidden pt-20 pb-14 sm:pt-28 sm:pb-20 lg:min-h-[100dvh] lg:pt-32 lg:pb-28"
      >
        {/* Subtle Mint & Indigo Architectural Background Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-36 right-0 h-[520px] w-[520px] rounded-full bg-radial from-[#5ECBC0]/28 via-[#5BAE84]/10 to-transparent blur-3xl sm:h-[680px] sm:w-[680px]"
        />

        <div className="mx-auto w-full max-w-[1440px] px-3 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Left Column: Fan-Made Identity, Editorial Typography & Nested CTA */}
            <div className="w-full min-w-0 animate-editorial-entry lg:col-span-6">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#212047] px-3 py-1.5 shadow-xs ring-1 ring-[#5ECBC0]/40 lg:px-4 lg:py-2">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-[#5ECBC0]" />
                  <span className="font-mono-num text-[10px] font-bold tracking-[0.12em] text-[#7ADAD0] uppercase lg:text-xs">
                    UNOFFICIAL FAN-MADE GUIDE · 粉絲自製應援網站
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-xs ring-1 ring-[#5BAE84]/35 lg:px-4 lg:py-2">
                  <span className="font-mono-num text-[10px] font-bold tracking-[0.12em] text-[#212047] lg:text-xs">
                    TPVL 臺中連莊啦啦隊
                  </span>
                </div>
              </div>

              {/* Official Logo + Display Title */}
              <div className="mt-4 flex items-center gap-3.5 sm:mt-6 sm:gap-5">
                <div className="shrink-0 rounded-full bg-white p-1.5 shadow-[0_14px_35px_rgba(33,32,71,0.12)] ring-2 ring-[#5BAE84]/35 sm:p-2">
                  <img
                    src={TEAM_INFO.logoPath}
                    alt="Ace Viva 連莊女孩 Logo"
                    className="h-14 w-14 rounded-full object-contain sm:h-24 sm:w-24 lg:h-28 lg:w-28"
                  />
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl leading-[1.1] font-black tracking-tight text-[#212047] sm:text-5xl lg:text-6xl xl:text-7xl">
                    <span className="block font-editorial text-3xl font-bold tracking-tight text-[#4FA87D] italic sm:text-6xl lg:text-7xl">
                      Ace Viva
                    </span>
                    <span className="mt-0.5 block">連莊女孩應援圖鑑</span>
                  </h1>
                  <div className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-[#E6F5F1] px-2 py-0.5 text-[10px] font-extrabold text-[#3F8E67] ring-1 ring-[#5BAE84]/35 sm:px-2.5 sm:text-xs lg:text-sm">
                    <span>粉絲自製選位指南與班表查詢工具（非官方）</span>
                  </div>
                </div>
              </div>

              <p className="mt-4 max-w-2xl text-sm leading-relaxed font-medium text-[#212047]/80 sm:mt-6 sm:text-lg lg:text-xl">
                由粉絲自發整理之臺中連莊啦啦隊應援指南。收錄 2026 年 8 月成軍之創隊隊長{' '}
                <strong className="font-bold text-[#212047]">
                  Yuri（#6 陳洛心）
                </strong>
                、應援團長{' '}
                <strong className="font-bold text-[#212047]">馬妹（#41）</strong>
                、主場雙 MC{' '}
                <strong className="font-bold text-[#212047]">
                  巫苡萱（#111）&amp; 心璇（#25）
                </strong>{' '}
                與韓國職棒「韓籍三本柱」{' '}
                <strong className="font-bold text-[#212047]">
                  車榮玹（#21）、李珠熙（#20）、鄭熙靜（#42）
                </strong>{' '}
                共 18 位成員檔案、2F 集氣區選位推薦與俯瞰座位雷達。
              </p>

              {/* Hero Fan-Made Disclaimer Notice Box */}
              <div className="mt-4 max-w-2xl rounded-2xl border border-[#5BAE84]/35 bg-white/90 px-3.5 py-3 text-xs leading-relaxed text-[#212047]/80 shadow-xs sm:px-4 lg:p-4 lg:text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono-num text-[10px] font-extrabold tracking-[0.12em] text-[#3F8E67] uppercase lg:text-xs">
                    DISCLAIMER · 非官方粉絲自製免責聲明
                  </span>
                  <a
                    href="#disclaimer-section"
                    className="font-mono-num text-[10px] font-bold text-[#4FA87D] underline underline-offset-2 hover:text-[#212047] lg:text-xs"
                  >
                    完整聲明 ↓
                  </a>
                </div>
                <p className="mt-1">
                  本站為球迷粉絲自製之非營利應援工具，非球團或啦啦隊官方網站。所有出席名單、2F 集氣區各局站位、座位編號對應及活動資訊，請一律以{' '}
                  <a
                    href={TEAM_INFO.officialInstagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[#212047] underline decoration-[#5BAE84] underline-offset-2 hover:text-[#4FA87D]"
                  >
                    ACE VIVA 官方 IG (@ace_viva_official)
                  </a>{' '}
                  與球團最新實際公告為準。
                </p>
              </div>

              {/* Nested CTA Buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8 sm:gap-4">
                <a
                  href="#girl-seat-guide-section"
                  className="group flex items-center gap-3 rounded-full bg-[#212047] py-2 pr-2 pl-5 text-xs font-bold text-white shadow-[0_18px_40px_-12px_rgba(33,32,71,0.45)] transition-all hover:bg-[#2D2C5A] active:scale-[0.98] sm:py-2.5 sm:pr-2.5 sm:pl-7 sm:text-sm lg:py-3 lg:pr-3 lg:pl-8 lg:text-base"
                >
                  <span>女孩專屬黃金座位推薦</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5BAE84] text-white sm:h-9 sm:w-9 lg:h-10 lg:w-10">
                    ↗
                  </span>
                </a>

                <a
                  href="#seat-finder-section"
                  className="group flex items-center gap-2.5 rounded-full bg-white py-2 pr-2 pl-5 text-xs font-bold text-[#212047] ring-1 ring-[#5BAE84]/40 transition-all hover:bg-[#E6F5F1] active:scale-[0.98] sm:py-2.5 sm:pr-2.5 sm:pl-6 sm:text-sm lg:py-3 lg:pr-3 lg:pl-7 lg:text-base"
                >
                  <span>2F 集氣區 23 席拉桿查詢</span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E6F5F1] text-[#3F8E67] sm:h-9 sm:w-9 lg:h-10 lg:w-10">
                    →
                  </span>
                </a>
              </div>

              {/* Key Roster Metrics Strip */}
              <div className="mt-8 grid grid-cols-2 gap-2.5 sm:mt-12 sm:grid-cols-4 sm:gap-3">
                <div className="rounded-2xl bg-white p-3.5 ring-1 ring-[#5BAE84]/25 sm:p-4">
                  <div className="font-editorial text-2xl font-bold text-[#212047] italic sm:text-3xl">
                    16 + 2
                  </div>
                  <div className="mt-0.5 text-xs font-semibold text-[#212047]/65">
                    16 位隊員與 2 位 MC
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-3.5 ring-1 ring-[#5BAE84]/25 sm:p-4">
                  <div className="font-editorial text-2xl font-bold text-[#4FA87D] italic sm:text-3xl">
                    03 KOR
                  </div>
                  <div className="mt-0.5 text-xs font-semibold text-[#212047]/65">
                    KBO 韓籍三本柱加盟
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-3.5 ring-1 ring-[#5BAE84]/25 sm:p-4">
                  <div className="font-editorial text-2xl font-bold text-[#212047] italic sm:text-3xl">
                    2026.08
                  </div>
                  <div className="mt-0.5 text-xs font-semibold text-[#212047]/65">
                    LEXX 原質娛樂經紀
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-3.5 ring-1 ring-[#5BAE84]/25 sm:p-4">
                  <div className="font-editorial text-2xl font-bold text-[#4FA87D] italic sm:text-3xl">
                    TPVL
                  </div>
                  <div className="mt-0.5 text-xs font-semibold text-[#212047]/65">
                    臺中連莊主場應援
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Asymmetrical Bento Spotlight Cards with Face-Centered Avatars */}
            <div className="w-full lg:col-span-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                {/* Main Spotlight: Captain Yuri (#6) */}
                <div className="sm:col-span-7">
                  <div className="rounded-[1.75rem] bg-[#D5EFE9] p-1.5 ring-1 ring-[#5BAE84]/35 sm:rounded-[2rem]">
                    <button
                      type="button"
                      onClick={() => setSelectedMember(captainYuri)}
                      className="group relative block w-full overflow-hidden rounded-[calc(1.75rem-0.375rem)] bg-[#212047] text-left shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] sm:rounded-[calc(2rem-0.375rem)]"
                    >
                      <MemberPortrait
                        member={captainYuri}
                        className="aspect-[4/4] w-full sm:aspect-[3/4]"
                      />
                      <div className="flex items-center justify-between bg-[#212047] px-4 py-3.5 text-white sm:px-5 sm:py-4">
                        <div>
                          <div className="font-mono-num text-[10px] tracking-[0.18em] text-[#7ADAD0]">
                            INAUGURAL CAPTAIN · 創隊首任隊長
                          </div>
                          <div className="mt-0.5 text-lg font-extrabold">
                            Yuri 陳洛心 (#6)
                          </div>
                        </div>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5BAE84] text-white transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                          ↗
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Right Stacked Bento Cards (With Face Close-Up Avatars) */}
                <div className="flex flex-col justify-between gap-4 sm:col-span-5">
                  {/* Cheer Leader Mamai (#41) */}
                  <div className="rounded-[1.75rem] bg-[#D5EFE9] p-1.5 ring-1 ring-[#5BAE84]/35 sm:rounded-[2rem]">
                    <button
                      type="button"
                      onClick={() => setSelectedMember(leaderMamai)}
                      className="group flex w-full flex-col justify-between rounded-[calc(1.75rem-0.375rem)] bg-[#212047] p-4 text-left text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] transition-all hover:bg-[#2C2A5A] sm:rounded-[calc(2rem-0.375rem)]"
                    >
                      <div className="flex items-center gap-3.5">
                        <MemberPortrait
                          member={leaderMamai}
                          variant="avatar"
                          className="h-16 w-16 shrink-0 rounded-2xl ring-2 ring-[#5ECBC0]"
                        />
                        <div>
                          <span className="rounded-full bg-[#5BAE84]/25 px-2.5 py-0.5 font-mono-num text-[10px] font-bold tracking-[0.12em] text-[#7ADAD0]">
                            CHEER LEADER #41
                          </span>
                          <div className="mt-1 text-lg font-black text-white">
                            馬妹 · 應援團長
                          </div>
                        </div>
                      </div>
                      <p className="mt-3 text-xs leading-relaxed text-white/75">
                        掌握連莊主場口號節奏，同步效力味全龍 Dragon Beauties。
                      </p>
                      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2.5 font-mono-num text-[11px] text-[#7ADAD0]">
                        <span>@{leaderMamai.instagramHandle}</span>
                        <span className="transition-transform duration-500 group-hover:translate-x-1">
                          檢視檔案 →
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Korean 3 Pillars Card */}
                  <div className="rounded-[1.75rem] bg-[#D5EFE9] p-1.5 ring-1 ring-[#5BAE84]/35 sm:rounded-[2rem]">
                    <div className="flex h-full flex-col justify-between rounded-[calc(1.75rem-0.375rem)] bg-white p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] sm:rounded-[calc(2rem-0.375rem)]">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono-num text-[10px] font-bold tracking-[0.18em] text-[#4FA87D] uppercase">
                            KOREAN THREE PILLARS
                          </span>
                          <span className="rounded-full bg-[#212047] px-2 py-0.5 font-mono-num text-[10px] text-[#7ADAD0]">
                            KOR × 3
                          </span>
                        </div>
                        <h2 className="mt-1.5 text-base font-black text-[#212047]">
                          韓籍三本柱強勢加盟
                        </h2>
                      </div>

                      <div className="mt-3 space-y-2">
                        {koreanAces.map((kr) => (
                          <button
                            key={kr.id}
                            type="button"
                            onClick={() => setSelectedMember(kr)}
                            className="group flex w-full items-center justify-between rounded-xl bg-[#F4FAF8] px-3 py-2 text-left ring-1 ring-[#5BAE84]/25 transition-all hover:bg-[#212047] hover:text-white"
                          >
                            <div className="flex items-center gap-3">
                              <MemberPortrait
                                member={kr}
                                variant="avatar"
                                className="h-11 w-11 shrink-0 rounded-full ring-2 ring-[#5BAE84]/45"
                              />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono-num text-xs font-extrabold text-[#4FA87D] group-hover:text-[#7ADAD0]">
                                    #{kr.number}
                                  </span>
                                  <span className="text-sm font-black">
                                    {kr.name}
                                  </span>
                                </div>
                                <div className="text-[11px] opacity-65">
                                  {kr.realOrAltName} · MBTI {kr.mbti}
                                </div>
                              </div>
                            </div>
                            <span className="font-mono-num text-xs font-bold text-[#4FA87D] group-hover:text-[#7ADAD0]">
                              檔案 ↗
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Chronicle & Wikipedia History Section */}
      <section
        id="about-section"
        className="mx-auto max-w-[1440px] px-3 py-14 sm:px-6 sm:py-20 lg:px-10"
      >
        <div className="rounded-[1.75rem] bg-[#5BAE84]/30 p-1.5 ring-1 ring-[#212047]/15 sm:rounded-[2rem] sm:p-2">
          <div className="rounded-[calc(1.75rem-0.375rem)] bg-[#212047] px-4 py-8 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] sm:rounded-[calc(2rem-0.375rem)] sm:px-12 sm:py-16">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
              <div className="lg:col-span-5">
                <div className="flex items-center gap-3">
                  <img
                    src={TEAM_INFO.logoPath}
                    alt="Ace Viva Logo"
                    className="h-9 w-9 shrink-0 rounded-full bg-white p-0.5 object-contain sm:h-10 sm:w-10"
                  />
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 font-mono-num text-[10px] font-semibold tracking-[0.18em] text-[#7ADAD0] uppercase lg:text-xs">
                    TEAM CHRONICLE · 品牌成軍誌要
                  </span>
                </div>
                <h2 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                  臺中連莊全新應援品牌
                  <span className="mt-1 block font-editorial text-3xl font-bold text-[#5ECBC0] italic sm:text-4xl lg:text-5xl">
                    Ace Viva 連莊女孩
                  </span>
                </h2>
                <p className="mt-3 text-xs leading-relaxed text-white/75 sm:mt-4 sm:text-sm lg:text-base">
                  2025 年台灣職業排球聯盟（TPVL）成立，臺中連莊職業排球隊於 2026 年 8
                  月新賽季重新組建專屬啦啦隊品牌「Ace Viva（連莊女孩）」，由 LEXX
                  原質娛樂負責經紀營運，打造結合高規格韓流應援、女團唱跳與競技特技的主場視覺體驗。
                </p>

                <div className="mt-5 flex flex-wrap gap-2 sm:mt-6 sm:gap-2.5">
                  <a
                    href={TEAM_INFO.officialInstagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#5BAE84] px-3.5 py-2 text-xs font-extrabold text-white transition-transform hover:bg-[#4FA87D] active:scale-[0.97] lg:px-4 lg:py-2.5 lg:text-sm"
                  >
                    <span>連莊女孩 (@{TEAM_INFO.officialInstagramHandle})</span>
                    <span>↗</span>
                  </a>
                  <a
                    href={TEAM_INFO.clubInstagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15 lg:px-4 lg:py-2.5 lg:text-sm"
                  >
                    <span>臺中連莊球團 (@{TEAM_INFO.clubInstagramHandle})</span>
                    <span>↗</span>
                  </a>
                  <a
                    href={TEAM_INFO.wikipediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15 lg:px-4 lg:py-2.5 lg:text-sm"
                  >
                    <span>維基百科條目</span>
                    <span>↗</span>
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3 lg:col-span-7">
                {TEAM_INFO.historyMilestones.map((milestone) => (
                  <div
                    key={milestone.date}
                    className="flex flex-col justify-between rounded-2xl border border-[#5ECBC0]/20 bg-white/[0.05] p-4 sm:p-5 lg:p-6"
                  >
                    <div>
                      <div className="font-mono-num text-xs font-bold tracking-[0.2em] text-[#7ADAD0] lg:text-sm">
                        {milestone.date}
                      </div>
                      <h3 className="mt-2 text-sm font-extrabold text-white sm:text-base lg:text-xl">
                        {milestone.title}
                      </h3>
                      <p className="mt-1.5 text-xs leading-relaxed text-white/75 lg:text-sm">
                        {milestone.description}
                      </p>
                    </div>
                    <div className="mt-4 border-t border-white/10 pt-2.5 font-mono-num text-[10px] tracking-[0.16em] text-[#7ADAD0]/60 uppercase lg:text-xs">
                      OFFICIAL MILESTONE
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Roster Directory Section (2-Column Face-First Grid on Mobile + 4-Col Poster Grid on Desktop) */}
      <section
        id="roster-section"
        className="mx-auto max-w-[1440px] px-3 py-16 sm:px-6 sm:py-24 lg:px-10"
      >
        {/* Section Heading */}
        <div className="flex flex-col justify-between gap-5 border-b border-[#212047]/10 pb-8 lg:flex-row lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#5BAE84]/15 px-3 py-1 font-mono-num text-[10px] font-bold tracking-[0.14em] text-[#212047] uppercase ring-1 ring-[#5BAE84]/30 lg:text-sm">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#5BAE84]" />
              <span>2026–2027 FAN-COMPILED ROSTER DIRECTORY · 粉絲整理成員圖鑑</span>
            </span>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-[#212047] sm:text-5xl">
              連莊女孩全體成員應援圖鑑
            </h2>
            <p className="mt-2.5 max-w-3xl text-xs leading-relaxed text-[#212047]/70 sm:text-base lg:text-lg">
              手機版採用雙欄臉部特寫圖鑑，點擊任一成員卡片即可開啟完整 WELCOME 打字機復古形象海報、背號、生日星座、MBTI 與主場出席預告（資料整理自官方公開貼文與維基百科，實際資訊以官方公告為準）。
            </p>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <div className="relative">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋姓名、背號、MBTI、雙棲球隊..."
                aria-label="搜尋成員姓名、背號、MBTI、IG 或雙棲球隊"
                className="w-full rounded-full bg-white py-2.5 pr-4 pl-10 text-xs font-medium text-[#212047] ring-1 ring-[#5BAE84]/35 transition-shadow placeholder:text-[#212047]/40 focus:ring-2 focus:ring-[#212047] focus:outline-none sm:w-64 lg:w-72 lg:py-3 lg:text-sm"
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
              className="rounded-full bg-white px-4 py-2.5 text-xs font-bold text-[#212047] ring-1 ring-[#5BAE84]/35 focus:ring-2 focus:ring-[#212047] focus:outline-none lg:px-5 lg:py-3 lg:text-sm"
            >
              <option value="default">排序：預設官方編制</option>
              <option value="number_asc">排序：背號由小到大</option>
              <option value="birthday_asc">排序：生日月份先後</option>
            </select>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="no-scrollbar -mx-1 mt-6 flex gap-2 overflow-x-auto px-1 pb-2 sm:mx-0 sm:mt-8 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          {(['all', 'leader', 'mc', 'tw_member', 'kr_member'] as const).map(
            (catKey) => {
              const info = CATEGORY_LABELS[catKey];
              const isActive = activeCategory === catKey;
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setActiveCategory(catKey)}
                  className={`group flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap transition-all active:scale-[0.97] sm:px-5 sm:py-2.5 lg:px-6 lg:py-3 lg:text-base ${
                    isActive
                      ? 'bg-[#212047] text-white shadow-[0_10px_25px_-8px_rgba(33,32,71,0.45)]'
                      : 'bg-white text-[#212047]/80 ring-1 ring-[#212047]/10 hover:bg-[#E6F5F1]'
                  }`}
                >
                  <span>{info.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono-num text-[10px] lg:text-xs ${
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
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold whitespace-nowrap transition-all active:scale-[0.97] sm:px-5 sm:py-2.5 lg:px-6 lg:py-3 lg:text-base ${
              activeCategory === 'favorites'
                ? 'bg-[#5BAE84] text-white shadow-sm'
                : 'bg-[#5BAE84]/15 text-[#212047] hover:bg-[#5BAE84]/25'
            }`}
          >
            <span>我的主推收藏</span>
            <span className="rounded-full bg-[#212047]/15 px-2 py-0.5 font-mono-num text-[10px] lg:text-xs">
              {categoryCounts.favorites}
            </span>
          </button>
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

        {/* Member Cards Grid: 2 Columns on Mobile (Face-Focused Avatar) / 3-4 Columns on Desktop */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
          {displayedMembers.map((member) => {
            const isFav = favoriteIds.includes(member.id);
            return (
              <article
                key={member.id}
                className="group relative min-w-0 rounded-[1.5rem] bg-[#D5EFE9]/80 p-1 ring-1 ring-[#5BAE84]/30 transition-all duration-500 hover:-translate-y-1 hover:bg-[#5BAE84]/30 hover:shadow-[0_24px_60px_-15px_rgba(33,32,71,0.18)] sm:rounded-[2rem] sm:p-1.5"
              >
                {/* Inner Core */}
                <div className="flex h-full flex-col justify-between overflow-hidden rounded-[calc(1.5rem-0.25rem)] bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] sm:rounded-[calc(2rem-0.375rem)]">
                  <div>
                    {/* Portrait Wrapper + Floating Favorite Heart */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setSelectedMember(member)}
                        aria-label={`開啟 ${member.name} 的詳細個人檔案`}
                        className="block w-full text-left focus:outline-none"
                      >
                        {/* Mobile: Square Face-Centered Close-Up; Tablet/Desktop: 3:4 Portrait */}
                        <MemberPortrait
                          member={member}
                          variant="avatar"
                          className="aspect-square w-full sm:hidden"
                        />
                        <MemberPortrait
                          member={member}
                          variant="card"
                          className="hidden aspect-[3/4] w-full sm:block"
                        />
                      </button>

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
                        className={`absolute top-2.5 right-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full transition-all active:scale-90 sm:top-3.5 sm:right-3.5 sm:h-9 sm:w-9 lg:h-10 lg:w-10 ${
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
                          className="h-4 w-4 lg:h-5 lg:w-5"
                        >
                          <path
                            d="M12 20.5s-7.5-4.35-9.5-8.6C1.1 8.8 3.2 5 6.8 5c2.1 0 3.9 1.2 5.2 2.9C13.3 6.2 15.1 5 17.2 5c3.6 0 5.7 3.8 4.3 6.9-2 4.25-9.5 8.6-9.5 8.6z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Card Body Info */}
                    <div className="p-3 sm:p-5 lg:p-6">
                      <div className="flex items-baseline justify-between gap-1.5">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h3 className="text-base font-black tracking-tight text-[#212047] sm:text-xl lg:text-2xl">
                              <button
                                type="button"
                                onClick={() => setSelectedMember(member)}
                                className="text-left hover:text-[#4FA87D] focus:outline-none"
                              >
                                {member.name}
                              </button>
                            </h3>
                            <span className="rounded-md bg-[#E6F5F1] px-1.5 py-0.5 font-mono-num text-[9px] font-bold text-[#3F8E67] sm:px-2 sm:text-[10px] lg:text-xs">
                              {member.mbti}
                            </span>
                          </div>
                          <div className="mt-0.5 font-mono-num text-[10px] font-medium text-[#212047]/55 sm:text-[11px] lg:text-xs">
                            {member.birthday} · {member.zodiac}
                          </div>
                        </div>

                        <span className="shrink-0 font-editorial text-2xl font-bold text-[#4FA87D] italic sm:text-3xl lg:text-4xl">
                          #{member.number}
                        </span>
                      </div>

                      <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-[#212047]/70 sm:mt-2.5 sm:text-xs lg:text-sm">
                        {member.tagline}
                      </p>

                      {/* Dual Team Chips */}
                      <div className="mt-2.5 hidden flex-wrap gap-1.5 sm:mt-3.5 sm:flex">
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

                  {/* Card Footer: Direct IG Link + Open Dossier Button */}
                  <div className="flex items-center justify-between border-t border-[#212047]/[0.07] bg-[#F4FAF8] px-3 py-2.5 sm:px-5 sm:py-3 lg:px-6 lg:py-3.5">
                    <a
                      href={member.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate font-mono-num text-[10px] font-semibold text-[#212047]/75 transition-colors hover:text-[#4FA87D] sm:text-[11px] lg:text-xs"
                    >
                      @{member.instagramHandle}
                    </a>

                    <button
                      type="button"
                      onClick={() => setSelectedMember(member)}
                      className="shrink-0 inline-flex items-center gap-0.5 text-[11px] font-extrabold text-[#212047] whitespace-nowrap sm:text-xs lg:text-sm"
                    >
                      <span>檔案</span>
                      <span className="text-[#4FA87D]">→</span>
                    </button>
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
                <span className="rounded-full bg-[#5BAE84] px-3 py-1 font-mono-num text-[10px] font-extrabold tracking-[0.14em] text-white uppercase lg:text-xs">
                  FAN-MADE DISCLAIMER · 粉絲自製與免責聲明
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
                <span>前往 ACE VIVA 官方 IG 查閱最新公告</span>
                <span>↗</span>
              </a>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 text-xs leading-relaxed text-white/80 md:grid-cols-3 lg:text-sm">
              <div className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10 lg:p-5">
                <div className="font-mono-num text-[10px] font-bold tracking-[0.15em] text-[#7ADAD0] uppercase lg:text-xs">
                  01 · 網站性質說明
                </div>
                <div className="mt-1 font-extrabold text-white lg:text-base">
                  純粉絲自製之非營利應援工具
                </div>
                <p className="mt-1.5 text-white/75">
                  本網站由支持臺中連莊職業排球隊與 ACE VIVA（連莊女孩）之球迷粉絲獨立製作與維護，旨在方便球迷查詢成員資料、應援班表與集氣區視角，與球團及經紀公司無任何官方委任或商業從屬關係。
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10 lg:p-5">
                <div className="font-mono-num text-[10px] font-bold tracking-[0.15em] text-[#7ADAD0] uppercase lg:text-xs">
                  02 · 班表與座位推算免責
                </div>
                <div className="mt-1 font-extrabold text-white lg:text-base">
                  一律以官方最新實際公告為準
                </div>
                <p className="mt-1.5 text-white/75">
                  站內所列之出席名單、2F ACE 集氣區（A / B / C 區）各局站位、破 10 分換位規則、1–23 號座位視角對應與主推距離計算，均為依據官方公開貼文所作之輔助推算；若遇現場座位編號調整、動線變更或成員臨時異動，概以官方與現場實際公告為準。
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-white/10 lg:p-5">
                <div className="font-mono-num text-[10px] font-bold tracking-[0.15em] text-[#7ADAD0] uppercase lg:text-xs">
                  03 · 圖像與商標權歸屬
                </div>
                <div className="mt-1 font-extrabold text-white lg:text-base">
                  權利歸屬原官方與成員所有
                </div>
                <p className="mt-1.5 text-white/75">
                  本站引用之隊徽 Logo、WELCOME 成員形象照及相關名稱，其著作權、商標權與肖像權均歸屬臺中連莊職業排球隊（Win+Streak）、LEXX 原質娛樂及各成員本人所有，本站僅作非營利應援推廣與資訊索引使用。
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-10">
            <div className="md:col-span-6">
              <div className="flex flex-wrap items-center gap-3">
                <img
                  src={TEAM_INFO.logoPath}
                  alt="Ace Viva Logo"
                  className="h-10 w-10 shrink-0 rounded-full bg-white p-0.5 object-contain lg:h-12 lg:w-12"
                />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-editorial text-2xl font-bold tracking-wider text-[#7ADAD0] italic lg:text-3xl">
                    ACE VIVA · 連莊女孩應援指南
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
                <div className="font-mono-num text-[10px] font-bold tracking-[0.2em] text-[#7ADAD0] uppercase lg:text-xs">
                  OFFICIAL CHANNELS · 官方資訊查證管道
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
                    ACE VIVA 官方 IG (@{TEAM_INFO.officialInstagramHandle}) ↗
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
              © 2026–2027 ACE VIVA Unofficial Fan-Made Guide · 粉絲自製應援網站（非官方，所有資訊以官方實際公告為準）
            </span>
            <div className="flex flex-wrap items-center gap-5">
              <a
                href={TEAM_INFO.officialInstagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#7ADAD0]"
              >
                Instagram (@ace_viva_official)
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
