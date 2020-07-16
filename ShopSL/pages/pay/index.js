/*
1 微信支付
  1 哪些人 那些账号 可以实现微信支付
    1 企业账号 
    2 企业账号的小程序后台中 必须 给开发者 添加上白名单
      1 一个APPID 可以同时绑定多个开发者
      2 这些开发者就可以共用这个APPID 和 它的开发权限
2 支付按钮
  1 先判断缓存中有没有token
  2 没有的话--跳转到授权页面 进行token的获取
    有的话--创建订单并获取到订单编号 获取支付参数pay 发起微信支付
3 支付成功的商品 从购物车中清除
    1 手动删除缓存中 已经被选中对的商品
    2 删除后的购物车数据 填充回缓存
    3 跳转页面

*/
import { getSetting, chooseAddress, openSetting, showModel, showToast, requestPayment } from "../../utils/asyncWx.js"
import regeneratorRuntime from '../../lib/runtime/runtime.js';
import { request } from "../../request/index.js"
Page({
    data: {
        address: {},
        cart: [],
        allChecked: false,
        totalPrice: 0,
        totalNum: 0
    },
    onShow() {
        // 1 获取缓存中的收货地址信息
        const address = wx.getStorageSync("address");
        // 1 获取缓存中的购物车数据
        let cart = wx.getStorageSync("cart") || [];

        // 过滤后的购物车数组
        cart = cart.filter(v => v.checked);

        let totalPrice = 0;
        let totalNum = 0;
        cart.forEach(v => {
            totalPrice += v.num * v.goods_price;
            totalNum += v.num;
        });
        this.setData({
            cart,
            totalNum,
            totalPrice,
            address
        });
        wx.setStorageSync("cart", cart);
    },
    // 点击支付功能
    async handleOrderPay() {
        try {
            // 1 判断缓存中有没有token
            let token = wx.getStorageSync("token");
            // 2 判断
            if (!token) {
                wx.navigateTo({
                    url: '/pages/auth/index'
                });
                return;
            }
            console.log("已经存在token");
            // 3 创建订单
            // 3.1 准备 请求头参数
            const header = { Authotization: token };
            // 3.2 准备 请求体参数
            const order_price = this.data.totalPrice;
            const consignee_addr = this.data.address.all;
            const cart = this.data.cart;
            let goods = [];
            cart.forEach(v => goods.push({
                goods_id: v.goods_id,
                goods_num: v.num,
                goods_price: v.goods_price
            }));
            const orderParams = { order_price, consignee_addr, goods };
            // console.log(orderParams);
            // 4 准备发送请求 创建订单 获取订单编号
            const { order_number } = await request({ url: "/my/orders/create", methods: "POST", data: orderParams, header: header });
            // console.log(order_number);
            // 5 获取支付参数pay
            const { pay } = await request({ url: "/my/orders/req_unifiedorder", methods: "POST", header: header, data: { order_number } });
            // 6 发起微信支付
            await requestPayment(pay);
            // 7 查询后台 订单状态
            const res = await request({ url: "/my/orders/chkOrder", methods: "POST", header: header, data: { order_number } });
            await showToast({ title: "支付成功" });
            // 8 手动删除缓存中 已经支付了的商品
            let newCart = wx.getStorageSync("cart");
            newCart = newCart.filter(v => !v.checked);
            wx.setStorageSync("cart", newCart);
            // 8 支付成功后 跳转到订单页面
            wx.navigateTo({
                url: '/pages/order/index'
            });
        } catch (error) {
            await showToast({ title: "支付失败" });
            console.log(error);
        }
    },

})