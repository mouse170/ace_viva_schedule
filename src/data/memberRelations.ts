import type { AceVivaMember } from './members';
import { MEMBER_KO_NAMES } from '../i18n/LanguageContext';
import {
  ACTIVE_HOME_SCHEDULE,
  ACTIVE_STATION_ROTATION_SCHEDULES,
  type AceZoneId,
  type MatchStationSchedule,
} from './schedule';

export interface ExperienceTag {
  id: string;
  label: string;
  shortLabel: string;
  kind: 'team' | 'nationality';
}

interface ExperienceRule {
  id: string;
  label: string;
  shortLabel: string;
  keywords: string[];
}

const SHARED_EXPERIENCE_RULES: ExperienceRule[] = [
  {
    id: 'dragon_beauties',
    label: '味全龍 Dragon Beauties',
    shortLabel: '味全龍',
    keywords: ['味全龍', 'Dragon Beauties'],
  },
  {
    id: 'yankees_girls',
    label: '洋基工程 洋基女孩',
    shortLabel: '洋基女孩',
    keywords: ['洋基工程', '洋基女孩'],
  },
  {
    id: 'pilots_crew',
    label: '桃園璞園領航猿 Pilots Crew',
    shortLabel: '領航猿',
    keywords: ['領航猿', 'Pilots Crew'],
  },
  {
    id: 'taishin_wonders',
    label: '臺北台新戰神 Taishin Wonders',
    shortLabel: '台新戰神',
    keywords: ['台新戰神', 'Taishin Wonders'],
  },
  {
    id: 'woohoo_power',
    label: '高中體總 WooHoo Power',
    shortLabel: 'WooHoo',
    keywords: ['WooHoo Power', '高中體總'],
  },
  {
    id: 'pink_fun',
    label: '女團 PINK FUN（DD52）',
    shortLabel: 'PINK FUN',
    keywords: ['PINK FUN'],
  },
  {
    id: 'rakuten_girls',
    label: '樂天桃猿 Rakuten Girls',
    shortLabel: '樂天女孩',
    keywords: ['樂天桃猿', 'Rakuten Girls'],
  },
  {
    id: 'uni_girls',
    label: '統一獅 Uni Girls',
    shortLabel: 'Uni Girls',
    keywords: ['統一獅', 'Uni Girls'],
  },
];

const KR_NATIONALITY_TAG: ExperienceTag = {
  id: 'kr_league',
  label: '韓職應援同鄉',
  shortLabel: '韓職同鄉',
  kind: 'nationality',
};

/**
 * Extract normalized shared-experience tags from a member's career and nationality.
 */
export function getMemberExperienceTags(member: AceVivaMember): ExperienceTag[] {
  const tags: ExperienceTag[] = [];
  const seen = new Set<string>();

  for (const entry of member.career) {
    if (entry.team.includes('臺中連莊') || entry.team.includes('Ace Viva')) {
      continue;
    }
    for (const rule of SHARED_EXPERIENCE_RULES) {
      if (seen.has(rule.id)) continue;
      if (rule.keywords.some((kw) => entry.team.includes(kw))) {
        seen.add(rule.id);
        tags.push({
          id: rule.id,
          label: rule.label,
          shortLabel: rule.shortLabel,
          kind: 'team',
        });
      }
    }
  }

  if (member.nationality === 'KR' && !seen.has(KR_NATIONALITY_TAG.id)) {
    tags.push(KR_NATIONALITY_TAG);
  }

  return tags;
}

/**
 * Return the overlapping experience tags between two distinct members.
 */
export function getSharedExperiences(
  memberA: AceVivaMember,
  memberB: AceVivaMember
): ExperienceTag[] {
  if (memberA.id === memberB.id) return [];
  const tagsB = new Set(getMemberExperienceTags(memberB).map((t) => t.id));
  return getMemberExperienceTags(memberA).filter((t) => tagsB.has(t.id));
}

