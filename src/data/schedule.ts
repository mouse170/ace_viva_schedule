export interface HomeMatchSchedule {
  id: string;
  weekLabel: string;
  themeTitle: string;
  themeSubtitle: string;
  date: string;
  dayOfWeek: string;
  time: string;
  opponent: string;
  venue: string;
  attendingMemberIds: string[];
  highlightNote: string;
  hasStationMap?: boolean;
  instagramPostUrl?: string;
}

export type AceZoneId = 'A' | 'B' | 'C';

export interface SetStationArrangement {
  setKey: 'set1_4' | 'set2_5' | 'set3';
  setLabel: string;
  setShortLabel: string;
  initial: Record<AceZoneId, [string, string, string]>;
  after10Points: Record<AceZoneId, [string, string, string]>;
}

export interface MatchStationSchedule {
  matchId: string;
  dateLabel: string;
  dayLabel: string;
  opponent: string;
  themeName: string;
  postUrl: string;
  mcAndLeaderIds: string[];
  sets: SetStationArrangement[];
}

/**
 * 2026–2027 賽季 臺中連莊上半季官方主場班表（依據官方 IG @ace_viva_official 貼文 DejflnTkvTp 與 DfWqRcjmcbO）
 */
export const HOME_SCHEDULE: HomeMatchSchedule[] = [
  {
    id: '2026-10-31',
    weekLabel: 'OPENING WEEK · 主場開幕戰 DAY 1',
    themeTitle: 'HOME GAME OPENING SHOW 開幕主題週',
    themeSubtitle: 'ACE VIVA 連莊女孩全體 18 位成員（16 位隊員 + 2 位 MC）全員到齊',
    date: '2026.10.31',
    dayOfWeek: '週六 SAT',
    time: '14:30',
    opponent: '開幕戰主場賽事',
    venue: '臺中市國立臺灣體育運動大學體育館',
    attendingMemberIds: [
      'yuri',
      'mamai',
      'avawu',
      'shenxuan',
      'chayounghyun',
      'leejuhee',
      'jungheejung',
      'yipei',
      'ann',
      'ella',
      'yixuan',
      'nicole',
      'sinping',
      'xuanxuan',
      'peichen',
      'weiwei',
      'mega',
      'yuan',
    ],
    highlightNote: '10/31 開幕首戰 ACE VIVA 全員集結登場，韓籍三本柱與全體台灣成員首度全員合體',
    instagramPostUrl: 'https://www.instagram.com/p/DejflnTkvTp/',
  },
  {
    id: '2026-11-01',
    weekLabel: 'OPENING WEEK · 主場開幕戰 DAY 2',
    themeTitle: 'HOME GAME OPENING SHOW 開幕主題週',
    themeSubtitle: 'ACE VIVA 連莊女孩全體 18 位成員連兩日全員應援',
    date: '2026.11.01',
    dayOfWeek: '週日 SUN',
    time: '14:30',
    opponent: '開幕週主場賽事',
    venue: '臺中市國立臺灣體育運動大學體育館',
    attendingMemberIds: [
      'yuri',
      'mamai',
      'avawu',
      'shenxuan',
      'chayounghyun',
      'leejuhee',
      'jungheejung',
      'yipei',
      'ann',
      'ella',
      'yixuan',
      'nicole',
      'sinping',
      'xuanxuan',
      'peichen',
      'weiwei',
      'mega',
      'yuan',
    ],
    highlightNote: '11/01 開幕週第二天全體 18 位成員到齊應援',
    instagramPostUrl: 'https://www.instagram.com/p/DejflnTkvTp/',
  },
  {
    id: '2026-11-07',
    weekLabel: 'THIS WEEK · 本週主場主題日 DAY 1',
    themeTitle: 'Old! MY CAR 我的 90 年代',
    themeSubtitle: '2F ACE 集氣區 A、B、C 三區輪流應援（每局結束與單局破 10 分交換站位）',
    date: '2026.11.07',
    dayOfWeek: '週六 SAT',
    time: '17:00',
    opponent: '台鋼天鷹',
    venue: '臺中市國立臺灣體育運動大學體育館',
    attendingMemberIds: [
      'yuri',
      'mamai',
      'shenxuan',
      'chayounghyun',
      'jungheejung',
      'yipei',
      'ann',
      'ella',
      'yixuan',
      'nicole',
      'yuan',
    ],
    highlightNote: '已公布 2F ACE 集氣區 A/B/C 區 1–23 號座位對應站位表（可於上方座位查詢器即時互動檢視）',
    hasStationMap: true,
    instagramPostUrl: 'https://www.instagram.com/p/DfWqRcjmcbO/',
  },
  {
    id: '2026-11-08',
    weekLabel: 'THIS WEEK · 本週主場主題日 DAY 2',
    themeTitle: 'Old! MY CAR 我的 90 年代',
    themeSubtitle: '2F ACE 集氣區 A、B、C 三區輪流應援（每局結束與單局破 10 分交換站位）',
    date: '2026.11.08',
    dayOfWeek: '週日 SUN',
    time: '17:00',
    opponent: '臺北伊斯特',
    venue: '臺中市國立臺灣體育運動大學體育館',
    attendingMemberIds: [
      'yuri',
      'mamai',
      'shenxuan',
      'chayounghyun',
      'jungheejung',
      'ann',
      'ella',
      'yixuan',
      'nicole',
      'xuanxuan',
      'yuan',
    ],
    highlightNote: '已公布 2F ACE 集氣區 A/B/C 區 1–23 號座位對應站位表（可於上方座位查詢器即時互動檢視）',
    hasStationMap: true,
    instagramPostUrl: 'https://www.instagram.com/p/DfWqRcjmcbO/',
  },
  {
    id: '2026-11-21',
    weekLabel: 'THEME WEEK 03 · 11 月主題週 DAY 1',
    themeTitle: '致青春 創造 WIN',
    themeSubtitle: 'MC 巫苡萱（#111）與韓籍成員鄭熙靜（#42）領銜 10 人應援陣容',
    date: '2026.11.21',
    dayOfWeek: '週六 SAT',
    time: '14:30',
    opponent: '主場例行賽',
    venue: '臺中市國立臺灣體育運動大學體育館',
    attendingMemberIds: [
      'avawu',
      'jungheejung',
      'yuan',
      'yipei',
      'mega',
      'sinping',
      'weiwei',
      'xuanxuan',
      'yixuan',
      'ann',
    ],
    highlightNote: '開場舞於 1F 猛虎精武區前側、中場演出於 1F 猛虎力行區前側進行',
    instagramPostUrl: 'https://www.instagram.com/p/DejflnTkvTp/',
  },
  {
    id: '2026-11-22',
    weekLabel: 'THEME WEEK 03 · 11 月主題週 DAY 2',
    themeTitle: '致青春 創造 WIN',
    themeSubtitle: 'MC 巫苡萱（#111）與韓籍成員鄭熙靜（#42）領銜 10 人應援陣容',
    date: '2026.11.22',
    dayOfWeek: '週日 SUN',
    time: '14:30',
    opponent: '主場例行賽',
    venue: '臺中市國立臺灣體育運動大學體育館',
    attendingMemberIds: [
      'avawu',
      'jungheejung',
      'yuan',
      'ella',
      'mega',
      'sinping',
      'weiwei',
      'xuanxuan',
      'yixuan',
      'ann',
    ],
    highlightNote: '演出期間限時開放 2F 拍攝限定區供二樓季票球迷拍攝',
    instagramPostUrl: 'https://www.instagram.com/p/DejflnTkvTp/',
  },
  {
    id: '2026-12-12',
    weekLabel: 'THEME WEEK 04 · 聖誕主題週 DAY 1',
    themeTitle: 'HOME FOR CHRISTMAS',
    themeSubtitle: '車榮玹（#21）、應援團長馬妹（#41）與 MC 心璇（#25）聖誕主場派對',
    date: '2026.12.12',
    dayOfWeek: '週六 SAT',
    time: '14:30',
    opponent: '主場例行賽',
    venue: '臺中市國立臺灣體育運動大學體育館',
    attendingMemberIds: [
      'shenxuan',
      'mamai',
      'chayounghyun',
      'yipei',
      'mega',
      'sinping',
      'nicole',
      'peichen',
      'ella',
      'weiwei',
    ],
    highlightNote: '上半季壓軸聖誕主題週首日，10 位女孩陪伴球迷共度溫馨主場',
    instagramPostUrl: 'https://www.instagram.com/p/DejflnTkvTp/',
  },
  {
    id: '2026-12-13',
    weekLabel: 'THEME WEEK 04 · 聖誕主題週 DAY 2',
    themeTitle: 'HOME FOR CHRISTMAS',
    themeSubtitle: '隊長 Yuri（#6）與車榮玹（#21）台韓雙隊長合體壓軸應援',
    date: '2026.12.13',
    dayOfWeek: '週日 SUN',
    time: '14:30',
    opponent: '主場例行賽',
    venue: '臺中市國立臺灣體育運動大學體育館',
    attendingMemberIds: [
      'yuri',
      'mamai',
      'shenxuan',
      'chayounghyun',
      'mega',
      'sinping',
      'nicole',
      'peichen',
      'ella',
      'weiwei',
    ],
    highlightNote: '2026 上半季最終主場日，台韓雙隊長 Yuri 與車榮玹同場應援',
    instagramPostUrl: 'https://www.instagram.com/p/DejflnTkvTp/',
  },
];

