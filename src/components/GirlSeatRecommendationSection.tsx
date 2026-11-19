import React, { useMemo, useState } from 'react';
import { MEMBERS, type AceVivaMember } from '../data/members';
import {
  ACTIVE_STATION_ROTATION_SCHEDULES,
  CLOSEST_STATION_SCHEDULE,
  getGirlSeatRecommendations,
  getCrossZoneGoldenIntervals,
  getMultiFavoriteTopSeats,
  type AceZoneId,
  type GirlSetZoneRecommendation,
  type CrossZoneGoldenInterval,
} from '../data/schedule';
import { MemberPortrait } from './MemberPortrait';
import { MemberScheduleCopyBox } from './MemberScheduleCopyBox';
import { useLanguage } from '../i18n/LanguageContext';
import {
  OshiStrategyCardModal,
  type StrategyCardMode,
} from './OshiStrategyCardModal';

interface GirlSeatRecommendationSectionProps {
  favoriteIds: string[];
  onOpenMemberDetail: (member: AceVivaMember) => void;
  onJumpToSeatSimulator?: (
    matchId: string,
    zone: AceZoneId,
    seat: number,
    girlId?: string
  ) => void;
}

export const GirlSeatRecommendationSection: React.FC<
  GirlSeatRecommendationSectionProps
