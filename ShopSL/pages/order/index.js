/*
1 页面被打开的时候 onShow
    0 onShow 不同于 onLoad 无法在形参上接收 options参数
    1 获取url上的参数type
    2 根据type去发送请求获取订单数据
    3 渲染页面
2 点击不同的标题 重新发送请求来获取和渲染数据
*/
import { request } from "../../request/index.js";
import regeneratorRuntime from '../../lib/runtime/runtime.js';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        tabs: [{
                id: 0,
                value: "全部",
                isActive: true
            },
            {
                id: 1,
                value: "待付款",
                isActive: false
            },
            {
                id: 2,
                value: "待发货",
                isActive: false
            },
            {
                id: 3,
                value: "退款/退货",
                isActive: false
            }
        ],
    },
    onShow() {
        // 1. 获取当前的小程序的页面栈 长度最大是10页面
        var pages = getCurrentPages();
        // 2. 数组中 索引最大的页面就是当前页面
        let currentPage = pages[pages.length - 1];
        // console.log(currentPage.options);
        // 3. 获取url上的type参数
        const { type } = currentPage.options;
        // this.getOrders(type);
    },
    // 接口访问不了-end
    // 获取订单列表的方法 
    // async getOrders(type) {
    //     const res = await request({ url: "/my/orders/all", data = { type } });
    //     console.log(type);
    // },
    // 标题的点击事件 从子组件传递过来
    handleTabsItemChange(e) {
        // 1 获取被点击的标题索引
        const { index } = e.detail;
        // 2 修改原数组
        let { tabs } = this.data;
        tabs.forEach((v, i) => i === index ? v.isActive = true : v.isActive = false);
        //  3 赋值到data中
        this.setData({
            tabs
        })
    },
})