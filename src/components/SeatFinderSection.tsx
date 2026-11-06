import React, { useMemo, useState } from 'react';
import { MEMBERS, type AceVivaMember } from '../data/members';
import {
  STATION_ROTATION_SCHEDULES,
  getSeatPositionMapping,
  type AceZoneId,
} from '../data/schedule';
import { MemberPortrait } from './MemberPortrait';

interface SeatFinderSectionProps {
  externalSelection?: {
    matchId: string;
    zone: AceZoneId;
    seat: number;
    timestamp: number;
  } | null;
  onOpenMemberDetail: (member: AceVivaMember) => void;
}

const ZONES: { id: AceZoneId; title: string; subtitle: string; badge: string }[] = [
  {
    id: 'A',
    title: '2F ACE 集氣 A 區',
    subtitle: '面向球場左側看台 · 1–23 號席位',
    badge: 'ZONE A',
  },
  {
    id: 'B',
    title: '2F ACE 集氣 B 區',
    subtitle: '面向球場正中央看台 · 1–23 號席位',
    badge: 'ZONE B',
  },
  {
    id: 'C',
    title: '2F ACE 集氣 C 區',
    subtitle: '面向球場右側看台 · 1–23 號席位',
    badge: 'ZONE C',
  },
];

const SEAT_NUMBERS = Array.from({ length: 23 }, (_, i) => i + 1);

