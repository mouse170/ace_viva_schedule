import React, { useMemo, useState } from 'react';
import { MEMBERS, type AceVivaMember } from '../data/members';
import { getEffectiveTodayIso } from '../data/schedule';
import { THEME_WEEK_EVENTS } from '../data/themeEvents';
import { useLanguage } from '../i18n/LanguageContext';
import { MemberPortrait } from './MemberPortrait';

interface ThemeEventSectionProps {
  onOpenMemberDetail: (member: AceVivaMember) => void;
}

export const ThemeEventSection: React.FC<ThemeEventSectionProps> = ({
  onOpenMemberDetail,
}) => {
  const { lang, t, getMemberName } = useLanguage();
  const todayIso = getEffectiveTodayIso();

  const activeThemeWeek = useMemo(() => {
    const active = THEME_WEEK_EVENTS.filter((w) => w.endDateIso >= todayIso);
    return active[0] ?? null;
  }, [todayIso]);

  const [selectedMatchId, setSelectedMatchId] = useState<string>(
    () => activeThemeWeek?.days[0]?.matchId ?? ''
  );

  const memberMap = useMemo(() => {
    const map = new Map<string, AceVivaMember>();
    for (const m of MEMBERS) {
      map.set(m.id, m);
    }
    return map;
  }, []);

  if (!activeThemeWeek) return null;

  const activeDay =
    activeThemeWeek.days.find((d) => d.matchId === selectedMatchId) ??
    activeThemeWeek.days[0];

  const signingMembers = activeDay.signingSession.memberIds
    .map((id) => memberMap.get(id))
    .filter((m): m is AceVivaMember => Boolean(m));

  const isKo = lang === 'ko';

  return (
    <section
      id="theme-event-section"
      className="relative mx-auto max-w-[1440px] px-3 py-14 sm:px-6 sm:py-20 lg:px-10"
    >
      {/* Section Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#212047]/10 pb-6 lg:flex-row lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#212047] px-3 py-1 font-mono-num text-[10px] font-bold tracking-[0.14em] text-[#7ADAD0] lg:px-4 lg:py-1.5 lg:text-xs">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#5BAE84]" />
              <span>{t(activeThemeWeek.badge, '테마 주간 이벤트 안내')}</span>
            </span>
            <a
              href={activeThemeWeek.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-[#E6F5F1] px-2.5 py-1 font-mono-num text-[10px] font-extrabold text-[#3F8E67] ring-1 ring-[#5BAE84]/35 transition-colors hover:bg-[#5BAE84] hover:text-white lg:text-xs"
            >
              <span>{t('官方活動公告', '공식 공지 보기')}</span>
              <span>↗</span>
            </a>
          </div>
          <h2 className="mt-2.5 text-2xl font-black tracking-tight text-[#212047] sm:text-4xl lg:text-5xl">
            {activeThemeWeek.dateRange}{' '}
            {isKo ? activeThemeWeek.titleKo : activeThemeWeek.title}
          </h2>
        </div>

        {/* Day Switcher */}
        <div className="flex flex-wrap gap-1.5 rounded-2xl bg-[#D5EFE9] p-1.5 ring-1 ring-[#5BAE84]/35 sm:rounded-full lg:self-end">
          {activeThemeWeek.days.map((day) => {
            const isSelected = day.matchId === activeDay.matchId;
            return (
              <button
                key={day.matchId}
                type="button"
                onClick={() => setSelectedMatchId(day.matchId)}
                className={`rounded-xl px-3 py-2 text-center text-xs font-extrabold transition-all duration-300 sm:rounded-full sm:px-4 sm:whitespace-nowrap lg:px-5 lg:py-2.5 lg:text-sm ${
                  isSelected
                    ? 'bg-[#212047] text-white shadow-sm'
                    : 'text-[#212047]/75 hover:bg-white/60 hover:text-[#212047]'
                }`}
              >
                {day.dayShort} {t('對戰', 'vs')} {day.opponent}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Theme Event Shell */}
      <div className="mt-6 rounded-[1.75rem] bg-[#D5EFE9] p-1.5 ring-1 ring-[#5BAE84]/35 sm:mt-8 sm:rounded-[2rem] sm:p-2">
        <div className="rounded-[calc(1.75rem-0.375rem)] bg-white p-3.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] sm:rounded-[calc(2rem-0.375rem)] sm:p-7 lg:p-8">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:gap-6">
            {/* Left 7 Cols: Pre-Game Signing + Post-Game Stage + Entry Gifts */}
            <div className="space-y-4 lg:col-span-7">
              {/* 1. Pre-Game Signing Session Card */}
              <div className="rounded-3xl bg-[#212047] p-4 text-white shadow-lg ring-1 ring-[#5ECBC0]/35 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-[#5BAE84] px-3 py-0.5 font-mono-num text-[10px] font-black tracking-wider text-white lg:text-xs">
                    {t('賽前限定活動', '경기 전 한정 이벤트')}
                  </span>
                  <span className="font-mono-num text-xs font-extrabold text-[#7ADAD0]">
                    {t(
                      `集合 ${activeDay.signingSession.gatherTime} · 簽名 ${activeDay.signingSession.startTime}–${activeDay.signingSession.endTime}`,
                      `집합 ${activeDay.signingSession.gatherTime} · 사인 ${activeDay.signingSession.startTime}–${activeDay.signingSession.endTime}`
                    )}
                  </span>
                </div>

                <h3 className="mt-2.5 text-xl font-black text-white sm:text-2xl">
                  {isKo
                    ? activeDay.signingSession.titleKo
                    : activeDay.signingSession.title}
                </h3>

                {/* Attending 3 Cheerleaders for Pre-Game Signing */}
                <div className="mt-3.5 grid grid-cols-3 gap-2 sm:gap-3">
                  {signingMembers.map((m) => (
                    <button
                      key={`signing-${m.id}`}
                      type="button"
                      onClick={() => onOpenMemberDetail(m)}
                      className="group flex flex-col items-center rounded-2xl bg-white/10 p-2.5 text-center ring-1 ring-white/15 transition-all hover:bg-[#5BAE84]/30 hover:ring-[#5ECBC0]"
                    >
                      <MemberPortrait
                        member={m}
                        variant="avatar"
                        className="h-14 w-14 rounded-full ring-2 ring-[#5ECBC0] transition-transform group-hover:scale-105 sm:h-16 sm:w-16"
                      />
                      <span className="mt-1.5 font-mono-num text-[10px] font-bold text-[#7ADAD0]">
                        #{m.number}
                      </span>
                      <span className="truncate text-xs font-black text-white sm:text-sm">
                        {getMemberName(m)}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Qualification & Rules */}
                <div className="mt-4 rounded-2xl bg-[#181736] p-3.5 ring-1 ring-white/10">
                  <div className="text-xs font-extrabold text-[#5ECBC0] sm:text-sm">
                    {isKo
                      ? activeDay.signingSession.qualificationKo
                      : activeDay.signingSession.qualification}
                  </div>
                  <ul className="mt-2 space-y-1 text-[11px] leading-relaxed text-white/80 sm:text-xs">
                    {(isKo
                      ? activeDay.signingSession.rulesKo
                      : activeDay.signingSession.rules
                    ).map((rule) => (
                      <li key={rule} className="flex items-start gap-1.5">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5BAE84]" />
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* 2. Post-Game Special Events */}
              {activeDay.postGameEvents.map((ev) => (
                <div
                  key={ev.title}
                  className="rounded-2xl border border-[#5BAE84]/40 bg-[#F4FAF8] p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-[#212047] px-2.5 py-0.5 font-mono-num text-[10px] font-extrabold text-[#7ADAD0]">
                      {t('賽後特別企劃', '경기 후 스페셜 이벤트')}
                    </span>
                    <span className="rounded-full bg-[#5BAE84]/20 px-2.5 py-0.5 text-[11px] font-extrabold text-[#3F8E67]">
                      {isKo ? ev.eligibilityKo : ev.eligibility}
                    </span>
                  </div>
                  <h4 className="mt-2 text-base font-black text-[#212047] sm:text-lg">
                    {isKo ? ev.titleKo : ev.title}
                  </h4>
                  <ul className="mt-2 space-y-1 text-xs leading-relaxed text-[#212047]/80">
                    {(isKo ? ev.notesKo : ev.notes).map((note) => (
                      <li key={note} className="flex items-start gap-1.5">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5BAE84]" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* 3. Entry Gifts (1F Tiger Zone) */}
              <div className="rounded-2xl bg-[#E6F5F1] p-4 ring-1 ring-[#5BAE84]/35 sm:p-5">
                <div className="font-mono-num text-[10px] font-extrabold tracking-wider text-[#3F8E67] lg:text-xs">
                  {isKo
                    ? activeThemeWeek.entryGiftsTitleKo
                    : activeThemeWeek.entryGiftsTitle}
                </div>
                <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {activeThemeWeek.entryGifts.map((gift) => (
                    <div
                      key={gift.name}
                      className="rounded-xl bg-white p-3 ring-1 ring-[#212047]/[0.07]"
                    >
                      <div className="text-xs font-black text-[#212047] sm:text-sm">
                        {isKo ? gift.nameKo : gift.name}
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-[#212047]/70">
                        {isKo ? gift.detailKo : gift.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Full Match-Day Activity Timeline */}
            <div className="rounded-3xl bg-[#F4FAF8] p-4 ring-1 ring-[#5BAE84]/30 sm:p-6 lg:col-span-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#212047]/10 pb-3">
                <div>
                  <div className="font-mono-num text-[10px] font-extrabold tracking-[0.14em] text-[#4FA87D]">
                    {t('活動時間軸', '당일 타임테이블')}
                  </div>
                  <h3 className="mt-0.5 text-lg font-black text-[#212047]">
                    {activeDay.dateLabel} vs {activeDay.opponent}
                  </h3>
                </div>
                <span className="rounded-full bg-[#212047] px-2.5 py-1 font-mono-num text-[10px] font-bold text-[#7ADAD0]">
                  {t('10:00 開門至賽後', '10:00 오픈 ~ 종료')}
                </span>
              </div>

              <div className="mt-3.5 space-y-2">
                {activeDay.timeline.map((step, idx) => {
                  const isPre = step.highlight === 'pregame';
                  const isStage = step.highlight === 'stage';
                  const isPost = step.highlight === 'postgame';
                  return (
                    <div
                      key={`${step.time}-${step.project}-${idx}`}
                      className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-xs sm:text-sm ${
                        isPre
                          ? 'bg-[#212047] font-extrabold text-white ring-1 ring-[#5ECBC0]'
                          : isPost
                            ? 'bg-[#5BAE84]/20 font-extrabold text-[#212047] ring-1 ring-[#5BAE84]/50'
                            : isStage
                              ? 'bg-[#E6F5F1] font-bold text-[#212047] ring-1 ring-[#5BAE84]/35'
                              : 'bg-white font-semibold text-[#212047]/85 ring-1 ring-[#212047]/[0.06]'
                      }`}
                    >
                      <span
                        className={`w-12 shrink-0 font-mono-num text-xs font-black ${
                          isPre
                            ? 'text-[#7ADAD0]'
                            : isPost || isStage
                              ? 'text-[#3F8E67]'
                              : 'text-[#4FA87D]'
                        }`}
                      >
                        {step.time}
                      </span>
                      <span className="min-w-0 flex-1">
                        {isKo ? step.projectKo : step.project}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