/**
 * 本週（11/7、11/8）官方公告之 2F ACE 集氣區（A、B、C 區，每區 23 個座位）女孩站位與輪換表
 * 資料來源：https://www.instagram.com/p/DfWqRcjmcbO/
 */
export const STATION_ROTATION_SCHEDULES: MatchStationSchedule[] = [
  {
    matchId: '2026-11-07',
    dateLabel: '11/07 (六) 17:00',
    dayLabel: '11/7 週六場',
    opponent: '台鋼天鷹',
    themeName: 'Old! MY CAR 我的 90 年代',
    postUrl: 'https://www.instagram.com/p/DfWqRcjmcbO/',
    mcAndLeaderIds: ['shenxuan', 'mamai'],
    sets: [
      {
        setKey: 'set1_4',
        setLabel: '第一局 & 第四局',
        setShortLabel: '第 1、4 局',
        initial: {
          A: ['jungheejung', 'yipei', 'ella'],
          B: ['yuri', 'nicole', 'ann'],
          C: ['chayounghyun', 'yuan', 'yixuan'],
        },
        after10Points: {
          A: ['ella', 'jungheejung', 'yipei'],
          B: ['ann', 'yuri', 'nicole'],
          C: ['yixuan', 'chayounghyun', 'yuan'],
        },
      },
      {
        setKey: 'set2_5',
        setLabel: '第二局 & 第五局',
        setShortLabel: '第 2、5 局',
        initial: {
          A: ['yixuan', 'chayounghyun', 'yuan'],
          B: ['ella', 'jungheejung', 'yipei'],
          C: ['ann', 'yuri', 'nicole'],
        },
        after10Points: {
          A: ['yuan', 'yixuan', 'chayounghyun'],
          B: ['yipei', 'ella', 'jungheejung'],
          C: ['nicole', 'ann', 'yuri'],
        },
      },
      {
        setKey: 'set3',
        setLabel: '第三局',
        setShortLabel: '第 3 局',
        initial: {
          A: ['nicole', 'ann', 'yuri'],
          B: ['yuan', 'yixuan', 'chayounghyun'],
          C: ['yipei', 'ella', 'jungheejung'],
        },
        after10Points: {
          A: ['yuri', 'nicole', 'ann'],
          B: ['chayounghyun', 'yuan', 'yixuan'],
          C: ['jungheejung', 'yipei', 'ella'],
        },
      },
    ],
  },
  {
    matchId: '2026-11-08',
    dateLabel: '11/08 (日) 17:00',
    dayLabel: '11/8 週日場',
    opponent: '臺北伊斯特',
    themeName: 'Old! MY CAR 我的 90 年代',
    postUrl: 'https://www.instagram.com/p/DfWqRcjmcbO/',
    mcAndLeaderIds: ['shenxuan', 'mamai'],
    sets: [
      {
        setKey: 'set1_4',
        setLabel: '第一局 & 第四局',
        setShortLabel: '第 1、4 局',
        initial: {
          A: ['yixuan', 'xuanxuan', 'chayounghyun'],
          B: ['yuan', 'ella', 'yuri'],
          C: ['ann', 'nicole', 'jungheejung'],
        },
        after10Points: {
          A: ['chayounghyun', 'yixuan', 'xuanxuan'],
          B: ['yuri', 'yuan', 'ella'],
          C: ['jungheejung', 'ann', 'nicole'],
        },
      },
      {
        setKey: 'set2_5',
        setLabel: '第二局 & 第五局',
        setShortLabel: '第 2、5 局',
        initial: {
          A: ['jungheejung', 'ann', 'nicole'],
          B: ['chayounghyun', 'yixuan', 'xuanxuan'],
          C: ['yuri', 'yuan', 'ella'],
        },
        after10Points: {
          A: ['nicole', 'jungheejung', 'ann'],
          B: ['xuanxuan', 'chayounghyun', 'yixuan'],
          C: ['ella', 'yuri', 'yuan'],
        },
      },
      {
        setKey: 'set3',
        setLabel: '第三局',
        setShortLabel: '第 3 局',
        initial: {
          A: ['ella', 'yuri', 'yuan'],
          B: ['nicole', 'jungheejung', 'ann'],
          C: ['xuanxuan', 'chayounghyun', 'yixuan'],
        },
        after10Points: {
          A: ['yuan', 'ella', 'yuri'],
          B: ['ann', 'nicole', 'jungheejung'],
          C: ['yixuan', 'xuanxuan', 'chayounghyun'],
        },
      },
    ],
  },
];