> = ({ favoriteIds, onOpenMemberDetail, onJumpToSeatSimulator }) => {
  const { t, getMemberName } = useLanguage();
  const [selectedMatchId, setSelectedMatchId] = useState<string>(
    CLOSEST_STATION_SCHEDULE.matchId
  );
  const [selectedGirlId, setSelectedGirlId] = useState<string>('yuri');
  const [isStrategyModalOpen, setIsStrategyModalOpen] =
    useState<boolean>(false);
  const [strategyModalMode, setStrategyModalMode] =
    useState<StrategyCardMode>('zone_hopping');
  const [strategyModalSeat, setStrategyModalSeat] = useState<{
    zone: AceZoneId;
    seat: number;
  } | null>(null);

  const memberMap = useMemo(() => {
    const map = new Map<string, AceVivaMember>();
    for (const m of MEMBERS) {
      map.set(m.id, m);
    }
    return map;
  }, []);

  const currentMatchSchedule = useMemo(
    () =>
      ACTIVE_STATION_ROTATION_SCHEDULES.find(
        (s) => s.matchId === selectedMatchId
      ) ?? CLOSEST_STATION_SCHEDULE,
    [selectedMatchId]
  );

  // Get all rotating cheerleaders for the selected match day
  const rotatingMemberIds = useMemo(() => {
    const set1 = currentMatchSchedule.sets[0].initial;
    return [...set1.A, ...set1.B, ...set1.C];
  }, [currentMatchSchedule]);

  const rotatingMembers = useMemo(
    () =>
      rotatingMemberIds
        .map((id) => memberMap.get(id))
        .filter((m): m is AceVivaMember => Boolean(m)),
    [rotatingMemberIds, memberMap]
  );

  const mcAndLeaderMembers = useMemo(
    () =>
      currentMatchSchedule.mcAndLeaderIds
        .map((id) => memberMap.get(id))
        .filter((m): m is AceVivaMember => Boolean(m)),
    [currentMatchSchedule, memberMap]
  );

  // Ensure selectedGirlId is valid for the current match day
  const activeGirl = useMemo(() => {
    const found = rotatingMembers.find((m) => m.id === selectedGirlId);
    if (found) return found;
    const favOnDuty = rotatingMembers.find((m) => favoriteIds.includes(m.id));
    return favOnDuty ?? rotatingMembers[0];
  }, [rotatingMembers, selectedGirlId, favoriteIds]);

  const recommendations: GirlSetZoneRecommendation[] = useMemo(
    () => getGirlSeatRecommendations(currentMatchSchedule, activeGirl.id),
    [currentMatchSchedule, activeGirl.id]
  );

  const primaryRec = recommendations[0];

  const crossZoneIntervals = useMemo(
    () => getCrossZoneGoldenIntervals(currentMatchSchedule, activeGirl.id),
    [currentMatchSchedule, activeGirl.id]
  );
  const topCrossZone: CrossZoneGoldenInterval | undefined =
    crossZoneIntervals[0];
  const secondaryCrossZone: CrossZoneGoldenInterval | undefined =
    crossZoneIntervals[1];

  const multiFavTopSeats = useMemo(
    () => getMultiFavoriteTopSeats(currentMatchSchedule, favoriteIds, 3),
    [currentMatchSchedule, favoriteIds]
  );

  return (
    <section
      id="girl-seat-guide-section"
      className="relative mx-auto max-w-[1440px] px-3 py-16 sm:px-6 sm:py-24 lg:px-10"
    >
      {/* Section Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#212047]/10 pb-6 lg:flex-row lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#212047] px-3 py-1 font-mono-num text-[10px] font-bold tracking-[0.14em] text-[#7ADAD0] lg:px-4 lg:py-1.5 lg:text-xs">
              <span className="h-2 w-2 shrink-0 rounded-full bg-[#5BAE84]" />
              <span>{t('女孩專屬黃金選位推薦', '치어리더별 추천 좌석 가이드')}</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#E6F5F1] px-2.5 py-1 font-mono-num text-[10px] font-extrabold text-[#3F8E67] ring-1 ring-[#5BAE84]/35 lg:text-xs">
              <span>{t('◀ 左 C 區 (23–16號) ↔ ▲ 中 B 區 (15–9號) ↔ 右 A 區 (8–1號) ▶', '◀ 좌 C구역 (23–16) ↔ ▲ 중 B구역 (15–9) ↔ 우 A구역 (8–1) ▶')}</span>
            </span>
          </div>
          <h2 className="mt-2.5 text-2xl font-black tracking-tight text-[#212047] sm:text-4xl lg:text-5xl">
            {t('以女孩為主的黃金座位推薦區間', '응원 멤버별 최적 좌석 추천 구간')}
          </h2>
        </div>

        {/* Dynamic Match Day Switcher + 1-Click Strategy Card Generator */}
        <div className="flex flex-wrap items-center gap-2 lg:self-end">
          <div className="flex flex-wrap gap-1.5 rounded-2xl bg-[#D5EFE9] p-1.5 ring-1 ring-[#5BAE84]/35 sm:rounded-full">
            {ACTIVE_STATION_ROTATION_SCHEDULES.map((sched, idx) => {
              const isActive = sched.matchId === currentMatchSchedule.matchId;
              return (
                <button
                  key={sched.matchId}
                  type="button"
                  onClick={() => setSelectedMatchId(sched.matchId)}
                  className={`rounded-xl px-3 py-2 text-center text-xs font-extrabold transition-all duration-300 sm:rounded-full sm:px-4 sm:whitespace-nowrap lg:px-5 lg:py-2.5 lg:text-sm ${
                    isActive
                      ? 'bg-[#212047] text-white shadow-sm'
                      : 'text-[#212047]/75 hover:bg-white/60 hover:text-[#212047]'
                  }`}
                >
                  {idx === 0 ? t('★ 最接近班表 · ', '★ 가장 가까운 경기 · ') : ''}
                  {sched.dateLabel.split(' ')[0]} {t('對戰', 'vs')} {sched.opponent}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Multi-Favorite Combined Top 3 Seats Card (Auto-shown when >= 2 favorites are on duty) */}
      {multiFavTopSeats.length > 0 && (
        <div className="mt-6 rounded-[1.75rem] bg-[#D5EFE9] p-1.5 ring-1 ring-[#5BAE84]/35 sm:mt-8 sm:rounded-[2rem] sm:p-2">
          <div className="rounded-[calc(1.75rem-0.375rem)] bg-[#212047] p-4 text-white shadow-lg sm:rounded-[calc(2rem-0.375rem)] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-3.5">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#5ECBC0] px-2.5 py-0.5 font-mono-num text-[10px] font-black text-[#212047] lg:text-xs">
                    {t('🏆 多主推綜合選位 Top 3', '🏆 다중 최애 종합 좌석 Top 3')}
                  </span>
                  <span className="font-mono-num text-[11px] font-bold text-[#7ADAD0]">
                    {t(
                      `已分析 ${multiFavTopSeats[0].totalFavsOnDuty} 位當日輪替主推 · 8 席黃金區`,
                      `당일 출석 최애 ${multiFavTopSeats[0].totalFavsOnDuty}명 분석 · 8석 황금 구간`
                    )}
                  </span>
                </div>
                <h3 className="mt-1.5 text-lg font-black text-white sm:text-2xl">
                  {t(
                    '一次看最多主推的黃金座位排行',
                    '최애 멤버를 가장 많이 볼 수 있는 추천 좌석'
                  )}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStrategyModalSeat({
                    zone: multiFavTopSeats[0].zone,
                    seat: multiFavTopSeats[0].seat,
                  });
                  setStrategyModalMode('seat_radar');
                  setIsStrategyModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#5BAE84] px-3.5 py-2 text-xs font-black text-white shadow-xs transition-transform hover:bg-[#3F8E67] active:scale-95"
              >
                <span>
                  {t(
                    `生成 #1 (${multiFavTopSeats[0].zone}${multiFavTopSeats[0].seat}) 合併雷達圖 ↓`,
                    `#1 (${multiFavTopSeats[0].zone}${multiFavTopSeats[0].seat}) 통합 레이더 이미지 ↓`
                  )}
                </span>
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              {multiFavTopSeats.map((item) => {
                const isFirst = item.rank === 1;
                const rangeLabel =
                  item.seatRange[0] === item.seatRange[1]
                    ? `${item.seat} 號`
                    : `${item.seatRange[0]}–${item.seatRange[1]} 號`;
                return (
                  <div
                    key={`multi-fav-top-${item.rank}-${item.zone}-${item.seat}`}
                    className={`flex flex-col justify-between rounded-2xl p-3.5 transition-all sm:p-4 ${
                      isFirst
                        ? 'bg-[#181736] ring-2 ring-[#5ECBC0]'
                        : 'bg-white/[0.07] ring-1 ring-white/15'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 font-mono-num text-[11px] font-black ${
                            isFirst
                              ? 'bg-[#5ECBC0] text-[#212047]'
                              : 'bg-white/15 text-[#7ADAD0]'
                          }`}
                        >
                          #{item.rank} {isFirst ? t('最推薦', 'BEST') : ''}
                        </span>
                        <span className="font-mono-num text-[11px] font-bold text-[#7ADAD0]">
                          {t(
                            `涵蓋 ${item.uniqueFavsCovered}/${item.totalFavsOnDuty} 位 · ${item.totalNearPhases} 階段`,
                            `${item.uniqueFavsCovered}/${item.totalFavsOnDuty}명 · ${item.totalNearPhases}단계`
                          )}
                        </span>
                      </div>

                      <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-xl font-black text-white sm:text-2xl">
                          2F {item.zone} 區 {item.seat} 號
                        </span>
                        <span className="font-mono-num text-xs font-bold text-[#5ECBC0]">
                          ({t('推薦', '추천')} {rangeLabel})
                        </span>
                      </div>

                      {/* Per-Favorite Hit Avatars */}
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {item.memberHits.map((hit) => {
                          const m = memberMap.get(hit.memberId);
                          if (!m) return null;
                          const hasHit = hit.nearPhases > 0;
                          return (
                            <button
                              key={`hit-${item.rank}-${m.id}`}
                              type="button"
                              onClick={() => onOpenMemberDetail(m)}
                              className={`inline-flex items-center gap-1 rounded-full py-0.5 pr-2 pl-0.5 font-mono-num text-[10px] font-extrabold ${
                                hasHit
                                  ? 'bg-[#5BAE84]/25 text-[#A7F3D0] ring-1 ring-[#5ECBC0]/50'
                                  : 'bg-white/5 text-white/45 ring-1 ring-white/10'
                              }`}
                            >
                              <MemberPortrait
                                member={m}
                                variant="avatar"
                                className="h-5 w-5 rounded-full"
                              />
                              <span>{getMemberName(m)}</span>
                              <span className="opacity-85">
                                {hasHit
                                  ? hit.coveredSetLabels.join('/')
                                  : t('無', '없음')}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {onJumpToSeatSimulator && (
                      <button
                        type="button"
                        onClick={() =>
                          onJumpToSeatSimulator(
                            currentMatchSchedule.matchId,
                            item.zone,
                            item.seat,
                            item.memberHits[0]?.memberId ?? activeGirl.id
                          )
                        }
                        className={`mt-3 inline-flex w-full items-center justify-center gap-1 rounded-xl px-3 py-1.5 font-mono-num text-xs font-extrabold transition-colors ${
                          isFirst
                            ? 'bg-[#5ECBC0] text-[#212047] hover:bg-white'
                            : 'bg-white/12 text-[#7ADAD0] hover:bg-[#5BAE84] hover:text-white'
                        }`}
                      >
                        <span>
                          {t(
                            `跳轉雷達模擬 ${item.zone}${item.seat} →`,
                            `${item.zone}${item.seat} 레이더 보기 →`
                          )}
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Girl Selector Pill Strip (Face-Focused Avatars) */}
      <div className="mt-6 rounded-[1.75rem] bg-[#D5EFE9] p-1.5 ring-1 ring-[#5BAE84]/35 sm:mt-8 sm:rounded-[2rem] sm:p-2">
        <div className="rounded-[calc(1.75rem-0.375rem)] bg-white p-3.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.95)] sm:rounded-[calc(2rem-0.375rem)] sm:p-6 lg:p-7">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5">
            <span className="font-mono-num text-[11px] font-extrabold tracking-[0.14em] text-[#212047] sm:text-xs lg:text-sm">
              {t(
                `點選當日出席女孩檢視 8 席黃金選位攻略（${rotatingMembers.length} 位輪換女孩）`,
                `당일 출석 멤버를 선택해 8석 황금 좌석 공략 보기 (${rotatingMembers.length}명)`
              )}
            </span>
            <span className="text-[11px] font-medium text-[#4FA87D] lg:text-xs">
              ★ {t('為已加入「我的主推」成員', '내 최애 멤버')}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-10">
            {rotatingMembers.map((m) => {
              const isSelected = m.id === activeGirl.id;
              const isFav = favoriteIds.includes(m.id);
              const rec1 = getGirlSeatRecommendations(
                currentMatchSchedule,
                m.id
              )[0];

              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedGirlId(m.id)}
                  className={`group relative flex min-w-0 flex-col items-center rounded-2xl p-2 text-center transition-all duration-300 active:scale-95 sm:p-2.5 lg:p-3 ${
                    isSelected
                      ? 'bg-[#212047] text-white shadow-[0_14px_30px_-8px_rgba(33,32,71,0.45)] ring-2 ring-[#5BAE84]'
                      : 'bg-[#F4FAF8] text-[#212047] ring-1 ring-[#212047]/10 hover:bg-[#E6F5F1]'
                  }`}
                >
                  {isFav && (
                    <span
                      className={`absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold lg:h-5 lg:w-5 lg:text-[10px] ${
                        isSelected
                          ? 'bg-[#5BAE84] text-white'
                          : 'bg-[#212047] text-[#7ADAD0]'
                      }`}
                    >
                      ★
                    </span>
                  )}
                  <MemberPortrait
                    member={m}
                    variant="avatar"
                    className={`h-13 w-13 rounded-full transition-transform duration-500 group-hover:scale-105 sm:h-16 sm:w-16 lg:h-18 lg:w-18 ${
                      isSelected
                        ? 'ring-2 ring-[#5ECBC0]'
                        : 'ring-1 ring-[#5BAE84]/35'
                    }`}
                  />
                  <div className="mt-1.5 font-mono-num text-[10px] font-bold text-[#4FA87D] group-hover:text-[#5ECBC0] lg:text-xs">
                    #{m.number}
                  </div>
                  <div className="w-full truncate text-xs font-black sm:text-sm lg:text-base">
                    {getMemberName(m)}
                  </div>
                  {rec1 && (
                    <div
                      className={`mt-1 rounded-full px-2 py-0.5 font-mono-num text-[9px] font-bold whitespace-nowrap lg:px-2.5 lg:text-[11px] ${
                        isSelected
                          ? 'bg-[#5BAE84] text-white'
                          : 'bg-[#D5EFE9] text-[#212047]'
                      }`}
                    >
                      {t(`首推 ${rec1.zone} 區`, `추천 ${rec1.zone}구역`)}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* EDM Poster Guide for Selected Girl (Golden 8-Seat Strategy + One-Set-One-Switch Route) */}
      <div className="mt-6 rounded-[1.75rem] bg-[#D5EFE9] p-1.5 ring-1 ring-[#5BAE84]/35 sm:mt-8 sm:rounded-[2rem] sm:p-2">
        <div className="overflow-hidden rounded-[calc(1.75rem-0.375rem)] bg-[#212047] text-white shadow-[0_24px_50px_-15px_rgba(33,32,71,0.45)] sm:rounded-[calc(2rem-0.375rem)]">
          {/* EDM Top Banner */}
          <div className="border-b border-white/15 bg-gradient-to-r from-[#212047] via-[#282658] to-[#1D3B3A] p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="flex items-center gap-3.5 sm:gap-5">
                <button
                  type="button"
                  onClick={() => onOpenMemberDetail(activeGirl)}
                  className="shrink-0 overflow-hidden rounded-2xl ring-2 ring-[#5ECBC0]"
                >
                  <MemberPortrait
                    member={activeGirl}
                    variant="avatar"
                    className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24"
                  />
                </button>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#5BAE84] px-2.5 py-0.5 font-mono-num text-[10px] font-extrabold tracking-wider text-white lg:text-xs">
                      {t('專屬 EDM 選位攻略', '전용 좌석 가이드 EDM')}
                    </span>
                    <span className="font-mono-num text-xs font-extrabold text-[#7ADAD0]">
                      #{activeGirl.number} · {currentMatchSchedule.dateLabel}
                    </span>
                  </div>
                  <h3 className="mt-1 text-2xl font-black text-white sm:text-3xl lg:text-4xl">
                    {getMemberName(activeGirl)}
                  </h3>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <a
                      href={activeGirl.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-full bg-[#5BAE84] px-3 py-1 font-mono-num text-xs font-black text-white transition-transform hover:bg-[#3F8E67] active:scale-95"
                    >
                      <span>IG @{activeGirl.instagramHandle}</span>
                      <span>↗</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => onOpenMemberDetail(activeGirl)}
                      className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-[#7ADAD0] hover:bg-white/25"
                    >
                      <span>{t('個人檔案', '프로필')}</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStrategyModalMode('zone_hopping');
                    setIsStrategyModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#5BAE84] px-4 py-2 text-xs font-black text-white shadow-sm transition-transform hover:bg-[#3F8E67] active:scale-95"
                >
                  <span>{t('換位＆跨區攻略圖 ↓', '이동 전략 카드 ↓')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStrategyModalMode('seat_radar');
                    setIsStrategyModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-[#7ADAD0] ring-1 ring-[#5ECBC0]/45 transition-transform hover:bg-[#5BAE84] hover:text-white active:scale-95"
                >
                  <span>{t('固定座位雷達圖 ↓', '좌석 레이더 카드 ↓')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* EDM Body: 1. Golden 8-Seat Ticket Strategy + 2. One-Set-One-Switch Route + 3. Schedule Copy */}
          <div className="space-y-5 p-4 sm:p-6 lg:p-8">
            {/* Row 1: Primary Zone + Cross-Zone Golden 8-Seat Intervals */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              {/* Primary Single-Zone Golden Pick */}
              {primaryRec && (
                <div className="flex flex-col justify-between rounded-2xl border border-[#5ECBC0]/40 bg-white/[0.07] p-4 sm:p-5 lg:col-span-5">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-[#5BAE84] px-2.5 py-0.5 font-mono-num text-[10px] font-black text-white lg:text-xs">
                        {t('🏆 單區黃金 8 席首選', '🏆 단일 구역 8석 추천')}
                      </span>
                      <span className="font-mono-num text-[11px] font-bold text-[#7ADAD0]">
                        {primaryRec.setShortLabel}
                      </span>
                    </div>
                    <div className="mt-3 text-2xl font-black text-white sm:text-3xl">
                      2F {primaryRec.zone} 區 · {primaryRec.sweetSpotLabel}
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-white/75 sm:text-sm">
                      {t(
                        `該局主力站位集中於 ${primaryRec.zone} 區，選擇核心 8 席區間即可涵蓋最長正面應援時段。`,
                        `해당 세트 주력 구역인 ${primaryRec.zone}구역의 8석 황금 구간으로 정면 시야를 확보할 수 있습니다.`
                      )}
                    </p>
                  </div>

                  {onJumpToSeatSimulator && (() => {
                    const targetSeat = Math.round(
                      (primaryRec.sweetSpotRange[0] + primaryRec.sweetSpotRange[1]) / 2
                    );
                    return (
                    <button
                      type="button"
                      onClick={() =>
                        onJumpToSeatSimulator(
                          currentMatchSchedule.matchId,
                          primaryRec.zone,
                          targetSeat,
                          activeGirl.id
                        )
                      }
                      className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#5BAE84] px-4 py-2.5 font-mono-num text-xs font-black text-white transition-colors hover:bg-[#3F8E67] sm:text-sm"
                    >
                      <span>
                        {t(
                          `一鍵預覽 ${primaryRec.zone}${targetSeat} 席雷達 →`,
                          `${primaryRec.zone}${targetSeat}석 레이더 보기 →`
                        )}
                      </span>
                    </button>
                    );
                  })()}
                </div>
              )}

              {/* Cross-Zone Golden 8-Seat Junctions (C小號↔B大號 & B小號↔A大號) */}
              {topCrossZone && (
                <div className="flex flex-col justify-between rounded-2xl border-2 border-[#5ECBC0] bg-[#181736] p-4 sm:p-5 lg:col-span-7">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#5ECBC0] px-2.5 py-0.5 font-mono-num text-[10px] font-black text-[#212047] lg:text-xs">
                        <span>↔ {topCrossZone.junctionTitle}</span>
                      </span>
                      <span className="rounded-md bg-white/10 px-2 py-0.5 font-mono-num text-[10px] font-extrabold text-[#7ADAD0] lg:text-xs">
                        {t(
                          `8 席內涵蓋 ${topCrossZone.coveredPhasesCount}/6 階段`,
                          `8석 내 ${topCrossZone.coveredPhasesCount}/6 단계 커버`
                        )}
                      </span>
                    </div>

                    <div className="mt-2.5 text-lg font-black text-white sm:text-2xl">
                      {topCrossZone.combinedRangeLabel}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 font-mono-num text-xs font-extrabold text-[#5ECBC0]">
                      <span>
                        {t('跨區兼顧：', '연속 커버: ')}
                        {topCrossZone.coveredSetsLabel}
                      </span>
                      <span>·</span>
                      <span>
                        {t('核心席：', '핵심 좌석: ')}
                        {topCrossZone.bestSingleSeatLabel}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onJumpToSeatSimulator?.(
                            currentMatchSchedule.matchId,
                            topCrossZone.rightZone,
                            topCrossZone.rightBestSeat,
                            activeGirl.id
                          )
                        }
                        className="flex flex-col items-start rounded-xl bg-white/10 px-3 py-2 text-left ring-1 ring-white/20 transition-all hover:bg-[#5BAE84]"
                      >
                        <span className="font-mono-num text-[10px] font-bold text-[#7ADAD0]">
                          ◀ {topCrossZone.rightZone} 區 {topCrossZone.rightSeatRange[0]}–{topCrossZone.rightSeatRange[1]} 號
                        </span>
                        <span className="mt-0.5 text-xs font-black text-white">
                          模擬 {topCrossZone.rightZone}{topCrossZone.rightBestSeat} →
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          onJumpToSeatSimulator?.(
                            currentMatchSchedule.matchId,
                            topCrossZone.leftZone,
                            topCrossZone.leftBestSeat,
                            activeGirl.id
                          )
                        }
                        className="flex flex-col items-start rounded-xl bg-white/10 px-3 py-2 text-left ring-1 ring-white/20 transition-all hover:bg-[#5BAE84]"
                      >
                        <span className="font-mono-num text-[10px] font-bold text-[#7ADAD0]">
                          {topCrossZone.leftZone} 區 {topCrossZone.leftSeatRange[0]}–{topCrossZone.leftSeatRange[1]} 號 ▶
                        </span>
                        <span className="mt-0.5 text-xs font-black text-white">
                          模擬 {topCrossZone.leftZone}{topCrossZone.leftBestSeat} →
                        </span>
                      </button>
                    </div>
                  </div>

                  {secondaryCrossZone && (
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/15 pt-2.5 text-[11px] text-white/80">
                      <div className="min-w-0">
                        <span className="font-bold text-[#7ADAD0]">
                          {t('另一側跨區：', '반대편 경계: ')}
                        </span>
                        <span className="font-mono-num font-bold text-white">
                          {secondaryCrossZone.combinedRangeLabel}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            onJumpToSeatSimulator?.(
                              currentMatchSchedule.matchId,
                              secondaryCrossZone.rightZone,
                              secondaryCrossZone.rightBestSeat,
                              activeGirl.id
                            )
                          }
                          className="rounded-full bg-white/15 px-2.5 py-0.5 font-mono-num text-[10px] font-bold text-[#7ADAD0] hover:bg-[#5BAE84] hover:text-white"
                        >
                          {secondaryCrossZone.rightZone}
                          {secondaryCrossZone.rightBestSeat} →
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onJumpToSeatSimulator?.(
                              currentMatchSchedule.matchId,
                              secondaryCrossZone.leftZone,
                              secondaryCrossZone.leftBestSeat,
                              activeGirl.id
                            )
                          }
                          className="rounded-full bg-white/15 px-2.5 py-0.5 font-mono-num text-[10px] font-bold text-[#7ADAD0] hover:bg-[#5BAE84] hover:text-white"
                        >
                          {secondaryCrossZone.leftZone}
                          {secondaryCrossZone.leftBestSeat} →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Row 2: One-Set-One-Switch EDM Route (Set 1&4 -> Set 2&5 -> Set 3, no 0-10 / >10 clutter) */}
            <div className="rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/12 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
                <span className="font-mono-num text-xs font-extrabold tracking-wider text-[#7ADAD0]">
                  {t(
                    '🔄 一局一換位黃金路線（依單局最佳 8 席推薦）',
                    '🔄 세트별 이동 황금 루트 (세트 단위 8석 추천)'
                  )}
                </span>
                <span className="text-[11px] text-white/65">
                  {t('點選各局可直接於下方雷達預覽位置', '각 세트를 눌러 아래 레이더에서 위치 확인')}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {recommendations.map((rec) => {
                  const zoneEmoji =
                    rec.zone === 'A' ? '🟦' : rec.zone === 'B' ? '🟩' : '🟨';
                  return (
                    <div
                      key={`edm-set-${rec.setKey}`}
                      className="flex flex-col justify-between rounded-2xl bg-[#181736] p-3.5 ring-1 ring-[#5ECBC0]/30"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded-full bg-[#212047] px-2.5 py-0.5 font-mono-num text-xs font-black text-[#7ADAD0] ring-1 ring-[#5ECBC0]/40">
                            {rec.setShortLabel}
                          </span>
                          <span className="font-mono-num text-xs font-extrabold text-white">
                            {zoneEmoji} 2F {rec.zone} {t('區', '구역')}
                          </span>
                        </div>

                        <div className="mt-2.5 text-lg font-black text-[#5ECBC0]">
                          {rec.sweetSpotLabel}
                        </div>

                        {rec.crossZoneOption && (
                          <div className="mt-1.5 rounded-lg bg-[#5BAE84]/20 px-2.5 py-1.5 font-mono-num text-[11px] font-bold text-[#A7F3D0] ring-1 ring-[#5BAE84]/40">
                            ↔ {t('跨區 8 席可選：', '인접 구역: ')}
                            {rec.crossZoneOption.adjacentZone} 區{' '}
                            {rec.crossZoneOption.adjacentSeatRange[0]}–
                            {rec.crossZoneOption.adjacentSeatRange[1]} 號
                          </div>
                        )}
                      </div>

                      {onJumpToSeatSimulator && (() => {
                        const recSeat = Math.round(
                          (rec.sweetSpotRange[0] + rec.sweetSpotRange[1]) / 2
                        );
                        return (
                        <button
                          type="button"
                          onClick={() =>
                            onJumpToSeatSimulator(
                              currentMatchSchedule.matchId,
                              rec.zone,
                              recSeat,
                              activeGirl.id
                            )
                          }
                          className="mt-3 inline-flex items-center justify-center gap-1 rounded-xl bg-white/10 px-3 py-1.5 font-mono-num text-xs font-extrabold text-[#7ADAD0] transition-colors hover:bg-[#5BAE84] hover:text-white"
                        >
                          <span>
                            {t(
                              `模擬 ${rec.zone}${recSeat} 席 →`,
                              `${rec.zone}${recSeat}석 보기 →`
                            )}
                          </span>
                        </button>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Row 3: Member Station Copy Box */}
            <MemberScheduleCopyBox
              member={activeGirl}
              activeMatchId={currentMatchSchedule.matchId}
              variant="dark"
            />
          </div>
        </div>
      </div>

      {/* Special Note for MC & Cheer Leader & Court Performances */}
      <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl bg-[#F4FAF8] p-3 ring-1 ring-[#5BAE84]/30 sm:px-4">
          <div>
            <div className="font-mono-num text-[10px] font-extrabold tracking-[0.14em] text-[#4FA87D] lg:text-xs">
              {t('團長與主持核心視野', '단장 및 MC 핵심 시야')}
            </div>
            <div className="mt-0.5 text-xs font-black text-[#212047] sm:text-sm">
              1F 場邊舞台 ＆ 2F 中央 B 區
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {mcAndLeaderMembers.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onOpenMemberDetail(m)}
                className="flex items-center gap-1.5 rounded-full bg-white py-1 pr-2.5 pl-1 ring-1 ring-[#212047]/10 transition-colors hover:ring-[#5BAE84]"
              >
                <MemberPortrait
                  member={m}
                  variant="avatar"
                  className="h-7 w-7 rounded-full"
                />
                <span className="font-mono-num text-[10px] font-bold text-[#4FA87D]">
                  #{m.number}
                </span>
                <span className="text-xs font-extrabold text-[#212047]">
                  {getMemberName(m)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[#212047] p-3 text-white sm:px-4">
          <div>
            <div className="font-mono-num text-[10px] font-extrabold tracking-[0.14em] text-[#7ADAD0] lg:text-xs">
              {t('場中央演出拍攝方位', '코트 중앙 공연 촬영 방향')}
            </div>
            <div className="mt-0.5 text-xs font-black text-white sm:text-sm">
              開場舞 · 中場演出 · 2F 拍攝區
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 font-mono-num text-[10px] font-bold">
            <span className="rounded-full bg-white/12 px-2.5 py-1 text-[#7ADAD0]">
              開場舞：1F 精武區 ▶
            </span>
            <span className="rounded-full bg-white/12 px-2.5 py-1 text-[#7ADAD0]">
              ◀ 中場：1F 力行區
            </span>
            <span className="rounded-full bg-[#5BAE84] px-2.5 py-1 text-white">
              ▲ 南側 2F 拍攝限定區
            </span>
          </div>
        </div>
      </div>

      {/* One-Click Oshi Strategy Image Modal */}
      <OshiStrategyCardModal
        isOpen={isStrategyModalOpen}
        initialGirlId={activeGirl.id}
        favoriteIds={favoriteIds}
        initialMatchId={selectedMatchId}
        initialMode={strategyModalMode}
        initialZone={
          strategyModalSeat?.zone ??
          topCrossZone?.bestSingleZone ??
          primaryRec?.zone ??
          'B'
        }
        initialSeat={
          strategyModalSeat?.seat ?? topCrossZone?.bestSingleSeat ?? 12
        }
        onClose={() => {
          setIsStrategyModalOpen(false);
          setStrategyModalSeat(null);
        }}
      />
    </section>
  );
};
