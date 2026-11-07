import React, { useMemo, useState } from 'react';
import { MEMBERS, type AceVivaMember } from '../data/members';
import {
  STATION_ROTATION_SCHEDULES,
  getGirlSeatRecommendations,
  type AceZoneId,
  type GirlSetZoneRecommendation,
} from '../data/schedule';
import { MemberPortrait } from './MemberPortrait';
import { OshiStrategyCardModal } from './OshiStrategyCardModal';

interface GirlSeatRecommendationSectionProps {
  favoriteIds: string[];
  onOpenMemberDetail: (member: AceVivaMember) => void;
  onJumpToSeatSimulator?: (
    matchId: string,
    zone: AceZoneId,
    seat: number,
    girlId?: string
  ) => void;
}

const SEAT_NUMBERS = Array.from({ length: 23 }, (_, i) => i + 1);

const MOBILE_SEAT_GROUPS = [
  { label: '左位 1–8 號', seats: [1, 2, 3, 4, 5, 6, 7, 8], cols: 'grid-cols-8' },
  { label: '中位 9–15 號', seats: [9, 10, 11, 12, 13, 14, 15], cols: 'grid-cols-7' },
  {
    label: '右位 16–23 號',
    seats: [16, 17, 18, 19, 20, 21, 22, 23],
    cols: 'grid-cols-8',
  },
];

function isSeatInRange(seat: number, range: [number, number]): boolean {
  return seat >= range[0] && seat <= range[1];
}

export const GirlSeatRecommendationSection: React.FC<
  GirlSeatRecommendationSectionProps
