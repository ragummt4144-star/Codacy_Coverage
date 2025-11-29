import '@testing-library/jest-dom';
global.alert = jest.fn();
global.confirm = jest.fn();
global.prompt = jest.fn();