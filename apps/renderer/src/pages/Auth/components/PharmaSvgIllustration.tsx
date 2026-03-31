import React, { memo } from 'react';

interface Props {
  capsuleColors: readonly [string, string];
  liquidTint: string;
}

export const PharmaSvgIllustration = memo(function PharmaSvgIllustration({ capsuleColors, liquidTint }: Props) {
  return (
    <svg
      viewBox="0 0 600 800"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    >
      <defs>
        <linearGradient id="pvGlass1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,.25)"/>
          <stop offset="40%" stopColor="rgba(255,255,255,.08)"/>
          <stop offset="60%" stopColor="rgba(255,255,255,.15)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,.05)"/>
        </linearGradient>
        <linearGradient id="pvGlass2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,.22)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,.05)"/>
        </linearGradient>
        <linearGradient id="pvLiquidClear" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={liquidTint}/>
          <stop offset="100%" stopColor="rgba(140,180,220,.12)"/>
        </linearGradient>
        <linearGradient id="pvLiquidAmber" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(220,180,100,.35)"/>
          <stop offset="100%" stopColor="rgba(180,140,60,.18)"/>
        </linearGradient>
        <linearGradient id="pvCapsuleA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={capsuleColors[0]}/>
          <stop offset="100%" stopColor={capsuleColors[1]}/>
        </linearGradient>
        <linearGradient id="pvCapsuleW" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f0f4f8"/>
          <stop offset="100%" stopColor="#d8dee6"/>
        </linearGradient>
        <linearGradient id="pvBottleCap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(60,60,70,.9)"/>
          <stop offset="100%" stopColor="rgba(30,30,40,.95)"/>
        </linearGradient>
        <filter id="pvSoftGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6"/>
        </filter>
      </defs>

      {/* Reflective surface */}
      <rect x="20" y="590" width="560" height="3" rx="1.5" fill="rgba(255,255,255,.1)"/>
      <ellipse cx="300" cy="598" rx="250" ry="12" fill="rgba(255,255,255,.025)"/>

      {/* BACK ROW */}
      {/* Tall narrow bottle (far left) */}
      <g transform="translate(40,180)">
        <rect x="0" y="24" width="30" height="110" rx="5" fill="url(#pvGlass1)" stroke="rgba(255,255,255,.15)" strokeWidth="0.8" opacity=".6"/>
        <rect x="3" y="28" width="4" height="90" rx="2" fill="rgba(255,255,255,.08)"/>
        <rect x="8" y="0" width="14" height="28" rx="3" fill="url(#pvGlass2)" stroke="rgba(255,255,255,.1)" strokeWidth="0.8" opacity=".6"/>
        <rect x="6" y="-6" width="18" height="10" rx="3" fill="url(#pvBottleCap)" opacity=".6"/>
        <rect x="1.5" y="80" width="27" height="52" rx="4" fill="url(#pvLiquidAmber)" opacity=".35"/>
      </g>

      {/* Wide vial (back row, left-center) */}
      <g transform="translate(100,160)">
        <rect x="0" y="22" width="44" height="120" rx="7" fill="url(#pvGlass1)" stroke="rgba(255,255,255,.18)" strokeWidth="1" opacity=".7"/>
        <rect x="5" y="27" width="6" height="100" rx="3" fill="rgba(255,255,255,.1)"/>
        <rect x="33" y="30" width="4" height="80" rx="2" fill="rgba(255,255,255,.05)"/>
        <rect x="12" y="0" width="20" height="26" rx="4" fill="url(#pvGlass2)" stroke="rgba(255,255,255,.14)" strokeWidth="1" opacity=".7"/>
        <rect x="9" y="-7" width="26" height="12" rx="3.5" fill="url(#pvBottleCap)" opacity=".7"/>
        <rect x="9" y="-3" width="26" height="3" rx="1.5" fill="rgba(255,255,255,.08)"/>
        <rect x="2" y="80" width="40" height="60" rx="6" fill="url(#pvLiquidClear)" opacity=".55"/>
        <line x1="2" y1="80" x2="42" y2="80" stroke={liquidTint} strokeWidth="0.8"/>
        <rect x="6" y="92" width="32" height="26" rx="2" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.08)" strokeWidth="0.5"/>
      </g>

      {/* Ampoule tall */}
      <g transform="translate(180,200)">
        <rect x="0" y="35" width="20" height="80" rx="10" fill="url(#pvGlass1)" stroke="rgba(255,255,255,.14)" strokeWidth="0.8"/>
        <rect x="3" y="40" width="3.5" height="65" rx="1.75" fill="rgba(255,255,255,.1)"/>
        <rect x="6" y="12" width="8" height="27" rx="2.5" fill="url(#pvGlass2)" stroke="rgba(255,255,255,.12)" strokeWidth="0.8"/>
        <path d="M5,12 Q5,2 10,2 Q15,2 15,12" fill="rgba(255,255,255,.14)" stroke="rgba(255,255,255,.18)" strokeWidth="0.8"/>
        <ellipse cx="10" cy="2" rx="5.5" ry="7" fill="rgba(200,200,220,.18)" stroke="rgba(255,255,255,.14)" strokeWidth="0.8"/>
        <rect x="2" y="65" width="16" height="48" rx="8" fill="url(#pvLiquidAmber)" opacity=".6"/>
      </g>

      {/* Ampoule short */}
      <g transform="translate(215,230)">
        <rect x="0" y="24" width="16" height="55" rx="8" fill="url(#pvGlass1)" stroke="rgba(255,255,255,.12)" strokeWidth="0.8"/>
        <rect x="3" y="28" width="3" height="42" rx="1.5" fill="rgba(255,255,255,.08)"/>
        <rect x="4.5" y="6" width="7" height="22" rx="2" fill="url(#pvGlass2)" stroke="rgba(255,255,255,.1)" strokeWidth="0.8"/>
        <path d="M4,6 Q4,-2 8,-2 Q12,-2 12,6" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.14)" strokeWidth="0.8"/>
        <rect x="1.5" y="48" width="13" height="29" rx="6.5" fill="url(#pvLiquidClear)" opacity=".45"/>
      </g>

      {/* MAIN: Large graduated bottle (center, tilted) */}
      <g transform="translate(300,120) rotate(22)">
        <rect x="0" y="36" width="72" height="200" rx="10" fill="url(#pvGlass1)" stroke="rgba(255,255,255,.22)" strokeWidth="1.2"/>
        <rect x="7" y="42" width="10" height="175" rx="5" fill="rgba(255,255,255,.12)"/>
        <rect x="55" y="48" width="5" height="150" rx="2.5" fill="rgba(255,255,255,.06)"/>
        <rect x="22" y="0" width="28" height="42" rx="5" fill="url(#pvGlass2)" stroke="rgba(255,255,255,.2)" strokeWidth="1"/>
        <rect x="26" y="6" width="5" height="30" rx="2.5" fill="rgba(255,255,255,.1)"/>
        <rect x="18" y="-10" width="36" height="16" rx="5" fill="url(#pvBottleCap)"/>
        <rect x="20" y="-5" width="32" height="3.5" rx="1.75" fill="rgba(255,255,255,.1)"/>
        {[70, 105, 140, 175, 200].map((y, i) => (
          <g key={`grad-${i}`}>
            <line x1="58" y1={y} x2="68" y2={y} stroke="rgba(255,255,255,.2)" strokeWidth="0.8"/>
            <text x="54" y={y + 3} textAnchor="end" fontSize="6" fill="rgba(255,255,255,.14)" fontFamily="sans-serif">{500 - i * 100}</text>
          </g>
        ))}
        <rect x="3" y="150" width="66" height="84" rx="9" fill="url(#pvLiquidClear)" opacity=".7"/>
        <line x1="3" y1="150" x2="69" y2="150" stroke={liquidTint} strokeWidth="1"/>
      </g>

      {/* Medium bottle (right) */}
      <g transform="translate(460,200)">
        <rect x="0" y="20" width="38" height="100" rx="6" fill="url(#pvGlass1)" stroke="rgba(255,255,255,.16)" strokeWidth="1" opacity=".75"/>
        <rect x="4" y="24" width="5" height="82" rx="2.5" fill="rgba(255,255,255,.1)"/>
        <rect x="11" y="0" width="16" height="24" rx="3" fill="url(#pvGlass2)" stroke="rgba(255,255,255,.12)" strokeWidth="0.8" opacity=".75"/>
        <rect x="9" y="-6" width="20" height="10" rx="3" fill="url(#pvBottleCap)" opacity=".75"/>
        <rect x="2" y="68" width="34" height="50" rx="5" fill="url(#pvLiquidClear)" opacity=".5"/>
        <line x1="2" y1="68" x2="36" y2="68" stroke={liquidTint} strokeWidth="0.7"/>
      </g>

      {/* Small vial (far right) */}
      <g transform="translate(520,240)">
        <rect x="0" y="16" width="26" height="65" rx="5" fill="url(#pvGlass1)" stroke="rgba(255,255,255,.1)" strokeWidth="0.8" opacity=".55"/>
        <rect x="3" y="20" width="3.5" height="50" rx="1.75" fill="rgba(255,255,255,.07)"/>
        <rect x="7" y="0" width="12" height="20" rx="3" fill="url(#pvGlass2)" stroke="rgba(255,255,255,.08)" strokeWidth="0.8" opacity=".55"/>
        <rect x="5" y="-5" width="16" height="9" rx="2.5" fill="url(#pvBottleCap)" opacity=".55"/>
        <rect x="1.5" y="50" width="23" height="29" rx="4" fill="url(#pvLiquidAmber)" opacity=".35"/>
      </g>

      {/* Ampoule lying flat (bottom left) */}
      <g transform="translate(50,530) rotate(-8)">
        <rect x="0" y="0" width="110" height="13" rx="6.5" fill="url(#pvGlass1)" stroke="rgba(255,255,255,.12)" strokeWidth="0.8"/>
        <rect x="3" y="2.5" width="90" height="2.5" rx="1.25" fill="rgba(255,255,255,.06)"/>
        <path d="M110,6.5 L130,6.5" stroke="rgba(255,255,255,.14)" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="0" cy="6.5" r="4" fill="rgba(255,255,255,.08)" stroke="rgba(255,255,255,.1)" strokeWidth="0.8"/>
        <rect x="20" y="2" width="55" height="9" rx="4.5" fill="url(#pvLiquidClear)" opacity=".35"/>
      </g>

      {/* Second ampoule flat (crossing) */}
      <g transform="translate(80,555) rotate(5)">
        <rect x="0" y="0" width="90" height="11" rx="5.5" fill="url(#pvGlass1)" stroke="rgba(255,255,255,.1)" strokeWidth="0.8" opacity=".7"/>
        <rect x="3" y="2" width="75" height="2" rx="1" fill="rgba(255,255,255,.05)"/>
        <path d="M90,5.5 L106,5.5" stroke="rgba(255,255,255,.12)" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="0" cy="5.5" r="3.5" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.08)" strokeWidth="0.8"/>
        <rect x="15" y="1.5" width="45" height="8" rx="4" fill="url(#pvLiquidAmber)" opacity=".3"/>
      </g>

      {/* Spilling container (center-right) */}
      <g transform="translate(350,480) rotate(35)">
        <rect x="0" y="0" width="48" height="60" rx="7" fill="rgba(255,255,255,.1)" stroke="rgba(255,255,255,.16)" strokeWidth="1"/>
        <rect x="4" y="4" width="5" height="48" rx="2.5" fill="rgba(255,255,255,.06)"/>
        <ellipse cx="24" cy="2" rx="22" ry="3.5" fill="rgba(255,255,255,.07)"/>
      </g>

      {/* CAPSULES scattered across bottom */}
      {[
        { x: 320, y: 560, r: -15, w: 30, h: 12 },
        { x: 365, y: 545, r: 40,  w: 28, h: 11 },
        { x: 290, y: 575, r: 70,  w: 26, h: 10 },
        { x: 400, y: 570, r: -30, w: 24, h: 10 },
        { x: 350, y: 585, r: 10,  w: 27, h: 11 },
        { x: 430, y: 555, r: 55,  w: 22, h: 9 },
        { x: 270, y: 555, r: -50, w: 24, h: 10 },
        { x: 460, y: 575, r: -10, w: 25, h: 10 },
        { x: 310, y: 545, r: 25,  w: 22, h: 9 },
        { x: 500, y: 560, r: -40, w: 20, h: 8, o: .6 },
        { x: 240, y: 570, r: 60,  w: 20, h: 8, o: .5 },
        { x: 480, y: 545, r: 15,  w: 22, h: 9, o: .5 },
        { x: 200, y: 560, r: -20, w: 18, h: 8, o: .4 },
        { x: 530, y: 570, r: 45,  w: 18, h: 7, o: .35 },
      ].map(({ x, y, r, w, h, o = 1 }, i) => (
        <g key={`cap-${i}`} transform={`translate(${x},${y}) rotate(${r})`} opacity={o}>
          <rect x="0" y="0" width={w} height={h} rx={h / 2} fill="url(#pvCapsuleW)"/>
          <rect x="0" y="0" width={w / 2} height={h} rx={h / 2} fill="url(#pvCapsuleA)"/>
          <line x1={w / 2} y1="0" x2={w / 2} y2={h} stroke="rgba(255,255,255,.15)" strokeWidth="0.5"/>
          <ellipse cx={w * 0.25} cy={h * 0.35} rx={w * 0.1} ry={h * 0.28} fill="rgba(255,255,255,.18)"/>
        </g>
      ))}

      {/* Floating capsules (depth) */}
      {[
        { x: 480, y: 80, r: 30, w: 18, h: 7, o: .25 },
        { x: 50, y: 100, r: -20, w: 16, h: 6, o: .2 },
        { x: 520, y: 150, r: 50, w: 14, h: 6, o: .18 },
        { x: 30, y: 350, r: -35, w: 16, h: 7, o: .2 },
        { x: 550, y: 400, r: 25, w: 15, h: 6, o: .18 },
      ].map(({ x, y, r, w, h, o }, i) => (
        <g key={`fcap-${i}`} transform={`translate(${x},${y}) rotate(${r})`} opacity={o}>
          <rect x="0" y="0" width={w} height={h} rx={h / 2} fill="url(#pvCapsuleW)"/>
          <rect x="0" y="0" width={w / 2} height={h} rx={h / 2} fill="url(#pvCapsuleA)"/>
        </g>
      ))}

      {/* Round pills */}
      {[
        { cx: 380, cy: 590, r: 6 },
        { cx: 260, cy: 585, r: 5 },
        { cx: 450, cy: 585, r: 5.5 },
        { cx: 330, cy: 595, r: 4 },
        { cx: 510, cy: 580, r: 4.5, o: .5 },
        { cx: 180, cy: 575, r: 3.5, o: .4 },
      ].map(({ cx, cy, r, o = .8 }, i) => (
        <g key={`pill-${i}`} opacity={o}>
          <circle cx={cx} cy={cy} r={r} fill="url(#pvCapsuleW)" stroke="rgba(255,255,255,.1)" strokeWidth="0.5"/>
          <circle cx={cx - r * 0.25} cy={cy - r * 0.25} r={r * 0.35} fill="rgba(255,255,255,.2)"/>
        </g>
      ))}

      {/* Glass reflections */}
      {[
        [118, 185, 2.5], [195, 225, 2], [330, 165, 3], [475, 225, 2],
        [55, 210, 1.5], [540, 265, 1.5], [230, 260, 1.8], [410, 180, 1.2],
      ].map(([cx, cy, r], i) => (
        <circle key={`gl-${i}`} cx={cx} cy={cy} r={r} fill="rgba(255,255,255,.35)" filter="url(#pvSoftGlow)"/>
      ))}

      {/* Surface reflections */}
      <ellipse cx="120" cy="594" rx="30" ry="5" fill="rgba(255,255,255,.025)"/>
      <ellipse cx="300" cy="594" rx="50" ry="6" fill="rgba(255,255,255,.03)"/>
      <ellipse cx="480" cy="594" rx="35" ry="5" fill="rgba(255,255,255,.025)"/>

      {/* Ambient sparkles */}
      {[[80,140,1.2],[250,100,1],[400,80,1.5],[550,180,1],[50,420,0.8],[530,450,1],[300,400,0.7],[150,500,0.9]].map(([cx,cy,r],i) => (
        <circle key={`sp-${i}`} cx={cx} cy={cy} r={r} fill="rgba(255,255,255,.2)">
          <animate attributeName="opacity" values=".1;.4;.1" dur={`${2 + i * 0.4}s`} repeatCount="indefinite" begin={`${i * 0.3}s`}/>
        </circle>
      ))}
    </svg>
  );
});
