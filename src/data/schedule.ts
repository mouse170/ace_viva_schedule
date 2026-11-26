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
  initial: Record<AceZoneId, string[]>;
  after10Points: Record<AceZoneId, string[]>;
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
    themeSubtitle: '欸辣代班團長、MC 巫苡萱（#111）與韓籍成員鄭熙靜（#42）領銜應援',
    date: '2026.11.21',
    dayOfWeek: '週六 SAT',
    time: '13:30',
    opponent: '台鋼天鷹',
    venue: '臺中市國立臺灣體育運動大學體育館',
    attendingMemberIds: [
      'avawu',
      'ella',
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
    highlightNote: '已公布 2F ACE 集氣區 A/B/C 區完整站位表；欸辣擔任代班團長，開場舞於 1F 猛虎精武區、中場於 1F 猛虎力行區演出',
    hasStationMap: true,
    instagramPostUrl: 'https://www.instagram.com/p/DfwBSIEkoPR/',
  },
  {
    id: '2026-11-22',
    weekLabel: 'THEME WEEK 03 · 11 月主題週 DAY 2',
    themeTitle: '致青春 創造 WIN',
    themeSubtitle: '欸辣代班團長、MC 巫苡萱（#111）與韓籍成員鄭熙靜（#42）領銜應援',
    date: '2026.11.22',
    dayOfWeek: '週日 SUN',
    time: '13:30',
    opponent: '新竹市可利工程師',
    venue: '臺中市國立臺灣體育運動大學體育館',
    attendingMemberIds: [
      'avawu',
      'ella',
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
    highlightNote: '已公布 2F ACE 集氣區 A/B/C 區完整站位表；演出期間限時開放 2F 拍攝限定區供季票球迷拍攝',
    hasStationMap: true,
    instagramPostUrl: 'https://www.instagram.com/p/DfwBSIEkoPR/',
  },
  {
    id: '2026-12-12',
    weekLabel: 'THEME WEEK 04 · 聖誕主題週 DAY 1',
    themeTitle: 'HOME FOR CHRISTMAS',
    themeSubtitle: '車榮玹（#21）、李珠熙（#45）、應援團長馬妹（#41）與 MC 心璇（#25）聖誕派對',
    date: '2026.12.12',
    dayOfWeek: '週六 SAT',
    time: '14:30',
    opponent: '主場例行賽',
    venue: '臺中市國立臺灣體育運動大學體育館',
    attendingMemberIds: [
      'shenxuan',
      'mamai',
      'chayounghyun',
      'leejuhee',
      'yipei',
      'mega',
      'sinping',
      'nicole',
      'peichen',
      'xuanxuan',
      'weiwei',
    ],
    highlightNote: '已公布 2F ACE 集氣區 A/B/C 區站位表，車榮玹與李珠熙領銜聖誕主題週首日應援',
    hasStationMap: true,
    instagramPostUrl: 'https://www.instagram.com/p/DfwBSIEkoPR/',
  },
  {
    id: '2026-12-13',
    weekLabel: 'THEME WEEK 04 · 聖誕主題週 DAY 2',
    themeTitle: 'HOME FOR CHRISTMAS',
    themeSubtitle: '班表驚喜加碼依沛與李珠熙！10 位女孩（3/4/3 編制）與 Yuri、車榮玹壓軸合體',
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
      'leejuhee',
      'yipei',
      'mega',
      'sinping',
      'nicole',
      'peichen',
      'ella',
      'weiwei',
    ],
    highlightNote: '已公布 2F ACE 集氣區站位表（特別加碼 10 人 3/4/3 輪換編制），2026 上半季最終主場日壓軸應援',
    hasStationMap: true,
    instagramPostUrl: 'https://www.instagram.com/p/DfwBSIEkoPR/',
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
  {
    matchId: '2026-11-21',
    dateLabel: '11/21 (六) 13:30',
    dayLabel: '11/21 週六場',
    opponent: '台鋼天鷹',
    themeName: '致青春・創造 WIN',
    postUrl: 'https://www.instagram.com/p/DfwBSIEkoPR/',
    mcAndLeaderIds: ['avawu', 'ella'],
    sets: [
      {
        setKey: 'set1_4',
        setLabel: '第一局 & 第四局',
        setShortLabel: '第 1、4 局',
        initial: {
          A: ['xuanxuan', 'mega', 'jungheejung'],
          B: ['yixuan', 'sinping', 'ann'],
          C: ['weiwei', 'yuan', 'yipei'],
        },
        after10Points: {
          A: ['jungheejung', 'xuanxuan', 'mega'],
          B: ['ann', 'yixuan', 'sinping'],
          C: ['yipei', 'weiwei', 'yuan'],
        },
      },
      {
        setKey: 'set2_5',
        setLabel: '第二局 & 第五局',
        setShortLabel: '第 2、5 局',
        initial: {
          A: ['yipei', 'weiwei', 'yuan'],
          B: ['jungheejung', 'xuanxuan', 'mega'],
          C: ['ann', 'yixuan', 'sinping'],
        },
        after10Points: {
          A: ['yuan', 'yipei', 'weiwei'],
          B: ['mega', 'jungheejung', 'xuanxuan'],
          C: ['sinping', 'ann', 'yixuan'],
        },
      },
      {
        setKey: 'set3',
        setLabel: '第三局',
        setShortLabel: '第 3 局',
        initial: {
          A: ['sinping', 'ann', 'yixuan'],
          B: ['yuan', 'yipei', 'weiwei'],
          C: ['mega', 'jungheejung', 'xuanxuan'],
        },
        after10Points: {
          A: ['yixuan', 'sinping', 'ann'],
          B: ['weiwei', 'yuan', 'yipei'],
          C: ['xuanxuan', 'mega', 'jungheejung'],
        },
      },
    ],
  },
  {
    matchId: '2026-11-22',
    dateLabel: '11/22 (日) 13:30',
    dayLabel: '11/22 週日場',
    opponent: '新竹市可利工程師',
    themeName: '致青春・創造 WIN',
    postUrl: 'https://www.instagram.com/p/DfwBSIEkoPR/',
    mcAndLeaderIds: ['avawu', 'ella'],
    sets: [
      {
        setKey: 'set1_4',
        setLabel: '第一局 & 第四局',
        setShortLabel: '第 1、4 局',
        initial: {
          A: ['ann', 'yuan', 'mega'],
          B: ['jungheejung', 'yixuan', 'weiwei'],
          C: ['sinping', 'xuanxuan', 'yipei'],
        },
        after10Points: {
          A: ['mega', 'ann', 'yuan'],
          B: ['weiwei', 'jungheejung', 'yixuan'],
          C: ['yipei', 'sinping', 'xuanxuan'],
        },
      },
      {
        setKey: 'set2_5',
        setLabel: '第二局 & 第五局',
        setShortLabel: '第 2、5 局',
        initial: {
          A: ['yipei', 'sinping', 'xuanxuan'],
          B: ['mega', 'ann', 'yuan'],
          C: ['weiwei', 'jungheejung', 'yixuan'],
        },
        after10Points: {
          A: ['xuanxuan', 'yipei', 'sinping'],
          B: ['yuan', 'mega', 'ann'],
          C: ['yixuan', 'weiwei', 'jungheejung'],
        },
      },
      {
        setKey: 'set3',
        setLabel: '第三局',
        setShortLabel: '第 3 局',
        initial: {
          A: ['yixuan', 'weiwei', 'jungheejung'],
          B: ['xuanxuan', 'yipei', 'sinping'],
          C: ['yuan', 'mega', 'ann'],
        },
        after10Points: {
          A: ['jungheejung', 'yixuan', 'weiwei'],
          B: ['sinping', 'xuanxuan', 'yipei'],
          C: ['ann', 'yuan', 'mega'],
        },
      },
    ],
  },
  {
    matchId: '2026-12-12',
    dateLabel: '12/12 (六) 14:30',
    dayLabel: '12/12 週六場',
    opponent: '主場例行賽',
    themeName: 'HOME FOR CHRISTMAS',
    postUrl: 'https://www.instagram.com/p/DfwBSIEkoPR/',
    mcAndLeaderIds: ['shenxuan', 'mamai'],
    sets: [
      {
        setKey: 'set1_4',
        setLabel: '第一局 & 第四局',
        setShortLabel: '第 1、4 局',
        initial: {
          A: ['nicole', 'sinping', 'mega'],
          B: ['xuanxuan', 'leejuhee', 'weiwei'],
          C: ['chayounghyun', 'yipei', 'peichen'],
        },
        after10Points: {
          A: ['mega', 'nicole', 'sinping'],
          B: ['weiwei', 'xuanxuan', 'leejuhee'],
          C: ['peichen', 'chayounghyun', 'yipei'],
        },
      },
      {
        setKey: 'set2_5',
        setLabel: '第二局 & 第五局',
        setShortLabel: '第 2、5 局',
        initial: {
          A: ['peichen', 'chayounghyun', 'yipei'],
          B: ['mega', 'nicole', 'sinping'],
          C: ['weiwei', 'xuanxuan', 'leejuhee'],
        },
        after10Points: {
          A: ['yipei', 'peichen', 'chayounghyun'],
          B: ['sinping', 'mega', 'nicole'],
          C: ['leejuhee', 'weiwei', 'xuanxuan'],
        },
      },
      {
        setKey: 'set3',
        setLabel: '第三局',
        setShortLabel: '第 3 局',
        initial: {
          A: ['leejuhee', 'weiwei', 'xuanxuan'],
          B: ['yipei', 'peichen', 'chayounghyun'],
          C: ['sinping', 'mega', 'nicole'],
        },
        after10Points: {
          A: ['xuanxuan', 'leejuhee', 'weiwei'],
          B: ['chayounghyun', 'yipei', 'peichen'],
          C: ['nicole', 'sinping', 'mega'],
        },
      },
    ],
  },
  {
    matchId: '2026-12-13',
    dateLabel: '12/13 (日) 14:30',
    dayLabel: '12/13 週日場（10人加碼）',
    opponent: '主場例行賽',
    themeName: 'HOME FOR CHRISTMAS',
    postUrl: 'https://www.instagram.com/p/DfwBSIEkoPR/',
    mcAndLeaderIds: ['shenxuan', 'mamai'],
    sets: [
      {
        setKey: 'set1_4',
        setLabel: '第一局 & 第四局',
        setShortLabel: '第 1、4 局',
        initial: {
          A: ['chayounghyun', 'weiwei', 'mega'],
          B: ['yuri', 'peichen', 'ella', 'sinping'],
          C: ['leejuhee', 'yipei', 'nicole'],
        },
        after10Points: {
          A: ['mega', 'chayounghyun', 'weiwei'],
          B: ['sinping', 'yuri', 'peichen', 'ella'],
          C: ['nicole', 'leejuhee', 'yipei'],
        },
      },
      {
        setKey: 'set2_5',
        setLabel: '第二局 & 第五局',
        setShortLabel: '第 2、5 局',
        initial: {
          A: ['nicole', 'leejuhee', 'yipei'],
          B: ['mega', 'chayounghyun', 'weiwei'],
          C: ['sinping', 'yuri', 'peichen', 'ella'],
        },
        after10Points: {
          A: ['yipei', 'nicole', 'leejuhee'],
          B: ['weiwei', 'mega', 'chayounghyun'],
          C: ['ella', 'sinping', 'yuri', 'peichen'],
        },
      },
      {
        setKey: 'set3',
        setLabel: '第三局',
        setShortLabel: '第 3 局',
        initial: {
          A: ['ella', 'sinping', 'yuri', 'peichen'],
          B: ['yipei', 'nicole', 'leejuhee'],
          C: ['weiwei', 'mega', 'chayounghyun'],
        },
        after10Points: {
          A: ['peichen', 'ella', 'sinping', 'yuri'],
          B: ['leejuhee', 'yipei', 'nicole'],
          C: ['chayounghyun', 'weiwei', 'mega'],
        },
      },
    ],
  },
];

