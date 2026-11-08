import React, { useEffect, useMemo, useState } from 'react';
import { MEMBERS, type AceVivaMember } from '../data/members';
import {
  ACTIVE_STATION_ROTATION_SCHEDULES,
  CLOSEST_STATION_SCHEDULE,
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
  minFontSize = 11
) {
  let size = initialFontSize;
  ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
  while (ctx.measureText(text).width > maxWidth && size > minFontSize) {
    size -= 1;
    ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
  }
  ctx.fillText(text, x, y, maxWidth);
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * 優先載入 400x400 臉部特寫圓形頭像（./images/avatars/<id>.jpg），若無則降級載入完整形象照
 */
async function loadMemberAvatarImage(
  member: AceVivaMember
): Promise<{ img: HTMLImageElement | null; isSquareAvatar: boolean }> {
  const avatarImg = await loadImage(`./images/avatars/${member.id}.jpg`);
  if (avatarImg) {
    return { img: avatarImg, isSquareAvatar: true };
  }
  const fullImg = await loadImage(member.localImagePath);
  return { img: fullImg, isSquareAvatar: false };
}

/**
 * 於 Canvas 指定中心座標 (cx, cy) 與半徑 r 繪製圓形成員頭像與外框
 */
function drawCircularAvatarOnCanvas(
  ctx: CanvasRenderingContext2D,
  avatarData: { img: HTMLImageElement | null; isSquareAvatar: boolean } | undefined,
  cx: number,
  cy: number,
  radius: number,
  ringColor: string,
  ringWidth: number,
  fallbackLabel: string,
  fontMono: string
) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  if (avatarData?.img) {
    const img = avatarData.img;
    if (avatarData.isSquareAvatar) {
      ctx.drawImage(
        img,
        0,
        0,
        img.width,
        img.height,
        cx - radius,
        cy - radius,
        radius * 2,
        radius * 2
      );
    } else {
      const sWidth = img.width * 0.72;
      const sHeight = sWidth;
      const sx = (img.width - sWidth) / 2;
      const sy = img.height * 0.04;
      ctx.drawImage(
        img,
        sx,
        sy,
        sWidth,
        sHeight,
        cx - radius,
        cy - radius,
        radius * 2,
        radius * 2
      );
    }
  } else {
    ctx.fillStyle = '#212047';
    ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
    ctx.fillStyle = '#7ADAD0';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    fillTextFit(
      ctx,
      fallbackLabel,
      cx,
      cy,
      radius * 1.6,
      800,
      Math.max(12, Math.round(radius * 0.65)),
      fontMono
    );
  }
  ctx.restore();

  // Outer Ring
  ctx.beginPath();
  ctx.arc(cx, cy, radius + ringWidth / 2, 0, Math.PI * 2);
  ctx.strokeStyle = ringColor;
  ctx.lineWidth = ringWidth;
  ctx.stroke();
}

/**
 * 針對「模式 2：最佳換位區間（含跨區說明）」產生精簡跨區圖解文字
 */
function getExplicitCrossZoneGuide(rec: GirlSetZoneRecommendation): {
  shortCrossBadge: string | null;
} {
  const touchesSmall = rec.initialSlotIndex === 0 || rec.after10SlotIndex === 0; // 1–8 號
  const touchesLarge = rec.initialSlotIndex === 2 || rec.after10SlotIndex === 2; // 16–23 號

  if (rec.zone === 'A' && touchesLarge) {
    return {
      shortCrossBadge: '↔ 跨區互看：可坐 B 區 1–7 號 ──▶ 斜看 A 區 16–23 號',
    };
  }
  if (rec.zone === 'B' && touchesSmall && !touchesLarge) {
    return {
      shortCrossBadge: '↔ 跨區互看：可坐 A 區 17–23 號 ──▶ 斜看 B 區 1–8 號',
    };
  }
  if (rec.zone === 'B' && touchesLarge && !touchesSmall) {
    return {
      shortCrossBadge: '↔ 跨區互看：可坐 C 區 1–7 號 ──▶ 斜看 B 區 16–23 號',
    };
  }
  if (rec.zone === 'B' && touchesSmall && touchesLarge) {
    return {
      shortCrossBadge: '↔ 跨區：A 區 17–23 看 B 小號 ｜ C 區 1–7 看 B 大號',
    };
  }
  if (rec.zone === 'C' && touchesSmall) {
    return {
      shortCrossBadge: '↔ 跨區互看：可坐 B 區 17–23 號 ──▶ 斜看 C 區 1–8 號',
    };
  }

  return {
    shortCrossBadge: null,
  };
}

/**
 * 繪製共用頂部背景、外框與成員英雄橫幅左側圓形頭像
 */
