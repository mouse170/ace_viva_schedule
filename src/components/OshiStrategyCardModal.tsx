import React, { useEffect, useMemo, useState } from 'react';
import { MEMBERS, type AceVivaMember } from '../data/members';
import {
  STATION_ROTATION_SCHEDULES,
  getGirlSeatRecommendations,
  getCrossZoneGoldenIntervals,
  type GirlSetZoneRecommendation,
  type CrossZoneGoldenInterval,
  type MatchStationSchedule,
} from '../data/schedule';

interface OshiStrategyCardModalProps {
  isOpen: boolean;
  initialGirlId: string;
  initialMatchId: string;
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
  minFontSize = 13
) {
  let size = initialFontSize;
  ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
  while (ctx.measureText(text).width > maxWidth && size > minFontSize) {
    size -= 1;
    ctx.font = `${fontWeight} ${size}px ${fontFamily}`;
  }
  ctx.fillText(text, x, y, maxWidth);
}

function getShortSweetSpotNote(rec: GirlSetZoneRecommendation): {
  mainRangeText: string;
  subNoteText: string;
} {
  const mainRangeText = `${rec.zone} 區 ${rec.sweetSpotRange[0]}–${rec.sweetSpotRange[1]} 號`;
  if (rec.crossZoneOption) {
    return {
      mainRangeText,
      subNoteText: `跨區鄰接：${rec.crossZoneOption.adjacentZone} 區 ${rec.crossZoneOption.adjacentSeatRange[0]}–${rec.crossZoneOption.adjacentSeatRange[1]} 號`,
    };
  }
  if (
    (rec.initialSlotIndex === 0 && rec.after10SlotIndex === 1) ||
    (rec.initialSlotIndex === 1 && rec.after10SlotIndex === 0)
  ) {
    return {
      mainRangeText,
      subNoteText: '交界黃金核心：7–11 號席',
    };
  }
  if (
    (rec.initialSlotIndex === 1 && rec.after10SlotIndex === 2) ||
    (rec.initialSlotIndex === 2 && rec.after10SlotIndex === 1)
  ) {
    return {
      mainRangeText,
      subNoteText: '交界黃金核心：14–17 號席',
    };
  }
  return {
    mainRangeText,
    subNoteText: `決勝主力核心：${rec.after10CoreSeats}`,
  };
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

async function renderStrategyCardToDataUrl(
  member: AceVivaMember,
  schedule: MatchStationSchedule,
  recs: GirlSetZoneRecommendation[],
  topCross?: CrossZoneGoldenInterval
): Promise<string> {
  const W = 1080;
  const H = 1590;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const fontSans =
    '"Plus Jakarta Sans", "Noto Sans TC", "PingFang TC", "Microsoft JhengHei", sans-serif';
  const fontMono = '"JetBrains Mono", "Noto Sans TC", monospace';

  // 1. Background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#191838');
  bgGrad.addColorStop(0.32, '#212047');
  bgGrad.addColorStop(1, '#15142E');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Decorative mint glow
  const glowGrad = ctx.createRadialGradient(W * 0.82, 180, 20, W * 0.82, 180, 420);
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
  drawRoundedRect(ctx, 64, 58, 430, 44, 22);
  ctx.fillStyle = '#5BAE84';
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  fillTextFit(
    ctx,
    'ACE VIVA · 主推全場換位拍攝攻略卡',
    64 + 215,
    80,
    396,
    800,
    20,
    fontMono
  );
  ctx.textAlign = 'left';

  // Match Date Pill on Right
  const matchBadgeText = `${schedule.dateLabel} vs ${schedule.opponent}`;
  ctx.font = `800 21px ${fontMono}`;
  const mTextW = Math.min(ctx.measureText(matchBadgeText).width, 440);
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

  // 3. Hero Profile Banner
  const heroY = 122;
  const heroH = 252;
  drawRoundedRect(ctx, 64, heroY, W - 128, heroH, 32);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(94, 203, 192, 0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Load & Draw Member Avatar (Face-centered crop)
  const avatarImg = await loadImage(member.localImagePath);
  const avatarX = 96;
  const avatarY = heroY + 42;
  const avatarSize = 168;

  ctx.save();
  ctx.beginPath();
  ctx.arc(
    avatarX + avatarSize / 2,
    avatarY + avatarSize / 2,
    avatarSize / 2,
    0,
    Math.PI * 2
  );
  ctx.closePath();
  ctx.clip();

  if (avatarImg) {
    // Crop top-center (face area)
    const sWidth = avatarImg.width * 0.72;
    const sHeight = sWidth;
    const sx = (avatarImg.width - sWidth) / 2;
    const sy = avatarImg.height * 0.04;
    ctx.drawImage(
      avatarImg,
      sx,
      sy,
      sWidth,
      sHeight,
      avatarX,
      avatarY,
      avatarSize,
      avatarSize
    );
  } else {
    ctx.fillStyle = '#5BAE84';
    ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);
  }
  ctx.restore();

  // Avatar Ring
  ctx.beginPath();
  ctx.arc(
    avatarX + avatarSize / 2,
    avatarY + avatarSize / 2,
    avatarSize / 2 + 3,
    0,
    Math.PI * 2
  );
  ctx.strokeStyle = '#5ECBC0';
  ctx.lineWidth = 5;
  ctx.stroke();

  // Member Name & Metadata (Well-spaced above recommendation pills)
  const infoX = 292;
  const pillW = W - 64 - 28 - infoX; // 696px

  ctx.fillStyle = '#7ADAD0';
  fillTextFit(
    ctx,
    `TARGET OSHI · 背號 #${member.number} · @${member.instagramHandle}`,
    infoX,
    heroY + 38,
    pillW,
    800,
    21,
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

  // Primary Ticket & Cross-Zone Golden Interval Pills (Guaranteed Fit within pillW)
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
    const crossText = `↔ 跨區免換位黃金帶：${topCross.combinedRangeLabel}（兼顧 ${topCross.coveredSetsLabel}）`;
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

  // 4. Mini Audience-Perspective Arena Orientation Strip (Facing the Court: Left = C, Center = B, Right = A)
  const mapY = 394;
  drawRoundedRect(ctx, 64, mapY, W - 128, 126, 24);
  ctx.fillStyle = '#14132D';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#7ADAD0';
  fillTextFit(
    ctx,
    '▲ 觀眾面向球場視角方位（觀眾在下方往前看球場 ▲ · 左手邊 C 區 23 號 ◀ ↔ ▶ 右手邊 A 區 1 號）',
    90,
    mapY + 29,
    W - 180,
    800,
    20,
    fontSans
  );

  const audienceZones: { id: 'C' | 'B' | 'A'; label: string }[] = [
    { id: 'C', label: '◀ 左手邊：2F C 區' },
    { id: 'B', label: '正中央：2F B 區' },
    { id: 'A', label: '右手邊：2F A 區 ▶' },
  ];
  const zoneBoxW = (W - 128 - 52 - 24) / 3;
  audienceZones.forEach((zItem, idx) => {
    const zx = 90 + idx * (zoneBoxW + 12);
    const zy = mapY + 52;
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
    fillTextFit(ctx, zItem.label, zx + 14, zy + 27, zoneBoxW - 135, 800, 19, fontSans);

    if (recForZone) {
      ctx.fillStyle = '#7ADAD0';
      ctx.textAlign = 'right';
      fillTextFit(
        ctx,
        `(${recForZone.setShortLabel})`,
        zx + zoneBoxW - 14,
        zy + 27,
        120,
        700,
        17,
        fontMono
      );
      ctx.textAlign = 'left';
    }
  });

  // 5. Three Set Cards (Set 1&4, Set 2&5, Set 3)
  let currentY = 542;
  const cardH = 294;

  recs.forEach((rec, index) => {
    const isPrimary = index === 0;
    drawRoundedRect(ctx, 64, currentY, W - 128, cardH, 28);
    ctx.fillStyle = isPrimary ? '#F4FAF8' : '#EBF6F3';
    ctx.fill();
    ctx.strokeStyle = isPrimary ? '#5BAE84' : 'rgba(33,32,71,0.15)';
    ctx.lineWidth = isPrimary ? 4 : 2;
    ctx.stroke();

    // Set Badge (Centered text)
    const setBadgeX = 92;
    const setBadgeW = 236;
    drawRoundedRect(ctx, setBadgeX, currentY + 22, setBadgeW, 44, 22);
    ctx.fillStyle = isPrimary ? '#212047' : '#3F8E67';
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    fillTextFit(
      ctx,
      rec.setLabel,
      setBadgeX + setBadgeW / 2,
      currentY + 44,
      setBadgeW - 24,
      900,
      22,
      fontSans
    );
    ctx.textAlign = 'left';

    // Priority Label (Constrained width so it never collides with right pill)
    ctx.fillStyle = '#3F8E67';
    fillTextFit(
      ctx,
      rec.priorityBadge,
      344,
      currentY + 44,
      380,
      800,
      21,
      fontSans
    );

    // Zone Pill on Right (Centered text)
    const zonePillW = 246;
    const zonePillX = W - 64 - 28 - zonePillW;
    drawRoundedRect(ctx, zonePillX, currentY + 20, zonePillW, 48, 24);
    ctx.fillStyle = '#212047';
    ctx.fill();
    ctx.fillStyle = '#5ECBC0';
    ctx.textAlign = 'center';
    fillTextFit(
      ctx,
      `應援區：2F ${rec.zone} 區`,
      zonePillX + zonePillW / 2,
      currentY + 44,
      zonePillW - 24,
      900,
      23,
      fontSans
    );
    ctx.textAlign = 'left';

    // 3 Columns: 0-10 pts | >10 pts | Sweet Spot & Cross-Zone
    const colY = currentY + 84;
    const colW = (W - 128 - 56 - 28) / 3; // 289.3px
    const colInnerW = colW - 32;

    // Col 1: 0-10 pts
    drawRoundedRect(ctx, 92, colY, colW, 106, 18);
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
    drawRoundedRect(ctx, col2X, colY, colW, 106, 18);
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

    // Col 3: Full Set Sweet Spot & Cross-Zone Adjacent Option (Clean 3-line structure, never overflows)
    const col3X = col2X + colW + 14;
    drawRoundedRect(ctx, col3X, colY, colW, 106, 18);
    ctx.fillStyle = '#D5EFE9';
    ctx.fill();
    ctx.strokeStyle = '#5BAE84';
    ctx.lineWidth = 2;
    ctx.stroke();

    const sweetNote = getShortSweetSpotNote(rec);

    ctx.fillStyle = '#212047';
    fillTextFit(
      ctx,
      rec.crossZoneOption ? '整局黃金帶 ＆ 跨區鄰接' : '整局免換位黃金帶',
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
      sweetNote.mainRangeText,
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
      sweetNote.subNoteText,
      col3X + 16,
      colY + 88,
      colInnerW,
      700,
      17,
      fontSans
    );

    // 23 -> 1 Single-Line Seat Ruler Bar (Audience First-Person Order: Left 23 -> Right 1)
    const rulerY = currentY + 210;
    const totalRulerW = W - 128 - 56;
    const seatBoxW = (totalRulerW - 22 * 4) / 23;

    for (let idx = 0; idx < 23; idx++) {
      const sNum = 23 - idx;
      const sx = 92 + idx * (seatBoxW + 4);
      const inInit =
        sNum >= rec.initialSeatRange[0] && sNum <= rec.initialSeatRange[1];
      const inAfter10 =
        sNum >= rec.after10SeatRange[0] && sNum <= rec.after10SeatRange[1];

      drawRoundedRect(ctx, sx, rulerY, seatBoxW, 56, 10);
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
      ctx.fillText(String(sNum), sx + seatBoxW / 2, rulerY + 28);
      ctx.textAlign = 'left';
    }

    currentY += cardH + 20;
  });

  // 6. Footer Legend & Disclaimer
  ctx.fillStyle = '#7ADAD0';
  fillTextFit(
    ctx,
    '■ 深藍：破 10 分主力席（佔 60% 時間）  ■ 綠：開局 0–10 分正對席  ◀ 尺規為觀眾面向球場視角：左 23 號 → 右 1 號 ▶',
    64,
    H - 78,
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
    H - 48,
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
  onClose,
}) => {
  const [selectedMatchId, setSelectedMatchId] =
    useState<string>(initialMatchId);
  const [selectedGirlId, setSelectedGirlId] = useState<string>(initialGirlId);
  const [imageDataUrl, setImageDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  useEffect(() => {
    setSelectedGirlId(initialGirlId);
  }, [initialGirlId]);

  useEffect(() => {
    setSelectedMatchId(initialMatchId);
  }, [initialMatchId]);

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

    renderStrategyCardToDataUrl(
      activeGirl,
      currentSchedule,
      recommendations,
      topCrossZone
    ).then((url) => {
      if (!cancelled) {
        setImageDataUrl(url);
        setIsGenerating(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isOpen, activeGirl, currentSchedule, recommendations, topCrossZone]);

  if (!isOpen || !activeGirl) return null;

  const handleDownload = () => {
    if (!imageDataUrl) return;
    const link = document.createElement('a');
    link.href = imageDataUrl;
    link.download = `ACE_VIVA_${activeGirl.name}_${currentSchedule.matchId}_換位拍攝攻略卡.png`;
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
                OSHI SEAT STRATEGY GENERATOR · 主推換位攻略圖產生器
              </span>
              <h3 className="text-lg font-black text-[#212047] sm:text-2xl">
                {activeGirl.name}（#{activeGirl.number}）全場五局換位＆拍攝座位圖
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

          {/* Controls: Switch Match Day & Switch Oshi Girl */}
          <div className="mt-3.5 flex flex-col gap-2.5 rounded-2xl bg-[#F4FAF8] p-3 ring-1 ring-[#5BAE84]/30 sm:flex-row sm:items-center sm:justify-between">
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
          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[#212047] px-4 py-3 text-white">
            <span className="text-xs text-white/85 sm:text-sm">
              點擊右側按鈕下載高畫質 PNG，或於手機上<strong className="text-[#7ADAD0]">長按下方圖片儲存至相簿</strong>，方便局間換位隨時查看。
            </span>
            <button
              type="button"
              onClick={handleDownload}
              disabled={isGenerating || !imageDataUrl}
              className="shrink-0 rounded-full bg-[#5BAE84] px-4 py-2 text-xs font-black text-white shadow-md transition-transform hover:bg-[#4FA87D] active:scale-95 disabled:opacity-50 sm:text-sm"
            >
              {isGenerating ? '生成圖片中...' : '下載高畫質攻略圖 (PNG) ↓'}
            </button>
          </div>

          {/* Generated Image Preview */}
          <div className="mt-4 flex justify-center rounded-2xl bg-[#181736] p-2 ring-1 ring-[#212047]/15 sm:p-4">
            {imageDataUrl ? (
              <img
                src={imageDataUrl}
                alt={`${activeGirl.name} 視角攻略卡`}
                className="max-h-[62dvh] w-auto rounded-xl object-contain shadow-lg"
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
