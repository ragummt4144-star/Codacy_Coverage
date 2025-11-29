export interface BulkMessageInput {
  phone_number: string;
  message: string;
}

export interface MessageSentData {
  phoneNumber: string;
  status: string;
}

export interface MessageFailedData {
  phoneNumber: string;
  error: string;
}

export interface BulkProgressData {
  current: number;
  total: number;
  phoneNumber: string;
  status: string;
}

export interface BulkCompletedData {
  successCount: number;
  failedCount: number;
  logs: any[];
}

export interface ServiceErrorData {
  errorMessage: string;
}

declare global {
  interface Window {
    api: {
      // Service control
      startService: () => Promise<{ success: boolean; error?: string }>;
      stopService: () => Promise<{ success: boolean; error?: string }>;
      
      // Messaging
      sendMessage: (phoneNumber: string, message: string) => Promise<{ 
        success: boolean; 
        phoneNumber: string;
        message: string;
        timestamp: number;
        error?: string 
      }>;
      
      // Bulk messaging
      startBulk: (data: BulkMessageInput[]) => Promise<{ success: boolean; error?: string }>;
      stopBulk: () => Promise<{ success: boolean; stopped: number }>;
      
      // Event listeners
      onReady: (callback: () => void) => () => void;
      onStopped: (callback: () => void) => () => void;
      onMessageSent: (callback: (data: MessageSentData) => void) => () => void;
      onMessageFailed: (callback: (data: MessageFailedData) => void) => () => void;
      onBulkProgress: (callback: (data: BulkProgressData) => void) => () => void;
      onBulkCompleted: (callback: (data: BulkCompletedData) => void) => () => void;
      onServiceError: (callback: (data: ServiceErrorData) => void) => () => void;
    };
  }
}
