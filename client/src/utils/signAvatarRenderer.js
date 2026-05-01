/**
 * signAvatarRenderer.js
 * Premium 2D canvas rendering for the sign language avatar.
 * ZOOMED IN mode: The character is zoomed in 1.8x, and the hands
 * are drawn oversized and extremely thick so the gestures are clear.
 */

// ── Color palette ───────────────────────────────────────────────────────────
const COLORS = {
  bg1: '#0d0f18',
  bg2: '#151829',
  skin: '#e8b88a',
  skinShadow: '#c9956a',
  skinHighlight: '#f5d4b3',
  body: '#6c63ff',
  bodyGlow: 'rgba(108, 99, 255, 0.35)',
  shirt: '#3b3680',
  shirtLight: '#4e48a8',
  head: '#e8b88a',
  hair: '#3d2b1f',
  eye: '#1e293b',
  nail: '#ffe8d6',
  text: '#e2e8f0',
  textBold: '#ffffff',
  muted: '#64748b',
  accent: '#10b981',
};

const FINGER_TIPS = [4, 8, 12, 16, 20];
const FINGER_LABELS = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'];
const FINGER_COLORS = ['#ff6b6b', '#ffa94d', '#ffd43b', '#69db7c', '#74c0fc'];

const FINGER_SEGMENTS = [
  [[0,1],[1,2],[2,3],[3,4]],
  [[0,5],[5,6],[6,7],[7,8]],
  [[0,9],[9,10],[10,11],[11,12]],
  [[0,13],[13,14],[14,15],[15,16]],
  [[0,17],[17,18],[18,19],[19,20]],
];

// Global zoom factor to make the character huge on screen
const ZOOM = 1.4;
// Y-offset to push the character down (so we see chest and head clearly)
const OFFSET_Y = 0.15;

export function clearCanvas(ctx, w, h) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, COLORS.bg1);
  grad.addColorStop(0.5, COLORS.bg2);
  grad.addColorStop(1, COLORS.bg1);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

/** 
 * Transform normalized MediaPipe coords into zoomed canvas pixels.
 * This makes the character much larger and easier to see.
 */
const getPoint = (pt, w, h) => {
  // Center horizontally, zoom in, and offset Y so the body fits well
  const cx = w / 2;
  const cy = h / 2;
  const dx = (pt.x - 0.5) * w * ZOOM;
  const dy = (pt.y - 0.5 + OFFSET_Y) * h * ZOOM;
  return { x: cx + dx, y: cy + dy };
};

