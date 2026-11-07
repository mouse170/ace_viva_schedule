import React, { useMemo, useState } from 'react';
import { MEMBERS, type AceVivaMember } from '../data/members';
import {
  ACTIVE_THEME_WEEKS,
  STATION_ROTATION_SCHEDULES,
  getMergedThemeWeekRoster,
  type AceZoneId,
  type WeekMemberAttendanceType,
} from '../data/schedule';
import { MemberPortrait } from './MemberPortrait';

interface ScheduleSectionProps {
  selectedMemberId: string | 'all' | 'favorites';
  favoriteIds: string[];
  onSelectMemberFilter: (memberId: string | 'all' | 'favorites') => void;
  onOpenMemberDetail: (member: AceVivaMember) => void;
}

type WeekRosterViewFilter = 'all' | 'diff_only' | 'day1' | 'day2';

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({
  selectedMemberId,
  favoriteIds,
  onSelectMemberFilter,
  onOpenMemberDetail,
}) => {
  // 選擇主題週（預設顯示全部未過期主題週）
  const [selectedWeekId, setSelectedWeekId] = useState<string>('all');
  // 班表顯示模式：全部合併名單 / 只看兩日差異成員 / 只看週六 Day 1 / 只看週日 Day 2
  const [rosterViewFilter, setRosterViewFilter] =
    useState<WeekRosterViewFilter>('all');

  // 2F 集氣區站位表展開狀態與單日切換（針對有公告站位表的主題週，如 11/07–11/08）
  const [expandedStationWeekId, setExpandedStationWeekId] = useState<
    string | null
  >('week-2026-11-07');
  const [stationDayMatchId, setStationDayMatchId] =
    useState<string>('2026-11-07');

  const memberMap = useMemo(() => {
    const map = new Map<string, AceVivaMember>();
    for (const m of MEMBERS) {
      map.set(m.id, m);
    }
    return map;
  }, []);

  // 將所有未過期主題週轉換為「同週合併班表」結構
  const mergedThemeWeeks = useMemo(() => {
    return ACTIVE_THEME_WEEKS.map((week) => getMergedThemeWeekRoster(week));
  }, []);

  // 依週次與成員篩選後的主題週列表
  const filteredMergedWeeks = useMemo(() => {
    let list =
      selectedWeekId === 'all'
        ? mergedThemeWeeks
        : mergedThemeWeeks.filter((item) => item.week.weekId === selectedWeekId);

    if (selectedMemberId === 'all') return list;
    if (selectedMemberId === 'favorites') {
      if (favoriteIds.length === 0) return [];
      return list.filter((item) =>
        item.allMemberIds.some((id) => favoriteIds.includes(id))
      );
    }
    return list.filter((item) =>
      item.allMemberIds.includes(selectedMemberId)
    );
  }, [mergedThemeWeeks, selectedWeekId, selectedMemberId, favoriteIds]);

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
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#5BAE84]/15 px-3 py-1 font-mono-num text-[10px] font-bold tracking-[0.16em] text-[#212047] ring-1 ring-[#5BAE84]/30 lg:px-4 lg:py-1.5 lg:text-xs">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#5BAE84]" />
              <span>主題週合併班表</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#212047] px-3 py-1 font-mono-num text-[10px] font-bold text-[#7ADAD0] lg:text-xs">
              <span>已隱藏過期主題日 · 同週班表合併顯示</span>
            </span>
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-[#212047] sm:text-5xl lg:text-6xl">
            臺中連莊主場主題週與女孩應援班表
          </h2>
          <p className="mt-2.5 max-w-3xl text-xs leading-relaxed text-[#212047]/70 sm:text-base lg:text-lg">
            已自動隱藏過期主題日，並將同一主題週（週六、週日）相同班表合併呈現；若當週兩日出席成員有異動，將以
            <strong className="mx-1 rounded-md bg-amber-500/20 px-1.5 py-0.5 font-extrabold text-amber-900">
              琥珀橘（週六限定）
            </strong>
            與
            <strong className="mx-1 rounded-md bg-rose-500/20 px-1.5 py-0.5 font-extrabold text-rose-900">
              玫瑰粉（週日限定）
            </strong>
            雙色高亮提醒。
          </p>
          <p className="mt-2 max-w-3xl text-[11px] font-semibold text-[#3F8E67] lg:text-sm">
            ※ 粉絲自製免責說明：本班表整理自官方 Instagram 公開貼文，若有臨時排班異動或賽程調整，請一律以臺中連莊球團與連莊女孩官方實際公告為準。
          </p>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-end">
          <div className="rounded-2xl bg-[#212047] px-3.5 py-2 text-xs text-white sm:px-4 sm:py-2.5 lg:px-5 lg:py-3 lg:text-sm">
            <span className="font-mono-num text-[#7ADAD0]">主場館 · </span>
            <span>國立臺灣體育運動大學體育館（臺中主場）</span>
          </div>
        </div>
      </div>

      {/* Controls Box: Theme Week Selector + Color Legend / Day View Filter + Member Filter */}
      <div className="mt-6 rounded-[1.75rem] bg-[#D5EFE9]/75 p-1.5 ring-1 ring-[#5BAE84]/25 sm:mt-8 sm:rounded-[2rem] sm:p-2">
        <div className="rounded-[calc(1.75rem-0.375rem)] bg-white p-3.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] sm:rounded-[calc(2rem-0.5rem)] sm:p-5 lg:p-6">
          {/* Row 1: Active Theme Week Switcher (Expired Weeks Filtered Out) */}
          <div className="flex flex-col gap-2 border-b border-[#212047]/10 pb-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono-num text-[10px] font-extrabold tracking-[0.14em] text-[#212047]/70 sm:text-xs">
                步驟一 · 選擇未過期主題週次
              </span>
              <span className="rounded-full bg-[#E6F5F1] px-2.5 py-0.5 font-mono-num text-[10px] font-bold text-[#3F8E67]">
                10/31–11/01 開幕週已過期不顯示
              </span>
            </div>
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1 sm:flex-wrap sm:pb-0">
              <button
                type="button"
                onClick={() => setSelectedWeekId('all')}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-extrabold transition-all lg:px-4 lg:py-2 lg:text-sm ${
                  selectedWeekId === 'all'
                    ? 'bg-[#212047] text-white shadow-xs'
                    : 'bg-[#F4FAF8] text-[#212047]/80 ring-1 ring-[#212047]/10 hover:bg-[#E6F5F1]'
                }`}
              >
                全部近期主題週（{mergedThemeWeeks.length} 週）
              </button>
              {mergedThemeWeeks.map(({ week }) => {
                const isAct = selectedWeekId === week.weekId;
                return (
                  <button
                    key={week.weekId}
                    type="button"
                    onClick={() => setSelectedWeekId(week.weekId)}
                    className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-extrabold transition-all lg:px-4 lg:py-2 lg:text-sm ${
                      isAct
                        ? 'bg-[#212047] text-[#7ADAD0] shadow-xs ring-2 ring-[#5BAE84]'
                        : week.isCurrentWeek
                          ? 'bg-[#E6F5F1] text-[#212047] ring-1 ring-[#5BAE84]/50 hover:bg-[#D5EFE9]'
                          : 'bg-[#F4FAF8] text-[#212047]/80 ring-1 ring-[#212047]/10 hover:bg-[#E6F5F1]'
                    }`}
                  >
                    {week.isCurrentWeek
                      ? `★ ${week.weekShortLabel}`
                      : week.weekShortLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 2: Color Legend & Roster View Mode Switcher */}
          <div className="mt-3.5 flex flex-col gap-3 border-b border-[#212047]/10 pb-3.5 lg:flex-row lg:items-center lg:justify-between">
            {/* Color Legend for Same-Week Merged Roster */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono-num text-[10px] font-bold text-[#212047]/70 lg:text-xs">
                同週班表顏色圖例：
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F5F1] px-2.5 py-1 text-[11px] font-extrabold text-[#212047] ring-1 ring-[#5BAE84]/40 lg:text-xs">
                <span className="h-2 w-2 rounded-full bg-[#5BAE84]" />
                <span>兩日全勤（週六與週日皆出席）</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-2.5 py-1 text-[11px] font-extrabold text-amber-900 ring-1 ring-amber-500/50 lg:text-xs">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>週六限定（僅週六首日出席）</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-2.5 py-1 text-[11px] font-extrabold text-rose-900 ring-1 ring-rose-500/50 lg:text-xs">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span>週日限定（僅週日次日出席）</span>
              </span>
            </div>

            {/* Quick Roster Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-mono-num text-[10px] font-bold text-[#212047]/65 lg:text-xs">
                名單檢視切換：
              </span>
              {[
                { id: 'all' as const, label: '同週合併全名單' },
                { id: 'diff_only' as const, label: '只看兩日異動成員' },
                { id: 'day1' as const, label: '只看週六場' },
                { id: 'day2' as const, label: '只看週日場' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setRosterViewFilter(opt.id)}
                  className={`rounded-full px-3 py-1 text-[11px] font-extrabold transition-all lg:text-xs ${
                    rosterViewFilter === opt.id
                      ? opt.id === 'diff_only'
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'bg-[#212047] text-white shadow-2xs'
                      : 'bg-[#F4FAF8] text-[#212047]/75 ring-1 ring-[#212047]/10 hover:bg-[#E6F5F1]'
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
              <span className="font-mono-num text-[10px] font-bold tracking-[0.15em] text-[#212047]/65 sm:text-[11px] lg:text-xs">
                依成員篩選 · 點選女孩頭像篩選出席主題週
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
                  「{activeFilterMember.name}」於未過期主題週出席（共{' '}
                  {filteredMergedWeeks.length} 個主題週）
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

      {/* Merged Theme Week Cards Grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 sm:mt-8 lg:gap-8">
        {filteredMergedWeeks.map((merged) => {
          const {
            week,
            day1Match,
            day2Match,
            day1ShortDate,
            day2ShortDate,
            allMemberIds,
            bothDaysMemberIds,
            day1OnlyMemberIds,
            day2OnlyMemberIds,
            hasDayDifference,
            memberStatusMap,
          } = merged;

          // Filter member IDs according to rosterViewFilter
          const displayedMemberIds = allMemberIds.filter((id) => {
            const st = memberStatusMap[id];
            if (rosterViewFilter === 'diff_only') {
              return st === 'day1_only' || st === 'day2_only';
            }
            if (rosterViewFilter === 'day1') {
              return st === 'both' || st === 'day1_only';
            }
            if (rosterViewFilter === 'day2') {
              return st === 'both' || st === 'day2_only';
            }
            return true;
          });

          const attendingMembers = displayedMemberIds
            .map((id) => memberMap.get(id))
            .filter((m): m is AceVivaMember => Boolean(m));

          const day1OnlyMembers = day1OnlyMemberIds
            .map((id) => memberMap.get(id))
            .filter((m): m is AceVivaMember => Boolean(m));

          const day2OnlyMembers = day2OnlyMemberIds
            .map((id) => memberMap.get(id))
            .filter((m): m is AceVivaMember => Boolean(m));

          // Check if this week has 2F Station Rotation Schedules
          const weekStationSchedules = STATION_ROTATION_SCHEDULES.filter((s) =>
            week.matches.some((m) => m.id === s.matchId)
          );
          const isStationExpanded = expandedStationWeekId === week.weekId;
          const activeStationSchedule =
            weekStationSchedules.find((s) => s.matchId === stationDayMatchId) ??
            weekStationSchedules[0];

          return (
            <div
              key={week.weekId}
              className={`min-w-0 rounded-[1.75rem] p-1.5 transition-all duration-500 sm:rounded-[2rem] sm:p-2 ${
                week.isCurrentWeek
                  ? 'bg-[#D5EFE9] ring-2 ring-[#5BAE84] shadow-[0_20px_50px_rgba(33,32,71,0.12)]'
                  : 'bg-[#D5EFE9]/75 ring-1 ring-[#5BAE84]/25'
              }`}
            >
              <div className="flex h-full flex-col justify-between rounded-[calc(1.75rem-0.375rem)] bg-white p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] sm:rounded-[calc(2rem-0.5rem)] sm:p-7 lg:p-8">
                <div>
                  {/* Top Meta Bar: Theme Week Badge & Combined Date Range */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#212047]/10 pb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {week.isCurrentWeek && (
                        <span className="rounded-full bg-[#5BAE84] px-3 py-0.5 font-mono-num text-[11px] font-extrabold text-white shadow-2xs lg:text-xs">
                          ★ 本週進行中主題日
                        </span>
                      )}
                      <span className="font-mono-num text-xs font-extrabold tracking-[0.12em] text-[#4FA87D] uppercase lg:text-sm">
                        {week.weekShortLabel} · 同週兩日合併班表
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-[#212047] px-3.5 py-1 font-mono-num text-xs font-extrabold text-[#7ADAD0] lg:text-sm">
                        {week.dateRangeLabel}
                      </span>
                      <span className="rounded-full bg-[#E6F5F1] px-3 py-1 font-mono-num text-xs font-bold text-[#212047] ring-1 ring-[#5BAE84]/35">
                        兩日全勤 {bothDaysMemberIds.length} 人
                        {hasDayDifference
                          ? ` ＋ 單日限定 ${day1OnlyMemberIds.length + day2OnlyMemberIds.length} 人`
                          : ''}
                      </span>
                    </div>
                  </div>

                  {/* Theme Title + Merged 2-Day Matchup Schedule Pills */}
                  <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-center">
                    <div className="min-w-0 lg:col-span-5">
                      <h3 className="text-xl font-black text-[#212047] sm:text-3xl lg:text-4xl">
                        {week.themeTitle}
                      </h3>
                      <p className="mt-1 text-xs font-medium text-[#212047]/70 sm:text-sm lg:text-base">
                        {day1Match.themeSubtitle}
                      </p>
                    </div>

                    {/* Combined Day 1 & Day 2 Match Info Cards */}
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:col-span-7">
                      {day1Match && (
                        <div className="flex items-center justify-between gap-2 rounded-2xl bg-amber-500/[0.08] px-3.5 py-2.5 ring-1 ring-amber-500/35">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="rounded-md bg-amber-500 px-2 py-0.5 font-mono-num text-[10px] font-black text-white">
                                週六場
                              </span>
                              <span className="font-mono-num text-xs font-extrabold text-[#212047] lg:text-sm">
                                {day1Match.date} ({day1Match.time})
                              </span>
                            </div>
                            <div className="mt-1 text-xs font-bold text-[#212047]/80 lg:text-sm">
                              臺中連莊 對戰 {day1Match.opponent}
                            </div>
                          </div>
                          <div className="text-right font-mono-num text-[11px] font-bold text-amber-900">
                            <div>出席 {day1Match.attendingMemberIds.length} 人</div>
                            {day1OnlyMembers.length > 0 && (
                              <div className="text-[10px] font-extrabold text-amber-700">
                                含 {day1OnlyMembers.map((m) => m.name).join('、')}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {day2Match && (
                        <div className="flex items-center justify-between gap-2 rounded-2xl bg-rose-500/[0.08] px-3.5 py-2.5 ring-1 ring-rose-500/35">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="rounded-md bg-rose-500 px-2 py-0.5 font-mono-num text-[10px] font-black text-white">
                                週日場
                              </span>
                              <span className="font-mono-num text-xs font-extrabold text-[#212047] lg:text-sm">
                                {day2Match.date} ({day2Match.time})
                              </span>
                            </div>
                            <div className="mt-1 text-xs font-bold text-[#212047]/80 lg:text-sm">
                              臺中連莊 對戰 {day2Match.opponent}
                            </div>
                          </div>
                          <div className="text-right font-mono-num text-[11px] font-bold text-rose-900">
                            <div>出席 {day2Match.attendingMemberIds.length} 人</div>
                            {day2OnlyMembers.length > 0 && (
                              <div className="text-[10px] font-extrabold text-rose-700">
                                含 {day2OnlyMembers.map((m) => m.name).join('、')}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Color-Coded Day-Difference Highlight Banner */}
                  {hasDayDifference ? (
                    <div className="mt-4 rounded-2xl bg-gradient-to-r from-amber-500/12 via-[#F4FAF8] to-rose-500/12 p-3.5 ring-1 ring-[#212047]/15 sm:p-4">
                      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-lg bg-[#212047] px-2.5 py-1 font-mono-num text-[11px] font-extrabold text-[#7ADAD0] lg:text-xs">
                            兩日班表差異顏色提醒
                          </span>
                          <span className="text-xs font-bold text-[#212047] sm:text-sm">
                            本週共{' '}
                            <strong className="font-black text-[#3F8E67]">
                              {bothDaysMemberIds.length} 位女孩兩日相同（全勤）
                            </strong>
                            ，僅下列成員為單日限定出席：
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {day1OnlyMembers.map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => onOpenMemberDetail(m)}
                              className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 text-xs font-black text-white shadow-xs transition-transform hover:scale-105 active:scale-95"
                            >
                              <span>● {day1ShortDate} (六) 限定：</span>
                              <span>
                                #{m.number} {m.name}
                              </span>
                            </button>
                          ))}

                          {day2OnlyMembers.map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => onOpenMemberDetail(m)}
                              className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 px-3 py-1 text-xs font-black text-white shadow-xs transition-transform hover:scale-105 active:scale-95"
                            >
                              <span>● {day2ShortDate} (日) 限定：</span>
                              <span>
                                #{m.number} {m.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl bg-[#E6F5F1] px-4 py-2.5 text-xs font-bold text-[#3F8E67]">
                      本週兩日出席女孩名單完全相同，無單日異動。
                    </div>
                  )}

                  {/* Merged Attending Roster Grid */}
                  <div className="mt-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono-num text-[10px] font-bold tracking-[0.15em] text-[#212047]/65 lg:text-xs">
                        當週出席女孩合併名單（顯示 {attendingMembers.length} 人）
                      </span>
                      <span className="text-[11px] font-bold text-[#212047]/70 lg:text-xs">
                        綠標＝兩日全勤 ｜ 琥珀橘框＝週六限定 ｜ 玫瑰粉框＝週日限定
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 sm:gap-2.5">
                      {attendingMembers.map((m) => {
                        const status: WeekMemberAttendanceType =
                          memberStatusMap[m.id] ?? 'both';
                        const isSelectedOrFav =
                          selectedMemberId === m.id ||
                          (selectedMemberId === 'favorites' &&
                            favoriteIds.includes(m.id));

                        // Determine card style based on attendance status & color alert rules
                        let cardStyle =
                          'bg-[#F4FAF8] text-[#212047] ring-1 ring-[#212047]/10 hover:bg-[#212047] hover:text-white';
                        let avatarRingStyle = 'ring-1 ring-[#5BAE84]/45';
                        let badgeStyle =
                          'bg-[#D5EFE9] text-[#212047] group-hover:bg-[#5BAE84] group-hover:text-white';
                        let badgeText = '兩日全勤';

                        if (status === 'day1_only') {
                          cardStyle =
                            'bg-amber-50 text-[#212047] ring-2 ring-amber-500 shadow-[0_6px_16px_rgba(245,158,11,0.18)] hover:bg-amber-500 hover:text-white';
                          avatarRingStyle = 'ring-2 ring-amber-500';
                          badgeStyle =
                            'bg-amber-500 text-white group-hover:bg-white group-hover:text-amber-900';
                          badgeText = `${day1ShortDate}(六)限定`;
                        } else if (status === 'day2_only') {
                          cardStyle =
                            'bg-rose-50 text-[#212047] ring-2 ring-rose-500 shadow-[0_6px_16px_rgba(244,63,94,0.18)] hover:bg-rose-500 hover:text-white';
                          avatarRingStyle = 'ring-2 ring-rose-500';
                          badgeStyle =
                            'bg-rose-500 text-white group-hover:bg-white group-hover:text-rose-900';
                          badgeText = `${day2ShortDate}(日)限定`;
                        } else if (isSelectedOrFav) {
                          cardStyle =
                            'bg-[#212047] text-white shadow-sm ring-2 ring-[#5BAE84]';
                          avatarRingStyle = 'ring-2 ring-[#5ECBC0]';
                          badgeStyle = 'bg-[#5BAE84] text-white';
                        }

                        return (
                          <div
                            key={m.id}
                            onClick={() => onOpenMemberDetail(m)}
                            className={`group relative flex min-w-0 cursor-pointer items-center justify-between gap-1.5 rounded-2xl p-2 text-left transition-all duration-300 sm:p-2.5 ${cardStyle}`}
                          >
                            <div className="flex min-w-0 items-center gap-2">
                              <MemberPortrait
                                member={m}
                                variant="avatar"
                                className={`h-10 w-10 shrink-0 rounded-full sm:h-11 sm:w-11 lg:h-12 lg:w-12 ${avatarRingStyle}`}
                              />
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-1">
                                  <span
                                    className={`font-mono-num text-[10px] font-extrabold lg:text-xs ${
                                      status === 'day1_only'
                                        ? 'text-amber-700 group-hover:text-white'
                                        : status === 'day2_only'
                                          ? 'text-rose-700 group-hover:text-white'
                                          : isSelectedOrFav
                                            ? 'text-[#7ADAD0]'
                                            : 'text-[#4FA87D] group-hover:text-[#7ADAD0]'
                                    }`}
                                  >
                                    #{m.number}
                                  </span>
                                  <span
                                    className={`rounded-full px-1.5 py-0.2 font-mono-num text-[9px] font-extrabold whitespace-nowrap ${badgeStyle}`}
                                  >
                                    {badgeText}
                                  </span>
                                </div>
                                <div className="mt-0.5 truncate text-xs font-black sm:text-sm lg:text-base">
                                  {m.name}
                                </div>
                              </div>
                            </div>

                            <a
                              href={m.instagramUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              aria-label={`一鍵開啟 ${m.name} 的官方 IG`}
                              className="shrink-0 rounded-full bg-[#212047] px-2 py-1 font-mono-num text-[10px] font-black text-[#7ADAD0] shadow-2xs ring-1 ring-[#5ECBC0]/40 transition-colors hover:bg-[#5BAE84] hover:text-white"
                            >
                              IG ↗
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2F Station Rotation Breakdown (Merged Drawer with Day 1 / Day 2 Switcher) */}
                  {weekStationSchedules.length > 0 && activeStationSchedule && (
                    <div className="mt-5 rounded-2xl bg-[#F4FAF8] p-3.5 ring-1 ring-[#5BAE84]/35 sm:p-4">
                      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedStationWeekId((prev) =>
                              prev === week.weekId ? null : week.weekId
                            )
                          }
                          className="flex items-center gap-2 text-left"
                        >
                          <span className="rounded-md bg-[#212047] px-2.5 py-1 font-mono-num text-[10px] font-bold text-[#7ADAD0] lg:text-xs">
                            2F 集氣區站位表
                          </span>
                          <span className="text-xs font-extrabold text-[#212047] sm:text-sm">
                            A / B / C 區各局排班一覽（單日限定成員以顏色標示）
                          </span>
                          <span className="font-mono-num text-xs font-bold text-[#4FA87D]">
                            {isStationExpanded ? '收合 ▲' : '展開 ▼'}
                          </span>
                        </button>

                        {/* Day 1 vs Day 2 Station Switcher inside Merged Card */}
                        {isStationExpanded && weekStationSchedules.length > 1 && (
                          <div className="flex flex-wrap items-center gap-1.5">
                            {weekStationSchedules.map((sched, idx) => {
                              const isCurrentDay =
                                activeStationSchedule.matchId === sched.matchId;
                              const isDay1 = idx === 0;
                              return (
                                <button
                                  key={sched.matchId}
                                  type="button"
                                  onClick={() =>
                                    setStationDayMatchId(sched.matchId)
                                  }
                                  className={`rounded-full px-3 py-1 font-mono-num text-xs font-extrabold transition-all ${
                                    isCurrentDay
                                      ? isDay1
                                        ? 'bg-amber-500 text-white shadow-2xs'
                                        : 'bg-rose-500 text-white shadow-2xs'
                                      : 'bg-white text-[#212047]/75 ring-1 ring-[#212047]/15 hover:bg-[#E6F5F1]'
                                  }`}
                                >
                                  {sched.dayLabel} 對戰 {sched.opponent}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {isStationExpanded && (
                        <div className="mt-3.5 space-y-2.5 border-t border-[#212047]/10 pt-3.5">
                          {activeStationSchedule.sets.map((s) => (
                            <div
                              key={s.setKey}
                              className="rounded-xl bg-white p-3 ring-1 ring-[#212047]/[0.07]"
                            >
                              <div className="mb-2 flex flex-wrap items-center justify-between gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="rounded-md bg-[#212047] px-2 py-0.5 font-mono-num text-[10px] font-bold text-[#7ADAD0] lg:text-xs">
                                    {s.setLabel}
                                  </span>
                                  <span className="font-mono-num text-[11px] font-bold text-[#3F8E67]">
                                    {activeStationSchedule.dateLabel}
                                  </span>
                                </div>
                                <span className="text-[10px] font-semibold text-[#212047]/55 lg:text-xs">
                                  開局站位（破 10 分區內換位）
                                </span>
                              </div>
                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
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
                                        className="flex min-w-0 items-center justify-between gap-2 rounded-lg bg-[#F4FAF8] px-3 py-2 ring-1 ring-[#5BAE84]/20"
                                      >
                                        <span className="shrink-0 font-mono-num text-xs font-extrabold text-[#3F8E67]">
                                          2F {zoneId} 區
                                        </span>
                                        <div className="flex min-w-0 flex-wrap items-center justify-end gap-1.5">
                                          {zMembers.map((zm) => {
                                            const st = memberStatusMap[zm.id];
                                            const isD1 = st === 'day1_only';
                                            const isD2 = st === 'day2_only';
                                            return (
                                              <span
                                                key={zm.id}
                                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-extrabold ${
                                                  isD1
                                                    ? 'bg-amber-500 text-white ring-1 ring-amber-600'
                                                    : isD2
                                                      ? 'bg-rose-500 text-white ring-1 ring-rose-600'
                                                      : 'bg-white text-[#212047] ring-1 ring-[#212047]/10'
                                                }`}
                                              >
                                                <MemberPortrait
                                                  member={zm}
                                                  variant="avatar"
                                                  className="h-4 w-4 rounded-full"
                                                />
                                                <span>{zm.name}</span>
                                              </span>
                                            );
                                          })}
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
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#E6F5F1] px-4 py-2.5 text-xs text-[#212047] sm:mt-5 lg:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-[#5BAE84]" />
                    <span className="font-bold">{day1Match.highlightNote}</span>
                  </div>
                  {day2Match &&
                    day2Match.highlightNote !== day1Match.highlightNote && (
                      <span className="text-xs font-semibold text-[#3F8E67]">
                        週日亮點：{day2Match.highlightNote}
                      </span>
                    )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