/**
 * 根據每區 1–24 號座位編號，計算正前方對應之女孩站位索引（0: 左位、1: 中位、2: 右位）與視角描述
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
  if (seatNumber <= 16) {
    return {
      slotIndex: 1,
      slotName: '中位（站位 2）',
      seatRangeLabel: '9–16 號席位區段',
      viewAngleNote:
        seatNumber === 12 || seatNumber === 13
          ? `第 ${seatNumber} 號為本區 24 席之「核心正中心 C 位」，正對「中位（站位 2）」女孩且左右視野對稱`
          : seatNumber === 9
            ? '第 9 號正對「中位（站位 2）」女孩，同時緊鄰「左位（站位 1）」女孩'
            : seatNumber === 16
              ? '第 16 號正對「中位（站位 2）」女孩，同時緊鄰「右位（站位 3）」女孩'
              : `第 ${seatNumber} 號正對本區核心「中位（站位 2）」應援女孩`,
      adjacentSlotIndex: seatNumber === 9 ? 0 : seatNumber === 16 ? 2 : undefined,
    };
  }
  return {
    slotIndex: 2,
    slotName: '右位（站位 3）',
    seatRangeLabel: '17–24 號席位區段',
    viewAngleNote:
      seatNumber <= 18
        ? `第 ${seatNumber} 號位於中位與右位交界處，正對「右位」女孩，同時享有極佳的「中位」女孩近距離斜角視野`
        : seatNumber >= 20 && seatNumber <= 21
          ? `第 ${seatNumber} 號為本區「右位（站位 3）」黃金正中央直線對焦席`
          : `第 ${seatNumber} 號正對本區「右位（站位 3）」應援女孩`,
    adjacentSlotIndex: seatNumber <= 18 ? 1 : undefined,
  };
}

export interface CrossZoneAdjacentOption {
  adjacentZone: AceZoneId;
  adjacentSeatRange: [number, number];
  adjacentCoreSeat: number;
  boundaryName: string;
  label: string;
  reason: string;
}

export interface GirlSetZoneRecommendation {
  setKey: 'set1_4' | 'set2_5' | 'set3';
  setLabel: string;
  setShortLabel: string;
  priorityBadge: string;
  priorityReason: string;
  zone: AceZoneId;
  initialSlotIndex: number;
  initialSlotLabel: string;
  initialSeatRange: [number, number];
  initialCoreSeats: string;
  after10SlotIndex: number;
  after10SlotLabel: string;
  after10SeatRange: [number, number];
  after10CoreSeats: string;
  sweetSpotRange: [number, number];
  sweetSpotLabel: string;
  sweetSpotReason: string;
  crossZoneOption: CrossZoneAdjacentOption | null;
}

export interface CrossZoneGoldenInterval {
  id: 'AB' | 'BC';
  junctionTitle: string;
  boundaryTag: string;
  leftZone: AceZoneId;
  leftSeatRange: [number, number];
  leftBestSeat: number;
  rightZone: AceZoneId;
  rightSeatRange: [number, number];
  rightBestSeat: number;
  combinedRangeLabel: string;
  bestSingleSeatLabel: string;
  bestSingleZone: AceZoneId;
  bestSingleSeat: number;
  coveredSetsLabel: string;
  coveredPhasesCount: number;
  summaryReason: string;
  score: number;
}

const SLOT_META: Record<
  0 | 1 | 2,
  { label: string; range: [number, number]; core: string }
> = {
  0: { label: '觀眾右側（IG 左位 1–8 號）', range: [1, 8], core: '4–5 號' },
  1: { label: '觀眾中央（IG 中位 9–16 號）', range: [9, 16], core: '12–13 號' },
  2: { label: '觀眾左側（IG 右位 17–24 號）', range: [17, 24], core: '20–21 號' },
};

const SLOT_META_4: Record<
  0 | 1 | 2 | 3,
  { label: string; range: [number, number]; core: string }
> = {
  0: { label: '觀眾右側（4 人左位 1–6 號）', range: [1, 6], core: '3–4 號' },
  1: { label: '觀眾中右（4 人中左 7–12 號）', range: [7, 12], core: '9–10 號' },
  2: { label: '觀眾中左（4 人中右 13–18 號）', range: [13, 18], core: '15–16 號' },
  3: { label: '觀眾左側（4 人右位 19–24 號）', range: [19, 24], core: '21–22 號' },
};

export function getZoneSlotIndexForSeat(
  seatNumber: number,
  totalSlots: number
): number {
  if (totalSlots === 4) {
    if (seatNumber <= 6) return 0;
    if (seatNumber <= 12) return 1;
    if (seatNumber <= 18) return 2;
    return 3;
  }
  return getSeatPositionMapping(seatNumber).slotIndex;
}

function getSlotMeta(
  slotIndex: number,
  totalSlots: number
): { label: string; range: [number, number]; core: string } {
  if (totalSlots === 4) {
    const idx = Math.max(0, Math.min(3, slotIndex)) as 0 | 1 | 2 | 3;
    return SLOT_META_4[idx];
  }
  const idx = Math.max(0, Math.min(2, slotIndex)) as 0 | 1 | 2;
  return SLOT_META[idx];
}

function computeSweetSpot(
  initSlot: number,
  after10Slot: number,
  totalSlots = 3
): { range: [number, number]; label: string; reason: string } {
  if (totalSlots === 4) {
    if (initSlot === 0 && after10Slot === 1) {
      return {
        range: [4, 11],
        label: '4 號 – 11 號（黃金交界 6–9 號）',
        reason:
          '觀眾面向球場視角：4 人編制下，開局站 1–6 號，破 10 分後移至 7–12 號；選擇 4–11 號可全程直視。',
      };
    }
    if (initSlot === 1 && after10Slot === 2) {
      return {
        range: [9, 16],
        label: '9 號 – 16 號（黃金交界 11–14 號）',
        reason:
          '觀眾面向球場視角：4 人編制下，開局站 7–12 號，破 10 分後移至 13–17 號；選擇 9–16 號兼顧中央兩段。',
      };
    }
    if (initSlot === 2 && after10Slot === 3) {
      return {
        range: [14, 21],
        label: '14 號 – 21 號（黃金交界 16–19 號）',
        reason:
          '觀眾面向球場視角：4 人編制下，開局站 13–17 號，破 10 分後移至 18–23 號；選擇 14–21 號兼顧左翼。',
      };
    }
    return {
      range: [1, 6],
      label: '1 號 – 6 號（決勝期核心 3–4 號）或 18–23 號',
      reason:
        '觀眾面向球場視角：4 人編制下，開局站左側 18–23 號，破 10 分後移至右側 1–6 號；首推 1–6 號鎖定局末決勝時段。',
    };
  }

  // 1-8 號 (觀眾右手邊) -> 9-15 號 (觀眾正中央)
  if (initSlot === 0 && after10Slot === 1) {
    return {
      range: [6, 13],
      label: '6 號 – 13 號（黃金交界 7–11 號）',
      reason:
        '觀眾面向球場視角：開局（0–10 分）站你右手邊（1–8 號）、破 10 分後決勝長時段移至正中央（9–15 號）；選擇 6–13 號可整局免大幅轉頭全程直視。',
    };
  }
  // 9-15 號 (觀眾正中央) -> 16-23 號 (觀眾左手邊)
  if (initSlot === 1 && after10Slot === 2) {
    return {
      range: [12, 19],
      label: '12 號 – 19 號（黃金交界 14–17 號）',
      reason:
        '觀眾面向球場視角：開局（0–10 分）站正中央（9–15 號）、破 10 分後決勝長時段移至你左手邊（16–23 號）；選擇 12–19 號可同時兼顧中央與左翼兩段視野。',
    };
  }
  // 16-23 號 (觀眾左手邊) -> 1-8 號 (觀眾右手邊)
  return {
    range: [1, 8],
    label: '1 號 – 8 號（決勝期 C 位 4–5 號）或 16–23 號',
    reason:
      '觀眾面向球場視角：開局（0–10 分）站你左手邊（16–23 號），主隊破 10 分後（11–25 分，佔單局 60% 以上時間）移至你右手邊（1–8 號）；首推 1–8 號鎖定局末關鍵應援，或選 16–23 號鎖定開局。',
  };
}

function computeCrossZoneAdjacentOption(
  zone: AceZoneId,
  initSlot: number,
  after10Slot: number,
  totalSlots = 3
): CrossZoneAdjacentOption | null {
  const maxSlot = totalSlots - 1;
  const touchesSmallNumEdge = initSlot === 0 || after10Slot === 0; // 小號端（觀眾右手邊）
  const touchesLargeNumEdge = initSlot === maxSlot || after10Slot === maxSlot; // 大號端（觀眾左手邊）

  if (zone === 'A' && touchesLargeNumEdge) {
    const isAfter10Large = after10Slot === maxSlot;
    return {
      adjacentZone: 'B',
      adjacentSeatRange: [1, 5],
      adjacentCoreSeat: 2,
      boundaryName: '觀眾視角：左手邊 B1 ◀ 緊鄰 ▶ 右手邊 A24',
      label: '跨區 8 席黃金座（B 小號 ↔ A 大號）：B 區 1–5 號',
      reason: isAfter10Large
        ? '破 10 分後她站 A 區左翼大號（17–24 號），緊鄰左手邊 B 區 1 號；坐 B 區 1–5 號可在 8 席黃金區內拍攝，同時兼顧她在 B 區的局數。'
        : '開局她站 A 區左翼大號（17–24 號）緊鄰左手邊 B 區 1 號；坐 B 區 1–5 號可在 8 席內跨區斜拍並兼顧她在 B 區的應援局數。',
    };
  }

  if (zone === 'B' && touchesSmallNumEdge && !touchesLargeNumEdge) {
    const isAfter10Small = after10Slot === 0;
    return {
      adjacentZone: 'A',
      adjacentSeatRange: [20, 24],
      adjacentCoreSeat: 23,
      boundaryName: '觀眾視角：左手邊 B1 ◀ 緊鄰 ▶ 右手邊 A24',
      label: '跨區 8 席黃金座（B 小號 ↔ A 大號）：A 區 20–24 號',
      reason: isAfter10Small
        ? '破 10 分後她站 B 區右翼小號（1–8 號），緊鄰右手邊 A 區 24 號；坐 A 區 20–24 號可在 8 席黃金區內拍攝，還能兼顧她在 A 區的局數。'
        : '開局她站 B 區右翼小號（1–8 號）緊鄰右手邊 A 區 24 號；坐 A 區 20–24 號可在 8 席內跨區拍攝並兼顧她在 A 區的應援局數。',
    };
  }

  if (zone === 'B' && touchesLargeNumEdge && !touchesSmallNumEdge) {
    const isAfter10Large = after10Slot === maxSlot;
    return {
      adjacentZone: 'C',
      adjacentSeatRange: [1, 5],
      adjacentCoreSeat: 2,
      boundaryName: '觀眾視角：左手邊 C1 ◀ 緊鄰 ▶ 右手邊 B24',
      label: '跨區 8 席黃金座（C 小號 ↔ B 大號）：C 區 1–5 號',
      reason: isAfter10Large
        ? '破 10 分後她站 B 區左翼大號（17–24 號），緊鄰左手邊 C 區 1 號；坐 C 區 1–5 號可在 8 席黃金區內拍攝，還能兼顧她在 C 區的局數。'
        : '開局她站 B 區左翼大號（17–24 號）緊鄰左手邊 C 區 1 號；坐 C 區 1–5 號可在 8 席內跨區拍攝並兼顧她在 C 區的應援局數。',
    };
  }

  if (zone === 'B' && touchesSmallNumEdge && touchesLargeNumEdge) {
    return {
      adjacentZone: 'A',
      adjacentSeatRange: [20, 24],
      adjacentCoreSeat: 23,
      boundaryName: '觀眾視角：C1 ↔ B 區 ↔ A24',
      label: '跨區 8 席黃金座：A 區 20–24 號（B小號↔A大號）或 C 區 1–5 號（C小號↔B大號）',
      reason:
        '破 10 分主力段站 B 區小號（1–8 號）可坐 A 區 20–24 號；開局站 B 區大號（17–24 號）可坐 C 區 1–5 號，皆在 8 席黃金區內。',
    };
  }

  if (zone === 'C' && touchesSmallNumEdge) {
    const isAfter10Small = after10Slot === 0;
    return {
      adjacentZone: 'B',
      adjacentSeatRange: [20, 24],
      adjacentCoreSeat: 23,
      boundaryName: '觀眾視角：左手邊 C1 ◀ 緊鄰 ▶ 右手邊 B24',
      label: '跨區 8 席黃金座（C 小號 ↔ B 大號）：B 區 20–24 號',
      reason: isAfter10Small
        ? '破 10 分後她站 C 區右翼小號（1–8 號），緊鄰右手邊 B 區 24 號；坐 B 區 20–24 號可在 8 席黃金區內拍攝，還能兼顧她在 B 區的局數。'
        : '開局她站 C 區右翼小號（1–8 號）緊鄰右手邊 B 區 24 號；坐 B 區 20–24 號可在 8 席內跨區拍攝並兼顧她在 B 區的應援局數。',
    };
  }

  return null;
}

/**
 * 依據指定場次與女孩 ID，計算該女孩在整場比賽各局之區域、站位與最佳推薦座位區間（含跨區鄰接推薦）
 */
