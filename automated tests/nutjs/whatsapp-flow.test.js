const { mouse, keyboard, screen, Button, Key } = require("@nut-tree/nut-js");

describe('Whatsapp Service UI Flow', () => {
  it('should navigate and trigger the main whatsapp service', async () => {
    // Example: Move and click (replace x,y with actual coordinates or screen.find usage)
    await mouse.move({ x: 100, y: 200 });
    await mouse.click(Button.LEFT);

    // Example: Enter text
    await keyboard.type('Hello from nut.js!');

    // Add further steps to interact with your app as a user and cover as many flows as possible
  },60000);
});
