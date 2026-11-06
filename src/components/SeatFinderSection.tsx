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
    shortTitle: 'A 區（左側）',
    title: '2F ACE 集氣 A 區',
    subtitle: '面向球場左側看台 · 1–23 號席位',
    badge: 'ZONE A',
  },
  {
    id: 'B',
    shortTitle: 'B 區（中央）',
    title: '2F ACE 集氣 B 區',
    subtitle: '面向球場正中央看台 · 1–23 號席位',
    badge: 'ZONE B',
  },
  {
    id: 'C',
    shortTitle: 'C 區（右側）',
    title: '2F ACE 集氣 C 區',
    subtitle: '面向球場右側看台 · 1–23 號席位',
    badge: 'ZONE C',
  },
];

const STATION_GROUPS: {
  slotIndex: 0 | 1 | 2;
  title: string;
  rangeLabel: string;
  seats: number[];
  gridColsClass: string;
}[] = [
  {
    slotIndex: 0,
    title: '左位視角（站位 1）',
    rangeLabel: '1–8 號席',
    seats: [1, 2, 3, 4, 5, 6, 7, 8],
    gridColsClass: 'grid-cols-8',
  },
  {
    slotIndex: 1,
    title: '中位視角（站位 2）',
    rangeLabel: '9–15 號席',
    seats: [9, 10, 11, 12, 13, 14, 15],
    gridColsClass: 'grid-cols-7',
  },
  {
    slotIndex: 2,
    title: '右位視角（站位 3）',
    rangeLabel: '16–23 號席',
    seats: [16, 17, 18, 19, 20, 21, 22, 23],
    gridColsClass: 'grid-cols-8',
  },
];

