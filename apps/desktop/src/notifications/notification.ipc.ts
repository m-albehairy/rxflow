import { IpcMain, BrowserWindow, Notification, app, shell } from 'electron';

interface ShowNativePayload {
  title: string;
  body: string;
  severity?: 'INFO' | 'WARNING' | 'CRITICAL';
  silent?: boolean;
}

export function registerNotificationHandlers(
  ipcMain: IpcMain,
  getMainWindow: () => BrowserWindow | null,
): void {
  ipcMain.handle(
    'notification:show-native',
    async (_event, data: ShowNativePayload) => {
      if (!Notification.isSupported()) return false;

      const notification = new Notification({
        title: data.title,
        body: data.body,
        silent: data.silent ?? data.severity !== 'CRITICAL',
      });

      notification.on('click', () => {
        const win = getMainWindow();
        if (win) {
          if (win.isMinimized()) win.restore();
          win.focus();
          win.webContents.send('notification:clicked');
        }
      });

      notification.show();

      // Flash taskbar for CRITICAL notifications (Windows/Linux)
      if (data.severity === 'CRITICAL') {
        const win = getMainWindow();
        if (win && !win.isFocused()) {
          win.flashFrame(true);
        }
        // System beep for CRITICAL
        if (!data.silent) {
          shell.beep();
        }
      }

      return true;
    },
  );

  ipcMain.handle(
    'notification:set-badge-count',
    async (_event, count: number) => {
      app.setBadgeCount(count);
      return true;
    },
  );

  ipcMain.handle('notification:clear-badge', async () => {
    app.setBadgeCount(0);
    const win = getMainWindow();
    if (win) win.flashFrame(false);
    return true;
  });
}
