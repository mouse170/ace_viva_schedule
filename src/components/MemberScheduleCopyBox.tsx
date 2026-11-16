import React, { useMemo, useState } from 'react';
import { MEMBERS, type AceVivaMember } from '../data/members';
import { formatMemberScheduleCopyText } from '../data/memberRelations';
import { ACTIVE_STATION_ROTATION_SCHEDULES } from '../data/schedule';
import { useLanguage } from '../i18n/LanguageContext';

interface MemberScheduleCopyBoxProps {
  member: AceVivaMember;
  activeMatchId?: string;
  variant?: 'dark' | 'light';
}

export const MemberScheduleCopyBox: React.FC<MemberScheduleCopyBoxProps> = ({
  member,
  activeMatchId,
  variant = 'light',
}) => {
  const { lang, t } = useLanguage();
  const [scope, setScope] = useState<'single' | 'all'>(
    activeMatchId ? 'single' : 'all'
  );
  const [selectedMatchId, setSelectedMatchId] = useState<string>(
    activeMatchId ?? ACTIVE_STATION_ROTATION_SCHEDULES[0]?.matchId ?? ''
  );
  const [includeTeammates, setIncludeTeammates] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const effectiveMatchId = activeMatchId && scope === 'single' ? activeMatchId : selectedMatchId;

  const memberMap = useMemo(() => {
    const map = new Map<string, AceVivaMember>();
    for (const m of MEMBERS) {
      map.set(m.id, m);
    }
    return map;
  }, []);

  const previewText = useMemo(
    () =>
      formatMemberScheduleCopyText({
        member,
        scope,
        matchId: effectiveMatchId,
        includeTeammates,
        memberMap,
        lang,
      }),
    [member, scope, effectiveMatchId, includeTeammates, memberMap, lang]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(previewText);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = previewText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const isDark = variant === 'dark';

  return (
    <div
      className={`rounded-2xl p-3.5 ${
        isDark
          ? 'border border-white/15 bg-white/8 text-white'
          : 'border border-[#5BAE84]/35 bg-[#F4FAF8] text-[#212047]'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`font-mono-num text-[10px] font-bold tracking-[0.08em] sm:tracking-[0.12em] ${
              isDark ? 'text-[#7ADAD0]' : 'text-[#3F8E67]'
            }`}
          >
            <span className="sm:hidden">🟦A 🟩B 🟨C</span>
            <span className="hidden sm:inline">
              {t('站位文字複製（🟦A / 🟩B / 🟨C）', '응원 구역 일정 복사 (🟦A / 🟩B / 🟨C)')}
            </span>
          </span>
          <div className="flex items-center gap-1">
            {ACTIVE_STATION_ROTATION_SCHEDULES.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={() => setScope('single')}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold whitespace-nowrap transition-colors sm:px-2.5 sm:text-[11px] ${
                    scope === 'single'
                      ? 'bg-[#5BAE84] text-white'
                      : isDark
                        ? 'bg-white/10 text-white/75 hover:bg-white/20'
                        : 'bg-white text-[#212047]/70 ring-1 ring-[#212047]/15'
                  }`}
                >
                  <span className="sm:hidden">{t('單場', '1경기')}</span>
                  <span className="hidden sm:inline">{t('單場次', '한 경기')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setScope('all')}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold whitespace-nowrap transition-colors sm:px-2.5 sm:text-[11px] ${
                    scope === 'all'
                      ? 'bg-[#5BAE84] text-white'
                      : isDark
                        ? 'bg-white/10 text-white/75 hover:bg-white/20'
                        : 'bg-white text-[#212047]/70 ring-1 ring-[#212047]/15'
                  }`}
                >
                  <span className="sm:hidden">{t('全部', '전체')}</span>
                  <span className="hidden sm:inline">{t('全部近期場次', '전체 일정')}</span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setIncludeTeammates((prev) => !prev)}
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold whitespace-nowrap transition-colors sm:px-2.5 sm:text-[11px] ${
                includeTeammates
                  ? isDark
                    ? 'bg-[#7ADAD0] text-[#212047]'
                    : 'bg-[#212047] text-[#7ADAD0]'
                  : isDark
                    ? 'bg-white/10 text-white/75 hover:bg-white/20'
                    : 'bg-white text-[#212047]/70 ring-1 ring-[#212047]/15'
              }`}
            >
              <span className="sm:hidden">{includeTeammates ? t('✓隊友', '✓동료') : t('+隊友', '+동료')}</span>
              <span className="hidden sm:inline">
                {includeTeammates ? t('✓ 含同區隊友', '✓ 같은 구역 포함') : t('+ 同區隊友', '+ 같은 구역')}
              </span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-extrabold whitespace-nowrap transition-all active:scale-[0.97] sm:gap-1.5 sm:px-3.5 sm:text-xs ${
            copied
              ? 'bg-[#5BAE84] text-white'
              : isDark
                ? 'bg-[#7ADAD0] text-[#212047] hover:bg-white'
                : 'bg-[#212047] text-[#7ADAD0] hover:bg-[#5BAE84] hover:text-white'
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            className="h-3.5 w-3.5 shrink-0"
            aria-hidden="true"
          >
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeLinecap="round" />
          </svg>
          <span>{copied ? t('已複製', '복사됨') : t('複製', '복사')}</span>
        </button>
      </div>

      {scope === 'single' && !activeMatchId && ACTIVE_STATION_ROTATION_SCHEDULES.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {ACTIVE_STATION_ROTATION_SCHEDULES.map((sched) => {
            const active = selectedMatchId === sched.matchId;
            return (
              <button
                key={sched.matchId}
                type="button"
                onClick={() => setSelectedMatchId(sched.matchId)}
                className={`rounded-lg px-2.5 py-1 font-mono-num text-[11px] font-bold transition-colors ${
                  active
                    ? 'bg-[#5BAE84] text-white'
                    : isDark
                      ? 'bg-white/10 text-white/75 hover:bg-white/20'
                      : 'bg-white text-[#212047]/75 ring-1 ring-[#212047]/12'
                }`}
              >
                {sched.dateLabel}
              </button>
            );
          })}
        </div>
      )}

      <pre
        className={`mt-2.5 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-xl p-2.5 font-mono-num text-[11px] leading-relaxed ${
          isDark
            ? 'bg-[#171636] text-white/90 ring-1 ring-white/10'
            : 'bg-white text-[#212047] ring-1 ring-[#212047]/10'
        }`}
      >
        {previewText}
      </pre>
    </div>
  );
};
