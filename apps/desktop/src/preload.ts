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
});