export function drawBody(ctx, pose, w, h) {
  if (!pose || pose.length < 25) return;
  const p = (idx) => getPoint(pose[idx], w, h);

  // Torso
  const ls = p(11), rs = p(12), lh = p(23), rh = p(24);
  ctx.fillStyle = COLORS.shirt;
  ctx.shadowColor = COLORS.bodyGlow;
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.moveTo(ls.x, ls.y); ctx.lineTo(rs.x, rs.y);
  ctx.lineTo(rh.x, rh.y); ctx.lineTo(lh.x, lh.y);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = COLORS.shirtLight; ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.moveTo(ls.x+4,ls.y+4); ctx.lineTo((ls.x+rs.x)/2,ls.y+4);
  ctx.lineTo((lh.x+rh.x)/2,rh.y-4); ctx.lineTo(lh.x+4,lh.y-4);
  ctx.closePath(); ctx.fill();

  // Arms
  ctx.shadowColor = COLORS.bodyGlow; ctx.shadowBlur = 10;
  ctx.strokeStyle = COLORS.skin; ctx.lineWidth = 14 * ZOOM;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const le = p(13), lw = p(15), re = p(14), rw = p(16);
  ctx.beginPath(); ctx.moveTo(ls.x,ls.y); ctx.quadraticCurveTo(le.x,le.y,lw.x,lw.y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(rs.x,rs.y); ctx.quadraticCurveTo(re.x,re.y,rw.x,rw.y); ctx.stroke();
  ctx.strokeStyle = COLORS.skinShadow; ctx.lineWidth = 10 * ZOOM;
  ctx.beginPath(); ctx.moveTo(ls.x,ls.y); ctx.quadraticCurveTo(le.x,le.y,lw.x,lw.y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(rs.x,rs.y); ctx.quadraticCurveTo(re.x,re.y,rw.x,rw.y); ctx.stroke();

  // Elbows
  ctx.shadowBlur = 0; ctx.fillStyle = COLORS.skinHighlight;
  for (const pt of [le, re]) {
    ctx.beginPath(); ctx.arc(pt.x, pt.y, 8 * ZOOM, 0, Math.PI*2); ctx.fill();
  }

  // Head (zoomed)
  const nose = p(0);
  ctx.fillStyle = COLORS.hair; ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 15;
  ctx.beginPath(); ctx.arc(nose.x, nose.y - 25*ZOOM, 40*ZOOM, 0, Math.PI*2); ctx.fill();
  ctx.shadowBlur = 0; ctx.fillStyle = COLORS.head;
  ctx.beginPath(); ctx.arc(nose.x, nose.y - 20*ZOOM, 34*ZOOM, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = COLORS.skinHighlight;
  ctx.beginPath(); ctx.arc(nose.x - 6*ZOOM, nose.y - 28*ZOOM, 15*ZOOM, 0, Math.PI*2); ctx.fill();
  // Eyes
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.ellipse(nose.x - 12*ZOOM, nose.y - 25*ZOOM, 6*ZOOM, 5*ZOOM, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(nose.x + 12*ZOOM, nose.y - 25*ZOOM, 6*ZOOM, 5*ZOOM, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = COLORS.eye;
  ctx.beginPath(); ctx.arc(nose.x - 12*ZOOM, nose.y - 25*ZOOM, 3*ZOOM, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(nose.x + 12*ZOOM, nose.y - 25*ZOOM, 3*ZOOM, 0, Math.PI*2); ctx.fill();
  // Smile
  ctx.strokeStyle = COLORS.skinShadow; ctx.lineWidth = 2 * ZOOM;
  ctx.beginPath(); ctx.arc(nose.x, nose.y - 10*ZOOM, 12*ZOOM, 0.15*Math.PI, 0.85*Math.PI); ctx.stroke();
}

/**
 * Draws a hand with HUGE proportions (CARICATURE scaling).
 * The hand is scaled up massively relative to its own wrist so the gestures
 * are crystal clear and dominant on the screen.
 */
export function drawHand(ctx, hand, w, h, isRight = true) {
  if (!hand || hand.length < 21) return;
  
  // Base transform to canvas pixels (already zoomed for body)
  const basePoints = hand.map(pt => getPoint(pt, w, h));
  
  // Extra scale just for the hand relative to its wrist!
  // This makes the hands huge, cartoon-like, and very easy to read.
  const HAND_OVERSCALE = 1.3;
  const wristBase = basePoints[0];
  
  const p = (idx) => {
    const bp = basePoints[idx];
    return {
      x: wristBase.x + (bp.x - wristBase.x) * HAND_OVERSCALE,
      y: wristBase.y + (bp.y - wristBase.y) * HAND_OVERSCALE,
    };
  };

  // Palm
  const palmIdx = [0, 1, 5, 9, 13, 17];
  const palmPts = palmIdx.map(i => p(i));
  ctx.shadowColor = 'rgba(232,184,138,0.5)'; ctx.shadowBlur = 30;
  ctx.fillStyle = COLORS.skin;
  ctx.beginPath(); ctx.moveTo(palmPts[0].x, palmPts[0].y);
  for (let i=1;i<palmPts.length;i++) ctx.lineTo(palmPts[i].x, palmPts[i].y);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = COLORS.skinHighlight; ctx.globalAlpha = 0.4; ctx.fill();
  ctx.globalAlpha = 1; ctx.shadowBlur = 0;
  ctx.strokeStyle = COLORS.skinShadow; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(palmPts[0].x, palmPts[0].y);
  for (let i=1;i<palmPts.length;i++) ctx.lineTo(palmPts[i].x, palmPts[i].y);
  ctx.closePath(); ctx.stroke();

  ctx.lineCap = 'round'; ctx.lineJoin = 'round';

  for (let fi = 0; fi < FINGER_SEGMENTS.length; fi++) {
    const segs = FINGER_SEGMENTS[fi];
    const color = FINGER_COLORS[fi];
    // Massive thick fingers
    const thickness = fi === 0 ? 24 : 20;

    // Dark border
    ctx.strokeStyle = 'rgba(50,30,10,0.6)'; ctx.lineWidth = thickness + 8;
    for (const [a,b] of segs) {
      const pa = p(a), pb = p(b);
      ctx.beginPath(); ctx.moveTo(pa.x,pa.y); ctx.lineTo(pb.x,pb.y); ctx.stroke();
    }
    // Skin
    ctx.strokeStyle = COLORS.skin; ctx.lineWidth = thickness + 2;
    for (const [a,b] of segs) {
      const pa = p(a), pb = p(b);
      ctx.beginPath(); ctx.moveTo(pa.x,pa.y); ctx.lineTo(pb.x,pb.y); ctx.stroke();
    }
    // Highlight
    ctx.strokeStyle = COLORS.skinHighlight; ctx.lineWidth = thickness - 8;
    ctx.globalAlpha = 0.5;
    for (const [a,b] of segs) {
      const pa = p(a), pb = p(b);
      ctx.beginPath(); ctx.moveTo(pa.x,pa.y); ctx.lineTo(pb.x,pb.y); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // Color stripe
    ctx.strokeStyle = color; ctx.lineWidth = 4; ctx.globalAlpha = 0.7;
    for (const [a,b] of segs) {
      const pa = p(a), pb = p(b);
      ctx.beginPath(); ctx.moveTo(pa.x,pa.y); ctx.lineTo(pb.x,pb.y); ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Knuckles
    for (const [a] of segs) {
      const pt = p(a);
      ctx.fillStyle = COLORS.skinShadow;
      ctx.beginPath(); ctx.arc(pt.x, pt.y, 9, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = COLORS.skin;
      ctx.beginPath(); ctx.arc(pt.x-1, pt.y-1, 7, 0, Math.PI*2); ctx.fill();
    }

    // Fingertip with nail
    const tipIdx = FINGER_TIPS[fi];
    if (tipIdx < hand.length) {
      const tip = p(tipIdx);
      ctx.shadowColor = color; ctx.shadowBlur = 15;
      ctx.fillStyle = COLORS.skin;
      ctx.beginPath(); ctx.arc(tip.x, tip.y, 14, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = COLORS.nail;
      ctx.beginPath(); ctx.arc(tip.x, tip.y-3, 9, Math.PI*1.15, Math.PI*1.85); ctx.fill();
      ctx.strokeStyle = COLORS.skinShadow; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(tip.x, tip.y-3, 9, Math.PI*1.1, Math.PI*1.9); ctx.stroke();
      // Color ring
      ctx.strokeStyle = color; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(tip.x, tip.y, 16, 0, Math.PI*2); ctx.stroke();
    }
  }

  // Wrist
  const wrist = p(0);
  ctx.fillStyle = COLORS.skinShadow;
  ctx.beginPath(); ctx.arc(wrist.x, wrist.y, 14, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = COLORS.skin;
  ctx.beginPath(); ctx.arc(wrist.x-1, wrist.y-1, 11, 0, Math.PI*2); ctx.fill();
  
  // Left/Right Label
  ctx.font = 'bold 14px Inter, sans-serif'; ctx.fillStyle = '#fff';
  ctx.textAlign = 'center'; ctx.fillText(isRight ? 'RIGHT' : 'LEFT', wrist.x, wrist.y+28);
}

export function drawSkeleton(ctx, landmarks, w, h) {
  clearCanvas(ctx, w, h);
  if (!landmarks) return;

  // Header
  ctx.font = 'bold 12px Inter, sans-serif';
  ctx.fillStyle = 'rgba(108,99,255,0.6)'; ctx.textAlign = 'center';
  ctx.fillText('🤟 SIGN LANGUAGE AVATAR', w/2, 20);

  drawBody(ctx, landmarks.pose, w, h);
  drawHand(ctx, landmarks.leftHand, w, h, false);
  drawHand(ctx, landmarks.rightHand, w, h, true);

  // Finger legend
  const names = ['Thumb','Index','Middle','Ring','Pinky'];
  ctx.font = '10px Inter, sans-serif'; ctx.textAlign = 'left';
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = FINGER_COLORS[i];
    ctx.beginPath(); ctx.arc(15, 38+i*16, 5, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = COLORS.text;
    ctx.fillText(names[i], 26, 42+i*16);
  }
}

export function interpolateFrames(frameA, frameB, t) {
  if (!frameA) return frameB;
  if (!frameB) return frameA;
  const ease = t < 0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;
  const lerpArray = (a, b) => {
    if (!a || !b) return a || b;
    return a.map((pt, i) => ({
      x: pt.x + (b[i].x - pt.x) * ease,
      y: pt.y + (b[i].y - pt.y) * ease,
    }));
  };
  return {
    pose: lerpArray(frameA.pose, frameB.pose),
    leftHand: lerpArray(frameA.leftHand, frameB.leftHand),
    rightHand: lerpArray(frameA.rightHand, frameB.rightHand),
  };
}

export function drawWordLabel(ctx, word, progress, total, w, h) {
  ctx.shadowBlur = 0;
  // Background strip
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, h-65, w, 65);

  // Word
  ctx.font = 'bold 24px Outfit, sans-serif';
  ctx.fillStyle = COLORS.textBold; ctx.textAlign = 'center';
  ctx.fillText(word?.toUpperCase() || '', w/2, h-36);

  // Progress
  ctx.font = '12px Inter, sans-serif'; ctx.fillStyle = COLORS.accent;
  ctx.fillText(`Word ${progress+1} of ${total}`, w/2, h-16);

  // Bar
  const barW = w*0.7, barH = 4, barX = (w-barW)/2, barY = h-6;
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.beginPath(); ctx.roundRect(barX, barY, barW, barH, 2); ctx.fill();
  const fillW = barW*((progress+1)/total);
  const grad = ctx.createLinearGradient(barX,0,barX+fillW,0);
  grad.addColorStop(0,'#6c63ff'); grad.addColorStop(1,'#10b981');
  ctx.fillStyle = grad;
  ctx.beginPath(); ctx.roundRect(barX, barY, fillW, barH, 2); ctx.fill();
}
