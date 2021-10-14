/*
 * @Description: contents
 * @Author: zyc
 * @Date: 2021-10-13 10:27:40
 * @LastEditTime: 2021-10-14 12:09:33
 */

const { app, BrowserWindow, ipcMain } = require('electron')
const Store = require('electron-store');
const path = require('path');
const schedule = require('node-schedule');
const url = require('url');

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

  // win.loadFile('./ui/build/index.html');
  win.loadURL('http://anonbug.github.io/gym-book')
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

ipcMain.handle('gym-book-now', async (event, args) => {
  console.log({args});
  return await singleWork(args);
})

ipcMain.on('gym-book-wait', async (event, args) => {
  console.log({args});

  // 让任务定时执行，每天 18：00 执行一遍程序
  const rule = new schedule.RecurrenceRule();
  rule.hour = 17;
  rule.minute = 59;
  rule.second = 30;

  schedule.scheduleJob(rule, async function () {
    event.reply('gym-book-wait-res', await singleWork(args));
  });
})

ipcMain.handle('getStoreValue', (event, key) => {
  return store.get(key);
})
