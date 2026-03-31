import React, { memo } from 'react';
import type { LoginColorScheme } from '../LoginTheme';

interface Props {
  colors: LoginColorScheme;
}

export const LotusFlowers = memo(function LotusFlowers({ colors }: Props) {
  return (
    <g>
      <defs>
        <style>{`
          @keyframes lotusFloat {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-3px) rotate(2deg); }
          }
          @keyframes lotusFloat2 {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-2px) rotate(-2deg); }
          }
        `}</style>
      </defs>

      {/* Lotus 1 - left side */}
      <g style={{ animation: 'lotusFloat 5s ease-in-out infinite', transformOrigin: '70px 290px' }}>
        {/* Stem */}
        <path
          d="M70,310 Q68,300 70,290"
          fill="none"
          stroke={colors.lotusColor}
          strokeWidth="1.5"
          opacity="0.7"
        />
        {/* Petals */}
        <ellipse cx="70" cy="285" rx="5" ry="10" fill={colors.lotusColor} opacity="0.6" transform="rotate(-20, 70, 285)" />
        <ellipse cx="70" cy="285" rx="5" ry="10" fill={colors.lotusColor} opacity="0.7" transform="rotate(0, 70, 285)" />
        <ellipse cx="70" cy="285" rx="5" ry="10" fill={colors.lotusColor} opacity="0.6" transform="rotate(20, 70, 285)" />
        {/* Center */}
        <circle cx="70" cy="282" r="3" fill={colors.gold} opacity="0.5" />
      </g>

      {/* Lotus 2 - center */}
      <g style={{ animation: 'lotusFloat2 6s ease-in-out 1s infinite', transformOrigin: '180px 295px' }}>
        <path
          d="M180,315 Q178,305 180,295"
          fill="none"
          stroke={colors.lotusColor}
          strokeWidth="1.5"
          opacity="0.6"
        />
        <ellipse cx="180" cy="290" rx="6" ry="12" fill={colors.lotusColor} opacity="0.5" transform="rotate(-25, 180, 290)" />
        <ellipse cx="180" cy="290" rx="6" ry="12" fill={colors.lotusColor} opacity="0.6" transform="rotate(0, 180, 290)" />
        <ellipse cx="180" cy="290" rx="6" ry="12" fill={colors.lotusColor} opacity="0.5" transform="rotate(25, 180, 290)" />
        <circle cx="180" cy="287" r="3.5" fill={colors.gold} opacity="0.4" />
      </g>

      {/* Lotus 3 - right, smaller */}
      <g style={{ animation: 'lotusFloat 4.5s ease-in-out 2s infinite', transformOrigin: '420px 292px' }}>
        <path
          d="M420,312 Q419,303 420,295"
          fill="none"
          stroke={colors.lotusColor}
          strokeWidth="1.2"
          opacity="0.5"
        />
        <ellipse cx="420" cy="291" rx="4" ry="8" fill={colors.lotusColor} opacity="0.5" transform="rotate(-15, 420, 291)" />
        <ellipse cx="420" cy="291" rx="4" ry="8" fill={colors.lotusColor} opacity="0.6" transform="rotate(0, 420, 291)" />
        <ellipse cx="420" cy="291" rx="4" ry="8" fill={colors.lotusColor} opacity="0.5" transform="rotate(15, 420, 291)" />
        <circle cx="420" cy="289" r="2.5" fill={colors.gold} opacity="0.4" />
      </g>

      {/* Lily pads */}
      <ellipse cx="110" cy="308" rx="12" ry="5" fill={colors.lotusColor} opacity="0.25" />
      <ellipse cx="320" cy="305" rx="10" ry="4" fill={colors.lotusColor} opacity="0.2" />
      <ellipse cx="460" cy="310" rx="8" ry="3" fill={colors.lotusColor} opacity="0.2" />
    </g>
  );
});
