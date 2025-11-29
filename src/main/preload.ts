import { contextBridge, ipcRenderer } from 'electron';

console.log('✅ Preload script loaded!');

contextBridge.exposeInMainWorld('api', {
  startService: () => ipcRenderer.invoke('whatsapp:start'),
  stopService: () => ipcRenderer.invoke('whatsapp:stop'),
  sendMessage: (phoneNumber: string, message: string) =>
    ipcRenderer.invoke('message:send', { phoneNumber, message }),
  startBulk: (data: Array<{ phone_number: string; message: string }>) =>
    ipcRenderer.invoke('bulk:start', { data }),
  stopBulk: () => ipcRenderer.invoke('bulk:stop'),
  
  onReady: (callback: () => void) => {
    const subscription = () => callback();
    ipcRenderer.on('whatsapp:ready', subscription);
    return () => ipcRenderer.removeListener('whatsapp:ready', subscription);
  },
  
  onStopped: (callback: () => void) => {
    const subscription = () => callback();
    ipcRenderer.on('whatsapp:stopped', subscription);
    return () => ipcRenderer.removeListener('whatsapp:stopped', subscription);
  },
  
  onMessageSent: (callback: (data: any) => void) => {
    const subscription = (_event: any, data: any) => callback(data);
    ipcRenderer.on('message:sent', subscription);
    return () => ipcRenderer.removeListener('message:sent', subscription);
  },
  
  onMessageFailed: (callback: (data: any) => void) => {
    const subscription = (_event: any, data: any) => callback(data);
    ipcRenderer.on('message:failed', subscription);
    return () => ipcRenderer.removeListener('message:failed', subscription);
  },
  
  onBulkProgress: (callback: (data: any) => void) => {
    const subscription = (_event: any, data: any) => callback(data);
    ipcRenderer.on('bulk:progress', subscription);
    return () => ipcRenderer.removeListener('bulk:progress', subscription);
  },
  
  onBulkCompleted: (callback: (data: any) => void) => {
    const subscription = (_event: any, data: any) => callback(data);
    ipcRenderer.on('bulk:completed', subscription);
    return () => ipcRenderer.removeListener('bulk:completed', subscription);
  },
  
  onServiceError: (callback: (data: any) => void) => {
    const subscription = (_event: any, data: any) => callback(data);
    ipcRenderer.on('service:error', subscription);
    return () => ipcRenderer.removeListener('service:error', subscription);
  },
});

console.log('✅ window.api exposed successfully!');
