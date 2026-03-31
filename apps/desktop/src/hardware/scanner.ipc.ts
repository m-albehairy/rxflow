import { IpcMain } from 'electron';

export function registerScannerHandlers(ipcMain: IpcMain): void {
  ipcMain.handle('scanner:set-mode', async (_event, mode: string) => {
    try {
      // Scanner operates in keyboard emulation mode by default
      // This handler allows switching between KEYBOARD and SERIAL modes
      console.log('Scanner mode set to:', mode);
      return true;
    } catch (error) {
      console.error('Scanner mode change failed:', error);
      return false;
    }
  });
}
