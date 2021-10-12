/*
 * @Author: zyc
 * @Description: file content
 * @Date: 2021-04-22 21:02:29
 * @LastEditTime: 2021-10-12 12:03:29
 */
const nodemailer = require('nodemailer');
const { mail_auth, mail_name, target_addr } = require('../config');

const transporter = nodemailer.createTransport({
  service: 'QQ',
  auth: {
    user: mail_name, // 发件人邮箱
    pass: mail_auth, // 发件人密码(用自己的...)
  },
});

// 发送邮件
const sendMail = ({ subject = '预定成功', text } = {}) => {
  // 配置地址：https://nodemailer.com/message/
  let mailOptions = {
    from: '"子虫" <yuchun_zhao@qq.com>', // 发件人地址
    to: target_addr, // 收件人列表
    subject, // 邮件主题
    text, // 文字内容
  };

  // 发送邮件
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) return console.log(error);
    
    console.log("邮件发送成功~");
  });
}

module.exports = {
  sendMail,
}
