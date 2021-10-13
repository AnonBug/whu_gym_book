/*
 * @Author: zyc
 * @Description: file content
 * @Date: 2021-05-05 13:41:17
 * @LastEditTime: 2021-10-13 18:38:44
 */

const puppeteer = require('puppeteer');
const schedule = require('node-schedule');
const { sendMail } = require('./src/mail');
const { login, bookByGym } = require('./src/pupputeer');

const { GYMS } = require('./config');

/* 主线程任务 */
const main = () => {
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
      await login(page); // 登录
      await page.waitForTimeout(2000); // 等待登录完成
      
      // 循环需要预定的球场
      let status = false;
      let cur = 0;
      while (!status && cur < GYMS.length) {
        // 预定场地
        status = await bookByGym(page, GYMS[cur], cur === 0);
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

// 让任务定时执行，每天 18：00 执行一遍程序
const rule = new schedule.RecurrenceRule();
rule.hour = 17;
rule.minute = 59;
rule.second = 50;

schedule.scheduleJob(rule, async function () {
  singleWork();
});

async function singleWork() {
  return new Promise(async (resolve, reject) => {
    console.log(`任务执行了，当前时间为 ${new Date()}`);
    let status = await main();
    console.log(`任务执行结束，预定状态为 ${status}`);
  
    // 根据预约状态，发送邮件
    if (status) {
      sendMail({
        subject: '预定成功!',
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
