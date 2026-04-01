import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { PharmaSvgIllustration } from './PharmaSvgIllustration';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { useUIStore } from '@/store/ui.store';

interface Props {
  onFinish: (values: { username: string; password: string }) => void;
  loading: boolean;
}

const THEME = {
  bg: 'linear-gradient(160deg, #140a28 0%, #261544 40%, #3a1a5c 70%, #4a2a6a 100%)',
  glow: 'rgba(160,100,220,.12)',
  capsuleA: ['#b48ce8', '#8054c4'] as const,
  liquidTint: 'rgba(200,160,240,.3)',
};

export function CareScriptLogin({ onFinish, loading }: Props) {
  const { t } = useTranslation('common');
  const language = useUIStore((s) => s.language);
  const isRTL = language === 'ar';
  const [pwVisible, setPwVisible] = useState(false);
  const [curState, setCurState] = useState<'idle' | 'email' | 'password'>('idle');
  const [charMsg, setCharMsg] = useState(t('loginCharIdle'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  // SVG element refs
  const charSvgRef = useRef<SVGSVGElement>(null);
  const collarLRef = useRef<SVGGElement>(null);
  const collarRRef = useRef<SVGGElement>(null);
  const pupilLRef = useRef<SVGCircleElement>(null);
  const pupilRRef = useRef<SVGCircleElement>(null);
  const peekGRef = useRef<SVGGElement>(null);

  const collarRise = useCallback(() => {
    if (!collarLRef.current) return;
    collarLRef.current.style.transform = 'translateY(-52px)';
    collarRRef.current!.style.transform = 'translateY(-52px)';
    peekGRef.current!.style.opacity = '0';
  }, []);

  const collarDown = useCallback(() => {
    if (!collarLRef.current) return;
    collarLRef.current.style.transform = 'translateY(0)';
    collarRRef.current!.style.transform = 'translateY(0)';
    peekGRef.current!.style.opacity = '0';
  }, []);

  const collarPeek = useCallback(() => {
    if (!collarLRef.current) return;
    collarLRef.current.style.transform = 'translateY(-30px)';
    collarRRef.current!.style.transform = 'translateY(-30px)';
    peekGRef.current!.style.opacity = '1';
  }, []);

  const resetPupils = useCallback(() => {
    if (!pupilLRef.current) return;
    pupilLRef.current.setAttribute('cx', '39');
    pupilLRef.current.setAttribute('cy', '52');
    pupilRRef.current!.setAttribute('cx', '79');
    pupilRRef.current!.setAttribute('cy', '52');
  }, []);

  // Mouse tracking for email state
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (curState !== 'email') return;
      const svg = charSvgRef.current;
      if (!svg) return;
      const r = svg.getBoundingClientRect();

      const cxL = r.left + r.width * 0.33;
      const cy = r.top + r.height * 0.38;
      const aL = Math.atan2(e.clientY - cy, e.clientX - cxL);
      const d = Math.min(4, Math.hypot(e.clientX - cxL, e.clientY - cy) / 48);
      pupilLRef.current?.setAttribute('cx', String(39 + Math.cos(aL) * d));
      pupilLRef.current?.setAttribute('cy', String(52 + Math.sin(aL) * d));

      const cxR = r.left + r.width * 0.67;
      const aR = Math.atan2(e.clientY - cy, e.clientX - cxR);
      const d2 = Math.min(4, Math.hypot(e.clientX - cxR, e.clientY - cy) / 48);
      pupilRRef.current?.setAttribute('cx', String(79 + Math.cos(aR) * d2));
      pupilRRef.current?.setAttribute('cy', String(52 + Math.sin(aR) * d2));
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [curState]);

  // Random idle blink
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const scheduleBlink = () => {
      timeout = setTimeout(() => {
        if (curState !== 'password') {
          pupilLRef.current?.setAttribute('ry', '1.5');
          pupilRRef.current?.setAttribute('ry', '1.5');
          setTimeout(() => {
            pupilLRef.current?.removeAttribute('ry');
            pupilRRef.current?.removeAttribute('ry');
          }, 110);
        }
        scheduleBlink();
      }, 2600 + Math.random() * 3400);
    };
    scheduleBlink();
    return () => clearTimeout(timeout);
  }, [curState]);

  const addBounce = () => {
    const svg = charSvgRef.current;
    if (!svg) return;
    svg.style.animation = 'none';
    void (svg as unknown as HTMLElement).offsetWidth;
    svg.style.animation = 'csBounce 0.5s cubic-bezier(.34,1.56,.64,1)';
    setTimeout(() => { svg.style.animation = ''; }, 600);
  };

  const addWave = () => {
    const svg = charSvgRef.current;
    if (!svg) return;
    svg.style.animation = 'csWave 0.6s ease';
    setTimeout(() => { svg.style.animation = ''; }, 700);
  };

  const handleUsernameFocus = () => {
    setCurState('email');
    collarDown();
    setCharMsg(t('loginCharEmail'));
  };

  const handleUsernameBlur = () => {
    setCurState('idle');
    resetPupils();
    setCharMsg(t('loginCharEmailDone'));
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    const j = (Math.random() - 0.5) * 2.5;
    pupilLRef.current?.setAttribute('cx', String(39 + j));
    pupilRRef.current?.setAttribute('cx', String(79 + j));
  };

  const handlePwFocus = () => {
    setCurState('password');
    if (!pwVisible) {
      collarRise();
      setCharMsg(t('loginCharPwHidden'));
    } else {
      collarPeek();
      setCharMsg(t('loginCharPwVisible'));
    }
  };

  const handlePwBlur = () => {
    setCurState('idle');
    collarDown();
    resetPupils();
    setCharMsg(t('loginCharPwDone'));
  };

  const togglePassword = () => {
    const next = !pwVisible;
    setPwVisible(next);
    if (curState === 'password') {
      if (next) {
        collarPeek();
        setCharMsg(t('loginCharPeek'));
      } else {
        collarRise();
        setCharMsg(t('loginCharSecure'));
      }
    }
  };

  const handleLoginHover = () => {
    if (curState !== 'password') {
      addBounce();
      setCharMsg(t('loginCharReady'));
    }
  };

  const validate = (): boolean => {
    const newErrors: { username?: string; password?: string } = {};
    if (!username.trim()) newErrors.username = t('usernameRequired', 'Username is required');
    if (!password) newErrors.password = t('passwordRequired', 'Password is required');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    if (!validate()) return;
    collarDown();
    resetPupils();
    addWave();
    setCharMsg(t('loginCharSuccess'));
    onFinish({ username, password });
  };

  return (
    <>
      <style>{`
        @keyframes csBounce {
          0%,100% { transform: translateY(0); }
          35%     { transform: translateY(-13px); }
          65%     { transform: translateY(-5px); }
        }
        @keyframes csWave {
          0%,100% { transform: rotate(0); }
          25%     { transform: rotate(-8deg) translateY(-8px); }
          60%     { transform: rotate(6deg) translateY(-4px); }
        }
        .cs-collar { transition: transform .42s cubic-bezier(.34,1.56,.64,1); }
        .cs-peek   { transition: opacity .22s; }
        .cs-char-svg { transition: transform .4s cubic-bezier(.34,1.56,.64,1); }
        .cs-input:focus {
          outline: none;
          border-color: #3b82f6 !important;
          background: #fff !important;
          box-shadow: 0 0 0 4px rgba(59,130,246,.1) !important;
        }
        .cs-btn-login:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(37,99,235,.48) !important;
        }
        .cs-btn-login:active { transform: translateY(0); }
        .cs-eye-btn:hover { color: #3b82f6 !important; }
      `}</style>

      <div style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: isRTL ? 'row-reverse' : 'row',
        direction: isRTL ? 'rtl' : 'ltr',
        fontFamily: "'DM Sans', sans-serif",
        overflow: 'hidden',
      }}>
          {/* LEFT PANEL */}
          <div style={{
            flex: '0 0 40%',
            background: '#fff',
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 2,
            overflowY: 'auto',
          }}>
          {/* Language switcher */}
          <div style={{ position: 'absolute', top: 16, ...(isRTL ? { left: 16 } : { right: 16 }), zIndex: 10 }}>
            <LanguageSwitcher />
          </div>

          <div style={{ width: '100%', maxWidth: '400px' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px' }}>
              <div style={{
                width: '38px', height: '38px',
                background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
                borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <rect x="8.5" y="2" width="3" height="16" rx="1.5" fill="white"/>
                  <rect x="2" y="8.5" width="16" height="3" rx="1.5" fill="white"/>
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: "'Fraunces',serif", fontSize: '20px', fontWeight: 700, color: '#0f1f4e', letterSpacing: '-.4px' }}>
                  {t('appName')}
                </div>
                <div style={{ fontSize: '10.5px', color: '#94a3b8', letterSpacing: '.8px', marginTop: '2px' }}>
                  {t('loginSubtitle')}
                </div>
              </div>
            </div>

            <div style={{ height: '1px', background: 'linear-gradient(90deg,#e2e8f0,transparent)', marginBottom: '20px' }}/>

            <div style={{ fontFamily: "'Fraunces',serif", fontSize: '24px', fontWeight: 600, color: '#0f1f4e', letterSpacing: '-.5px', lineHeight: 1.2 }}>
              {t('loginWelcome')}
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
              {t('loginSubtitle')}
            </div>

            {/* Pharmacist character */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '16px 0 12px' }}>
              <svg
                ref={charSvgRef}
                className="cs-char-svg"
                style={{ width: '118px', height: '136px', filter: 'drop-shadow(0 10px 22px rgba(30,60,150,.14))' }}
                viewBox="0 0 118 136"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="csSkinGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f5c89a"/>
                    <stop offset="100%" stopColor="#e8a870"/>
                  </linearGradient>
                  <linearGradient id="csCoatGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff"/>
                    <stop offset="100%" stopColor="#f0f4ff"/>
                  </linearGradient>
                  <linearGradient id="csHairGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3d2305"/>
                    <stop offset="100%" stopColor="#5c3a10"/>
                  </linearGradient>
                  <filter id="csSoftShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="rgba(0,0,0,.18)"/>
                  </filter>
                </defs>

                {/* Lab coat body */}
                <path d="M8,120 Q6,134 59,134 Q112,134 110,120 L103,96 L15,96 Z" fill="url(#csCoatGrad)" filter="url(#csSoftShadow)"/>
                <path d="M15,96 L26,118 L54,112 L54,95 Z" fill="white"/>
                <path d="M103,96 L92,118 L64,112 L64,95 Z" fill="white"/>
                <path d="M54,95 L54,115 L64,115 L64,95 Z" fill="#dbeafe"/>
                <rect x="55" y="96" width="8" height="18" rx="2" fill="#2563eb" opacity=".7"/>
                <circle cx="59" cy="119" r="2.5" fill="#d1d5db"/>
                <circle cx="59" cy="127" r="2.5" fill="#d1d5db"/>
                <rect x="18" y="106" width="20" height="14" rx="3" fill="rgba(0,0,0,.04)" stroke="#e2e8f0" strokeWidth="1"/>
                <rect x="20" y="103" width="3" height="10" rx="1.5" fill="#3b82f6"/>
                <rect x="24" y="103" width="3" height="8" rx="1.5" fill="#f59e0b"/>
                <path d="M36,105 Q46,116 59,116 Q72,116 82,105" stroke="#9ca3af" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
                <circle cx="59" cy="118" r="4.5" fill="#9ca3af"/>
                <circle cx="59" cy="118" r="2.5" fill="#6b7280"/>
                <line x1="15" y1="100" x2="12" y2="134" stroke="#e9ecf4" strokeWidth="1"/>
                <line x1="103" y1="100" x2="106" y2="134" stroke="#e9ecf4" strokeWidth="1"/>

                {/* Neck */}
                <rect x="49" y="90" width="20" height="12" rx="6" fill="url(#csSkinGrad)"/>

                {/* Head */}
                <ellipse cx="59" cy="58" rx="44" ry="46" fill="url(#csSkinGrad)"/>
                <ellipse cx="59" cy="62" rx="38" ry="38" fill="rgba(200,140,80,.06)"/>
                <path d="M22,68 Q20,85 28,97 Q42,108 59,108 Q76,108 90,97 Q98,85 96,68" fill="rgba(190,130,70,.08)"/>

                {/* Hair */}
                <path d="M16,48 Q18,12 59,10 Q100,12 102,48 Q96,22 59,20 Q22,22 16,48Z" fill="url(#csHairGrad)"/>
                <path d="M18,44 Q28,16 59,14" stroke="rgba(255,255,255,.12)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                <path d="M98,46 Q90,18 65,12" stroke="rgba(255,255,255,.08)" strokeWidth="1" fill="none" strokeLinecap="round"/>
                <path d="M36,16 Q45,14 59,14" stroke="rgba(255,255,255,.15)" strokeWidth="2" fill="none" strokeLinecap="round"/>

                {/* Ears */}
                <ellipse cx="15" cy="63" rx="7.5" ry="9" fill="#eaa870"/>
                <ellipse cx="15" cy="63" rx="4" ry="5.5" fill="#d89060"/>
                <ellipse cx="103" cy="63" rx="7.5" ry="9" fill="#eaa870"/>
                <ellipse cx="103" cy="63" rx="4" ry="5.5" fill="#d89060"/>

                {/* Eyebrows */}
                <path d="M28,40 Q38,36 50,39" stroke="#5c3a10" strokeWidth="2.8" fill="none" strokeLinecap="round"/>
                <path d="M68,39 Q80,36 90,40" stroke="#5c3a10" strokeWidth="2.8" fill="none" strokeLinecap="round"/>

                {/* Eyes */}
                <ellipse cx="39" cy="53" rx="13.5" ry="11" fill="rgba(0,0,0,.05)"/>
                <ellipse cx="39" cy="52" rx="12" ry="10" fill="white"/>
                <circle ref={pupilLRef} cx="39" cy="52" r="5.5" fill="#1a3a6e"/>
                <circle cx="39" cy="52" r="2.5" fill="#0a1a30"/>
                <circle cx="36.5" cy="49.5" r="2" fill="white"/>
                <circle cx="41" cy="54" r="1" fill="rgba(255,255,255,.5)"/>

                <ellipse cx="79" cy="53" rx="13.5" ry="11" fill="rgba(0,0,0,.05)"/>
                <ellipse cx="79" cy="52" rx="12" ry="10" fill="white"/>
                <circle ref={pupilRRef} cx="79" cy="52" r="5.5" fill="#1a3a6e"/>
                <circle cx="79" cy="52" r="2.5" fill="#0a1a30"/>
                <circle cx="76.5" cy="49.5" r="2" fill="white"/>
                <circle cx="81" cy="54" r="1" fill="rgba(255,255,255,.5)"/>

                {/* Glasses */}
                <rect x="24" y="42" width="30" height="22" rx="9" fill="none" stroke="#1e3a8a" strokeWidth="2.2"/>
                <rect x="64" y="42" width="30" height="22" rx="9" fill="none" stroke="#1e3a8a" strokeWidth="2.2"/>
                <path d="M54,52 L64,52" stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round"/>
                <line x1="24" y1="51" x2="14" y2="53" stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round"/>
                <line x1="94" y1="51" x2="103" y2="53" stroke="#1e3a8a" strokeWidth="2" strokeLinecap="round"/>
                <rect x="25" y="43" width="28" height="20" rx="8" fill="rgba(59,130,246,.04)"/>
                <rect x="65" y="43" width="28" height="20" rx="8" fill="rgba(59,130,246,.04)"/>

                {/* Nose & mouth */}
                <path d="M55,65 Q59,72 63,65" stroke="#c8854a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                <path d="M44,80 Q59,90 74,80" stroke="#c07040" strokeWidth="2.2" fill="none" strokeLinecap="round"/>
                <path d="M50,78 Q59,82 68,78" stroke="#d09060" strokeWidth="1" fill="none" strokeLinecap="round"/>

                {/* Cheeks */}
                <ellipse cx="24" cy="70" rx="9" ry="6" fill="rgba(240,130,110,.22)"/>
                <ellipse cx="94" cy="70" rx="9" ry="6" fill="rgba(240,130,110,.22)"/>

                {/* Peek eye */}
                <g ref={peekGRef} className="cs-peek" style={{ opacity: 0 }}>
                  <ellipse cx="59" cy="92" rx="9" ry="7" fill="white"/>
                  <circle cx="59" cy="92" r="3.5" fill="#1a3a6e"/>
                  <circle cx="56.8" cy="90.2" r="1.2" fill="white"/>
                  <path d="M50,86 Q59,82 68,86" stroke="#5c3a10" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
                </g>

                {/* Collar Left */}
                <g ref={collarLRef} className="cs-collar">
                  <path d="M8,120 L34,64 L59,96 L18,112 Z" fill="white"/>
                  <path d="M12,120 L36,68 L57,96 L20,114 Z" fill="rgba(240,244,255,.95)"/>
                  <path d="M12,120 L36,68 L35,70 L11,122 Z" fill="rgba(0,0,0,.04)"/>
                  <path d="M14,116 L38,70" stroke="#e2e8f0" strokeWidth=".8" fill="none" strokeDasharray="3 3"/>
                </g>

                {/* Collar Right */}
                <g ref={collarRRef} className="cs-collar">
                  <path d="M110,120 L84,64 L59,96 L100,112 Z" fill="white"/>
                  <path d="M106,120 L82,68 L61,96 L98,114 Z" fill="rgba(240,244,255,.95)"/>
                  <path d="M106,120 L82,68 L83,70 L107,122 Z" fill="rgba(0,0,0,.04)"/>
                  <path d="M104,116 L80,70" stroke="#e2e8f0" strokeWidth=".8" fill="none" strokeDasharray="3 3"/>
                </g>
              </svg>

              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, height: '17px', marginTop: '6px', textAlign: 'center', fontStyle: 'italic' }}>
                {charMsg}
              </div>
            </div>

            {/* Username field */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '7px' }}>
                {t('username')}
              </label>
              <input
                className="cs-input"
                type="text"
                value={username}
                placeholder={t('username')}
                onChange={(e) => { handleUsernameChange(e); if (errors.username) setErrors((prev) => ({ ...prev, username: undefined })); }}
                onFocus={handleUsernameFocus}
                onBlur={handleUsernameBlur}
                onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
                style={{
                  width: '100%', padding: '13px 18px',
                  border: `1.5px solid ${errors.username ? '#ef4444' : '#e2e8f0'}`, borderRadius: '12px',
                  fontSize: '14px', fontFamily: "'DM Sans',sans-serif",
                  color: '#0f1f4e', background: '#f8fafc',
                  transition: 'border-color .2s,box-shadow .2s,background .2s',
                  boxSizing: 'border-box',
                }}
              />
              {errors.username && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.username}</div>}
            </div>

            {/* Password field */}
            <div style={{ marginBottom: '16px', position: 'relative' }}>
              <label style={{ display: 'block', fontSize: '10.5px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '7px' }}>
                {t('password')}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="cs-input"
                  type={pwVisible ? 'text' : 'password'}
                  value={password}
                  placeholder="••••••••••"
                  onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((prev) => ({ ...prev, password: undefined })); }}
                  onFocus={handlePwFocus}
                  onBlur={handlePwBlur}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
                  style={{
                    width: '100%', padding: isRTL ? '13px 18px 13px 44px' : '13px 44px 13px 18px',
                    border: `1.5px solid ${errors.password ? '#ef4444' : '#e2e8f0'}`, borderRadius: '12px',
                    fontSize: '14px', fontFamily: "'DM Sans',sans-serif",
                    color: '#0f1f4e', background: '#f8fafc',
                    transition: 'border-color .2s,box-shadow .2s,background .2s',
                    boxSizing: 'border-box',
                  }}
                />
                <button
                  className="cs-eye-btn"
                  type="button"
                  onClick={togglePassword}
                  style={{
                    position: 'absolute', ...(isRTL ? { left: '13px' } : { right: '13px' }), top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1',
                    display: 'flex', alignItems: 'center', padding: '3px',
                    transition: 'color .2s',
                  }}
                >
                  {pwVisible ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M17.94 17.94A10 10 0 0112 20c-7 0-11-8-11-8a18 18 0 015.06-5.94M9.9 4.24A9 9 0 0112 4c7 0 11 8 11 8a18 18 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>{errors.password}</div>}
            </div>

            {/* Login button */}
            <button
              className="cs-btn-login"
              type="button"
              disabled={loading}
              onMouseEnter={handleLoginHover}
              onClick={handleLogin}
              style={{
                width: '100%', padding: '14px',
                background: 'linear-gradient(135deg,#2563eb,#1d4ed8)',
                color: '#fff', border: 'none', borderRadius: '12px',
                fontSize: '14px', fontWeight: 600, fontFamily: "'DM Sans',sans-serif",
                cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '.2px',
                boxShadow: '0 6px 20px rgba(37,99,235,.38)',
                transition: 'transform .2s, box-shadow .2s',
                marginTop: '2px',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? t('loading') || 'Signing in...' : t('loginButton')}
            </button>
          </div>
          </div>

          {/* RIGHT PANEL - SVG Illustration */}
          <div style={{
            flex: 1,
            background: THEME.bg,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 30px',

          }}>
            {/* Subtle radial glow */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(ellipse 70% 50% at 55% 55%, ${THEME.glow}, transparent 70%)`,
              pointerEvents: 'none',
  
            }}/>

            <PharmaSvgIllustration
              capsuleColors={THEME.capsuleA}
              liquidTint={THEME.liquidTint}
            />

            {/* Title overlay */}
            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', marginBottom: '8px' }}>
              <div style={{ fontFamily: "'Fraunces',serif", fontSize: '26px', fontWeight: 600, color: 'rgba(255,255,255,.92)', letterSpacing: '-.3px', lineHeight: 1.3, textShadow: '0 2px 16px rgba(0,0,0,.3)' }}>
                {t('loginTagline')}
              </div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.4)', marginTop: '8px', letterSpacing: '1px', textShadow: '0 1px 6px rgba(0,0,0,.2)' }}>
                {t('loginTaglineSub')}
              </div>
            </div>

            {/* Feature tags */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 2, marginTop: '16px' }}>
              {[t('tagEncrypted'), t('tagHipaa'), t('tagFda')].map((tag) => (
                <span key={tag} style={{
                  background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)',
                  borderRadius: '100px', padding: '5px 14px',
                  fontSize: '10.5px', color: 'rgba(255,255,255,.55)', letterSpacing: '.4px',
                  backdropFilter: 'blur(4px)',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
      </div>
    </>
  );
}
