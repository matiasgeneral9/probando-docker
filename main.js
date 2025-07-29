// main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

function crearVentanaPrincipal() {
  const win = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      }
      
  });

  win.loadURL('http://localhost:3000'); // Carga la app del servidor
}

app.whenReady().then(crearVentanaPrincipal);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
