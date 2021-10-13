/* eslint-disable no-undef */
/*
 * @Description: contents
 * @Author: zyc
 * @Date: 2021-10-13 19:00:25
 * @LastEditTime: 2021-10-13 21:26:00
 */

import { useEffect, useState } from 'react';
import "./App.css";
import { Form, Input, Button, Checkbox, Select, TimePicker } from "antd";
import "antd/dist/antd.css";

const { Option } = Select;

// eslint-disable-next-line no-undef
console.log(ipcRenderer);

ipcRenderer.invoke('getStoreValue', 'unicorn')
  .then(res => {
    console.log(res);
  })

function App() {
  const [state, setState] = useState({
    username: '',
    password: '',
    email: '',
    gyms: [],
    time: [],
    remember: false,
  })
  useEffect(() => {
    // eslint-disable-next-line
    setState(s => ({...state, username: 'zyc'}));
    // eslint-disable-next-line
  }, [])
  // 完成的按钮
  const onFinish = (values) => {
    console.log("Success:", values);

    const time = values.time.map(moment => {
      let num = moment.hour();
      if (moment.minute() === 30) {
        num += 0.5;
      }

      return num;
    })

    ipcRenderer.invoke("gym-book", {...values, time}).then((res) => {
      console.log(res ? "订场成功" : "订场失败");
    });
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
        initialValues={{ remember: true }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="用户名"
          name="username"
          rules={[{ required: true, message: "学号！学号啊！" }]}
        >
          <Input placeholder="登录预定系统的用户名，通常为学号" 
            value={state.username}
          />
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
            placeholder={['开始时间', '结束时间']}
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
          <Input placeholder="接收预定结果，通常只有成功时才会发消息" />
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
        <p>本系统为佛系杯抢场使用，请勿商用。@anonbug</p>
        <ul>
          <li>需为校园网，或 vpn 环境</li>
          <li>可连续监控，也可执行单次</li>
        </ul>
      </div>
      <div className="license">drived by electron + puppeteer + react @anonbug</div>
    </div>
  );
}

export default App;
