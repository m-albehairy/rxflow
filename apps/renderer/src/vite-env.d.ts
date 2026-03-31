/// <reference types="vite/client" />

interface Window {
  electronAPI?: {
    printer: {
      printInvoice: (data: unknown) => Promise<boolean>;
      openDrawer: () => Promise<boolean>;
      test: () => Promise<boolean>;
    };
    scanner: {
      setMode: (mode: string) => Promise<void>;
    };
    hardware: {
      getStatus: () => Promise<{ printer: string; scanner: string; drawer: string }>;
    };
  };
}
