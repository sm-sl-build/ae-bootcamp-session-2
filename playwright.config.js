module.exports = {
  testDir: './tests/e2e',
  use: {
    headless: true,
    browserName: 'chromium',
    baseURL: 'http://127.0.0.1:3000',
  },
};
