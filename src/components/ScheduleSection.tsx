import React, { useMemo, useState } from 'react';
import { MEMBERS, type AceVivaMember } from '../data/members';
import {
  HOME_SCHEDULE,
  STATION_ROTATION_SCHEDULES,
  THEME_WEEKS,
  type AceZoneId,
} from '../data/schedule';
import { MemberPortrait } from './MemberPortrait';

interface ScheduleSectionProps {
  selectedMemberId: string | 'all' | 'favorites';
  favoriteIds: string[];
  onSelectMemberFilter: (memberId: string | 'all' | 'favorites') => void;
  onOpenMemberDetail: (member: AceVivaMember) => void;
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  selectedMemberId,
  favoriteIds,
  onSelectMemberFilter,
  onOpenMemberDetail,
}) => {
  // Default to current week ('week-2026-11-07') or 'all'
  const [selectedWeekId, setSelectedWeekId] = useState<string>('all');
  // Dynamic day filter within the selected week ('all' or specific match.id)
  const [selectedDayMatchId, setSelectedDayMatchId] = useState<string>('all');
  // Dynamic minimum attendance days filter within a week (0 = any, 1 = 1 day, 2 = 2 days...)
  const [requiredDaysInWeek, setRequiredDaysInWeek] = useState<number>(0);

  const [expandedStationMatchId, setExpandedStationMatchId] = useState<
    string | null
  >('2026-11-07');

  const memberMap = useMemo(() => {
    const map = new Map<string, AceVivaMember>();
    for (const m of MEMBERS) {
      map.set(m.id, m);
    }
    return map;
  }, []);

  // Current active week group (if a specific week is chosen, otherwise defaults to current week for day-count stats)
  const activeWeekGroup = useMemo(() => {
    if (selectedWeekId === 'all') return null;
    return THEME_WEEKS.find((w) => w.weekId === selectedWeekId) ?? null;
  }, [selectedWeekId]);

  // Reset day filter when switching weeks
  const handleSelectWeek = (weekId: string) => {
    setSelectedWeekId(weekId);
    setSelectedDayMatchId('all');
    setRequiredDaysInWeek(0);
  };

  // Helper: compute how many days a member attends in the week that `matchId` belongs to
  const getMemberWeekAttendanceCount = useMemo(() => {
    const map = new Map<string, { attended: number; total: number }>();
    for (const week of THEME_WEEKS) {
      const total = week.matches.length;
      for (const m of MEMBERS) {
        const attended = week.matches.filter((match) =>
          match.attendingMemberIds.includes(m.id)
        ).length;
        for (const match of week.matches) {
          map.set(`${match.id}:${m.id}`, { attended, total });
        }
      }
    }
    return map;
  }, []);

  const filteredSchedule = useMemo(() => {
    let baseList = activeWeekGroup ? activeWeekGroup.matches : HOME_SCHEDULE;

    if (selectedDayMatchId !== 'all') {
      baseList = baseList.filter((m) => m.id === selectedDayMatchId);
    }

    if (selectedMemberId === 'all') return baseList;
    if (selectedMemberId === 'favorites') {
      if (favoriteIds.length === 0) return [];
      return baseList.filter((match) =>
        match.attendingMemberIds.some((id) => favoriteIds.includes(id))
      );
    }
    return baseList.filter((match) =>
      match.attendingMemberIds.includes(selectedMemberId)
    );
  }, [activeWeekGroup, selectedDayMatchId, selectedMemberId, favoriteIds]);

  const activeFilterMember =
    selectedMemberId !== 'all' && selectedMemberId !== 'favorites'
      ? memberMap.get(selectedMemberId)
      : undefined;

  return (
    <section
      id="schedule-section"
      className="relative mx-auto max-w-[1440px] px-3 py-16 sm:px-6 sm:py-24 lg:px-10"
    >
      {/* Section Header */}
      <div className="flex flex-col justify-between gap-5 border-b border-[#212047]/10 pb-8 lg:flex-row lg:items-end">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#5BAE84]/15 px-3 py-1 font-mono-num text-[10px] font-bold tracking-[0.16em] text-[#212047] uppercase ring-1 ring-[#5BAE84]/30 lg:px-4 lg:py-1.5 lg:text-xs">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#5BAE84]" />
            <span>2026–2027 HOME ATTENDANCE ROSTER</span>
          </span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-[#212047] sm:text-5xl lg:text-6xl">
            臺中連莊主場主題週與女孩應援班表
          </h2>
          <p className="mt-2.5 max-w-3xl text-xs leading-relaxed text-[#212047]/70 sm:text-base lg:text-lg">
            支援主題週與當週天數動態切換：可自由選擇「單週全部天數」、「指定單日（Day 1 / Day 2）」或依「當週出席天數（全勤 / 單日）」動態篩選女孩班表。
          </p>
          <p className="mt-2 max-w-3xl text-[11px] font-semibold text-[#3F8E67] lg:text-sm">
            ※ 粉絲自製免責說明：本班表整理自官方 Instagram 公開貼文，若有臨時排班異動或賽程調整，請一律以臺中連莊球團與 ACE VIVA 官方實際公告為準。
          </p>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-end">
          <div className="rounded-2xl bg-[#212047] px-3.5 py-2 text-xs text-white sm:px-4 sm:py-2.5 lg:px-5 lg:py-3 lg:text-sm">
            <span className="font-mono-num text-[#7ADAD0]">VENUE · </span>
            <span>國立臺灣體育運動大學體育館（臺中主場）</span>
          </div>
        </div>
      </div>

      {/* Dynamic Theme Week & Match-Day Controls */}
      <div className="mt-6 rounded-[1.75rem] bg-[#D5EFE9]/75 p-1.5 ring-1 ring-[#5BAE84]/25 sm:mt-8 sm:rounded-[2rem] sm:p-2">
        <div className="rounded-[calc(1.75rem-0.375rem)] bg-white p-3.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] sm:rounded-[calc(2rem-0.5rem)] sm:p-5 lg:p-6">
          {/* Row 1: Theme Week Switcher */}
          <div className="flex flex-col gap-2 border-b border-[#212047]/10 pb-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <span className="font-mono-num text-[10px] font-extrabold tracking-[0.14em] text-[#212047]/70 uppercase sm:text-xs">
              STEP A · 選擇主題週次（自動載入該週實際比賽天數）
            </span>
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:pb-0">
              <button
                type="button"
                onClick={() => handleSelectWeek('all')}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-extrabold transition-all lg:px-4 lg:py-2 lg:text-sm ${
                  selectedWeekId === 'all'
                    ? 'bg-[#212047] text-white shadow-xs'
                    : 'bg-[#F4FAF8] text-[#212047]/80 ring-1 ring-[#212047]/10 hover:bg-[#E6F5F1]'
                }`}
              >
                全部週次（{THEME_WEEKS.length} 週 / {HOME_SCHEDULE.length} 天）
              </button>
              {THEME_WEEKS.map((wk) => {
                const isAct = selectedWeekId === wk.weekId;
                return (
                  <button
                    key={wk.weekId}
                    type="button"
                    onClick={() => handleSelectWeek(wk.weekId)}
                    className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-extrabold transition-all lg:px-4 lg:py-2 lg:text-sm ${
                      isAct
                        ? 'bg-[#212047] text-[#7ADAD0] shadow-xs ring-2 ring-[#5BAE84]'
                        : wk.isCurrentWeek
                          ? 'bg-[#E6F5F1] text-[#212047] ring-1 ring-[#5BAE84]/50 hover:bg-[#D5EFE9]'
                          : 'bg-[#F4FAF8] text-[#212047]/80 ring-1 ring-[#212047]/10 hover:bg-[#E6F5F1]'
                    }`}
                  >
                    {wk.isCurrentWeek ? `★ ${wk.weekShortLabel}` : wk.weekShortLabel}
                    （{wk.matches.length} 天）
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2: Dynamic Match-Day Selector & Attendance Days Filter (Visible when a week is selected, or quick day toggles) */}
          <div className="mt-3.5 flex flex-col gap-3 border-b border-[#212047]/10 pb-3.5 lg:flex-row lg:items-center lg:justify-between">
            {/* Dynamic Day Toggles */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 font-mono-num text-[10px] font-bold text-[#3F8E67] uppercase lg:text-xs">
                當週天數切換：
              </span>
              <button
                type="button"
                onClick={() => setSelectedDayMatchId('all')}
                className={`rounded-full px-3 py-1 text-xs font-extrabold transition-all lg:text-sm ${
                  selectedDayMatchId === 'all'
                    ? 'bg-[#5BAE84] text-white shadow-2xs'
                    : 'bg-[#F4FAF8] text-[#212047]/75 ring-1 ring-[#212047]/10 hover:bg-[#E6F5F1]'
                }`}
              >
                {activeWeekGroup
                  ? `當週全部（共 ${activeWeekGroup.matches.length} 天）`
                  : `全部比賽日（${HOME_SCHEDULE.length} 天）`}
              </button>

              {(activeWeekGroup
                ? activeWeekGroup.matches
                : HOME_SCHEDULE
              ).map((m, idx) => {
                const isDayAct = selectedDayMatchId === m.id;
                const shortDate = m.date.slice(5);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() =>
                      setSelectedDayMatchId(isDayAct ? 'all' : m.id)
                    }
                    className={`rounded-full px-3 py-1 font-mono-num text-xs font-bold transition-all lg:text-sm ${
                      isDayAct
                        ? 'bg-[#212047] text-[#7ADAD0] shadow-2xs ring-1 ring-[#5BAE84]'
                        : 'bg-[#F4FAF8] text-[#212047]/80 ring-1 ring-[#212047]/10 hover:bg-[#E6F5F1]'
                    }`}
                  >
                    {activeWeekGroup ? `Day ${idx + 1} · ` : ''}
                    {shortDate} ({m.dayOfWeek.split(' ')[0]})
                  </button>
                );
              })}
            </div>

            {/* Dynamic Attendance Day-Count Filter (1 Day vs All Days in Week) */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-mono-num text-[10px] font-bold text-[#212047]/65 uppercase lg:text-xs">
                當週出席天數篩選：
              </span>
              {[
                { days: 0, label: '全部出席女孩' },
                { days: 2, label: '當週連 2 天全勤' },
                { days: 1, label: '當週單日限定 (1 天)' },
              ].map((opt) => (
                <button
                  key={opt.days}
                  type="button"
                  onClick={() => setRequiredDaysInWeek(opt.days)}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition-all lg:text-xs ${
                    requiredDaysInWeek === opt.days
                      ? 'bg-[#212047] text-white'
                      : 'bg-[#F4FAF8] text-[#212047]/70 ring-1 ring-[#212047]/10 hover:bg-[#E6F5F1]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Row 3: Member Avatar Filter Strip */}
          <div className="mt-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5">
              <span className="font-mono-num text-[10px] font-bold tracking-[0.15em] text-[#212047]/65 uppercase sm:text-[11px] lg:text-xs">
                FILTER BY MEMBER · 點選女孩頭像篩選出席場次
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectMemberFilter('all')}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                    selectedMemberId === 'all'
                      ? 'bg-[#212047] text-white'
                      : 'bg-[#F4FAF8] text-[#212047]/80 ring-1 ring-[#212047]/10'
                  }`}
                >
                  全部成員
                </button>
                <button
                  type="button"
                  onClick={() => onSelectMemberFilter('favorites')}
                  className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                    selectedMemberId === 'favorites'
                      ? 'bg-[#5BAE84] text-white'
                      : 'bg-[#5BAE84]/15 text-[#212047]'
                  }`}
                >
                  只看我的主推 ({favoriteIds.length})
                </button>
              </div>
            </div>

            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1.5 sm:flex-wrap sm:overflow-visible sm:pb-0">
              {MEMBERS.map((m) => {
                const isSelected = selectedMemberId === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() =>
                      onSelectMemberFilter(isSelected ? 'all' : m.id)
                    }
                    className={`flex shrink-0 items-center gap-2 rounded-full py-1 pr-3 pl-1 text-xs font-bold whitespace-nowrap transition-all duration-300 active:scale-[0.97] lg:py-1.5 lg:pr-4 lg:pl-1.5 lg:text-sm ${
                      isSelected
                        ? 'bg-[#212047] text-[#7ADAD0] shadow-xs ring-2 ring-[#5BAE84]'
                        : 'bg-[#F4FAF8] text-[#212047]/90 ring-1 ring-[#212047]/10 hover:bg-[#E6F5F1]'
                    }`}
                  >
                    <MemberPortrait
                      member={m}
                      variant="avatar"
                      className="h-7 w-7 shrink-0 rounded-full ring-1 ring-[#5BAE84]/40 lg:h-8 lg:w-8"
                    />
                    <span className="font-mono-num text-[10px] text-[#4FA87D] lg:text-xs">
                      #{m.number}
                    </span>
                    <span>{m.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Active Member Banner if Filtered */}
      {activeFilterMember && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#212047] px-4 py-3.5 text-white sm:mt-6 sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <MemberPortrait
              member={activeFilterMember}
              variant="avatar"
              className="h-10 w-10 shrink-0 rounded-full ring-2 ring-[#5ECBC0] lg:h-12 lg:w-12"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#5BAE84] px-2.5 py-0.5 font-mono-num text-[10px] font-bold text-white lg:text-xs">
                  #{activeFilterMember.number}
                </span>
                <span className="text-sm font-black sm:text-base lg:text-lg">
                  「{activeFilterMember.name}」於所選範圍出席場次（共{' '}
                  {filteredSchedule.length} 場）
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenMemberDetail(activeFilterMember)}
            className="rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-bold text-[#7ADAD0] hover:bg-white/20 lg:px-4 lg:py-2 lg:text-sm"
          >
            檢視完整檔案 →
          </button>
        </div>
      )}

      {/* Schedule Cards Grid */}
      <div className="mt-6 grid grid-cols-1 gap-5 sm:mt-8 sm:gap-6 lg:grid-cols-2 lg:gap-7">
        {filteredSchedule.map((match) => {
          const allAttendingMembers = match.attendingMemberIds
            .map((id) => memberMap.get(id))
            .filter((m): m is AceVivaMember => Boolean(m));

          // Filter members inside the card if requiredDaysInWeek is active
          const attendingMembers = allAttendingMembers.filter((m) => {
            if (requiredDaysInWeek === 0) return true;
            const stat = getMemberWeekAttendanceCount.get(`${match.id}:${m.id}`);
            if (!stat) return true;
            return stat.attended === requiredDaysInWeek;
          });

          const stationSchedule = STATION_ROTATION_SCHEDULES.find(
            (s) => s.matchId === match.id
          );
          const isStationExpanded = expandedStationMatchId === match.id;

          return (
            <div
              key={match.id}
              className="min-w-0 rounded-[1.75rem] bg-[#D5EFE9]/75 p-1.5 ring-1 ring-[#5BAE84]/25 transition-all duration-500 sm:rounded-[2rem]"
            >
              <div className="flex h-full flex-col justify-between rounded-[calc(1.75rem-0.375rem)] bg-white p-3.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] sm:rounded-[calc(2rem-0.375rem)] sm:p-7">
                <div>
                  {/* Match Top Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#212047]/10 pb-3.5">
                    <span className="font-mono-num text-[10px] font-bold tracking-[0.15em] text-[#4FA87D] uppercase sm:text-[11px] lg:text-xs">
                      {match.weekLabel}
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#212047] px-3 py-0.5 font-mono-num text-xs font-bold text-white whitespace-nowrap lg:px-3.5 lg:py-1 lg:text-sm">
                        {match.date}
                      </span>
                      <span className="font-mono-num text-xs font-bold text-[#212047]/80 whitespace-nowrap lg:text-sm">
                        {match.dayOfWeek.split(' ')[0]} · {match.time}
                      </span>
                    </div>
                  </div>

                  {/* Match Title & Opponent */}
                  <div className="mt-3.5 flex flex-col justify-between gap-2.5 sm:flex-row sm:items-center">
                    <div className="min-w-0">
                      <h3 className="text-lg font-black text-[#212047] sm:text-2xl lg:text-3xl">
                        {match.themeTitle}
                      </h3>
                      <p className="mt-0.5 text-xs font-medium text-[#212047]/65 lg:text-sm">
                        {match.themeSubtitle}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center justify-between rounded-xl bg-[#F4FAF8] px-3.5 py-2 ring-1 ring-[#5BAE84]/25 sm:block sm:text-right lg:px-4 lg:py-2.5">
                      <div className="font-mono-num text-[10px] tracking-[0.14em] text-[#4FA87D] uppercase lg:text-xs">
                        MATCHUP 對戰組合
                      </div>
                      <div className="text-xs font-extrabold text-[#212047] whitespace-nowrap lg:text-sm">
                        臺中連莊 vs {match.opponent}
                      </div>
                    </div>
                  </div>

                  {/* Attending Roster Grid */}
                  <div className="mt-5">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span className="font-mono-num text-[10px] font-bold tracking-[0.15em] text-[#212047]/65 uppercase lg:text-xs">
                        ATTENDING ACE VIVA · 當日出席女孩 ({attendingMembers.length} 人)
                      </span>
                      <span className="text-[11px] font-semibold text-[#4FA87D] lg:text-xs">
                        顯示「當週出席天數」與角色標籤
                      </span>
                    </div>

                    <div className="mt-2.5 grid grid-cols-3 gap-1.5 sm:grid-cols-4 sm:gap-2">
                      {attendingMembers.map((m) => {
                        const isHighlighted =
                          selectedMemberId === m.id ||
                          (selectedMemberId === 'favorites' &&
                            favoriteIds.includes(m.id));
                        const weekStat = getMemberWeekAttendanceCount.get(
                          `${match.id}:${m.id}`
                        );
                        const daysBadge = weekStat
                          ? `${weekStat.attended}/${weekStat.total}天`
                          : '';

                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => onOpenMemberDetail(m)}
                            className={`group flex min-w-0 items-center gap-1.5 rounded-2xl p-1.5 text-left transition-all duration-300 active:scale-95 sm:gap-2 sm:p-2 lg:p-2.5 ${
                              isHighlighted
                                ? 'bg-[#212047] text-white shadow-sm ring-2 ring-[#5BAE84]'
                                : 'bg-[#F4FAF8] text-[#212047] ring-1 ring-[#212047]/10 hover:bg-[#212047] hover:text-white'
                            }`}
                          >
                            <MemberPortrait
                              member={m}
                              variant="avatar"
                              className="h-9 w-9 shrink-0 rounded-full ring-1 ring-[#5BAE84]/45 sm:h-11 sm:w-11 lg:h-12 lg:w-12"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1">
                                <span
                                  className={`font-mono-num text-[10px] font-extrabold lg:text-xs ${
                                    isHighlighted
                                      ? 'text-[#7ADAD0]'
                                      : 'text-[#4FA87D] group-hover:text-[#7ADAD0]'
                                  }`}
                                >
                                  #{m.number}
                                </span>
                                {daysBadge && (
                                  <span
                                    className={`rounded-xs px-1 py-0.2 font-mono-num text-[8px] font-bold lg:text-[9px] ${
                                      weekStat?.attended === weekStat?.total
                                        ? isHighlighted
                                          ? 'bg-[#5BAE84] text-white'
                                          : 'bg-[#D5EFE9] text-[#212047] group-hover:bg-[#5BAE84] group-hover:text-white'
                                        : 'bg-amber-400/25 text-amber-800 group-hover:bg-amber-400 group-hover:text-[#212047]'
                                    }`}
                                  >
                                    {daysBadge}
                                  </span>
                                )}
                              </div>
                              <div className="truncate text-xs font-black sm:text-sm lg:text-base">
                                {m.name}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Station Schedule Breakdown for Matches with Official Rotation Data */}
                  {stationSchedule && (
                    <div className="mt-4 rounded-2xl bg-[#F4FAF8] p-3 ring-1 ring-[#5BAE84]/35 lg:p-4">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedStationMatchId((prev) =>
                            prev === match.id ? null : match.id
                          )
                        }
                        className="flex w-full items-center justify-between gap-2 text-left"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-[#212047] px-2 py-0.5 font-mono-num text-[10px] font-bold text-[#7ADAD0] lg:text-xs">
                            2F 集氣區站位表
                          </span>
                          <span className="text-xs font-extrabold text-[#212047] lg:text-sm">
                            A / B / C 區各局排班一覽
                          </span>
                        </div>
                        <span className="shrink-0 font-mono-num text-xs font-bold text-[#4FA87D] lg:text-sm">
                          {isStationExpanded ? '收合 ▲' : '展開班表 ▼'}
                        </span>
                      </button>

                      {isStationExpanded && (
                        <div className="mt-3 space-y-2 border-t border-[#212047]/10 pt-3">
                          {stationSchedule.sets.map((s) => (
                            <div
                              key={s.setKey}
                              className="rounded-xl bg-white p-2.5 ring-1 ring-[#212047]/[0.07] lg:p-3"
                            >
                              <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1">
                                <span className="rounded-md bg-[#212047] px-2 py-0.5 font-mono-num text-[10px] font-bold text-[#7ADAD0] lg:text-xs">
                                  {s.setLabel}
                                </span>
                                <span className="text-[10px] font-semibold text-[#212047]/55 lg:text-xs">
                                  開局左→中→右（破 10 分區內換位）
                                </span>
                              </div>
                              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
                                {(['A', 'B', 'C'] as AceZoneId[]).map(
                                  (zoneId) => {
                                    const zMembers = s.initial[zoneId]
                                      .map((id) => memberMap.get(id))
                                      .filter((m): m is AceVivaMember =>
                                        Boolean(m)
                                      );
                                    return (
                                      <div
                                        key={zoneId}
                                        className="flex min-w-0 items-center justify-between gap-1.5 rounded-lg bg-[#F4FAF8] px-2.5 py-1.5 ring-1 ring-[#5BAE84]/20"
                                      >
                                        <span className="shrink-0 font-mono-num text-[11px] font-extrabold text-[#3F8E67] lg:text-xs">
                                          {zoneId} 區
                                        </span>
                                        <div className="flex min-w-0 items-center gap-1.5">
                                          <div className="flex shrink-0 -space-x-1">
                                            {zMembers.map((zm) => (
                                              <MemberPortrait
                                                key={zm.id}
                                                member={zm}
                                                variant="avatar"
                                                className="h-5 w-5 rounded-full ring-1 ring-white lg:h-6 lg:w-6"
                                              />
                                            ))}
                                          </div>
                                          <span className="truncate text-xs font-bold text-[#212047] lg:text-sm">
                                            {zMembers
                                              .map((zm) => zm.name)
                                              .join(' · ')}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Highlight Footer */}
                <div className="mt-4 flex items-center gap-2.5 rounded-xl bg-[#E6F5F1] px-3.5 py-2.5 text-xs text-[#212047] sm:mt-5 lg:text-sm">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#5BAE84]" />
                  <span className="font-medium">{match.highlightNote}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
