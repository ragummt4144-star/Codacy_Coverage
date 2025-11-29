// src/global.d.ts
export {}; // <-- THIS IS REQUIRED for Vite/ESM context!

declare global {
  interface ApiBridge {
    onReady: (cb: () => void) => () => void;
    onStopped: (cb: () => void) => () => void;
    onMessageSent: (cb: (data: any) => void) => () => void;
    onMessageFailed: (cb: (data: any) => void) => () => void;
    onBulkProgress: (cb: (data: any) => void) => () => void;
    onBulkCompleted: (cb: (data: any) => void) => () => void;
    onServiceError: (cb: (data: any) => void) => () => void;
    startService: () => Promise<any>;
    stopService: () => Promise<any>;
    sendMessage: (phone: string, msg: string) => Promise<any>;
    startBulk: (data: any[]) => Promise<any>;
    stopBulk: () => Promise<any>;
  }
  // Add to globalThis type
  // @ts-ignore for ESM compatibility (some environments need type override)
  var api: ApiBridge;
  interface GlobalThis {
    api: ApiBridge;
  }
}