function getDistanceBadgeStyle(level: PhaseDistanceDetail['statusLevel']): string {
  switch (level) {
    case 'direct_core':
      return 'bg-[#5BAE84] text-white ring-2 ring-[#7ADAD0]';
    case 'direct_range':
      return 'bg-[#5BAE84] text-white';
    case 'same_zone_near':
      return 'bg-[#5ECBC0]/25 text-[#7ADAD0] ring-1 ring-[#5ECBC0]/50';
    case 'same_zone_far':
      return 'bg-white/15 text-white ring-1 ring-white/25';
    default:
      return 'bg-white/10 text-white/80 ring-1 ring-white/15';
  }
}

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

  // Multi-favorite quick comparison for all attending favorites in favoriteIds
  const attendingFavoritesDistances = useMemo(() => {
    const attendingFavIds = favoriteIds.filter((id) =>
      rotatingMemberIds.includes(id)
    );
    return attendingFavIds
      .map((id) => {
        const member = memberMap.get(id);
        if (!member) return null;
        const summary = getFullMatchGirlDistanceSummary(
          currentMatchSchedule,
          selectedZone,
          selectedSeat,
          id
        );
        const setInfo =
          summary.find((s) => s.setKey === activeSetKey) ?? summary[0];
        const phaseInfo =
          scorePhase === 'initial' ? setInfo.initial : setInfo.after10;
        return { member, phaseInfo };
      })
      .filter(
        (
          item
        ): item is { member: AceVivaMember; phaseInfo: PhaseDistanceDetail } =>
          Boolean(item)
      );
  }, [
    favoriteIds,
    rotatingMemberIds,
    memberMap,
    currentMatchSchedule,
    selectedZone,
    selectedSeat,
    activeSetKey,
    scorePhase,
  ]);

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

  return (
    <section
      id="seat-finder-section"
      className="relative mx-auto max-w-7xl px-3.5 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      {/* Section Heading */}
      <div className="flex flex-col justify-between gap-5 border-b border-[#212047]/10 pb-8 lg:flex-row lg:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#5BAE84]/15 px-3 py-1 font-mono-num text-[10px] font-bold tracking-[0.16em] text-[#212047] uppercase ring-1 ring-[#5BAE84]/35">
            <span className="h-2 w-2 shrink-0 rounded-full bg-[#5BAE84]" />
            <span>2F ACE 集氣區 · 23 席視角與主推距離雷達</span>
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-[#212047] sm:text-5xl">
            選擇你的區域與 1–23 號座位，查看面前女孩與離主推多遠
          </h2>
          <p className="mt-2.5 max-w-3xl text-xs leading-relaxed text-[#212047]/75 sm:text-base">
            依據官方站位公告（
            <a
              href={currentMatchSchedule.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#4FA87D] underline underline-offset-4 hover:text-[#212047]"
            >
              #OldMyCar 我的 90 年代站位表 ↗
            </a>
            ），點選你的區域（A / B / C）與座位號碼（1–23 號），系統除顯示正前方女孩外，亦會即時計算你的座位「距離主推成員差幾個座位、隔幾個區域」以及破 10 分換位後的距離變化。
          </p>
          <p className="mt-2 max-w-3xl text-[11px] font-semibold text-[#3F8E67]">
            ※ 粉絲自製免責說明：23 席視角對應與主推距離計算為粉絲依官方站位表推算之參考工具，現場實際站位、動線與名單異動請以官方實際公告為準。
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
                className={`rounded-xl px-3 py-2.5 text-center text-xs font-extrabold whitespace-nowrap transition-all duration-300 sm:rounded-full sm:px-5 ${
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
      <div className="mt-6 rounded-[1.75rem] bg-[#D5EFE9] p-1.5 ring-1 ring-[#5BAE84]/35 sm:mt-10 sm:rounded-[2rem] sm:p-2">
        <div className="rounded-[calc(1.75rem-0.375rem)] bg-white p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] sm:rounded-[calc(2rem-0.375rem)] sm:p-8">
          {/* Step 1: Select Zone (A / B / C) */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <span className="font-mono-num text-[11px] font-extrabold tracking-[0.14em] text-[#212047] uppercase sm:text-xs">
                STEP 01 · 選擇「2F ACE 集氣區」區域（A / B / C 區）
              </span>
              <span className="text-[11px] font-medium text-[#212047]/60">
                ★ 標記代表你鎖定的主推（{activeOshi.name}）本局所在區域
              </span>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-3.5">
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
                    className={`group relative flex flex-col justify-between rounded-2xl p-2.5 text-left transition-all duration-300 active:scale-[0.98] sm:p-4 ${
                      isSelected
                        ? 'bg-[#212047] text-white shadow-[0_14px_30px_-10px_rgba(33,32,71,0.4)] ring-2 ring-[#5BAE84]'
                        : 'bg-[#F4FAF8] text-[#212047] ring-1 ring-[#212047]/10 hover:bg-[#E6F5F1]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span
                        className={`rounded-full px-2 py-0.5 font-mono-num text-[9px] font-bold tracking-wider whitespace-nowrap sm:text-[10px] ${
                          isSelected
                            ? 'bg-[#5BAE84] text-white'
                            : 'bg-[#212047]/10 text-[#212047]/70'
                        }`}
                      >
                        {z.badge}
                      </span>
                      {isOshiInThisZone ? (
                        <span className="rounded-full bg-[#5BAE84] px-2 py-0.5 font-mono-num text-[9px] font-extrabold text-white whitespace-nowrap">
                          ★ 主推 {activeOshi.name} 在此
                        </span>
                      ) : (
                        <span
                          className={`hidden font-mono-num text-xs font-bold sm:inline ${
                            isSelected ? 'text-[#7ADAD0]' : 'text-[#4FA87D]'
                          }`}
                        >
                          23 席
                        </span>
                      )}
                    </div>

                    <div className="mt-2 sm:mt-3">
                      <div className="text-sm font-black whitespace-nowrap sm:hidden">
                        {z.shortTitle}
                      </div>
                      <div className="hidden text-lg font-black sm:block">
                        {z.title}
                      </div>
                      <div
                        className={`mt-0.5 hidden text-xs sm:block ${
                          isSelected ? 'text-white/70' : 'text-[#212047]/60'
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
                            className="h-6 w-6 rounded-full ring-1 ring-white sm:h-7 sm:w-7"
                          />
                        ))}
                      </div>
                      <div
                        className={`truncate text-[10px] font-bold sm:text-xs ${
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

          {/* Step 2: Select Seat Number (1 to 23) Grouped by Station */}
          <div className="mt-6 border-t border-[#212047]/10 pt-6 sm:mt-8 sm:pt-8">
            <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-mono-num text-[11px] font-extrabold tracking-[0.14em] text-[#212047] uppercase sm:text-xs">
                STEP 02 · 點選「ACE 集氣 {selectedZone} 區」座位編號（1–23 號）
              </span>
              <span className="text-[11px] font-semibold text-[#4FA87D]">
                依左、中、右 3 個站位分組，點選任一號碼即時計算與主推距離
              </span>
            </div>

            <div className="mt-3.5 grid grid-cols-1 gap-3 lg:grid-cols-3">
              {STATION_GROUPS.map((group) => {
                const isActiveStation = seatMapping.slotIndex === group.slotIndex;
                const stationGirlId = currentZoneGirlIds[group.slotIndex];
                const stationGirl = memberMap.get(stationGirlId);
                const isOshiAtThisStation =
                  stationGirl?.id === activeOshi.id;

                return (
                  <div
                    key={group.slotIndex}
                    className={`rounded-2xl p-3 transition-all ${
                      isActiveStation
                        ? 'bg-[#E6F5F1] ring-2 ring-[#5BAE84]'
                        : isOshiAtThisStation
                          ? 'bg-[#F4FAF8] ring-2 ring-[#212047]'
                          : 'bg-[#F4FAF8] ring-1 ring-[#212047]/10'
                    }`}
                  >
                    <div className="mb-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`rounded-lg px-2 py-0.5 font-mono-num text-[10px] font-extrabold whitespace-nowrap ${
                            isActiveStation
                              ? 'bg-[#212047] text-[#7ADAD0]'
                              : 'bg-[#212047]/10 text-[#212047]'
                          }`}
                        >
                          {group.rangeLabel}
                        </span>
                        <span className="text-xs font-extrabold text-[#212047] whitespace-nowrap">
                          {group.title}
                        </span>
                      </div>

                      {stationGirl && (
                        <button
                          type="button"
                          onClick={() => onOpenMemberDetail(stationGirl)}
                          className={`flex items-center gap-1.5 rounded-full py-0.5 pr-2.5 pl-1 text-[11px] font-extrabold shadow-2xs ${
                            isOshiAtThisStation
                              ? 'bg-[#5BAE84] text-white ring-1 ring-[#212047]'
                              : 'bg-white text-[#212047] ring-1 ring-[#5BAE84]/35'
                          }`}
                        >
                          <MemberPortrait
                            member={stationGirl}
                            variant="avatar"
                            className="h-5 w-5 rounded-full"
                          />
                          <span className="whitespace-nowrap">
                            {isOshiAtThisStation
                              ? `★ ${stationGirl.name}`
                              : stationGirl.name}
                          </span>
                        </button>
                      )}
                    </div>

                    <div className={`grid ${group.gridColsClass} gap-1.5`}>
                      {group.seats.map((num) => {
                        const isSelected = selectedSeat === num;
                        const isOshiCoreSeat =
                          isOshiAtThisStation &&
                          activePhaseOshiDistance?.girlCoreSeat === num;

                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setSelectedSeat(num)}
                            aria-label={`選擇 ${selectedZone} 區 ${num} 號座位`}
                            className={`relative flex flex-col items-center justify-center rounded-xl py-2 font-mono-num transition-all duration-200 active:scale-95 ${
                              isSelected
                                ? '-translate-y-0.5 bg-[#212047] text-white shadow-md ring-2 ring-[#5BAE84]'
                                : isOshiCoreSeat
                                  ? 'bg-[#5BAE84] text-white ring-2 ring-[#212047]'
                                  : isActiveStation
                                    ? 'bg-white text-[#212047] ring-1 ring-[#5BAE84]/40 hover:bg-[#5BAE84]/20'
                                    : 'bg-white/80 text-[#212047]/70 ring-1 ring-[#212047]/[0.08] hover:bg-white'
                            }`}
                          >
                            <span className="text-[9px] leading-none opacity-60">
                              {selectedZone}
                            </span>
                            <span className="mt-0.5 text-xs leading-none font-extrabold sm:text-sm">
                              {num}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 03: OSHI DISTANCE RADAR (我離主推有多遠？即時測距儀) */}
          <div className="mt-6 rounded-3xl bg-[#212047] p-4 text-white shadow-[0_20px_50px_-15px_rgba(33,32,71,0.45)] ring-2 ring-[#5BAE84] sm:mt-8 sm:p-6">
            {/* Top Header + Quick Oshi Selector Strip */}
            <div className="border-b border-white/15 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#5BAE84] px-3 py-1 font-mono-num text-[10px] font-extrabold tracking-wider text-white uppercase">
                  <span>OSHI DISTANCE RADAR · 我離主推有多遠？</span>
                </div>
                <span className="font-mono-num text-xs font-bold text-[#7ADAD0]">
                  當前座位：ACE 集氣 {selectedZone} 區 {selectedSeat} 號席
                </span>
              </div>

              <div className="mt-3">
                <div className="mb-2 flex items-center justify-between text-[11px] text-white/75">
                  <span>點選切換你想測距的主推女孩（★ 為「我的主推」收藏成員）：</span>
                </div>
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1.5 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
                  {sortedRotatingMembers.map((m) => {
                    const isTarget = m.id === activeOshi.id;
                    const isFav = favoriteIds.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setTargetOshiId(m.id)}
                        className={`flex shrink-0 items-center gap-2 rounded-full py-1 pr-3 pl-1 text-xs font-extrabold whitespace-nowrap transition-all active:scale-95 ${
                          isTarget
                            ? 'bg-[#5BAE84] text-white shadow-sm ring-2 ring-[#7ADAD0]'
                            : isFav
                              ? 'bg-white/15 text-[#7ADAD0] ring-1 ring-[#5ECBC0]/50 hover:bg-white/25'
                              : 'bg-white/[0.08] text-white/80 ring-1 ring-white/15 hover:bg-white/20'
                        }`}
                      >
                        <MemberPortrait
                          member={m}
                          variant="avatar"
                          className="h-7 w-7 shrink-0 rounded-full ring-1 ring-white/50"
                        />
                        {isFav && <span className="text-[10px]">★</span>}
                        <span className="font-mono-num text-[10px] opacity-80">
                          #{m.number}
                        </span>
                        <span>{m.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Multi-Favorite Quick Strip (When user has multiple favorites on duty) */}
              {attendingFavoritesDistances.length > 1 && (
                <div className="mt-3 rounded-2xl bg-white/[0.06] p-2.5 ring-1 ring-white/10">
                  <div className="mb-1.5 font-mono-num text-[10px] font-bold tracking-wider text-[#7ADAD0] uppercase">
                    我的主推收藏（{attendingFavoritesDistances.length} 人在場）與「{selectedZone} 區 {selectedSeat} 號席」當前距離一覽：
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {attendingFavoritesDistances.map(({ member, phaseInfo }) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => setTargetOshiId(member.id)}
                        className={`flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-xs transition-all ${
                          member.id === activeOshi.id
                            ? 'bg-[#5BAE84]/30 ring-1 ring-[#7ADAD0]'
                            : 'bg-white/[0.05] hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <MemberPortrait
                            member={member}
                            variant="avatar"
                            className="h-7 w-7 shrink-0 rounded-full"
                          />
                          <span className="font-black text-white whitespace-nowrap">
                            {member.name}
                          </span>
                          <span className="font-mono-num text-[10px] text-[#7ADAD0] whitespace-nowrap">
                            ({phaseInfo.girlZone}區{phaseInfo.girlSlotLabel.slice(0, 2)})
                          </span>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 font-mono-num text-[10px] font-extrabold whitespace-nowrap ${
                            phaseInfo.isDirectFront
                              ? 'bg-[#5BAE84] text-white'
                              : phaseInfo.isSameZone
                                ? 'bg-[#7ADAD0]/20 text-[#7ADAD0]'
                                : 'bg-white/10 text-white/75'
                          }`}
                        >
                          {phaseInfo.isDirectFront
                            ? `正對 (距C位${phaseInfo.seatsToCoreCenter}席)`
                            : phaseInfo.isSameZone
                              ? `同區差 ${phaseInfo.seatsToDirectRange} 席`
                              : `跨${phaseInfo.zoneDiff}區 (差${phaseInfo.seatsToDirectRange}席)`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Main Distance Readout for Active Oshi */}
            {activePhaseOshiDistance && otherPhaseOshiDistance && (
              <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-12">
                {/* Left 6 cols: Current Set & Phase Exact Distance Meter */}
                <div className="flex flex-col justify-between rounded-2xl bg-white/[0.08] p-4 ring-1 ring-[#5ECBC0]/30 sm:p-5 lg:col-span-6">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono-num text-[10px] font-bold tracking-wider text-[#7ADAD0] uppercase">
                        當前檢視：{currentSetArrangement.setLabel}（
                        {scorePhase === 'initial'
                          ? '開局 0–10 分'
                          : '破 10 分換位後'}
                        ）
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-mono-num text-[10px] font-extrabold ${getDistanceBadgeStyle(
                          activePhaseOshiDistance.statusLevel
                        )}`}
                      >
                        親近度 {activePhaseOshiDistance.proximityPercent}%
                      </span>
                    </div>

                    {/* Oshi Avatar + Headline Distance */}
                    <div className="mt-3.5 flex items-center gap-3.5">
                      <button
                        type="button"
                        onClick={() => onOpenMemberDetail(activeOshi)}
                        className="shrink-0 overflow-hidden rounded-2xl ring-2 ring-[#5ECBC0]"
                      >
                        <MemberPortrait
                          member={activeOshi}
                          variant="avatar"
                          className="h-16 w-16 sm:h-20 sm:w-20"
                        />
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded-md bg-[#5BAE84] px-2 py-0.5 font-mono-num text-[11px] font-extrabold text-white">
                            主推 #{activeOshi.number}
                          </span>
                          <span className="text-lg font-black text-white sm:text-xl">
                            {activeOshi.name}
                          </span>
                          <span className="rounded-md bg-white/15 px-2 py-0.5 font-mono-num text-[11px] font-bold text-[#7ADAD0]">
                            位於 {activePhaseOshiDistance.girlZone} 區 ·{' '}
                            {activePhaseOshiDistance.girlSlotLabel.slice(0, 2)}（
                            {activePhaseOshiDistance.girlSeatRange[0]}–
                            {activePhaseOshiDistance.girlSeatRange[1]}號）
                          </span>
                        </div>

                        <div className="mt-1.5 text-base font-black text-[#5ECBC0] sm:text-lg">
                          {activePhaseOshiDistance.headlineDistanceText}
                        </div>
                      </div>
                    </div>

                    {/* 3 Quantitative Distance Metrics */}
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl bg-[#212047]/80 p-2.5 ring-1 ring-white/10">
                        <div className="font-mono-num text-[10px] text-white/60">
                          跨區距離
                        </div>
                        <div className="mt-0.5 font-mono-num text-sm font-black text-white sm:text-base">
                          {activePhaseOshiDistance.isSameZone
                            ? '同區 (0 區)'
                            : `跨 ${activePhaseOshiDistance.zoneDiff} 區`}
                        </div>
                        <div className="text-[10px] text-[#7ADAD0]">
                          {activePhaseOshiDistance.directionText}
                        </div>
                      </div>

                      <div className="rounded-xl bg-[#212047]/80 p-2.5 ring-1 ring-white/10">
                        <div className="font-mono-num text-[10px] text-white/60">
                          距正對範圍邊界
                        </div>
                        <div className="mt-0.5 font-mono-num text-sm font-black text-[#5ECBC0] sm:text-base">
                          {activePhaseOshiDistance.seatsToDirectRange === 0
                            ? '0 席 (正對內)'
                            : `差 ${activePhaseOshiDistance.seatsToDirectRange} 席`}
                        </div>
                        <div className="text-[10px] text-white/65">
                          正對 {activePhaseOshiDistance.girlSeatRange[0]}–
                          {activePhaseOshiDistance.girlSeatRange[1]} 號
                        </div>
                      </div>

                      <div className="rounded-xl bg-[#212047]/80 p-2.5 ring-1 ring-white/10">
                        <div className="font-mono-num text-[10px] text-white/60">
                          距她 C 位中心
                        </div>
                        <div className="mt-0.5 font-mono-num text-sm font-black text-white sm:text-base">
                          {activePhaseOshiDistance.seatsToCoreCenter === 0
                            ? '0 席 (正C位)'
                            : `差 ${activePhaseOshiDistance.seatsToCoreCenter} 席`}
                        </div>
                        <div className="text-[10px] text-white/65">
                          C 位：{activePhaseOshiDistance.girlZone} 區{' '}
                          {activePhaseOshiDistance.girlCoreSeatLabel}
                        </div>
                      </div>
                    </div>

                    {/* Visual Proximity Progress Bar */}
                    <div className="mt-3.5">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#5BAE84] to-[#5ECBC0] transition-all duration-500"
                          style={{
                            width: `${activePhaseOshiDistance.proximityPercent}%`,
                          }}
                        />
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-white/80">
                        {activePhaseOshiDistance.detailDescription}
                      </p>
                    </div>
                  </div>

                  {/* Same-Set Score Rotation Preview + One-Tap Jump to Oshi Core Seat */}
                  <div className="mt-4 flex flex-col gap-2.5 border-t border-white/15 pt-3.5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs text-[#7ADAD0]">
                      <strong className="font-bold text-white">
                        {scorePhase === 'initial'
                          ? '破 10 分換位後預告：'
                          : '開局 0–10 分位置：'}
                      </strong>
                      移至 {otherPhaseOshiDistance.girlZone} 區
                      {otherPhaseOshiDistance.girlSlotLabel.slice(0, 2)}（
                      {otherPhaseOshiDistance.isDirectFront
                        ? `★ 將直接走到你正前方！距 C 位 ${otherPhaseOshiDistance.seatsToCoreCenter} 席`
                        : otherPhaseOshiDistance.isSameZone
                          ? `同區差 ${otherPhaseOshiDistance.seatsToDirectRange} 席`
                          : `跨 ${otherPhaseOshiDistance.zoneDiff} 區`}
                      ）
                    </div>

                    {(!activePhaseOshiDistance.isExactCore ||
                      selectedZone !== activePhaseOshiDistance.girlZone) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedZone(activePhaseOshiDistance.girlZone);
                          setSelectedSeat(activePhaseOshiDistance.girlCoreSeat);
                        }}
                        className="shrink-0 rounded-full bg-[#5BAE84] px-3.5 py-1.5 text-xs font-extrabold text-white shadow-xs transition-colors hover:bg-[#4FA87D] active:scale-95"
                      >
                        移至她本階段 C 位（{activePhaseOshiDistance.girlZone} 區{' '}
                        {activePhaseOshiDistance.girlCoreSeat} 號）→
                      </button>
                    )}
                  </div>
                </div>

                {/* Right 6 cols: All 3 Set Groups Distance Breakdown for Your Selected Seat */}
                <div className="flex flex-col justify-between rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/15 sm:p-5 lg:col-span-6">
                  <div>
                    <div className="font-mono-num text-[10px] font-bold tracking-wider text-[#7ADAD0] uppercase">
                      FULL MATCH DISTANCE TABLE · 坐在「{selectedZone} 區{' '}
                      {selectedSeat} 號席」整場五局與 {activeOshi.name} 的距離變化
                    </div>

                    <div className="mt-3 space-y-2.5">
                      {oshiDistanceSummary.map((setComp) => {
                        const isCurrentSet = setComp.setKey === activeSetKey;
                        const isSameZoneSet = setComp.initial.isSameZone;

                        return (
                          <div
                            key={setComp.setKey}
                            onClick={() => setActiveSetKey(setComp.setKey)}
                            className={`cursor-pointer rounded-xl p-3 transition-all ${
                              isSameZoneSet
                                ? 'bg-[#5BAE84]/25 ring-2 ring-[#5ECBC0]'
                                : isCurrentSet
                                  ? 'bg-white/15 ring-1 ring-white/30'
                                  : 'bg-white/[0.05] ring-1 ring-white/10 hover:bg-white/10'
                            }`}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="rounded-md bg-[#212047] px-2 py-0.5 font-mono-num text-[11px] font-extrabold text-[#7ADAD0]">
                                  {setComp.setShortLabel}
                                </span>
                                <span className="text-xs font-extrabold text-white">
                                  {activeOshi.name} 在{' '}
                                  {setComp.initial.girlZone} 區
                                </span>
                              </div>

                              <span
                                className={`rounded-full px-2.5 py-0.5 font-mono-num text-[10px] font-extrabold ${
                                  isSameZoneSet
                                    ? 'bg-[#5BAE84] text-white'
                                    : 'bg-white/15 text-white/75'
                                }`}
                              >
                                {isSameZoneSet
                                  ? `★ 本局來到你的 ${selectedZone} 區！`
                                  : `跨 ${setComp.initial.zoneDiff} 區（相隔約 ${setComp.initial.seatsToDirectRange} 席）`}
                              </span>
                            </div>

                            <div className="mt-2 grid grid-cols-1 gap-1.5 text-xs sm:grid-cols-2">
                              <div
                                className={`rounded-lg px-2.5 py-1.5 font-mono-num text-[11px] ${
                                  setComp.initial.isDirectFront
                                    ? 'bg-[#5BAE84] font-extrabold text-white'
                                    : 'bg-[#212047]/65 text-white/85'
                                }`}
                              >
                                <div>
                                  0–10分：{setComp.initial.girlZone}區
                                  {setComp.initial.girlSlotLabel.slice(0, 2)}（
                                  {setComp.initial.girlSeatRange[0]}–
                                  {setComp.initial.girlSeatRange[1]}號）
                                </div>
                                <div className="mt-0.5 text-[10px] text-[#7ADAD0]">
                                  {setComp.initial.isDirectFront
                                    ? `★ 正對你（距 C 位 ${setComp.initial.seatsToCoreCenter} 席）`
                                    : setComp.initial.isSameZone
                                      ? `同區差 ${setComp.initial.seatsToDirectRange} 席（距 C 位 ${setComp.initial.seatsToCoreCenter} 席）`
                                      : `距你約 ${setComp.initial.globalSeatDistance} 席身位`}
                                </div>
                              </div>

                              <div
                                className={`rounded-lg px-2.5 py-1.5 font-mono-num text-[11px] ${
                                  setComp.after10.isDirectFront
                                    ? 'bg-[#5BAE84] font-extrabold text-white'
                                    : 'bg-[#212047]/65 text-white/85'
                                }`}
                              >
                                <div>
                                  破10分：{setComp.after10.girlZone}區
                                  {setComp.after10.girlSlotLabel.slice(0, 2)}（
                                  {setComp.after10.girlSeatRange[0]}–
                                  {setComp.after10.girlSeatRange[1]}號）
                                </div>
                                <div className="mt-0.5 text-[10px] text-[#7ADAD0]">
                                  {setComp.after10.isDirectFront
                                    ? `★ 正對你（距 C 位 ${setComp.after10.seatsToCoreCenter} 席）`
                                    : setComp.after10.isSameZone
                                      ? `同區差 ${setComp.after10.seatsToDirectRange} 席（距 C 位 ${setComp.after10.seatsToCoreCenter} 席）`
                                      : `距你約 ${setComp.after10.globalSeatDistance} 席身位`}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-3 text-[11px] text-white/70">
                    提示：點選任一局數卡片可立即切換下方舞台模擬視角。
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Live Stage & Front Girl Spotlight */}
          <div className="mt-6 grid grid-cols-1 gap-5 border-t border-[#212047]/10 pt-6 lg:mt-8 lg:grid-cols-12 lg:gap-6 lg:pt-8">
            {/* Left 5 cols: Your Exact Seat Summary & Direct Front Girl */}
            <div className="flex flex-col justify-between rounded-3xl bg-[#212047] p-5 text-white sm:p-6 lg:col-span-5">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-[#5BAE84] px-3 py-0.5 font-mono-num text-[10px] font-extrabold tracking-wider text-white uppercase whitespace-nowrap">
                    YOUR SEAT VIEW · 專屬座位視角
                  </span>
                  <span className="font-mono-num text-xs font-bold text-[#7ADAD0] whitespace-nowrap">
                    {currentMatchSchedule.dateLabel}
                  </span>
                </div>

                <div className="mt-3.5 flex flex-wrap items-baseline gap-2.5">
                  <span className="text-2xl font-black text-white whitespace-nowrap sm:text-4xl">
                    ACE 集氣 {selectedZone} 區
                  </span>
                  <span className="font-editorial text-3xl font-bold text-[#5ECBC0] italic whitespace-nowrap sm:text-4xl">
                    第 {selectedSeat} 號席
                  </span>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-white/75">
                  {seatMapping.viewAngleNote}
                </p>

                {/* Highlighted Direct Front Member Card (Face-Focused Avatar) */}
                {directFrontMember && (
                  <div className="mt-4 rounded-2xl border border-[#5ECBC0]/30 bg-white/10 p-3.5 sm:mt-5 sm:p-4">
                    <div className="font-mono-num text-[10px] font-bold tracking-[0.14em] text-[#7ADAD0] uppercase">
                      DIRECTLY IN FRONT · 當前局數正前方女孩
                    </div>
                    <div className="mt-3 flex items-center gap-3.5">
                      <button
                        type="button"
                        onClick={() => onOpenMemberDetail(directFrontMember)}
                        className="shrink-0 overflow-hidden rounded-2xl ring-2 ring-[#5ECBC0]"
                      >
                        <MemberPortrait
                          member={directFrontMember}
                          variant="avatar"
                          className="h-20 w-20"
                        />
                      </button>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-[#5BAE84] px-2 py-0.5 font-mono-num text-xs font-extrabold text-white">
                            #{directFrontMember.number}
                          </span>
                          <span className="text-xl font-black text-white whitespace-nowrap">
                            {directFrontMember.name}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-white/75">
                          {directFrontMember.tagline}
                        </p>
                        <div className="mt-2.5 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenMemberDetail(directFrontMember)}
                            className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#212047] whitespace-nowrap hover:bg-[#7ADAD0]"
                          >
                            個人檔案 →
                          </button>
                          <a
                            href={directFrontMember.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono-num text-[11px] text-[#7ADAD0] hover:underline"
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
              <div className="mt-5 border-t border-white/15 pt-4">
                <div className="font-mono-num text-[10px] font-bold tracking-[0.12em] text-[#7ADAD0] uppercase">
                  整場 5 局會輪流站到你「正前方（{seatMapping.slotName}）」的 6 位女孩：
                </div>
                <div className="mt-2.5 grid grid-cols-3 gap-1.5 sm:flex sm:flex-wrap">
                  {allMatchZoneVisitors.directSeatMembers.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => onOpenMemberDetail(m)}
                      className="flex items-center gap-1.5 rounded-full bg-white/10 py-1 pr-2.5 pl-1 text-xs font-bold text-white ring-1 ring-white/20 transition-colors hover:bg-[#5BAE84]"
                    >
                      <MemberPortrait
                        member={m}
                        variant="avatar"
                        className="h-6 w-6 shrink-0 rounded-full"
                      />
                      <span className="truncate">{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 7 cols: Interactive Set & 10-Point Score Switcher + 3 Girl Station Stage */}
            <div className="flex flex-col justify-between rounded-3xl bg-[#F4FAF8] p-4 ring-1 ring-[#5BAE84]/30 sm:p-6 lg:col-span-7">
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
                          className={`rounded-xl px-2.5 py-2 text-center text-xs font-extrabold whitespace-nowrap transition-all sm:rounded-full sm:px-4 sm:py-1.5 ${
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
                      className={`rounded-full px-3 py-1.5 text-center text-[11px] font-bold whitespace-nowrap transition-all ${
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
                      className={`rounded-full px-3 py-1.5 text-center text-[11px] font-bold whitespace-nowrap transition-all ${
                        scorePhase === 'after10'
                          ? 'bg-[#212047] text-[#7ADAD0] shadow-xs'
                          : 'text-[#212047]/75 hover:text-[#212047]'
                      }`}
                    >
                      破 10 分換位後
                    </button>
                  </div>
                </div>

                {/* 3 Station Positions in Current Zone (Face-Focused on Mobile) */}
                <div className="mt-4 sm:mt-5">
                  <div className="font-mono-num text-[11px] font-bold tracking-[0.12em] text-[#212047]/70 uppercase">
                    ACE 集氣 {selectedZone} 區 · {currentSetArrangement.setLabel}（
                    {scorePhase === 'initial'
                      ? '開局 0–10 分'
                      : '連莊得分破 10 分換位'}
                    ）面前 3 位女孩站位
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-4">
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
                          className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl p-2 transition-all duration-500 sm:p-2.5 ${
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
                                className={`truncate rounded-full px-1.5 py-0.5 font-mono-num text-[9px] font-extrabold sm:px-2 ${
                                  isDirectFront
                                    ? 'bg-[#5BAE84] text-white'
                                    : 'bg-[#E6F5F1] text-[#3F8E67]'
                                }`}
                              >
                                {isDirectFront
                                  ? `★ 正對 (${selectedSeat}號)`
                                  : isAdjacent
                                    ? '鄰近視角'
                                    : slotMeta.seats}
                              </span>
                              <span className="hidden font-mono-num text-[10px] font-bold opacity-70 sm:inline">
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
                            <div className="text-xs font-black whitespace-nowrap sm:text-base">
                              {m.name}
                            </div>
                            <div
                              className={`mt-0.5 text-[10px] font-medium whitespace-nowrap ${
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

              {/* Court & Player Bench Orientation Bar */}
              <div className="mt-4 rounded-xl bg-[#5BAE84]/15 px-3 py-2 text-center text-[11px] font-bold text-[#212047] ring-1 ring-[#5BAE84]/30 sm:mt-5 sm:px-4 sm:py-2.5 sm:text-xs">
                ⬇ 前方為 1F 球員席與中央球場（開場舞於右側精武區前、中場演出於左側力行區前） ⬇
              </div>
            </div>
          </div>

          {/* Complete 5-Set Timeline Matrix for the Selected Zone & Seat */}
          <div className="mt-6 border-t border-[#212047]/10 pt-6 sm:mt-8 sm:pt-8">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="font-mono-num text-xs font-extrabold tracking-[0.14em] text-[#212047] uppercase">
                ALL 5 SETS TIMELINE · 「ACE 集氣 {selectedZone} 區 — 第{' '}
                {selectedSeat} 號席」整場五局完整輪換班表
              </span>
              <span className="text-[11px] font-semibold text-[#4FA87D]">
                綠底／深藍底星號（★）為該局正對你第 {selectedSeat} 號座位的女孩
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
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
                    className="rounded-2xl bg-[#F4FAF8] p-3.5 ring-1 ring-[#5BAE84]/30 sm:p-4"
                  >
                    <div className="flex items-center justify-between border-b border-[#212047]/10 pb-2.5">
                      <span className="text-sm font-black text-[#212047]">
                        {s.setLabel}
                      </span>
                      <span className="rounded-full bg-[#212047] px-2.5 py-0.5 font-mono-num text-[10px] font-bold text-[#7ADAD0]">
                        {selectedZone} 區班表
                      </span>
                    </div>

                    {/* Phase 1: 0-10 points */}
                    <div className="mt-3">
                      <div className="font-mono-num text-[10px] font-bold text-[#212047]/65">
                        【開局 0–10 分】左位 → 中位 → 右位
                      </div>
                      <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                        {initGirls.map((g, idx) => {
                          const isMine = idx === seatMapping.slotIndex;
                          return (
                            <button
                              key={`init-${g.id}`}
                              type="button"
                              onClick={() => onOpenMemberDetail(g)}
                              className={`flex flex-col items-center rounded-xl p-2 text-center transition-colors ${
                                isMine
                                  ? 'bg-[#5BAE84] text-white shadow-xs ring-2 ring-[#212047]'
                                  : 'bg-white text-[#212047] ring-1 ring-[#212047]/10 hover:bg-[#E6F5F1]'
                              }`}
                            >
                              <span className="font-mono-num text-[9px] whitespace-nowrap opacity-75">
                                {idx === 0
                                  ? '左 1–8號'
                                  : idx === 1
                                    ? '中 9–15號'
                                    : '右 16–23號'}
                              </span>
                              <MemberPortrait
                                member={g}
                                variant="avatar"
                                className="mt-1.5 h-10 w-10 rounded-full ring-1 ring-white/50"
                              />
                              <span className="mt-1 text-xs font-extrabold whitespace-nowrap">
                                {isMine ? `★ ${g.name}` : g.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Phase 2: >10 points */}
                    <div className="mt-3">
                      <div className="font-mono-num text-[10px] font-bold text-[#3F8E67]">
                        【連莊破 10 分換位後】左位 → 中位 → 右位
                      </div>
                      <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                        {after10Girls.map((g, idx) => {
                          const isMine = idx === seatMapping.slotIndex;
                          return (
                            <button
                              key={`after10-${g.id}`}
                              type="button"
                              onClick={() => onOpenMemberDetail(g)}
                              className={`flex flex-col items-center rounded-xl p-2 text-center transition-colors ${
                                isMine
                                  ? 'bg-[#212047] text-[#7ADAD0] shadow-xs ring-2 ring-[#5BAE84]'
                                  : 'bg-white text-[#212047] ring-1 ring-[#212047]/10 hover:bg-[#E6F5F1]'
                              }`}
                            >
                              <span className="font-mono-num text-[9px] whitespace-nowrap opacity-75">
                                {idx === 0
                                  ? '左 1–8號'
                                  : idx === 1
                                    ? '中 9–15號'
                                    : '右 16–23號'}
                              </span>
                              <MemberPortrait
                                member={g}
                                variant="avatar"
                                className="mt-1.5 h-10 w-10 rounded-full ring-1 ring-white/40"
                              />
                              <span className="mt-1 text-xs font-extrabold whitespace-nowrap">
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
