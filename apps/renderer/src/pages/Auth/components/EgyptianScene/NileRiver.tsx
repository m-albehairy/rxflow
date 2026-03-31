import React, { memo } from 'react';
import type { LoginColorScheme } from '../LoginTheme';

interface Props {
  colors: LoginColorScheme;
}

export const NileRiver = memo(function NileRiver({ colors }: Props) {
  return (
    <g>
      <defs>
        <linearGradient id="nileGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.nileTeal} stopOpacity="0.6" />
          <stop offset="100%" stopColor={colors.nileTeal} stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id="shimmerGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={colors.nileShimmer} stopOpacity="0" />
          <stop offset="40%" stopColor={colors.nileShimmer} stopOpacity="0.6" />
          <stop offset="60%" stopColor={colors.nileShimmer} stopOpacity="0.6" />
          <stop offset="100%" stopColor={colors.nileShimmer} stopOpacity="0" />
        </linearGradient>
        <style>{`
          @keyframes nileFlow {
            0% { transform: translateX(-100px); }
            100% { transform: translateX(100px); }
          }
          @keyframes waveFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(3px); }
          }
        `}</style>
      </defs>

      {/* River body */}
      <path
        d="M0,300 C60,290 120,310 180,300 C240,290 300,310 360,300 C420,290 480,305 500,300 L500,400 L0,400 Z"
        fill="url(#nileGradient)"
        style={{ animation: 'waveFloat 4s ease-in-out infinite' }}
      />

      {/* Shimmer reflection */}
      <path
        d="M0,305 C60,295 120,315 180,305 C240,295 300,315 360,305 C420,295 480,310 500,305 L500,320 L0,320 Z"
        fill="url(#shimmerGradient)"
        style={{ animation: 'nileFlow 6s ease-in-out infinite alternate' }}
      />

      {/* Small ripple lines */}
      <path
        d="M50,315 Q70,312 90,315"
        fill="none"
        stroke={colors.nileShimmer}
        strokeWidth="0.8"
        opacity="0.5"
        style={{ animation: 'waveFloat 3s ease-in-out 0.5s infinite' }}
      />
      <path
        d="M200,320 Q220,317 240,320"
        fill="none"
        stroke={colors.nileShimmer}
        strokeWidth="0.8"
        opacity="0.4"
        style={{ animation: 'waveFloat 3.5s ease-in-out 1s infinite' }}
      />
      <path
        d="M350,310 Q370,307 390,310"
        fill="none"
        stroke={colors.nileShimmer}
        strokeWidth="0.8"
        opacity="0.4"
        style={{ animation: 'waveFloat 3s ease-in-out 1.5s infinite' }}
      />

      {/* Pyramid reflections in water (very subtle) */}
      <polygon
        points="200,310 250,340 300,310"
        fill={colors.pyramidGold}
        opacity="0.08"
      />
    </g>
  );
});
