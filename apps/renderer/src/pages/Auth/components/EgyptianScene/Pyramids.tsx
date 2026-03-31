import React, { memo } from 'react';
import type { LoginColorScheme } from '../LoginTheme';

interface Props {
  colors: LoginColorScheme;
}

export const Pyramids = memo(function Pyramids({ colors }: Props) {
  return (
    <g>
      {/* Far pyramid (smallest, leftmost) */}
      <polygon
        points="80,280 140,210 200,280"
        fill={colors.pyramidDark}
      />
      {/* Gold edge on moonlit side */}
      <line
        x1="140" y1="210" x2="200" y2="280"
        stroke={colors.pyramidGold}
        strokeWidth="1.5"
      />

      {/* Middle pyramid (largest) */}
      <polygon
        points="140,280 250,160 360,280"
        fill={colors.pyramidLight}
      />
      <line
        x1="250" y1="160" x2="360" y2="280"
        stroke={colors.pyramidGold}
        strokeWidth="2"
      />
      {/* Subtle brick pattern lines on the large pyramid */}
      <line x1="195" y1="220" x2="305" y2="220" stroke={colors.pyramidGold} strokeWidth="0.3" opacity="0.4" />
      <line x1="175" y1="240" x2="325" y2="240" stroke={colors.pyramidGold} strokeWidth="0.3" opacity="0.3" />
      <line x1="157" y1="260" x2="343" y2="260" stroke={colors.pyramidGold} strokeWidth="0.3" opacity="0.2" />

      {/* Near pyramid (medium, rightmost) */}
      <polygon
        points="280,280 360,195 440,280"
        fill={colors.pyramidDark}
      />
      <line
        x1="360" y1="195" x2="440" y2="280"
        stroke={colors.pyramidGold}
        strokeWidth="1.5"
      />

      {/* Sand/ground line */}
      <rect x="0" y="278" width="500" height="4" fill={colors.pyramidDark} opacity="0.5" />
    </g>
  );
});
