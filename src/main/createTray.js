import { app, Menu, Tray } from 'electron';
import path from 'path';
import createWindow from './createWindow';

export default rendererWindow => {
  let iconPath;
  switch (process.platform) {
    case 'darwin': {
      iconPath = path.join(__static, '/img/tray/mac/trayTemplate.png');
      break;
    }
    case 'win32': {
      iconPath = path.join(__static, '/img/tray/windows/tray.ico');
      break;
    }
    default: {
      iconPath = path.join(__static, '/img/tray/default/tray.png');
    }
  }

  const tray = new Tray(iconPath);
  tray.setToolTip('LBRY App');

  const template = [
    {
      label: `Open ${app.getName()}`,
      click() {
        if (rendererWindow.isDestroyed()) {
          createWindow();
        } else {
          rendererWindow.show();
        }
      },
    },
    { role: 'quit' },
  ];
  const contextMenu = Menu.buildFromTemplate(template);
  tray.setContextMenu(contextMenu);

  tray.on('double-click', () => {
    if (rendererWindow.isDestroyed()) {
      createWindow();
    } else {
      rendererWindow.show();
    }
  });

  return tray;
};
