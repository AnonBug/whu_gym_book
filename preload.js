/*
 * @Description: contents
 * @Author: zyc
 * @Date: 2021-10-13 10:42:38
 * @LastEditTime: 2021-10-15 09:54:34
 */

const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('ipcRenderer', ipcRenderer);

ipcRenderer.on('gym-book-wait-res', (event, res) => {
  if (res) {
    alert("订场成功！请速去付款~");
  } else {
    alert("八好意思，预定失败……");
  }
})
