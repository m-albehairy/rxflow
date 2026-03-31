import { useEffect, useRef, useCallback } from 'react';
import { BARCODE_TIMEOUT_MS, BARCODE_MIN_LENGTH } from '@pharmapos/shared';

interface UseBarcodeOptions {
  onScan: (barcode: string) => void;
  enabled?: boolean;
}

export function useBarcode({ onScan, enabled = true }: UseBarcodeOptions) {
  const buffer = useRef('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore if user is typing in an input field (except barcode-specific ones)
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' &&
        !target.hasAttribute('data-barcode-input')
      ) {
        return;
      }

      if (event.key === 'Enter') {
        if (buffer.current.length >= BARCODE_MIN_LENGTH) {
          onScan(buffer.current);
        }
        buffer.current = '';
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        return;
      }

      // Only accept printable characters
      if (event.key.length === 1) {
        buffer.current += event.key;

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          buffer.current = '';
        }, BARCODE_TIMEOUT_MS);
      }
    },
    [enabled, onScan],
  );

  useEffect(() => {
    if (enabled) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [enabled, handleKeyDown]);
}