/**
 * 根據每區 1–23 號座位編號，計算正前方對應之女孩站位索引（0: 左位、1: 中位、2: 右位）與視角描述
 */
export function getSeatPositionMapping(seatNumber: number): {
  slotIndex: 0 | 1 | 2;
  slotName: '左位（站位 1）' | '中位（站位 2）' | '右位（站位 3）';
  seatRangeLabel: string;
  viewAngleNote: string;
  adjacentSlotIndex?: 0 | 1 | 2;
} {
  if (seatNumber <= 8) {
    return {
      slotIndex: 0,
      slotName: '左位（站位 1）',
      seatRangeLabel: '1–8 號席位區段',
      viewAngleNote:
        seatNumber >= 7
          ? `第 ${seatNumber} 號位於左位與中位交界處，正對「左位」女孩，同時享有極佳的「中位」女孩近距離斜角視野`
          : seatNumber >= 4 && seatNumber <= 5
            ? `第 ${seatNumber} 號為本區「左位（站位 1）」黃金正中央直線對焦席`
            : `第 ${seatNumber} 號正對本區「左位（站位 1）」應援女孩`,
      adjacentSlotIndex: seatNumber >= 7 ? 1 : undefined,
    };
  }
  if (seatNumber <= 15) {
    return {
      slotIndex: 1,
      slotName: '中位（站位 2）',
      seatRangeLabel: '9–15 號席位區段',
      viewAngleNote:
        seatNumber === 12
          ? '第 12 號為本區 23 席之「絕對正中心 C 位」，正對「中位（站位 2）」女孩且左右視野完全對稱'
          : seatNumber === 9
            ? '第 9 號正對「中位（站位 2）」女孩，同時緊鄰「左位（站位 1）」女孩'
            : seatNumber === 15
              ? '第 15 號正對「中位（站位 2）」女孩，同時緊鄰「右位（站位 3）」女孩'
              : `第 ${seatNumber} 號正對本區核心「中位（站位 2）」應援女孩`,
      adjacentSlotIndex: seatNumber === 9 ? 0 : seatNumber === 15 ? 2 : undefined,
    };
  }
  return {
    slotIndex: 2,
    slotName: '右位（站位 3）',
    seatRangeLabel: '16–23 號席位區段',
    viewAngleNote:
      seatNumber <= 17
        ? `第 ${seatNumber} 號位於中位與右位交界處，正對「右位」女孩，同時享有極佳的「中位」女孩近距離斜角視野`
        : seatNumber >= 19 && seatNumber <= 20
          ? `第 ${seatNumber} 號為本區「右位（站位 3）」黃金正中央直線對焦席`
          : `第 ${seatNumber} 號正對本區「右位（站位 3）」應援女孩`,
    adjacentSlotIndex: seatNumber <= 17 ? 1 : undefined,
  };
}