> = ({ favoriteIds, onOpenMemberDetail, onJumpToSeatSimulator }) => {
  const [selectedMatchId, setSelectedMatchId] = useState<string>('2026-11-07');
  const [selectedGirlId, setSelectedGirlId] = useState<string>('yuri');
  const [onlyFavoritesInMatrix, setOnlyFavoritesInMatrix] =
    useState<boolean>(false);
  const [isStrategyModalOpen, setIsStrategyModalOpen] =
    useState<boolean>(false);

  const memberMap = useMemo(() => {
    const map = new Map<string, AceVivaMember>();
    for (const m of MEMBERS) {
      map.set(m.id, m);
    }
    return map;
  }, []);

  const currentMatchSchedule = useMemo(
    () =>
      STATION_ROTATION_SCHEDULES.find((s) => s.matchId === selectedMatchId) ??
      STATION_ROTATION_SCHEDULES[0],
    [selectedMatchId]
  );

  // Get all 9 rotating cheerleaders for the selected match day
  const rotatingMemberIds = useMemo(() => {
    const set1 = currentMatchSchedule.sets[0].initial;
    return [...set1.A, ...set1.B, ...set1.C];
  }, [currentMatchSchedule]);

  const rotatingMembers = useMemo(
    () =>
      rotatingMemberIds
        .map((id) => memberMap.get(id))
        .filter((m): m is AceVivaMember => Boolean(m)),
    [rotatingMemberIds, memberMap]
  );

  const mcAndLeaderMembers = useMemo(
    () =>
      currentMatchSchedule.mcAndLeaderIds
        .map((id) => memberMap.get(id))
        .filter((m): m is AceVivaMember => Boolean(m)),
    [currentMatchSchedule, memberMap]
  );

  // Ensure selectedGirlId is valid for current match day
  const activeGirlId = rotatingMemberIds.includes(selectedGirlId)
    ? selectedGirlId
    : rotatingMemberIds[0];

  const activeGirl = memberMap.get(activeGirlId) ?? rotatingMembers[0];

  const activeGirlRecommendations = useMemo(
    () => getGirlSeatRecommendations(currentMatchSchedule, activeGirl.id),
    [currentMatchSchedule, activeGirl.id]
  );

  const primaryRec: GirlSetZoneRecommendation | undefined =
    activeGirlRecommendations[0];

  // Matrix list (all rotating members or filtered by favorites)
  const matrixMembers = useMemo(() => {
    if (!onlyFavoritesInMatrix) return rotatingMembers;
    return rotatingMembers.filter((m) => favoriteIds.includes(m.id));
  }, [rotatingMembers, onlyFavoritesInMatrix, favoriteIds]);

  return (
    <section
      id="girl-seat-guide-section"
      className="relative mx-auto max-w-[1440px] px-3 py-16 sm:px-6 sm:py-24 lg:px-10"
    >
      {/* Section Header */}
      <div className="flex flex-col justify-between gap-5 border-b border-[#212047]/10 pb-8 lg:flex-row lg:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#212047] px-3 py-1 font-mono-num text-[10px] font-bold tracking-[0.16em] text-[#7ADAD0] uppercase lg:px-4 lg:py-1.5 lg:text-xs">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#5BAE84]" />
            <span>GIRL-CENTRIC SEAT GUIDE · 女孩專屬選位推薦</span>
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-[#212047] sm:text-5xl lg:text-6xl">
            以女孩為主的黃金座位推薦區間
          </h2>
          <p className="mt-2.5 max-w-4xl text-xs leading-relaxed text-[#212047]/75 sm:text-base lg:text-lg">
            點選你想鎖定的連莊女孩，系統將自動追蹤她在「第 1、4 局」、「第 2、5 局」與「第 3 局」的跨區路線，以及單局得分破 10 分前後的區內移位，計算出「雙享黃金席」與「破 10 分主力 C 位席」推薦號碼區間。
          </p>
          <p className="mt-2 max-w-4xl text-[11px] font-semibold text-[#3F8E67] lg:text-sm">
            ※ 粉絲自製免責說明：本選位區間為依據官方公告站位表推算之輔助參考，現場實際座椅編號與臨時人員異動，請以球團與 ACE VIVA 官方最新實際公告為準。
          </p>
        </div>

        {/* Dynamic Match Day Switcher + 1-Click Strategy Card Generator */}
        <div className="flex flex-wrap items-center gap-2 lg:self-end">
          <div className="flex flex-wrap gap-1.5 rounded-2xl bg-[#D5EFE9] p-1.5 ring-1 ring-[#5BAE84]/35 sm:rounded-full">
            {STATION_ROTATION_SCHEDULES.map((sched, idx) => {
              const isActive = sched.matchId === selectedMatchId;
              return (
                <button
                  key={sched.matchId}
                  type="button"
                  onClick={() => setSelectedMatchId(sched.matchId)}
                  className={`rounded-xl px-3 py-2 text-center text-xs font-extrabold transition-all duration-300 sm:rounded-full sm:px-4 sm:whitespace-nowrap lg:px-5 lg:py-2.5 lg:text-sm ${
                    isActive
                      ? 'bg-[#212047] text-white shadow-sm'
                      : 'text-[#212047]/75 hover:bg-white/60 hover:text-[#212047]'
                  }`}
                >
                  Day {idx + 1} · {sched.dateLabel.split(' ')[0]} vs{' '}
                  {sched.opponent}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setIsStrategyModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#5BAE84] px-4 py-2.5 text-xs font-black text-white shadow-sm transition-all hover:bg-[#3F8E67] active:scale-95 lg:px-5 lg:py-3 lg:text-sm"
          >
            <span>一鍵生出「{activeGirl.name}」視角攻略圖片</span>
            <span>↓</span>
          </button>
        </div>
      </div>

      {/* Girl Selector Pill Strip (Face-Focused Avatars) */}
      <div className="mt-6 rounded-[1.75rem] bg-[#D5EFE9] p-1.5 ring-1 ring-[#5BAE84]/35 sm:mt-8 sm:rounded-[2rem] sm:p-2">
        <div className="rounded-[calc(1.75rem-0.375rem)] bg-white p-3.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] sm:rounded-[calc(2rem-0.375rem)] sm:p-6 lg:p-7">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5">
            <span className="font-mono-num text-[11px] font-extrabold tracking-[0.14em] text-[#212047] uppercase sm:text-xs lg:text-sm">
              點選當日出席女孩檢視專屬推薦席位（{rotatingMembers.length} 位集氣區輪換女孩）
            </span>
            <span className="text-[11px] font-medium text-[#4FA87D] lg:text-xs">
              ★ 為已加入「我的主推」成員
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
            {rotatingMembers.map((m) => {
              const isSelected = m.id === activeGirl.id;
              const isFav = favoriteIds.includes(m.id);
              const rec1 = getGirlSeatRecommendations(
                currentMatchSchedule,
                m.id
              )[0];

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedGirlId(m.id)}
                  className={`group relative flex min-w-0 flex-col items-center rounded-2xl p-2 text-center transition-all duration-300 active:scale-95 sm:p-2.5 lg:p-3 ${
                    isSelected
                      ? 'bg-[#212047] text-white shadow-[0_14px_30px_-8px_rgba(33,32,71,0.45)] ring-2 ring-[#5BAE84]'
                      : 'bg-[#F4FAF8] text-[#212047] ring-1 ring-[#212047]/10 hover:bg-[#E6F5F1]'
                  }`}
                >
                  {isFav && (
                    <span
                      className={`absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold lg:h-5 lg:w-5 lg:text-[10px] ${
                        isSelected
                          ? 'bg-[#5BAE84] text-white'
                          : 'bg-[#212047] text-[#7ADAD0]'
                      }`}
                    >
                      ★
                    </span>
                  )}
                  <MemberPortrait
                    member={m}
                    variant="avatar"
                    className={`h-13 w-13 rounded-full transition-transform duration-500 group-hover:scale-105 sm:h-16 sm:w-16 lg:h-18 lg:w-18 ${
                      isSelected
                        ? 'ring-2 ring-[#5ECBC0]'
                        : 'ring-1 ring-[#5BAE84]/35'
                    }`}
                  />
                  <div className="mt-1.5 font-mono-num text-[10px] font-bold text-[#4FA87D] group-hover:text-[#5ECBC0] lg:text-xs">
                    #{m.number}
                  </div>
                  <div className="w-full truncate text-xs font-black sm:text-sm lg:text-base">
                    {m.name}
                  </div>
                  {rec1 && (
                    <div
                      className={`mt-1 rounded-full px-2 py-0.5 font-mono-num text-[9px] font-bold whitespace-nowrap lg:px-2.5 lg:text-[11px] ${
                        isSelected
                          ? 'bg-[#5BAE84] text-white'
                          : 'bg-[#D5EFE9] text-[#212047]'
                      }`}
                    >
                      首推 {rec1.zone} 區
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Spotlight Dashboard for the Selected Girl */}
      <div className="mt-6 rounded-[1.75rem] bg-[#D5EFE9] p-1.5 ring-1 ring-[#5BAE84]/35 sm:mt-8 sm:rounded-[2rem] sm:p-2">
        <div className="rounded-[calc(1.75rem-0.375rem)] bg-white p-3.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] sm:rounded-[calc(2rem-0.375rem)] sm:p-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
            {/* Left 4 Cols: Selected Girl Dossier & #1 Ticket Recommendation */}
            <div className="flex flex-col justify-between rounded-3xl bg-[#212047] p-4 text-white sm:p-6 lg:col-span-4 lg:p-7">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-[#5BAE84] px-3 py-0.5 font-mono-num text-[10px] font-extrabold tracking-wider text-white uppercase lg:text-xs">
                    TARGET LOCK · 專屬選位攻略
                  </span>
                  <span className="font-editorial text-3xl font-bold text-[#7ADAD0] italic lg:text-4xl">
                    #{activeGirl.number}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => onOpenMemberDetail(activeGirl)}
                    className="shrink-0 overflow-hidden rounded-2xl ring-2 ring-[#5ECBC0]"
                  >
                    <MemberPortrait
                      member={activeGirl}
                      variant="avatar"
                      className="h-20 w-20 lg:h-24 lg:w-24"
                    />
                  </button>
                  <div className="min-w-0">
                    <h3 className="text-2xl font-black text-white sm:text-3xl lg:text-4xl">
                      {activeGirl.name}
                    </h3>
                    {activeGirl.realOrAltName && (
                      <div className="text-xs text-white/65 lg:text-sm">
                        {activeGirl.realOrAltName} · MBTI {activeGirl.mbti}
                      </div>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenMemberDetail(activeGirl)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#7ADAD0] hover:underline lg:text-sm"
                      >
                        <span>個人檔案</span>
                        <span>↗</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsStrategyModalOpen(true)}
                        className="inline-flex items-center gap-1 rounded-full bg-[#5BAE84] px-3 py-1 text-xs font-black text-white shadow-xs transition-transform hover:bg-[#3F8E67] active:scale-95"
                      >
                        <span>生成換位攻略圖 (PNG)</span>
                        <span>↓</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* #1 Best Seat Interval Box */}
                {primaryRec && (
                  <div className="mt-5 rounded-2xl border border-[#5ECBC0]/35 bg-white/10 p-4 sm:mt-6 sm:p-5">
                    <div className="font-mono-num text-[10px] font-extrabold tracking-wider text-[#7ADAD0] uppercase lg:text-xs">
                      #1 BEST TICKET ZONE · 本場頭號推薦座位區間
                    </div>
                    <div className="mt-2 text-2xl font-black text-white lg:text-3xl">
                      2F ACE 集氣 {primaryRec.zone} 區
                    </div>
                    <div className="mt-1 font-mono-num text-sm font-extrabold text-[#5ECBC0] sm:text-base lg:text-lg">
                      推薦席次：{primaryRec.sweetSpotLabel}
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-white/80 lg:text-sm">
                      {primaryRec.priorityReason} {primaryRec.sweetSpotReason}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/15 pt-3.5 text-xs lg:text-sm">
                      <div className="rounded-xl bg-white/10 p-2.5 lg:p-3">
                        <div className="font-mono-num text-[10px] text-[#7ADAD0] lg:text-xs">
                          開局（0–10 分）正對
                        </div>
                        <div className="mt-0.5 font-extrabold text-white">
                          {primaryRec.zone} 區 {primaryRec.initialSeatRange[0]}–
                          {primaryRec.initialSeatRange[1]} 號
                        </div>
                        <div className="text-[10px] text-white/65 lg:text-xs">
                          C 位核心：{primaryRec.initialCoreSeats}
                        </div>
                      </div>
                      <div className="rounded-xl bg-[#5BAE84]/30 p-2.5 ring-1 ring-[#5ECBC0]/40 lg:p-3">
                        <div className="font-mono-num text-[10px] text-[#7ADAD0] lg:text-xs">
                          破 10 分後（主力段）
                        </div>
                        <div className="mt-0.5 font-extrabold text-white">
                          {primaryRec.zone} 區 {primaryRec.after10SeatRange[0]}–
                          {primaryRec.after10SeatRange[1]} 號
                        </div>
                        <div className="text-[10px] text-white/80 lg:text-xs">
                          C 位核心：{primaryRec.after10CoreSeats}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Rotation Logic Tip */}
              <div className="mt-5 rounded-2xl bg-white/[0.06] p-3.5 text-xs leading-relaxed text-white/75 sm:mt-6 sm:p-4 lg:text-sm">
                <strong className="font-bold text-[#7ADAD0]">
                  選位策略解析：
                </strong>
                排球每局打至 25 分，連莊得分「超過 10 分後（11–25 分）」佔單局約 60%
                時間且包含局末關鍵高潮，建議優先鎖定「破 10 分後正對區間」或「兩段交界黃金帶」。
              </div>
            </div>

            {/* Right 8 Cols: Set 1&4, Set 2&5, Set 3 Detailed Seat Interval & 1-23 Heatmap */}
            <div className="flex flex-col justify-between gap-4 sm:gap-5 lg:col-span-8">
              {activeGirlRecommendations.map((rec) => (
                <div
                  key={rec.setKey}
                  className={`rounded-3xl p-3.5 transition-all sm:p-6 ${
                    rec.setKey === 'set1_4'
                      ? 'bg-[#F4FAF8] ring-2 ring-[#5BAE84]'
                      : 'bg-[#F4FAF8]/70 ring-1 ring-[#212047]/10'
                  }`}
                >
                  {/* Top Row: Set Title + Zone Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#212047]/10 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 font-mono-num text-xs font-extrabold whitespace-nowrap lg:px-3.5 lg:text-sm ${
                          rec.setKey === 'set1_4'
                            ? 'bg-[#212047] text-[#7ADAD0]'
                            : 'bg-[#212047]/10 text-[#212047]'
                        }`}
                      >
                        {rec.setLabel}
                      </span>
                      <span className="text-xs font-bold text-[#3F8E67] lg:text-sm">
                        {rec.priorityBadge}
                      </span>
                    </div>

                    <span className="rounded-full bg-[#5BAE84] px-3 py-1 font-mono-num text-xs font-extrabold text-white whitespace-nowrap lg:px-4 lg:text-sm">
                      2F ACE 集氣 {rec.zone} 區
                    </span>
                  </div>

                  {/* Middle Row: 3 Interval Breakdown Cards */}
                  <div className="mt-3.5 grid grid-cols-2 gap-2.5 sm:mt-4 sm:grid-cols-3 sm:gap-3">
                    <div className="rounded-2xl bg-white p-3 ring-1 ring-[#212047]/10 lg:p-4">
                      <div className="font-mono-num text-[10px] font-bold text-[#212047]/55 uppercase lg:text-xs">
                        開局（0–10 分）
                      </div>
                      <div className="mt-1 text-sm font-black text-[#212047] sm:text-base lg:text-lg">
                        {rec.zone} 區 {rec.initialSeatRange[0]}–
                        {rec.initialSeatRange[1]} 號
                      </div>
                      <div className="mt-0.5 text-[11px] font-semibold text-[#4FA87D] lg:text-xs">
                        核心 {rec.initialCoreSeats}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#212047] p-3 text-white lg:p-4">
                      <div className="font-mono-num text-[10px] font-bold text-[#7ADAD0] uppercase lg:text-xs">
                        破 10 分後（主力段）
                      </div>
                      <div className="mt-1 text-sm font-black text-white sm:text-base lg:text-lg">
                        {rec.zone} 區 {rec.after10SeatRange[0]}–
                        {rec.after10SeatRange[1]} 號
                      </div>
                      <div className="mt-0.5 text-[11px] font-semibold text-[#7ADAD0] lg:text-xs">
                        核心 {rec.after10CoreSeats}
                      </div>
                    </div>

                    <div className="col-span-2 rounded-2xl bg-[#E6F5F1] p-3 ring-1 ring-[#5BAE84]/40 sm:col-span-1 lg:p-4">
                      <div className="font-mono-num text-[10px] font-extrabold text-[#3F8E67] uppercase lg:text-xs">
                        SWEET SPOT · 整局推薦區間
                      </div>
                      <div className="mt-1 text-sm font-black text-[#212047] lg:text-lg">
                        {rec.sweetSpotLabel}
                      </div>
                      <div className="mt-0.5 text-[11px] text-[#212047]/70 lg:text-xs">
                        兼顧開局與破 10 分換位視角
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: 1-23 Seat Heatmap Bar (Mobile 3-Station Stacked / Desktop 23-Col Linear) */}
                  <div className="mt-4">
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-1.5 text-[11px] lg:text-xs">
                      <span className="font-mono-num font-bold text-[#212047]/75">
                        {rec.zone} 區 1–23 號推薦標示（點擊號碼可模擬該座位視角）：
                      </span>
                      <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-bold lg:text-xs">
                        <span className="inline-flex items-center gap-1 text-[#212047]">
                          <span className="h-2.5 w-2.5 rounded-xs bg-[#212047]" />
                          破 10 分主力正對席
                        </span>
                        <span className="inline-flex items-center gap-1 text-[#3F8E67]">
                          <span className="h-2.5 w-2.5 rounded-xs bg-[#5BAE84]" />
                          開局 0–10 分正對席
                        </span>
                      </div>
                    </div>

                    {/* Mobile 3-Station Stacked Grid (Fits 100% of Phone Width!) */}
                    <div className="grid grid-cols-1 gap-1.5 md:hidden">
                      {MOBILE_SEAT_GROUPS.map((grp) => (
                        <div
                          key={grp.label}
                          className="flex items-center gap-1.5 rounded-xl bg-white/75 p-1.5 ring-1 ring-[#212047]/[0.06]"
                        >
                          <span className="w-15 shrink-0 font-mono-num text-[10px] font-bold text-[#212047]/70">
                            {grp.label}
                          </span>
                          <div className={`grid min-w-0 flex-1 ${grp.cols} gap-1`}>
                            {grp.seats.map((seatNum) => {
                              const inInit = isSeatInRange(
                                seatNum,
                                rec.initialSeatRange
                              );
                              const inAfter10 = isSeatInRange(
                                seatNum,
                                rec.after10SeatRange
                              );
                              const inSweet = isSeatInRange(
                                seatNum,
                                rec.sweetSpotRange
                              );

                              return (
                                <button
                                  key={seatNum}
                                  type="button"
                                  onClick={() => {
                                    if (onJumpToSeatSimulator) {
                                      onJumpToSeatSimulator(
                                        currentMatchSchedule.matchId,
                                        rec.zone,
                                        seatNum,
                                        activeGirl.id
                                      );
                                    }
                                  }}
                                  className={`flex items-center justify-center rounded-lg py-1.5 font-mono-num text-[11px] font-extrabold active:scale-95 ${
                                    inAfter10
                                      ? 'bg-[#212047] text-[#7ADAD0] ring-1 ring-[#5BAE84]'
                                      : inInit
                                        ? 'bg-[#5BAE84] text-white'
                                        : inSweet
                                          ? 'bg-[#D5EFE9] text-[#212047]'
                                          : 'bg-[#F4FAF8] text-[#212047]/35'
                                  }`}
                                >
                                  {seatNum}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop 23-Column Linear Bar */}
                    <div className="hidden md:grid md:grid-cols-23 md:gap-1">
                      {SEAT_NUMBERS.map((seatNum) => {
                        const inInit = isSeatInRange(
                          seatNum,
                          rec.initialSeatRange
                        );
                        const inAfter10 = isSeatInRange(
                          seatNum,
                          rec.after10SeatRange
                        );
                        const inSweet = isSeatInRange(
                          seatNum,
                          rec.sweetSpotRange
                        );

                        return (
                          <button
                            key={seatNum}
                            type="button"
                            onClick={() => {
                              if (onJumpToSeatSimulator) {
                                onJumpToSeatSimulator(
                                  currentMatchSchedule.matchId,
                                  rec.zone,
                                  seatNum,
                                  activeGirl.id
                                );
                              }
                            }}
                            title={`${rec.zone} 區 ${seatNum} 號席`}
                            className={`flex flex-col items-center justify-center rounded-lg py-2 font-mono-num text-xs font-extrabold transition-transform hover:scale-105 ${
                              inAfter10
                                ? 'bg-[#212047] text-[#7ADAD0] ring-1 ring-[#5BAE84]'
                                : inInit
                                  ? 'bg-[#5BAE84] text-white'
                                  : inSweet
                                    ? 'bg-[#D5EFE9] text-[#212047] ring-1 ring-[#5BAE84]/50'
                                    : 'bg-white text-[#212047]/35 ring-1 ring-[#212047]/[0.06]'
                            }`}
                          >
                            <span>{seatNum}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Complete Matrix: Mobile Card Stack + Desktop Table */}
      <div className="mt-8 rounded-[1.75rem] bg-[#D5EFE9] p-1.5 ring-1 ring-[#5BAE84]/35 sm:mt-10 sm:rounded-[2rem] sm:p-2">
        <div className="rounded-[calc(1.75rem-0.375rem)] bg-white p-3.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] sm:rounded-[calc(2rem-0.375rem)] sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#212047]/10 pb-4 sm:pb-5">
            <div>
              <span className="font-mono-num text-[10px] font-bold tracking-[0.16em] text-[#4FA87D] uppercase sm:text-[11px] lg:text-xs">
                ALL GIRLS SEAT MATRIX · 當日全體女孩推薦座位區間總覽
              </span>
              <h3 className="mt-1 text-lg font-black text-[#212047] sm:text-2xl lg:text-3xl">
                {currentMatchSchedule.dateLabel.split(' ')[0]}（vs{' '}
                {currentMatchSchedule.opponent}）全體女孩選位速查表
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setOnlyFavoritesInMatrix((prev) => !prev)}
              className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold transition-all lg:px-4 lg:py-2.5 lg:text-sm ${
                onlyFavoritesInMatrix
                  ? 'bg-[#5BAE84] text-white shadow-xs'
                  : 'bg-[#F4FAF8] text-[#212047] ring-1 ring-[#5BAE84]/35 hover:bg-[#E6F5F1]'
              }`}
            >
              <span>只看「我的主推」</span>
              <span className="rounded-full bg-[#212047]/15 px-1.5 py-0.2 font-mono-num text-[10px] lg:text-xs">
                {favoriteIds.length}
              </span>
            </button>
          </div>

          {onlyFavoritesInMatrix && matrixMembers.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-bold text-[#212047] lg:text-base">
                你收藏的「我的主推」成員未在此場次的 2F ACE 集氣區輪換名單中，或尚未加入主推成員。
              </p>
              <button
                type="button"
                onClick={() => setOnlyFavoritesInMatrix(false)}
                className="mt-3 rounded-full bg-[#212047] px-4 py-2 text-xs font-bold text-white lg:text-sm"
              >
                顯示當日全部 {rotatingMembers.length} 位輪換女孩
              </button>
            </div>
          ) : (
            <>
              {/* Mobile Dedicated Schedule Cards (No Horizontal Scroll Needed) */}
              <div className="mt-4 grid grid-cols-1 gap-3 md:hidden">
                {matrixMembers.map((m) => {
                  const recs = getGirlSeatRecommendations(
                    currentMatchSchedule,
                    m.id
                  );
                  const isSelected = m.id === activeGirl.id;

                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedGirlId(m.id)}
                      className={`rounded-2xl p-3 transition-all ${
                        isSelected
                          ? 'bg-[#E6F5F1] ring-2 ring-[#5BAE84]'
                          : 'bg-[#F4FAF8] ring-1 ring-[#212047]/10'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-[#212047]/10 pb-3">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <MemberPortrait
                            member={m}
                            variant="avatar"
                            className="h-12 w-12 shrink-0 rounded-full ring-2 ring-[#5BAE84]/50"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono-num text-xs font-extrabold text-[#4FA87D]">
                                #{m.number}
                              </span>
                              <span className="truncate text-base font-black text-[#212047]">
                                {m.name}
                              </span>
                            </div>
                            <div className="truncate font-mono-num text-[11px] text-[#212047]/55">
                              @{m.instagramHandle}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedGirlId(m.id);
                            document
                              .getElementById('girl-seat-guide-section')
                              ?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap ${
                            isSelected
                              ? 'bg-[#5BAE84] text-white'
                              : 'bg-[#212047] text-white'
                          }`}
                        >
                          {isSelected ? '檢視中' : '查看尺規 ↑'}
                        </button>
                      </div>

                      <div className="mt-2.5 space-y-2">
                        {recs.map((r, idx) => (
                          <div
                            key={r.setKey}
                            className="flex flex-wrap items-center justify-between gap-1.5 rounded-xl bg-white px-2.5 py-2 text-xs ring-1 ring-[#212047]/[0.06]"
                          >
                            <span
                              className={`rounded-md px-2 py-0.5 font-mono-num text-[10px] font-extrabold whitespace-nowrap ${
                                idx === 0
                                  ? 'bg-[#212047] text-[#7ADAD0]'
                                  : 'bg-[#D5EFE9] text-[#212047]'
                              }`}
                            >
                              {r.setLabel} · {r.zone} 區
                            </span>
                            <div className="font-mono-num text-[11px]">
                              <span className="text-[#212047]/65">
                                0–10 分 {r.initialSeatRange[0]}–
                                {r.initialSeatRange[1]} 號
                              </span>
                              <span className="mx-1 text-[#212047]/30">|</span>
                              <strong className="font-extrabold text-[#3F8E67]">
                                破 10 分 {r.after10SeatRange[0]}–
                                {r.after10SeatRange[1]} 號
                              </strong>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Full Table */}
              <div className="mt-6 hidden overflow-x-auto md:block">
                <table className="w-full min-w-[780px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[#212047]/10 font-mono-num text-xs font-extrabold tracking-[0.14em] text-[#212047]/60 uppercase lg:text-sm">
                      <th className="py-3 pr-4">女孩成員</th>
                      <th className="px-4 py-3">
                        ★ 首選主戰區（第 1 &amp; 4 局）
                      </th>
                      <th className="px-4 py-3">
                        ◆ 次選推薦區（第 2 &amp; 5 局）
                      </th>
                      <th className="px-4 py-3">● 第三局必打區（第 3 局）</th>
                      <th className="py-3 pl-4 text-right">攻略詳情</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#212047]/[0.08] text-xs lg:text-sm">
                    {matrixMembers.map((m) => {
                      const recs = getGirlSeatRecommendations(
                        currentMatchSchedule,
                        m.id
                      );
                      const r1 = recs.find((r) => r.setKey === 'set1_4');
                      const r2 = recs.find((r) => r.setKey === 'set2_5');
                      const r3 = recs.find((r) => r.setKey === 'set3');
                      const isSelected = m.id === activeGirl.id;

                      return (
                        <tr
                          key={m.id}
                          onClick={() => setSelectedGirlId(m.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-[#E6F5F1]/80'
                              : 'hover:bg-[#F4FAF8]'
                          }`}
                        >
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <MemberPortrait
                                member={m}
                                variant="avatar"
                                className="h-12 w-12 shrink-0 rounded-full ring-1 ring-[#5BAE84]/40 lg:h-14 lg:w-14"
                              />
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono-num text-xs font-extrabold text-[#4FA87D] lg:text-sm">
                                    #{m.number}
                                  </span>
                                  <span className="text-sm font-black text-[#212047] lg:text-base">
                                    {m.name}
                                  </span>
                                </div>
                                <div className="text-[11px] text-[#212047]/55 lg:text-xs">
                                  @{m.instagramHandle}
                                </div>
                              </div>
                            </div>
                          </td>

                          {[r1, r2, r3].map((r, idx) => (
                            <td key={idx} className="px-4 py-4">
                              {r && (
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span
                                      className={`rounded-md px-2 py-0.5 font-mono-num text-[11px] font-extrabold lg:text-xs ${
                                        idx === 0
                                          ? 'bg-[#212047] text-[#7ADAD0]'
                                          : 'bg-[#D5EFE9] text-[#212047]'
                                      }`}
                                    >
                                      {r.zone} 區
                                    </span>
                                    <span className="font-bold text-[#212047] lg:text-base">
                                      推薦 {r.sweetSpotRange[0]}–
                                      {r.sweetSpotRange[1]} 號
                                    </span>
                                  </div>
                                  <div className="mt-1 font-mono-num text-[11px] text-[#212047]/65 lg:text-xs">
                                    0–10 分：{r.initialSeatRange[0]}–
                                    {r.initialSeatRange[1]} 號 ｜ 破 10 分：
                                    <strong className="text-[#3F8E67]">
                                      {r.after10SeatRange[0]}–
                                      {r.after10SeatRange[1]} 號
                                    </strong>
                                  </div>
                                </div>
                              )}
                            </td>
                          ))}

                          <td className="py-4 pl-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedGirlId(m.id);
                                document
                                  .getElementById('girl-seat-guide-section')
                                  ?.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className={`rounded-full px-3.5 py-1.5 font-bold transition-colors lg:px-4 lg:py-2 ${
                                isSelected
                                  ? 'bg-[#5BAE84] text-white'
                                  : 'bg-[#212047]/[0.06] text-[#212047] hover:bg-[#212047] hover:text-white'
                              }`}
                            >
                              {isSelected ? '檢視中' : '查看尺規 ↑'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Special Note for MC (#25 心璇) & Cheer Leader (#41 馬妹) & Court Performances */}
          <div className="mt-6 grid grid-cols-1 gap-4 border-t border-[#212047]/10 pt-6 md:grid-cols-2">
            <div className="flex flex-col justify-between gap-3 rounded-2xl bg-[#F4FAF8] p-4 ring-1 ring-[#5BAE84]/30 sm:flex-row sm:items-center lg:p-5">
              <div>
                <div className="font-mono-num text-[10px] font-extrabold tracking-[0.16em] text-[#4FA87D] uppercase lg:text-xs">
                  MC &amp; CHEER LEADER · 團長與主持位置
                </div>
                <div className="mt-1 text-sm font-black text-[#212047] lg:text-base">
                  應援團長馬妹（#41）&amp; 主場 MC 心璇（#25）
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[#212047]/70 lg:text-sm">
                  負責全場口號帶動、局間互動與賽事主持，活躍於 1F 場邊應援舞台與 2F ACE 集氣區中央（B 區）核心視野區。
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                {mcAndLeaderMembers.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onOpenMemberDetail(m)}
                    className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 ring-1 ring-[#212047]/10 hover:ring-[#5BAE84] sm:flex-col"
                  >
                    <MemberPortrait
                      member={m}
                      variant="avatar"
                      className="h-10 w-10 rounded-full lg:h-12 lg:w-12"
                    />
                    <span className="text-xs font-bold text-[#212047] lg:text-sm">
                      {m.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-[#212047] p-4 text-white lg:p-5">
              <div className="font-mono-num text-[10px] font-extrabold tracking-[0.16em] text-[#7ADAD0] uppercase lg:text-xs">
                OPENING &amp; HALFTIME SHOW · 開場舞與中場演出拍攝推薦區
              </div>
              <div className="mt-1 text-sm font-black text-white lg:text-base">
                1F 猛虎精武區 / 1F 猛虎力行區 / 2F 拍攝限定區
              </div>
              <p className="mt-1 text-xs leading-relaxed text-white/75 lg:text-sm">
                依據官方公告：開場舞於「1F 猛虎精武區（右側）」前側場地演出，中場演出於「1F 猛虎力行區（左側）」前側場地進行；演出期間亦限時開放南側「2F 拍攝限定區」供二樓季票球迷拍攝。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* One-Click Oshi Strategy Image Modal */}
      <OshiStrategyCardModal
        isOpen={isStrategyModalOpen}
        initialGirlId={activeGirl.id}
        initialMatchId={selectedMatchId}
        onClose={() => setIsStrategyModalOpen(false)}
      />
    </section>
  );
};