export interface SharedExperiencePeer {
  peer: AceVivaMember;
  sharedTags: ExperienceTag[];
}

/**
 * List all members who share at least one team/background experience with targetMemberId.
 */
export function getSharedExperiencePeers(
  targetMemberId: string,
  allMembers: AceVivaMember[]
): SharedExperiencePeer[] {
  const target = allMembers.find((m) => m.id === targetMemberId);
  if (!target) return [];

  const peers: SharedExperiencePeer[] = [];
  for (const candidate of allMembers) {
    if (candidate.id === target.id) continue;
    const sharedTags = getSharedExperiences(target, candidate);
    if (sharedTags.length > 0) {
      peers.push({ peer: candidate, sharedTags });
    }
  }
  return peers;
}

export interface StageSlotNode {
  zone: AceZoneId;
  slotIdx: number;
  member: AceVivaMember;
}

export interface AdjacentBondNeighbor {
  partner: AceVivaMember;
  partnerZone: AceZoneId;
  partnerSlotIdx: number;
  isCrossZone: boolean;
  sharedTags: ExperienceTag[];
}

export interface PhaseAdjacentBondsResult {
  byPositionKey: Map<string, AdjacentBondNeighbor[]>;
  byMemberId: Map<string, AdjacentBondNeighbor[]>;
}

/**
 * Detect adjacent same-experience pairs along the physical 2F ACE court:
 * C (large->small) | B (large->small) | A (large->small).
 * Covers both within-zone neighbors and cross-zone border neighbors.
 */
export function getPhaseAdjacentBonds(
  phaseRecord: Record<AceZoneId, string[]>,
  memberMap: Map<string, AceVivaMember>
): PhaseAdjacentBondsResult {
  const linearNodes: StageSlotNode[] = [];
  const zoneOrder: AceZoneId[] = ['C', 'B', 'A'];

  for (const zone of zoneOrder) {
    const arr = phaseRecord[zone];
    for (let slotIdx = arr.length - 1; slotIdx >= 0; slotIdx -= 1) {
      const member = memberMap.get(arr[slotIdx]);
      if (member) {
        linearNodes.push({ zone, slotIdx, member });
      }
    }
  }

  const byPositionKey = new Map<string, AdjacentBondNeighbor[]>();
  const byMemberId = new Map<string, AdjacentBondNeighbor[]>();

  const pushNeighbor = (
    self: StageSlotNode,
    other: StageSlotNode,
    sharedTags: ExperienceTag[]
  ) => {
    const posKey = `${self.zone}-${self.slotIdx}`;
    const entry: AdjacentBondNeighbor = {
      partner: other.member,
      partnerZone: other.zone,
      partnerSlotIdx: other.slotIdx,
      isCrossZone: self.zone !== other.zone,
      sharedTags,
    };
    const posList = byPositionKey.get(posKey) ?? [];
    posList.push(entry);
    byPositionKey.set(posKey, posList);

    const memList = byMemberId.get(self.member.id) ?? [];
    memList.push(entry);
    byMemberId.set(self.member.id, memList);
  };

  for (let i = 0; i < linearNodes.length - 1; i += 1) {
    const leftNode = linearNodes[i];
    const rightNode = linearNodes[i + 1];
    const sharedTags = getSharedExperiences(leftNode.member, rightNode.member);
    if (sharedTags.length === 0) continue;

    pushNeighbor(leftNode, rightNode, sharedTags);
    pushNeighbor(rightNode, leftNode, sharedTags);
  }

  return { byPositionKey, byMemberId };
}

export interface MemberMatchAdjacentMoment {
  setLabel: string;
  phaseLabel: string;
  selfZone: AceZoneId;
  partner: AceVivaMember;
  partnerZone: AceZoneId;
  isCrossZone: boolean;
  sharedTags: ExperienceTag[];
}

/**
 * Collect all adjacent shared-experience moments for a member across a match's 5 sets.
 */
