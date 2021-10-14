/* eslint-disable no-undef */
/*
 * @Description: contents
 * @Author: zyc
 * @Date: 2021-10-13 19:00:25
 * @LastEditTime: 2021-10-14 11:50:57
 */

import { useEffect, useState } from "react";
import "./App.css";
import {
  Form,
  Input,
  Button,
  Checkbox,
  Select,
  TimePicker,
  message,
  Radio,
} from "antd";
import "antd/dist/antd.css";
import moment from "moment";

const { Option } = Select;

function App() {
  const state = localStorage.getItem("info")
    ? JSON.parse(localStorage.getItem("info"))
    : {
        username: "",
        password: "",
        gyms: [],
        time: [],
        email: "",
        remember: false,
        day: 1,
      };

  state.time = state.time.map((item) => {
    const remainder = item % 1;
    item = item - remainder;
    let timeStr = "" + item + (remainder ? ":30" : ":00");

    return moment(timeStr, "HH:mm");
  });

  console.log("state", state);

  // 完成的按钮
  const onFinish = (values) => {
    console.log("Success:", values);
    values.time = values.time.map((moment) => {
      let num = moment.hour();
      if (moment.minute() === 30) {
        num += 0.5;
      }

      return num;
    });

    // 更新内容
    if (values.remember) {
      localStorage.setItem("info", JSON.stringify(values));
    }

    if (values.day !== 3) {
      ipcRenderer.invoke("gym-book-now", values).then((res) => {
        if (res) {
          message.success("订场成功！请速去付款~");
        } else {
          message.error("八好意思，订场失败……");
        }
      });
    } else {
      message.info("系统将在 18：00 开抢，请勿关闭客户端。")
      ipcRenderer.send("gym-book-wait", values);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="App">
      <Form
        name="basic"
        className="form"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 18 }}
        initialValues={{ ...state }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="用户名"
          name="username"
          rules={[{ required: true, message: "学号！学号啊！" }]}
        >
          <Input placeholder="登录预定系统的用户名，通常为学号" />
        </Form.Item>

        <Form.Item
          label="密码"
          name="password"
          rules={[{ required: true, message: "不写密码让我拿头登吗" }]}
        >
          <Input.Password placeholder="密码不会上传到后台，因为妹有后台……" />
        </Form.Item>

        <Form.Item
          name="gyms"
          label="场馆"
          rules={[
            {
              required: true,
              message: "至少选一个啦拜托",
              type: "array",
            },
          ]}
        >
          <Select
            mode="multiple"
            placeholder="该选项是有序的，会优先抢前面的场次"
          >
            <Option value={1}>信体</Option>
            <Option value={2}>风雨</Option>
            <Option value={4}>工体</Option>
            <Option value={10}>卓尔</Option>
            <Option value={11}>网安</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="time"
          label="时段"
          rules={[
            { type: "array", required: true, message: "选一下预约时段啦" },
          ]}
        >
          <TimePicker.RangePicker
            minuteStep={30}
            format="HH:mm"
            placeholder={["开始时间", "结束时间"]}
            disabledHours={() => {
              const res = [];
              for (let i = 0; i < 24; i++) {
                if (i < 8 || i > 21) {
                  res.push(i);
                }
              }
              return res;
            }}
            disabledMinutes={(hour) => {
              // 禁用 9：30 的选择
              if (hour === 21) return [30];
            }}
          />
        </Form.Item>

        <Form.Item
          label="邮箱"
          name="email"
          rules={[{ required: true, message: "你猜我会不会千里传音？" }]}
        >
          <Input
            placeholder="接收预定结果，通常只有成功时才会发消息"
            defaultValue={state.email}
          />
        </Form.Item>

        <Form.Item
          label="日期"
          name="day"
          rules={[{ required: true, message: "你猜我会不会千里传音？" }]}
        >
          <Radio.Group defaultValue={1}>
            <Radio value={1}>立抢今日</Radio>
            <Radio value={2}>立抢明日</Radio>
            <Radio value={3}>预约明日</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="remember"
          valuePropName="checked"
          wrapperCol={{ offset: 6, span: 18 }}
        >
          <Checkbox>记住当前配置</Checkbox>
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
          <Button type="primary" htmlType="submit">
            开始预定
          </Button>
        </Form.Item>
      </Form>

      <div className="tips">
        <h3>说明：</h3>
        <p>本系统为佛系杯抢场使用，请勿商用。</p>
        <ul>
          <li>需为校园网，或 vpn 环境</li>
          <li className="highlight">选择预约明日时，系统会在18：00开抢，请勿关闭客户端</li>
        </ul>
      </div>
      <div className="license">
        drived by electron + puppeteer + react @anonbug
      </div>
    </div>
  );
}

export default App;
