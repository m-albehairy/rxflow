import React, { memo } from 'react';
import type { LoginColorScheme } from '../LoginTheme';

interface Props {
  colors: LoginColorScheme;
}

const STARS = [
  { cx: 45, cy: 30, r: 1.2, delay: 0 },
  { cx: 120, cy: 55, r: 0.8, delay: 0.5 },
  { cx: 200, cy: 25, r: 1.5, delay: 1.2 },
  { cx: 280, cy: 70, r: 1.0, delay: 0.3 },
  { cx: 350, cy: 20, r: 1.3, delay: 1.8 },
  { cx: 420, cy: 50, r: 0.9, delay: 0.8 },
  { cx: 80, cy: 90, r: 1.1, delay: 2.1 },
  { cx: 160, cy: 15, r: 0.7, delay: 1.5 },
  { cx: 310, cy: 45, r: 1.4, delay: 0.6 },
  { cx: 450, cy: 35, r: 1.0, delay: 1.0 },
  { cx: 30, cy: 65, r: 0.8, delay: 2.5 },
  { cx: 380, cy: 80, r: 1.2, delay: 1.7 },
  { cx: 250, cy: 10, r: 0.6, delay: 0.2 },
  { cx: 140, cy: 75, r: 1.0, delay: 2.8 },
  { cx: 470, cy: 15, r: 0.9, delay: 1.3 },
  { cx: 95, cy: 40, r: 1.1, delay: 3.0 },
  { cx: 330, cy: 60, r: 0.7, delay: 0.9 },
  { cx: 190, cy: 85, r: 1.3, delay: 2.2 },
];

export const DesertSky = memo(function DesertSky({ colors }: Props) {
  return (
    <g>
      {/* Sky gradient */}
      <defs>
        <linearGradient id="skyGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.nightSky} />
          <stop offset="100%" stopColor={colors.nightSkyBottom} />
        </linearGradient>
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={colors.moonGlow} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <style>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 1; }
          }
        `}</style>
      </defs>

      <rect x="0" y="0" width="500" height="400" fill="url(#skyGradient)" />

      {/* Stars */}
      {STARS.map((star, i) => (
        <circle
          key={i}
          cx={star.cx}
          cy={star.cy}
          r={star.r}
          fill={colors.starColor}
          style={{
            animation: `twinkle ${2 + star.delay}s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}

      {/* Moon glow halo */}
      <circle cx="400" cy="60" r="50" fill="url(#moonGlow)" />

      {/* Crescent moon */}
      <defs>
        <mask id="crescentMask">
          <rect width="500" height="400" fill="white" />
          <circle cx="412" cy="55" r="22" fill="black" />
        </mask>
      </defs>
      <circle
        cx="400"
        cy="60"
        r="25"
        fill={colors.gold}
        mask="url(#crescentMask)"
      />
    </g>
  );
});
