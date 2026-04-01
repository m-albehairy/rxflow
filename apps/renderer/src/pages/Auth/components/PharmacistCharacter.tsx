import React, { memo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CharacterState } from './useLoginAnimationState';
import type { LoginColorScheme } from './LoginTheme';

interface Props {
  state: CharacterState;
  usernameLength: number;
  passwordPeek: boolean;
  colors: LoginColorScheme;
}

const TRANSITION = { type: 'spring' as const, stiffness: 300, damping: 20 };
const TRANSITION_FAST = { type: 'spring' as const, stiffness: 400, damping: 25 };

// Map username length (0-20) to pupil X offset (-6 to +6)
function getPupilOffset(length: number, isRTL: boolean): number {
  const normalized = Math.min(length, 20) / 20;
  const offset = normalized * 12 - 6;
  return isRTL ? -offset : offset;
}

export const PharmacistCharacter = memo(function PharmacistCharacter({
  state,
  usernameLength,
  passwordPeek,
  colors,
}: Props) {
  const [blinking, setBlinking] = useState(false);
  const isRTL = document.dir === 'rtl';

  // Blinking timer for idle/focus states
  useEffect(() => {
    if (state === 'idle' || state === 'username-focus') {
      const interval = setInterval(() => {
        setBlinking(true);
        setTimeout(() => setBlinking(false), 150);
      }, 3500);
      return () => clearInterval(interval);
    }
    setBlinking(false);
  }, [state]);

  const isPasswordState = state === 'password-focus' || state === 'password-typing';
  const isLoading = state === 'loading';
  const isError = state === 'error';
  const isSuccess = state === 'success';
  const isTypingUsername = state === 'username-typing';

  // Pupil position
  const pupilOffsetX = isTypingUsername ? getPupilOffset(usernameLength, isRTL) : 0;
  const pupilOffsetY = state === 'username-focus' || isTypingUsername ? 3 : 0;

  // Eye scale (for blinking / happy eyes)
  const eyeScaleY = blinking ? 0.1 : isLoading || isSuccess ? 0.15 : 1;

  // Hand positions
  const handsCoveringEyes = isPasswordState;
  const leftHandY = handsCoveringEyes ? -42 : 20;
  const rightHandY = handsCoveringEyes ? -42 : 20;
  const leftHandX = handsCoveringEyes ? -8 : -28;
  const rightHandX = handsCoveringEyes ? 8 : 28;

  // Peek gap when typing password
  const peekOffset = passwordPeek && state === 'password-typing' ? 6 : 0;

  // Body bounce for breathing
  const bodyY = isSuccess ? -8 : isError ? 0 : 0;

  return (
    <motion.svg
      viewBox="-80 -90 160 140"
      width="180"
      height="160"
      style={{ overflow: 'visible', display: 'block', margin: '0 auto' }}
      animate={
        isError
          ? { x: [0, -5, 5, -5, 5, 0] }
          : isSuccess
          ? { y: [0, -10, 0] }
          : {}
      }
      transition={
        isError
          ? { duration: 0.4 }
          : isSuccess
          ? { duration: 0.5, ease: 'easeOut' }
          : {}
      }
    >
      {/* === BODY (Lab coat) === */}
      <motion.g animate={{ y: bodyY }} transition={TRANSITION}>
        {/* Lab coat body */}
        <rect x="-30" y="5" width="60" height="50" rx="12" fill="white" stroke="#E5E7EB" strokeWidth="1" />
        {/* Coat collar */}
        <path d="M-15,5 L0,-2 L15,5" fill="white" stroke="#E5E7EB" strokeWidth="1" />
        {/* Pocket */}
        <rect x="8" y="25" width="15" height="12" rx="2" fill="none" stroke="#D1D5DB" strokeWidth="0.8" />
        {/* Rx symbol */}
        <text x="12" y="35" fontSize="8" fill={colors.gold} fontWeight="bold" fontFamily="serif">
          Rx
        </text>

        {/* Pharaonic collar necklace */}
        <g>
          <path d="M-22,3 Q0,12 22,3" fill="none" stroke={colors.gold} strokeWidth="2.5" />
          <path d="M-18,6 Q0,14 18,6" fill="none" stroke={colors.deepTeal} strokeWidth="1.5" />
          <path d="M-14,9 Q0,15 14,9" fill="none" stroke="#C41E3A" strokeWidth="1" opacity="0.7" />
          {/* Small gold beads */}
          {[-16, -8, 0, 8, 16].map((x) => (
            <circle key={x} cx={x} cy="5" r="1.5" fill={colors.gold} />
          ))}
        </g>
      </motion.g>

      {/* === HEAD === */}
      <motion.g
        animate={{ y: bodyY }}
        transition={TRANSITION}
      >
        {/* Head shape */}
        <ellipse cx="0" cy="-30" rx="28" ry="30" fill="#F5D6B8" />
        {/* Ears */}
        <ellipse cx="-27" cy="-28" rx="5" ry="7" fill="#F0C9A0" />
        <ellipse cx="27" cy="-28" rx="5" ry="7" fill="#F0C9A0" />

        {/* Hair */}
        <path d="M-26,-48 Q-28,-60 -15,-62 Q0,-65 15,-62 Q28,-60 26,-48" fill="#3D2B1F" />
        <path d="M-26,-48 Q-20,-52 0,-53 Q20,-52 26,-48" fill="#3D2B1F" />

        {/* Eyebrows */}
        <motion.path
          fill="none"
          stroke="#3D2B1F"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ d: 'M-16,-42 Q-10,-45 -4,-42' }}
          animate={{ d: isError ? 'M-16,-40 Q-10,-45 -4,-42' : 'M-16,-42 Q-10,-45 -4,-42' }}
          transition={TRANSITION_FAST}
        />
        <motion.path
          fill="none"
          stroke="#3D2B1F"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ d: 'M4,-42 Q10,-45 16,-42' }}
          animate={{ d: isError ? 'M4,-42 Q10,-45 16,-40' : 'M4,-42 Q10,-45 16,-42' }}
          transition={TRANSITION_FAST}
        />

        {/* Eyes */}
        <g>
          {/* Left eye */}
          <motion.g
            animate={{ scaleY: eyeScaleY }}
            transition={{ duration: 0.1 }}
            style={{ transformOrigin: '-10px -33px' }}
          >
            <ellipse cx="-10" cy="-33" rx="7" ry="7" fill="white" stroke="#E5E7EB" strokeWidth="0.5" />
            <motion.circle
              fill="#3D2B1F"
              initial={{ cx: -10, cy: -33, r: 3.5 }}
              animate={{
                cx: -10 + pupilOffsetX,
                cy: -33 + pupilOffsetY,
                r: isError ? 4.5 : 3.5,
              }}
              transition={TRANSITION_FAST}
            />
            <motion.circle
              fill="white"
              initial={{ cx: -8.5, cy: -34.5, r: 1.5 }}
              animate={{
                cx: -8.5 + pupilOffsetX,
                cy: -34.5 + pupilOffsetY,
              }}
              transition={TRANSITION_FAST}
            />
          </motion.g>

          {/* Right eye */}
          <motion.g
            animate={{ scaleY: eyeScaleY }}
            transition={{ duration: 0.1 }}
            style={{ transformOrigin: '10px -33px' }}
          >
            <ellipse cx="10" cy="-33" rx="7" ry="7" fill="white" stroke="#E5E7EB" strokeWidth="0.5" />
            <motion.circle
              fill="#3D2B1F"
              initial={{ cx: 10, cy: -33, r: 3.5 }}
              animate={{
                cx: 10 + pupilOffsetX,
                cy: -33 + pupilOffsetY,
                r: isError ? 4.5 : 3.5,
              }}
              transition={TRANSITION_FAST}
            />
            <motion.circle
              fill="white"
              initial={{ cx: 11.5, cy: -34.5, r: 1.5 }}
              animate={{
                cx: 11.5 + pupilOffsetX,
                cy: -34.5 + pupilOffsetY,
              }}
              transition={TRANSITION_FAST}
            />
          </motion.g>

          {/* Happy eyes overlay (for loading/success) */}
          {(isLoading || isSuccess) && (
            <>
              <path d="M-17,-33 Q-10,-27 -3,-33" fill="none" stroke="#3D2B1F" strokeWidth="2" strokeLinecap="round" />
              <path d="M3,-33 Q10,-27 17,-33" fill="none" stroke="#3D2B1F" strokeWidth="2" strokeLinecap="round" />
            </>
          )}
        </g>

        {/* Nose */}
        <ellipse cx="0" cy="-24" rx="2" ry="2.5" fill="#ECBF9A" />

        {/* Mouth */}
        <motion.path
          fill="none"
          stroke="#B07C62"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ d: 'M-6,-16 Q0,-12 6,-16' }}
          animate={{
            d: isLoading || isSuccess
              ? 'M-8,-16 Q0,-10 8,-16'   // big smile
              : isError
              ? 'M-6,-14 Q0,-18 6,-14'   // frown
              : 'M-6,-16 Q0,-12 6,-16',  // small smile
          }}
          transition={TRANSITION}
        />
      </motion.g>

      {/* === HANDS === */}
      {/* Left hand */}
      <motion.g
        animate={{
          x: leftHandX,
          y: leftHandY + peekOffset,
        }}
        transition={TRANSITION}
      >
        <circle cx="0" cy="0" r="10" fill="#F5D6B8" />
        {/* Fingers (visible when covering eyes) */}
        {handsCoveringEyes && (
          <g>
            <rect x="-3" y="-14" width="4" height="10" rx="2" fill="#F5D6B8" />
            <rect x="2" y="-15" width="4" height="11" rx="2" fill="#F5D6B8" />
            <rect x="7" y="-14" width="4" height="10" rx="2" fill="#F5D6B8" />
            <rect x="-8" y="-12" width="4" height="8" rx="2" fill="#F5D6B8" />
          </g>
        )}
      </motion.g>

      {/* Right hand */}
      <motion.g
        animate={{
          x: rightHandX,
          y: rightHandY + peekOffset,
        }}
        transition={TRANSITION}
      >
        <circle cx="0" cy="0" r="10" fill="#F5D6B8" />
        {handsCoveringEyes && (
          <g>
            <rect x="-3" y="-14" width="4" height="10" rx="2" fill="#F5D6B8" />
            <rect x="2" y="-15" width="4" height="11" rx="2" fill="#F5D6B8" />
            <rect x="7" y="-14" width="4" height="10" rx="2" fill="#F5D6B8" />
            <rect x="-8" y="-12" width="4" height="8" rx="2" fill="#F5D6B8" />
          </g>
        )}
      </motion.g>

      {/* === MEDICINE BOTTLE (floats when hands cover eyes) === */}
      <AnimatePresence>
        {isPasswordState && (
          <motion.g
            initial={{ opacity: 0, y: 10, x: 45 }}
            animate={{ opacity: 1, y: [-5, -10, -5], x: 45 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{
              opacity: { duration: 0.3 },
              y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
            }}
          >
            {/* Bottle body */}
            <rect x="-6" y="-8" width="12" height="18" rx="2" fill="#4ADE80" stroke="#22C55E" strokeWidth="0.8" />
            {/* Bottle cap */}
            <rect x="-4" y="-12" width="8" height="5" rx="1" fill="white" stroke="#D1D5DB" strokeWidth="0.5" />
            {/* Label */}
            <rect x="-4" y="-4" width="8" height="8" rx="1" fill="white" opacity="0.8" />
            {/* Rx on label */}
            <text x="0" y="2" fontSize="5" fill={colors.deepTeal} fontWeight="bold" fontFamily="serif" textAnchor="middle">
              Rx
            </text>
            {/* Small sparkles around bottle */}
            <motion.circle
              cx="-10" cy="-10"
              r="1"
              fill={colors.gold}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
            />
            <motion.circle
              cx="10" cy="-15"
              r="1.2"
              fill={colors.gold}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            />
            <motion.circle
              cx="12" cy="5"
              r="0.8"
              fill={colors.gold}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
            />
          </motion.g>
        )}
      </AnimatePresence>

      {/* === SUCCESS SPARKLES === */}
      <AnimatePresence>
        {isSuccess && (
          <g>
            {[
              { x: -35, y: -50, delay: 0 },
              { x: 30, y: -55, delay: 0.1 },
              { x: -20, y: -65, delay: 0.2 },
              { x: 40, y: -40, delay: 0.15 },
              { x: -40, y: -35, delay: 0.25 },
              { x: 15, y: -70, delay: 0.05 },
            ].map((spark, i) => (
              <motion.circle
                key={i}
                cx={spark.x}
                cy={spark.y}
                r={2}
                fill={colors.gold}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0], y: spark.y - 15 }}
                transition={{ duration: 0.6, delay: spark.delay }}
              />
            ))}
          </g>
        )}
      </AnimatePresence>

      {/* === BREATHING ANIMATION (idle) === */}
      {state === 'idle' && (
        <motion.rect
          x="-30" y="5" width="60" height="50" rx="12"
          fill="transparent"
          animate={{ scaleY: [1, 1.01, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '0px 30px' }}
        />
      )}
    </motion.svg>
  );
});