export function getGirlSeatRecommendations(
  matchSchedule: MatchStationSchedule,
  memberId: string
): GirlSetZoneRecommendation[] {
  const results: GirlSetZoneRecommendation[] = [];
  const zones: AceZoneId[] = ['A', 'B', 'C'];

  for (const s of matchSchedule.sets) {
    let foundZone: AceZoneId | null = null;
    let initSlot = 0;
    let after10Slot = 0;
    let totalSlots = 3;

    for (const z of zones) {
      const iIdx = s.initial[z].indexOf(memberId);
      const aIdx = s.after10Points[z].indexOf(memberId);
      if (iIdx !== -1 && aIdx !== -1) {
        foundZone = z;
        initSlot = iIdx;
        after10Slot = aIdx;
        totalSlots = s.initial[z].length;
        break;
      }
    }

    if (!foundZone) continue;

    const initMeta = getSlotMeta(initSlot, totalSlots);
    const afterMeta = getSlotMeta(after10Slot, totalSlots);
    const sweet = computeSweetSpot(initSlot, after10Slot, totalSlots);
    const crossZoneOption = computeCrossZoneAdjacentOption(
      foundZone,
      initSlot,
      after10Slot,
      totalSlots
    );

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
      crossZoneOption,
    });
  }

  return results;
}

