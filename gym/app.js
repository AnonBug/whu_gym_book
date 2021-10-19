/*
 * @Author: zyc
 * @Description: file content
 * @Date: 2021-05-05 13:41:17
 * @LastEditTime: 2021-10-19 13:16:15
 */

const puppeteer = require('puppeteer');
const { sendMail } = require('./src/mail');
const { login, bookByGym } = require('./src/pupputeer');

/* 主线程任务 */
const main = ({username, password, gyms, time, email, day}) => {
  return new Promise(async (resolve, reject) => {
    // 创建浏览器窗口
    const browser = await puppeteer.launch({
      headless: false, // 有界面模式，可以查看执行详情
      devtools: false,
      defaultViewport: {
        width: 1200,
        height: 800,
      },
      timeout: 0,
    })

    // 创建标签页
    const page = await browser.newPage();

    page.setDefaultNavigationTimeout(0);
    
    try {
      await login(page, username, password); // 登录
      await page.waitForTimeout(2000); // 等待登录完成
      
      // 循环需要预定的球场
      let status = false;
      let cur = 0;
      while (!status && cur < gyms.length) {
        // 预定场地
        status = await bookByGym(page, gyms[cur], cur === 0, time, day);
        cur++;
      }

      // 退出浏览器
      await browser.close();

      // 返回预定状态
      resolve(status);
    } catch (e) {
      console.log('出错了', e);
      await browser.close();
      resolve(false);
    }
  })
}

async function singleWork(args) {
  return new Promise(async (resolve, reject) => {
    console.log(`任务执行了，当前时间为 ${new Date()}`);
    let status = await main(args);
    console.log(`任务执行结束，预定状态为 ${status}`);
  
    // 根据预约状态，发送邮件
    if (status) {
      sendMail({
        subject: '预定成功!',
        target_addr: args.email,
      })
    }

    resolve(status);
  })
}

// TEST 测试预约逻辑
// singleWork();

module.exports = {
  singleWork,
}
