import React, { useEffect, useMemo, useState } from 'react';
import { MEMBERS, type AceVivaMember } from '../data/members';
import {
  STATION_ROTATION_SCHEDULES,
  getGirlSeatRecommendations,
  getCrossZoneGoldenIntervals,
  getFullMatchGirlDistanceSummary,
  getSeatPositionMapping,
  type AceZoneId,
  type GirlSetZoneRecommendation,
  type CrossZoneGoldenInterval,
  type MatchStationSchedule,
  type SetGirlDistanceComparison,
} from '../data/schedule';

export type StrategyCardMode = 'seat_radar' | 'zone_hopping';

interface OshiStrategyCardModalProps {
  isOpen: boolean;
  initialGirlId: string;
  initialMatchId: string;
  initialMode?: StrategyCardMode;
  initialZone?: AceZoneId;
  initialSeat?: number;
  onClose: () => void;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/**
 * 自動縮放字級並限制最大寬度的 Canvas 文字繪製輔助函式，確保絕不超出容器邊界破版
 */
function fillTextFit(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontWeight: number | string,
  initialFontSize: number,
  fontFamily: string,
  minFontSize = 12
) {
  let size = initialFontSize;
  ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
  while (ctx.measureText(text).width > maxWidth && size > minFontSize) {
    size -= 1;
    ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
  }
  ctx.fillText(text, x, y, maxWidth);
}

/**
 * 針對「模式 2：最佳換位區間（含跨區說明）」產生明確的跨區互看指引（如：A 區大號可看 B 區小號）
 */
function getExplicitCrossZoneGuide(rec: GirlSetZoneRecommendation): {
  headerText: string;
  mainRangeText: string;
  crossRuleText: string;
  rulerEdgeHint: string | null;
} {
  const mainRangeText = `${rec.zone} 區 ${rec.sweetSpotRange[0]}–${rec.sweetSpotRange[1]} 號`;
  const touchesSmall = rec.initialSlotIndex === 0 || rec.after10SlotIndex === 0; // 1–8 號
  const touchesLarge = rec.initialSlotIndex === 2 || rec.after10SlotIndex === 2; // 16–23 號

  if (rec.zone === 'A' && touchesLarge) {
    return {
      headerText: '最佳換位區間 ＆ 跨區互看說明',
      mainRangeText,
      crossRuleText: '跨區：坐 B 區小號 (1–7號) 可看 A 區大號 (16–23號)',
      rulerEdgeHint: '◀ 左端 A23 緊鄰 B1（坐 B 區小號 1–7 號可跨區拍 A 區大號）',
    };
  }
  if (rec.zone === 'B' && touchesSmall && !touchesLarge) {
    return {
      headerText: '最佳換位區間 ＆ 跨區互看說明',
      mainRangeText,
      crossRuleText: '跨區：坐 A 區大號 (17–23號) 可看 B 區小號 (1–8號)',
      rulerEdgeHint: '右端 B1 緊鄰 A23（坐 A 區大號 17–23 號可跨區拍 B 區小號） ▶',
    };
  }
  if (rec.zone === 'B' && touchesLarge && !touchesSmall) {
    return {
      headerText: '最佳換位區間 ＆ 跨區互看說明',
      mainRangeText,
      crossRuleText: '跨區：坐 C 區小號 (1–7號) 可看 B 區大號 (16–23號)',
      rulerEdgeHint: '◀ 左端 B23 緊鄰 C1（坐 C 區小號 1–7 號可跨區拍 B 區大號）',
    };
  }
  if (rec.zone === 'B' && touchesSmall && touchesLarge) {
    return {
      headerText: '最佳換位區間 ＆ 跨區互看說明',
      mainRangeText,
      crossRuleText: '跨區：A 區大號(17–23)看 B 小號 / C 區小號(1–7)看 B 大號',
      rulerEdgeHint: '◀ 左 B23 接 C1（C 小號看 B 大號）｜右 B1 接 A23（A 大號看 B 小號）▶',
    };
  }
  if (rec.zone === 'C' && touchesSmall) {
    return {
      headerText: '最佳換位區間 ＆ 跨區互看說明',
      mainRangeText,
      crossRuleText: '跨區：坐 B 區大號 (17–23號) 可看 C 區小號 (1–8號)',
      rulerEdgeHint: '右端 C1 緊鄰 B23（坐 B 區大號 17–23 號可跨區拍 C 區小號） ▶',
    };
  }

  return {
    headerText: '整局免換位黃金區間',
    mainRangeText,
    crossRuleText: `交界核心席：${rec.after10CoreSeats}（兼顧開局與破 10 分）`,
    rulerEdgeHint: null,
  };
}

/**
 * 繪製共用頂部背景、外框與原創幾何背號雷達徽章（完全不載入官方 IG 照片，避免社群分享圖版權疑慮）
 */
async function drawCardShellAndAvatar(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  badgeTitle: string,
  schedule: MatchStationSchedule,
  member: AceVivaMember,
  fontSans: string,
  fontMono: string
) {
  // 1. Background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#191838');
  bgGrad.addColorStop(0.32, '#212047');
  bgGrad.addColorStop(1, '#15142E');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Decorative mint glow
  const glowGrad = ctx.createRadialGradient(
    W * 0.82,
    180,
    20,
    W * 0.82,
    180,
    420
  );
  glowGrad.addColorStop(0, 'rgba(94, 203, 192, 0.25)');
  glowGrad.addColorStop(1, 'rgba(94, 203, 192, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, W, 600);

  // Outer Frame Border
  drawRoundedRect(ctx, 28, 28, W - 56, H - 56, 36);
  ctx.strokeStyle = 'rgba(94, 203, 192, 0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 2. Top Badge & Match Info
  drawRoundedRect(ctx, 64, 58, 490, 44, 22);
  ctx.fillStyle = '#5BAE84';
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  fillTextFit(ctx, badgeTitle, 64 + 245, 80, 456, 800, 19, fontMono);
  ctx.textAlign = 'left';

  // Match Date Pill on Right
  const matchBadgeText = `${schedule.dateLabel} vs ${schedule.opponent}`;
  ctx.font = `800 21px ${fontMono}`;
  const mTextW = Math.min(ctx.measureText(matchBadgeText).width, 410);
  drawRoundedRect(ctx, W - 64 - mTextW - 44, 58, mTextW + 44, 44, 22);
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(122, 218, 208, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#7ADAD0';
  fillTextFit(
    ctx,
    matchBadgeText,
    W - 64 - mTextW - 22,
    80,
    mTextW,
    800,
    21,
    fontMono
  );

  // 3. Hero Profile Banner Box
  const heroY = 122;
  const heroH = 252;
  drawRoundedRect(ctx, 64, heroY, W - 128, heroH, 32);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(94, 203, 192, 0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw Original Geometric Jersey & Radar Crest Emblem (Copyright-Safe, No Official IG Photo)
  const avatarX = 96;
  const avatarY = heroY + 42;
  const avatarSize = 168;
  const cx = avatarX + avatarSize / 2;
  const cy = avatarY + avatarSize / 2;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, avatarSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  const crestGrad = ctx.createLinearGradient(
    avatarX,
    avatarY,
    avatarX + avatarSize,
    avatarY + avatarSize
  );
  crestGrad.addColorStop(0, '#14132D');
  crestGrad.addColorStop(0.55, '#212047');
  crestGrad.addColorStop(1, '#265347');
  ctx.fillStyle = crestGrad;
  ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);

  // Subtle Radar Fan Sector inside Emblem
  ctx.beginPath();
  ctx.moveTo(cx, avatarY + avatarSize - 18);
  ctx.lineTo(avatarX + 22, avatarY + 34);
  ctx.lineTo(avatarX + avatarSize - 22, avatarY + 34);
  ctx.closePath();
  ctx.fillStyle = 'rgba(94, 203, 192, 0.16)';
  ctx.fill();

  // Inner Dashed Ring
  ctx.beginPath();
  ctx.arc(cx, cy, avatarSize / 2 - 14, 0, Math.PI * 2);
  ctx.setLineDash([6, 5]);
  ctx.strokeStyle = 'rgba(122, 218, 208, 0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.setLineDash([]);

  // Top Label inside Crest
  ctx.textAlign = 'center';
  ctx.fillStyle = '#7ADAD0';
  fillTextFit(ctx, 'JERSEY NO.', cx, avatarY + 42, 110, 800, 14, fontMono);

  // Large Stylized Jersey Number
  ctx.fillStyle = '#FFFFFF';
  fillTextFit(
    ctx,
    `#${member.number}`,
    cx,
    cy + 6,
    132,
    900,
    52,
    fontMono
  );

  // Bottom Member Name Pill inside Crest
  drawRoundedRect(ctx, cx - 54, avatarY + avatarSize - 46, 108, 26, 13);
  ctx.fillStyle = '#5BAE84';
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  fillTextFit(
    ctx,
    member.name,
    cx,
    avatarY + avatarSize - 33,
    94,
    800,
    15,
    fontSans
  );
  ctx.textAlign = 'left';
  ctx.restore();

  // Outer Emblem Ring
  ctx.beginPath();
  ctx.arc(cx, cy, avatarSize / 2 + 3, 0, Math.PI * 2);
  ctx.strokeStyle = '#5ECBC0';
  ctx.lineWidth = 5;
  ctx.stroke();
}

/**
 * 模式 1：已經選擇座位 -> 生成「固定座位專屬視角雷達圖版」PNG
 */
async function renderSeatRadarCardToDataUrl(
  member: AceVivaMember,
  schedule: MatchStationSchedule,
  userZone: AceZoneId,
  userSeat: number,
  memberMap: Map<string, AceVivaMember>
): Promise<string> {
  const W = 1080;
  const H = 1610;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const fontSans =
    '"Plus Jakarta Sans", "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif';
  const fontMono = '"JetBrains Mono", "Noto Sans TC", monospace';

  await drawCardShellAndAvatar(
    ctx,
    W,
    H,
    '1. 已選座位 · 專屬座位雷達圖攻略卡',
    schedule,
    member,
    fontSans,
    fontMono
  );

  const distanceComparisons: SetGirlDistanceComparison[] =
    getFullMatchGirlDistanceSummary(schedule, userZone, userSeat, member.id);
  const seatMapping = getSeatPositionMapping(userSeat);

  // Count how many of the 6 phases are within 12 seats
  let nearPhasesCount = 0;
  for (const c of distanceComparisons) {
    if (c.initial.isWithin12Seats) nearPhasesCount += 1;
    if (c.after10.isWithin12Seats) nearPhasesCount += 1;
  }

  const heroY = 122;
  const infoX = 292;
  const pillW = W - 64 - 28 - infoX;

  ctx.fillStyle = '#7ADAD0';
  fillTextFit(
    ctx,
    `LOCKED SEAT RADAR · 你的座位：2F 集氣 ${userZone} 區 ${userSeat} 號席  →  主推 #${member.number} ${member.name}`,
    infoX,
    heroY + 38,
    pillW,
    800,
    20,
    fontMono
  );

  ctx.fillStyle = '#FFFFFF';
  fillTextFit(
    ctx,
    `${ userZone } 區 ${ userSeat } 號 視角雷達（主推：${ member.name }）`,
    infoX,
    heroY + 90,
    pillW,
    900,
    42,
    fontSans
  );

  // Pill 1: Audience Perspective & Near Phase Summary
  const pill1Y = heroY + 134;
  drawRoundedRect(ctx, infoX, pill1Y, pillW, 44, 14);
  ctx.fillStyle = 'rgba(91, 174, 132, 0.28)';
  ctx.fill();
  ctx.strokeStyle = '#5ECBC0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#5ECBC0';
  fillTextFit(
    ctx,
    `★ 你的座位 ${userZone}${userSeat} 全場共涵蓋 ${nearPhasesCount}/6 個階段於 12 席最佳正面拍攝射程內`,
    infoX + 18,
    pill1Y + 22,
    pillW - 36,
    800,
    19,
    fontSans
  );

  // Pill 2: Cross-Zone Connection Explanation
  const pill2Y = heroY + 188;
  drawRoundedRect(ctx, infoX, pill2Y, pillW, 44, 14);
  ctx.fillStyle = 'rgba(25, 24, 56, 0.9)';
  ctx.fill();
  ctx.strokeStyle = '#7ADAD0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  fillTextFit(
    ctx,
    '↔ 跨區相連規則：B 區小號(1–8)緊鄰 A 區大號(16–23) · C 區小號(1–8)緊鄰 B 區大號(16–23)',
    infoX + 18,
    pill2Y + 22,
    pillW - 36,
    800,
    18,
    fontSans
  );

  // 4. Audience Perspective Orientation Bar
  const mapY = 392;
  drawRoundedRect(ctx, 64, mapY, W - 128, 124, 24);
  ctx.fillStyle = '#14132D';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#7ADAD0';
  fillTextFit(
    ctx,
    `▲ 觀眾面向球場第一人稱視角（你坐在 ${userZone} 區 ${userSeat} 號往前方球場看 ▲ · 左手邊 C 區 23 號 ◀ ↔ ▶ 右手邊 A 區 1 號）`,
    90,
    mapY + 28,
    W - 180,
    800,
    19,
    fontSans
  );

  const audienceZones: { id: AceZoneId; label: string }[] = [
    { id: 'C', label: '◀ 左手邊：2F C 區 (23→1號)' },
    { id: 'B', label: '正中央：2F B 區 (23→1號)' },
    { id: 'A', label: '右手邊：2F A 區 (23→1號) ▶' },
  ];
  const zoneBoxW = (W - 128 - 52 - 24) / 3;
  audienceZones.forEach((zItem, idx) => {
    const zx = 90 + idx * (zoneBoxW + 12);
    const zy = mapY + 50;
    const isMyZone = zItem.id === userZone;

    drawRoundedRect(ctx, zx, zy, zoneBoxW, 54, 14);
    ctx.fillStyle = isMyZone
      ? 'rgba(91, 174, 132, 0.38)'
      : 'rgba(255, 255, 255, 0.07)';
    ctx.fill();
    ctx.strokeStyle = isMyZone ? '#5ECBC0' : 'rgba(255,255,255,0.2)';
    ctx.lineWidth = isMyZone ? 2.5 : 1.5;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    fillTextFit(
      ctx,
      zItem.label,
      zx + 14,
      zy + 27,
      zoneBoxW - 110,
      800,
      18,
      fontSans
    );

    if (isMyZone) {
      ctx.fillStyle = '#5ECBC0';
      ctx.textAlign = 'right';
      fillTextFit(
        ctx,
        `★ 你在 ${userZone}${userSeat}`,
        zx + zoneBoxW - 12,
        zy + 27,
        96,
        900,
        17,
        fontMono
      );
      ctx.textAlign = 'left';
    }
  });

  // 5. Three Set Cards with Visual First-Person Seat Radar on the Right of Each Card
  let currentY = 536;
  const cardH = 304;

  const userGlobal =
    (userZone === 'A' ? 0 : userZone === 'B' ? 1 : 2) * 23 + userSeat;
  const toRadarNorm = (gSeat: number) =>
    Math.max(0.08, Math.min(0.92, 0.06 + ((69 - gSeat) / 68) * 0.88));

  distanceComparisons.forEach((comp, index) => {
    const setObj = schedule.sets[index];
    const initFrontGirlId = setObj.initial[userZone][seatMapping.slotIndex];
    const after10FrontGirlId =
      setObj.after10Points[userZone][seatMapping.slotIndex];
    const initFrontGirl = memberMap.get(initFrontGirlId);
    const after10FrontGirl = memberMap.get(after10FrontGirlId);

    const isAnyNear =
      comp.initial.isWithin12Seats || comp.after10.isWithin12Seats;

    drawRoundedRect(ctx, 64, currentY, W - 128, cardH, 28);
    ctx.fillStyle = isAnyNear ? '#F4FAF8' : '#F3F5F8';
    ctx.fill();
    ctx.strokeStyle = isAnyNear ? '#5BAE84' : 'rgba(33,32,71,0.2)';
    ctx.lineWidth = isAnyNear ? 4 : 2;
    ctx.stroke();

    // Header Row inside Set Card
    const setBadgeX = 90;
    const setBadgeW = 230;
    drawRoundedRect(ctx, setBadgeX, currentY + 20, setBadgeW, 44, 22);
    ctx.fillStyle = '#212047';
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    fillTextFit(
      ctx,
      comp.setLabel,
      setBadgeX + setBadgeW / 2,
      currentY + 42,
      setBadgeW - 24,
      900,
      21,
      fontSans
    );
    ctx.textAlign = 'left';

    ctx.fillStyle = '#3F8E67';
    fillTextFit(
      ctx,
      `★ 主推 ${member.name} 本局位於：2F 集氣 ${comp.initial.girlZone} 區`,
      336,
      currentY + 42,
      380,
      800,
      21,
      fontSans
    );

    // Right Pill: Your Seat Status in this Set
    const statusPillW = 260;
    const statusPillX = W - 64 - 26 - statusPillW;
    drawRoundedRect(ctx, statusPillX, currentY + 20, statusPillW, 44, 22);
    ctx.fillStyle = isAnyNear ? '#5BAE84' : '#D97706';
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    fillTextFit(
      ctx,
      isAnyNear ? '★ 本局 12 席射程內好拍' : '▲ 距離逾 12 席（偏遠）',
      statusPillX + statusPillW / 2,
      currentY + 42,
      statusPillW - 24,
      900,
      19,
      fontSans
    );
    ctx.textAlign = 'left';

    // Left Half: 2 Stacked Phase Boxes (0-10 pts & >10 pts)
    const leftX = 90;
    const leftW = 472;
    const boxH = 98;

    const phases = [
      {
        title: '【開局 0–10 分】',
        detail: comp.initial,
        frontName: initFrontGirl?.name ?? '',
        boxY: currentY + 78,
        isDark: false,
      },
      {
        title: '【破 10 分換位後 · 主力段】',
        detail: comp.after10,
        frontName: after10FrontGirl?.name ?? '',
        boxY: currentY + 186,
        isDark: true,
      },
    ];

    phases.forEach((p) => {
      drawRoundedRect(ctx, leftX, p.boxY, leftW, boxH, 16);
      ctx.fillStyle = p.isDark ? '#212047' : '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = p.detail.isWithin12Seats
        ? '#5BAE84'
        : 'rgba(217, 119, 6, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      const relDir =
        p.detail.signedSeatOffset === 0
          ? '▲ 正前方 0 席'
          : p.detail.signedSeatOffset < 0
            ? `◀ 左前 ${Math.abs(p.detail.signedSeatOffset)} 席`
            : `右前 ${p.detail.signedSeatOffset} 席 ▶`;

      ctx.fillStyle = p.isDark ? '#7ADAD0' : '#3F8E67';
      fillTextFit(
        ctx,
        `${p.title} 主推在 ${p.detail.girlZone} 區 ${p.detail.girlSeatRange[0]}–${p.detail.girlSeatRange[1]} 號`,
        leftX + 16,
        p.boxY + 24,
        leftW - 32,
        800,
        17,
        fontMono
      );

      ctx.fillStyle = p.isDark ? '#FFFFFF' : '#212047';
      fillTextFit(
        ctx,
        `${relDir}（${p.detail.isWithin12Seats ? '12 席內好拍' : `逾 12 席 · 建議移至 ${p.detail.girlZone}${p.detail.girlCoreSeat} 號`}）`,
        leftX + 16,
        p.boxY + 54,
        leftW - 32,
        900,
        22,
        fontSans
      );

      ctx.fillStyle = p.isDark ? '#5ECBC0' : '#5BAE84';
      const subLine = p.detail.boundaryConnectionLabel
        ? `↔ ${p.detail.boundaryConnectionLabel} ｜ 你正前方：${p.frontName}`
        : `你的 ${userZone}${userSeat} 正前方女孩：${p.frontName}`;
      fillTextFit(
        ctx,
        subLine,
        leftX + 16,
        p.boxY + 80,
        leftW - 32,
        700,
        16,
        fontSans
      );
    });

    // Right Half: Visual First-Person Audience Seat Radar Diagram Drawn on Canvas
    const radarX = leftX + leftW + 16;
    const radarY = currentY + 78;
    const radarW = W - 64 - 26 - radarX; // 412px
    const radarH = 206;

    drawRoundedRect(ctx, radarX, radarY, radarW, radarH, 18);
    ctx.fillStyle = '#181736';
    ctx.fill();
    ctx.strokeStyle = 'rgba(94, 203, 192, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Top Court Strip inside Radar
    drawRoundedRect(ctx, radarX + 10, radarY + 8, radarW - 20, 24, 8);
    ctx.fillStyle = 'rgba(91, 174, 132, 0.25)';
    ctx.fill();
    ctx.fillStyle = '#7ADAD0';
    ctx.textAlign = 'center';
    fillTextFit(
      ctx,
      '▲ 前方 1F 比賽球場（左 C 區 ↔ 中 B 區 ↔ 右 A 區）▲',
      radarX + radarW / 2,
      radarY + 20,
      radarW - 32,
      800,
      13,
      fontMono
    );

    // Zone Dividers (C | B | A)
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    [1 / 3, 2 / 3].forEach((ratio) => {
      const dx = radarX + radarW * ratio;
      ctx.beginPath();
      ctx.moveTo(dx, radarY + 36);
      ctx.lineTo(dx, radarY + radarH - 16);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Stage Line (y = radarY + 62) & Audience Line (y = radarY + 168)
    const stageY = radarY + 64;
    const audY = radarY + 168;

    ctx.strokeStyle = 'rgba(94,203,192,0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(radarX + 14, stageY);
    ctx.lineTo(radarX + radarW - 14, stageY);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(radarX + 14, audY);
    ctx.lineTo(radarX + radarW - 14, audY);
    ctx.stroke();

    const uPx = radarX + toRadarNorm(userGlobal) * radarW;
    const fovLeftPx =
      radarX + toRadarNorm(Math.min(69, userGlobal + 12)) * radarW;
    const fovRightPx =
      radarX + toRadarNorm(Math.max(1, userGlobal - 12)) * radarW;

    // Upward ±12 Seat Camera Cone
    const coneGrad = ctx.createLinearGradient(0, audY, 0, stageY);
    coneGrad.addColorStop(0, 'rgba(94, 203, 192, 0.34)');
    coneGrad.addColorStop(1, 'rgba(94, 203, 192, 0.05)');
    ctx.fillStyle = coneGrad;
    ctx.beginPath();
    ctx.moveTo(uPx, audY);
    ctx.lineTo(fovLeftPx, stageY);
    ctx.lineTo(fovRightPx, stageY);
    ctx.closePath();
    ctx.fill();

    // Oshi Positions for 0-10 pts and >10 pts
    const gZIndex =
      comp.initial.girlZone === 'A'
        ? 0
        : comp.initial.girlZone === 'B'
          ? 1
          : 2;
    const initGlobal = gZIndex * 23 + comp.initial.girlCoreSeat;
    const after10Global = gZIndex * 23 + comp.after10.girlCoreSeat;

    const initPx = radarX + toRadarNorm(initGlobal) * radarW;
    const after10Px = radarX + toRadarNorm(after10Global) * radarW;

    // Sightline 1: 0-10 pts (Dashed Green)
    ctx.strokeStyle = '#5BAE84';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(uPx, audY);
    ctx.lineTo(initPx, stageY);
    ctx.stroke();

    // Sightline 2: >10 pts (Solid Cyan or Amber)
    ctx.setLineDash([]);
    ctx.strokeStyle = comp.after10.isWithin12Seats ? '#5ECBC0' : '#FBBF24';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(uPx, audY);
    ctx.lineTo(after10Px, stageY);
    ctx.stroke();

    // Draw Pins on Stage Line
    // Pin 1: 0-10 pts
    const clampInitPx = Math.max(
      radarX + 54,
      Math.min(radarX + radarW - 54, initPx)
    );
    drawRoundedRect(ctx, clampInitPx - 48, stageY - 24, 96, 22, 11);
    ctx.fillStyle = '#5BAE84';
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    fillTextFit(
      ctx,
      `0-10分:${comp.initial.girlZone}${comp.initial.girlCoreSeat}`,
      clampInitPx,
      stageY - 13,
      88,
      800,
      12,
      fontMono
    );

    // Pin 2: >10 pts
    const clampAfterPx = Math.max(
      radarX + 58,
      Math.min(radarX + radarW - 58, after10Px)
    );
    drawRoundedRect(ctx, clampAfterPx - 54, stageY + 4, 108, 24, 12);
    ctx.fillStyle = comp.after10.isWithin12Seats ? '#5ECBC0' : '#FBBF24';
    ctx.fill();
    ctx.fillStyle = '#212047';
    fillTextFit(
      ctx,
      `★破10分:${comp.after10.girlZone}${comp.after10.girlCoreSeat}`,
      clampAfterPx,
      stageY + 16,
      100,
      900,
      13,
      fontMono
    );

    // Draw User Pin on Bottom Audience Line
    const clampUserPx = Math.max(
      radarX + 58,
      Math.min(radarX + radarW - 58, uPx)
    );
    drawRoundedRect(ctx, clampUserPx - 54, audY - 12, 108, 26, 13);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#5ECBC0';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#212047';
    fillTextFit(
      ctx,
      `▲ 你：${userZone}${userSeat}`,
      clampUserPx,
      audY + 1,
      96,
      900,
      14,
      fontMono
    );
    ctx.textAlign = 'left';

    currentY += cardH + 18;
  });

  // 6. Footer Legend & Disclaimer
  ctx.fillStyle = '#7ADAD0';
  fillTextFit(
    ctx,
    '■ 實線：破 10 分主力視線（佔單局 60% 時間）  ■ 虛線：開局 0–10 分視線  ■ 扇形：±12 席最佳正面拍攝射程',
    64,
    H - 76,
    W - 128,
    700,
    18,
    fontSans
  );

  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  fillTextFit(
    ctx,
    '※ 粉絲自製非官方應援攻略圖（依官方 IG 站位表推算），現場實際站位與座椅編號請以官方公告為準。',
    64,
    H - 46,
    W - 128,
    600,
    17,
    fontSans
  );

  return canvas.toDataURL('image/png');
}

/**
 * 模式 2：想要使用換位子 -> 生成「最佳換位區間＆跨區互看攻略版」PNG（支援如 A 區大號可看 B 區小號說明）
 */
async function renderZoneHoppingCardToDataUrl(
  member: AceVivaMember,
  schedule: MatchStationSchedule,
  recs: GirlSetZoneRecommendation[],
  topCross?: CrossZoneGoldenInterval
): Promise<string> {
  const W = 1080;
  const H = 1610;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const fontSans =
    '"Plus Jakarta Sans", "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif';
  const fontMono = '"JetBrains Mono", "Noto Sans TC", monospace';

  await drawCardShellAndAvatar(
    ctx,
    W,
    H,
    '2. 局間換位 · 最佳換位區間＆跨區攻略卡',
    schedule,
    member,
    fontSans,
    fontMono
  );

  const heroY = 122;
  const infoX = 292;
  const pillW = W - 64 - 28 - infoX;

  ctx.fillStyle = '#7ADAD0';
  fillTextFit(
    ctx,
    `ZONE-HOPPING & CROSS-ZONE GUIDE · 背號 #${member.number} · @${member.instagramHandle}`,
    infoX,
    heroY + 38,
    pillW,
    800,
    20,
    fontMono
  );

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `900 50px ${fontSans}`;
  ctx.fillText(member.name, infoX, heroY + 92);

  const nameW = ctx.measureText(member.name).width;
  if (member.realOrAltName) {
    ctx.fillStyle = 'rgba(255,255,255,0.68)';
    fillTextFit(
      ctx,
      `（${member.realOrAltName}）`,
      infoX + nameW + 10,
      heroY + 95,
      pillW - nameW - 16,
      600,
      24,
      fontSans
    );
  }

  // Primary Ticket & Cross-Zone Golden Interval Pills
  const topRec = recs[0];
  if (topRec) {
    const pill1Y = heroY + 134;
    drawRoundedRect(ctx, infoX, pill1Y, pillW, 44, 14);
    ctx.fillStyle = 'rgba(91, 174, 132, 0.28)';
    ctx.fill();
    ctx.strokeStyle = '#5ECBC0';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#5ECBC0';
    const topRecShortText = `★ 單區首選：2F 集氣 ${topRec.zone} 區 ${topRec.sweetSpotRange[0]}–${topRec.sweetSpotRange[1]} 號（破 10 分 C 位：${topRec.after10CoreSeats}）`;
    fillTextFit(
      ctx,
      topRecShortText,
      infoX + 18,
      pill1Y + 22,
      pillW - 36,
      800,
      20,
      fontSans
    );
  }

  if (topCross) {
    const pill2Y = heroY + 188;
    drawRoundedRect(ctx, infoX, pill2Y, pillW, 44, 14);
    ctx.fillStyle = 'rgba(25, 24, 56, 0.9)';
    ctx.fill();
    ctx.strokeStyle = '#7ADAD0';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    const crossText = `↔ 跨區免換位黃金區間：${topCross.combinedRangeLabel}（兼顧 ${topCross.coveredSetsLabel}）`;
    fillTextFit(
      ctx,
      crossText,
      infoX + 18,
      pill2Y + 22,
      pillW - 36,
      800,
      19,
      fontSans
    );
  }

  // 4. Audience-Perspective Orientation & Cross-Zone Sightline Rule Strip
  const mapY = 392;
  drawRoundedRect(ctx, 64, mapY, W - 128, 126, 24);
  ctx.fillStyle = '#14132D';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#7ADAD0';
  fillTextFit(
    ctx,
    '▲ 觀眾面向球場跨區互看原則：C 區小號(1–7) ↔ B 區大號(17–23) 相連互看 ｜ B 區小號(1–7) ↔ A 區大號(17–23) 相連互看',
    90,
    mapY + 28,
    W - 180,
    800,
    18,
    fontSans
  );

  const audienceZones: { id: 'C' | 'B' | 'A'; label: string }[] = [
    { id: 'C', label: '◀ 左手邊：2F C 區 (23→1號)' },
    { id: 'B', label: '正中央：2F B 區 (23→1號)' },
    { id: 'A', label: '右手邊：2F A 區 (23→1號) ▶' },
  ];
  const zoneBoxW = (W - 128 - 52 - 24) / 3;
  audienceZones.forEach((zItem, idx) => {
    const zx = 90 + idx * (zoneBoxW + 12);
    const zy = mapY + 50;
    const recForZone = recs.find((r) => r.zone === zItem.id);

    drawRoundedRect(ctx, zx, zy, zoneBoxW, 54, 14);
    ctx.fillStyle =
      recForZone?.setKey === 'set1_4'
        ? 'rgba(91, 174, 132, 0.35)'
        : 'rgba(255, 255, 255, 0.07)';
    ctx.fill();
    ctx.strokeStyle =
      recForZone?.setKey === 'set1_4' ? '#5ECBC0' : 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    fillTextFit(
      ctx,
      zItem.label,
      zx + 14,
      zy + 27,
      zoneBoxW - 120,
      800,
      18,
      fontSans
    );

    if (recForZone) {
      ctx.fillStyle = '#7ADAD0';
      ctx.textAlign = 'right';
      fillTextFit(
        ctx,
        `(${recForZone.setShortLabel})`,
        zx + zoneBoxW - 12,
        zy + 27,
        110,
        700,
        17,
        fontMono
      );
      ctx.textAlign = 'left';
    }
  });

  // 5. Three Set Cards (Set 1&4, Set 2&5, Set 3)
  let currentY = 536;
  const cardH = 304;

  recs.forEach((rec, index) => {
    const isPrimary = index === 0;
    const crossGuide = getExplicitCrossZoneGuide(rec);

    drawRoundedRect(ctx, 64, currentY, W - 128, cardH, 28);
    ctx.fillStyle = isPrimary ? '#F4FAF8' : '#EBF6F3';
    ctx.fill();
    ctx.strokeStyle = isPrimary ? '#5BAE84' : 'rgba(33,32,71,0.15)';
    ctx.lineWidth = isPrimary ? 4 : 2;
    ctx.stroke();

    // Set Badge (Centered text)
    const setBadgeX = 92;
    const setBadgeW = 230;
    drawRoundedRect(ctx, setBadgeX, currentY + 20, setBadgeW, 44, 22);
    ctx.fillStyle = isPrimary ? '#212047' : '#3F8E67';
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    fillTextFit(
      ctx,
      rec.setLabel,
      setBadgeX + setBadgeW / 2,
      currentY + 42,
      setBadgeW - 24,
      900,
      21,
      fontSans
    );
    ctx.textAlign = 'left';

    // Priority or Cross-Zone Hint Label in Header
    ctx.fillStyle = '#3F8E67';
    fillTextFit(
      ctx,
      crossGuide.rulerEdgeHint ?? rec.priorityBadge,
      336,
      currentY + 42,
      400,
      800,
      19,
      fontSans
    );

    // Zone Pill on Right (Centered text)
    const zonePillW = 236;
    const zonePillX = W - 64 - 28 - zonePillW;
    drawRoundedRect(ctx, zonePillX, currentY + 18, zonePillW, 46, 23);
    ctx.fillStyle = '#212047';
    ctx.fill();
    ctx.fillStyle = '#5ECBC0';
    ctx.textAlign = 'center';
    fillTextFit(
      ctx,
      `換位目標：2F ${rec.zone} 區`,
      zonePillX + zonePillW / 2,
      currentY + 41,
      zonePillW - 24,
      900,
      21,
      fontSans
    );
    ctx.textAlign = 'left';

    // 3 Columns: 0-10 pts | >10 pts | Best Interval & Explicit Cross-Zone Sightline
    const colY = currentY + 80;
    const colW = (W - 128 - 56 - 28) / 3;
    const colInnerW = colW - 32;

    // Col 1: 0-10 pts
    drawRoundedRect(ctx, 92, colY, colW, 108, 18);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = 'rgba(91,174,132,0.45)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#3F8E67';
    fillTextFit(
      ctx,
      `開局 0–10 分（${rec.initialSlotLabel.slice(0, 4)}）`,
      108,
      colY + 26,
      colInnerW,
      800,
      18,
      fontMono
    );
    ctx.fillStyle = '#212047';
    fillTextFit(
      ctx,
      `${rec.zone} 區 ${rec.initialSeatRange[0]}–${rec.initialSeatRange[1]} 號`,
      108,
      colY + 60,
      colInnerW,
      900,
      28,
      fontSans
    );
    ctx.fillStyle = '#5BAE84';
    fillTextFit(
      ctx,
      `正對 C 位：${rec.initialCoreSeats}`,
      108,
      colY + 88,
      colInnerW,
      700,
      17,
      fontSans
    );

    // Col 2: After 10 pts (Main Segment)
    const col2X = 92 + colW + 14;
    drawRoundedRect(ctx, col2X, colY, colW, 108, 18);
    ctx.fillStyle = '#212047';
    ctx.fill();

    ctx.fillStyle = '#7ADAD0';
    fillTextFit(
      ctx,
      `破 10 分換位後（${rec.after10SlotLabel.slice(0, 4)}）`,
      col2X + 16,
      colY + 26,
      colInnerW,
      800,
      18,
      fontMono
    );
    ctx.fillStyle = '#FFFFFF';
    fillTextFit(
      ctx,
      `${rec.zone} 區 ${rec.after10SeatRange[0]}–${rec.after10SeatRange[1]} 號`,
      col2X + 16,
      colY + 60,
      colInnerW,
      900,
      28,
      fontSans
    );
    ctx.fillStyle = '#5ECBC0';
    fillTextFit(
      ctx,
      `主力 C 位：${rec.after10CoreSeats}`,
      col2X + 16,
      colY + 88,
      colInnerW,
      700,
      17,
      fontSans
    );

    // Col 3: Best Hopping Interval & Explicit Cross-Zone Explanation
    const col3X = col2X + colW + 14;
    drawRoundedRect(ctx, col3X, colY, colW, 108, 18);
    ctx.fillStyle = '#D5EFE9';
    ctx.fill();
    ctx.strokeStyle = '#5BAE84';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#212047';
    fillTextFit(
      ctx,
      crossGuide.headerText,
      col3X + 16,
      colY + 26,
      colInnerW,
      800,
      18,
      fontMono
    );
    ctx.fillStyle = '#212047';
    fillTextFit(
      ctx,
      crossGuide.mainRangeText,
      col3X + 16,
      colY + 60,
      colInnerW,
      900,
      28,
      fontSans
    );
    ctx.fillStyle = '#3F8E67';
    fillTextFit(
      ctx,
      crossGuide.crossRuleText,
      col3X + 16,
      colY + 88,
      colInnerW,
      800,
      16,
      fontSans
    );

    // 23 -> 1 Single-Line Seat Ruler Bar (Audience First-Person Order: Left 23 -> Right 1)
    const rulerY = currentY + 206;
    const totalRulerW = W - 128 - 56;
    const seatBoxW = (totalRulerW - 22 * 4) / 23;

    for (let idx = 0; idx < 23; idx++) {
      const sNum = 23 - idx;
      const sx = 92 + idx * (seatBoxW + 4);
      const inInit =
        sNum >= rec.initialSeatRange[0] && sNum <= rec.initialSeatRange[1];
      const inAfter10 =
        sNum >= rec.after10SeatRange[0] && sNum <= rec.after10SeatRange[1];

      drawRoundedRect(ctx, sx, rulerY, seatBoxW, 54, 10);
      if (inAfter10) {
        ctx.fillStyle = '#212047';
        ctx.fill();
      } else if (inInit) {
        ctx.fillStyle = '#5BAE84';
        ctx.fill();
      } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = 'rgba(33,32,71,0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.fillStyle = inAfter10
        ? '#7ADAD0'
        : inInit
          ? '#FFFFFF'
          : 'rgba(33,32,71,0.4)';
      ctx.font = `800 18px ${fontMono}`;
      ctx.textAlign = 'center';
      ctx.fillText(String(sNum), sx + seatBoxW / 2, rulerY + 27);
      ctx.textAlign = 'left';
    }

    // Sub-ruler Cross-Zone Direction Caption
    ctx.fillStyle = '#3F8E67';
    fillTextFit(
      ctx,
      `◀ 觀眾左手邊 ${rec.zone}23（${rec.zone === 'A' ? '左接 B 區小號 1–7 號' : rec.zone === 'B' ? '左接 C 區小號 1–7 號' : '最左翼'}）`,
      92,
      currentY + 280,
      420,
      700,
      15,
      fontMono
    );
    ctx.textAlign = 'right';
    fillTextFit(
      ctx,
      `觀眾右手邊 ${rec.zone}1（${rec.zone === 'C' ? '右接 B 區大號 17–23 號' : rec.zone === 'B' ? '右接 A 區大號 17–23 號' : '最右翼'}） ▶`,
      W - 92,
      currentY + 280,
      420,
      700,
      15,
      fontMono
    );
    ctx.textAlign = 'left';

    currentY += cardH + 18;
  });

  // 6. Footer Legend & Disclaimer
  ctx.fillStyle = '#7ADAD0';
  fillTextFit(
    ctx,
    '■ 深藍：破 10 分主力席（佔 60% 時間）  ■ 綠：開局 0–10 分正對席  ◀ 尺規依觀眾面向球場排列：左 23 號 → 右 1 號 ▶',
    64,
    H - 76,
    W - 128,
    700,
    18,
    fontSans
  );

  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  fillTextFit(
    ctx,
    '※ 粉絲自製非官方應援攻略圖（依官方 IG 站位表推算），現場實際站位與座椅編號請以官方公告為準。',
    64,
    H - 46,
    W - 128,
    600,
    17,
    fontSans
  );

  return canvas.toDataURL('image/png');
}

export const OshiStrategyCardModal: React.FC<OshiStrategyCardModalProps> = ({
  isOpen,
  initialGirlId,
  initialMatchId,
  initialMode = 'zone_hopping',
  initialZone = 'B',
  initialSeat = 12,
  onClose,
}) => {
  const [selectedMatchId, setSelectedMatchId] =
    useState<string>(initialMatchId);
  const [selectedGirlId, setSelectedGirlId] = useState<string>(initialGirlId);
  const [cardMode, setCardMode] = useState<StrategyCardMode>(initialMode);
  const [userZone, setUserZone] = useState<AceZoneId>(initialZone);
  const [userSeat, setUserSeat] = useState<number>(initialSeat);
  const [imageDataUrl, setImageDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    setSelectedGirlId(initialGirlId);
  }, [initialGirlId]);

  useEffect(() => {
    setSelectedMatchId(initialMatchId);
  }, [initialMatchId]);

  useEffect(() => {
    setCardMode(initialMode);
  }, [initialMode, isOpen]);

  useEffect(() => {
    setUserZone(initialZone);
  }, [initialZone]);

  useEffect(() => {
    setUserSeat(initialSeat);
  }, [initialSeat]);

  const memberMap = useMemo(() => {
    const map = new Map<string, AceVivaMember>();
    for (const m of MEMBERS) {
      map.set(m.id, m);
    }
    return map;
  }, []);

  const currentSchedule = useMemo(
    () =>
      STATION_ROTATION_SCHEDULES.find((s) => s.matchId === selectedMatchId) ??
      STATION_ROTATION_SCHEDULES[0],
    [selectedMatchId]
  );

  const rotatingMembers = useMemo(() => {
    const s1 = currentSchedule.sets[0].initial;
    const ids = [...s1.A, ...s1.B, ...s1.C];
    return ids
      .map((id) => memberMap.get(id))
      .filter((m): m is AceVivaMember => Boolean(m));
  }, [currentSchedule, memberMap]);

  const activeGirl = useMemo(() => {
    const found = rotatingMembers.find((m) => m.id === selectedGirlId);
    return found ?? rotatingMembers[0];
  }, [rotatingMembers, selectedGirlId]);

  const recommendations = useMemo(
    () =>
      activeGirl
        ? getGirlSeatRecommendations(currentSchedule, activeGirl.id)
        : [],
    [currentSchedule, activeGirl]
  );

  const topCrossZone = useMemo(
    () =>
      activeGirl
        ? getCrossZoneGoldenIntervals(currentSchedule, activeGirl.id)[0]
        : undefined,
    [currentSchedule, activeGirl]
  );

  useEffect(() => {
    if (!isOpen || !activeGirl) return;
    let cancelled = false;
    setIsGenerating(true);

    const promise =
      cardMode === 'seat_radar'
        ? renderSeatRadarCardToDataUrl(
            activeGirl,
            currentSchedule,
            userZone,
            userSeat,
            memberMap
          )
        : renderZoneHoppingCardToDataUrl(
            activeGirl,
            currentSchedule,
            recommendations,
            topCrossZone
          );

    promise.then((url) => {
      if (!cancelled) {
        setImageDataUrl(url);
        setIsGenerating(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [
    isOpen,
    activeGirl,
    currentSchedule,
    recommendations,
    topCrossZone,
    cardMode,
    userZone,
    userSeat,
    memberMap,
  ]);

  if (!isOpen || !activeGirl) return null;

  const handleDownload = () => {
    if (!imageDataUrl) return;
    const link = document.createElement('a');
    link.href = imageDataUrl;
    const suffix =
      cardMode === 'seat_radar'
        ? `${userZone}${userSeat}_座位雷達圖攻略卡`
        : '最佳換位與跨區攻略卡';
    link.download = `ACE_VIVA_${activeGirl.name}_${currentSchedule.matchId}_${suffix}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#212047]/80 p-3 backdrop-blur-md sm:p-6"
      onClick={onClose}
    >
      <div
        className="max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-[1.75rem] bg-[#D5EFE9] p-1.5 shadow-2xl ring-1 ring-[#5ECBC0]/40 sm:rounded-[2rem] sm:p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="rounded-[calc(1.75rem-0.375rem)] bg-white p-4 sm:rounded-[calc(2rem-0.375rem)] sm:p-6">
          {/* Top Header */}
          <div className="flex items-center justify-between gap-2 border-b border-[#212047]/10 pb-3.5">
            <div>
              <span className="font-mono-num text-[10px] font-extrabold tracking-[0.15em] text-[#3F8E67] uppercase sm:text-xs">
                OSHI STRATEGY CARD GENERATOR · 主推攻略圖卡雙模式產生器
              </span>
              <h3 className="text-lg font-black text-[#212047] sm:text-2xl">
                {activeGirl.name}（#{activeGirl.number}）專屬應援攻略圖卡
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-[#212047]/10 px-3.5 py-1.5 text-xs font-extrabold text-[#212047] hover:bg-[#212047] hover:text-white"
            >
              關閉 ✕
            </button>
          </div>

          {/* 2-Mode Selector: 1. 已選擇座位雷達圖版 vs 2. 想要換位子最佳換位＆跨區版 */}
          <div className="mt-3.5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setCardMode('seat_radar')}
              className={`flex flex-col items-start rounded-2xl p-3 text-left transition-all ${
                cardMode === 'seat_radar'
                  ? 'bg-[#212047] text-white shadow-md ring-2 ring-[#5BAE84]'
                  : 'bg-[#F4FAF8] text-[#212047] ring-1 ring-[#212047]/15 hover:bg-[#E6F5F1]'
              }`}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 font-mono-num text-[10px] font-extrabold ${
                    cardMode === 'seat_radar'
                      ? 'bg-[#5BAE84] text-white'
                      : 'bg-[#212047]/10 text-[#212047]'
                  }`}
                >
                  模式 1 · 固定座位版
                </span>
                {cardMode === 'seat_radar' && (
                  <span className="font-mono-num text-xs font-black text-[#5ECBC0]">
                    ● 使用中
                  </span>
                )}
              </div>
              <div className="mt-1.5 text-sm font-black sm:text-base">
                1. 已經選擇座位：生成座位雷達圖版本
              </div>
              <p
                className={`mt-0.5 text-[11px] leading-snug ${
                  cardMode === 'seat_radar'
                    ? 'text-white/75'
                    : 'text-[#212047]/65'
                }`}
              >
                鎖定你的座位（如 {userZone} 區 {userSeat} 號），繪製各局主推相對方位雷達與面前女孩。
              </p>
            </button>

            <button
              type="button"
              onClick={() => setCardMode('zone_hopping')}
              className={`flex flex-col items-start rounded-2xl p-3 text-left transition-all ${
                cardMode === 'zone_hopping'
                  ? 'bg-[#212047] text-white shadow-md ring-2 ring-[#5BAE84]'
                  : 'bg-[#F4FAF8] text-[#212047] ring-1 ring-[#212047]/15 hover:bg-[#E6F5F1]'
              }`}
            >
              <div className="flex w-full items-center justify-between gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 font-mono-num text-[10px] font-extrabold ${
                    cardMode === 'zone_hopping'
                      ? 'bg-[#5BAE84] text-white'
                      : 'bg-[#212047]/10 text-[#212047]'
                  }`}
                >
                  模式 2 · 局間換位＆跨區版
                </span>
                {cardMode === 'zone_hopping' && (
                  <span className="font-mono-num text-xs font-black text-[#5ECBC0]">
                    ● 使用中
                  </span>
                )}
              </div>
              <div className="mt-1.5 text-sm font-black sm:text-base">
                2. 想要使用換位子：推薦最佳換位區間（支援跨區說明）
              </div>
              <p
                className={`mt-0.5 text-[11px] leading-snug ${
                  cardMode === 'zone_hopping'
                    ? 'text-white/75'
                    : 'text-[#212047]/65'
                }`}
              >
                推薦每局最佳換位區間，並附跨區互看指引（如 A 區大號可看 B 區小號）。
              </p>
            </button>
          </div>

          {/* Seat Picker Bar (Shown when Mode 1 "seat_radar" is active) */}
          {cardMode === 'seat_radar' && (
            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[#E6F5F1] px-3.5 py-2.5 ring-1 ring-[#5BAE84]/45">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono-num text-xs font-extrabold text-[#212047]">
                  選擇你的座位：
                </span>
                <div className="flex gap-1">
                  {(['A', 'B', 'C'] as AceZoneId[]).map((z) => (
                    <button
                      key={z}
                      type="button"
                      onClick={() => setUserZone(z)}
                      className={`rounded-lg px-2.5 py-1 font-mono-num text-xs font-extrabold transition-all ${
                        userZone === z
                          ? 'bg-[#212047] text-[#5ECBC0]'
                          : 'bg-white text-[#212047] ring-1 ring-[#212047]/15 hover:bg-[#D5EFE9]'
                      }`}
                    >
                      {z} 區
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-1 items-center gap-2 sm:max-w-xs">
                <button
                  type="button"
                  onClick={() => setUserSeat((s) => Math.max(1, s - 1))}
                  className="rounded-lg bg-white px-2 py-1 font-mono-num text-xs font-black text-[#212047] ring-1 ring-[#212047]/15"
                >
                  -1
                </button>
                <input
                  type="range"
                  min={1}
                  max={23}
                  value={userSeat}
                  onChange={(e) => setUserSeat(Number(e.target.value))}
                  className="seat-range-slider flex-1"
                />
                <button
                  type="button"
                  onClick={() => setUserSeat((s) => Math.min(23, s + 1))}
                  className="rounded-lg bg-white px-2 py-1 font-mono-num text-xs font-black text-[#212047] ring-1 ring-[#212047]/15"
                >
                  +1
                </button>
                <span className="min-w-16 rounded-lg bg-[#212047] px-2.5 py-1 text-center font-mono-num text-xs font-black text-[#5ECBC0]">
                  {userZone} 區 {userSeat} 號
                </span>
              </div>
            </div>
          )}

          {/* Controls: Switch Match Day & Switch Oshi Girl */}
          <div className="mt-2.5 flex flex-col gap-2.5 rounded-2xl bg-[#F4FAF8] p-3 ring-1 ring-[#5BAE84]/30 sm:flex-row sm:items-center sm:justify-between">
            {/* Match Day Switcher */}
            <div className="flex flex-wrap gap-1.5">
              {STATION_ROTATION_SCHEDULES.map((sched) => {
                const isAct = sched.matchId === currentSchedule.matchId;
                return (
                  <button
                    key={sched.matchId}
                    type="button"
                    onClick={() => setSelectedMatchId(sched.matchId)}
                    className={`rounded-full px-3 py-1.5 text-xs font-extrabold transition-all ${
                      isAct
                        ? 'bg-[#212047] text-[#7ADAD0] shadow-xs'
                        : 'bg-white text-[#212047]/75 ring-1 ring-[#212047]/10 hover:bg-[#E6F5F1]'
                    }`}
                  >
                    {sched.dayLabel}（vs {sched.opponent}）
                  </button>
                );
              })}
            </div>

            {/* Girl Switcher Strip */}
            <div className="no-scrollbar flex gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {rotatingMembers.map((m) => {
                const isAct = m.id === activeGirl.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedGirlId(m.id)}
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold transition-all ${
                      isAct
                        ? 'bg-[#5BAE84] text-white shadow-xs'
                        : 'bg-white text-[#212047] ring-1 ring-[#212047]/10 hover:bg-[#E6F5F1]'
                    }`}
                  >
                    #{m.number} {m.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Download Action Bar */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[#212047] px-4 py-3 text-white">
            <span className="text-xs text-white/85 sm:text-sm">
              點擊右側按鈕下載高畫質 PNG，或於手機上
              <strong className="text-[#7ADAD0]">長按下方圖片儲存至相簿</strong>。
            </span>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isGenerating || !imageDataUrl}
              className="shrink-0 rounded-full bg-[#5BAE84] px-4 py-2 text-xs font-black text-white shadow-md transition-transform hover:bg-[#4FA87D] active:scale-95 disabled:opacity-50 sm:text-sm"
            >
              {isGenerating
                ? '生成圖片中...'
                : cardMode === 'seat_radar'
                  ? `下載「${userZone}${userSeat} 座位雷達圖卡」↓`
                  : `下載「${activeGirl.name} 最佳換位攻略卡」↓`}
            </button>
          </div>

          {/* Generated Image Preview */}
          <div className="mt-3.5 flex justify-center rounded-2xl bg-[#181736] p-2 ring-1 ring-[#212047]/15 sm:p-4">
            {imageDataUrl ? (
              <img
                src={imageDataUrl}
                alt={`${activeGirl.name} 視角攻略卡`}
                className="max-h-[58dvh] w-auto rounded-xl object-contain shadow-lg"
              />
            ) : (
              <div className="flex h-72 items-center justify-center text-sm font-bold text-white/70">
                正在繪製高解析度攻略卡...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