export interface GirlSetZoneRecommendation {
  setKey: 'set1_4' | 'set2_5' | 'set3';
  setLabel: string;
  setShortLabel: string;
  priorityBadge: string;
  priorityReason: string;
  zone: AceZoneId;
  initialSlotIndex: 0 | 1 | 2;
  initialSlotLabel: string;
  initialSeatRange: [number, number];
  initialCoreSeats: string;
  after10SlotIndex: 0 | 1 | 2;
  after10SlotLabel: string;
  after10SeatRange: [number, number];
  after10CoreSeats: string;
  sweetSpotRange: [number, number];
  sweetSpotLabel: string;
  sweetSpotReason: string;
}

const SLOT_META: Record<
  0 | 1 | 2,
  { label: string; range: [number, number]; core: string }
> = {
  0: { label: '左位（站位 1）', range: [1, 8], core: '4–5 號' },
  1: { label: '中位（站位 2）', range: [9, 15], core: '12 號' },
  2: { label: '右位（站位 3）', range: [16, 23], core: '19–20 號' },
};

function computeSweetSpot(
  initSlot: 0 | 1 | 2,
  after10Slot: 0 | 1 | 2
): { range: [number, number]; label: string; reason: string } {
  // 左位 (1-8) -> 中位 (9-15)
  if (initSlot === 0 && after10Slot === 1) {
    return {
      range: [6, 13],
      label: '6 號 – 13 號（黃金交界 7–11 號）',
      reason:
        '開局（0–10 分）站左位（1–8 號）、破 10 分後決勝長時段移至中位（9–15 號）；選擇 6–13 號可整局免大幅轉頭全程直視。',
    };
  }
  // 中位 (9-15) -> 右位 (16-23)
  if (initSlot === 1 && after10Slot === 2) {
    return {
      range: [12, 19],
      label: '12 號 – 19 號（黃金交界 14–17 號）',
      reason:
        '開局（0–10 分）站中位（9–15 號）、破 10 分後決勝長時段移至右位（16–23 號）；選擇 12–19 號可同時兼顧中右兩段視野。',
    };
  }
  // 右位 (16-23) -> 左位 (1-8)
  return {
    range: [1, 8],
    label: '1 號 – 8 號（決勝期 C 位 4–5 號）或 16–23 號',
    reason:
      '開局（0–10 分）站右位（16–23 號），主隊破 10 分後（11–25 分，佔單局 60% 以上時間）移至左位（1–8 號）；首推 1–8 號鎖定局末關鍵應援，或選 16–23 號鎖定開局。',
  };
}