export const PROXIMITY_SEAT_THRESHOLD = 8;

export interface PhaseDistanceDetail {
  girlZone: AceZoneId;
  girlSlotIndex: number;
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
  signedSeatOffset: number;
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
  1: { center: 12, minCore: 12, maxCore: 13, label: '12–13 號' },
  2: { center: 20, minCore: 20, maxCore: 21, label: '20–21 號' },
};

const SLOT_CORE_SEAT_4: Record<0 | 1 | 2 | 3, { center: number; minCore: number; maxCore: number; label: string }> = {
  0: { center: 3, minCore: 3, maxCore: 4, label: '3–4 號' },
  1: { center: 9, minCore: 9, maxCore: 10, label: '9–10 號' },
  2: { center: 15, minCore: 15, maxCore: 16, label: '15–16 號' },
  3: { center: 21, minCore: 21, maxCore: 22, label: '21–22 號' },
};

function getSlotCoreMeta(slotIndex: number, totalSlots: number) {
  if (totalSlots === 4) {
    const idx = Math.max(0, Math.min(3, slotIndex)) as 0 | 1 | 2 | 3;
    return SLOT_CORE_SEAT_4[idx];
  }
  const idx = Math.max(0, Math.min(2, slotIndex)) as 0 | 1 | 2;
  return SLOT_CORE_SEAT[idx];
}

