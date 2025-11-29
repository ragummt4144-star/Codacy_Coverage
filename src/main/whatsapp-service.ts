import puppeteer, { Browser, Page } from 'puppeteer';
import { BrowserWindow } from 'electron';
import fs from 'node:fs';
import path from 'node:path';

interface MessageLog {
  timestamp: string;
  phoneNumber: string;
  message: string;
  status: 'success' | 'failed' | 'skipped';
  error?: string;
}

export class WhatsAppService {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private readonly mainWindow: BrowserWindow;
  private logs: MessageLog[] = [];
  private isBulkProcessing = false;
  private readonly logsPath: string;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.logsPath = path.join(
      process.env.HOME || process.env.USERPROFILE || '',
      '.whatsapp-messenger',
      'logs.json'
    );
    this.loadLogs();
  }

  async start(): Promise<void> {
    try {
      console.log('🚀 Starting WhatsApp service...');
      await this.launchBrowser();
      await this.setupPage();
      const authenticated = await this.checkAuthentication();
      if (!authenticated) {
        await this.waitForAuthentication();
      }
      console.log('✅ WhatsApp loaded successfully');
      await this.delay(2000);
      this.mainWindow.webContents.send('whatsapp:ready');
      console.log('✅ Service ready - Event sent to renderer');
    } catch (error) {
      console.error('❌ Error starting service:', error);
      this.mainWindow.webContents.send('service:error', {
        errorMessage: (error as Error).message,
      });
      throw error;
    }
  }

  private async launchBrowser() {
    this.browser = await puppeteer.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
      ],
      userDataDir: './whatsapp-session',
    });
  }

  private async setupPage() {
    this.page = await this.browser!.newPage();
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
        '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
    );
    console.log('🌐 Opening WhatsApp Web...');
    await this.page.goto('https://web.whatsapp.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
  }

  private async checkAuthentication(): Promise<boolean> {
    const sidePanelSelectors = [
      '#side',
      '[data-testid="chat-list"]',
      'div[aria-label*="Chat list"]',
      '[data-testid="chatlist-header"]',
      '#pane-side',
      'div._amid',
    ];
    console.log('🔍 Checking authentication status...');
    for (let i = 0; i < 5; i++) {
      for (const selector of sidePanelSelectors) {
        try {
          const element = await this.page!.$(selector);
          if (element) {
            console.log(`✅ Session found (selector: ${selector})`);
            return true;
          }
        } catch {
          // ignore errors
        }
      }
      await this.delay(1000);
    }
    return false;
  }

  // Refactored method: no "needsQRScan" flag, multiple methods instead
  private async waitForAuthentication(): Promise<void> {
    if (await this.isQRCodePresent()) {
      await this.handleQRCodeLogin();
    } else {
      await this.handleSessionLogin();
    }
  }

  private async isQRCodePresent(): Promise<boolean> {
    const qrCodeSelectors = [
      'canvas[aria-label*="Scan"]',
      'canvas[aria-label*="QR"]',
      'div[data-ref]',
    ];
    for (const selector of qrCodeSelectors) {
      try {
        if (await this.page!.$(selector)) {
          console.log('📱 QR code detected - please scan to login');
          return true;
        }
      } catch {
        // ignore errors
      }
    }
    return false;
  }

  private async handleQRCodeLogin(): Promise<void> {
    let authenticated = false;
    let attempts = 0;
    const maxAttempts = 120;

    console.log('⏳ Waiting for QR code scan...');
    while (!authenticated && attempts < maxAttempts) {
      authenticated = await this.checkAuthentication();
      if (!authenticated && attempts % 10 === 0 && attempts > 0) {
        console.log(`⏳ Still waiting... (${attempts} seconds elapsed)`);
      }
      await this.delay(1000);
      attempts++;
    }
    if (!authenticated) {
      throw new Error('WhatsApp Web did not load in time after QR scan');
    }
    console.log('✅ QR code scanned successfully!');
  }

  private async handleSessionLogin(): Promise<void> {
    let authenticated = false;
    let attempts = 0;
    const maxAttempts = 5;

    console.log('🔍 Checking for existing session...');
    while (!authenticated && attempts < maxAttempts) {
      authenticated = await this.checkAuthentication();
      if (!authenticated) {
        await this.delay(1000);
        attempts++;
      }
    }
    if (!authenticated) {
      throw new Error('WhatsApp Web session not detected within timeout');
    }
    console.log('✅ Session detected, user already authenticated.');
  }

  async stop(): Promise<void> {
    this.isBulkProcessing = false;
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
    this.mainWindow.webContents.send('whatsapp:stopped');
    console.log('✅ WhatsApp service stopped');
  }

  async sendSingleMessage(phoneNumber: string, message: string): Promise<void> {
    if (!this.page || !this.browser) {
      throw new Error('WhatsApp service not running');
    }
    const cleanPhone = this.cleanPhoneNumber(phoneNumber);
    console.log(`\n========================================`);
    console.log(`📱 Opening chat for: ${phoneNumber}`);
    console.log(`========================================`);
    try {
      await this.openChatForPhone(cleanPhone);
      const chatName = await this.getChatNameSafe();
      console.log(`👤 Chat name: ${chatName}`);
      const messageBox = await this.findMessageBox();
      await this.prepareMessageBox(messageBox);
      await this.pasteMessage(message);
      await this.verifyMessageSent();

      this.addLog(phoneNumber, message, 'success');
      this.mainWindow.webContents.send('message:sent', {
        phoneNumber,
        status: 'success',
      });

      console.log(`✅ SUCCESS: Message sent to ${phoneNumber} (${chatName})`);
      console.log(`========================================\n`);
    } catch (error) {
      const errorMsg = (error as Error).message;
      console.error(`\n❌ FAILED: ${phoneNumber}`);
      console.error(`❌ Error: ${errorMsg}`);
      console.error(`========================================\n`);

      this.addLog(phoneNumber, message, 'failed', errorMsg);
      this.mainWindow.webContents.send('message:failed', {
        phoneNumber,
        error: errorMsg,
      });
      throw error;
    }
  }

  private async openChatForPhone(cleanPhone: string): Promise<void> {
    const chatUrl = `https://web.whatsapp.com/send?phone=${cleanPhone}`;
    await this.page!.goto(chatUrl, { waitUntil: 'networkidle2', timeout: 40000 });
    console.log('⏳ Waiting 8 seconds for chat to fully load...');
    await this.delay(8000);
    console.log(`🔍 Current URL: ${this.page!.url()}`);
  }

  private async getChatNameSafe(): Promise<string> {
    try {
      return await this.page!.evaluate(() => {
        const header = document.querySelector(
          '[data-testid="conversation-info-header"]'
        ) as HTMLElement;
        return header ? header.innerText.trim() : 'Unknown';
      });
    } catch {
      return 'Unknown';
    }
  }

  private async findMessageBox() {
    const selectors = [
      'div[contenteditable="true"][data-tab="10"]',
      'div[contenteditable="true"][data-tab="6"]',
      'footer div[contenteditable="true"]',
      'div[contenteditable="true"][role="textbox"]',
      '[data-testid="conversation-compose-box-input"]',
      'div[title="Type a message"]',
    ];

    console.log('🔍 Searching for message box...');
    for (let attempt = 0; attempt < 20; attempt++) {
      for (const selector of selectors) {
        try {
          const messageBox = await this.page!.$(selector);
          if (messageBox) {
            console.log(`✅ Found message box: ${selector}`);
            return messageBox;
          }
        } catch {
          // ignore and continue
        }
      }
      console.log(`⏳ Message box not found, retry ${attempt + 1}/20...`);
      await this.delay(1000);
    }
    const timestamp = Date.now();
    await this.page!.screenshot({ path: `error-${timestamp}.png` });
    console.error(`❌ Screenshot saved: error-${timestamp}.png`);
    throw new Error('Message box not found after 20 attempts');
  }

  private async prepareMessageBox(messageBox: any) {
    console.log('🖱️ Clicking message box...');
    await messageBox.click();
    await this.delay(1000);

    console.log('🧹 Clearing any existing text...');
    await this.page!.keyboard.down('Control');
    await this.page!.keyboard.press('KeyA');
    await this.page!.keyboard.up('Control');
    await this.page!.keyboard.press('Backspace');
    await this.delay(500);
  }

  private async pasteMessage(message: string): Promise<void> {
    console.log('📋 Pasting message using clipboard...');
    try {
      await this.page!.evaluate((text) => navigator.clipboard.writeText(text), message);
      await this.delay(300);
      await this.page!.evaluate(() => {
        const box = document.querySelector('footer div[contenteditable="true"]') as HTMLElement;
        if (box) box.focus();
      });
      await this.delay(200);
      await this.page!.keyboard.down('Control');
      await this.page!.keyboard.press('KeyV');
      await this.page!.keyboard.up('Control');
      await this.delay(1500);
      console.log('✅ Paste command executed');
    } catch {
      console.log('⚠️ Clipboard paste failed, using execCommand fallback...');
      await this.page!.evaluate((msg) => {
        const box = document.querySelector('footer div[contenteditable="true"]') as HTMLElement;
        if (box) {
          box.focus();
          document.execCommand('insertText', false, msg);
        }
      }, message);
      await this.delay(1500);
    }

    const finalText = await this.page!.evaluate(() => {
      const box = document.querySelector('footer div[contenteditable="true"]') as HTMLElement;
      return box ? (box.innerText || box.textContent || '').trim() : '';
    });

    console.log(`📝 Text in box: "${finalText.substring(0, 50)}${finalText.length > 50 ? '...' : ''}"`);

    if (!finalText || finalText.length === 0) {
      console.error('❌ Failed to paste message!');
      throw new Error('Failed to paste message into chat box');
    }
  }

  private async verifyMessageSent(): Promise<void> {
    console.log('📤 Pressing Enter to send...');
    await this.page!.keyboard.press('Enter');
    await this.delay(3000);

    const afterSendText = await this.page!.evaluate(() => {
      const box = document.querySelector('footer div[contenteditable="true"]') as HTMLElement;
      return box ? (box.innerText || box.textContent || '').trim() : '';
    });

    if (afterSendText && afterSendText.length > 0) {
      console.warn(`⚠️ WARNING: Message still in box: "${afterSendText}"`);
      throw new Error('Message was not sent - still in input box');
    }
    console.log('✅ Message box cleared - message sent successfully!');
  }

  async sendBulkMessages(data: Array<{ phone_number: string; message: string }>): Promise<void> {
    this.isBulkProcessing = true;
    const total = data.length;
    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < total; i++) {
      if (!this.isBulkProcessing) {
        console.log('⚠️ Bulk messaging cancelled');
        break;
      }

      const { phone_number, message } = data[i];
      try {
        await this.sendSingleMessage(phone_number, message);
        successCount++;

        this.mainWindow.webContents.send('bulk:progress', {
          current: i + 1,
          total,
          phoneNumber: phone_number,
          status: 'success',
        });
      } catch (error) {
        failedCount++;

        this.mainWindow.webContents.send('bulk:progress', {
          current: i + 1,
          total,
          phoneNumber: phone_number,
          status: 'failed',
        });
      }

      const delayTime = Math.floor(Math.random() * 3000) + 2000;
      await this.delay(delayTime);
    }

    this.isBulkProcessing = false;
    this.mainWindow.webContents.send('bulk:completed', {
      successCount,
      failedCount,
      logs: this.logs,
    });

    console.log(`✅ Bulk completed: ${successCount} success, ${failedCount} failed`);
  }

  stopBulk(): void {
    this.isBulkProcessing = false;
    console.log('⚠️ Stopping bulk messaging...');
  }

  private cleanPhoneNumber(phone: string): string {
    return String(phone).replaceAll(/\D/g, '');
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private addLog(
    phoneNumber: string,
    message: string,
    status: 'success' | 'failed' | 'skipped',
    error?: string
  ): void {
    const log: MessageLog = {
      timestamp: new Date().toISOString(),
      phoneNumber,
      message,
      status,
      error,
    };
    this.logs.push(log);
    this.saveLogs();
  }

  private saveLogs(): void {
    try {
      const dir = path.dirname(this.logsPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.logsPath, JSON.stringify(this.logs, null, 2), 'utf-8');
    } catch (error) {
      console.error('❌ Error saving logs:', error);
    }
  }

  private loadLogs(): void {
    try {
      if (fs.existsSync(this.logsPath)) {
        const data = fs.readFileSync(this.logsPath, 'utf-8');
        this.logs = JSON.parse(data);
        console.log(`📋 Loaded ${this.logs.length} log entries`);
      }
    } catch (error) {
      console.error('❌ Error loading logs:', error);
      this.logs = [];
    }
  }

  getLogs(): MessageLog[] {
    return this.logs;
  }

  clearLogs(): void {
    this.logs = [];
    this.saveLogs();
    console.log('🗑️ Logs cleared');
  }
}
