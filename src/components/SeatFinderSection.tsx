import React, { useMemo, useState } from 'react';
import { MEMBERS, type AceVivaMember } from '../data/members';
import {
  STATION_ROTATION_SCHEDULES,
  getFullMatchGirlDistanceSummary,
  getSeatPositionMapping,
  type AceZoneId,
  type PhaseDistanceDetail,
} from '../data/schedule';
import { MemberPortrait } from './MemberPortrait';

interface SeatFinderSectionProps {
  favoriteIds: string[];
  externalSelection?: {
    matchId: string;
    zone: AceZoneId;
    seat: number;
    girlId?: string;
    timestamp: number;
  } | null;
  onOpenMemberDetail: (member: AceVivaMember) => void;
}

const ZONES: {
  id: AceZoneId;
  shortTitle: string;
  title: string;
  subtitle: string;
  badge: string;
}[] = [
  {
    id: 'A',
    shortTitle: 'A 區（左）',
    title: '2F ACE 集氣 A 區',
    subtitle: '左側看台 · 1–23 號（23 號接 B1）',
    badge: 'ZONE A',
  },
  {
    id: 'B',
    shortTitle: 'B 區（中）',
    title: '2F ACE 集氣 B 區',
    subtitle: '中央看台 · 1–23 號（B1 接 A23 · B23 接 C1）',
    badge: 'ZONE B',
  },
  {
    id: 'C',
    shortTitle: 'C 區（右）',
    title: '2F ACE 集氣 C 區',
    subtitle: '右側看台 · 1–23 號（C1 接 B23）',
    badge: 'ZONE C',
  },
];

const STATION_SEGMENTS: {
  slotIndex: 0 | 1 | 2;
  shortTitle: string;
  title: string;
  rangeLabel: string;
  coreSeat: number;
  widthPercent: string;
}[] = [
  {
    slotIndex: 0,
    shortTitle: '左位 1–8號',
    title: '左位視角（1–8 號）',
    rangeLabel: '1–8 號',
    coreSeat: 5,
    widthPercent: '34.78%',
  },
  {
    slotIndex: 1,
    shortTitle: '中位 9–15號',
    title: '中位視角（9–15 號）',
    rangeLabel: '9–15 號',
    coreSeat: 12,
    widthPercent: '30.44%',
  },
  {
    slotIndex: 2,
    shortTitle: '右位 16–23號',
    title: '右位視角（16–23 號）',
    rangeLabel: '16–23 號',
    coreSeat: 19,
    widthPercent: '34.78%',
  },
];

const QUICK_TICK_SEATS = [
  { seat: 1, label: '1號', isCore: false },
  { seat: 5, label: '5號(左C)', isCore: true },
  { seat: 8, label: '8號', isCore: false },
  { seat: 9, label: '9號', isCore: false },
  { seat: 12, label: '12號(中C)', isCore: true },
  { seat: 15, label: '15號', isCore: false },
  { seat: 16, label: '16號', isCore: false },
  { seat: 19, label: '19號(右C)', isCore: true },
  { seat: 23, label: '23號', isCore: false },
];

