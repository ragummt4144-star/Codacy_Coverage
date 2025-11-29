import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SingleMessage from '../components/SingleMessage';

test('button enables only with valid inputs', () => {
  const onSendMessage = jest.fn();
  const { getByPlaceholderText, getByText } = render(
    <SingleMessage onSendMessage={onSendMessage} isRunning={true} />
  );
  const sendBtn = getByText(/send to/i);

  expect(sendBtn).toBeDisabled();

  fireEvent.change(getByPlaceholderText('+919876543210'), { target: { value: '123' } });
  fireEvent.change(getByPlaceholderText('Type your message...'), { target: { value: 'hi' } });

  expect(sendBtn).not.toBeDisabled();
});

test('alerts on send error', async () => {
  const alertMock = globalThis.alert as jest.Mock;
  const onSendMessage = jest.fn().mockRejectedValue(new Error('fail'));
  const { getByPlaceholderText, getByText } = render(
    <SingleMessage onSendMessage={onSendMessage} isRunning={true} />
  );

  fireEvent.change(getByPlaceholderText('+919876543210'), { target: { value: '123' } });
  fireEvent.change(getByPlaceholderText('Type your message...'), { target: { value: 'Hi' } });
  fireEvent.click(getByText(/send to/i));

  await waitFor(() => expect(alertMock).toHaveBeenCalled());

  alertMock.mockRestore();
});
