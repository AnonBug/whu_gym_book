/*
 * @Author: zyc
 * @Description: file content
 * @Date: 2021-05-05 13:41:17
 * @LastEditTime: 2021-10-12 12:15:11
 */

const puppeteer = require('puppeteer');
const schedule = require('node-schedule');
const { sendMail } = require('./src/mail');
const { login, bookByGym } = require('./src/pupputeer');

/* 
  信部：1
  风雨：2
  工体：4
  卓尔：10
  信部西区：11
*/
const GYMS = [1, 11, 10, 2, 4];

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
    })

    // 创建标签页
    const page = await browser.newPage();

    await login(page); // 登录
    await page.waitForTimeout(2000); // 等待登录完成

    try {
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
rule.second = 30;

schedule.scheduleJob(rule, async function () {
  singleWork();
});

async function singleWork() {
  console.log(`任务执行了，当前时间为 ${new Date()}`);
  let status = await main();
  console.log(`任务执行结束，预定状态为 ${status}`);

  // 根据预约状态，发送邮件
  if (status) {
    sendMail({
      subject: '预定成功!',
    })
  }
}

// TEST 测试预约逻辑
// singleWork();
