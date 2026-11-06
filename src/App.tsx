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
  const [selectedMember, setSelectedMember] = useState<AceVivaMember | null>(null);
  const [scheduleMemberFilter, setScheduleMemberFilter] = useState<
    string | 'all' | 'favorites'
  >('all');
  const [seatSimulatorJump, setSeatSimulatorJump] = useState<{
    matchId: string;
    zone: AceZoneId;
    seat: number;
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
    <div className="relative min-h-[100dvh] bg-[#F4FAF8] text-[#212047]">
      {/* Fixed Film Grain Overlay */}
      <div className="editorial-grain" aria-hidden="true" />

      {/* Floating Glass Island Navbar */}
      <header className="fixed inset-x-0 top-0 z-30 flex justify-center px-4 pt-5 pointer-events-none">
        <nav
          aria-label="主要導覽列"
          className="pointer-events-auto flex items-center gap-1 rounded-full bg-[#212047]/92 p-1.5 text-white shadow-[0_20px_50px_rgba(33,32,71,0.32)] ring-1 ring-[#5ECBC0]/30 backdrop-blur-2xl sm:gap-2 sm:px-3"
        >
          <a
            href="#top"
            className="flex items-center gap-2 rounded-full bg-white/10 py-1 pr-3.5 pl-1.5 text-xs font-extrabold tracking-wider text-white transition-colors hover:bg-white/20"
          >
            <img
              src={TEAM_INFO.logoPath}
              alt="Ace Viva Logo"
              className="h-6 w-6 rounded-full bg-white object-contain p-0.5"
            />
            <span>ACE VIVA</span>
          </a>

          <a
            href="#about-section"
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-[#7ADAD0]"
          >
            團隊誌要
          </a>
          <a
            href="#roster-section"
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-[#7ADAD0]"
          >
            成員圖鑑 ({MEMBERS.length})
          </a>
          <a
            href="#girl-seat-guide-section"
            className="rounded-full bg-[#5BAE84] px-3.5 py-1.5 text-xs font-extrabold text-white transition-colors hover:bg-[#4FA87D]"
          >
            女孩選位推薦
          </a>
          <a
            href="#seat-finder-section"
            className="rounded-full bg-[#5BAE84]/20 px-3 py-1.5 text-xs font-extrabold text-[#7ADAD0] ring-1 ring-[#5ECBC0]/35 transition-colors hover:bg-[#5BAE84] hover:text-white"
          >
            23 席面前女孩查詢
          </a>
          <a
            href="#schedule-section"
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-[#7ADAD0]"
          >
            應援班表
          </a>

          <button
            type="button"
            onClick={() => {
              setActiveCategory('favorites');
              document
                .getElementById('roster-section')
                ?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hidden items-center gap-1.5 rounded-full bg-[#5BAE84]/25 px-3 py-1.5 text-xs font-bold text-[#7ADAD0] ring-1 ring-[#5BAE84]/45 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#5BAE84] hover:text-white sm:flex"
          >
            <span>我的主推</span>
            <span className="rounded-full bg-[#5BAE84] px-1.5 py-0.2 font-mono-num text-[10px] font-extrabold text-white">
              {favoriteIds.length}
            </span>
          </button>

          <a
            href={TEAM_INFO.officialInstagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full bg-[#5BAE84] px-3.5 py-1.5 text-xs font-extrabold text-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#4FA87D] active:scale-[0.97]"
          >
            <span>IG 官方</span>
            <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>

      {/* Hero Section: Editorial Split + Asymmetrical Bento */}
      <section
        id="top"
        className="relative flex min-h-[100dvh] items-center overflow-hidden pt-28 pb-20 lg:pt-32 lg:pb-28"
      >
        {/* Subtle Mint & Indigo Architectural Background Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-36 right-0 h-[680px] w-[680px] rounded-full bg-radial from-[#5ECBC0]/28 via-[#5BAE84]/10 to-transparent blur-3xl"
        />

        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-10">
            {/* Left Column: Official Logo Identity, Editorial Typography & Nested CTA */}
            <div className="w-full animate-editorial-entry lg:col-span-6">
              <div className="inline-flex items-center gap-2.5 rounded-full bg-white px-4 py-1.5 shadow-xs ring-1 ring-[#5BAE84]/35">
                <span className="h-2 w-2 rounded-full bg-[#5BAE84]" />
                <span className="font-mono-num text-[10px] font-bold tracking-[0.22em] text-[#212047] uppercase">
                  TPVL · 臺中連莊職業排球隊專屬啦啦隊
                </span>
              </div>

              {/* Official Logo + Display Title */}
              <div className="mt-6 flex items-center gap-5">
                <div className="shrink-0 rounded-full bg-white p-2 shadow-[0_14px_35px_rgba(33,32,71,0.12)] ring-2 ring-[#5BAE84]/35">
                  <img
                    src={TEAM_INFO.logoPath}
                    alt="Ace Viva 連莊女孩官方 Logo"
                    className="h-20 w-20 rounded-full object-contain sm:h-24 sm:w-24"
                  />
                </div>
                <div>
                  <h1 className="text-4xl leading-[1.05] font-black tracking-tight text-[#212047] sm:text-6xl">
                    <span className="block font-editorial text-5xl font-bold tracking-tight text-[#4FA87D] italic sm:text-7xl">
                      Ace Viva
                    </span>
                    <span className="mt-1 block">連莊女孩官方圖鑑</span>
                  </h1>
                </div>
              </div>

              <p className="mt-6 max-w-xl text-base leading-relaxed font-medium text-[#212047]/80 sm:text-lg">
                2026 年 8 月全新成軍，由創隊隊長{' '}
                <strong className="font-bold text-[#212047]">Yuri（#6 陳洛心）</strong>
                、應援團長{' '}
                <strong className="font-bold text-[#212047]">馬妹（#41）</strong>
                、主場雙 MC{' '}
                <strong className="font-bold text-[#212047]">
                  巫苡萱（#111）&amp; 心璇（#25）
                </strong>{' '}
                領軍，集結台灣職棒、職籃、偶像女團、競技啦啦隊與韓國職棒「韓籍三本柱」{' '}
                <strong className="font-bold text-[#212047]">
                  車榮玹（#21）、李珠熙（#20）、鄭熙靜（#42）
                </strong>{' '}
                共 18 位全陣容形象照與應援檔案。
              </p>

              {/* Nested CTA Buttons (Button-in-Button Architecture) */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#roster-section"
                  className="group flex items-center gap-4 rounded-full bg-[#212047] py-2.5 pr-2.5 pl-7 text-sm font-bold text-white shadow-[0_18px_40px_-12px_rgba(33,32,71,0.45)] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#2D2C5A] active:scale-[0.98]"
                >
                  <span>探索 18 位官方形象圖鑑</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#5BAE84] text-white transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.25"
                      className="h-4 w-4"
                    >
                      <path
                        d="M7 17L17 7M17 7H8M17 7V16"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </a>

                <a
                  href="#girl-seat-guide-section"
                  className="group flex items-center gap-3 rounded-full bg-white py-2.5 pr-2.5 pl-6 text-sm font-bold text-[#212047] ring-1 ring-[#5BAE84]/40 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#E6F5F1] active:scale-[0.98]"
                >
                  <span>女孩專屬座位推薦區間</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E6F5F1] text-[#3F8E67] transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:scale-105">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.25"
                      className="h-4 w-4"
                    >
                      <path
                        d="M5 12h14M13 6l6 6-6 6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </a>
              </div>

              {/* Key Roster Metrics Strip */}
              <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl bg-white p-4 ring-1 ring-[#5BAE84]/25">
                  <div className="font-editorial text-3xl font-bold text-[#212047] italic">
                    16 + 2
                  </div>
                  <div className="mt-1 text-xs font-semibold text-[#212047]/65">
                    16 位隊員與 2 位 MC
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-4 ring-1 ring-[#5BAE84]/25">
                  <div className="font-editorial text-3xl font-bold text-[#4FA87D] italic">
                    03 KOR
                  </div>
                  <div className="mt-1 text-xs font-semibold text-[#212047]/65">
                    KBO 韓籍三本柱加盟
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-4 ring-1 ring-[#5BAE84]/25">
                  <div className="font-editorial text-3xl font-bold text-[#212047] italic">
                    2026.08
                  </div>
                  <div className="mt-1 text-xs font-semibold text-[#212047]/65">
                    LEXX 原質娛樂經紀
                  </div>
                </div>
                <div className="rounded-2xl bg-white p-4 ring-1 ring-[#5BAE84]/25">
                  <div className="font-editorial text-3xl font-bold text-[#4FA87D] italic">
                    TPVL
                  </div>
                  <div className="mt-1 text-xs font-semibold text-[#212047]/65">
                    臺中連莊主場應援
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Asymmetrical Bento Spotlight Cards with Real Photos */}
            <div className="w-full lg:col-span-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                {/* Main Spotlight: Captain Yuri (#6) */}
                <div className="sm:col-span-7">
                  <div className="rounded-[2rem] bg-[#D5EFE9] p-1.5 ring-1 ring-[#5BAE84]/35">
                    <button
                      type="button"
                      onClick={() => setSelectedMember(captainYuri)}
                      className="group relative block w-full overflow-hidden rounded-[calc(2rem-0.375rem)] bg-[#212047] text-left shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
                    >
                      <MemberPortrait
                        member={captainYuri}
                        className="aspect-[3/4] w-full"
                      />
                      <div className="flex items-center justify-between bg-[#212047] px-5 py-4 text-white">
                        <div>
                          <div className="font-mono-num text-[10px] tracking-[0.2em] text-[#7ADAD0]">
                            INAUGURAL CAPTAIN · 創隊首任隊長
                          </div>
                          <div className="mt-0.5 text-lg font-extrabold">
                            Yuri 陳洛心 (#6)
                          </div>
                        </div>
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5BAE84] text-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                          ↗
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Right Stacked Bento Cards */}
                <div className="flex flex-col justify-between gap-4 sm:col-span-5">
                  {/* Cheer Leader Mamai (#41) */}
                  <div className="rounded-[2rem] bg-[#D5EFE9] p-1.5 ring-1 ring-[#5BAE84]/35">
                    <button
                      type="button"
                      onClick={() => setSelectedMember(leaderMamai)}
                      className="group flex w-full flex-col justify-between rounded-[calc(2rem-0.375rem)] bg-[#212047] p-4 text-left text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#2C2A5A]"
                    >
                      <div className="flex items-center gap-3">
                        <MemberPortrait
                          member={leaderMamai}
                          variant="avatar"
                          className="h-14 w-14 shrink-0 rounded-2xl ring-2 ring-[#5ECBC0]"
                        />
                        <div>
                          <span className="rounded-full bg-[#5BAE84]/25 px-2.5 py-0.5 font-mono-num text-[10px] font-bold tracking-[0.14em] text-[#7ADAD0]">
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
                  <div className="rounded-[2rem] bg-[#D5EFE9] p-1.5 ring-1 ring-[#5BAE84]/35">
                    <div className="flex h-full flex-col justify-between rounded-[calc(2rem-0.375rem)] bg-white p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono-num text-[10px] font-bold tracking-[0.2em] text-[#4FA87D] uppercase">
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
                            className="group flex w-full items-center justify-between rounded-xl bg-[#F4FAF8] px-3 py-2 text-left ring-1 ring-[#5BAE84]/25 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#212047] hover:text-white"
                          >
                            <div className="flex items-center gap-2.5">
                              <MemberPortrait
                                member={kr}
                                variant="avatar"
                                className="h-8 w-8 rounded-full ring-1 ring-[#5BAE84]/40"
                              />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono-num text-xs font-extrabold text-[#4FA87D] group-hover:text-[#7ADAD0]">
                                    #{kr.number}
                                  </span>
                                  <span className="text-xs font-bold">
                                    {kr.name}
                                  </span>
                                </div>
                                <div className="text-[10px] opacity-60">
                                  {kr.realOrAltName} · MBTI {kr.mbti}
                                </div>
                              </div>
                            </div>
                            <span className="font-mono-num text-[10px] text-[#4FA87D] group-hover:text-[#7ADAD0]">
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
        className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8"
      >
        <div className="rounded-[2rem] bg-[#5BAE84]/30 p-1.5 ring-1 ring-[#212047]/15 sm:p-2">
          <div className="rounded-[calc(2rem-0.375rem)] bg-[#212047] px-6 py-12 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)] sm:px-12 sm:py-16">
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <div className="flex items-center gap-3">
                  <img
                    src={TEAM_INFO.logoPath}
                    alt="Ace Viva Logo"
                    className="h-10 w-10 rounded-full bg-white p-0.5 object-contain"
                  />
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 font-mono-num text-[10px] font-semibold tracking-[0.2em] text-[#7ADAD0] uppercase">
                    TEAM CHRONICLE · 品牌成軍誌要
                  </span>
                </div>
                <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  臺中連莊全新應援品牌
                  <span className="mt-1 block font-editorial text-4xl font-bold text-[#5ECBC0] italic">
                    Ace Viva 連莊女孩
                  </span>
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-white/75">
                  2025 年台灣職業排球聯盟（TPVL）成立，臺中連莊職業排球隊於 2026 年 8
                  月新賽季重新組建專屬啦啦隊品牌「Ace Viva（連莊女孩）」，由 LEXX
                  原質娛樂負責經紀營運，打造結合高規格韓流應援、女團唱跳與競技特技的主場視覺體驗。
                </p>

                <div className="mt-6 flex flex-wrap gap-2.5">
                  <a
                    href={TEAM_INFO.officialInstagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#5BAE84] px-4 py-2 text-xs font-extrabold text-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#4FA87D] active:scale-[0.97]"
                  >
                    <span>連莊女孩 (@{TEAM_INFO.officialInstagramHandle})</span>
                    <span>↗</span>
                  </a>
                  <a
                    href={TEAM_INFO.clubInstagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15"
                  >
                    <span>臺中連莊球團 (@{TEAM_INFO.clubInstagramHandle})</span>
                    <span>↗</span>
                  </a>
                  <a
                    href={TEAM_INFO.agencyInstagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15"
                  >
                    <span>LEXX 原質娛樂 (@{TEAM_INFO.agencyInstagramHandle})</span>
                    <span>↗</span>
                  </a>
                  <a
                    href={TEAM_INFO.mascotInstagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15"
                  >
                    <span>吉祥物虎仔 (@{TEAM_INFO.mascotInstagramHandle})</span>
                    <span>↗</span>
                  </a>
                  <a
                    href={TEAM_INFO.wikipediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/15"
                  >
                    <span>維基百科條目</span>
                    <span>↗</span>
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-7">
                {TEAM_INFO.historyMilestones.map((milestone) => (
                  <div
                    key={milestone.date}
                    className="flex flex-col justify-between rounded-2xl border border-[#5ECBC0]/20 bg-white/[0.05] p-5"
                  >
                    <div>
                      <div className="font-mono-num text-xs font-bold tracking-[0.2em] text-[#7ADAD0]">
                        {milestone.date}
                      </div>
                      <h3 className="mt-2.5 text-base font-extrabold text-white">
                        {milestone.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-white/75">
                        {milestone.description}
                      </p>
                    </div>
                    <div className="mt-6 border-t border-white/10 pt-3 font-mono-num text-[10px] tracking-[0.16em] text-[#7ADAD0]/60 uppercase">
                      OFFICIAL MILESTONE
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Roster Directory Section */}
      <section
        id="roster-section"
        className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8"
      >
        {/* Section Heading */}
        <div className="flex flex-col justify-between gap-6 border-b border-[#212047]/10 pb-10 lg:flex-row lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#5BAE84]/15 px-3.5 py-1 font-mono-num text-[10px] font-bold tracking-[0.2em] text-[#212047] uppercase ring-1 ring-[#5BAE84]/30">
              <span className="h-1.5 w-1.5 rounded-full bg-[#5BAE84]" />
              2026–2027 OFFICIAL ROSTER DIRECTORY
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-[#212047] sm:text-5xl">
              連莊女孩全體成員圖鑑
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#212047]/70 sm:text-base">
              完整收錄官方 WELCOME 形象照、背號、生日星座、MBTI 與雙棲經歷。支援依職務與國籍分類、關鍵字檢索、背號與生日排序，點擊任一成員卡片即可開啟完整資歷與出場預告。
            </p>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋姓名、背號、MBTI、雙棲球隊..."
                aria-label="搜尋成員姓名、背號、MBTI、IG 或雙棲球隊"
                className="w-full rounded-full bg-white py-2.5 pr-4 pl-10 text-xs font-medium text-[#212047] ring-1 ring-[#5BAE84]/35 transition-shadow placeholder:text-[#212047]/40 focus:ring-2 focus:ring-[#212047] focus:outline-none sm:w-64"
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
              className="rounded-full bg-white px-4 py-2.5 text-xs font-bold text-[#212047] ring-1 ring-[#5BAE84]/35 focus:ring-2 focus:ring-[#212047] focus:outline-none"
            >
              <option value="default">排序：預設官方編制</option>
              <option value="number_asc">排序：背號由小到大</option>
              <option value="birthday_asc">排序：生日月份先後</option>
            </select>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="mt-8 flex flex-wrap gap-2.5">
          {(
            ['all', 'leader', 'mc', 'tw_member', 'kr_member'] as const
          ).map((catKey) => {
            const info = CATEGORY_LABELS[catKey];
            const isActive = activeCategory === catKey;
            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setActiveCategory(catKey)}
                className={`group flex items-center gap-2.5 rounded-full px-5 py-2.5 text-xs font-bold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] ${
                  isActive
                    ? 'bg-[#212047] text-white shadow-[0_10px_25px_-8px_rgba(33,32,71,0.45)]'
                    : 'bg-white text-[#212047]/80 ring-1 ring-[#212047]/10 hover:bg-[#E6F5F1]'
                }`}
              >
                <span>{info.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 font-mono-num text-[10px] ${
                    isActive
                      ? 'bg-[#5BAE84] text-white'
                      : 'bg-[#E6F5F1] text-[#3F8E67]'
                  }`}
                >
                  {categoryCounts[catKey]}
                </span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setActiveCategory('favorites')}
            className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] ${
              activeCategory === 'favorites'
                ? 'bg-[#5BAE84] text-white shadow-sm'
                : 'bg-[#5BAE84]/15 text-[#212047] hover:bg-[#5BAE84]/25'
            }`}
          >
            <span>我的主推收藏</span>
            <span className="rounded-full bg-[#212047]/15 px-2 py-0.5 font-mono-num text-[10px]">
              {categoryCounts.favorites}
            </span>
          </button>
        </div>

        {/* Empty State */}
        {displayedMembers.length === 0 && (
          <div className="mt-12 rounded-[2rem] bg-white p-14 text-center ring-1 ring-[#212047]/10">
            <p className="text-lg font-extrabold text-[#212047]">
              找不到符合條件的連莊女孩成員
            </p>
            <p className="mt-2 text-sm text-[#212047]/65">
              請嘗試調整搜尋關鍵字或切換上方分類篩選標籤。
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
              }}
              className="mt-5 rounded-full bg-[#212047] px-5 py-2.5 text-xs font-bold text-white"
            >
              重置所有篩選條件
            </button>
          </div>
        )}

        {/* Member Cards Grid (Double-Bezel Nested Architecture) */}
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayedMembers.map((member) => {
            const isFav = favoriteIds.includes(member.id);
            return (
              <article
                key={member.id}
                className="group relative rounded-[2rem] bg-[#D5EFE9]/80 p-1.5 ring-1 ring-[#5BAE84]/30 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1.5 hover:bg-[#5BAE84]/30 hover:shadow-[0_24px_60px_-15px_rgba(33,32,71,0.18)]"
              >
                {/* Inner Core */}
                <div className="flex h-full flex-col justify-between overflow-hidden rounded-[calc(2rem-0.375rem)] bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)]">
                  <div>
                    {/* Portrait Wrapper + Floating Favorite Heart */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setSelectedMember(member)}
                        aria-label={`開啟 ${member.name} 的詳細個人檔案`}
                        className="block w-full text-left focus:outline-none"
                      >
                        <MemberPortrait
                          member={member}
                          variant="card"
                          className="aspect-[3/4] w-full"
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
                        className={`absolute top-3.5 right-3.5 z-20 flex h-9 w-9 items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-90 ${
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
                          className="h-4 w-4"
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
                    <div className="p-5">
                      <div className="flex items-baseline justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-black tracking-tight text-[#212047]">
                              <button
                                type="button"
                                onClick={() => setSelectedMember(member)}
                                className="text-left hover:text-[#4FA87D] focus:outline-none"
                              >
                                {member.name}
                              </button>
                            </h3>
                            <span className="rounded-md bg-[#E6F5F1] px-2 py-0.5 font-mono-num text-[10px] font-bold text-[#3F8E67]">
                              {member.mbti}
                            </span>
                          </div>
                          <div className="mt-0.5 font-mono-num text-[11px] font-medium text-[#212047]/55">
                            {member.birthday} · {member.zodiac}
                          </div>
                        </div>

                        <span className="font-editorial text-3xl font-bold text-[#4FA87D] italic">
                          #{member.number}
                        </span>
                      </div>

                      <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-[#212047]/70">
                        {member.tagline}
                      </p>

                      {/* Dual Team Chips */}
                      <div className="mt-3.5 flex flex-wrap gap-1.5">
                        {member.dualTeams.map((team) => (
                          <span
                            key={team}
                            className="rounded-md bg-[#F4FAF8] px-2 py-0.5 text-[11px] font-semibold text-[#212047] ring-1 ring-[#5BAE84]/30"
                          >
                            {team}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer: Direct IG Link + Open Dossier Button */}
                  <div className="flex items-center justify-between border-t border-[#212047]/[0.07] bg-[#F4FAF8] px-5 py-3">
                    <a
                      href={member.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-mono-num text-[11px] font-semibold text-[#212047]/75 transition-colors hover:text-[#4FA87D]"
                    >
                      <span>@{member.instagramHandle}</span>
                      <span aria-hidden="true">↗</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setSelectedMember(member)}
                      className="inline-flex items-center gap-1 text-xs font-extrabold text-[#212047] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5"
                    >
                      <span>詳細檔案</span>
                      <span className="text-[#4FA87D]">→</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Girl-Centric Seat Recommendation Guide (Select Girl -> Best Zone & Seat Intervals) */}
      <GirlSeatRecommendationSection
        favoriteIds={favoriteIds}
        onOpenMemberDetail={(m) => setSelectedMember(m)}
        onJumpToSeatSimulator={(matchId, zone, seat) => {
          setSeatSimulatorJump({
            matchId,
            zone,
            seat,
            timestamp: Date.now(),
          });
          document
            .getElementById('seat-finder-section')
            ?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Interactive 2F ACE Zone (A/B/C · 23 Seats) Seat & Girl Station Finder */}
      <SeatFinderSection
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

      {/* Footer with Official Logo & Data Maintainability Note */}
      <footer className="border-t border-[#212047]/10 bg-[#212047] text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
            <div className="md:col-span-6">
              <div className="flex items-center gap-3">
                <img
                  src={TEAM_INFO.logoPath}
                  alt="Ace Viva Logo"
                  className="h-10 w-10 rounded-full bg-white p-0.5 object-contain"
                />
                <span className="font-editorial text-2xl font-bold tracking-wider text-[#7ADAD0] italic">
                  ACE VIVA · 連莊女孩
                </span>
              </div>
              <p className="mt-3 max-w-md text-xs leading-relaxed text-white/75">
                台灣職業排球聯盟（TPVL）臺中連莊職業排球隊專屬啦啦隊介紹與應援班表平台。資料來源整合自維基百科「Ace Viva」條目與官方 Instagram (@ace_viva_official) 公開資訊。
              </p>
            </div>

            <div className="md:col-span-6">
              <div className="rounded-2xl border border-[#5ECBC0]/25 bg-white/[0.05] p-5">
                <div className="font-mono-num text-[10px] font-bold tracking-[0.2em] text-[#7ADAD0] uppercase">
                  DEVELOPER MAINTAINABILITY · 照片與班表維護指南
                </div>
                <p className="mt-2 text-xs leading-relaxed text-white/80">
                  全體 18 位成員之官方 WELCOME 形象照與官方 Logo 已存放於{' '}
                  <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono-num text-[#7ADAD0]">
                    public/images/members/
                  </code>{' '}
                  與{' '}
                  <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono-num text-[#7ADAD0]">
                    public/images/logo.png
                  </code>
                  。日後欲更新賽季班表或成員資料，可直接編輯{' '}
                  <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono-num text-[#7ADAD0]">
                    src/data/schedule.ts
                  </code>{' '}
                  與{' '}
                  <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono-num text-[#7ADAD0]">
                    src/data/members.ts
                  </code>
                  。
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-white/55">
            <span>© 2026–2027 ACE VIVA Fan &amp; Roster Showcase · Taichung Win+Streak</span>
            <div className="flex items-center gap-5">
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
        isFavorite={selectedMember ? favoriteIds.includes(selectedMember.id) : false}
        onToggleFavorite={toggleFavorite}
        onClose={() => setSelectedMember(null)}
        onSelectScheduleMember={handleSelectScheduleMemberFromModal}
      />
    </div>
  );
};

export default App;
