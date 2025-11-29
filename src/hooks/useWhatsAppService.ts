import { useState, useEffect, useCallback } from 'react';

interface BulkMessageInput {
  phone_number: string;
  message: string;
}

interface MessageSentData {
  phoneNumber: string;
  status: string;
}

interface MessageFailedData {
  phoneNumber: string;
  error: string;
}

interface BulkProgressData {
  current: number;
  total: number;
  phoneNumber: string;
  status: string;
}

interface BulkCompletedData {
  successCount: number;
  failedCount: number;
  logs: any[];
}

interface ServiceErrorData {
  errorMessage: string;
}

export interface UseWhatsAppServiceReturn {
  isRunning: boolean;
  isProcessing: boolean;
  isBulkRunning: boolean;
  progress: { current: number; total: number };
  logs: any[];
  error: string | null;
  setError: (msg: string | null) => void;
  clearError: () => void;
  sendMessage: (phone: string, msg: string) => Promise<void>;
  startService: () => Promise<void>;
  stopService: () => Promise<void>;
  startBulk: (data: BulkMessageInput[]) => Promise<void>;
  stopBulk: () => Promise<void>;
}

export const useWhatsAppService = (): UseWhatsAppServiceReturn => {
  const [isRunning, setIsRunning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isBulkRunning, setIsBulkRunning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [logs, setLogs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubReady = globalThis.api.onReady(() => {
      setIsRunning(true);
      setError(null);
      console.log('✅ WhatsApp service ready');
    });
    const unsubStopped = globalThis.api.onStopped(() => {
      setIsRunning(false);
      setIsProcessing(false);
      setIsBulkRunning(false);
      console.log('🛑 WhatsApp service stopped');
    });
    const unsubMessageSent = globalThis.api.onMessageSent((data: MessageSentData) => {
      console.log('✅ Message sent:', data);
    });
    const unsubMessageFailed = globalThis.api.onMessageFailed((data: MessageFailedData) => {
      setError(data.error);
      console.error('❌ Message failed:', data);
    });
    const unsubBulkProgress = globalThis.api.onBulkProgress((data: BulkProgressData) => {
      setProgress({ current: data.current, total: data.total });
      console.log(`📊 Progress: ${data.current}/${data.total} - ${data.phoneNumber}`);
    });
    const unsubBulkCompleted = globalThis.api.onBulkCompleted((data: BulkCompletedData) => {
      setLogs(data.logs);
      setIsProcessing(false);
      setIsBulkRunning(false);
      setProgress({ current: 0, total: 0 });
      console.log('✅ Bulk messaging completed:', data);
      alert(`✅ Bulk messaging completed!\n\nSuccess: ${data.successCount}\nFailed: ${data.failedCount}`);
    });
    const unsubServiceError = globalThis.api.onServiceError((data: ServiceErrorData) => {
      setError(data.errorMessage);
      console.error('❌ Service error:', data.errorMessage);
      console.error('Full error details:', data);
    });
    return () => {
      unsubReady();
      unsubStopped();
      unsubMessageSent();
      unsubMessageFailed();
      unsubBulkProgress();
      unsubBulkCompleted();
      unsubServiceError();
    };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const startService = useCallback(async () => {
    try {
      setError(null);
      const result = await globalThis.api.startService();
      if (!result.success && result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const stopService = useCallback(async () => {
    try {
      await globalThis.api.stopService();
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  const sendMessage = useCallback(async (phone: string, msg: string) => {
    try {
      setError(null);
      const phoneStr = String(phone);
      const result = await globalThis.api.sendMessage(phoneStr, msg);
      if (!result.success && result.error) {
        setError(result.error);
        throw new Error(result.error);
      }
    } catch (err) {
      setError((err as Error).message);
      throw err;
    }
  }, []);

  const startBulk = useCallback(async (data: BulkMessageInput[]) => {
    setIsProcessing(true);
    setIsBulkRunning(true);
    setProgress({ current: 0, total: data.length });
    setError(null);
    try {
      const result = await globalThis.api.startBulk(data);
      if (!result.success && result.error) {
        setError(result.error);
        setIsProcessing(false);
        setIsBulkRunning(false);
      }
    } catch (err) {
      setError((err as Error).message);
      setIsProcessing(false);
      setIsBulkRunning(false);
    }
  }, []);

  const stopBulk = useCallback(async () => {
    try {
      await globalThis.api.stopBulk();
    } finally {
      setIsProcessing(false);
      setIsBulkRunning(false);
      setProgress({ current: 0, total: 0 });
    }
  }, []);

  return {
    isRunning,
    isProcessing,
    isBulkRunning,
    progress,
    logs,
    error,
    setError,
    clearError,
    sendMessage,
    startService,
    stopService,
    startBulk,
    stopBulk,
  };
};