export function getMemberMatchAdjacentMoments(
  memberId: string,
  schedule: MatchStationSchedule,
  memberMap: Map<string, AceVivaMember>
): MemberMatchAdjacentMoment[] {
  const moments: MemberMatchAdjacentMoment[] = [];

  for (const s of schedule.sets) {
    const phases: Array<{
      label: string;
      record: Record<AceZoneId, string[]>;
    }> = [
      { label: '開局 0–10 分', record: s.initial },
      { label: '破 10 分換位後', record: s.after10Points },
    ];

    for (const phase of phases) {
      const bonds = getPhaseAdjacentBonds(phase.record, memberMap);
      const hits = bonds.byMemberId.get(memberId);
      if (!hits || hits.length === 0) continue;

      const selfZone = (['A', 'B', 'C'] as AceZoneId[]).find((z) =>
        phase.record[z].includes(memberId)
      );
      if (!selfZone) continue;

      for (const hit of hits) {
        moments.push({
          setLabel: s.setLabel,
          phaseLabel: phase.label,
          selfZone,
          partner: hit.partner,
          partnerZone: hit.partnerZone,
          isCrossZone: hit.isCrossZone,
          sharedTags: hit.sharedTags,
        });
      }
    }
  }

  return moments;
}

const ZONE_EMOJI: Record<AceZoneId, string> = {
  A: '🟦 A區',
  B: '🟩 B區',
  C: '🟨 C區',
};

const ZONE_EMOJI_KO: Record<AceZoneId, string> = {
  A: '🟦 A구역',
  B: '🟩 B구역',
  C: '🟨 C구역',
};

function getSlotDirectionLabel(
  slotIdx: number,
  totalSlots: number,
  lang: 'zh-TW' | 'ko' = 'zh-TW'
): string {
  if (lang === 'ko') {
    if (totalSlots === 4) {
      if (slotIdx === 3) return '좌';
      if (slotIdx === 2) return '중좌';
      if (slotIdx === 1) return '중우';
      return '우';
    }
    if (slotIdx === 2) return '좌';
    if (slotIdx === 1) return '중';
    return '우';
  }
  if (totalSlots === 4) {
    if (slotIdx === 3) return '左';
    if (slotIdx === 2) return '中左';
    if (slotIdx === 1) return '中右';
    return '右';
  }
  if (slotIdx === 2) return '左';
  if (slotIdx === 1) return '中';
  return '右';
}

function findMemberPhasePosition(
  phaseRecord: Record<AceZoneId, string[]>,
  memberId: string
): { zone: AceZoneId; slotIdx: number; totalSlots: number; teammates: string[] } | null {
  for (const zone of ['A', 'B', 'C'] as AceZoneId[]) {
    const arr = phaseRecord[zone];
    const idx = arr.indexOf(memberId);
    if (idx !== -1) {
      return {
        zone,
        slotIdx: idx,
        totalSlots: arr.length,
        teammates: arr.filter((id) => id !== memberId),
      };
    }
  }
  return null;
}

export interface FormatMemberCopyOptions {
  member: AceVivaMember;
  scope: 'single' | 'all';
  matchId?: string;
  includeTeammates: boolean;
  memberMap: Map<string, AceVivaMember>;
  lang?: 'zh-TW' | 'ko';
}

/**
 * Format a member-centric station schedule text ready for LINE / IG / Notes copying,
 * using cross-platform zone color Emojis (🟦 A區 / 🟩 B區 / 🟨 C區).
 */
