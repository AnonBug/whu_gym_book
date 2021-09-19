/*
 * @Author: zyc
 * @Description: file content
 * @Date: 2021-05-05 13:35:38
 * @LastEditTime: 2021-06-18 17:15:03
 */
const puppeteer = require("puppeteer");
// const {
//   getDistanceByBase64, // 获取滑块距离
// } = require("./opencv");

const {
  getMoveTrack, // 模拟人工滑动
} = require("./track");

let startTime = process.argv[4],
  endTime = process.argv[5];

startTime = startTime ? Number(startTime) : 19;
endTime = endTime ? Number(endTime) : 21;

console.log(`您正在预约时间段为 ${startTime} - ${endTime} 的 场地`);

/**
 * @description:
 * @param {Element[]} lis
 * @return {Boolean}
 */
const selectSite = (lis) => {
  // 从后往前约（暂时不考虑 信部 9号场漏雨的事实）
  for (let i = lis.length - 1; i > 0; i--) {
    const li = lis[i];
    const items = li.querySelectorAll("div");
    // 约 7：00 - 8:30 的场次
    for (let i = items.length - 2; i > items.length - 5; i--) {
      const item = items[i];
      // 选择连续的场地
      if (
        item.className === "statusImage_select" &&
        item.previousSibling.className === "statusImage_select" &&
        item.previousSibling.previousSibling.className === "statusImage_select"
      ) {
        item.click();
        item.previousSibling.click();
        item.previousSibling.previousSibling.click();
        // 约到场地，直接返回
        return true;
      }
    }
  }
  return false;
};

/**
 * @description: 根据指定时间段，点击对应的 lis 元素
 * @param {[]} lis 元素
 * @param {Number} start 开始时间，24小时制，如晚上 6点，传 18 ； 6点半，传 18.5
 * @param {Number} end
 * @return {Boolean}
 */
const selectSiteByTime = (lis, start, end) => {
  console.log({ start, end });
  let endIdx = (21 - end) / 0.5,
    startIdx = (21 - start) / 0.5;

  // 从后往前约（暂时不考虑 信部 9号场漏雨的事实）
  for (let i = lis.length - 1; i >= 0; i--) {
    const li = lis[i];
    const items = li.querySelectorAll("div");
    /* 
            按传入预定时间预约场地
                1. 检查是否全为空场
                2. 点击提交
        */
    let flag = true;
    for (
      let i = items.length - 1 - endIdx;
      i >= items.length - 1 - startIdx;
      i--
    ) {
      const item = items[i];
      if (item.className !== "statusImage_select") {
        flag = false;
        break;
      }
    }
    if (flag) {
      for (
        let i = items.length - 1 - endIdx;
        i >= items.length - 1 - startIdx;
        i--
      ) {
        items[i].click();
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
      // 点击下一天
      let afterDay = await page.$("#afterDay");
      await afterDay.click();

      // 如果是工体部，需要修改球类信息
      // if (gym === 4) {
      //   await page.$eval("#gymItem select", (select) => {
      //     // 修改预约球类 （1 羽毛球；2 乒乓球；3 网球）
      //     select.value = "18";
      //     // 手动创建事件，并触发 select 的 change 事件
      //     const changeEvent = new Event("change");
      //     select.dispatchEvent(changeEvent);
      //   });
      // }
      resolve();
    } catch (e) {
      console.log("报错了");
      console.log(e);
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
const login = (username, password, page) => {
  return new Promise(async (resolve, reject) => {
    try {
      await page.goto(
        `https://cas.whu.edu.cn/authserver/login?service=http://gym.whu.edu.cn:80/wechat/autoLoginConnector.jsp`
      );

      // 1. 输入用户名密码，点击登录
      await page.type("#username", username);
      await page.type("#password", password);
      await page.click("#casLoginForm .auth_login_btn");

      /* 由于订场系统做了修改，不再进行滑块验证 */
      resolve();

      // 2. 得到验证码图片
      /* 在点击后，等待验证图片出现后再进行操作！！！ */
      await page.waitForSelector("#captcha .block");
      let { smallPic, bigPic } = await page.$eval("#captcha", (div) => {
        const canvases = div.querySelectorAll("canvas");
        return {
          smallPic: canvases[1].toDataURL(),
          bigPic: canvases[0].toDataURL(),
        };
      });

      // 3. 使用 opencv 获取需要滑动的距离
      let distance = getDistanceByBase64(smallPic, bigPic);

      // 4. 使用 puppeteer 模拟人工滑动
      const track = getMoveTrack(distance);

      const slider = await page.$("#captcha .slider");
      const bounding_box = await slider.boundingBox();

      let mouseX = bounding_box.x + bounding_box.width / 2,
        mouseY = bounding_box.y + bounding_box.height / 2;

      await page.mouse.move(mouseX, mouseY);
      await page.mouse.down();

      // 模拟人工移动的效果
      for (let t of track) {
        mouseX += t;
        await page.mouse.move(mouseX, mouseY);
        await page.waitForTimeout(200);
      }
      await page.mouse.up();
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
      // 信息学部
      await page.goto(
        `http://gym.whu.edu.cn/wechat/booking/gymHome.jsp?ggId=${gym}`
      );

      await pageToTarget(page, gym);

      // let statusSlider = await page.$(`#statusSlider`);
      // // 如果没刷新出来，就一直刷新页面（最多刷 5 分钟）
      // const begin = Date.now(), // 开始刷新时间
      //   duration = 1000 * 60 * 5; // 持续刷新时间
      // while (Date.now() - begin < duration && !statusSlider) {
      //   // 重新加载页面
      //   await page.reload();
      //   await pageToTarget(page, gym);
      //   statusSlider = await page.$(`#statusSlider`);
      // }
      // // 如果刷了 5 分钟都没有更新，则开始下一个场地的预定
      // if (!statusSlider) resolve(false);

      // if (waitFlag) {
      //   await page.waitForTimeout(2000);
      //   await page.reload();
      //   await pageToTarget(page, gym);
      //   statusSlider = await page.$(`#statusSlider`);
      // }

      // 预定场地
      let bookStatus = await statusSlider.$$eval(
        `li`,
        selectSiteByTime,
        startTime,
        endTime
      );
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