export function computePhaseDistance(
  userZone: AceZoneId,
  userSeat: number,
  girlZone: AceZoneId,
  girlSlotIndex: number,
  totalSlots = 3
): PhaseDistanceDetail {
  const uZ = ZONE_INDEX[userZone];
  const gZ = ZONE_INDEX[girlZone];
  const zoneDiff = Math.abs(gZ - uZ);
  const isSameZone = zoneDiff === 0;

  const slotMeta = getSlotMeta(girlSlotIndex, totalSlots);
  const coreMeta = getSlotCoreMeta(girlSlotIndex, totalSlots);
  const [rangeStart, rangeEnd] = slotMeta.range;

  // 連續座位編號：A 區 1..24、B 區 25..48（A24 接 B1）、C 區 49..72（B24 接 C1）
  const userGlobalSeat = uZ * 24 + userSeat;
  const girlGlobalCoreSeat = gZ * 24 + coreMeta.center;
  const girlGlobalCoreMin = gZ * 24 + coreMeta.minCore;
  const girlGlobalCoreMax = gZ * 24 + coreMeta.maxCore;
  const girlGlobalRangeStart = gZ * 24 + rangeStart;
  const girlGlobalRangeEnd = gZ * 24 + rangeEnd;

  const globalSeatDistance = Math.abs(girlGlobalCoreSeat - userGlobalSeat);

  let seatsToDirectRange = 0;
  if (userGlobalSeat < girlGlobalRangeStart) {
    seatsToDirectRange = girlGlobalRangeStart - userGlobalSeat;
  } else if (userGlobalSeat > girlGlobalRangeEnd) {
    seatsToDirectRange = userGlobalSeat - girlGlobalRangeEnd;
  }

  let seatsToCoreCenter = 0;
  let signedSeatOffset = 0;
  if (userGlobalSeat >= girlGlobalCoreMin && userGlobalSeat <= girlGlobalCoreMax) {
    seatsToCoreCenter = 0;
    signedSeatOffset = 0;
  } else if (userGlobalSeat < girlGlobalCoreMin) {
    // 女孩位於較大號或往 C 區方向：當觀眾坐在座位面向球場時，大號／C 區側為觀眾的「左手邊（左前方）」
    seatsToCoreCenter = girlGlobalCoreMin - userGlobalSeat;
    signedSeatOffset = -seatsToCoreCenter; // 負值代表在觀眾視角左前方（左手邊 C 區／大號側）
  } else {
    // 女孩位於較小號或往 A 區方向：當觀眾坐在座位面向球場時，小號／A 區側為觀眾的「右手邊（右前方）」
    seatsToCoreCenter = userGlobalSeat - girlGlobalCoreMax;
    signedSeatOffset = seatsToCoreCenter; // 正值代表在觀眾視角右前方（右手邊 A 區／小號側）
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
  const dirShort = deltaGlobal > 0 ? '往左前' : '往右前';
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
    headlineDistanceText = `相距 ${seatsToCoreCenter} 席（超過 8 席）`;
    detailDescription = `位於 ${girlZone} 區${slotMeta.label}，距離超過 8 席黃金區。`;
  } else {
    statusLevel = 'cross_zone';
    proximityPercent = 20;
    headlineDistanceText = `相距 ${seatsToCoreCenter} 席（超過 8 席）`;
    detailDescription = `位於 ${girlZone} 區${slotMeta.label}，距離超過 8 席黃金區。`;
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
    signedSeatOffset,
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
export function findGirlPhaseDistance(
  phaseRecord: Record<AceZoneId, string[]>,
  userZone: AceZoneId,
  userSeat: number,
  girlId: string
): PhaseDistanceDetail | null {
  for (const zone of ['A', 'B', 'C'] as AceZoneId[]) {
    const arr = phaseRecord[zone];
    const slotIdx = arr.indexOf(girlId);
    if (slotIdx !== -1) {
      return computePhaseDistance(userZone, userSeat, zone, slotIdx, arr.length);
    }
  }
  return null;
}

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
    let initSlot = 0;
    let after10Slot = 0;
    let totalSlots = 3;

    for (const z of zones) {
      const iIdx = s.initial[z].indexOf(girlId);
      const aIdx = s.after10Points[z].indexOf(girlId);
      if (iIdx !== -1 && aIdx !== -1) {
        foundZone = z;
        initSlot = iIdx;
        after10Slot = aIdx;
        totalSlots = s.initial[z].length;
        break;
      }
    }

    if (!foundZone) continue;

    comparisons.push({
      setKey: s.setKey,
      setLabel: s.setLabel,
      setShortLabel: s.setShortLabel,
      initial: computePhaseDistance(
        userZone,
        userSeat,
        foundZone,
        initSlot,
        totalSlots
      ),
      after10: computePhaseDistance(
        userZone,
        userSeat,
        foundZone,
        after10Slot,
        totalSlots
      ),
    });
  }

  return comparisons;
}

/**
 * 計算指定女孩在該場次的「跨區免換位黃金座位區間」（利用 A23↔B1 與 B23↔C1 連續看台特性，找出單一座位即可跨區覆蓋多局 12 席內好拍範圍的最佳位置區間）
 */