export function formatMemberScheduleCopyText({
  member,
  scope,
  matchId,
  includeTeammates,
  memberMap,
  lang = 'zh-TW',
}: FormatMemberCopyOptions): string {
  const isKo = lang === 'ko';
  const displayName = isKo ? MEMBER_KO_NAMES[member.id] ?? member.name : member.name;
  const header = isKo
    ? `✨ ${displayName}（#${member.number}）2F 응원 구역 일정표`
    : `✨ ${displayName}（#${member.number}）2F 應援站位班表`;

  const targetMatches =
    scope === 'single' && matchId
      ? ACTIVE_HOME_SCHEDULE.filter((m) => m.id === matchId)
      : ACTIVE_HOME_SCHEDULE.filter((m) =>
          m.attendingMemberIds.includes(member.id)
        );

  if (targetMatches.length === 0) {
    return `${header}\n${isKo ? '현재 공개된 다가오는 경기 일정이 없습니다.' : '目前近期已公告場次暫無排班。'}`;
  }

  const zoneEmojiMap = isKo ? ZONE_EMOJI_KO : ZONE_EMOJI;

  const blocks = targetMatches.map((homeMatch) => {
    const shortDate = homeMatch.date.slice(5).replace('-', '/');
    const dayShort = homeMatch.dayOfWeek.split(' ')[0];
    const matchTitle = `📅 ${shortDate} (${dayShort}) ${homeMatch.time} vs ${homeMatch.opponent}（${homeMatch.themeTitle}）`;

    const stationSchedule = ACTIVE_STATION_ROTATION_SCHEDULES.find(
      (s) => s.matchId === homeMatch.id
    );

    if (!stationSchedule) {
      return `${matchTitle}\n${
        isKo
          ? '📋 당일 출석 예정 (2F 구역 배치는 추후 공지)'
          : '📋 當日已排定出席（2F 站位表待官方公告）'
      }`;
    }

    const lines: string[] = [matchTitle];
    let hasRotatingSlot = false;

    stationSchedule.sets.forEach((s, index) => {
      const initPos = findMemberPhasePosition(s.initial, member.id);
      const afterPos = findMemberPhasePosition(s.after10Points, member.id);

      if (!initPos || !afterPos) return;
      hasRotatingSlot = true;

      const initText = `${zoneEmojiMap[initPos.zone]}(${getSlotDirectionLabel(
        initPos.slotIdx,
        initPos.totalSlots,
        lang
      )})`;
      const afterText = `${zoneEmojiMap[afterPos.zone]}(${getSlotDirectionLabel(
        afterPos.slotIdx,
        afterPos.totalSlots,
        lang
      )})`;

      let line = `S${index + 1}：${initText} ➔ ${afterText}`;

      if (includeTeammates) {
        const formatName = (id: string) => {
          const m = memberMap.get(id);
          if (!m) return id;
          return isKo ? MEMBER_KO_NAMES[m.id] ?? m.name : m.name;
        };
        const sep = isKo ? ', ' : '、';
        const initNames = initPos.teammates.map(formatName).join(sep);
        const afterNames = afterPos.teammates.map(formatName).join(sep);
        if (isKo) {
          line +=
            initNames === afterNames
              ? ` | 같은 구역: ${initNames}`
              : ` | 같은 구역: 초반(${initNames}) / 교체(${afterNames})`;
        } else {
          line +=
            initNames === afterNames
              ? `｜同區：${initNames}`
              : `｜同區：開局(${initNames})／換位(${afterNames})`;
        }
      }

      lines.push(line);
    });

    if (!hasRotatingSlot) {
      const isSpecialRole = stationSchedule.mcAndLeaderIds.includes(member.id);
      if (isSpecialRole) {
        lines.push(
          isKo
            ? '📋 역할: 홈 MC / 스페셜 응원 (고정 2F 로테이션 없음)'
            : '📋 身份：主場 MC / 特別應援（無固定 2F 輪替站位）'
        );
      } else if (homeMatch.attendingMemberIds.includes(member.id)) {
        lines.push(
          isKo
            ? '📋 당일 출석 예정 (고정 2F 로테이션 없음)'
            : '📋 當日已排定出席（無固定 2F 輪替站位）'
        );
      } else {
        lines.push(isKo ? '📋 당일 휴식' : '📋 當日未排班');
      }
    }

    return lines.join('\n');
  });

  return `${header}\n\n${blocks.join('\n\n')}`;
}
