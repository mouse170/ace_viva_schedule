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
import {
  OshiStrategyCardModal,
  type StrategyCardMode,
} from './OshiStrategyCardModal';

interface SeatFinderSectionProps {
  favoriteIds: string[];
  externalSelection?: {
    matchId: string;
    zone: AceZoneId;
    seat: number;
    girlId?: string;
    timestamp: number;
  } | null;
  onSeatChange?: (selection: {
    matchId: string;
    zone: AceZoneId;
    seat: number;
  }) => void;
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
    shortTitle: 'A 區（右）',
    title: '2F 集氣 A 區',
    subtitle: '觀眾右手邊看台 · 1–23 號（A23 接 B1）',
    badge: '集氣 A 區',
  },
  {
    id: 'B',
    shortTitle: 'B 區（中）',
    title: '2F 集氣 B 區',
    subtitle: '正中央看台 · 1–23 號（B1 接 A23 · B23 接 C1）',
    badge: '集氣 B 區',
  },
  {
    id: 'C',
    shortTitle: 'C 區（左）',
    title: '2F 集氣 C 區',
    subtitle: '觀眾左手邊看台 · 1–23 號（C1 接 B23）',
    badge: '集氣 C 區',
  },
];

const STATION_SEGMENTS: {
  slotIndex: 0 | 1 | 2;
  shortTitle: string;
  coreSeat: number;
  widthPercent: string;
}[] = [
  {
    slotIndex: 0,
    shortTitle: '左位 1–8',
    coreSeat: 5,
    widthPercent: '34.78%',
  },
  {
    slotIndex: 1,
    shortTitle: '中位 9–15',
    coreSeat: 12,
    widthPercent: '30.44%',
  },
  {
    slotIndex: 2,
    shortTitle: '右位 16–23',
    coreSeat: 19,
    widthPercent: '34.78%',
  },
];

const ALL_23_SEATS = Array.from({ length: 23 }, (_, i) => i + 1);