/**
 * 依據指定場次與女孩 ID，計算該女孩在整場比賽各局之區域、站位與最佳推薦座位區間
 */
export function getGirlSeatRecommendations(
  matchSchedule: MatchStationSchedule,
  memberId: string
): GirlSetZoneRecommendation[] {
  const results: GirlSetZoneRecommendation[] = [];
  const zones: AceZoneId[] = ['A', 'B', 'C'];

  for (const s of matchSchedule.sets) {
    let foundZone: AceZoneId | null = null;
    let initSlot: 0 | 1 | 2 = 0;
    let after10Slot: 0 | 1 | 2 = 0;

    for (const z of zones) {
      const iIdx = s.initial[z].indexOf(memberId);
      const aIdx = s.after10Points[z].indexOf(memberId);
      if (iIdx !== -1 && aIdx !== -1) {
        foundZone = z;
        initSlot = iIdx as 0 | 1 | 2;
        after10Slot = aIdx as 0 | 1 | 2;
        break;
      }
    }

    if (!foundZone) continue;

    const initMeta = SLOT_META[initSlot];
    const afterMeta = SLOT_META[after10Slot];
    const sweet = computeSweetSpot(initSlot, after10Slot);

    const priorityBadge =
      s.setKey === 'set1_4'
        ? '★ 首選主戰區（第 1、4 局雙局覆蓋）'
        : s.setKey === 'set2_5'
          ? '◆ 次選推薦區（第 2、5 局覆蓋）'
          : '● 第三局必打區（第 3 局保證登場）';

    const priorityReason =
      s.setKey === 'set1_4'
        ? '第 1 局必打，且若賽事進入第 4 局將再次回到本區應援，為整場比賽出現局數最高的首選區域。'
        : s.setKey === 'set2_5'
          ? '第 2 局必打，若賽事進入決勝第 5 局亦會回到本區應援。'
          : '排球每場至少進行 3 局，第 3 局保證於本區登場應援。';

    results.push({
      setKey: s.setKey,
      setLabel: s.setLabel,
      setShortLabel: s.setShortLabel,
      priorityBadge,
      priorityReason,
      zone: foundZone,
      initialSlotIndex: initSlot,
      initialSlotLabel: initMeta.label,
      initialSeatRange: initMeta.range,
      initialCoreSeats: initMeta.core,
      after10SlotIndex: after10Slot,
      after10SlotLabel: afterMeta.label,
      after10SeatRange: afterMeta.range,
      after10CoreSeats: afterMeta.core,
      sweetSpotRange: sweet.range,
      sweetSpotLabel: sweet.label,
      sweetSpotReason: sweet.reason,
    });
  }

  return results;
}

