/*
 * @Description: contents
 * @Author: zyc
 * @Date: 2021-10-13 11:11:13
 * @LastEditTime: 2021-10-13 11:30:55
 */

const btn = document.querySelector('#btn');


btn.addEventListener('click', () => {
  console.log('点击按钮');

  ipcRenderer.invoke('gym-book', '我是渲染进程的参数')
    .then(res => {
      console.log(res ? '订场成功': '订场失败');
    })
})