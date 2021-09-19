/*
 * @Author: zyc
 * @Description: file content
 * @Date: 2021-04-22 21:02:29
 * @LastEditTime: 2021-09-19 08:09:41
 */
const nodemailer = require('nodemailer');
const {mail_auth, mail_name} = require('../../config')

const transporter = nodemailer.createTransport({
    service: 'QQ',
    auth: {
        user: mail_name, // 发件人邮箱
        pass: mail_auth, // 发件人密码(用自己的...)
    }
});

/**
 * @description: 发送邮件
 * @param {{}} content 邮件内容
 * @return {*}
 */
const sendMail = ({
    subject = '预定成功',
    text
} = {}) => {
    // 配置地址：https://nodemailer.com/message/
    let mailOptions = {
        // 发件人地址
        from: '"窝自己" <yuchun_zhao@qq.com>',
        // 收件人列表, 向163邮箱, gmail邮箱, qq邮箱各发一封
        to: 'yuchun_zhao@whu.edu.cn',
        // 邮件主题
        subject,
        // 文字内容
        text,
    };
    // 发送邮件
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log("邮件发送成功~");
    });
}

module.exports = {
    sendMail
}
