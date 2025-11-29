module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': ['babel-jest', {
      presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript']
    }],
    '^.+\\.js$': 'babel-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  transformIgnorePatterns: [
    "/node_modules/(?!@nut-tree/nut-js|clipboardy)/"
  ],

  setupFilesAfterEnv: [
    '<rootDir>/src/setupTests.ts',
    '@testing-library/jest-dom'
  ]
};