export function getCrossZoneGoldenIntervals(
  matchSchedule: MatchStationSchedule,
  girlId: string
): CrossZoneGoldenInterval[] {
  const recs = getGirlSeatRecommendations(matchSchedule, girlId);
  if (recs.length === 0) return [];

  const setWeightMap: Record<'set1_4' | 'set2_5' | 'set3', number> = {
    set1_4: 2.0,
    set2_5: 1.65,
    set3: 1.25,
  };

  const evaluateJunction = (
    id: 'AB' | 'BC',
    leftZone: AceZoneId,
    rightZone: AceZoneId
  ): CrossZoneGoldenInterval => {
    const leftSet = recs.find((r) => r.zone === leftZone);
    const rightSet = recs.find((r) => r.zone === rightZone);

    interface SeatEval {
      zone: AceZoneId;
      seat: number;
      score: number;
      coveredSets: string[];
      coveredPhases: number;
      coversBothZones: boolean;
    }

    const evalSeat = (zone: AceZoneId, seat: number): SeatEval => {
      const summary = getFullMatchGirlDistanceSummary(
        matchSchedule,
        zone,
        seat,
        girlId
      );
      let score = 0;
      let coveredPhases = 0;
      const coveredSetLabels: string[] = [];
      let coversLeft = false;
      let coversRight = false;

      for (const item of summary) {
        const w = setWeightMap[item.setKey];
        const initNear = item.initial.isWithin12Seats;
        const afterNear = item.after10.isWithin12Seats;

        if (initNear) {
          coveredPhases += 1;
          score +=
            w * 0.4 * Math.max(25, 100 - item.initial.seatsToCoreCenter * 5);
        }
        if (afterNear) {
          coveredPhases += 1;
          score +=
            w * 0.6 * Math.max(30, 100 - item.after10.seatsToCoreCenter * 5);
        }
        if (initNear || afterNear) {
          coveredSetLabels.push(item.setShortLabel);
          if (item.initial.girlZone === leftZone) coversLeft = true;
          if (item.initial.girlZone === rightZone) coversRight = true;
        }
      }

      const coversBothZones = coversLeft && coversRight;
      if (coversBothZones) {
        score += 65;
      }

      return {
        zone,
        seat,
        score,
        coveredSets: coveredSetLabels,
        coveredPhases,
        coversBothZones,
      };
    };

    const leftCandidates: SeatEval[] = [];
    for (let s = 17; s <= 24; s++) {
      leftCandidates.push(evalSeat(leftZone, s));
    }

    const rightCandidates: SeatEval[] = [];
    for (let s = 1; s <= 8; s++) {
      rightCandidates.push(evalSeat(rightZone, s));
    }

    const bestLeft = [...leftCandidates].sort((a, b) => b.score - a.score)[0];
    const bestRight = [...rightCandidates].sort((a, b) => b.score - a.score)[0];
    const overallBest =
      bestLeft.score >= bestRight.score ? bestLeft : bestRight;

    const goodLeftSeats = leftCandidates
      .filter(
        (c) =>
          c.coveredPhases > 0 &&
          (c.coversBothZones || c.score >= bestLeft.score * 0.82)
      )
      .map((c) => c.seat);
    const leftRange: [number, number] =
      goodLeftSeats.length > 0
        ? [Math.min(...goodLeftSeats), Math.max(...goodLeftSeats)]
        : [20, 24];

    const goodRightSeats = rightCandidates
      .filter(
        (c) =>
          c.coveredPhases > 0 &&
          (c.coversBothZones || c.score >= bestRight.score * 0.82)
      )
      .map((c) => c.seat);
    const rightRange: [number, number] =
      goodRightSeats.length > 0
        ? [Math.min(...goodRightSeats), Math.max(...goodRightSeats)]
        : [1, 5];

    const boundaryTag =
      id === 'AB'
        ? '觀眾視角：左 B1 ◀ ↔ ▶ 右 A24'
        : '觀眾視角：左 C1 ◀ ↔ ▶ 右 B24';
    const junctionTitle =
      id === 'AB'
        ? 'B 區小號 ↔ A 區大號（8 席跨區黃金區）'
        : 'C 區小號 ↔ B 區大號（8 席跨區黃金區）';

    // 依觀眾面向球場的左右手順序排列：左手邊為 rightZone (1–5 號)，右手邊為 leftZone (19–23 號)
    const combinedRangeLabel = `◀ 左側 ${rightZone} 區 ${rightRange[0]}–${rightRange[1]} 號 ↔ 右側 ${leftZone} 區 ${leftRange[0]}–${leftRange[1]} 號 ▶`;
    const bestSingleSeatLabel = `${overallBest.zone} 區 ${overallBest.seat} 號`;

    const coveredSetsLabel =
      overallBest.coveredSets.length > 0
        ? overallBest.coveredSets.join(' ＋ ')
        : `${rightSet?.setShortLabel ?? ''} ＋ ${leftSet?.setShortLabel ?? ''}`;

    const summaryReason = `左手邊「${rightZone} 區小號（${rightRange[0]}–${rightRange[1]}）」與右手邊「${leftZone} 區大號（${leftRange[0]}–${leftRange[1]}）」相接，在 8 席黃金區內可兼顧 ${rightZone} 區（${rightSet?.setShortLabel ?? ''}）與 ${leftZone} 區（${leftSet?.setShortLabel ?? ''}）換位！`;

    return {
      id,
      junctionTitle,
      boundaryTag,
      leftZone,
      leftSeatRange: leftRange,
      leftBestSeat: bestLeft.seat,
      rightZone,
      rightSeatRange: rightRange,
      rightBestSeat: bestRight.seat,
      combinedRangeLabel,
      bestSingleSeatLabel,
      bestSingleZone: overallBest.zone,
      bestSingleSeat: overallBest.seat,
      coveredSetsLabel,
      coveredPhasesCount: overallBest.coveredPhases,
      summaryReason,
      score: Math.round(overallBest.score),
    };
  };

  const ab = evaluateJunction('AB', 'A', 'B');
  const bc = evaluateJunction('BC', 'B', 'C');

  return [ab, bc].sort((a, b) => b.score - a.score);
}

export interface ThemeWeekGroup {
  weekId: string;
  weekShortLabel: string;
  themeTitle: string;
  dateRangeLabel: string;
  isCurrentWeek?: boolean;
  isExpired?: boolean;
  matches: HomeMatchSchedule[];
}

export type WeekMemberAttendanceType = 'both' | 'day1_only' | 'day2_only';

