import React, { useEffect, useId, useRef } from 'react';
import type { AceVivaMember } from '../data/members';
import { HOME_SCHEDULE } from '../data/schedule';
import { MemberPortrait } from './MemberPortrait';

interface MemberDetailDialogProps {
  member: AceVivaMember | null;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onClose: () => void;
  onSelectScheduleMember: (memberId: string) => void;
}

export const MemberDetailDialog: React.FC<MemberDetailDialogProps> = ({
  member,
  isFavorite,
  onToggleFavorite,
  onClose,
  onSelectScheduleMember,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  // Open or close native modal <dialog> via showModal()
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (member) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [member]);

  // Fallback for browsers without native closedby="any" support per modern-web-guidance
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      dialog.returnValue = '';
      onClose();
    };

    dialog.addEventListener('close', handleClose);

    let cleanupFallback: (() => void) | undefined;
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      const handleBackdropClick = (event: MouseEvent) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;
        if (isDialogContent) return;
        dialog.close();
      };
      dialog.addEventListener('click', handleBackdropClick);
      cleanupFallback = () => dialog.removeEventListener('click', handleBackdropClick);
    }

    return () => {
      dialog.removeEventListener('close', handleClose);
      if (cleanupFallback) cleanupFallback();
    };
  }, [onClose]);

  const attendingMatches = member
    ? HOME_SCHEDULE.filter((match) => match.attendingMemberIds.includes(member.id))
    : [];

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: 'any' } as React.DialogHTMLAttributes<HTMLDialogElement>)}
      aria-labelledby={titleId}
      className="m-auto max-h-[90dvh] w-[calc(100%-1.5rem)] max-w-4xl overflow-y-auto rounded-[2rem] bg-transparent p-0 text-[#212047] shadow-[0_32px_90px_-15px_rgba(33,32,71,0.5)] open:block"
    >
      {member && (
        /* Double-Bezel Outer Shell */
        <div className="rounded-[2rem] bg-[#D5EFE9] p-1.5 ring-1 ring-[#212047]/12 sm:p-2">
          {/* Inner Core */}
          <div className="relative overflow-hidden rounded-[calc(2rem-0.375rem)] bg-[#F4FAF8] shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]">
            {/* Top Utility Bar */}
            <div className="flex items-center justify-between border-b border-[#212047]/[0.08] bg-white/70 px-6 py-4 sm:px-8">
              <div className="flex items-center gap-2.5">
                <img
                  src="./images/logo.png"
                  alt="Ace Viva Logo"
                  className="h-6 w-6 rounded-full object-contain"
                />
                <span className="font-mono-num text-[11px] font-bold tracking-[0.2em] text-[#212047]/70 uppercase">
                  ACE VIVA OFFICIAL DOSSIER · {member.roleBadge}
                </span>
              </div>
              <form method="dialog">
                <button
                  type="submit"
                  autoFocus
                  aria-label="關閉成員詳細檔案"
                  className="group flex items-center gap-2 rounded-full bg-[#212047]/[0.06] px-4 py-1.5 text-xs font-semibold text-[#212047] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#212047] hover:text-white active:scale-[0.97]"
                >
                  <span>關閉 ESC</span>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#212047]/10 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:rotate-90 group-hover:bg-white/20">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.25"
                      className="h-3.5 w-3.5"
                    >
                      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>
              </form>
            </div>

            {/* Content Split Grid */}
            <div className="grid grid-cols-1 gap-8 p-6 sm:p-8 md:grid-cols-12">
              {/* Left Column: Official Typewriter Portrait & Quick Actions */}
              <div className="flex flex-col gap-4 md:col-span-5">
                <div className="rounded-[1.6rem] bg-[#5BAE84]/15 p-1.5 ring-1 ring-[#212047]/10">
                  <MemberPortrait
                    member={member}
                    variant="modal"
                    className="aspect-[3/4] w-full rounded-[calc(1.6rem-0.375rem)]"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2.5">
                  <a
                    href={member.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex w-full items-center justify-between rounded-full bg-[#212047] py-2.5 pr-2.5 pl-6 text-sm font-semibold text-white transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#2E2C5E] active:scale-[0.98]"
                  >
                    <span>前往 Instagram (@{member.instagramHandle})</span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5BAE84] text-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-105">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        className="h-4 w-4"
                      >
                        <path d="M7 17L17 7M17 7H8M17 7V16" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </a>

                  <button
                    type="button"
                    onClick={() => onToggleFavorite(member.id)}
                    className={`group flex w-full items-center justify-between rounded-full py-2.5 pr-2.5 pl-6 text-sm font-semibold transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] ${
                      isFavorite
                        ? 'bg-[#5BAE84] text-white'
                        : 'bg-[#212047]/[0.06] text-[#212047] hover:bg-[#212047]/[0.12]'
                    }`}
                  >
                    <span>
                      {isFavorite ? '已加入「我的主推」名單' : '加入「我的主推」收藏夾'}
                    </span>
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105 ${
                        isFavorite ? 'bg-white/20 text-white' : 'bg-[#5BAE84]/20 text-[#3F8E67]'
                      }`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill={isFavorite ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth="1.25"
                        className="h-4 w-4"
                      >
                        <path
                          d="M12 20.5s-7.5-4.35-9.5-8.6C1.1 8.8 3.2 5 6.8 5c2.1 0 3.9 1.2 5.2 2.9C13.3 6.2 15.1 5 17.2 5c3.6 0 5.7 3.8 4.3 6.9-2 4.25-9.5 8.6-9.5 8.6z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>
                </div>
              </div>

              {/* Right Column: Editorial Bio, Attributes, Career & Schedule */}
              <div className="flex flex-col justify-between gap-6 md:col-span-7">
                <div>
                  {/* Header Identity */}
                  <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-[#212047]/10 pb-5">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="rounded-full bg-[#212047] px-3 py-0.5 font-mono-num text-[10px] font-semibold tracking-[0.2em] text-[#7ADAD0] uppercase">
                          {member.category === 'mc'
                            ? `OFFICIAL MC · #${member.number}`
                            : `JERSEY #${member.number}`}
                        </span>
                        <span className="font-mono-num text-xs tracking-[0.18em] text-[#212047]/60 uppercase">
                          {member.englishOrKoreanName}
                        </span>
                      </div>
                      <h2
                        id={titleId}
                        className="mt-2.5 flex items-baseline gap-3 text-3xl font-black tracking-tight text-[#212047] sm:text-4xl"
                      >
                        <span>{member.name}</span>
                        {member.realOrAltName && (
                          <span className="text-base font-medium text-[#212047]/60">
                            （{member.realOrAltName}）
                          </span>
                        )}
                      </h2>
                    </div>

                    <div className="font-editorial text-5xl font-bold tracking-tighter text-[#4FA87D] italic">
                      #{member.number}
                    </div>
                  </div>

                  {/* Tagline & Bio */}
                  <p className="mt-4 text-base font-bold text-[#212047]">
                    「{member.tagline}」
                  </p>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#212047]/80">
                    {member.bio}
                  </p>

                  {/* Key Metadata Grid (Including Official MBTI) */}
                  <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-[#212047]/[0.08]">
                      <div className="font-mono-num text-[10px] tracking-[0.18em] text-[#212047]/50 uppercase">
                        BIRTHDAY 生日
                      </div>
                      <div className="mt-1 text-sm font-bold text-[#212047]">
                        {member.birthday}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-[#212047]/[0.08]">
                      <div className="font-mono-num text-[10px] tracking-[0.18em] text-[#212047]/50 uppercase">
                        ZODIAC 星座
                      </div>
                      <div className="mt-1 text-sm font-bold text-[#212047]">
                        {member.zodiac}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-[#E6F5F1] px-4 py-3 ring-1 ring-[#5BAE84]/30">
                      <div className="font-mono-num text-[10px] tracking-[0.18em] text-[#3F8E67] uppercase">
                        OFFICIAL MBTI
                      </div>
                      <div className="mt-1 font-mono-num text-sm font-extrabold text-[#212047]">
                        {member.mbti}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-[#212047]/[0.08]">
                      <div className="font-mono-num text-[10px] tracking-[0.18em] text-[#212047]/50 uppercase">
                        NUMBER 背號
                      </div>
                      <div className="mt-1 font-mono-num text-sm font-bold text-[#4FA87D]">
                        #{member.number}
                      </div>
                    </div>
                  </div>

                  {/* Dual Teams Badges */}
                  {member.dualTeams.length > 0 && (
                    <div className="mt-5">
                      <div className="font-mono-num text-[10px] tracking-[0.2em] text-[#212047]/55 uppercase">
                        ACTIVE DUAL IDENTITIES · 同步活躍身分與雙棲團隊
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {member.dualTeams.map((team) => (
                          <span
                            key={team}
                            className="rounded-full bg-[#5BAE84]/15 px-3.5 py-1 text-xs font-bold text-[#212047] ring-1 ring-[#5BAE84]/35"
                          >
                            {team}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Career Timeline */}
                  <div className="mt-6">
                    <div className="font-mono-num text-[10px] tracking-[0.2em] text-[#212047]/55 uppercase">
                      CAREER CHRONICLE · 應援與演藝資歷
                    </div>
                    <div className="mt-2.5 space-y-2">
                      {member.career.map((item, idx) => (
                        <div
                          key={`${item.team}-${idx}`}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-4 py-2.5 ring-1 ring-[#212047]/[0.07]"
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                item.isCurrent ? 'bg-[#5BAE84]' : 'bg-[#212047]/25'
                              }`}
                            />
                            <span className="text-xs font-bold text-[#212047]">
                              {item.team}
                            </span>
                            <span className="text-[11px] text-[#212047]/55">
                              ({item.league})
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="rounded-md bg-[#E6F5F1] px-2 py-0.5 text-[11px] font-semibold text-[#212047]">
                              {item.role}
                            </span>
                            <span className="font-mono-num text-[11px] text-[#212047]/55">
                              {item.period}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Upcoming Home Match Attendance Preview */}
                <div className="rounded-2xl bg-[#212047] p-4 text-white">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="font-mono-num text-[10px] tracking-[0.2em] text-[#7ADAD0] uppercase">
                        HOME COURT SCHEDULE · 近期主場出席預告
                      </span>
                      <div className="mt-0.5 text-xs text-white/75">
                        已排定出席 {attendingMatches.length} 場臺中連莊主場賽事
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        dialogRef.current?.close();
                        onSelectScheduleMember(member.id);
                      }}
                      className="rounded-full bg-[#5BAE84] px-3.5 py-1.5 text-xs font-bold text-white transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-[#4FA87D] active:scale-[0.97]"
                    >
                      在班表中篩選她 →
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {attendingMatches.map((match) => (
                      <span
                        key={match.id}
                        className="rounded-lg border border-white/15 bg-white/10 px-2.5 py-1 font-mono-num text-[11px] text-white/90"
                      >
                        {match.date} ({match.dayOfWeek.split(' ')[0]}) vs {match.opponent}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
};
