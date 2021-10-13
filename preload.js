/*
 * @Description: contents
 * @Author: zyc
 * @Date: 2021-10-13 10:42:38
 * @LastEditTime: 2021-10-13 21:10:12
 */

const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer);