export const PROXIMITY_SEAT_THRESHOLD = 12;

export interface PhaseDistanceDetail {
  girlZone: AceZoneId;
  girlSlotIndex: 0 | 1 | 2;
  girlSlotLabel: string;
  girlSeatRange: [number, number];
  girlCoreSeat: number;
  girlCoreSeatLabel: string;
  zoneDiff: number;
  isSameZone: boolean;
  isDirectFront: boolean;
  isExactCore: boolean;
  isWithin12Seats: boolean;
  isConnectedBoundary: boolean;
  boundaryConnectionLabel: string | null;
  seatsToDirectRange: number;
  seatsToCoreCenter: number;
  globalSeatDistance: number;
  directionText: string;
  headlineDistanceText: string;
  detailDescription: string;
  proximityPercent: number;
  statusLevel: 'direct_core' | 'direct_range' | 'same_zone_near' | 'same_zone_far' | 'cross_zone';
}

export interface SetGirlDistanceComparison {
  setKey: 'set1_4' | 'set2_5' | 'set3';
  setLabel: string;
  setShortLabel: string;
  initial: PhaseDistanceDetail;
  after10: PhaseDistanceDetail;
}

const ZONE_INDEX: Record<AceZoneId, number> = { A: 0, B: 1, C: 2 };

const SLOT_CORE_SEAT: Record<0 | 1 | 2, { center: number; minCore: number; maxCore: number; label: string }> = {
  0: { center: 5, minCore: 4, maxCore: 5, label: '4–5 號' },
  1: { center: 12, minCore: 11, maxCore: 13, label: '12 號' },
  2: { center: 19, minCore: 19, maxCore: 20, label: '19–20 號' },
};

