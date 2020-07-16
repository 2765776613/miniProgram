import { request } from "../../request/index.js"
import regeneratorRuntime from '../../lib/runtime/runtime.js';
import { login } from "../../utils/asyncWx.js"
Page({
    data: [

    ],
    // 获取用户信息encryptedData rawData iv signature
    async handleGetUserInfo(e) {
        try {
            // 1 获取用户信息  
            const { encryptedData, rawData, iv, signature } = e.detail;
            // 2 获取小程序登录成功后的code
            const { code } = await login();
            const loginParams = { encryptedData, rawData, iv, signature, code };
            // 3 发送请求 获取用户的token值
            let token = await request({ url: "/users/wxlogin", data: loginParams, methods: "POST" });
            // 自己设置
            token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOjIzLCJpYXQiOjE1NjQ3MzAwNzksImV4cCI6MTAwMTU2NDczMDA3OH0.YPt-XeLnjV-_1ITaXGY2FhxmCe4NvXuRnRB8OMCfnPo";
            // 4 把token存入缓存中， 同时跳转回上一个页面
            wx.setStorageSync("token", token);
            wx.navigateBack({
                delta: 1 // 1 表示返回一层
            });
        } catch (error) {
            console.log(error);
        }
    }
})