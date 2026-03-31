import { useState, useCallback, useRef } from 'react';

export type CharacterState =
  | 'idle'
  | 'username-focus'
  | 'username-typing'
  | 'password-focus'
  | 'password-typing'
  | 'loading'
  | 'error'
  | 'success';

export interface LoginAnimationControls {
  characterState: CharacterState;
  usernameLength: number;
  passwordPeek: boolean;
  onUsernameFocus: () => void;
  onUsernameBlur: () => void;
  onUsernameChange: (value: string) => void;
  onPasswordFocus: () => void;
  onPasswordBlur: () => void;
  onPasswordChange: () => void;
  onSubmitStart: () => void;
  onSubmitError: () => void;
  onSubmitSuccess: () => void;
}

export function useLoginAnimationState(): LoginAnimationControls {
  const [characterState, setCharacterState] = useState<CharacterState>('idle');
  const [usernameLength, setUsernameLength] = useState(0);
  const [passwordPeek, setPasswordPeek] = useState(false);
  const peekTimeout = useRef<ReturnType<typeof setTimeout>>();
  const focusedField = useRef<'username' | 'password' | null>(null);

  const onUsernameFocus = useCallback(() => {
    focusedField.current = 'username';
    setCharacterState('username-focus');
  }, []);

  const onUsernameBlur = useCallback(() => {
    focusedField.current = null;
    setCharacterState('idle');
  }, []);

  const onUsernameChange = useCallback((value: string) => {
    setUsernameLength(value.length);
    if (focusedField.current === 'username') {
      setCharacterState('username-typing');
    }
  }, []);

  const onPasswordFocus = useCallback(() => {
    focusedField.current = 'password';
    setCharacterState('password-focus');
  }, []);

  const onPasswordBlur = useCallback(() => {
    focusedField.current = null;
    setCharacterState('idle');
  }, []);

  const onPasswordChange = useCallback(() => {
    setCharacterState('password-typing');
    // Peek briefly then close
    setPasswordPeek(true);
    if (peekTimeout.current) clearTimeout(peekTimeout.current);
    peekTimeout.current = setTimeout(() => {
      setPasswordPeek(false);
    }, 150);
  }, []);

  const onSubmitStart = useCallback(() => {
    focusedField.current = null;
    setCharacterState('loading');
  }, []);

  const onSubmitError = useCallback(() => {
    setCharacterState('error');
    setTimeout(() => {
      setCharacterState('idle');
    }, 1500);
  }, []);

  const onSubmitSuccess = useCallback(() => {
    setCharacterState('success');
  }, []);

  return {
    characterState,
    usernameLength,
    passwordPeek,
    onUsernameFocus,
    onUsernameBlur,
    onUsernameChange,
    onPasswordFocus,
    onPasswordBlur,
    onPasswordChange,
    onSubmitStart,
    onSubmitError,
    onSubmitSuccess,
  };
}