function drawCardShellAndAvatar(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  badgeTitle: string,
  schedule: MatchStationSchedule,
  member: AceVivaMember,
  oshiAvatar: { img: HTMLImageElement | null; isSquareAvatar: boolean },
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
    170,
    20,
    W * 0.82,
    170,
    400
  );
  glowGrad.addColorStop(0, 'rgba(94, 203, 192, 0.24)');
  glowGrad.addColorStop(1, 'rgba(94, 203, 192, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, W, 560);

  // Outer Frame Border
  drawRoundedRect(ctx, 28, 28, W - 56, H - 56, 36);
  ctx.strokeStyle = 'rgba(94, 203, 192, 0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 2. Top Badge & Match Info
  drawRoundedRect(ctx, 64, 54, 460, 42, 21);
  ctx.fillStyle = '#5BAE84';
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  fillTextFit(ctx, badgeTitle, 64 + 230, 75, 430, 800, 19, fontMono);
  ctx.textAlign = 'left';

  // Match Date Pill on Right
  const matchBadgeText = `${schedule.dateLabel} vs ${schedule.opponent}`;
  ctx.font = `800 20px ${fontMono}`;
  const mTextW = Math.min(ctx.measureText(matchBadgeText).width, 410);
  drawRoundedRect(ctx, W - 64 - mTextW - 44, 54, mTextW + 44, 42, 21);
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
    75,
    mTextW,
    800,
    20,
    fontMono
  );

  // 3. Compact Hero Profile Banner Box
  const heroY = 114;
  const heroH = 224;
  drawRoundedRect(ctx, 64, heroY, W - 128, heroH, 30);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(94, 203, 192, 0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw Member Avatar Circle on Left
  const avatarRadius = 78;
  const avatarCx = 96 + avatarRadius;
  const avatarCy = heroY + heroH / 2;
  drawCircularAvatarOnCanvas(
    ctx,
    oshiAvatar,
    avatarCx,
    avatarCy,
    avatarRadius,
    '#5ECBC0',
    5,
    `#${member.number}`,
    fontMono
  );
}

/**
 * 模式 1：已經選擇座位 -> 生成「固定座位專屬視角雷達圖版」PNG
 * 特點：
 * 1. 頂部與各局座位雷達圖上皆顯示成員圓形頭像
 * 2. 固定座位視角，不顯示「建議移動至 XX 號」
 * 3. 極簡圖解化：每局以全寬度座位雷達圖直接標示開局與破 10 分主推頭像位置、視線與正前方女孩頭像
 */
