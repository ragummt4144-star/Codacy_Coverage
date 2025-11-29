import { renderHook, act, waitFor } from '@testing-library/react';
import { useWhatsAppService } from '../hooks/useWhatsAppService';

beforeEach(() => {
  globalThis.api = {
    onReady: jest.fn(cb => {
      cb();
      return () => {};
    }),
    onStopped: jest.fn(() => () => {}),
    onMessageSent: jest.fn(() => () => {}),
    onMessageFailed: jest.fn(() => () => {}),
    onBulkProgress: jest.fn(() => () => {}),
    onBulkCompleted: jest.fn(() => () => {}),
    onServiceError: jest.fn(() => () => {}),
    startService: jest.fn().mockResolvedValue({ success: true }),
    stopService: jest.fn().mockResolvedValue({}),
    sendMessage: jest.fn().mockResolvedValue({ success: true }),
    startBulk: jest.fn().mockResolvedValue({ success: true }),
    stopBulk: jest.fn().mockResolvedValue({}),
  } as any;
});

test('startService success and error sets error state correctly', async () => {
  const { result } = renderHook(() => useWhatsAppService());

  await act(async () => {
    await result.current.startService();
  });
  expect(result.current.isRunning).toBe(true);
  expect(result.current.error).toBeNull();

  globalThis.api.startService = jest.fn().mockResolvedValue({ success: false, error: 'fail reason' });
  await act(async () => {
    await result.current.startService();
  });
  expect(result.current.error).toBe('fail reason');
});

test('sendMessage success and failure sets error state and throws', async () => {
  const { result } = renderHook(() => useWhatsAppService());
  await act(async () => {
    await result.current.sendMessage('1234', 'hello');
  });
  expect(result.current.error).toBeNull();

  globalThis.api.sendMessage = jest.fn().mockRejectedValue(new Error('send fail'));

  await expect(
    act(async () => {
      await result.current.sendMessage('0000', 'fail');
    })
  ).rejects.toThrow('send fail');

  await waitFor(() => expect(result.current.error).toBe('send fail'));
});

test('startBulk sets processing and bulk flags and resets on completion', async () => {
  const { result } = renderHook(() => useWhatsAppService());

  const bulkData = [
    { phone_number: '1111', message: 'msg1' },
    { phone_number: '2222', message: 'msg2' },
  ];
  await act(async () => {
    await result.current.startBulk(bulkData);
  });

  await waitFor(() => {
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.isBulkRunning).toBe(false);
  });
  expect(result.current.progress.total).toBe(bulkData.length);
});

test('stopBulk resets processing, bulk and progress states', async () => {
  const { result } = renderHook(() => useWhatsAppService());

  await act(async () => {
    await result.current.startBulk([{ phone_number: '123', message: 'msg' }]);
  });

  await act(async () => {
    await result.current.stopBulk();
  });

  await waitFor(() => {
    expect(result.current.isProcessing).toBe(false);
    expect(result.current.isBulkRunning).toBe(false);
    expect(result.current.progress.total).toBe(0);
  });
});

test('clearError sets error to null', () => {
  const { result } = renderHook(() => useWhatsAppService());

  act(() => {
    result.current.setError('Error message');
  });
  expect(result.current.error).toBe('Error message');

  act(() => {
    result.current.clearError();
  });
  expect(result.current.error).toBeNull();
});
