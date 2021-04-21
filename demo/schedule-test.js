/*
 * @Author: zyc
 * @Description: file content
 * @Date: 2021-04-20 23:09:44
 * @LastEditTime: 2021-04-20 23:21:59
 */
const schedule = require('node-schedule');
const moment = require('moment')
moment.locale()

console.log(moment().format('MMMM Do YYYY, h:mm:ss a'));
// 当分钟数为 11 时执行
const job = schedule.scheduleJob('16 * * * *', function () {
    console.log('The answer to life, the universe, and everything!');
});

// 指定确切日期（测试失败）
const date = new Date(2021, 4, 20, 23, 16, 0);

const job2 = schedule.scheduleJob(date, function () {
    console.log('The world is going to end today.');
});

const rule = new schedule.RecurrenceRule();
// rule.dayOfWeek = [0, new schedule.Range(4, 6)];
// rule.hour = 23;
// rule.minute = 18;
rule.second = 30
const job3 = schedule.scheduleJob(rule, function () {
    console.log(`任务执行了，当前时间为 ${moment().format('MMMM Do YYYY, h:mm:ss a')}`);
});