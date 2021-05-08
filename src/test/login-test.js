/*
 * @Author: zyc
 * @Description: file content
 * @Date: 2021-05-05 12:28:56
 * @LastEditTime: 2021-05-05 13:28:06
 */

const puppeteer = require('puppeteer');
const {
    getDistanceByBase64
} = require('../utils/opencv')

const {getMoveTrack} = require('../utils/track')
console.log(getDistanceByBase64);

(async () => {
    // 创建浏览器窗口
    const browser = await puppeteer.launch({
        headless: false, // 有界面模式，可以查看执行详情
        devtools: true,
        defaultViewport: {
            width: 1200,
            height: 800
        }
    });
    let page = await browser.newPage();
    await page.goto(`https://cas.whu.edu.cn/authserver/login?service=http://gym.whu.edu.cn:80/wechat/autoLoginConnector.jsp`)

    // 输入用户名密码，点击登录
    await page.type('#username', '2019202050050')
    await page.type('#password', '263419')
    await page.click('#casLoginForm .auth_login_btn')

    await page.waitForSelector('#captcha .block')
    // 滑动滑块
    let {
        smallPic,
        bigPic
    } = await page.$eval('#captcha', div => {
        const canvases = div.querySelectorAll('canvas')
        return {
            smallPic: canvases[1].toDataURL(),
            bigPic: canvases[0].toDataURL()
        }
    })

    console.log(smallPic.length);
    let distance = getDistanceByBase64(smallPic, bigPic)
    console.log(distance);
    const track = getMoveTrack(distance)
    console.log(track);

    const example = await page.$('#captcha .slider');
    const bounding_box = await example.boundingBox();
    console.log(bounding_box);

    let mouseX = bounding_box.x + bounding_box.width / 2,
        mouseY = bounding_box.y + bounding_box.height / 2

    await page.mouse.move(mouseX, mouseY);
    await page.mouse.down();
    
    // 模拟人工移动的效果
    for (let t of track) {
        mouseX += t
        await page.mouse.move(mouseX, mouseY);
        await page.waitForTimeout(200)
    }
    await page.mouse.up();

})()