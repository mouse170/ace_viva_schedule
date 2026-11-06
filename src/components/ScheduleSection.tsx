import React from 'react';
import { MEMBERS, type AceVivaMember } from '../data/members';
import { HOME_SCHEDULE } from '../data/schedule';
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
  const memberMap = React.useMemo(() => {
    const map = new Map<string, AceVivaMember>();
    for (const m of MEMBERS) {
      map.set(m.id, m);
    }
    return map;
  }, []);

  const filteredSchedule = React.useMemo(() => {
    if (selectedMemberId === 'all') return HOME_SCHEDULE;
    if (selectedMemberId === 'favorites') {
      if (favoriteIds.length === 0) return [];
      return HOME_SCHEDULE.filter((match) =>
        match.attendingMemberIds.some((id) => favoriteIds.includes(id))
      );
    }
    return HOME_SCHEDULE.filter((match) =>
      match.attendingMemberIds.includes(selectedMemberId)
    );
  }, [selectedMemberId, favoriteIds]);

  const activeFilterMember =
    selectedMemberId !== 'all' && selectedMemberId !== 'favorites'
      ? memberMap.get(selectedMemberId)
      : undefined;

  return (
    <section
      id="schedule-section"
      className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8"
    >
      {/* Section Header */}
      <div className="flex flex-col justify-between gap-6 border-b border-[#212047]/10 pb-10 lg:flex-row lg:items-end">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#5BAE84]/15 px-3.5 py-1 font-mono-num text-[10px] font-bold tracking-[0.2em] text-[#212047] uppercase ring-1 ring-[#5BAE84]/30">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5BAE84]" />
            2026–2027 HOME ATTENDANCE ROSTER
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-[#212047] sm:text-5xl">
            臺中連莊主場主題週與女孩應援班表
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#212047]/70 sm:text-base">
            雙向連動檢視：點選下方任一女孩標籤，即可篩選出她本季所有主場出席場次；點擊場次內的成員名牌，可立即開啟個人詳細應援檔案。
          </p>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-end">
          <div className="rounded-2xl bg-[#212047] px-4 py-2.5 text-xs text-white">
            <span className="font-mono-num text-[#7ADAD0]">VENUE · </span>
            <span>國立臺灣體育運動大學體育館（臺中主場）</span>
          </div>
        </div>
      </div>

      {/* Interactive Member Attendance Filter Pills */}
      <div className="mt-8 rounded-[2rem] bg-[#D5EFE9]/75 p-2 ring-1 ring-[#5BAE84]/25">
        <div className="rounded-[calc(2rem-0.5rem)] bg-white p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
            <span className="font-mono-num text-[11px] font-bold tracking-[0.18em] text-[#212047]/60 uppercase">
              FILTER BY MEMBER · 依出席成員篩選場次
            </span>
            {selectedMemberId !== 'all' && (
              <button
                type="button"
                onClick={() => onSelectMemberFilter('all')}
                className="font-mono-num text-xs font-bold text-[#4FA87D] underline-offset-4 hover:underline"
              >
                清除篩選（顯示全部 {HOME_SCHEDULE.length} 場主場）
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onSelectMemberFilter('all')}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] ${
                selectedMemberId === 'all'
                  ? 'bg-[#212047] text-white shadow-sm'
                  : 'bg-[#F4FAF8] text-[#212047]/80 ring-1 ring-[#212047]/10 hover:bg-[#E6F5F1]'
              }`}
            >
              全部主場賽事 ({HOME_SCHEDULE.length})
            </button>

            <button
              type="button"
              onClick={() => onSelectMemberFilter('favorites')}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] ${
                selectedMemberId === 'favorites'
                  ? 'bg-[#5BAE84] text-white shadow-sm'
                  : 'bg-[#5BAE84]/15 text-[#212047] hover:bg-[#5BAE84]/25'
              }`}
            >
              <span>只看「我的主推」出席場次</span>
              <span className="rounded-full bg-[#212047]/15 px-1.5 py-0.2 font-mono-num text-[10px]">
                {favoriteIds.length}
              </span>
            </button>

            {MEMBERS.map((m) => {
              const isSelected = selectedMemberId === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() =>
                    onSelectMemberFilter(isSelected ? 'all' : m.id)
                  }
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] ${
                    isSelected
                      ? 'bg-[#212047] text-[#7ADAD0] ring-2 ring-[#5BAE84]'
                      : 'bg-[#F4FAF8] text-[#212047]/85 ring-1 ring-[#212047]/[0.08] hover:bg-[#E6F5F1]'
                  }`}
                >
                  <span className="font-mono-num text-[10px] text-[#4FA87D]">
                    #{m.number}
                  </span>
                  <span>{m.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Member Banner if Filtered */}
      {activeFilterMember && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#212047] px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-[#5BAE84] px-3 py-0.5 font-mono-num text-xs font-bold text-white">
              #{activeFilterMember.number}
            </span>
            <span className="text-sm font-bold sm:text-base">
              目前顯示「{activeFilterMember.name}」出席的主場場次（共{' '}
              {filteredSchedule.length} 場）
            </span>
          </div>
          <button
            type="button"
            onClick={() => onOpenMemberDetail(activeFilterMember)}
            className="text-xs font-semibold text-[#7ADAD0] underline-offset-4 hover:underline"
          >
            檢視 {activeFilterMember.name} 完整個人檔案 →
          </button>
        </div>
      )}

      {/* Empty State for Favorites Filter */}
      {selectedMemberId === 'favorites' && favoriteIds.length === 0 && (
        <div className="mt-8 rounded-[2rem] bg-white p-12 text-center ring-1 ring-[#212047]/10">
          <p className="text-base font-bold text-[#212047]">
            尚未將任何成員加入「我的主推」收藏夾
          </p>
          <p className="mt-2 text-sm text-[#212047]/65">
            請先在上方成員圖鑑卡片點擊愛心圖示收藏喜愛的女孩，即可在此一鍵篩選她們的出席班表。
          </p>
        </div>
      )}

      {/* Schedule Cards Grid (Double-Bezel Architecture) */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {filteredSchedule.map((match) => {
          const attendingMembers = match.attendingMemberIds
            .map((id) => memberMap.get(id))
            .filter((m): m is AceVivaMember => Boolean(m));

          return (
            <div
              key={match.id}
              className="rounded-[2rem] bg-[#D5EFE9]/75 p-1.5 ring-1 ring-[#5BAE84]/25 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#5BAE84]/25"
            >
              <div className="flex h-full flex-col justify-between rounded-[calc(2rem-0.375rem)] bg-white p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] sm:p-7">
                <div>
                  {/* Match Top Meta */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#212047]/10 pb-4">
                    <span className="font-mono-num text-[11px] font-bold tracking-[0.18em] text-[#4FA87D] uppercase">
                      {match.weekLabel}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-[#212047] px-3 py-0.5 font-mono-num text-xs font-bold text-white">
                        {match.date}
                      </span>
                      <span className="font-mono-num text-xs font-semibold text-[#212047]/70">
                        {match.dayOfWeek} · {match.time}
                      </span>
                    </div>
                  </div>

                  {/* Match Title & Opponent */}
                  <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-black text-[#212047] sm:text-2xl">
                        {match.themeTitle}
                      </h3>
                      <p className="mt-1 text-xs font-medium text-[#212047]/65">
                        {match.themeSubtitle}
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#F4FAF8] px-3.5 py-2 text-right ring-1 ring-[#5BAE84]/25">
                      <div className="font-mono-num text-[10px] tracking-[0.15em] text-[#4FA87D] uppercase">
                        MATCHUP 對戰組合
                      </div>
                      <div className="text-xs font-extrabold text-[#212047]">
                        臺中連莊 vs {match.opponent}
                      </div>
                    </div>
                  </div>

                  {/* Attending Roster Chips */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <span className="font-mono-num text-[10px] font-bold tracking-[0.2em] text-[#212047]/55 uppercase">
                        ATTENDING ACE VIVA · 當日出席女孩名單 ({attendingMembers.length} 人)
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {attendingMembers.map((m) => {
                        const isHighlighted =
                          selectedMemberId === m.id ||
                          (selectedMemberId === 'favorites' &&
                            favoriteIds.includes(m.id));
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => onOpenMemberDetail(m)}
                            className={`group flex items-center gap-2 rounded-full py-1 pr-3 pl-1.5 text-xs font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] ${
                              isHighlighted
                                ? 'bg-[#5BAE84] text-white ring-2 ring-[#212047]'
                                : 'bg-[#F4FAF8] text-[#212047] ring-1 ring-[#212047]/10 hover:bg-[#212047] hover:text-white'
                            }`}
                          >
                            <MemberPortrait
                              member={m}
                              variant="avatar"
                              className="h-6 w-6 rounded-full"
                            />
                            <span className="font-mono-num text-[10px] opacity-70">
                              #{m.number}
                            </span>
                            <span>{m.name}</span>
                            {m.nationality === 'KR' && (
                              <span className="font-mono-num text-[9px] text-[#4FA87D] group-hover:text-[#7ADAD0]">
                                KR
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Highlight Footer */}
                <div className="mt-6 flex items-center gap-2.5 rounded-xl bg-[#E6F5F1] px-4 py-2.5 text-xs text-[#212047]">
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
