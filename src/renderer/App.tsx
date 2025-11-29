import { useWhatsAppService } from '../hooks/useWhatsAppService';
import SingleMessage from './components/SingleMessage';
import BulkMessage from './components/BulkMessage';

function App() {
  const {
    isRunning,
    isProcessing,
    progress,
    error,
    startService,
    stopService,
    sendMessage,
    startBulk,
    stopBulk,
  } = useWhatsAppService();

  const handleSendToContacts = async (phones: string[], message: string) => {
    for (let i = 0; i < phones.length; i++) {
      const phone = phones[i];
      try {
        await sendMessage(phone, message);
      } catch (error) {
        console.error(`Failed: ${phone}`, error);
        throw error;
      }
      if (i < phones.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#f0f2f5', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div style={{ padding: '10px 15px', background: '#25d366', color: 'white', textAlign: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>📱 WhatsApp Messenger</h1>
      </div>

      {/* Status Bar */}
      <div
        style={{
          padding: '8px 15px',
          background: isRunning ? '#d4edda' : '#f8d7da',
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{isRunning ? '🟢 Running' : '🔴 Stopped'}</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={startService}
            disabled={isRunning}
            style={{
              padding: '6px 16px',
              fontSize: '16px',
              background: isRunning ? '#999' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            ▶️ Start
          </button>
          <button
            onClick={stopService}
            disabled={!isRunning}
            style={{
              padding: '6px 16px',
              fontSize: '16px',
              background: isRunning ? '#dc3545' : '#999',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isRunning ? 'pointer' : 'not-allowed',
              fontWeight: 'bold'
            }}
          >
            ⏹️ Stop
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '8px 15px', background: '#f8d7da', color: '#721c24', fontSize: '14px', fontWeight: 'bold' }}>
          ❌ {error}
        </div>
      )}

      {/* Content */}
      <div style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
        <SingleMessage onSendMessage={handleSendToContacts} isRunning={isRunning} />
        <BulkMessage
          onStartBulk={startBulk}
          onStopBulk={stopBulk}
          isProcessing={isProcessing}
          progress={progress}
          isRunning={isRunning}
        />
      </div>
    </div>
  );
}

export default App;
