/*
 * @Author: zyc
 * @Description: 写脚本程序自动启动珞珈体育预定页面，并选择场地
 * @Date: 2021-04-17 10:32:30
 * @LastEditTime: 2021-04-23 14:18:37
 */

// 1. 引包
const puppeteer = require('puppeteer');
const schedule = require('node-schedule');
const {
    cookie,
    gyms
} = require('./config')
const {
    sendMail
} = require('./utils/mail');
const moment = require('moment')

/**
 * @description: 预定指定 id 的场馆
 * @param {*} gym 场馆id 
 * @param {*} browser 浏览器对象
 * @return {*}
 */
const bookInGym = async (gym, browser) => {
    /**
     * @description: 从刷新好的页面到指定 target（这里是指跳转到下一天的场地选择页面）
     * @param {*} page 页面对象
     * @return {*}
     */
    const pageToTarget = (page) => {
        return new Promise(async (resolve, reject) => {
            try {
                // 点击下一天
                let afterDay = await page.$('#afterDay')
                await afterDay.click()

                // 如果是工体部，需要修改球类信息
                if (gym === 4) {
                    await page.$eval('#gymItem select', select => {
                        // 修改预约球类 （1 羽毛球；2 乒乓球；3 网球）
                        select.value = '18'
                        // 手动创建事件，并触发 select 的 change 事件
                        const changeEvent = new Event('change')
                        select.dispatchEvent(changeEvent)
                    })
                }
                resolve()
            } catch (e) {
                console.log('报错了');
                console.log(e);
                reject()
            }
        })

    }
    return new Promise(async (resolve, reject) => {
        try {
            // 创建标签页
            let page = await browser.newPage();

            // 使用 cookie 的方式，避免登录验证
            const cookies = [{
                name: 'JSESSIONID',
                value: cookie.JSESSIONID,
                domain: 'gym.whu.edu.cn'
            }]

            await page.setCookie(...cookies)

            // 信息学部
            await page.goto(`http://gym.whu.edu.cn/wechat/booking/gymHome.jsp?ggId=${gym}`)

            await pageToTarget(page)

            let statusSlider = await page.$(`#statusSlider`)
            // 如果没刷新出来，就一直刷新页面（最多刷 5 分钟）
            while (Date.now() - startTime < 1000 * 60 * 5 && !statusSlider) {
                // 重新加载页面
                await page.reload()
                await pageToTarget(page)
                statusSlider = await page.$(`#statusSlider`)
            }
            // 重置开始时间，为下一个标签页的刷新铺路
            startTime = Date.now()
            // 如果刷了 5 分钟都没有更新，则开始下一个场地的预定
            if (!statusSlider) resolve(false)

            let bookStatus = await statusSlider.$$eval(`li`, lis => {
                // 从后往前约（暂时不考虑 信部 9号场漏雨的事实）
                for (let i = lis.length - 1; i > 0; i--) {
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
                            // 约到场地，直接返回
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
            // 告知预约状态
            resolve(bookStatus)
        } catch (e) {
            reject(e)
        }
    })
}

/**
 * @description: 在异步环境中执行场馆预定
 * @param {*} 
 * @return {Boolean} 是否预定成功
 */
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

    startTime = Date.now()

    try {
        // 循环需要预定的球场
        let status = false,
            idx = 0
        while (!status && idx < gyms.length) {
            status = await bookInGym(gyms[idx++], browser)
        }
        // 退出浏览器
        // await browser.close()
        // 返回预定状态
        return status
    } catch (e) {
        console.log('出错了');
        console.log(e);
        await browser.close()
        return false
    }

}

// 让任务定时执行，每天 18：00 执行一遍程序
const rule = new schedule.RecurrenceRule()
rule.hour = 18
rule.minute = 0
// rule.second = 30

const job = async () => {
    console.log(`任务执行了，当前时间为 ${moment().format('MMMM Do YYYY, h:mm:ss a')}`);
    let status = await bookBadminton()
    console.log(`任务执行结束，预定状态为 ${status}`);
    // 根据预约状态，发送邮件
    const content = {}
    content.subject = status ? '预定成功！' : '预约失败……'
    sendMail(content)
}
// 设一个全局变量
let startTime;
schedule.scheduleJob(rule, job);

console.log(`预定任务开始监听`);
// bookBadminton()