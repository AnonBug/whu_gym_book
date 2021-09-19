const { doSth } = require("./process-test");

const puppeteer = require("puppeteer");

/* 主线程任务 */
const main = () => {
  return new Promise(async (resolve, reject) => {
    // 创建浏览器窗口
    const browser = await puppeteer.launch({
      headless: false, // 有界面模式，可以查看执行详情
      devtools: true,
      defaultViewport: {
        width: 1200,
        height: 800,
      },
    });

    // 创建标签页
    const page = await browser.newPage();
    // page.on('framenavigated', async () => {
    //     console.log('page 再次加载了');
    // })
  });
};
main();