function computePhaseDistance(
  userZone: AceZoneId,
  userSeat: number,
  girlZone: AceZoneId,
  girlSlotIndex: 0 | 1 | 2
): PhaseDistanceDetail {
  const uZ = ZONE_INDEX[userZone];
  const gZ = ZONE_INDEX[girlZone];
  const zoneDiff = Math.abs(gZ - uZ);
  const isSameZone = zoneDiff === 0;

  const slotMeta = SLOT_META[girlSlotIndex];
  const coreMeta = SLOT_CORE_SEAT[girlSlotIndex];
  const [rangeStart, rangeEnd] = slotMeta.range;

  // 連續座位編號：A 區 1..23、B 區 24..46（A23 接 B1）、C 區 47..69（B23 接 C1）
  const userGlobalSeat = uZ * 23 + userSeat;
  const girlGlobalCoreSeat = gZ * 23 + coreMeta.center;
  const girlGlobalCoreMin = gZ * 23 + coreMeta.minCore;
  const girlGlobalCoreMax = gZ * 23 + coreMeta.maxCore;
  const girlGlobalRangeStart = gZ * 23 + rangeStart;
  const girlGlobalRangeEnd = gZ * 23 + rangeEnd;

  const globalSeatDistance = Math.abs(girlGlobalCoreSeat - userGlobalSeat);

  let seatsToDirectRange = 0;
  if (userGlobalSeat < girlGlobalRangeStart) {
    seatsToDirectRange = girlGlobalRangeStart - userGlobalSeat;
  } else if (userGlobalSeat > girlGlobalRangeEnd) {
    seatsToDirectRange = userGlobalSeat - girlGlobalRangeEnd;
  }

  let seatsToCoreCenter = 0;
  if (userGlobalSeat >= girlGlobalCoreMin && userGlobalSeat <= girlGlobalCoreMax) {
    seatsToCoreCenter = 0;
  } else if (userGlobalSeat < girlGlobalCoreMin) {
    seatsToCoreCenter = girlGlobalCoreMin - userGlobalSeat;
  } else {
    seatsToCoreCenter = userGlobalSeat - girlGlobalCoreMax;
  }

  const isDirectFront = isSameZone && userSeat >= rangeStart && userSeat <= rangeEnd;
  const isExactCore = isSameZone && seatsToCoreCenter === 0;
  const isWithin12Seats = seatsToCoreCenter <= PROXIMITY_SEAT_THRESHOLD;
  const isConnectedBoundary = !isSameZone && isWithin12Seats;

  let boundaryConnectionLabel: string | null = null;
  if (isConnectedBoundary) {
    if (userZone === 'A' && girlZone === 'B') {
      boundaryConnectionLabel = 'A 區大號與 B 區小號相連';
    } else if (userZone === 'B' && girlZone === 'A') {
      boundaryConnectionLabel = 'B 區小號與 A 區大號相連';
    } else if (userZone === 'B' && girlZone === 'C') {
      boundaryConnectionLabel = 'B 區大號與 C 區小號相連';
    } else if (userZone === 'C' && girlZone === 'B') {
      boundaryConnectionLabel = 'C 區小號與 B 區大號相連';
    }
  }

  const deltaGlobal = girlGlobalCoreSeat - userGlobalSeat;
  const dirShort = deltaGlobal < 0 ? '往左' : '往右';
  let directionText = '正前方直視';
  if (!isDirectFront) {
    if (isSameZone) {
      directionText = `${dirShort}約 ${seatsToCoreCenter} 席`;
    } else if (isConnectedBoundary) {
      directionText = `跨區相連 · ${dirShort}約 ${seatsToCoreCenter} 席`;
    } else {
      directionText = `${dirShort} ${girlZone} 區`;
    }
  }

  let headlineDistanceText = '';
  let detailDescription = '';
  let proximityPercent = 50;
  let statusLevel: PhaseDistanceDetail['statusLevel'] = 'cross_zone';

  if (isExactCore) {
    statusLevel = 'direct_core';
    proximityPercent = 100;
    headlineDistanceText = '正對 C 位（相距 0 席）';
    detailDescription = `就在你正前方 ${girlZone} 區${slotMeta.label}核心席（${coreMeta.label}）。`;
  } else if (isDirectFront) {
    statusLevel = 'direct_range';
    proximityPercent = Math.max(88, 98 - seatsToCoreCenter * 3);
    headlineDistanceText = `正前方視角內（距中心 ${seatsToCoreCenter} 席）`;
    detailDescription = `位於你正前方 ${girlZone} 區${slotMeta.label}（${rangeStart}–${rangeEnd} 號），距中心僅 ${seatsToCoreCenter} 席。`;
  } else if (isWithin12Seats && isSameZone) {
    statusLevel = 'same_zone_near';
    proximityPercent = Math.max(70, 92 - seatsToCoreCenter * 2);
    headlineDistanceText = `同區接近中 · 相距 ${seatsToCoreCenter} 席`;
    detailDescription = `位於同區${slotMeta.label}（${rangeStart}–${rangeEnd} 號），從你的座位${dirShort}約 ${seatsToCoreCenter} 席（差 ${seatsToDirectRange} 席進正對區）。`;
  } else if (isConnectedBoundary) {
    statusLevel = 'same_zone_near';
    proximityPercent = Math.max(68, 90 - seatsToCoreCenter * 2);
    headlineDistanceText = `跨區相連接近中 · 相距 ${seatsToCoreCenter} 席`;
    detailDescription = `${boundaryConnectionLabel}，位於鄰接之 ${girlZone} 區${slotMeta.label}（${rangeStart}–${rangeEnd} 號），從你的座位${dirShort}僅相距 ${seatsToCoreCenter} 席（差 ${seatsToDirectRange} 席進正對區）。`;
  } else if (isSameZone) {
    statusLevel = 'same_zone_far';
    proximityPercent = 40;
    headlineDistanceText = `相距 ${seatsToCoreCenter} 席（超過 12 席）`;
    detailDescription = `位於 ${girlZone} 區${slotMeta.label}，距離超過 12 個座位。`;
  } else {
    statusLevel = 'cross_zone';
    proximityPercent = 20;
    headlineDistanceText = `相距 ${seatsToCoreCenter} 席（超過 12 席）`;
    detailDescription = `位於 ${girlZone} 區${slotMeta.label}，距離超過 12 個座位。`;
  }

  return {
    girlZone,
    girlSlotIndex,
    girlSlotLabel: slotMeta.label,
    girlSeatRange: slotMeta.range,
    girlCoreSeat: coreMeta.center,
    girlCoreSeatLabel: coreMeta.label,
    zoneDiff,
    isSameZone,
    isDirectFront,
    isExactCore,
    isWithin12Seats,
    isConnectedBoundary,
    boundaryConnectionLabel,
    seatsToDirectRange,
    seatsToCoreCenter,
    globalSeatDistance,
    directionText,
    headlineDistanceText,
    detailDescription,
    proximityPercent: Math.round(proximityPercent),
    statusLevel,
  };
}

