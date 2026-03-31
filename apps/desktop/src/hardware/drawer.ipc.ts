import { IpcMain } from 'electron';

export function registerDrawerHandlers(ipcMain: IpcMain): void {
  ipcMain.handle('printer:open-drawer', async () => {
    try {
      // TODO: Send ESC/POS drawer kick command
      // Command: ESC p m t1 t2 (standard kick pulse)
      console.log('Cash drawer open requested');
      return true;
    } catch (error) {
      console.error('Drawer open failed:', error);
      return false;
    }
  });
}
