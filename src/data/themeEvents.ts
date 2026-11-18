export interface ThemeTimelineStep {
  time: string;
  project: string;
  projectKo: string;
  highlight?: 'pregame' | 'stage' | 'postgame';
}

export interface ThemeSigningSession {
  title: string;
  titleKo: string;
  gatherTime: string;
  startTime: string;
  endTime: string;
  memberIds: string[];
  qualification: string;
  qualificationKo: string;
  rules: string[];
  rulesKo: string[];
}

export interface ThemePostGameEvent {
  title: string;
  titleKo: string;
  eligibility: string;
  eligibilityKo: string;
  notes: string[];
  notesKo: string[];
}

export interface ThemeDayEvent {
  matchId: string;
  dateLabel: string;
  dayShort: string;
  opponent: string;
  timeline: ThemeTimelineStep[];
  signingSession: ThemeSigningSession;
  postGameEvents: ThemePostGameEvent[];
}

export interface ThemeGiftItem {
  name: string;
  nameKo: string;
  detail: string;
  detailKo: string;
}

export interface ThemeWeekEventGuide {
  weekId: string;
  endDateIso: string;
  badge: string;
  title: string;
  titleKo: string;
  dateRange: string;
  postUrl: string;
  entryGiftsTitle: string;
  entryGiftsTitleKo: string;
  entryGifts: ThemeGiftItem[];
  days: ThemeDayEvent[];
}

const SHARED_DAY_TIMELINE_BASE: ThemeTimelineStep[] = [
  { time: '10:00', project: '季票球迷商品部開放', projectKo: '시즌권 팬 굿즈샵 오픈' },
  { time: '10:00', project: '現場開放售票', projectKo: '현장 티켓 판매 시작' },
  { time: '10:30', project: '商品部全面開放', projectKo: '굿즈샵 전면 오픈' },
  { time: '10:30', project: '季票優先進場', projectKo: '시즌권 우선 입장' },
  { time: '10:50', project: '全面開放進場', projectKo: '일반 관중 입장 시작' },
  {
    time: '10:50',
    project: '賽前活動集合',
    projectKo: '경기 전 이벤트 집합',
    highlight: 'pregame',
  },
  {
    time: '11:10',
    project: '青春同樂會・賽前限定簽名時光',
    projectKo: '청춘 동락회 · 경기 전 한정 사인회',
    highlight: 'pregame',
  },
  { time: '11:40', project: '場地復原', projectKo: '코트 정비' },
  {
    time: '13:00',
    project: '開場表演',
    projectKo: '오프닝 퍼포먼스',
    highlight: 'stage',
  },
  { time: '13:30', project: '比賽開始', projectKo: '경기 시작' },
  {
    time: '中場',
    project: 'ACE VIVA 中場舞',
    projectKo: 'ACE VIVA 하프타임 댄스',
    highlight: 'stage',
  },
];

