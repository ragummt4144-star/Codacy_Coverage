import React, { useState } from 'react';
import * as XLSX from 'xlsx';

interface BulkMessageProps {
  onStartBulk: (data: Array<{ phone_number: string; message: string }>) => void;
  onStopBulk: () => void;
  isProcessing: boolean;
  progress: { current: number; total: number };
  isRunning: boolean;
}

export default function BulkMessage({ onStartBulk, onStopBulk, isProcessing, progress, isRunning }: BulkMessageProps) {
  const [data, setData] = useState<Array<{ phone_number: string; message: string }>>([]);
  const [fileName, setFileName] = useState('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const bytes = new Uint8Array(ev.target?.result as ArrayBuffer);
        const wb = XLSX.read(bytes, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<{ phone_number: string; message: string }>(ws);
        const valid = json.filter(r => r.phone_number && r.message);
        if (valid.length === 0) return alert('❌ No valid data found');
        setData(valid);
      } catch {
        alert('❌ Failed to read file');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const pct = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <div style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '6px', background: '#fff' }}>
      <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#25d366' }}>📤 Bulk Send</div>
      
      <input type="file" accept=".xlsx,.xls" onChange={handleFile} disabled={!isRunning || isProcessing} style={{ width: '100%', padding: '6px', fontSize: '14px', marginBottom: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
      
      {fileName && <div style={{ fontSize: '15px', color: '#28a745', marginBottom: '8px', fontWeight: 'bold' }}>✅ {fileName} ({data.length} contacts)</div>}

      {data.length > 0 && !isProcessing && (
        <button onClick={() => onStartBulk(data)} disabled={!isRunning} style={{ width: '100%', padding: '8px', fontSize: '18px', background: !isRunning ? '#999' : '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: !isRunning ? 'not-allowed' : 'pointer', fontWeight: 'bold', marginBottom: '8px' }}>
          🚀 Start Bulk ({data.length} messages)
        </button>
      )}

      {isProcessing && (
        <>
          <div style={{ fontSize: '16px', marginBottom: '6px', fontWeight: 'bold' }}>📊 Progress: {progress.current}/{progress.total} ({pct.toFixed(0)}%)</div>
          <div style={{ width: '100%', height: '20px', background: '#e9ecef', borderRadius: '10px', overflow: 'hidden', marginBottom: '8px' }}>
            <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #28a745, #20c997)', transition: 'width 0.3s' }} />
          </div>
          <button onClick={onStopBulk} style={{ width: '100%', padding: '8px', fontSize: '18px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            ⏹️ Stop Bulk
          </button>
        </>
      )}
    </div>
  );
}
