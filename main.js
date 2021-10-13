/*
 * @Description: contents
 * @Author: zyc
 * @Date: 2021-10-13 10:27:40
 * @LastEditTime: 2021-10-13 21:16:02
 */

const { app, BrowserWindow, ipcMain } = require('electron')
const Store = require('electron-store');
const path = require('path');

const store = new Store();

// store.set('unicorn', '🦄');
console.log(store.get('unicorn'));

// 订场任务
const { singleWork } = require('./gym/app');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 700, 
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  // win.loadFile('index.html');
  win.loadURL('http://localhost:3000')
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (!BrowserWindow.getAllWindows().length) createWindow();
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
})

ipcMain.handle('gym-book', async (event, args) => {
  console.log({args});
  const res = await singleWork();

  return res;
})

ipcMain.handle('getStoreValue', (event, key) => {
  return store.get(key);
})