/**
 * 計算使用者所選座位（userZone, userSeat）與指定主推女孩（girlId）在整場各局（開局 0–10 分、破 10 分後）之精確距離分析
 */
export function getFullMatchGirlDistanceSummary(
  matchSchedule: MatchStationSchedule,
  userZone: AceZoneId,
  userSeat: number,
  girlId: string
): SetGirlDistanceComparison[] {
  const zones: AceZoneId[] = ['A', 'B', 'C'];
  const comparisons: SetGirlDistanceComparison[] = [];

  for (const s of matchSchedule.sets) {
    let foundZone: AceZoneId | null = null;
    let initSlot: 0 | 1 | 2 = 0;
    let after10Slot: 0 | 1 | 2 = 0;

    for (const z of zones) {
      const iIdx = s.initial[z].indexOf(girlId);
      const aIdx = s.after10Points[z].indexOf(girlId);
      if (iIdx !== -1 && aIdx !== -1) {
        foundZone = z;
        initSlot = iIdx as 0 | 1 | 2;
        after10Slot = aIdx as 0 | 1 | 2;
        break;
      }
    }

    if (!foundZone) continue;

    comparisons.push({
      setKey: s.setKey,
      setLabel: s.setLabel,
      setShortLabel: s.setShortLabel,
      initial: computePhaseDistance(userZone, userSeat, foundZone, initSlot),
      after10: computePhaseDistance(userZone, userSeat, foundZone, after10Slot),
    });
  }

  return comparisons;
}


