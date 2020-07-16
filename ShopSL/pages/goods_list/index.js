/*
1 用户上滑页面 滚动条触底 开始加载下一页数据
    1 找到滚动条触底事件
    2 判断还有没有下一页数据
        1 获取到总页数 目前只有总条数
            总页数=Math.ceil(总条数/页容量)
        2 获取到当前的页码
        3 判断一下当前的页码是否大于等于总页数
            表示没有下一页数据
    3 假如没有下一页数据弹出一个提示
    4 假如还有下一页数据 来加载下一页数据
        1 当前的页码++
        2 重新发送请求
        3 数据请求回来 要对data中的数组进行拼接 而不是全部替换！
2 下拉刷新页面
    1 触发下拉刷新事件 需要在页面的json文件中开启一个配置项
    2 重置数据 数组全部清空
    3 重置页码pagenum=1
    4 重新发送请求
    5 数据请求回来 需要手动关闭等待效果
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
                value: "综合",
                isActive: true
            },
            {
                id: 1,
                value: "销量",
                isActive: false
            },
            {
                id: 2,
                value: "价格",
                isActive: false
            }
        ],
        goodsList: []
    },
    // 总页数
    titalPages: 1,
    // 接口要的参数
    QueryParams: {
        query: "",
        cid: "",
        pagenum: 1,
        pagesize: 10
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        this.QueryParams.cid = options.cid || "";
        this.QueryParams.query = options.query || "";
        this.getGoodsList();
    },
    // 获取商品列表数据
    async getGoodsList() {
        const res = await request({ "url": "/goods/search", data: this.QueryParams });
        // 获取总条数
        const total = res.total;
        // 计算总页数
        this.totalPages = Math.ceil(total / this.QueryParams.pagesize)
            // console.log(this.totalPages)
        this.setData({
            // 拼接数组
            goodsList: [...this.data.goodsList, ...res.goods]
        });
        // 关闭下拉刷新的窗口 如果没有调用下拉刷新窗口 直接关闭也不会报错
        wx.stopPullDownRefresh();
    },
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

    // 页面上滑 滚动条触底事件
    onReachBottom() {
        // 1 判断还有没有下一页数据
        if (this.QueryParams.pagenum >= this.totalPages) {
            // 没有下一页数据
            wx.showToast({ title: '没有下一页数据了' });
        } else {
            this.QueryParams.pagenum++;
            this.getGoodsList();
        }
    },
    // 下拉刷新事件
    onPullDownRefresh() {
        // 1 重置数组
        this.setData({
            goodsList: []
        });
        // 2 重置页面
        this.QueryParams.pagenum = 1;
        // 3 发送请求
        this.getGoodsList();
    }
})