export interface MergedThemeWeekRoster {
  week: ThemeWeekGroup;
  day1Match: HomeMatchSchedule;
  day2Match?: HomeMatchSchedule;
  isSingleRemainingDay: boolean;
  day1ShortDate: string;
  day2ShortDate: string;
  allMemberIds: string[];
  bothDaysMemberIds: string[];
  day1OnlyMemberIds: string[];
  day2OnlyMemberIds: string[];
  hasDayDifference: boolean;
  memberStatusMap: Record<string, WeekMemberAttendanceType>;
}

/**
 * 依主題週聚合主場賽事，支援過濾已過期主題日與同一週班表合併比對
 */
export const THEME_WEEKS: ThemeWeekGroup[] = [
  {
    weekId: 'week-2026-10-31',
    weekShortLabel: '10/31–11/01 開幕週',
    themeTitle: 'HOME GAME OPENING SHOW 開幕主題週',
    dateRangeLabel: '10/31 (六) – 11/01 (日)',
    isExpired: true,
    matches: HOME_SCHEDULE.filter(
      (m) => m.id === '2026-10-31' || m.id === '2026-11-01'
    ),
  },
  {
    weekId: 'week-2026-11-07',
    weekShortLabel: '11/07–11/08 本週主題日',
    themeTitle: 'Old! MY CAR 我的 90 年代',
    dateRangeLabel: '11/07 (六) – 11/08 (日)',
    isCurrentWeek: true,
    matches: HOME_SCHEDULE.filter(
      (m) => m.id === '2026-11-07' || m.id === '2026-11-08'
    ),
  },
  {
    weekId: 'week-2026-11-21',
    weekShortLabel: '11/21–11/22 致青春週',
    themeTitle: '致青春 創造 WIN',
    dateRangeLabel: '11/21 (六) – 11/22 (日)',
    matches: HOME_SCHEDULE.filter(
      (m) => m.id === '2026-11-21' || m.id === '2026-11-22'
    ),
  },
  {
    weekId: 'week-2026-12-12',
    weekShortLabel: '12/12–12/13 聖誕週',
    themeTitle: 'HOME FOR CHRISTMAS 聖誕主題週',
    dateRangeLabel: '12/12 (六) – 12/13 (日)',
    matches: HOME_SCHEDULE.filter(
      (m) => m.id === '2026-12-12' || m.id === '2026-12-13'
    ),
  },
];

/**
 * 取得有效基準日期（YYYY-MM-DD），用於自動隱藏已過期之場次與主題日
 */
export function getEffectiveTodayIso(referenceDate?: Date): string {
  const now = referenceDate ?? new Date();
  const localIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  return localIso > '2026-11-07' && localIso <= '2026-12-13'
    ? localIso
    : '2026-11-07';
}

/**
 * 取得未過期之 2F 集氣區站位輪換班表（自動隱藏已過期單日場次，例如 11/08 時自動隱藏 11/07 週六場，並以最接近場次為主）
 */
export function getActiveStationRotationSchedules(
  referenceDate?: Date
): MatchStationSchedule[] {
  const effectiveToday = getEffectiveTodayIso(referenceDate);
  const active = STATION_ROTATION_SCHEDULES.filter(
    (s) => s.matchId >= effectiveToday
  );
  return active.length > 0
    ? active
    : [STATION_ROTATION_SCHEDULES[STATION_ROTATION_SCHEDULES.length - 1]];
}

export const ACTIVE_STATION_ROTATION_SCHEDULES: MatchStationSchedule[] =
  getActiveStationRotationSchedules();

export const CLOSEST_STATION_SCHEDULE: MatchStationSchedule =
  ACTIVE_STATION_ROTATION_SCHEDULES[0];

/**
 * 取得未過期之主題週與場次（若同週第一日已過期，自動過濾掉已過期之單日，並將最接近之班表排在第一順位）
 */
export function getActiveThemeWeeks(referenceDate?: Date): ThemeWeekGroup[] {
  const effectiveToday = getEffectiveTodayIso(referenceDate);

  const active: ThemeWeekGroup[] = [];
  for (const week of THEME_WEEKS) {
    if (week.isExpired) continue;
    const nonExpiredMatches = week.matches.filter(
      (m) => m.id >= effectiveToday
    );
    if (nonExpiredMatches.length === 0) continue;

    // 若同週首日（週六）已過期、僅剩週日未過期，動態更新標籤為最接近之單日資訊
    if (nonExpiredMatches.length === 1 && week.matches.length > 1) {
      const onlyMatch = nonExpiredMatches[0];
      const shortDate = onlyMatch.date.slice(5).replace('.', '/');
      const dayChar = onlyMatch.dayOfWeek.includes('日') ? '日' : '六';
      active.push({
        ...week,
        isCurrentWeek: active.length === 0,
        weekShortLabel: `${shortDate} (${dayChar}) 本週主題日`,
        dateRangeLabel: `${shortDate} (${dayChar}) ${onlyMatch.time}`,
        matches: nonExpiredMatches,
      });
    } else {
      active.push({
        ...week,
        isCurrentWeek: active.length === 0,
        matches: nonExpiredMatches,
      });
    }
  }

  return active.length > 0 ? active : THEME_WEEKS.filter((w) => !w.isExpired);
}

export const ACTIVE_THEME_WEEKS: ThemeWeekGroup[] = getActiveThemeWeeks();

export const ACTIVE_HOME_SCHEDULE: HomeMatchSchedule[] =
  ACTIVE_THEME_WEEKS.flatMap((week) => week.matches);

/**
 * 合併同一主題週之兩日班表，自動比對「兩日全勤」與「單日限定（週六限定 / 週日限定）」成員名單
 */
export function getMergedThemeWeekRoster(
  week: ThemeWeekGroup
): MergedThemeWeekRoster {
  const day1Match = week.matches[0];
  const day2Match = week.matches[1];
  const isSingleRemainingDay = !day2Match;

  const day1Ids = day1Match ? day1Match.attendingMemberIds : [];
  const day2Ids = day2Match ? day2Match.attendingMemberIds : day1Ids;

  const bothDaysMemberIds = day1Ids.filter((id) => day2Ids.includes(id));
  const day1OnlyMemberIds = day1Ids.filter((id) => !day2Ids.includes(id));
  const day2OnlyMemberIds = day2Ids.filter((id) => !day1Ids.includes(id));

  // 將單日異動成員與全勤成員整合，並建立狀態對照表
  const allMemberIds = [
    ...bothDaysMemberIds,
    ...day1OnlyMemberIds,
    ...day2OnlyMemberIds,
  ];

  const memberStatusMap: Record<string, WeekMemberAttendanceType> = {};
  for (const id of bothDaysMemberIds) {
    memberStatusMap[id] = 'both';
  }
  for (const id of day1OnlyMemberIds) {
    memberStatusMap[id] = 'day1_only';
  }
  for (const id of day2OnlyMemberIds) {
    memberStatusMap[id] = 'day2_only';
  }

  const day1ShortDate = day1Match
    ? day1Match.date.slice(5).replace('.', '/')
    : '';
  const day2ShortDate = day2Match
    ? day2Match.date.slice(5).replace('.', '/')
    : '';

  return {
    week,
    day1Match,
    day2Match,
    isSingleRemainingDay,
    day1ShortDate,
    day2ShortDate,
    allMemberIds,
    bothDaysMemberIds,
    day1OnlyMemberIds,
    day2OnlyMemberIds,
    hasDayDifference:
      day1OnlyMemberIds.length > 0 || day2OnlyMemberIds.length > 0,
    memberStatusMap,
  };
}

