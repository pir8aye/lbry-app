/* eslint-disable no-console */
// Module imports
import keytar from 'keytar-prebuild';
import SemVer from 'semver';
import url from 'url';
import https from 'https';
import { shell, app, ipcMain, dialog } from 'electron';
import Daemon from './Daemon';
import createTray from './createTray';
import createWindow from './createWindow';

// Keep a global reference, if you don't, they will be closed automatically when the JavaScript
// object is garbage collected.
let rendererWindow;
// eslint-disable-next-line no-unused-vars
let tray;
let daemon;

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
  if (rendererWindow) createWindow();
});

app.on('will-quit', () => {
  isQuitting = true;
  if (daemon) daemon.quit();
});

// https://electronjs.org/docs/api/app#event-will-finish-launching
app.on('will-finish-launching', () => {
  // Protocol handler for macOS
  app.on('open-url', (event, URL) => {
    event.preventDefault();
    if (rendererWindow) {
      rendererWindow.webContents.send('open-uri-requested', URL);
      if (rendererWindow.isMinimized()) rendererWindow.restore();
      rendererWindow.focus();
    } else {
      deepLinkingURI = URL;
      rendererWindow = createWindow(deepLinkingURI);
    }
  });
});

app.on('window-all-closed', () => {
  rendererWindow = null;
  // Subscribe to event so the app doesn't quit when closing the window.
});

ipcMain.on('upgrade', (event, installerPath) => {
  app.on('quit', () => {
    console.log('Launching upgrade installer at', installerPath);
    // This gets triggered called after *all* other quit-related events, so
    // we'll only get here if we're fully prepared and quitting for real.
    shell.openItem(installerPath);
  });
  // what to do if no shutdown in a long time?
  console.log('Update downloaded to', installerPath);
  console.log(
    'The app will close, and you will be prompted to install the latest version of LBRY.'
  );
  console.log('After the install is complete, please reopen the app.');
  app.quit();
});

ipcMain.on('version-info-requested', () => {
  function formatRc(ver) {
    // Adds dash if needed to make RC suffix SemVer friendly
    return ver.replace(/([^-])rc/, '$1-rc');
  }

  const localVersion = app.getVersion();
  const latestReleaseAPIURL = 'https://api.github.com/repos/lbryio/lbry-app/releases/latest';
  const opts = {
    headers: {
      'User-Agent': `LBRY/${localVersion}`,
    },
  };
  let result = '';

  const req = https.get(Object.assign(opts, url.parse(latestReleaseAPIURL)), res => {
    res.on('data', data => {
      result += data;
    });
    res.on('end', () => {
      const tagName = JSON.parse(result).tag_name;
      const [, remoteVersion] = tagName.match(/^v([\d.]+(?:-?rc\d+)?)$/);
      if (!remoteVersion) {
        if (rendererWindow) {
          rendererWindow.webContents.send('version-info-received', null);
        }
      } else {
        const upgradeAvailable = SemVer.gt(formatRc(remoteVersion), formatRc(localVersion));
        if (rendererWindow) {
          rendererWindow.webContents.send('version-info-received', {
            remoteVersion,
            localVersion,
            upgradeAvailable,
          });
        }
      }
    });
  });

  req.on('error', err => {
    console.log('Failed to get current version from GitHub. Error:', err);
    if (rendererWindow) {
      rendererWindow.webContents.send('version-info-received', null);
    }
  });
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
  isQuitting = true;
  if (daemon) daemon.quit();
  app.exit(1);
});

// Force single instance application
const isSecondInstance = app.makeSingleInstance(argv => {
  // Protocol handler for win32
  // argv: An array of the second instance’s (command line / deep linked) arguments

  let URI;
  if (process.platform === 'win32' && String(argv[1]).startsWith('lbry')) {
    // Keep only command line / deep linked arguments
    URI = argv[1].replace(/\/$/, '').replace('/#', '#');
  }

  if (rendererWindow) {
    rendererWindow.webContents.send('open-uri-requested', URI);

    if (rendererWindow.isMinimized()) rendererWindow.restore();
    rendererWindow.focus();
  } else {
    deepLinkingURI = URI;
    rendererWindow = createWindow(deepLinkingURI);
  }
});

if (isSecondInstance) {
  app.exit();
}
