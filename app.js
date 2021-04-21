/*
 * @Author: zyc
 * @Description: 写脚本程序自动启动珞珈体育预定页面，并选择场地
 * @Date: 2021-04-17 10:32:30
 * @LastEditTime: 2021-04-21 00:25:58
 */

// 1. 引包
const puppeteer = require('puppeteer');
const schedule = require('node-schedule');
const moment = require('moment')

const bookInGym = async (gym, browser) => {
    return new Promise(async (resolve, reject) => {
        try {
            // 创建标签页
            let page = await browser.newPage();

            // 使用 cookie 的方式，避免登录验证
            const cookies = [{
                name: 'JSESSIONID',
                value: '88680D7CBB351BB5C590D71BAFF0701F',
                domain: 'gym.whu.edu.cn'
            }, {
                name: 'iPlanetDirectoryPro',
                value: 'W0ETx1weN1Hx62w0GvVUgD',
                domain: '.whu.edu.cn'

            }]

            await page.setCookie(...cookies)

            // 信息学部
            await page.goto(`http://gym.whu.edu.cn/wechat/booking/gymHome.jsp?ggId=${gym}`)

            // 点击下一天
            let afterDay = await page.$('#afterDay')
            await afterDay.click()

            // 修改球类信息
            // await page.$eval('#gymItem select', select => {
            //     // 修改预约球类 （1 羽毛球；2 乒乓球；3 网球）
            //     select.value = '1'
            //     // 手动创建事件，并触发 select 的 change 事件
            //     const changeEvent = new Event('change')
            //     select.dispatchEvent(changeEvent)
            // })

            let bookStatus = await page.$eval(`#statusSlider`, slider => {
                const lis = slider.querySelectorAll('li')
                // 从 8 号场往前约（9号场漏雨）
                for (let i = lis.length - 2; i > 0; i--) {
                    const li = lis[i]
                    const items = li.querySelectorAll('div')
                    // 约 7：00 - 8:30 的场次
                    for (let i = items.length - 2; i > items.length - 5; i--) {
                        const item = items[i]
                        // 选择连续的场地
                        if (item.className === 'statusImage_select' && item.previousSibling.className === 'statusImage_select' && item.previousSibling.previousSibling.className === 'statusImage_select') {
                            item.click()
                            item.previousSibling.click()
                            item.previousSibling.previousSibling.click()
                            return true;
                        }
                    }
                }
                return false
            })
            if (bookStatus) {
                // 点击提交按钮
                await page.$eval('#bookingBtn', btn => btn.click())

                // 点击预定按钮
                await page.$eval('#moneyBtn', btn => btn.click())
            }
            resolve(bookStatus)
        } catch (e) {
            reject(e)
        }
    })


}

// 2. 在异步环境中执行(pupeteer 所有操作都是异步实现的)
const bookBadminton = async () => {
    // 创建浏览器窗口
    const browser = await puppeteer.launch({
        headless: false, // 有界面模式，可以查看执行详情
        devtools: true,
        defaultViewport: {
            width: 1200,
            height: 800
        }
    });
    try {
        let status = await bookInGym(1, browser)
        // 如果没定上，选择预定西区场馆
        if (!status) {
            status = await bookInGym(11, browser)
        }
        if (status) {
            // 这里通过发送邮件或短信告知我
        }
        // 退出浏览器
        await browser.close()
    } catch (e) {
        console.log(e);
        await browser.close()
    }

}

// 让任务定时执行，每天 18：00 执行一遍程序
const rule = new schedule.RecurrenceRule();
rule.hour = 18;
rule.minute = 0;
const job = schedule.scheduleJob(rule, function () {
    console.log(`任务执行了，当前时间为 ${moment().format('MMMM Do YYYY, h:mm:ss a')}`);
    bookBadminton()
});