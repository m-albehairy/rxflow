import { useCallback } from 'react';

export function usePrinter() {
  const printInvoice = useCallback(async (data: unknown): Promise<boolean> => {
    if (window.electronAPI?.printer) {
      return window.electronAPI.printer.printInvoice(data);
    }
    console.warn('Printer not available (not running in Electron)');
    return false;
  }, []);

  const openDrawer = useCallback(async (): Promise<boolean> => {
    if (window.electronAPI?.printer) {
      return window.electronAPI.printer.openDrawer();
    }
    console.warn('Cash drawer not available');
    return false;
  }, []);

  const testPrinter = useCallback(async (): Promise<boolean> => {
    if (window.electronAPI?.printer) {
      return window.electronAPI.printer.test();
    }
    console.warn('Printer test not available');
    return false;
  }, []);

  const isAvailable = !!window.electronAPI?.printer;

  return { printInvoice, openDrawer, testPrinter, isAvailable };
}