export const SeatFinderSection: React.FC<SeatFinderSectionProps> = ({
  favoriteIds,
  externalSelection,
  onSeatChange,
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
  const [isStrategyModalOpen, setIsStrategyModalOpen] =
    useState<boolean>(false);
  const [strategyModalMode, setStrategyModalMode] =
    useState<StrategyCardMode>('seat_radar');

  React.useEffect(() => {
    if (!externalSelection) return;
    setSelectedMatchId(externalSelection.matchId);
    setSelectedZone(externalSelection.zone);
    setSelectedSeat(externalSelection.seat);
    if (externalSelection.girlId) {
      setTargetOshiId(externalSelection.girlId);
    }
  }, [externalSelection]);

  React.useEffect(() => {
    onSeatChange?.({
      matchId: selectedMatchId,
      zone: selectedZone,
      seat: selectedSeat,
    });
  }, [selectedMatchId, selectedZone, selectedSeat, onSeatChange]);

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

  // Active Target Oshi
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

  const currentZoneGirlIds =
    scorePhase === 'initial'
      ? currentSetArrangement.initial[selectedZone]
      : currentSetArrangement.after10Points[selectedZone];

  const directFrontMember = memberMap.get(
    currentZoneGirlIds[seatMapping.slotIndex]
  );

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

  const allMatchZoneVisitors = useMemo(() => {
    const directSeatIds = new Set<string>();
    for (const s of currentMatchSchedule.sets) {
      const initTrio = s.initial[selectedZone];
      const after10Trio = s.after10Points[selectedZone];
      directSeatIds.add(initTrio[seatMapping.slotIndex]);
      directSeatIds.add(after10Trio[seatMapping.slotIndex]);
    }
    return {
      directSeatMembers: Array.from(directSeatIds)
        .map((id) => memberMap.get(id))
        .filter((m): m is AceVivaMember => Boolean(m)),
    };
  }, [currentMatchSchedule, selectedZone, seatMapping.slotIndex, memberMap]);

  const sliderFillPercent = ((selectedSeat - 1) / 22) * 100;

  return (
    <section
      id="seat-finder-section"
      className="relative mx-auto max-w-[1440px] px-3 py-14 sm:px-6 sm:py-24 lg:px-10"
    >
      {/* Section Heading */}
      <div className="flex flex-col justify-between gap-5 border-b border-[#212047]/10 pb-7 lg:flex-row lg:items-end lg:pb-10">
        <div className="min-w-0">
          <div className="inline-flex flex-wrap items-center gap-2 rounded-full bg-[#5BAE84]/15 px-3 py-1 font-mono-num text-[10px] font-bold tracking-[0.14em] text-[#212047] ring-1 ring-[#5BAE84]/35 sm:text-xs lg:text-sm">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#5BAE84]" />
            <span>2F 集氣區 · 1–23 號直線選位與相對位置雷達</span>
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-[#212047] sm:text-4xl lg:text-5xl">
            選擇區域與拉動座位編號，查看面前女孩與主推雷達
          </h2>
          <p className="mt-2 max-w-4xl text-xs leading-relaxed text-[#212047]/75 sm:text-base lg:text-lg">
            先選區域（A / B / C），再於單一直線尺規拖曳或點擊 1–23 號座位，即時以「觀眾面向球場第一人稱視角（左手邊 C 區大號側 ↔ 右手邊 A 區小號側）」顯示面前女孩與主推相對位置雷達。
          </p>
        </div>

        {/* Dynamic Match Day Switcher + 1-Click Strategy Image Button */}
        <div className="flex flex-wrap items-center gap-2 lg:self-end">
          <div className="flex flex-wrap gap-1.5 rounded-2xl bg-[#D5EFE9] p-1.5 ring-1 ring-[#5BAE84]/35 sm:rounded-full">
            {STATION_ROTATION_SCHEDULES.map((sched, idx) => {
              const isActive = sched.matchId === selectedMatchId;
              return (
                <button
                  key={sched.matchId}
                  type="button"
                  onClick={() => setSelectedMatchId(sched.matchId)}
                  className={`rounded-xl px-3 py-2 text-center text-xs font-extrabold transition-all duration-300 sm:rounded-full sm:px-4 lg:px-5 lg:py-2.5 lg:text-sm ${
                    isActive
                      ? 'bg-[#212047] text-white shadow-sm'
                      : 'text-[#212047]/75 hover:bg-white/60 hover:text-[#212047]'
                  }`}
                >
                  第 {idx + 1} 日 · {sched.dateLabel.split(' ')[0]} 對戰{' '}
                  {sched.opponent}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              setStrategyModalMode('seat_radar');
              setIsStrategyModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#212047] px-4 py-2.5 text-xs font-extrabold text-[#7ADAD0] shadow-sm ring-1 ring-[#5BAE84] transition-all hover:bg-[#2E2C5E] active:scale-95 lg:px-5 lg:py-3 lg:text-sm"
          >
            <span>生成「{selectedZone}{selectedSeat} 座位雷達圖卡」</span>
            <span>↓</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setStrategyModalMode('zone_hopping');
              setIsStrategyModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#5BAE84] px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition-all hover:bg-[#3F8E67] active:scale-95 lg:px-5 lg:py-3 lg:text-sm"
          >
            <span>生成「{activeOshi.name} 最佳換位＆跨區卡」</span>
            <span>↓</span>
          </button>
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
                  雷達定位主推
                </span>
                <span className="text-xs font-extrabold text-[#212047] lg:text-base">
                  點選要在雷達上計算相對席次的主推：
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setStrategyModalMode('seat_radar');
                    setIsStrategyModalOpen(true);
                  }}
                  className="rounded-full bg-[#212047] px-3 py-1 font-mono-num text-[11px] font-black text-[#5ECBC0] shadow-2xs ring-1 ring-[#5BAE84] transition-colors hover:bg-[#2E2C5E] lg:text-xs"
                >
                  生出 {selectedZone}{selectedSeat} 座位雷達圖卡 ↓
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStrategyModalMode('zone_hopping');
                    setIsStrategyModalOpen(true);
                  }}
                  className="rounded-full bg-[#5BAE84] px-3 py-1 font-mono-num text-[11px] font-black text-white shadow-2xs transition-colors hover:bg-[#3F8E67] lg:text-xs"
                >
                  生出 {activeOshi.name} 最佳換位＆跨區卡 ↓
                </button>
              </div>
            </div>

            <div className="no-scrollbar mt-2.5 flex gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0 lg:mt-3 lg:gap-2.5">
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
              <span className="font-mono-num text-[11px] font-extrabold tracking-[0.12em] text-[#212047] sm:text-xs lg:text-base">
                步驟一 · 選擇「2F 集氣區」區域（A / B / C 區）
              </span>
              <span className="text-[11px] font-medium text-[#212047]/65 lg:text-sm">
                看台連續相接：A23 ↔ B1 · B23 ↔ C1
              </span>
            </div>

            <div className="mt-2.5 grid grid-cols-3 gap-2 sm:gap-3.5 lg:mt-4 lg:gap-5">
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

          {/* STEP 02: True Single-Line Interactive 1–23 Seat Bar (真正一直線直覺選位尺規) */}
          <div className="mt-6 border-t border-[#212047]/10 pt-5 sm:mt-8 sm:pt-7">
            {/* Single-Row Top Header: Selected Seat Pill on Left + -1/+1 Stepper on Right */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono-num text-[11px] font-extrabold tracking-[0.1em] text-[#212047] sm:text-xs lg:text-base">
                  步驟二 · 直線選擇座位（1–23 號）
                </span>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-[#212047] px-3 py-1 text-white shadow-xs">
                  <span className="font-mono-num text-xs font-extrabold text-[#5ECBC0] sm:text-sm lg:text-base">
                    {selectedZone} 區 {selectedSeat} 號
                  </span>
                  <span className="text-white/30">｜</span>
                  <span className="text-[11px] font-bold text-white sm:text-xs lg:text-sm">
                    正對{seatMapping.slotName.slice(0, 2)}{' '}
                    {directFrontMember?.name}
                  </span>
                </div>
              </div>

              {/* Compact Horizontal Stepper */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedSeat((prev) => Math.max(1, prev - 1))}
                  disabled={selectedSeat <= 1}
                  className="rounded-full bg-[#F4FAF8] px-3 py-1 font-mono-num text-xs font-extrabold text-[#212047] ring-1 ring-[#212047]/15 transition-colors hover:bg-[#D5EFE9] active:scale-95 disabled:opacity-35 lg:px-4 lg:py-1.5 lg:text-sm"
                >
                  ← -1 號
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSeat((prev) => Math.min(23, prev + 1))}
                  disabled={selectedSeat >= 23}
                  className="rounded-full bg-[#F4FAF8] px-3 py-1 font-mono-num text-xs font-extrabold text-[#212047] ring-1 ring-[#212047]/15 transition-colors hover:bg-[#D5EFE9] active:scale-95 disabled:opacity-35 lg:px-4 lg:py-1.5 lg:text-sm"
                >
                  +1 號 →
                </button>
              </div>
            </div>

            {/* Unified Single-Axis Linear Bar Container */}
            <div className="mt-3 rounded-2xl bg-[#F4FAF8] p-2.5 ring-1 ring-[#5BAE84]/35 sm:p-4 lg:p-5">
              {/* Row A: 3 Proportional Station Segments Aligned in One Line */}
              <div className="flex w-full gap-1">
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
                      className={`flex min-w-0 items-center justify-center gap-1.5 rounded-xl px-1.5 py-1.5 transition-all sm:justify-between sm:px-3 sm:py-2 ${
                        isActiveSeg
                          ? 'bg-[#212047] text-white shadow-2xs ring-1 ring-[#5BAE84]'
                          : isOshiHere
                            ? 'bg-[#E6F5F1] text-[#212047] ring-1 ring-[#212047]'
                            : 'bg-white text-[#212047]/75 ring-1 ring-[#212047]/10 hover:bg-[#E6F5F1]'
                      }`}
                    >
                      <span className="truncate font-mono-num text-[10px] font-bold sm:text-xs lg:text-sm">
                        {seg.shortTitle}
                      </span>
                      {segGirl && (
                        <span className="flex min-w-0 items-center gap-1">
                          <MemberPortrait
                            member={segGirl}
                            variant="avatar"
                            className="h-4 w-4 shrink-0 rounded-full ring-1 ring-white sm:h-6 sm:w-6"
                          />
                          <span className="truncate text-[10px] font-black sm:text-xs lg:text-sm">
                            {isOshiHere ? `★${segGirl.name}` : segGirl.name}
                          </span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Row B: Continuous Draggable Slider Track (1..23) */}
              <div className="relative mt-3 px-1">
                <div
                  className="pointer-events-none absolute top-1/2 right-1 left-1 h-3 -translate-y-1/2 rounded-full ring-1 ring-[#212047]/15"
                  style={{
                    background: `linear-gradient(to right, #5BAE84 0%, #5ECBC0 ${sliderFillPercent}%, #DCEEE9 ${sliderFillPercent}%, #DCEEE9 100%)`,
                  }}
                />
                {/* Station Divider Ticks at 8|9 (34.78%) and 15|16 (65.22%) */}
                <div
                  style={{ left: '34.78%' }}
                  className="pointer-events-none absolute top-1/2 h-4 w-0.5 -translate-y-1/2 bg-[#212047]/40"
                />
                <div
                  style={{ left: '65.22%' }}
                  className="pointer-events-none absolute top-1/2 h-4 w-0.5 -translate-y-1/2 bg-[#212047]/40"
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

              {/* Row C: Strictly Single-Line 1–23 Number Ruler (grid-cols-23, NEVER wraps!) */}
              <div className="mt-1.5 grid grid-cols-23 gap-px select-none">
                {ALL_23_SEATS.map((num) => {
                  const isSelected = selectedSeat === num;
                  const isCore = num === 5 || num === 12 || num === 19;
                  const isInActiveSlot =
                    (seatMapping.slotIndex === 0 && num <= 8) ||
                    (seatMapping.slotIndex === 1 && num >= 9 && num <= 15) ||
                    (seatMapping.slotIndex === 2 && num >= 16);

                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSelectedSeat(num)}
                      className={`flex flex-col items-center justify-center rounded-md py-1 font-mono-num transition-all ${
                        isSelected
                          ? 'z-10 scale-110 bg-[#212047] font-black text-[#5ECBC0] shadow-xs ring-1 ring-[#5BAE84]'
                          : isCore
                            ? 'bg-[#D5EFE9] font-extrabold text-[#212047] hover:bg-[#5BAE84] hover:text-white'
                            : isInActiveSlot
                              ? 'bg-white font-bold text-[#212047] hover:bg-[#E6F5F1]'
                              : 'bg-transparent font-medium text-[#212047]/45 hover:bg-white'
                      }`}
                    >
                      <span className="text-[9px] leading-none tracking-tighter sm:text-[11px] lg:text-xs">
                        {num}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Unified First-Person Audience Seat Radar & Current Zone 3-Girl Stage Section */}
          <div className="mt-6 border-t border-[#212047]/10 pt-6 lg:mt-8 lg:pt-8">
            <div className="rounded-3xl bg-[#212047] p-4 text-white shadow-xl ring-1 ring-[#5ECBC0]/35 sm:p-6 lg:p-8">
              {/* 1. Unified Top Bar: Title + Immediate Set & Score Phase Quick Switchers */}
              <div className="flex flex-col gap-3 border-b border-white/15 pb-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#5BAE84] px-3 py-0.5 font-mono-num text-[10px] font-extrabold tracking-wider text-white lg:text-xs">
                      觀眾面向球場視角雷達
                    </span>
                    <span className="font-mono-num text-xs font-bold text-[#7ADAD0] lg:text-sm">
                      {currentMatchSchedule.dateLabel} · 你的座位：{selectedZone}{' '}
                      區 {selectedSeat} 號
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-white/70 sm:text-xs lg:text-sm">
                    以觀眾坐在座位面向球場為基準：下方為你的座位往前看 ▲，左手邊為 C 區（23 號大號側）◀、右手邊為 A 區（1 號小號側）▶
                  </p>
                </div>

                {/* Quick Set & 10-Point Phase Switcher Controls (Merged right into Radar Top!) */}
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                  {/* Set Quick Buttons */}
                  <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-[#181736] p-1 ring-1 ring-white/15 sm:flex sm:rounded-full">
                    {currentMatchSchedule.sets.map((s) => {
                      const isActive = s.setKey === activeSetKey;
                      return (
                        <button
                          key={s.setKey}
                          type="button"
                          onClick={() => setActiveSetKey(s.setKey)}
                          className={`rounded-xl px-2.5 py-2 text-center text-xs font-extrabold transition-all sm:rounded-full sm:px-3.5 sm:py-1.5 lg:px-4 lg:py-2 lg:text-sm ${
                            isActive
                              ? 'bg-[#5BAE84] text-white shadow-sm ring-1 ring-[#7ADAD0]'
                              : 'text-white/75 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {s.setLabel}
                        </button>
                      );
                    })}
                  </div>

                  {/* 0-10 pts vs >10 pts Quick Switch */}
                  <div className="grid grid-cols-2 gap-1 rounded-full bg-[#181736] p-1 ring-1 ring-[#5ECBC0]/35 sm:flex">
                    <button
                      type="button"
                      onClick={() => setScorePhase('initial')}
                      className={`rounded-full px-3 py-1.5 text-center text-xs font-extrabold transition-all lg:px-4 lg:py-2 lg:text-sm ${
                        scorePhase === 'initial'
                          ? 'bg-[#5ECBC0] text-[#212047] shadow-xs'
                          : 'text-white/75 hover:text-white'
                      }`}
                    >
                      開局（0–10 分）
                    </button>
                    <button
                      type="button"
                      onClick={() => setScorePhase('after10')}
                      className={`rounded-full px-3 py-1.5 text-center text-xs font-extrabold transition-all lg:px-4 lg:py-2 lg:text-sm ${
                        scorePhase === 'after10'
                          ? 'bg-[#5ECBC0] text-[#212047] shadow-xs'
                          : 'text-white/75 hover:text-white'
                      }`}
                    >
                      破 10 分換位後
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. Audience First-Person Visual Radar (Left = C23..C1, Center = B23..B1, Right = A23..A1; Bottom = You looking UP ▲) */}
              {activePhaseOshiDistance && otherPhaseOshiDistance && (() => {
                const isNear = activePhaseOshiDistance.isWithin12Seats;
                const offset = activePhaseOshiDistance.signedSeatOffset;
                const seatsDiff = activePhaseOshiDistance.seatsToCoreCenter;
                const slotShort =
                  activePhaseOshiDistance.girlSlotLabel.slice(0, 2);

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

                // Audience first-person X mapping:
                // Facing the court, Leftmost (7%) is C23 (globalSeat=69), Rightmost (93%) is A1 (globalSeat=1)
                const toAudienceX = (gSeat: number) =>
                  Math.max(10, Math.min(90, 7 + ((69 - gSeat) / 68) * 86));

                const userX = toAudienceX(userGlobal);
                const oshiX = toAudienceX(oshiGlobal);
                // In Audience view, left of user is larger globalSeat (userGlobal + 12), right of user is smaller globalSeat (userGlobal - 12)
                const fovLeftX = toAudienceX(Math.min(69, userGlobal + 12));
                const fovRightX = toAudienceX(Math.max(1, userGlobal - 12));

                // Concise relative seat count badge in Audience First-Person perspective
                // offset < 0 means oshi is toward C/larger seat numbers = Audience's LEFT hand (左前方)
                // offset > 0 means oshi is toward A/smaller seat numbers = Audience's RIGHT hand (右前方)
                const relativeBadge =
                  offset === 0
                    ? '▲ 正前方 0 席'
                    : offset < 0
                      ? `◀ 左前 ${Math.abs(offset)} 席（往左手邊）`
                      : `右前 ${offset} 席（往右手邊） ▶`;

                const shortRelativeBadge =
                  offset === 0
                    ? '▲ 正前方 0 席'
                    : offset < 0
                      ? `◀ 左前 ${Math.abs(offset)} 席`
                      : `右前 ${offset} 席 ▶`;

                return (
                  <div className="mt-4 rounded-2xl border border-[#5ECBC0]/40 bg-[#181736] p-3 shadow-inner sm:p-5">
                    {/* Top Status Strip: Your Seat -> Oshi Target + Relative Direction Pill */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono-num text-xs font-black text-white sm:text-sm lg:text-base">
                          你（{selectedZone}
                          {selectedSeat}）→ ★{activeOshi.name}（
                          {activePhaseOshiDistance.girlZone} 區{' '}
                          {activePhaseOshiDistance.girlSeatRange[0]}–
                          {activePhaseOshiDistance.girlSeatRange[1]} 號 · IG
                          {slotShort}）
                        </span>
                        <span className="rounded-md bg-white/10 px-2 py-0.5 font-mono-num text-[10px] font-bold text-[#7ADAD0] lg:text-xs">
                          {currentSetArrangement.setLabel} ·{' '}
                          {scorePhase === 'initial' ? '0–10 分' : '破 10 分後'}
                        </span>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-3 py-0.5 font-mono-num text-xs font-black lg:text-sm ${
                          isNear
                            ? 'bg-[#5BAE84] text-white'
                            : 'bg-amber-400 text-[#212047]'
                        }`}
                      >
                        {relativeBadge}
                      </span>
                    </div>

                    {/* Audience Left-to-Right Zone Header: Left = C 區 (23→1) | Center = B 區 (23→1) | Right = A 區 (23→1) */}
                    <div className="mt-3 grid grid-cols-3 gap-1.5 text-center font-mono-num text-[10px] font-bold sm:text-xs">
                      {(
                        [
                          {
                            id: 'C' as AceZoneId,
                            label: '◀ 左手邊：2F C 區 (23→1號)',
                            mobileLabel: '◀ 左：C 區 (23→1)',
                          },
                          {
                            id: 'B' as AceZoneId,
                            label: '正中央：2F B 區 (23→1號)',
                            mobileLabel: '中：B 區 (23→1)',
                          },
                          {
                            id: 'A' as AceZoneId,
                            label: '右手邊：2F A 區 (23→1號) ▶',
                            mobileLabel: '右：A 區 (23→1) ▶',
                          },
                        ] as const
                      ).map((zItem) => (
                        <button
                          key={zItem.id}
                          type="button"
                          onClick={() => setSelectedZone(zItem.id)}
                          className={`rounded-lg py-1.5 transition-all ${
                            selectedZone === zItem.id
                              ? 'bg-[#5BAE84]/35 text-[#7ADAD0] ring-1 ring-[#5ECBC0]'
                              : 'bg-white/[0.06] text-white/60 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span className="sm:hidden">{zItem.mobileLabel}</span>
                          <span className="hidden sm:inline">{zItem.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Visual Radar Canvas (Top = 1F Court & Cheerleader Stage ▼, Bottom = Your Seat looking UP ▲) */}
                    <div className="relative mt-2 h-48 w-full overflow-hidden rounded-xl bg-[#212047]/95 ring-1 ring-white/15 sm:h-54">
                      {/* TOP STRIP: 1F Court in front of the Audience */}
                      <div className="absolute inset-x-2 top-1.5 z-10 flex items-center justify-center rounded-md bg-[#5BAE84]/25 py-0.5 text-center font-mono-num text-[10px] font-bold text-[#7ADAD0] ring-1 ring-[#5BAE84]/40 lg:text-xs">
                        ▲ 前方 1F 球員席 ＆ 中央比賽球場（觀眾視線往上看 ▲）▲
                      </div>

                      <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        className="pointer-events-none absolute inset-0 h-full w-full"
                      >
                        <defs>
                          <linearGradient
                            id="audienceUpwardFov"
                            x1="0"
                            y1="1"
                            x2="0"
                            y2="0"
                          >
                            <stop
                              offset="0%"
                              stopColor="#5ECBC0"
                              stopOpacity="0.34"
                            />
                            <stop
                              offset="100%"
                              stopColor="#5ECBC0"
                              stopOpacity="0.05"
                            />
                          </linearGradient>
                        </defs>

                        {/* Zone Dividers (C | B at 33.33%, B | A at 66.67%) */}
                        <line
                          x1="33.33"
                          y1="16"
                          x2="33.33"
                          y2="92"
                          stroke="rgba(255,255,255,0.14)"
                          strokeWidth="0.6"
                          strokeDasharray="2 2"
                        />
                        <line
                          x1="66.67"
                          y1="16"
                          x2="66.67"
                          y2="92"
                          stroke="rgba(255,255,255,0.14)"
                          strokeWidth="0.6"
                          strokeDasharray="2 2"
                        />

                        {/* Front Cheerleader Stage Line (y=28) & Bottom Audience Seat Line (y=82) */}
                        <line
                          x1="4"
                          y1="28"
                          x2="96"
                          y2="28"
                          stroke="rgba(94,203,192,0.4)"
                          strokeWidth="1"
                        />
                        <line
                          x1="4"
                          y1="82"
                          x2="96"
                          y2="82"
                          stroke="rgba(255,255,255,0.22)"
                          strokeWidth="0.8"
                        />

                        {/* ±12 Seat Camera Cone Projecting UPWARD from Audience Seat (y=82) to Stage (y=28) */}
                        <polygon
                          points={`${userX},82 ${fovLeftX},28 ${fovRightX},28`}
                          fill="url(#audienceUpwardFov)"
                        />

                        {/* Sightline from User (y=82) UP to Oshi (y=32) */}
                        <line
                          x1={userX}
                          y1="82"
                          x2={oshiX}
                          y2="32"
                          stroke={isNear ? '#5ECBC0' : '#FBBF24'}
                          strokeWidth={isNear ? '1.8' : '1.4'}
                          strokeDasharray={isNear ? undefined : '3 2.5'}
                        />
                      </svg>

                      {/* Side Orientation Watermarks */}
                      <div className="pointer-events-none absolute top-1/2 left-2 -translate-y-1/2 font-mono-num text-[9px] font-bold text-white/30 sm:text-[10px]">
                        ◀ 左手邊 (C23)
                      </div>
                      <div className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 font-mono-num text-[9px] font-bold text-white/30 sm:text-[10px]">
                        右手邊 (A1) ▶
                      </div>

                      {/* TOP-MIDDLE PIN: Cheerleader on Front Stage (Facing down toward Audience ▼) */}
                      <button
                        type="button"
                        onClick={() => onOpenMemberDetail(activeOshi)}
                        style={{
                          left: `${Math.max(16, Math.min(84, oshiX))}%`,
                        }}
                        className="absolute top-[16%] z-20 flex -translate-x-1/2 flex-col items-center transition-all duration-300"
                      >
                        <div className="relative">
                          <MemberPortrait
                            member={activeOshi}
                            variant="avatar"
                            className={`h-9 w-9 rounded-full ring-2 sm:h-11 sm:w-11 ${
                              isNear
                                ? 'ring-[#5ECBC0] shadow-[0_0_14px_rgba(94,203,192,0.6)]'
                                : 'ring-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.45)]'
                            }`}
                          />
                          <span className="absolute -top-1 -right-2 rounded-full bg-[#212047] px-1 font-mono-num text-[8px] font-black text-[#7ADAD0] ring-1 ring-[#5ECBC0]">
                            {activePhaseOshiDistance.girlZone}
                            {activePhaseOshiDistance.girlCoreSeat}▼
                          </span>
                        </div>
                        <span
                          className={`mt-0.5 rounded-full px-2 py-0.2 font-mono-num text-[9px] font-extrabold whitespace-nowrap lg:text-[11px] ${
                            isNear
                              ? 'bg-[#5BAE84] text-white'
                              : 'bg-amber-400 text-[#212047]'
                          }`}
                        >
                          ★ {activeOshi.name}
                        </span>
                      </button>

                      {/* CENTER BADGE: Relative Seat Count & Camera Status */}
                      <div className="pointer-events-none absolute top-[54%] left-1/2 z-20 -translate-x-1/2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono-num text-[10px] font-black whitespace-nowrap shadow-md ring-1 lg:text-xs ${
                            isNear
                              ? 'bg-[#181736]/90 text-[#5ECBC0] ring-[#5ECBC0]/60'
                              : 'bg-[#181736]/95 text-amber-300 ring-amber-400/70'
                          }`}
                        >
                          <span>{shortRelativeBadge}</span>
                          <span>·</span>
                          <span>
                            {isNear ? '12 席內好拍' : '逾 12 席偏遠難拍'}
                          </span>
                        </span>
                      </div>

                      {/* BOTTOM PIN: Your Seat in the Stands (Facing UP toward Stage & Court ▲) */}
                      <div
                        style={{
                          left: `${Math.max(16, Math.min(84, userX))}%`,
                        }}
                        className="absolute bottom-2 z-20 flex -translate-x-1/2 flex-col items-center transition-all duration-300"
                      >
                        <div className="rounded-full bg-white px-2.5 py-0.5 font-mono-num text-[10px] font-black text-[#212047] whitespace-nowrap shadow-md ring-2 ring-[#5ECBC0] lg:text-xs">
                          ▲ 你：{selectedZone}
                          {selectedSeat}（往前看）
                        </div>
                      </div>
                    </div>

                    {/* Concise 1-Line Bottom Bar */}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      {isNear ? (
                        <span className="text-xs font-bold text-[#7ADAD0] lg:text-sm">
                          ★ 距離 {seatsDiff} 席（12 席最佳正面拍攝射程內）
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-amber-300 lg:text-sm">
                          ▲ 相距 {seatsDiff} 席（超過 12 席，視角偏斜可能拍不到正面）
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setScorePhase((p) =>
                            p === 'initial' ? 'after10' : 'initial'
                          )
                        }
                        className="rounded-full bg-white/10 px-3 py-1 font-mono-num text-[11px] font-bold text-white/85 ring-1 ring-white/15 transition-colors hover:bg-white/20 lg:text-xs"
                      >
                        {scorePhase === 'initial'
                          ? '切換看破 10 分後'
                          : '切換看 0–10 分時'}
                        ：差 {otherPhaseOshiDistance.seatsToCoreCenter} 席 ⇄
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* 3. Merged Current-Zone 3-Girl Station Cards (Aligned with Audience Left 23–16 號 -> Center 15–9 號 -> Right 8–1 號!) */}
              <div className="mt-5 rounded-2xl bg-[#F4FAF8] p-3.5 text-[#212047] ring-1 ring-[#5ECBC0]/40 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#212047]/10 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#212047] px-2.5 py-0.5 font-mono-num text-[10px] font-extrabold text-[#7ADAD0] lg:text-xs">
                      2F 集氣 {selectedZone} 區面前三位女孩
                    </span>
                    <span className="text-xs font-extrabold text-[#3F8E67] lg:text-sm">
                      {currentSetArrangement.setLabel} ·{' '}
                      {scorePhase === 'initial'
                        ? '開局 0–10 分'
                        : '破 10 分換位後'}
                    </span>
                  </div>
                  <span className="font-mono-num text-[11px] font-bold text-[#212047]/70 lg:text-xs">
                    依觀眾面向球場視角排列：◀ 左手邊 23–16 號 ｜ 中央 15–9 號 ｜ 右手邊 8–1 號 ▶
                  </span>
                </div>

                {/* 3 Station Positions Ordered [2, 1, 0] to Vertically Match Audience Left-to-Right Radar! */}
                <div className="mt-3.5 grid grid-cols-3 gap-2 sm:gap-4">
                  {([2, 1, 0] as const).map((slotIdx) => {
                    const memberId = currentZoneGirlIds[slotIdx];
                    const m = memberMap.get(memberId);
                    if (!m) return null;

                    const isDirectFront = seatMapping.slotIndex === slotIdx;
                    const isAdjacent =
                      seatMapping.adjacentSlotIndex === slotIdx;
                    const isTargetOshi = m.id === activeOshi.id;

                    // Audience perspective metadata for each slot
                    const slotMeta =
                      slotIdx === 2
                        ? {
                            shortLabel: '◀ 左側 23–16號',
                            label: '◀ 左手邊 23–16 號（官方右位）',
                            seats: '23–16 號',
                            coreSeat: 19,
                          }
                        : slotIdx === 1
                          ? {
                              shortLabel: '▲ 中央 15–9號',
                              label: '▲ 正中央 15–9 號（官方中位）',
                              seats: '15–9 號',
                              coreSeat: 12,
                            }
                          : {
                              shortLabel: '右側 8–1號 ▶',
                              label: '右手邊 8–1 號（官方左位） ▶',
                              seats: '8–1 號',
                              coreSeat: 5,
                            };

                    return (
                      <div
                        key={`${slotIdx}-${m.id}`}
                        className={`group relative flex min-w-0 flex-col justify-between overflow-hidden rounded-2xl p-2 transition-all duration-300 sm:p-3.5 ${
                          isDirectFront
                            ? 'bg-[#212047] text-white shadow-[0_16px_34px_-10px_rgba(33,32,71,0.5)] ring-2 ring-[#5BAE84]'
                            : isAdjacent
                              ? 'bg-white text-[#212047] ring-2 ring-[#5ECBC0]'
                              : 'bg-white/85 text-[#212047] ring-1 ring-[#212047]/10'
                        }`}
                      >
                        <div>
                          <div className="mb-1.5 flex items-center justify-between gap-1">
                            <span
                              className={`truncate rounded-full px-1.5 py-0.5 font-mono-num text-[9px] font-extrabold sm:px-2.5 lg:text-xs ${
                                isDirectFront
                                  ? 'bg-[#5BAE84] text-white'
                                  : 'bg-[#E6F5F1] text-[#3F8E67]'
                              }`}
                            >
                              {isDirectFront
                                ? `★ 正對你 (${selectedZone}${selectedSeat})`
                                : isAdjacent
                                  ? `鄰近 (${slotMeta.seats})`
                                  : slotMeta.seats}
                            </span>
                            <span className="hidden font-mono-num text-[10px] font-bold opacity-75 sm:inline lg:text-xs">
                              #{m.number}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => onOpenMemberDetail(m)}
                            className="relative block w-full overflow-hidden rounded-xl"
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
                            {isTargetOshi && (
                              <span className="absolute right-1.5 bottom-1.5 rounded-full bg-[#212047]/90 px-2 py-0.5 font-mono-num text-[9px] font-black text-[#5ECBC0] ring-1 ring-[#5ECBC0]">
                                ★ 雷達主推
                              </span>
                            )}
                          </button>
                        </div>

                        <div className="mt-2 text-center">
                          <div className="truncate text-xs font-black sm:text-base lg:text-xl">
                            {m.name}
                          </div>
                          <div
                            className={`mt-0.5 truncate text-[10px] font-semibold lg:text-xs ${
                              isDirectFront
                                ? 'text-[#7ADAD0]'
                                : 'text-[#212047]/65'
                            }`}
                          >
                            <span className="sm:hidden">
                              {slotMeta.shortLabel}
                            </span>
                            <span className="hidden sm:inline">
                              {slotMeta.label}
                            </span>
                          </div>

                          {/* Action Pills inside each card (With 1-Click Open IG Button!) */}
                          <div className="mt-2 flex flex-wrap items-center justify-center gap-1">
                            <a
                              href={m.instagramUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="rounded-full bg-[#5BAE84] px-2 py-0.5 font-mono-num text-[10px] font-black text-white transition-colors hover:bg-[#3F8E67] lg:px-2.5 lg:py-1 lg:text-xs"
                            >
                              IG ↗
                            </a>
                            <button
                              type="button"
                              onClick={() => onOpenMemberDetail(m)}
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold transition-colors lg:px-2.5 lg:py-1 lg:text-xs ${
                                isDirectFront
                                  ? 'bg-white/15 text-white hover:bg-[#5BAE84]'
                                  : 'bg-[#F4FAF8] text-[#212047] ring-1 ring-[#212047]/10 hover:bg-[#D5EFE9]'
                              }`}
                            >
                              檔案
                            </button>
                            {!isDirectFront && (
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedSeat(slotMeta.coreSeat)
                                }
                                className="rounded-full bg-[#E6F5F1] px-2 py-0.5 font-mono-num text-[10px] font-bold text-[#3F8E67] hover:bg-[#5BAE84] hover:text-white lg:px-2.5 lg:py-1 lg:text-xs"
                              >
                                坐 {slotMeta.coreSeat} 號
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Audience Orientation Strip */}
                <div className="mt-3 rounded-xl bg-[#212047] px-3 py-2 text-center text-[11px] font-bold text-[#7ADAD0] sm:text-xs">
                  ▲ 你的座位：2F 集氣 {selectedZone} 區 {selectedSeat}{' '}
                  號（面向前方舞台與 1F 球場，正前方為{' '}
                  <strong className="text-white">
                    {directFrontMember?.name}
                  </strong>
                  ）▲
                </div>
              </div>

              {/* 4. Summary of All Girls Visiting This Exact Seat Across All 5 Sets */}
              <div className="mt-4 flex flex-col gap-2 border-t border-white/15 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="font-mono-num text-[10px] font-bold tracking-[0.1em] text-[#7ADAD0] lg:text-xs">
                  整場 5 局會輪流站到你「{selectedZone} 區 {selectedSeat}{' '}
                  號正前方」的 6 位女孩：
                </div>
                <div className="grid grid-cols-3 gap-1.5 sm:flex sm:flex-wrap lg:gap-2">
                  {allMatchZoneVisitors.directSeatMembers.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => onOpenMemberDetail(m)}
                      className="flex min-w-0 items-center gap-1.5 rounded-full bg-white/10 py-1 pr-2.5 pl-1 text-xs font-bold text-white ring-1 ring-white/20 transition-colors hover:bg-[#5BAE84] lg:py-1 lg:pr-3 lg:pl-1.5 lg:text-sm"
                    >
                      <MemberPortrait
                        member={m}
                        variant="avatar"
                        className="h-5 w-5 shrink-0 rounded-full lg:h-6 lg:w-6"
                      />
                      <span className="truncate">{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Complete 5-Set Timeline Matrix for the Selected Zone & Seat */}
          <div className="mt-6 border-t border-[#212047]/10 pt-6 sm:mt-8 sm:pt-8">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-mono-num text-xs font-extrabold tracking-[0.12em] text-[#212047] lg:text-base">
                「2F 集氣 {selectedZone} 區 · 第 {selectedSeat} 號席」整場五局完整輪換班表
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

      {/* Oshi Strategy Card PNG Generator Modal */}
      <OshiStrategyCardModal
        isOpen={isStrategyModalOpen}
        initialGirlId={activeOshi.id}
        initialMatchId={selectedMatchId}
        initialMode={strategyModalMode}
        initialZone={selectedZone}
        initialSeat={selectedSeat}
        onClose={() => setIsStrategyModalOpen(false)}
      />
    </section>
  );
};
