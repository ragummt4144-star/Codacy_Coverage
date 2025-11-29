import { app, BrowserWindow, ipcMain } from 'electron';
import path from "node:path";
import { WhatsAppService } from './whatsapp-service';

let mainWindow: BrowserWindow | null = null;
let whatsappService: WhatsAppService;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 450,
    height: 800,
    minWidth: 400,
    minHeight: 600,
    maxWidth: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'), // CHANGED: Remove '../preload/'
    },
    backgroundColor: '#f5f5f5',
    title: 'WhatsApp Bulk Messenger',
    resizable: true,
    center: true,
    autoHideMenuBar: true,
  });

  const isDev = process.env.VITE_DEV_SERVER_URL;
  if (isDev) {
    mainWindow.loadURL(isDev);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

await app.whenReady();

createWindow();

if (mainWindow) {
  whatsappService = new WhatsAppService(mainWindow);
  setupIpcHandlers(whatsappService);
}

app.on('window-all-closed', async () => {
  if (whatsappService) {
    await whatsappService.stop();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

function setupIpcHandlers(service: WhatsAppService): void {
  ipcMain.handle('whatsapp:start', async () => {
    try {
      await service.start();
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('whatsapp:stop', async () => {
    try {
      await service.stop();
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  });

  ipcMain.handle('message:send', async (_, args: { phoneNumber: string; message: string }) => {
    try {
      await service.sendSingleMessage(args.phoneNumber, args.message);
      return { 
        success: true,
        phoneNumber: args.phoneNumber,
        message: args.message,
        timestamp: Date.now()
      };
    } catch (error) {
      return { 
        success: false, 
        phoneNumber: args.phoneNumber,
        message: args.message,
        timestamp: Date.now(),
        error: (error as Error).message 
      };
    }
  });

  ipcMain.handle('bulk:start', async (_, args: { data: Array<{ phone_number: string; message: string }> }) => {
  service.sendBulkMessages(args.data).catch((error) => {
    console.error('Bulk messaging error:', error);
    if (mainWindow) {
      mainWindow.webContents.send('service:error', {
        errorMessage: (error as Error).message
      });
    }
  });
  // Always return success, or handle logical errors elsewhere
  return { success: true };
});


  ipcMain.handle('bulk:stop', async () => {
    service.stopBulk();
    return { success: true, stopped: 0 };
  });
}