async function renderSeatRadarCardToDataUrl(
  member: AceVivaMember,
  schedule: MatchStationSchedule,
  userZone: AceZoneId,
  userSeat: number,
  memberMap: Map<string, AceVivaMember>
): Promise<string> {
  const W = 1080;
  const H = 1520;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const fontSans =
    '"Plus Jakarta Sans", "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif';
  const fontMono = '"JetBrains Mono", "Noto Sans TC", monospace';

  // 預先載入主推與正前方女孩頭像
  const distanceComparisons: SetGirlDistanceComparison[] =
    getFullMatchGirlDistanceSummary(schedule, userZone, userSeat, member.id);
  const seatMapping = getSeatPositionMapping(userSeat);

  const neededMemberIds = new Set<string>([member.id]);
  schedule.sets.forEach((s) => {
    neededMemberIds.add(s.initial[userZone][seatMapping.slotIndex]);
    neededMemberIds.add(s.after10Points[userZone][seatMapping.slotIndex]);
  });

  const avatarCache = new Map<
    string,
    { img: HTMLImageElement | null; isSquareAvatar: boolean }
  >();
  await Promise.all(
    Array.from(neededMemberIds).map(async (id) => {
      const m = memberMap.get(id);
      if (m) {
        const loaded = await loadMemberAvatarImage(m);
        avatarCache.set(id, loaded);
      }
    })
  );

  const oshiAvatar = avatarCache.get(member.id) ?? {
    img: null,
    isSquareAvatar: false,
  };

  drawCardShellAndAvatar(
    ctx,
    W,
    H,
    '1. 固定座位 · 觀眾視角雷達圖卡',
    schedule,
    member,
    oshiAvatar,
    fontMono
  );

  // Count how many of the 6 phases are within 12 seats
  let nearPhasesCount = 0;
  for (const c of distanceComparisons) {
    if (c.initial.isWithin12Seats) nearPhasesCount += 1;
    if (c.after10.isWithin12Seats) nearPhasesCount += 1;
  }

  const heroY = 114;
  const infoX = 278;
  const pillW = W - 64 - 28 - infoX;

  ctx.fillStyle = '#7ADAD0';
  fillTextFit(
    ctx,
    `固定座位視角雷達 · 背號 #${member.number} · @${member.instagramHandle}`,
    infoX,
    heroY + 38,
    pillW,
    800,
    19,
    fontMono
  );

  ctx.fillStyle = '#FFFFFF';
  fillTextFit(
    ctx,
    `你的座位：${userZone} 區 ${userSeat} 號  →  ★ ${member.name}`,
    infoX,
    heroY + 86,
    pillW,
    900,
    40,
    fontSans
  );

  // Concise Visual Summary Pills
  const pill1Y = heroY + 122;
  drawRoundedRect(ctx, infoX, pill1Y, pillW, 40, 12);
  ctx.fillStyle = 'rgba(91, 174, 132, 0.28)';
  ctx.fill();
  ctx.strokeStyle = '#5ECBC0';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#5ECBC0';
  fillTextFit(
    ctx,
    `★ 全場 6 階段共 ${nearPhasesCount} 個階段在 12 席正面好拍射程內`,
    infoX + 16,
    pill1Y + 20,
    pillW - 32,
    800,
    19,
    fontSans
  );

  const pill2Y = heroY + 170;
  drawRoundedRect(ctx, infoX, pill2Y, pillW, 38, 12);
  ctx.fillStyle = 'rgba(25, 24, 56, 0.9)';
  ctx.fill();
  ctx.strokeStyle = '#7ADAD0';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#FFFFFF';
  fillTextFit(
    ctx,
    '▲ 觀眾面向球場視角：左手邊 C 區 (23→1號) ◀ ↔ 中 B 區 ↔ ▶ 右手邊 A 區 (23→1號)',
    infoX + 16,
    pill2Y + 19,
    pillW - 32,
    700,
    17,
    fontSans
  );

  // 4. Three Full-Width Visual Seat Radar Cards (Set 1&4, Set 2&5, Set 3)
  let currentY = 358;
  const cardH = 344;

  const userGlobal =
    (userZone === 'A' ? 0 : userZone === 'B' ? 1 : 2) * 23 + userSeat;
  const toRadarNorm = (gSeat: number) =>
    Math.max(0.07, Math.min(0.93, 0.05 + ((69 - gSeat) / 68) * 0.9));

  distanceComparisons.forEach((comp, index) => {
    const setObj = schedule.sets[index];
    const initFrontGirlId = setObj.initial[userZone][seatMapping.slotIndex];
    const after10FrontGirlId =
      setObj.after10Points[userZone][seatMapping.slotIndex];
    const initFrontGirl = memberMap.get(initFrontGirlId);
    const after10FrontGirl = memberMap.get(after10FrontGirlId);

    const isAnyNear =
      comp.initial.isWithin12Seats || comp.after10.isWithin12Seats;

    // Outer Set Card
    drawRoundedRect(ctx, 64, currentY, W - 128, cardH, 28);
    ctx.fillStyle = isAnyNear ? '#F4FAF8' : '#F3F5F8';
    ctx.fill();
    ctx.strokeStyle = isAnyNear ? '#5BAE84' : 'rgba(33,32,71,0.22)';
    ctx.lineWidth = isAnyNear ? 3.5 : 2;
    ctx.stroke();

    // Top Header Bar inside Set Card
    const setBadgeX = 88;
    const setBadgeW = 216;
    drawRoundedRect(ctx, setBadgeX, currentY + 16, setBadgeW, 40, 20);
    ctx.fillStyle = '#212047';
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    fillTextFit(
      ctx,
      comp.setLabel,
      setBadgeX + setBadgeW / 2,
      currentY + 36,
      setBadgeW - 20,
      900,
      20,
      fontSans
    );
    ctx.textAlign = 'left';

    // Concise Oshi Zone Tag
    ctx.fillStyle = '#212047';
    fillTextFit(
      ctx,
      `★ ${member.name} 在 2F ${comp.initial.girlZone} 區`,
      320,
      currentY + 36,
      240,
      900,
      21,
      fontSans
    );

    // Directly-in-Front Girls Visual Pill with Mini Avatars on Top-Right of Card
    const frontPillW = 410;
    const frontPillX = W - 64 - 24 - frontPillW;
    drawRoundedRect(ctx, frontPillX, currentY + 14, frontPillW, 44, 22);
    ctx.fillStyle = '#E6F5F1';
    ctx.fill();
    ctx.strokeStyle = 'rgba(91,174,132,0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#212047';
    fillTextFit(
      ctx,
      `你(${userZone}${userSeat})正前：`,
      frontPillX + 14,
      currentY + 36,
      125,
      800,
      15,
      fontSans
    );

    if (initFrontGirl) {
      drawCircularAvatarOnCanvas(
        ctx,
        avatarCache.get(initFrontGirl.id),
        frontPillX + 156,
        currentY + 36,
        14,
        '#5BAE84',
        2,
        initFrontGirl.name[0],
        fontMono
      );
      ctx.fillStyle = '#212047';
      fillTextFit(
        ctx,
        `0-10分 ${initFrontGirl.name}`,
        frontPillX + 175,
        currentY + 36,
        92,
        800,
        14,
        fontSans
      );
    }

    if (after10FrontGirl) {
      drawCircularAvatarOnCanvas(
        ctx,
        avatarCache.get(after10FrontGirl.id),
        frontPillX + 286,
        currentY + 36,
        14,
        '#212047',
        2,
        after10FrontGirl.name[0],
        fontMono
      );
      ctx.fillStyle = '#212047';
      fillTextFit(
        ctx,
        `破10分 ${after10FrontGirl.name}`,
        frontPillX + 305,
        currentY + 36,
        95,
        800,
        14,
        fontSans
      );
    }

    // Full-Width Visual Radar Box (904px wide!)
    const radarX = 88;
    const radarY = currentY + 66;
    const radarW = W - 176; // 904px
    const radarH = 262;

    drawRoundedRect(ctx, radarX, radarY, radarW, radarH, 22);
    ctx.fillStyle = '#181736';
    ctx.fill();
    ctx.strokeStyle = 'rgba(94, 203, 192, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Top 3 Zone Header Strip inside Radar (Left C | Center B | Right A)
    const zHeaderY = radarY + 10;
    const zColW = (radarW - 32) / 3;
    const zItems: { id: AceZoneId; text: string }[] = [
      { id: 'C', text: '◀ 左手邊：2F C 區 (23→1號)' },
      { id: 'B', text: '正中央：2F B 區 (23→1號)' },
      { id: 'A', text: '右手邊：2F A 區 (23→1號) ▶' },
    ];
    zItems.forEach((z, zIdx) => {
      const zx = radarX + 12 + zIdx * (zColW + 4);
      const isGirlZ = comp.initial.girlZone === z.id;
      const isUserZ = userZone === z.id;
      drawRoundedRect(ctx, zx, zHeaderY, zColW, 28, 8);
      ctx.fillStyle = isGirlZ
        ? 'rgba(91, 174, 132, 0.32)'
        : isUserZ
          ? 'rgba(255, 255, 255, 0.14)'
          : 'rgba(255, 255, 255, 0.05)';
      ctx.fill();
      ctx.fillStyle = isGirlZ ? '#7ADAD0' : 'rgba(255,255,255,0.65)';
      ctx.textAlign = 'center';
      fillTextFit(
        ctx,
        z.text,
        zx + zColW / 2,
        zHeaderY + 14,
        zColW - 16,
        800,
        14,
        fontMono
      );
    });
    ctx.textAlign = 'left';

    // Zone Dividers (C | B | A)
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([5, 5]);
    [1 / 3, 2 / 3].forEach((ratio) => {
      const dx = radarX + radarW * ratio;
      ctx.beginPath();
      ctx.moveTo(dx, radarY + 42);
      ctx.lineTo(dx, radarY + radarH - 12);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // Stage Line & Audience Line
    const stageY = radarY + 104;
    const audY = radarY + 216;

    ctx.strokeStyle = 'rgba(94,203,192,0.38)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(radarX + 20, stageY);
    ctx.lineTo(radarX + radarW - 20, stageY);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255,255,255,0.22)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(radarX + 20, audY);
    ctx.lineTo(radarX + radarW - 20, audY);
    ctx.stroke();

    // User & Oshi X coordinates
    const uPx = radarX + toRadarNorm(userGlobal) * radarW;
    const fovLeftPx =
      radarX + toRadarNorm(Math.min(69, userGlobal + 12)) * radarW;
    const fovRightPx =
      radarX + toRadarNorm(Math.max(1, userGlobal - 12)) * radarW;

    // Upward ±12 Seat Camera Cone
    const coneGrad = ctx.createLinearGradient(0, audY, 0, stageY);
    coneGrad.addColorStop(0, 'rgba(94, 203, 192, 0.34)');
    coneGrad.addColorStop(1, 'rgba(94, 203, 192, 0.04)');
    ctx.fillStyle = coneGrad;
    ctx.beginPath();
    ctx.moveTo(uPx, audY);
    ctx.lineTo(fovLeftPx, stageY);
    ctx.lineTo(fovRightPx, stageY);
    ctx.closePath();
    ctx.fill();

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
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(uPx, audY - 14);
    ctx.lineTo(initPx, stageY + 18);
    ctx.stroke();

    // Sightline 2: >10 pts (Solid Cyan or Amber)
    ctx.setLineDash([]);
    ctx.strokeStyle = comp.after10.isWithin12Seats ? '#5ECBC0' : '#FBBF24';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(uPx, audY - 14);
    ctx.lineTo(after10Px, stageY + 18);
    ctx.stroke();

    // Format concise relative seat labels (No "建議移至" text!)
    const fmtRel = (offset: number, within12: boolean) => {
      const dir =
        offset === 0
          ? '▲正前0席'
          : offset < 0
            ? `◀左前${Math.abs(offset)}席`
            : `右前${offset}席▶`;
      return `${dir}·${within12 ? '好拍' : '逾12席'}`;
    };

    // Draw Oshi Circular Avatar #1 at 0-10 pts Position (stageY - 14)
    const clampInitPx = Math.max(
      radarX + 82,
      Math.min(radarX + radarW - 82, initPx)
    );
    const clampAfterPx = Math.max(
      radarX + 86,
      Math.min(radarX + radarW - 86, after10Px)
    );

    // Ensure the two pills don't overlap horizontally if they are close
    let adjInitPx = clampInitPx;
    let adjAfterPx = clampAfterPx;
    if (Math.abs(adjAfterPx - adjInitPx) < 156) {
      if (adjInitPx <= adjAfterPx) {
        adjInitPx = Math.max(radarX + 78, adjAfterPx - 158);
      } else {
        adjInitPx = Math.min(radarX + radarW - 78, adjAfterPx + 158);
      }
    }

    // 0-10 pts Avatar Pin
    drawCircularAvatarOnCanvas(
      ctx,
      oshiAvatar,
      adjInitPx,
      stageY - 22,
      22,
      '#5BAE84',
      3,
      member.name[0],
      fontMono
    );
    drawRoundedRect(ctx, adjInitPx - 72, stageY + 4, 144, 24, 12);
    ctx.fillStyle = '#5BAE84';
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    fillTextFit(
      ctx,
      `0-10分:${comp.initial.girlZone}${comp.initial.girlCoreSeat} (${fmtRel(comp.initial.signedSeatOffset, comp.initial.isWithin12Seats)})`,
      adjInitPx,
      stageY + 16,
      136,
      800,
      12,
      fontMono
    );

    // >10 pts Avatar Pin (Main Segment)
    drawCircularAvatarOnCanvas(
      ctx,
      oshiAvatar,
      adjAfterPx,
      stageY - 24,
      25,
      comp.after10.isWithin12Seats ? '#5ECBC0' : '#FBBF24',
      4,
      member.name[0],
      fontMono
    );
    drawRoundedRect(ctx, adjAfterPx - 76, stageY + 4, 152, 26, 13);
    ctx.fillStyle = comp.after10.isWithin12Seats ? '#5ECBC0' : '#FBBF24';
    ctx.fill();
    ctx.fillStyle = '#212047';
    fillTextFit(
      ctx,
      `★破10分:${comp.after10.girlZone}${comp.after10.girlCoreSeat} (${fmtRel(comp.after10.signedSeatOffset, comp.after10.isWithin12Seats)})`,
      adjAfterPx,
      stageY + 17,
      144,
      900,
      12,
      fontMono
    );

    // Draw User Fixed Seat Pin at Bottom Audience Line (audY)
    const clampUserPx = Math.max(
      radarX + 90,
      Math.min(radarX + radarW - 90, uPx)
    );
    drawRoundedRect(ctx, clampUserPx - 82, audY - 15, 164, 30, 15);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.strokeStyle = '#5ECBC0';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.fillStyle = '#212047';
    fillTextFit(
      ctx,
      `▲ 你的座位：${userZone} 區 ${userSeat} 號`,
      clampUserPx,
      audY,
      150,
      900,
      14,
      fontMono
    );
    ctx.textAlign = 'left';

    currentY += cardH + 16;
  });

  // 5. Concise Visual Legend Footer
  ctx.fillStyle = '#7ADAD0';
  fillTextFit(
    ctx,
    '■ 實線＋青框頭像：破 10 分主力站位（佔 60% 時間）  ■ 虛線＋綠框頭像：0–10 分開局站位  ■ 扇形：你的座位 ±12 席好拍射程',
    64,
    H - 70,
    W - 128,
    700,
    18,
    fontSans
  );

  ctx.fillStyle = 'rgba(255,255,255,0.58)';
  fillTextFit(
    ctx,
    '※ 粉絲自製非官方應援攻略圖（依官方 IG 站位表推算），現場實際站位與座椅編號請以官方公告為準。',
    64,
    H - 42,
    W - 128,
    600,
    16,
    fontSans
  );

  return canvas.toDataURL('image/png');
}

/**
 * 模式 2：想要使用換位子 -> 生成「最佳換位區間＆跨區互看圖解版」PNG
 * 特點：
 * 1. 頂部與各局 23 席座位尺規上方直接繪製成員圓形頭像與換位箭頭
 * 2. 捨棄冗長文字框，改以「頭像站位區間圖解 ＋ 23→1 尺規 ＋ 跨區互看標籤」直覺呈現
 */
async function renderZoneHoppingCardToDataUrl(
  member: AceVivaMember,
  schedule: MatchStationSchedule,
  recs: GirlSetZoneRecommendation[],
  topCross?: CrossZoneGoldenInterval
): Promise<string> {
  const W = 1080;
  const H = 1520;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const fontSans =
    '"Plus Jakarta Sans", "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif';
  const fontMono = '"JetBrains Mono", "Noto Sans TC", monospace';

  const oshiAvatar = await loadMemberAvatarImage(member);

  drawCardShellAndAvatar(
    ctx,
    W,
    H,
    '2. 局間換位 · 最佳區間＆跨區圖解卡',
    schedule,
    member,
    oshiAvatar,
    fontMono
  );

  const heroY = 114;
  const infoX = 278;
  const pillW = W - 64 - 28 - infoX;

  ctx.fillStyle = '#7ADAD0';
  fillTextFit(
    ctx,
    `局間換位與跨區圖解 · 背號 #${member.number} · @${member.instagramHandle}`,
    infoX,
    heroY + 38,
    pillW,
    800,
    19,
    fontMono
  );

  ctx.fillStyle = '#FFFFFF';
  fillTextFit(
    ctx,
    `${member.name}${member.realOrAltName ? `（${member.realOrAltName}）` : ''} 換位攻略`,
    infoX,
    heroY + 86,
    pillW,
    900,
    40,
    fontSans
  );

  // Concise Visual Summary Pills
  const topRec = recs[0];
  if (topRec) {
    const pill1Y = heroY + 122;
    drawRoundedRect(ctx, infoX, pill1Y, pillW, 40, 12);
    ctx.fillStyle = 'rgba(91, 174, 132, 0.28)';
    ctx.fill();
    ctx.strokeStyle = '#5ECBC0';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#5ECBC0';
    fillTextFit(
      ctx,
      `★ 單區首選：2F ${topRec.zone} 區 ${topRec.sweetSpotRange[0]}–${topRec.sweetSpotRange[1]} 號（破 10 分 C 位：${topRec.after10CoreSeats}）`,
      infoX + 16,
      pill1Y + 20,
      pillW - 32,
      800,
      19,
      fontSans
    );
  }

  if (topCross) {
    const pill2Y = heroY + 170;
    drawRoundedRect(ctx, infoX, pill2Y, pillW, 38, 12);
    ctx.fillStyle = 'rgba(25, 24, 56, 0.9)';
    ctx.fill();
    ctx.strokeStyle = '#7ADAD0';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    fillTextFit(
      ctx,
      `↔ 跨區免換位黃金帶：${topCross.combinedRangeLabel}（兼顧 ${topCross.coveredSetsLabel}）`,
      infoX + 16,
      pill2Y + 19,
      pillW - 32,
      800,
      18,
      fontSans
    );
  }

  // 4. Three Set Visual Diagram Cards (Set 1&4, Set 2&5, Set 3)
  let currentY = 358;
  const cardH = 344;

  recs.forEach((rec, index) => {
    const isPrimary = index === 0;
    const crossGuide = getExplicitCrossZoneGuide(rec);

    drawRoundedRect(ctx, 64, currentY, W - 128, cardH, 28);
    ctx.fillStyle = isPrimary ? '#F4FAF8' : '#EBF6F3';
    ctx.fill();
    ctx.strokeStyle = isPrimary ? '#5BAE84' : 'rgba(33,32,71,0.18)';
    ctx.lineWidth = isPrimary ? 3.5 : 2;
    ctx.stroke();

    // Top Row: Set Badge + Best Interval Pill + Target Zone Pill
    const setBadgeX = 88;
    const setBadgeW = 216;
    drawRoundedRect(ctx, setBadgeX, currentY + 16, setBadgeW, 40, 20);
    ctx.fillStyle = '#212047';
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    fillTextFit(
      ctx,
      rec.setLabel,
      setBadgeX + setBadgeW / 2,
      currentY + 36,
      setBadgeW - 20,
      900,
      20,
      fontSans
    );

    // Best Interval Callout Pill in Center
    drawRoundedRect(ctx, 318, currentY + 16, 400, 40, 20);
    ctx.fillStyle = '#D5EFE9';
    ctx.fill();
    ctx.strokeStyle = '#5BAE84';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#212047';
    fillTextFit(
      ctx,
      `★ 最佳換位區間：${rec.zone} 區 ${rec.sweetSpotRange[0]}–${rec.sweetSpotRange[1]} 號`,
      318 + 200,
      currentY + 36,
      376,
      900,
      20,
      fontSans
    );

    // Target Zone Pill on Right
    const zonePillW = 240;
    const zonePillX = W - 64 - 24 - zonePillW;
    drawRoundedRect(ctx, zonePillX, currentY + 16, zonePillW, 40, 20);
    ctx.fillStyle = '#212047';
    ctx.fill();
    ctx.fillStyle = '#5ECBC0';
    fillTextFit(
      ctx,
      `應援區：2F ${rec.zone} 區`,
      zonePillX + zonePillW / 2,
      currentY + 36,
      zonePillW - 24,
      900,
      20,
      fontSans
    );
    ctx.textAlign = 'left';

    // Visual Stage + 23->1 Ruler Diagram Box
    const diagX = 88;
    const diagY = currentY + 68;
    const diagW = W - 176; // 904px
    const diagH = 212;

    drawRoundedRect(ctx, diagX, diagY, diagW, diagH, 22);
    ctx.fillStyle = '#181736';
    ctx.fill();
    ctx.strokeStyle = 'rgba(94,203,192,0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Calculate X positions on the 23 -> 1 ruler (idx 0 = seat 23 on left, idx 22 = seat 1 on right)
    const rulerPadX = 18;
    const totalRulerW = diagW - rulerPadX * 2;
    const seatBoxW = (totalRulerW - 22 * 4) / 23;
    const seatCenterX = (sNum: number) => {
      const idx = 23 - sNum;
      return diagX + rulerPadX + idx * (seatBoxW + 4) + seatBoxW / 2;
    };

    const initMidSeat =
      (rec.initialSeatRange[0] + rec.initialSeatRange[1]) / 2;
    const after10MidSeat =
      (rec.after10SeatRange[0] + rec.after10SeatRange[1]) / 2;

    const initCx = seatCenterX(initMidSeat);
    const after10Cx = seatCenterX(after10MidSeat);
    const avatarY = diagY + 46;

    // Draw Shift Arrow between 0-10 pts Avatar and >10 pts Avatar
    const dirSign = after10Cx >= initCx ? 1 : -1;
    const arrowStartX = initCx + dirSign * 34;
    const arrowEndX = after10Cx - dirSign * 38;

    ctx.strokeStyle = '#7ADAD0';
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(arrowStartX, avatarY);
    ctx.lineTo(arrowEndX, avatarY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Arrowhead
    ctx.fillStyle = '#7ADAD0';
    ctx.beginPath();
    ctx.moveTo(arrowEndX, avatarY);
    ctx.lineTo(arrowEndX - dirSign * 10, avatarY - 6);
    ctx.lineTo(arrowEndX - dirSign * 10, avatarY + 6);
    ctx.closePath();
    ctx.fill();

    // Shift Label in Middle of Arrow
    const midArrowX = (initCx + after10Cx) / 2;
    drawRoundedRect(ctx, midArrowX - 52, avatarY - 13, 104, 24, 12);
    ctx.fillStyle = '#212047';
    ctx.fill();
    ctx.strokeStyle = 'rgba(122,218,208,0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#7ADAD0';
    ctx.textAlign = 'center';
    fillTextFit(ctx, '破10分換位', midArrowX, avatarY - 1, 92, 800, 12, fontMono);

    // Draw 0-10 pts Oshi Avatar & Pill
    drawCircularAvatarOnCanvas(
      ctx,
      oshiAvatar,
      initCx,
      avatarY,
      24,
      '#5BAE84',
      3.5,
      member.name[0],
      fontMono
    );
    drawRoundedRect(ctx, initCx - 82, avatarY + 28, 164, 26, 13);
    ctx.fillStyle = '#5BAE84';
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    fillTextFit(
      ctx,
      `0-10分：${rec.zone}區 ${rec.initialSeatRange[0]}–${rec.initialSeatRange[1]}號`,
      initCx,
      avatarY + 41,
      152,
      800,
      13,
      fontMono
    );

    // Draw >10 pts Oshi Avatar & Pill (Main Segment)
    drawCircularAvatarOnCanvas(
      ctx,
      oshiAvatar,
      after10Cx,
      avatarY,
      27,
      '#5ECBC0',
      4,
      member.name[0],
      fontMono
    );
    drawRoundedRect(ctx, after10Cx - 98, avatarY + 28, 196, 26, 13);
    ctx.fillStyle = '#5ECBC0';
    ctx.fill();
    ctx.fillStyle = '#212047';
    fillTextFit(
      ctx,
      `★破10分：${rec.zone}區 ${rec.after10SeatRange[0]}–${rec.after10SeatRange[1]}號(C位${rec.after10CoreSeats})`,
      after10Cx,
      avatarY + 41,
      184,
      900,
      13,
      fontMono
    );
    ctx.textAlign = 'left';

    // Draw 23 -> 1 Seat Ruler (Audience First-Person: Left = 23, Right = 1)
    const rulerY = diagY + 114;
    for (let idx = 0; idx < 23; idx++) {
      const sNum = 23 - idx;
      const sx = diagX + rulerPadX + idx * (seatBoxW + 4);
      const inInit =
        sNum >= rec.initialSeatRange[0] && sNum <= rec.initialSeatRange[1];
      const inAfter10 =
        sNum >= rec.after10SeatRange[0] && sNum <= rec.after10SeatRange[1];
      const inSweet =
        sNum >= rec.sweetSpotRange[0] && sNum <= rec.sweetSpotRange[1];

      drawRoundedRect(ctx, sx, rulerY, seatBoxW, 52, 9);
      if (inAfter10) {
        ctx.fillStyle = '#5ECBC0';
        ctx.fill();
      } else if (inInit) {
        ctx.fillStyle = '#5BAE84';
        ctx.fill();
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fill();
      }

      if (inSweet) {
        ctx.strokeStyle = '#FBBF24';
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      ctx.fillStyle = inAfter10
        ? '#212047'
        : inInit
          ? '#FFFFFF'
          : 'rgba(255,255,255,0.4)';
      ctx.font = `900 17px ${fontMono}`;
      ctx.textAlign = 'center';
      ctx.fillText(String(sNum), sx + seatBoxW / 2, rulerY + 26);
      ctx.textAlign = 'left';
    }

    // Sweet-Spot Golden Bracket Label below Ruler
    const sweetLeftX =
      seatCenterX(rec.sweetSpotRange[1]) - seatBoxW / 2;
    const sweetRightX =
      seatCenterX(rec.sweetSpotRange[0]) + seatBoxW / 2;
    const sweetMidX = (sweetLeftX + sweetRightX) / 2;

    ctx.strokeStyle = '#FBBF24';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(sweetLeftX, rulerY + 58);
    ctx.lineTo(sweetLeftX, rulerY + 65);
    ctx.lineTo(sweetRightX, rulerY + 65);
    ctx.lineTo(sweetRightX, rulerY + 58);
    ctx.stroke();

    drawRoundedRect(ctx, sweetMidX - 110, rulerY + 68, 220, 22, 11);
    ctx.fillStyle = '#FBBF24';
    ctx.fill();
    ctx.fillStyle = '#212047';
    ctx.textAlign = 'center';
    fillTextFit(
      ctx,
      `★ 黃金區間 ${rec.sweetSpotRange[0]}–${rec.sweetSpotRange[1]} 號`,
      sweetMidX,
      rulerY + 79,
      204,
      900,
      13,
      fontMono
    );
    ctx.textAlign = 'left';

    // Bottom 1-Line Orientation & Cross-Zone Visual Strip inside Card
    const footY = currentY + 292;
    ctx.fillStyle = '#3F8E67';
    fillTextFit(
      ctx,
      `◀ 左手邊 ${rec.zone}23${rec.zone === 'A' ? ' (接 B1)' : rec.zone === 'B' ? ' (接 C1)' : ''}`,
      92,
      footY + 20,
      220,
      800,
      15,
      fontMono
    );

    if (crossGuide.shortCrossBadge) {
      drawRoundedRect(ctx, 300, footY + 4, 480, 32, 16);
      ctx.fillStyle = '#212047';
      ctx.fill();
      ctx.fillStyle = '#7ADAD0';
      ctx.textAlign = 'center';
      fillTextFit(
        ctx,
        crossGuide.shortCrossBadge,
        300 + 240,
        footY + 20,
        456,
        800,
        15,
        fontSans
      );
      ctx.textAlign = 'left';
    }

    ctx.fillStyle = '#3F8E67';
    ctx.textAlign = 'right';
    fillTextFit(
      ctx,
      `${rec.zone === 'C' ? '(接 B23) ' : rec.zone === 'B' ? '(接 A23) ' : ''}右手邊 ${rec.zone}1 ▶`,
      W - 92,
      footY + 20,
      220,
      800,
      15,
      fontMono
    );
    ctx.textAlign = 'left';

    currentY += cardH + 16;
  });

  // 5. Concise Visual Legend Footer
  ctx.fillStyle = '#7ADAD0';
  fillTextFit(
    ctx,
    '■ 青色席：破 10 分主力正對席（佔 60% 時間）  ■ 綠色席：0–10 分開局席  ■ 黃框：免換位／最佳換位黃金區間',
    64,
    H - 70,
    W - 128,
    700,
    18,
    fontSans
  );

  ctx.fillStyle = 'rgba(255,255,255,0.58)';
  fillTextFit(
    ctx,
    '※ 粉絲自製非官方應援攻略圖（依官方 IG 站位表推算），現場實際站位與座椅編號請以官方公告為準。',
    64,
    H - 42,
    W - 128,
    600,
    16,
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
      ACTIVE_STATION_ROTATION_SCHEDULES.find(
        (s) => s.matchId === selectedMatchId
      ) ?? CLOSEST_STATION_SCHEDULE,
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
              <span className="font-mono-num text-[10px] font-extrabold tracking-[0.15em] text-[#3F8E67] sm:text-xs">
                主推圖解攻略卡產生器
              </span>
              <h3 className="text-lg font-black text-[#212047] sm:text-2xl">
                {activeGirl.name}（#{activeGirl.number}）專屬視角圖解卡
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

          {/* 2-Mode Selector */}
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
                鎖定固定座位（{userZone} 區 {userSeat} 號），於雷達圖標示主推頭像位置與正前方女孩。
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
                2. 想要使用換位子：推薦最佳換位區間（含跨區圖解）
              </div>
              <p
                className={`mt-0.5 text-[11px] leading-snug ${
                  cardMode === 'zone_hopping'
                    ? 'text-white/75'
                    : 'text-[#212047]/65'
                }`}
              >
                以 23→1 尺規與成員頭像圖解每局最佳區間及跨區互看位置。
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
              {ACTIVE_STATION_ROTATION_SCHEDULES.map((sched, idx) => {
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
                    {idx === 0 ? '★ 最接近 · ' : ''}
                    {sched.dayLabel}（對戰 {sched.opponent}）
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
                  : `下載「${activeGirl.name} 最佳換位圖解卡」↓`}
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