export const SeatFinderSection: React.FC<SeatFinderSectionProps> = ({
  externalSelection,
  onOpenMemberDetail,
}) => {
  const [selectedMatchId, setSelectedMatchId] = useState<string>('2026-11-07');
  const [selectedZone, setSelectedZone] = useState<AceZoneId>('B');
  const [selectedSeat, setSelectedSeat] = useState<number>(12);
  const [activeSetKey, setActiveSetKey] = useState<'set1_4' | 'set2_5' | 'set3'>('set1_4');
  const [scorePhase, setScorePhase] = useState<'initial' | 'after10'>('initial');

  React.useEffect(() => {
    if (!externalSelection) return;
    setSelectedMatchId(externalSelection.matchId);
    setSelectedZone(externalSelection.zone);
    setSelectedSeat(externalSelection.seat);
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

  const directFrontMember = memberMap.get(currentZoneGirlIds[seatMapping.slotIndex]);

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
      className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8"
    >
      {/* Section Heading */}
      <div className="flex flex-col justify-between gap-6 border-b border-[#212047]/10 pb-10 lg:flex-row lg:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#5BAE84]/15 px-3.5 py-1 font-mono-num text-[10px] font-bold tracking-[0.2em] text-[#212047] uppercase ring-1 ring-[#5BAE84]/35">
            <span className="h-2 w-2 rounded-full bg-[#5BAE84]" />
            INTERACTIVE SEAT &amp; STATION FINDER · 2F ACE 集氣區視角模擬器
          </div>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-[#212047] sm:text-5xl">
            選擇你的區域與 1–23 號座位，查看面前的應援女孩
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#212047]/75 sm:text-base">
            依據官方站位公告（
            <a
              href={currentMatchSchedule.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#4FA87D] underline underline-offset-4 hover:text-[#212047]"
            >
              #OldMyCar 我的 90 年代站位表 ↗
            </a>
            ），比賽期間女孩們將於「2F ACE 集氣區」A、B、C 三區輪流應援，每區設有 23 個座位並配置左、中、右 3 個女孩站位；每當連莊單局得分超過 10 分將於區內輪換站位，每局結束後則進行跨區大輪換。
          </p>
        </div>

        {/* Date Switcher */}
        <div className="flex items-center gap-2 self-start rounded-full bg-[#D5EFE9] p-1.5 ring-1 ring-[#5BAE84]/35 lg:self-end">
          {STATION_ROTATION_SCHEDULES.map((sched) => {
            const isActive = sched.matchId === selectedMatchId;
            return (
              <button
                key={sched.matchId}
                type="button"
                onClick={() => setSelectedMatchId(sched.matchId)}
                className={`rounded-full px-5 py-2.5 text-xs font-extrabold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] ${
                  isActive
                    ? 'bg-[#212047] text-white shadow-sm'
                    : 'text-[#212047]/75 hover:bg-white/60 hover:text-[#212047]'
                }`}
              >
                {sched.dateLabel} vs {sched.opponent}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 1 & Step 2 Control Console (Double-Bezel Container) */}
      <div className="mt-10 rounded-[2rem] bg-[#D5EFE9] p-1.5 ring-1 ring-[#5BAE84]/35 sm:p-2">
        <div className="rounded-[calc(2rem-0.375rem)] bg-white p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] sm:p-8">
          {/* Step 1: Select Zone (A / B / C) */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono-num text-xs font-extrabold tracking-[0.18em] text-[#212047] uppercase">
                STEP 01 · 選擇你的「2F ACE 集氣區」區域（A / B / C 區）
              </span>
              <span className="text-xs font-medium text-[#212047]/60">
                位於 1F 球員席正後方二樓看台，共分為左（A）、中（B）、右（C）三區
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
              {ZONES.map((z) => {
                const isSelected = selectedZone === z.id;
                const trioIds =
                  scorePhase === 'initial'
                    ? currentSetArrangement.initial[z.id]
                    : currentSetArrangement.after10Points[z.id];
                const trioNames = trioIds
                  .map((id) => memberMap.get(id)?.name ?? id)
                  .join(' · ');

                return (
                  <button
                    key={z.id}
                    type="button"
                    onClick={() => setSelectedZone(z.id)}
                    className={`group flex flex-col justify-between rounded-2xl p-4 text-left transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] ${
                      isSelected
                        ? 'bg-[#212047] text-white shadow-[0_16px_36px_-10px_rgba(33,32,71,0.4)] ring-2 ring-[#5BAE84]'
                        : 'bg-[#F4FAF8] text-[#212047] ring-1 ring-[#212047]/10 hover:bg-[#E6F5F1]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-mono-num text-[10px] font-bold tracking-[0.18em] ${
                          isSelected
                            ? 'bg-[#5BAE84] text-white'
                            : 'bg-[#212047]/10 text-[#212047]/70'
                        }`}
                      >
                        {z.badge}
                      </span>
                      <span
                        className={`font-mono-num text-xs font-bold ${
                          isSelected ? 'text-[#7ADAD0]' : 'text-[#4FA87D]'
                        }`}
                      >
                        23 SEATS
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="text-lg font-black">{z.title}</div>
                      <div
                        className={`mt-0.5 text-xs ${
                          isSelected ? 'text-white/70' : 'text-[#212047]/60'
                        }`}
                      >
                        {z.subtitle}
                      </div>
                    </div>
                    <div
                      className={`mt-3 border-t pt-2.5 text-xs font-semibold ${
                        isSelected
                          ? 'border-white/15 text-[#7ADAD0]'
                          : 'border-[#212047]/10 text-[#3F8E67]'
                      }`}
                    >
                      當前局數站位：{trioNames}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Select Seat Number (1 to 23) */}
          <div className="mt-8 border-t border-[#212047]/10 pt-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono-num text-xs font-extrabold tracking-[0.18em] text-[#212047] uppercase">
                STEP 02 · 點選你在「ACE 集氣 {selectedZone} 區」的座位編號（1 號 – 23 號）
              </span>
              <div className="flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 font-semibold text-[#212047]/70">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#212047]" />
                  1–8 號：左位視角
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-[#212047]/70">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#5BAE84]" />
                  9–15 號：中位視角
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-[#212047]/70">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#5D99CE]" />
                  16–23 號：右位視角
                </span>
              </div>
            </div>

            {/* 23 Seat Interactive Row */}
            <div className="mt-4 overflow-x-auto pb-2">
              <div className="grid min-w-[680px] grid-cols-23 gap-1.5">
                {SEAT_NUMBERS.map((num) => {
                  const isSelected = selectedSeat === num;
                  const group = num <= 8 ? 'left' : num <= 15 ? 'center' : 'right';
                  const isSameSlot =
                    (group === 'left' && seatMapping.slotIndex === 0) ||
                    (group === 'center' && seatMapping.slotIndex === 1) ||
                    (group === 'right' && seatMapping.slotIndex === 2);

                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setSelectedSeat(num)}
                      aria-label={`選擇 ${selectedZone} 區 ${num} 號座位`}
                      className={`flex flex-col items-center justify-center rounded-xl py-2.5 font-mono-num transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-95 ${
                        isSelected
                          ? ' -translate-y-1 bg-[#212047] text-white shadow-md ring-2 ring-[#5BAE84]'
                          : isSameSlot
                            ? 'bg-[#E6F5F1] text-[#212047] ring-1 ring-[#5BAE84]/40 hover:bg-[#5BAE84]/25'
                            : 'bg-[#F4FAF8] text-[#212047]/65 ring-1 ring-[#212047]/[0.08] hover:bg-[#E6F5F1]'
                      }`}
                    >
                      <span className="text-[9px] opacity-60">{selectedZone}</span>
                      <span className="text-xs font-extrabold">{num}</span>
                    </button>
                  );
                })}
              </div>

              {/* 3 Station Brackets Indicator directly below the 23 seats */}
              <div className="mt-2 grid min-w-[680px] grid-cols-23 gap-1.5 text-center">
                <div
                  className={`col-span-8 rounded-lg py-1 text-[11px] font-bold transition-colors ${
                    seatMapping.slotIndex === 0
                      ? 'bg-[#212047] text-[#7ADAD0]'
                      : 'bg-[#212047]/[0.06] text-[#212047]/65'
                  }`}
                >
                  ▲ 左位（站位 1）：對應 1–8 號座位
                </div>
                <div
                  className={`col-span-7 rounded-lg py-1 text-[11px] font-bold transition-colors ${
                    seatMapping.slotIndex === 1
                      ? 'bg-[#5BAE84] text-white'
                      : 'bg-[#5BAE84]/15 text-[#212047]/75'
                  }`}
                >
                  ▲ 中位（站位 2）：對應 9–15 號座位
                </div>
                <div
                  className={`col-span-8 rounded-lg py-1 text-[11px] font-bold transition-colors ${
                    seatMapping.slotIndex === 2
                      ? 'bg-[#212047] text-[#7ADAD0]'
                      : 'bg-[#212047]/[0.06] text-[#212047]/65'
                  }`}
                >
                  ▲ 右位（站位 3）：對應 16–23 號座位
                </div>
              </div>
            </div>
          </div>

          {/* Live Stage & Front Girl Spotlight */}
          <div className="mt-8 grid grid-cols-1 gap-6 border-t border-[#212047]/10 pt-8 lg:grid-cols-12">
            {/* Left 5 cols: Your Exact Seat Summary & Direct Front Girl */}
            <div className="flex flex-col justify-between rounded-3xl bg-[#212047] p-6 text-white lg:col-span-5">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-[#5BAE84] px-3 py-0.5 font-mono-num text-[10px] font-extrabold tracking-[0.18em] text-white uppercase">
                    YOUR SEAT VIEW · 專屬座位視角
                  </span>
                  <span className="font-mono-num text-xs text-[#7ADAD0]">
                    {currentMatchSchedule.dateLabel}
                  </span>
                </div>

                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-3xl font-black text-white sm:text-4xl">
                    ACE 集氣 {selectedZone} 區
                  </span>
                  <span className="font-editorial text-4xl font-bold text-[#5ECBC0] italic">
                    第 {selectedSeat} 號席
                  </span>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-white/75">
                  {seatMapping.viewAngleNote}
                </p>

                {/* Highlighted Direct Front Member Card */}
                {directFrontMember && (
                  <div className="mt-5 rounded-2xl border border-[#5ECBC0]/30 bg-white/10 p-4">
                    <div className="font-mono-num text-[10px] font-bold tracking-[0.18em] text-[#7ADAD0] uppercase">
                      DIRECTLY IN FRONT OF YOU · 當前局數正前方女孩
                    </div>
                    <div className="mt-3 flex items-center gap-4">
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
                          <span className="text-xl font-black text-white">
                            {directFrontMember.name}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-white/75">
                          {directFrontMember.tagline}
                        </p>
                        <div className="mt-2.5 flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenMemberDetail(directFrontMember)}
                            className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#212047] hover:bg-[#7ADAD0]"
                          >
                            檢視個人檔案 →
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
              <div className="mt-6 border-t border-white/15 pt-4">
                <div className="font-mono-num text-[10px] font-bold tracking-[0.18em] text-[#7ADAD0] uppercase">
                  FULL MATCH SUMMARY · 整場 5 局會輪流站到你「正前方（{seatMapping.slotName}）」的 6 位女孩
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
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
                        className="h-5 w-5 rounded-full"
                      />
                      <span>{m.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 7 cols: Interactive Set & 10-Point Score Switcher + 3 Girl Station Stage */}
            <div className="flex flex-col justify-between rounded-3xl bg-[#F4FAF8] p-6 ring-1 ring-[#5BAE84]/30 lg:col-span-7">
              <div>
                {/* Set & Score Phase Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#212047]/10 pb-4">
                  <div className="flex flex-wrap gap-1.5">
                    {currentMatchSchedule.sets.map((s) => {
                      const isActive = s.setKey === activeSetKey;
                      return (
                        <button
                          key={s.setKey}
                          type="button"
                          onClick={() => setActiveSetKey(s.setKey)}
                          className={`rounded-full px-4 py-1.5 text-xs font-extrabold transition-all ${
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
                  <div className="flex items-center gap-1 rounded-full bg-[#D5EFE9] p-1 ring-1 ring-[#5BAE84]/30">
                    <button
                      type="button"
                      onClick={() => setScorePhase('initial')}
                      className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
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
                      className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
                        scorePhase === 'after10'
                          ? 'bg-[#212047] text-[#7ADAD0] shadow-xs'
                          : 'text-[#212047]/75 hover:text-[#212047]'
                      }`}
                    >
                      主隊破 10 分換位後
                    </button>
                  </div>
                </div>

                {/* 3 Station Positions in Current Zone */}
                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono-num text-[11px] font-bold tracking-[0.16em] text-[#212047]/65 uppercase">
                      ACE 集氣 {selectedZone} 區 · {currentSetArrangement.setLabel}（
                      {scorePhase === 'initial' ? '開局 0–10 分' : '連莊得分超過 10 分換位'}
                      ）面前 3 位女孩站位
                    </span>
                  </div>

                  <div className="mt-3.5 grid grid-cols-3 gap-3 sm:gap-4">
                    {([0, 1, 2] as const).map((slotIdx) => {
                      const memberId = currentZoneGirlIds[slotIdx];
                      const m = memberMap.get(memberId);
                      if (!m) return null;

                      const isDirectFront = seatMapping.slotIndex === slotIdx;
                      const isAdjacent = seatMapping.adjacentSlotIndex === slotIdx;
                      const slotMeta =
                        slotIdx === 0
                          ? { label: '左位（1–8 號前）', seats: '1–8 號' }
                          : slotIdx === 1
                            ? { label: '中位（9–15 號前）', seats: '9–15 號' }
                            : { label: '右位（16–23 號前）', seats: '16–23 號' };

                      return (
                        <div
                          key={`${slotIdx}-${m.id}`}
                          className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl p-2.5 transition-all duration-500 ${
                            isDirectFront
                              ? 'bg-[#212047] text-white shadow-[0_18px_38px_-12px_rgba(33,32,71,0.45)] ring-2 ring-[#5BAE84]'
                              : isAdjacent
                                ? 'bg-white text-[#212047] ring-2 ring-[#5ECBC0]'
                                : 'bg-white/80 text-[#212047] ring-1 ring-[#212047]/10'
                          }`}
                        >
                          <div>
                            <div className="mb-2 flex items-center justify-between gap-1">
                              <span
                                className={`rounded-full px-2 py-0.5 font-mono-num text-[9px] font-extrabold ${
                                  isDirectFront
                                    ? 'bg-[#5BAE84] text-white'
                                    : 'bg-[#E6F5F1] text-[#3F8E67]'
                                }`}
                              >
                                {isDirectFront
                                  ? `★ 正對你 (${selectedSeat} 號)`
                                  : isAdjacent
                                    ? '鄰近視角'
                                    : slotMeta.seats}
                              </span>
                              <span className="font-mono-num text-[10px] font-bold opacity-70">
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
                                variant="card"
                                className="aspect-[3/4] w-full"
                              />
                            </button>
                          </div>

                          <div className="mt-2.5 text-center">
                            <div className="text-sm font-black sm:text-base">
                              {m.name}
                            </div>
                            <div
                              className={`text-[10px] font-medium ${
                                isDirectFront ? 'text-[#7ADAD0]' : 'text-[#212047]/55'
                              }`}
                            >
                              {slotMeta.label}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Court & Player Bench Orientation Bar */}
              <div className="mt-5 rounded-xl bg-[#5BAE84]/15 px-4 py-2.5 text-center text-xs font-bold text-[#212047] ring-1 ring-[#5BAE84]/30">
                ⬇ 前方為 1F 球員席與中央比賽球場（開場舞於右側 1F 猛虎精武區前、中場演出於左側 1F 猛虎力行區前） ⬇
              </div>
            </div>
          </div>

          {/* Complete 5-Set Timeline Matrix for the Selected Zone & Seat */}
          <div className="mt-8 border-t border-[#212047]/10 pt-8">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono-num text-xs font-extrabold tracking-[0.18em] text-[#212047] uppercase">
                ALL 5 SETS TIMELINE · 「ACE 集氣 {selectedZone} 區 — 第 {selectedSeat} 號席」整場五局完整輪換時刻表
              </span>
              <span className="text-xs font-semibold text-[#4FA87D]">
                綠底星號（★）標示該局正站在你第 {selectedSeat} 號座位正前方的女孩
              </span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              {currentMatchSchedule.sets.map((s) => {
                const initGirls = s.initial[selectedZone].map((id) => memberMap.get(id)!);
                const after10Girls = s.after10Points[selectedZone].map(
                  (id) => memberMap.get(id)!
                );

                return (
                  <div
                    key={s.setKey}
                    className="rounded-2xl bg-[#F4FAF8] p-4 ring-1 ring-[#5BAE84]/30"
                  >
                    <div className="flex items-center justify-between border-b border-[#212047]/10 pb-2.5">
                      <span className="text-sm font-black text-[#212047]">
                        {s.setLabel}
                      </span>
                      <span className="rounded-full bg-[#212047] px-2.5 py-0.5 font-mono-num text-[10px] font-bold text-[#7ADAD0]">
                        {selectedZone} 區
                      </span>
                    </div>

                    {/* Phase 1: 0-10 points */}
                    <div className="mt-3">
                      <div className="font-mono-num text-[10px] font-bold text-[#212047]/60">
                        【開局 0–10 分】左 → 中 → 右
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
                              <span className="font-mono-num text-[9px] opacity-75">
                                {idx === 0 ? '1–8號' : idx === 1 ? '9–15號' : '16–23號'}
                              </span>
                              <span className="mt-0.5 text-xs font-extrabold">
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
                        【連莊破 10 分換位後】左 → 中 → 右
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
                              <span className="font-mono-num text-[9px] opacity-75">
                                {idx === 0 ? '1–8號' : idx === 1 ? '9–15號' : '16–23號'}
                              </span>
                              <span className="mt-0.5 text-xs font-extrabold">
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
