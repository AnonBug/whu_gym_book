/*
 * @Author: zyc
 * @Description: file content
 * @Date: 2021-04-21 00:03:48
 * @LastEditTime: 2021-04-22 20:46:07
 */


'use strict';

const nodemailer = require('nodemailer');
const moment = require('moment');

// nodemailer.createTestAccount((err, account) => {
    // 填入自己的账号和密码
    let transporter = nodemailer.createTransport({
        service: 'QQ',
        // port: 465,
        // secure: true, // 如果是 true 则port填写465, 如果 false 则可以填写其它端口号
        auth: {
            user: "1248758606@qq.com", // 发件人邮箱
            pass: "dxsbhmqooqezbace" // 发件人密码(用自己的...)
            // user:account.user,
            // pass:account.pass
        }
    });

    // 获取当前时间
    let sendTime = moment().format('MMMM Do YYYY, h:mm:ss a');
    // 填写发件人, 收件人
    let mailOptions = {
        // 发件人地址
        from: '"窝自己" <yuchun_zhao@qq.com>',
        // 收件人列表, 向163邮箱, gmail邮箱, qq邮箱各发一封
        to: 'yuchun_zhao@whu.edu.cn',
        // 邮件主题
        subject: '用nodemailer发出的邮件~',
        // 文字内容
        text: '发送附件内容',
        // html内容
        html: '<b>发送时间:' + sendTime + '</b>',
        // 附件内容 是一个列表, 第一个是目录下的pack.json文件, 第二是御坂美琴的头像, 第三是作者在拍的图片的zip包
        // attachments: [{
        // filename: 'package.json',
        // path: path.resolve(__dirname, 'package.json')
        // }, {
        // filename: 'bilibili.jpg',
        // path: path.resolve(__dirname, 'bilibili.jpg')
        // }, {
        // filename: 'room.zip',
        // path: path.resolve(__dirname, 'room.zip')
        // }],
    };
    // 发送邮件
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log("邮件发送成功~");
    });
// });