export const THEME_WEEK_EVENTS: ThemeWeekEventGuide[] = [
  {
    weekId: 'week-2026-11-21',
    endDateIso: '2026-11-22',
    badge: '11/21–22 主題週活動專區',
    title: '致青春・創造 WIN',
    titleKo: '청춘을 향하여 · WIN 창조',
    dateRange: '11/21 (六) – 11/22 (日)',
    postUrl: 'https://www.instagram.com/p/Df1tTcNn0mn/',
    entryGiftsTitle: '本週進場禮（1F 猛虎區限定）',
    entryGiftsTitleKo: '이번 주 입장 특전 (1F 맹호 구역 한정)',
    entryGifts: [
      {
        name: '春山相館 $200 品牌折價券',
        nameKo: '춘산사진관 $200 할인권',
        detail: '限使用 MAG 商智照、韓風證件寫真、生日寫真，不得分開折抵或換現金',
        detailKo: 'MAG 프로필·한국식 증명사진·생일 화보 전용 (분할 사용 및 현금 교환 불가)',
      },
      {
        name: 'Regatta 瑞卡達 R 動氣動飲（330mL）',
        nameKo: 'Regatta R 스포츠 드링크 (330mL)',
        detail: '運動飲料，即刻補水 × 電解補給',
        detailKo: '수분 및 전해질 보충 스포츠 음료',
      },
    ],
    days: [
      {
        matchId: '2026-11-21',
        dateLabel: '11/21 (六) 13:30',
        dayShort: '11/21 (六)',
        opponent: '台鋼天鷹',
        timeline: [
          ...SHARED_DAY_TIMELINE_BASE,
          {
            time: '賽後',
            project: '青春加映・ACE VIVA 限定舞台（ACE 季票專屬）',
            projectKo: '청춘 앵콜 · ACE VIVA 스페셜 스테이지 (ACE 시즌권 전용)',
            highlight: 'postgame',
          },
        ],
        signingSession: {
          title: '青春同樂會・賽前限定簽名時光',
          titleKo: '청춘 동락회 · 경기 전 한정 사인회',
          gatherTime: '10:50',
          startTime: '11:10',
          endTime: '11:40',
          memberIds: ['xuanxuan', 'yixuan', 'sinping'],
          qualification: '於商品部單筆消費滿 1,500 元即可獲得當日參加資格（限額 30 名，不得與其他活動合併計算）',
          qualificationKo: '굿즈샵 단일 결제 1,500 NTD 이상 시 당일 참가 자격 부여 (선착순 30명, 타 이벤트 합산 불가)',
          rules: [
            '邀請 3 位 ACE VIVA 女孩出席（璇璇、一暄、心平）',
            '每位參加者可請每位女孩簽名至多 2 樣商品（小卡恕無法簽名）',
            '限簽出席女孩之連莊周邊商品或連莊相關周邊商品',
          ],
          rulesKo: [
            '출석 멤버 3명: 쉬안쉬안, 이쉬안, 신핑',
            '멤버별 최대 2개 굿즈 사인 가능 (포토카드는 사인 불가)',
            '출석 멤버 또는 구단 관련 공식 굿즈에만 사인 가능',
          ],
        },
        postGameEvents: [
          {
            title: '青春加映・ACE VIVA 限定舞台',
            titleKo: '청춘 앵콜 · ACE VIVA 스페셜 스테이지',
            eligibility: 'ACE 集氣區季票球迷限定（限本人參加）',
            eligibilityKo: 'ACE 응원 구역 시즌권 보유자 본인 한정',
            notes: [
              '活動當日請備妥「ACE 集氣區季票證」及「個人身分證件」供現場工作人員核對身分',
              '11/21 比賽結束後將進行場地清場，請依指示於一樓驗票處排隊',
              '詳細節目表已寄送至 ACE 集氣區季票球迷電子信箱',
            ],
            notesKo: [
              '당일 ACE 응원 구역 시즌권 및 본인 신분증 지참 필수',
              '11/21 경기 종료 후 장내 정리 후 1층 검표소 앞 대기',
              '세부 프로그램은 시즌권 팬 이메일로 개별 발송',
            ],
          },
        ],
      },
      {
        matchId: '2026-11-22',
        dateLabel: '11/22 (日) 13:30',
        dayShort: '11/22 (日)',
        opponent: '新竹市可利工程師',
        timeline: [
          ...SHARED_DAY_TIMELINE_BASE,
          {
            time: '賽後',
            project: '青春盛典・WIN+ FASHION SHOW',
            projectKo: '청춘 성전 · WIN+ FASHION SHOW',
            highlight: 'postgame',
          },
          {
            time: '賽後',
            project: '青春盛典・WIN 5 限定簽名會',
            projectKo: '청춘 성전 · WIN 5 한정 사인회',
            highlight: 'postgame',
          },
        ],
        signingSession: {
          title: '青春同樂會・賽前限定簽名時光',
          titleKo: '청춘 동락회 · 경기 전 한정 사인회',
          gatherTime: '10:50',
          startTime: '11:10',
          endTime: '11:40',
          memberIds: ['weiwei', 'jungheejung', 'mega'],
          qualification: '於商品部單筆消費滿 1,500 元即可獲得當日參加資格（限額 30 名，不得與其他活動合併計算）',
          qualificationKo: '굿즈샵 단일 결제 1,500 NTD 이상 시 당일 참가 자격 부여 (선착순 30명, 타 이벤트 합산 불가)',
          rules: [
            '邀請 3 位 ACE VIVA 女孩出席（味味、鄭熙靜、MEGA）',
            '每位參加者可請每位女孩簽名至多 2 樣商品（小卡恕無法簽名）',
            '限簽出席女孩之連莊周邊商品或連莊相關周邊商品',
          ],
          rulesKo: [
            '출석 멤버 3명: 웨이웨이, 정희정, 메가',
            '멤버별 최대 2개 굿즈 사인 가능 (포토카드는 사인 불가)',
            '출석 멤버 또는 구단 관련 공식 굿즈에만 사인 가능',
          ],
        },
        postGameEvents: [
          {
            title: '青春盛典・WIN+ FASHION SHOW ＆ WIN 5 限定簽名會',
            titleKo: '청춘 성전 · WIN+ FASHION SHOW & WIN 5 사인회',
            eligibility: '11/22 賽後接續登場（以現場與官方公告動線為準）',
            eligibilityKo: '11/22 경기 종료 후 순차 진행 (현장 안내 기준)',
            notes: [
              '賽後舉行青春盛典 WIN+ FASHION SHOW 與 WIN 5 限定簽名會',
              '實際集合動線與參加規範請依官方 IG 與現場工作人員指示為準',
            ],
            notesKo: [
              '경기 종료 후 WIN+ 패션쇼 및 WIN 5 한정 사인회 진행',
              '집합 동선 및 세부 규칙은 현장 안내를 참고해 주세요',
            ],
          },
        ],
      },
    ],
  },
];
