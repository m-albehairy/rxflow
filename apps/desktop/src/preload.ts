import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  printer: {
    printInvoice: (data: unknown) => ipcRenderer.invoke('printer:print-invoice', data),
    openDrawer: () => ipcRenderer.invoke('printer:open-drawer'),
    test: () => ipcRenderer.invoke('printer:test'),
  },
  scanner: {
    setMode: (mode: string) => ipcRenderer.invoke('scanner:set-mode', mode),
  },
  hardware: {
    getStatus: () => ipcRenderer.invoke('hardware:get-status'),
  },
  notifications: {
    showNative: (data: { title: string; body: string; severity?: string; silent?: boolean }) =>
      ipcRenderer.invoke('notification:show-native', data),
    setBadgeCount: (count: number) =>
      ipcRenderer.invoke('notification:set-badge-count', count),
    clearBadge: () => ipcRenderer.invoke('notification:clear-badge'),
    onClicked: (callback: () => void) => {
      ipcRenderer.on('notification:clicked', callback);
      return () => ipcRenderer.removeListener('notification:clicked', callback);
    },
  },
});