export const SeatFinderSection: React.FC<SeatFinderSectionProps> = ({
  favoriteIds,
  externalSelection,
  onOpenMemberDetail,
}) => {
  const [selectedMatchId, setSelectedMatchId] = useState<string>('2026-11-07');
  const [selectedZone, setSelectedZone] = useState<AceZoneId>('B');
  const [selectedSeat, setSelectedSeat] = useState<number>(12);
  const [activeSetKey, setActiveSetKey] = useState<'set1_4' | 'set2_5' | 'set3'>(
    'set1_4'
  );
  const [scorePhase, setScorePhase] = useState<'initial' | 'after10'>('initial');
  const [targetOshiId, setTargetOshiId] = useState<string>(() =>
    favoriteIds.length > 0 ? favoriteIds[0] : 'yuri'
  );

  React.useEffect(() => {
    if (!externalSelection) return;
    setSelectedMatchId(externalSelection.matchId);
    setSelectedZone(externalSelection.zone);
    setSelectedSeat(externalSelection.seat);
    if (externalSelection.girlId) {
      setTargetOshiId(externalSelection.girlId);
    }
  }, [externalSelection]);

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

  // All 9 rotating cheerleaders for the selected match day
  const rotatingMemberIds = useMemo(() => {
    const s1 = currentMatchSchedule.sets[0].initial;
    return [...s1.A, ...s1.B, ...s1.C];
  }, [currentMatchSchedule]);

  // Sort rotating members so user's favorites come first
  const sortedRotatingMembers = useMemo(() => {
    const list = rotatingMemberIds
      .map((id) => memberMap.get(id))
      .filter((m): m is AceVivaMember => Boolean(m));
    return [...list].sort((a, b) => {
      const aFav = favoriteIds.includes(a.id) ? 0 : 1;
      const bFav = favoriteIds.includes(b.id) ? 0 : 1;
      return aFav - bFav;
    });
  }, [rotatingMemberIds, memberMap, favoriteIds]);

  // Active Target Oshi (fallback to first favorite or first rotating member if not on duty today)
  const activeOshiId = useMemo(() => {
    if (rotatingMemberIds.includes(targetOshiId)) return targetOshiId;
    const favOnDuty = favoriteIds.find((id) => rotatingMemberIds.includes(id));
    return favOnDuty ?? rotatingMemberIds[0];
  }, [targetOshiId, rotatingMemberIds, favoriteIds]);

  const activeOshi = memberMap.get(activeOshiId) ?? sortedRotatingMembers[0];

  const currentSetArrangement = useMemo(
    () =>
      currentMatchSchedule.sets.find((s) => s.setKey === activeSetKey) ??
      currentMatchSchedule.sets[0],
    [currentMatchSchedule, activeSetKey]
  );

  const seatMapping = useMemo(
    () => getSeatPositionMapping(selectedSeat),
    [selectedSeat]
  );

  // Current 3 girls in the selected zone for the active set + score phase
  const currentZoneGirlIds =
    scorePhase === 'initial'
      ? currentSetArrangement.initial[selectedZone]
      : currentSetArrangement.after10Points[selectedZone];

  const directFrontMember = memberMap.get(
    currentZoneGirlIds[seatMapping.slotIndex]
  );

  // Compute full match distance summary between (selectedZone, selectedSeat) and activeOshi
  const oshiDistanceSummary = useMemo(
    () =>
      getFullMatchGirlDistanceSummary(
        currentMatchSchedule,
        selectedZone,
        selectedSeat,
        activeOshi.id
      ),
    [currentMatchSchedule, selectedZone, selectedSeat, activeOshi.id]
  );

  const currentSetOshiDistance = useMemo(
    () =>
      oshiDistanceSummary.find((d) => d.setKey === activeSetKey) ??
      oshiDistanceSummary[0],
    [oshiDistanceSummary, activeSetKey]
  );

  const activePhaseOshiDistance: PhaseDistanceDetail | undefined =
    currentSetOshiDistance
      ? scorePhase === 'initial'
        ? currentSetOshiDistance.initial
        : currentSetOshiDistance.after10
      : undefined;

  const otherPhaseOshiDistance: PhaseDistanceDetail | undefined =
    currentSetOshiDistance
      ? scorePhase === 'initial'
        ? currentSetOshiDistance.after10
        : currentSetOshiDistance.initial
      : undefined;

  // Compute all unique girls that will visit this exact zone across the entire match (all 5 sets)
  const allMatchZoneVisitors = useMemo(() => {
    const visitedIds = new Set<string>();
    const directSeatIds = new Set<string>();

    for (const s of currentMatchSchedule.sets) {
      const initTrio = s.initial[selectedZone];
      const after10Trio = s.after10Points[selectedZone];
      initTrio.forEach((id) => visitedIds.add(id));
      after10Trio.forEach((id) => visitedIds.add(id));
      directSeatIds.add(initTrio[seatMapping.slotIndex]);
      directSeatIds.add(after10Trio[seatMapping.slotIndex]);
    }

    return {
      allZoneMembers: Array.from(visitedIds)
        .map((id) => memberMap.get(id))
        .filter((m): m is AceVivaMember => Boolean(m)),
      directSeatMembers: Array.from(directSeatIds)
        .map((id) => memberMap.get(id))
        .filter((m): m is AceVivaMember => Boolean(m)),
    };
  }, [currentMatchSchedule, selectedZone, seatMapping.slotIndex, memberMap]);

  // Progress percentage for the 1..23 range slider background fill
  const sliderFillPercent = ((selectedSeat - 1) / 22) * 100;

  return (
    <section
      id="seat-finder-section"
      className="relative mx-auto max-w-[1440px] px-3 py-14 sm:px-6 sm:py-24 lg:px-10"
    >
      {/* Section Heading */}
      <div className="flex flex-col justify-between gap-5 border-b border-[#212047]/10 pb-7 lg:flex-row lg:items-end lg:pb-10">
        <div className="min-w-0">
          <div className="inline-flex flex-wrap items-center gap-2 rounded-full bg-[#5BAE84]/15 px-3 py-1 font-mono-num text-[10px] font-bold tracking-[0.14em] text-[#212047] uppercase ring-1 ring-[#5BAE84]/35 sm:text-xs lg:text-sm">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#5BAE84]" />
            <span>2F ACE 集氣區 · 23 席直線拉桿與俯瞰座位雷達</span>
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-[#212047] sm:text-4xl lg:text-5xl">
            選擇區域與拉動座位編號，查看面前女孩與主推雷達
          </h2>
          <p className="mt-2.5 max-w-4xl text-xs leading-relaxed text-[#212047]/75 sm:text-base lg:text-lg">
            依據官方站位公告（
            <a
              href={currentMatchSchedule.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#4FA87D] underline underline-offset-4 hover:text-[#212047]"
            >
              #OldMyCar 我的 90 年代站位表 ↗
            </a>
            ），先點選區域（A / B / C），再拖曳直線拉桿選擇 1–23 號座位。雷達圖方向與官方 IG 座位圖完全一致（
            <strong className="font-bold text-[#212047]">
              觀眾席在上方往下看球賽 ▼、啦啦隊站在前緣往上方向應援 ▲
            </strong>
            ），若主推距離超過 12 席亦會標出位置並提示拍攝難度。
          </p>
          <p className="mt-2 max-w-4xl text-[11px] font-semibold text-[#3F8E67] lg:text-sm">
            ※ 粉絲自製免責說明：23 席視角對應與座位雷達為粉絲依官方站位表推算之參考工具，現場實際站位、動線與名單異動請以官方實際公告為準。
          </p>
        </div>

        {/* Date Switcher */}
        <div className="grid w-full grid-cols-2 gap-1.5 rounded-2xl bg-[#D5EFE9] p-1.5 ring-1 ring-[#5BAE84]/35 sm:w-auto sm:flex sm:rounded-full lg:self-end">
          {STATION_ROTATION_SCHEDULES.map((sched) => {
            const isActive = sched.matchId === selectedMatchId;
            return (
              <button
                key={sched.matchId}
                type="button"
                onClick={() => setSelectedMatchId(sched.matchId)}
                className={`rounded-xl px-2.5 py-2.5 text-center text-xs font-extrabold transition-all duration-300 sm:rounded-full sm:px-5 lg:px-6 lg:py-3 lg:text-base ${
                  isActive
                    ? 'bg-[#212047] text-white shadow-sm'
                    : 'text-[#212047]/75 hover:bg-white/60 hover:text-[#212047]'
                }`}
              >
                {sched.dateLabel.split(' ')[0]} vs {sched.opponent}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Console Container */}
      <div className="mt-6 rounded-[1.5rem] bg-[#D5EFE9] p-1.5 ring-1 ring-[#5BAE84]/35 sm:mt-10 sm:rounded-[2rem] sm:p-2">
        <div className="rounded-[calc(1.5rem-0.375rem)] bg-white p-3.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] sm:rounded-[calc(2rem-0.375rem)] sm:p-7 lg:p-10">
          {/* Oshi Radar Target Selector */}
          <div className="mb-5 rounded-2xl bg-[#F4FAF8] p-3 ring-1 ring-[#5BAE84]/30 sm:mb-7 sm:p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#212047] px-2.5 py-0.5 font-mono-num text-[10px] font-bold text-[#7ADAD0] lg:px-3 lg:py-1 lg:text-xs">
                  RADAR TARGET · 雷達追蹤主推
                </span>
                <span className="text-xs font-extrabold text-[#212047] lg:text-base">
                  點選要在座位雷達圖上定位的主推女孩：
                </span>
              </div>
              <span className="font-mono-num text-[10px] font-semibold text-[#3F8E67] lg:text-sm">
                看台連續相接：A23 接 B1 · B23 接 C1
              </span>
            </div>

            <div className="no-scrollbar -mx-1 mt-2.5 flex gap-1.5 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 lg:mt-3 lg:gap-2.5">
              {sortedRotatingMembers.map((m) => {
                const isTarget = m.id === activeOshi.id;
                const isFav = favoriteIds.includes(m.id);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setTargetOshiId(m.id)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-full py-1 pr-3 pl-1 text-xs font-bold transition-all active:scale-95 lg:py-1.5 lg:pr-4 lg:pl-1.5 lg:text-sm ${
                      isTarget
                        ? 'bg-[#212047] text-white shadow-xs ring-2 ring-[#5BAE84]'
                        : isFav
                          ? 'bg-[#E6F5F1] text-[#212047] ring-1 ring-[#5BAE84]/50 hover:bg-[#D5EFE9]'
                          : 'bg-white text-[#212047]/75 ring-1 ring-[#212047]/10 hover:bg-[#E6F5F1]'
                    }`}
                  >
                    <MemberPortrait
                      member={m}
                      variant="avatar"
                      className="h-6 w-6 shrink-0 rounded-full lg:h-8 lg:w-8"
                    />
                    {isFav && (
                      <span className="text-[10px] text-[#4FA87D] lg:text-xs">
                        ★
                      </span>
                    )}
                    <span>{m.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 01: Select Zone (A / B / C) */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <span className="font-mono-num text-[11px] font-extrabold tracking-[0.12em] text-[#212047] uppercase sm:text-xs lg:text-base">
                STEP 01 · 先選擇「2F ACE 集氣區」區域（A / B / C 區）
              </span>
              <span className="text-[11px] font-medium text-[#212047]/65 lg:text-sm">
                ★ 代表主推 {activeOshi.name} 本局所在區域
              </span>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3.5 lg:mt-4 lg:gap-5">
              {ZONES.map((z) => {
                const isSelected = selectedZone === z.id;
                const trioIds =
                  scorePhase === 'initial'
                    ? currentSetArrangement.initial[z.id]
                    : currentSetArrangement.after10Points[z.id];
                const trioMembers = trioIds
                  .map((id) => memberMap.get(id))
                  .filter((m): m is AceVivaMember => Boolean(m));
                const isOshiInThisZone = trioIds.includes(activeOshi.id);

                return (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => setSelectedZone(z.id)}
                    className={`group relative flex min-w-0 flex-col justify-between rounded-2xl p-2.5 text-left transition-all duration-300 active:scale-[0.98] sm:p-4 lg:p-5 ${
                      isSelected
                        ? 'bg-[#212047] text-white shadow-[0_14px_30px_-10px_rgba(33,32,71,0.4)] ring-2 ring-[#5BAE84]'
                        : 'bg-[#F4FAF8] text-[#212047] ring-1 ring-[#212047]/10 hover:bg-[#E6F5F1]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span
                        className={`rounded-full px-2 py-0.5 font-mono-num text-[9px] font-bold tracking-wider sm:text-[10px] lg:px-2.5 lg:text-xs ${
                          isSelected
                            ? 'bg-[#5BAE84] text-white'
                            : 'bg-[#212047]/10 text-[#212047]/70'
                        }`}
                      >
                        {z.badge}
                      </span>
                      {isOshiInThisZone && (
                        <span className="truncate rounded-full bg-[#5BAE84] px-1.5 py-0.5 font-mono-num text-[9px] font-extrabold text-white sm:px-2 lg:text-xs">
                          ★ {activeOshi.name}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 sm:mt-3">
                      <div className="text-xs font-black sm:hidden">
                        {z.shortTitle}
                      </div>
                      <div className="hidden text-lg font-black sm:block lg:text-2xl">
                        {z.title}
                      </div>
                      <div
                        className={`mt-0.5 hidden text-xs sm:block lg:text-sm ${
                          isSelected ? 'text-white/75' : 'text-[#212047]/65'
                        }`}
                      >
                        {z.subtitle}
                      </div>
                    </div>

                    <div
                      className={`mt-2 flex flex-col gap-1 border-t pt-2 sm:mt-3 sm:flex-row sm:items-center sm:justify-between sm:pt-2.5 ${
                        isSelected ? 'border-white/15' : 'border-[#212047]/10'
                      }`}
                    >
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {trioMembers.map((m) => (
                          <MemberPortrait
                            key={m.id}
                            member={m}
                            variant="avatar"
                            className="h-5 w-5 rounded-full ring-1 ring-white sm:h-7 sm:w-7 lg:h-9 lg:w-9"
                          />
                        ))}
                      </div>
                      <div
                        className={`truncate text-[10px] font-bold sm:text-xs lg:text-sm ${
                          isSelected ? 'text-[#7ADAD0]' : 'text-[#3F8E67]'
                        }`}
                      >
                        {trioMembers.map((m) => m.name).join('·')}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 02: Linear Slider Bar (一直線拉 Bar 快速選擇 1–23 號座位) */}
          <div className="mt-6 border-t border-[#212047]/10 pt-6 sm:mt-8 sm:pt-8">
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-mono-num text-[11px] font-extrabold tracking-[0.12em] text-[#212047] uppercase sm:text-xs lg:text-base">
                STEP 02 · 左右拖曳直線拉 Bar 快速選擇「{selectedZone} 區 1–23 號」座位
              </span>
              <span className="text-[11px] font-semibold text-[#3F8E67] lg:text-sm">
                {selectedZone === 'A' && '右端 A23 緊鄰 B1 →'}
                {selectedZone === 'B' && '← 左端 B1 緊鄰 A23 · 右端 B23 緊鄰 C1 →'}
                {selectedZone === 'C' && '← 左端 C1 緊鄰 B23'}
              </span>
            </div>

            {/* Linear Slider Box */}
            <div className="mt-3.5 rounded-2xl bg-[#F4FAF8] p-3.5 ring-1 ring-[#5BAE84]/35 sm:p-5 lg:p-6">
              {/* Top Row: -1 Button / Current Seat Big Pill / +1 Button */}
              <div className="flex items-center justify-between gap-2 sm:gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedSeat((prev) => Math.max(1, prev - 1))}
                  disabled={selectedSeat <= 1}
                  aria-label="往左一號座位"
                  className="flex shrink-0 items-center gap-1 rounded-xl bg-white px-3 py-2 font-mono-num text-xs font-extrabold text-[#212047] shadow-2xs ring-1 ring-[#212047]/15 transition-all hover:bg-[#E6F5F1] active:scale-95 disabled:opacity-40 sm:px-4 sm:py-2.5 lg:px-5 lg:py-3 lg:text-base"
                >
                  <span>←</span>
                  <span>前一號</span>
                </button>

                <div className="flex min-w-0 flex-1 flex-col items-center justify-center rounded-2xl bg-[#212047] px-3 py-2 text-center text-white shadow-sm sm:flex-row sm:gap-3 sm:py-2.5 lg:py-3">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono-num text-xs font-bold text-[#7ADAD0] sm:text-sm lg:text-base">
                      {selectedZone} 區
                    </span>
                    <span className="font-editorial text-2xl font-bold text-[#5ECBC0] italic sm:text-3xl lg:text-4xl">
                      第 {selectedSeat} 號席
                    </span>
                  </div>
                  <span className="mt-0.5 rounded-full bg-[#5BAE84] px-2.5 py-0.5 text-[10px] font-extrabold text-white sm:mt-0 sm:text-xs lg:px-3 lg:py-1 lg:text-sm">
                    正對：{seatMapping.slotName}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedSeat((prev) => Math.min(23, prev + 1))}
                  disabled={selectedSeat >= 23}
                  aria-label="往右一號座位"
                  className="flex shrink-0 items-center gap-1 rounded-xl bg-white px-3 py-2 font-mono-num text-xs font-extrabold text-[#212047] shadow-2xs ring-1 ring-[#212047]/15 transition-all hover:bg-[#E6F5F1] active:scale-95 disabled:opacity-40 sm:px-4 sm:py-2.5 lg:px-5 lg:py-3 lg:text-base"
                >
                  <span>後一號</span>
                  <span>→</span>
                </button>
              </div>

              {/* 3 Proportional Station Segments Above the Slider Bar */}
              <div className="mt-4 flex w-full gap-1 sm:gap-1.5">
                {STATION_SEGMENTS.map((seg) => {
                  const isActiveSeg = seatMapping.slotIndex === seg.slotIndex;
                  const segGirlId = currentZoneGirlIds[seg.slotIndex];
                  const segGirl = memberMap.get(segGirlId);
                  const isOshiHere = segGirl?.id === activeOshi.id;

                  return (
                    <button
                      key={seg.slotIndex}
                      type="button"
                      onClick={() => setSelectedSeat(seg.coreSeat)}
                      style={{ width: seg.widthPercent }}
                      className={`flex min-w-0 flex-col items-center justify-between rounded-xl p-1.5 text-center transition-all sm:flex-row sm:px-3 sm:py-2 lg:px-4 lg:py-2.5 ${
                        isActiveSeg
                          ? 'bg-[#212047] text-white shadow-xs ring-2 ring-[#5BAE84]'
                          : isOshiHere
                            ? 'bg-[#E6F5F1] text-[#212047] ring-2 ring-[#212047]'
                            : 'bg-white text-[#212047]/80 ring-1 ring-[#212047]/10 hover:bg-[#E6F5F1]'
                      }`}
                    >
                      <div className="min-w-0 text-center sm:text-left">
                        <div className="truncate font-mono-num text-[10px] font-extrabold sm:text-xs lg:text-sm">
                          {seg.shortTitle}
                        </div>
                        <div
                          className={`hidden text-[10px] sm:block lg:text-xs ${
                            isActiveSeg ? 'text-[#7ADAD0]' : 'text-[#3F8E67]'
                          }`}
                        >
                          點擊跳至 C 位 ({seg.coreSeat} 號)
                        </div>
                      </div>

                      {segGirl && (
                        <div className="mt-1 flex items-center gap-1 sm:mt-0">
                          <MemberPortrait
                            member={segGirl}
                            variant="avatar"
                            className="h-5 w-5 shrink-0 rounded-full ring-1 ring-white sm:h-6 sm:w-6 lg:h-7 lg:w-7"
                          />
                          <span className="truncate text-[11px] font-black lg:text-sm">
                            {isOshiHere ? `★${segGirl.name}` : segGirl.name}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Continuous Linear Range Slider Input (1..23) */}
              <div className="relative mt-4 px-1">
                <div
                  className="pointer-events-none absolute top-1/2 right-1 left-1 h-3.5 -translate-y-1/2 rounded-full ring-1 ring-[#212047]/15"
                  style={{
                    background: `linear-gradient(to right, #5BAE84 0%, #5ECBC0 ${sliderFillPercent}%, #E2F2EE ${sliderFillPercent}%, #E2F2EE 100%)`,
                  }}
                />
                {/* Vertical dividers at 8.5 (34.8%) and 15.5 (65.2%) */}
                <div
                  style={{ left: '34.78%' }}
                  className="pointer-events-none absolute top-1/2 h-5 w-0.5 -translate-y-1/2 bg-[#212047]/35"
                />
                <div
                  style={{ left: '65.22%' }}
                  className="pointer-events-none absolute top-1/2 h-5 w-0.5 -translate-y-1/2 bg-[#212047]/35"
                />

                <input
                  type="range"
                  min={1}
                  max={23}
                  step={1}
                  value={selectedSeat}
                  onChange={(e) => setSelectedSeat(Number(e.target.value))}
                  aria-label={`拉動選擇 ${selectedZone} 區 1 至 23 號座位`}
                  className="seat-range-slider relative z-10"
                />
              </div>

              {/* Quick Tick Marks Under the Slider Bar */}
              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1">
                {QUICK_TICK_SEATS.map((tick) => {
                  const isCurrent = selectedSeat === tick.seat;
                  return (
                    <button
                      key={tick.seat}
                      type="button"
                      onClick={() => setSelectedSeat(tick.seat)}
                      className={`rounded-lg px-1.5 py-1 font-mono-num text-[10px] font-bold transition-all sm:px-2 lg:px-2.5 lg:py-1 lg:text-xs ${
                        isCurrent
                          ? 'bg-[#212047] font-extrabold text-[#5ECBC0] shadow-2xs ring-1 ring-[#5BAE84]'
                          : tick.isCore
                            ? 'bg-[#E6F5F1] text-[#3F8E67] ring-1 ring-[#5BAE84]/35 hover:bg-[#5BAE84] hover:text-white'
                            : 'text-[#212047]/65 hover:bg-white hover:text-[#212047]'
                      }`}
                    >
                      {tick.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Live Stage & Seat Radar Section */}
          <div className="mt-6 grid grid-cols-1 gap-5 border-t border-[#212047]/10 pt-6 lg:mt-8 lg:grid-cols-12 lg:gap-7 lg:pt-8">
            {/* Left 6 cols: Your Seat View + IG-Oriented Top-Down Seat Radar (Always Visible) */}
            <div className="flex min-w-0 flex-col justify-between rounded-3xl bg-[#212047] p-4 text-white sm:p-6 lg:col-span-6 lg:p-7">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-[#5BAE84] px-3 py-0.5 font-mono-num text-[10px] font-extrabold tracking-wider text-white uppercase lg:text-xs">
                    YOUR SEAT &amp; RADAR · 專屬座位視角與雷達
                  </span>
                  <span className="font-mono-num text-xs font-bold text-[#7ADAD0] lg:text-sm">
                    {currentMatchSchedule.dateLabel}
                  </span>
                </div>

                {/* Top-Down Seat Radar Aligned with Official IG Station Map */}
                {activePhaseOshiDistance && otherPhaseOshiDistance && (() => {
                  const isNear = activePhaseOshiDistance.isWithin12Seats;
                  const offset = activePhaseOshiDistance.signedSeatOffset;
                  const seatsDiff = activePhaseOshiDistance.seatsToCoreCenter;

                  // Global seat coordinate (1..69 across A1..A23, B1..B23, C1..C23)
                  const userGlobal =
                    (selectedZone === 'A' ? 0 : selectedZone === 'B' ? 1 : 2) *
                      23 +
                    selectedSeat;
                  const oshiGlobal =
                    (activePhaseOshiDistance.girlZone === 'A'
                      ? 0
                      : activePhaseOshiDistance.girlZone === 'B'
                        ? 1
                        : 2) *
                      23 +
                    activePhaseOshiDistance.girlCoreSeat;

                  // Map global seat 1..69 -> 8%..92% across the A | B | C map
                  const toGlobalX = (gSeat: number) =>
                    Math.max(8, Math.min(92, 6 + ((gSeat - 1) / 68) * 88));

                  const userX = toGlobalX(userGlobal);
                  const oshiX = toGlobalX(oshiGlobal);
                  const fovLeftX = toGlobalX(Math.max(1, userGlobal - 12));
                  const fovRightX = toGlobalX(Math.min(69, userGlobal + 12));

                  const dirDescription =
                    offset === 0
                      ? '正下方直視'
                      : offset < 0
                        ? `左下方約 ${Math.abs(offset)} 席`
                        : `右下方約 ${offset} 席`;

                  return (
                    <div className="mt-4 rounded-2xl border border-[#5ECBC0]/40 bg-[#181736] p-3 shadow-inner sm:p-4">
                      {/* Radar Header */}
                      <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px] font-bold text-[#7ADAD0] lg:text-sm">
                        <span>
                          ▼ 座位雷達圖（同 IG 官方圖：觀眾在上往下看 · 啦啦隊在下往上應援 ▲）
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 font-mono-num text-[10px] font-extrabold lg:text-xs ${
                            isNear
                              ? 'bg-[#5BAE84] text-white'
                              : 'bg-amber-500/25 text-amber-300 ring-1 ring-amber-400/50'
                          }`}
                        >
                          {isNear
                            ? `★ 12 席內最佳範圍（差 ${seatsDiff} 席）`
                            : `距離較遠（差 ${seatsDiff} 席 · 超過 12 席）`}
                        </span>
                      </div>

                      {/* Zone Bar Header (A 區 | B 區 | C 區) */}
                      <div className="mt-2.5 grid grid-cols-3 gap-1 text-center font-mono-num text-[10px] font-bold lg:text-xs">
                        {(['A', 'B', 'C'] as AceZoneId[]).map((zId) => (
                          <div
                            key={zId}
                            className={`rounded-md py-1 ${
                              selectedZone === zId
                                ? 'bg-[#5BAE84]/30 text-[#7ADAD0] ring-1 ring-[#5ECBC0]/50'
                                : 'bg-white/[0.05] text-white/60'
                            }`}
                          >
                            2F 集氣 {zId} 區 (1–23)
                          </div>
                        ))}
                      </div>

                      {/* Top-Down Radar Canvas (Audience at Top looking DOWN ▼ -> Cheerleaders at Bottom facing UP ▲) */}
                      <div className="relative mt-1.5 h-44 w-full overflow-hidden rounded-xl bg-[#212047]/95 ring-1 ring-white/15 sm:h-48">
                        <svg
                          viewBox="0 0 100 100"
                          preserveAspectRatio="none"
                          className="pointer-events-none absolute inset-0 h-full w-full"
                        >
                          <defs>
                            <linearGradient
                              id="topDownFov"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#5ECBC0"
                                stopOpacity="0.28"
                              />
                              <stop
                                offset="100%"
                                stopColor="#5ECBC0"
                                stopOpacity="0.05"
                              />
                            </linearGradient>
                          </defs>

                          {/* Zone Dividers: A|B at 33.3%, B|C at 66.7% */}
                          <line
                            x1="33.33"
                            y1="0"
                            x2="33.33"
                            y2="78"
                            stroke="rgba(255,255,255,0.14)"
                            strokeWidth="0.6"
                            strokeDasharray="2 2"
                          />
                          <line
                            x1="66.67"
                            y1="0"
                            x2="66.67"
                            y2="78"
                            stroke="rgba(255,255,255,0.14)"
                            strokeWidth="0.6"
                            strokeDasharray="2 2"
                          />

                          {/* Top Audience Row Line (y=22) */}
                          <line
                            x1="4"
                            y1="22"
                            x2="96"
                            y2="22"
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="0.8"
                          />

                          {/* Cheerleader Stage Rail Line (y=68) */}
                          <line
                            x1="4"
                            y1="68"
                            x2="96"
                            y2="68"
                            stroke="rgba(94,203,192,0.35)"
                            strokeWidth="1"
                          />

                          {/* ±12 Seat Camera Viewing Cone from User Seat (userX, 22) DOWNWARD to Stage (fovLeftX..fovRightX, 68) */}
                          <polygon
                            points={`${userX},22 ${fovLeftX},68 ${fovRightX},68`}
                            fill="url(#topDownFov)"
                          />

                          {/* Sightline from User Seat (Top) to Oshi (Bottom Stage) */}
                          <line
                            x1={userX}
                            y1="22"
                            x2={oshiX}
                            y2="64"
                            stroke={isNear ? '#5ECBC0' : '#FBBF24'}
                            strokeWidth={isNear ? '1.8' : '1.3'}
                            strokeDasharray={isNear ? undefined : '3 2.5'}
                          />
                        </svg>

                        {/* TOP LAYER: Your Seat in 2F Audience Stand (Looking DOWN ▼) */}
                        <div
                          style={{
                            left: `${Math.max(16, Math.min(84, userX))}%`,
                          }}
                          className="absolute top-1.5 z-10 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
                        >
                          <div className="rounded-full bg-white px-2.5 py-0.5 font-mono-num text-[10px] font-black text-[#212047] whitespace-nowrap shadow-md ring-2 ring-[#5ECBC0] lg:text-xs">
                            你的座位：{selectedZone} 區 {selectedSeat} 號
                          </div>
                          <span className="mt-0.5 text-[10px] font-bold leading-none text-[#5ECBC0]">
                            ▼ 往下看球賽
                          </span>
                        </div>

                        {/* MIDDLE LAYER: Cheerleader Stage (Facing UPWARD ▲ toward 2F Audience) */}
                        <button
                          type="button"
                          onClick={() => onOpenMemberDetail(activeOshi)}
                          style={{
                            left: `${Math.max(18, Math.min(82, oshiX))}%`,
                          }}
                          className="absolute top-[42%] z-10 -translate-x-1/2 flex flex-col items-center transition-all duration-300"
                        >
                          <span
                            className={`mb-0.5 font-mono-num text-[9px] font-extrabold leading-none whitespace-nowrap lg:text-[11px] ${
                              isNear ? 'text-[#5ECBC0]' : 'text-amber-300'
                            }`}
                          >
                            ▲ 往上應援（{dirDescription}）
                          </span>
                          <div className="relative">
                            <MemberPortrait
                              member={activeOshi}
                              variant="avatar"
                              className={`h-9 w-9 rounded-full ring-2 sm:h-10 sm:w-10 ${
                                isNear
                                  ? 'ring-[#5ECBC0] shadow-[0_0_14px_rgba(94,203,192,0.6)]'
                                  : 'ring-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.45)]'
                              }`}
                            />
                            <span className="absolute -top-1 -right-2 rounded-full bg-[#212047] px-1 font-mono-num text-[8px] font-black text-[#7ADAD0] ring-1 ring-[#5ECBC0]">
                              {activePhaseOshiDistance.girlZone}
                              {activePhaseOshiDistance.girlSlotLabel.slice(0, 1)}
                            </span>
                          </div>
                          <span
                            className={`mt-0.5 rounded-full px-2 py-0.2 font-mono-num text-[9px] font-extrabold whitespace-nowrap lg:text-[11px] ${
                              isNear
                                ? 'bg-[#5BAE84] text-white'
                                : 'bg-amber-500/90 text-[#212047]'
                            }`}
                          >
                            ★ {activeOshi.name}
                          </span>
                        </button>

                        {/* BOTTOM LAYER: Players Bench & 1F Court (Matching Official IG Map Bottom) */}
                        <div className="absolute inset-x-2 bottom-1.5 flex items-center justify-center rounded-lg bg-[#5BAE84]/25 py-1 text-center font-mono-num text-[10px] font-bold text-[#7ADAD0] ring-1 ring-[#5BAE84]/40 lg:text-xs">
                          ⬇ 下方為 1F 球員席 ＆ 中央比賽球場（觀眾視線往下） ⬇
                        </div>
                      </div>

                      {/* Proximity / Too Far Camera Warning Notice Below Radar */}
                      {isNear ? (
                        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#5BAE84]/20 px-3 py-2 text-xs text-white ring-1 ring-[#5ECBC0]/40 lg:text-sm">
                          <span>
                            <strong className="font-extrabold text-[#5ECBC0]">
                              ★ 接近通知（12 席內）：
                            </strong>
                            主推 {activeOshi.name} 位於你面對球場時的
                            <strong className="font-extrabold text-white">
                              「{dirDescription}」
                            </strong>
                            （{activePhaseOshiDistance.girlZone} 區
                            {activePhaseOshiDistance.girlSlotLabel.slice(0, 2)}
                            ），在最佳拍攝與應援互動範圍內！
                          </span>
                        </div>
                      ) : (
                        <div className="mt-2.5 flex flex-col gap-2 rounded-xl bg-amber-500/15 px-3 py-2.5 text-xs text-amber-100 ring-1 ring-amber-400/45 sm:flex-row sm:items-center sm:justify-between lg:text-sm">
                          <div className="min-w-0">
                            <strong className="font-extrabold text-amber-300">
                              距離過遠提示（相距 {seatsDiff} 席 · 超過 12 席）：
                            </strong>
                            <span>
                              主推 {activeOshi.name} 本階段位於{' '}
                              {activePhaseOshiDistance.girlZone} 區
                              {activePhaseOshiDistance.girlSlotLabel.slice(0, 2)}
                              （你的{dirDescription}
                              ），視角偏斜較大且易受沿途觀眾遮擋，
                              <strong className="font-extrabold text-white underline decoration-amber-400 underline-offset-2">
                                可能拍不到清楚正面畫面
                              </strong>
                              。
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedZone(activePhaseOshiDistance.girlZone);
                              setSelectedSeat(
                                activePhaseOshiDistance.girlCoreSeat
                              );
                            }}
                            className="shrink-0 self-start rounded-full bg-amber-400 px-3 py-1 font-mono-num text-[11px] font-black text-[#212047] transition-transform hover:bg-amber-300 active:scale-95 sm:self-center lg:text-xs"
                          >
                            移至她面前 ({activePhaseOshiDistance.girlZone}
                            {activePhaseOshiDistance.girlCoreSeat}號) →
                          </button>
                        </div>
                      )}

                      {/* Same-Set After-10-Points Rotation Notice */}
                      {otherPhaseOshiDistance.isWithin12Seats !== isNear && (
                        <div className="mt-2 rounded-lg bg-white/[0.07] px-3 py-1.5 text-[11px] text-white/85 lg:text-xs">
                          <span className="font-bold text-[#7ADAD0]">
                            同局換位提示：
                          </span>
                          {scorePhase === 'initial'
                            ? '連莊得分破 10 分換位後，'
                            : '開局 0–10 分階段，'}
                          {activeOshi.name} 距離你為{' '}
                          <strong className="font-mono-num text-[#5ECBC0]">
                            {otherPhaseOshiDistance.seatsToCoreCenter} 席
                          </strong>
                          （
                          {otherPhaseOshiDistance.isWithin12Seats
                            ? '將進入 12 席內好拍範圍！'
                            : '將移出 12 席外'}
                          ）
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Highlighted Direct Front Member Card (Face-Focused Avatar) */}
                {directFrontMember && (
                  <div className="mt-4 rounded-2xl border border-[#5ECBC0]/30 bg-white/10 p-3.5 sm:p-4">
                    <div className="font-mono-num text-[10px] font-bold tracking-[0.14em] text-[#7ADAD0] uppercase lg:text-xs">
                      DIRECTLY IN FRONT · 當前座位正前方女孩（往上應援 ▲）
                    </div>
                    <div className="mt-2.5 flex items-center gap-3.5">
                      <button
                        type="button"
                        onClick={() => onOpenMemberDetail(directFrontMember)}
                        className="shrink-0 overflow-hidden rounded-2xl ring-2 ring-[#5ECBC0]"
                      >
                        <MemberPortrait
                          member={directFrontMember}
                          variant="avatar"
                          className="h-16 w-16 sm:h-20 sm:w-20"
                        />
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-[#5BAE84] px-2 py-0.5 font-mono-num text-xs font-extrabold text-white lg:text-sm">
                            #{directFrontMember.number}
                          </span>
                          <span className="text-lg font-black text-white sm:text-xl lg:text-2xl">
                            {directFrontMember.name}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-white/75 lg:text-sm">
                          {directFrontMember.tagline}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenMemberDetail(directFrontMember)}
                            className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#212047] hover:bg-[#7ADAD0] lg:px-4 lg:py-1.5 lg:text-xs"
                          >
                            個人檔案 →
                          </button>
                          <a
                            href={directFrontMember.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="truncate font-mono-num text-[11px] text-[#7ADAD0] hover:underline lg:text-xs"
                          >
                            @{directFrontMember.instagramHandle} ↗
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Summary of All Girls Visiting This Seat Across All 5 Sets */}
              <div className="mt-4 border-t border-white/15 pt-3.5">
                <div className="font-mono-num text-[10px] font-bold tracking-[0.12em] text-[#7ADAD0] uppercase lg:text-xs">
                  整場 5 局會輪流站到你「正前方（{seatMapping.slotName}）」的 6 位女孩：
                </div>
                <div className="mt-2 grid grid-cols-3 gap-1.5 sm:flex sm:flex-wrap lg:gap-2">
                  {allMatchZoneVisitors.directSeatMembers.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => onOpenMemberDetail(m)}
                      className="flex min-w-0 items-center gap-1.5 rounded-full bg-white/10 py-1 pr-2.5 pl-1 text-xs font-bold text-white ring-1 ring-white/20 transition-colors hover:bg-[#5BAE84] lg:py-1.5 lg:pr-3.5 lg:pl-1.5 lg:text-sm"
                    >
                      <MemberPortrait
                        member={m}
                        variant="avatar"
                        className="h-6 w-6 shrink-0 rounded-full lg:h-7 lg:w-7"
                      />
                      <span className="truncate">{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 6 cols: Interactive Set & 10-Point Score Switcher + 3 Girl Station Stage */}
            <div className="flex min-w-0 flex-col justify-between rounded-3xl bg-[#F4FAF8] p-4 ring-1 ring-[#5BAE84]/30 sm:p-6 lg:col-span-6 lg:p-7">
              <div>
                {/* Set & Score Phase Controls */}
                <div className="flex flex-col gap-2.5 border-b border-[#212047]/10 pb-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <div className="grid grid-cols-3 gap-1.5 sm:flex">
                    {currentMatchSchedule.sets.map((s) => {
                      const isActive = s.setKey === activeSetKey;
                      return (
                        <button
                          key={s.setKey}
                          type="button"
                          onClick={() => setActiveSetKey(s.setKey)}
                          className={`rounded-xl px-2 py-2 text-center text-xs font-extrabold transition-all sm:rounded-full sm:px-4 sm:py-1.5 lg:px-5 lg:py-2 lg:text-sm ${
                            isActive
                              ? 'bg-[#212047] text-white shadow-xs'
                              : 'bg-white text-[#212047]/75 ring-1 ring-[#212047]/10 hover:bg-[#E6F5F1]'
                          }`}
                        >
                          {s.setLabel}
                        </button>
                      );
                    })}
                  </div>

                  {/* 0-10 pts vs >10 pts Switch */}
                  <div className="grid grid-cols-2 gap-1 rounded-full bg-[#D5EFE9] p-1 ring-1 ring-[#5BAE84]/30 sm:flex">
                    <button
                      type="button"
                      onClick={() => setScorePhase('initial')}
                      className={`rounded-full px-3 py-1.5 text-center text-[11px] font-bold transition-all lg:px-4 lg:py-2 lg:text-sm ${
                        scorePhase === 'initial'
                          ? 'bg-[#5BAE84] text-white shadow-xs'
                          : 'text-[#212047]/75 hover:text-[#212047]'
                      }`}
                    >
                      開局（0–10 分）
                    </button>
                    <button
                      type="button"
                      onClick={() => setScorePhase('after10')}
                      className={`rounded-full px-3 py-1.5 text-center text-[11px] font-bold transition-all lg:px-4 lg:py-2 lg:text-sm ${
                        scorePhase === 'after10'
                          ? 'bg-[#212047] text-[#7ADAD0] shadow-xs'
                          : 'text-[#212047]/75 hover:text-[#212047]'
                      }`}
                    >
                      破 10 分換位後
                    </button>
                  </div>
                </div>

                {/* Top Audience Orientation Bar (Matching IG Map) */}
                <div className="mt-4 rounded-xl bg-[#212047] px-3 py-2 text-center text-[11px] font-bold text-[#7ADAD0] sm:text-xs lg:py-2.5 lg:text-sm">
                  ▼ 上方為 2F ACE 集氣 {selectedZone} 區觀眾席（你的座位：第 {selectedSeat} 號席，視角往下看） ▼
                </div>

                {/* 3 Station Positions in Current Zone (Facing UP toward Audience ▲) */}
                <div className="mt-3 sm:mt-4">
                  <div className="flex flex-wrap items-center justify-between gap-1 font-mono-num text-[11px] font-bold tracking-[0.08em] text-[#212047]/75 uppercase lg:text-sm">
                    <span>
                      ▲ 2F 前緣應援舞台（啦啦隊面向觀眾席往上方向應援 ▲）
                    </span>
                    <span className="text-[#3F8E67]">
                      {currentSetArrangement.setLabel} ·{' '}
                      {scorePhase === 'initial' ? '0–10 分' : '破 10 分換位'}
                    </span>
                  </div>

                  <div className="mt-2.5 grid grid-cols-3 gap-2 sm:gap-4">
                    {([0, 1, 2] as const).map((slotIdx) => {
                      const memberId = currentZoneGirlIds[slotIdx];
                      const m = memberMap.get(memberId);
                      if (!m) return null;

                      const isDirectFront = seatMapping.slotIndex === slotIdx;
                      const isAdjacent =
                        seatMapping.adjacentSlotIndex === slotIdx;
                      const slotMeta =
                        slotIdx === 0
                          ? {
                              shortLabel: '左位 1–8號',
                              label: '左位（1–8 號前）',
                              seats: '1–8 號',
                            }
                          : slotIdx === 1
                            ? {
                                shortLabel: '中位 9–15號',
                                label: '中位（9–15 號前）',
                                seats: '9–15 號',
                              }
                            : {
                                shortLabel: '右位 16–23號',
                                label: '右位（16–23 號前）',
                                seats: '16–23 號',
                              };

                      return (
                        <div
                          key={`${slotIdx}-${m.id}`}
                          className={`group relative flex min-w-0 flex-col justify-between overflow-hidden rounded-2xl p-2 transition-all duration-500 sm:p-3 ${
                            isDirectFront
                              ? 'bg-[#212047] text-white shadow-[0_18px_38px_-12px_rgba(33,32,71,0.45)] ring-2 ring-[#5BAE84]'
                              : isAdjacent
                                ? 'bg-white text-[#212047] ring-2 ring-[#5ECBC0]'
                                : 'bg-white/80 text-[#212047] ring-1 ring-[#212047]/10'
                          }`}
                        >
                          <div>
                            <div className="mb-1.5 flex items-center justify-between gap-1">
                              <span
                                className={`truncate rounded-full px-1.5 py-0.5 font-mono-num text-[9px] font-extrabold sm:px-2 lg:text-xs ${
                                  isDirectFront
                                    ? 'bg-[#5BAE84] text-white'
                                    : 'bg-[#E6F5F1] text-[#3F8E67]'
                                }`}
                              >
                                {isDirectFront
                                  ? `▲ 正對 (${selectedSeat}號)`
                                  : isAdjacent
                                    ? '▲ 鄰近視角'
                                    : `▲ ${slotMeta.seats}`}
                              </span>
                              <span className="hidden font-mono-num text-[10px] font-bold opacity-70 sm:inline lg:text-xs">
                                #{m.number}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => onOpenMemberDetail(m)}
                              className="block w-full overflow-hidden rounded-xl"
                            >
                              <MemberPortrait
                                member={m}
                                variant="avatar"
                                className="aspect-square w-full sm:hidden"
                              />
                              <MemberPortrait
                                member={m}
                                variant="card"
                                className="hidden aspect-[3/4] w-full sm:block"
                              />
                            </button>
                          </div>

                          <div className="mt-2 text-center">
                            <div className="truncate text-xs font-black sm:text-base lg:text-lg">
                              {m.name}
                            </div>
                            <div
                              className={`mt-0.5 truncate text-[10px] font-medium lg:text-xs ${
                                isDirectFront
                                  ? 'text-[#7ADAD0]'
                                  : 'text-[#212047]/60'
                              }`}
                            >
                              <span className="sm:hidden">
                                {slotMeta.shortLabel}
                              </span>
                              <span className="hidden sm:inline">
                                {slotMeta.label}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Court & Player Bench Orientation Bar (At Bottom, Matching Official IG Map) */}
              <div className="mt-4 rounded-xl bg-[#5BAE84]/15 px-3 py-2 text-center text-[11px] font-bold text-[#212047] ring-1 ring-[#5BAE84]/30 sm:mt-5 sm:px-4 sm:py-2.5 sm:text-xs lg:text-sm">
                ⬇ 最下方為 1F 球員席與中央比賽球場（觀眾由上往下看球賽） ⬇
              </div>
            </div>
          </div>

          {/* Complete 5-Set Timeline Matrix for the Selected Zone & Seat */}
          <div className="mt-6 border-t border-[#212047]/10 pt-6 sm:mt-8 sm:pt-8">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-mono-num text-xs font-extrabold tracking-[0.12em] text-[#212047] uppercase lg:text-base">
                ALL 5 SETS TIMELINE · 「ACE 集氣 {selectedZone} 區 — 第{' '}
                {selectedSeat} 號席」整場五局完整輪換班表
              </span>
              <span className="text-[11px] font-semibold text-[#4FA87D] lg:text-sm">
                綠底／深藍底星號（★）為該局正對你第 {selectedSeat} 號座位的女孩
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6">
              {currentMatchSchedule.sets.map((s) => {
                const initGirls = s.initial[selectedZone].map(
                  (id) => memberMap.get(id)!
                );
                const after10Girls = s.after10Points[selectedZone].map(
                  (id) => memberMap.get(id)!
                );

                return (
                  <div
                    key={s.setKey}
                    className="rounded-2xl bg-[#F4FAF8] p-3.5 ring-1 ring-[#5BAE84]/30 sm:p-4 lg:p-5"
                  >
                    <div className="flex items-center justify-between border-b border-[#212047]/10 pb-2.5">
                      <span className="text-sm font-black text-[#212047] lg:text-lg">
                        {s.setLabel}
                      </span>
                      <span className="rounded-full bg-[#212047] px-2.5 py-0.5 font-mono-num text-[10px] font-bold text-[#7ADAD0] lg:text-xs">
                        {selectedZone} 區班表
                      </span>
                    </div>

                    {/* Phase 1: 0-10 points */}
                    <div className="mt-3">
                      <div className="font-mono-num text-[10px] font-bold text-[#212047]/65 lg:text-xs">
                        【開局 0–10 分】左位 → 中位 → 右位
                      </div>
                      <div className="mt-1.5 grid grid-cols-3 gap-1.5 lg:gap-2">
                        {initGirls.map((g, idx) => {
                          const isMine = idx === seatMapping.slotIndex;
                          return (
                            <button
                              key={`init-${g.id}`}
                              type="button"
                              onClick={() => onOpenMemberDetail(g)}
                              className={`flex min-w-0 flex-col items-center rounded-xl p-2 text-center transition-colors lg:p-2.5 ${
                                isMine
                                  ? 'bg-[#5BAE84] text-white shadow-xs ring-2 ring-[#212047]'
                                  : 'bg-white text-[#212047] ring-1 ring-[#212047]/10 hover:bg-[#E6F5F1]'
                              }`}
                            >
                              <span className="truncate font-mono-num text-[9px] opacity-75 lg:text-xs">
                                {idx === 0
                                  ? '左 1–8號'
                                  : idx === 1
                                    ? '中 9–15號'
                                    : '右 16–23號'}
                              </span>
                              <MemberPortrait
                                member={g}
                                variant="avatar"
                                className="mt-1.5 h-10 w-10 rounded-full ring-1 ring-white/50 lg:h-12 lg:w-12"
                              />
                              <span className="mt-1 truncate text-xs font-extrabold lg:text-sm">
                                {isMine ? `★ ${g.name}` : g.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Phase 2: >10 points */}
                    <div className="mt-3">
                      <div className="font-mono-num text-[10px] font-bold text-[#3F8E67] lg:text-xs">
                        【連莊破 10 分換位後】左位 → 中位 → 右位
                      </div>
                      <div className="mt-1.5 grid grid-cols-3 gap-1.5 lg:gap-2">
                        {after10Girls.map((g, idx) => {
                          const isMine = idx === seatMapping.slotIndex;
                          return (
                            <button
                              key={`after10-${g.id}`}
                              type="button"
                              onClick={() => onOpenMemberDetail(g)}
                              className={`flex min-w-0 flex-col items-center rounded-xl p-2 text-center transition-colors lg:p-2.5 ${
                                isMine
                                  ? 'bg-[#212047] text-[#7ADAD0] shadow-xs ring-2 ring-[#5BAE84]'
                                  : 'bg-white text-[#212047] ring-1 ring-[#212047]/10 hover:bg-[#E6F5F1]'
                              }`}
                            >
                              <span className="truncate font-mono-num text-[9px] opacity-75 lg:text-xs">
                                {idx === 0
                                  ? '左 1–8號'
                                  : idx === 1
                                    ? '中 9–15號'
                                    : '右 16–23號'}
                              </span>
                              <MemberPortrait
                                member={g}
                                variant="avatar"
                                className="mt-1.5 h-10 w-10 rounded-full ring-1 ring-white/40 lg:h-12 lg:w-12"
                              />
                              <span className="mt-1 truncate text-xs font-extrabold lg:text-sm">
                                {isMine ? `★ ${g.name}` : g.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
