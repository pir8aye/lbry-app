/* eslint-disable no-console */
// Module imports
import keytar from 'keytar-prebuild';
import { app, ipcMain, dialog } from 'electron';
import Daemon from './Daemon';
import createTray from './createTray';
import createWindow from './createWindow';

// Keep a global reference, if you don't, they will be closed automatically when the JavaScript
// object is garbage collected.
let rendererWindow;
// eslint-disable-next-line no-unused-vars
let tray;
let daemon;

// Deep linked URI
let deepLinkingURI;
let isQuitting;

const installExtensions = async () => {
  // eslint-disable-next-line import/no-extraneous-dependencies,global-require
  const installer = require('electron-devtools-installer');
  // eslint-disable-next-line import/no-extraneous-dependencies,global-require
  const devtronExtension = require('devtron');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(
      name => installer.default(installer[name], forceDownload),
      devtronExtension.install()
    )
  ).catch(console.log);
};

app.setAsDefaultProtocolClient('lbry');
app.setName('LBRY');

app.on('ready', async () => {
  daemon = new Daemon();
  daemon.on('exit', () => {
    daemon = null;
    if (!isQuitting) {
      dialog.showErrorBox(
        'Daemon has Exited',
        'The daemon may have encountered an unexpected error, or another daemon instance is already running.'
      );
      app.quit();
    }
  });
  daemon.launch();
  if (process.env.NODE_ENV === 'development') {
    await installExtensions();
  }
  rendererWindow = createWindow(deepLinkingURI);
  tray = createTray(rendererWindow);
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (rendererWindow === null) createWindow();
});

app.on('will-quit', () => {
  if (daemon !== null) daemon.quit();
  isQuitting = true;
});

// https://electronjs.org/docs/api/app#event-will-finish-launching
app.on('will-finish-launching', () => {
  // Protocol handler for macOS
  app.on('open-url', (event, URL) => {
    event.preventDefault();
    if (rendererWindow !== null) {
      rendererWindow.webContents.send('open-uri-requested', URL);
      if (rendererWindow.isMinimized()) rendererWindow.restore();
      rendererWindow.focus();
    } else {
      deepLinkingURI = URL;
    }
  });
});

app.on('window-all-closed', () => {
  // Subscribe to event so the app doesn't quit when closing the window.
});

ipcMain.on('get-auth-token', event => {
  keytar.getPassword('LBRY', 'auth_token').then(token => {
    event.sender.send('auth-token-response', token ? token.toString().trim() : null);
  });
});

ipcMain.on('set-auth-token', (event, token) => {
  keytar.setPassword('LBRY', 'auth_token', token ? token.toString().trim() : null);
});

process.on('uncaughtException', error => {
  dialog.showErrorBox('Error Encountered', `Caught error: ${error}`);
  if (daemon !== null) daemon.quit();
  app.exit(1);
});

// Force single instance application
const isSecondInstance = app.makeSingleInstance(argv => {
  // Protocol handler for win32
  // argv: An array of the second instance’s (command line / deep linked) arguments
  if (process.platform === 'win32') {
    // Keep only command line / deep linked arguments
    const URI = argv[1].replace(/\/$/, '').replace('/#', '#');
    rendererWindow.webContents.send('open-uri-requested', URI);
  }

  if (rendererWindow) {
    if (rendererWindow.isMinimized()) rendererWindow.restore();
    rendererWindow.focus();
  }
});

if (isSecondInstance) {
  app.quit();
}
