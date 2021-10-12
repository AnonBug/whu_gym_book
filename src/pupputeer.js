/*
 * @Author: zyc
 * @Description: file content
 * @Date: 2021-05-05 13:35:38
 * @LastEditTime: 2021-10-12 12:06:56
 */
const puppeteer = require("puppeteer");
const {
  username,
  password,
  start_time,
  end_time,
} = require('../config');

console.log(`您正在预约时间段为 ${start_time} - ${end_time} 的 场地`);

/**
 * @description: 根据指定时间段，点击对应的 lis 元素
 * @param {[]} lis lis 为单个场地数组
 * @param {Number} start 开始时间，24小时制，如晚上 6点，传 18 ； 6点半，传 18.5
 * @param {Number} end 结束时间，同上
 * @return {Boolean} 是否有满足条件的场地
 */
const selectSiteByTime = (lis, start, end) => {
  // 开放的时间段数量
  const count = lis[0].querySelectorAll("div").length;
  // 考虑到可能有早上不开放的场景，自后向前算索引
  const endIdx = (21 - end) / 0.5;
  const startIdx = (21 - start) / 0.5; 

  // 开放的时间段不足以覆盖所需时间，直接返回 false
  if (count < startIdx + 1) return false;
  
  // 循环场地（后期可考虑支持指定场地号检索）
  for (let i = lis.length - 1; i >= 0; i--) {
    // items[0] 是场地号 label，不可点击
    const items = lis[i].querySelectorAll("div");

    // 判断该场地是否满足时间段要求
    let flag = true;
    for (let j = count - 1 - endIdx; j >= count - 1 - startIdx; j--) {
      if (items[j].className !== "statusImage_select") {
        flag = false;
        break;
      }
    }

    // 如果满足要求，进行点击操作
    if (flag) {
      for (let k = count - 1 - endIdx; k >= count - 1 - startIdx; k--) {
        items[k].click();
      }
      return true;
    }
  }

  return false;
};

/**
 * @description: 从刷新好的页面到指定 target（这里是指跳转到下一天的场地选择页面）
 * @param {puppeteer.Page} page 页面对象
 * @param {Number} gym 体育场
 * @return {*}
 */
const pageToTarget = (page, gym) => {
  return new Promise(async (resolve, reject) => {
    try {
      // 跳到指定球场
      await page.goto(
        `http://gym.whu.edu.cn/wechat/booking/gymHome.jsp?ggId=${gym}`
      );

      // 点击下一天
      // const afterDay = await page.$("#afterDay");
      // await afterDay.click();

      // 如果是工体部，需要修改球类信息
      if (gym === 4) {
        await page.$eval("#gymItem select", (select) => {
          // 修改预约球类 （1 羽毛球；2 乒乓球；3 网球）
          select.value = "18";

          // 手动创建事件，并触发 select 的 change 事件
          const changeEvent = new Event("change");
          select.dispatchEvent(changeEvent);
        });
      }
      resolve();
    } catch (e) {
      console.log("报错了", e);
      reject();
    }
  });
};

/**
 * @description: 登录页面(包含了验证码校验过程)
 * @param {String} username 用户名
 * @param {String} password 密码
 * @param {puppeteer.Page} page 页面容器
 * @return {*}
 */
const login = (page) => {
  return new Promise(async (resolve, reject) => {
    try {
      await page.goto(
        `https://cas.whu.edu.cn/authserver/login?service=http://gym.whu.edu.cn:80/wechat/autoLoginConnector.jsp`
      );

      // 1. 输入用户名密码，点击登录
      await page.type("#username", username);
      await page.type("#password", password);
      await page.click("#casLoginForm .auth_login_btn");

      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

/**
 * @description: 预定指定 id 的场馆
 * @param {Number} gym 场馆id
 * @param {puppeteer.Page} page 标签页对象
 * @return {promise}
 */
const bookByGym = async (page, gym, waitFlag) => {
  return new Promise(async (resolve, reject) => {
    try {
      await pageToTarget(page, gym);

      let statusSlider = await page.$(`#statusSlider`);

      // 如果没刷新出来，就一直刷新页面（最多刷 5 分钟）
      const begin = Date.now(); // 开始刷新时间
      const duration = 1000 * 60 * 5; // 持续刷新时间
      while (Date.now() - begin < duration && !statusSlider) {
        // 重新加载页面
        await page.reload();
        await pageToTarget(page, gym);
        statusSlider = await page.$(`#statusSlider`);
      }

      // 如果刷了 5 分钟都没有更新，则开始下一个场地的预定
      if (!statusSlider) resolve(false);

      // 等待 2 秒，以防撞车
      if (waitFlag) {
        await page.waitForTimeout(2000);
        await page.reload();
        await pageToTarget(page, gym)
        statusSlider = await page.$(`#statusSlider`);
      }

      // 预定场地
      const bookStatus = await statusSlider.$$eval(`li`, selectSiteByTime, start_time, end_time);

      if (bookStatus) {
        // 点击提交按钮
        await page.$eval("#bookingBtn", (btn) => btn.click());
        // 点击预定按钮
        await page.$eval("#moneyBtn", (btn) => btn.click());
      }

      // 告知预约状态
      resolve(bookStatus);
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  login,
  bookByGym,
};