export interface MultiFavoriteSeatMemberHit {
  memberId: string;
  nearPhases: number;
  directZeroPhases: number;
  coveredSetLabels: string[];
}

export interface MultiFavoriteSeatRank {
  rank: 1 | 2 | 3;
  zone: AceZoneId;
  seat: number;
  seatRange: [number, number];
  score: number;
  totalNearPhases: number;
  maxPossiblePhases: number;
  uniqueFavsCovered: number;
  totalFavsOnDuty: number;
  memberHits: MultiFavoriteSeatMemberHit[];
}

/**
 * 針對已收藏的多位主推（當日至少 2 位輪替），掃描 2F A/B/C 區全 69 席，
 * 綜合計算 8 席黃金區命中階段數、涵蓋主推人數與 0 席正前方加權，回傳去重後之 Top 3 最佳座位。
 */
export function getMultiFavoriteTopSeats(
  matchSchedule: MatchStationSchedule,
  favoriteIds: string[],
  topN = 3
): MultiFavoriteSeatRank[] {
  const s1 = matchSchedule.sets[0]?.initial;
  if (!s1) return [];

  const rotatingSet = new Set<string>([...s1.A, ...s1.B, ...s1.C]);
  const onDutyFavs = Array.from(
    new Set(favoriteIds.filter((id) => rotatingSet.has(id)))
  );
  if (onDutyFavs.length < 2) return [];

  const setWeightMap: Record<'set1_4' | 'set2_5' | 'set3', number> = {
    set1_4: 2.0,
    set2_5: 1.65,
    set3: 1.25,
  };

  interface RawSeatEval {
    zone: AceZoneId;
    seat: number;
    globalSeat: number;
    score: number;
    totalNearPhases: number;
    uniqueFavsCovered: number;
    memberHits: MultiFavoriteSeatMemberHit[];
  }

  const allEvals: RawSeatEval[] = [];
  const zones: AceZoneId[] = ['A', 'B', 'C'];

  for (const zone of zones) {
    const zIdx = ZONE_INDEX[zone];
    for (let seat = 1; seat <= 24; seat++) {
      let score = 0;
      let totalNearPhases = 0;
      let uniqueFavsCovered = 0;
      const memberHits: MultiFavoriteSeatMemberHit[] = [];

      for (const favId of onDutyFavs) {
        const summary = getFullMatchGirlDistanceSummary(
          matchSchedule,
          zone,
          seat,
          favId
        );
        let nearPhases = 0;
        let directZeroPhases = 0;
        const coveredSetLabels: string[] = [];

        for (const item of summary) {
          const w = setWeightMap[item.setKey];
          const initNear = item.initial.isWithin12Seats;
          const afterNear = item.after10.isWithin12Seats;

          if (initNear) {
            nearPhases += 1;
            const distPts = Math.max(30, 100 - item.initial.seatsToCoreCenter * 7);
            const zeroBonus = item.initial.seatsToCoreCenter === 0 ? 18 : 0;
            if (zeroBonus > 0) directZeroPhases += 1;
            score += w * 0.4 * (distPts + zeroBonus);
          }

          if (afterNear) {
            nearPhases += 1;
            const distPts = Math.max(30, 100 - item.after10.seatsToCoreCenter * 7);
            const zeroBonus = item.after10.seatsToCoreCenter === 0 ? 18 : 0;
            if (zeroBonus > 0) directZeroPhases += 1;
            score += w * 0.6 * (distPts + zeroBonus);
          }

          if (initNear || afterNear) {
            const shortSet =
              item.setKey === 'set1_4'
                ? '1·4局'
                : item.setKey === 'set2_5'
                  ? '2·5局'
                  : '3局';
            coveredSetLabels.push(shortSet);
          }
        }

        if (nearPhases > 0) {
          uniqueFavsCovered += 1;
          totalNearPhases += nearPhases;
        }
        memberHits.push({
          memberId: favId,
          nearPhases,
          directZeroPhases,
          coveredSetLabels,
        });
      }

      // Bonus for covering more distinct favorites at the same seat
      score += uniqueFavsCovered * 42;

      allEvals.push({
        zone,
        seat,
        globalSeat: zIdx * 24 + seat,
        score,
        totalNearPhases,
        uniqueFavsCovered,
        memberHits: memberHits.sort((a, b) => b.nearPhases - a.nearPhases),
      });
    }
  }

  const sorted = [...allEvals].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.uniqueFavsCovered !== a.uniqueFavsCovered) {
      return b.uniqueFavsCovered - a.uniqueFavsCovered;
    }
    return b.totalNearPhases - a.totalNearPhases;
  });

  const picked: RawSeatEval[] = [];
  for (const cand of sorted) {
    if (picked.length >= topN) break;
    if (cand.totalNearPhases === 0) break;
    const tooClose = picked.some(
      (p) => Math.abs(p.globalSeat - cand.globalSeat) < 5
    );
    if (tooClose) continue;
    picked.push(cand);
  }

  return picked.map((p, idx) => {
    // Find contiguous sweet-spot seats in the same zone within ±2 seats that achieve >= 90% of peak score
    const nearbyGood = allEvals
      .filter(
        (e) =>
          e.zone === p.zone &&
          Math.abs(e.seat - p.seat) <= 2 &&
          e.score >= p.score * 0.9
      )
      .map((e) => e.seat);
    const seatRange: [number, number] =
      nearbyGood.length > 0
        ? [Math.min(...nearbyGood), Math.max(...nearbyGood)]
        : [p.seat, p.seat];

    return {
      rank: (idx + 1) as 1 | 2 | 3,
      zone: p.zone,
      seat: p.seat,
      seatRange,
      score: Math.round(p.score),
      totalNearPhases: p.totalNearPhases,
      maxPossiblePhases: onDutyFavs.length * 6,
      uniqueFavsCovered: p.uniqueFavsCovered,
      totalFavsOnDuty: onDutyFavs.length,
      memberHits: p.memberHits,
    };
  });
}




