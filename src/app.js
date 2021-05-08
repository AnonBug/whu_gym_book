/*
 * @Author: zyc
 * @Description: file content
 * @Date: 2021-05-05 13:41:17
 * @LastEditTime: 2021-05-08 13:29:27
 */

const puppeteer = require('puppeteer')
const schedule = require('node-schedule')
const moment = require('moment')
const {
    sendMail
} = require('./utils/mail')
const {
    gyms
} = require('./config')
const {
    login,
    bookByGym
} = require('./utils/pupputeer')

// 从命令行启动时，输入用户名密码
const username = process.argv[2]
const password = process.argv[3]



/* 主线程任务 */
const main = () => {
    return new Promise(async (resolve, reject) => {

        // 创建浏览器窗口
        const browser = await puppeteer.launch({
            headless: false, // 有界面模式，可以查看执行详情
            devtools: true,
            defaultViewport: {
                width: 1200,
                height: 800
            }
        })

        // 创建标签页
        const page = await browser.newPage()
        // page.on('framenavigated', async () => {
        //     console.log('page 再次加载了');
        // })

        await login(username, password, page) // 登录
        await page.waitForTimeout(10000) // 等待登录完成

        try {
            // 循环需要预定的球场
            let status = false,
                idx = 0
            while (!status && idx < gyms.length) {
                // 预定场地
                status = await bookByGym(page, gyms[idx++])
            }
            // 退出浏览器
            await browser.close()
            // 返回预定状态
            resolve(status)
        } catch (e) {
            console.log('出错了');
            await browser.close()
            resolve(false)
        }
    })

}
// main()

// 让任务定时执行，每天 18：00 执行一遍程序
const rule = new schedule.RecurrenceRule()
rule.hour = 17
rule.minute = 59
rule.second = 30

console.log('监听任务开始执行');
schedule.scheduleJob(rule, async function () {
    console.log(`任务执行了，当前时间为 ${moment().format('MMMM Do YYYY, h:mm:ss a')}`);
    let status = await main()
    console.log(`任务执行结束，预定状态为 ${status}`);
    // 根据预约状态，发送邮件
    if (status) {
        sendMail({
            subject: '预定成功!'
        })
    }
});