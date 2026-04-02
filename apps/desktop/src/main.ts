import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { registerPrinterHandlers } from './hardware/printer.ipc';
import { registerDrawerHandlers } from './hardware/drawer.ipc';
import { registerScannerHandlers } from './hardware/scanner.ipc';
import { registerNotificationHandlers } from './notifications/notification.ipc';

const isDev = process.env.ELECTRON_IS_DEV === 'true';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: 'PharmaPOS',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (isDev) {
    const rendererPort = process.env.RENDERER_PORT || '5173';
    mainWindow.loadURL(`http://localhost:${rendererPort}`);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  // Register IPC handlers
  registerPrinterHandlers(ipcMain);
  registerDrawerHandlers(ipcMain);
  registerScannerHandlers(ipcMain);
  registerNotificationHandlers(ipcMain, () => mainWindow);

  // Hardware status handler
  ipcMain.handle('hardware:get-status', async () => {
    return {
      printer: 'disconnected',
      scanner: 'ready',
      drawer: 'closed',
    };
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
