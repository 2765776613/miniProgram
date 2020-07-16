import { request } from "../../request/index.js";
import regeneratorRuntime from '../../lib/runtime/runtime.js';
// pages/category/index.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        // 左侧的菜单数据
        leftMenuList: [],
        // 右侧的商品数据
        rightContent: [],
        // 被点击的左侧菜单
        currentIndex: 0,
        // 右侧内容的滚动条距离顶部的距离
        scrollTop: 0
    },
    // 整体的返回数据
    Cates: [],
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
        /*
        0 web中的本地存储和 小程序中的本地存储的区别
            1 写代码的方式不一样了
                web：localStorage.setItem("key","value")
                     localStorage.getItem("key")
                小程序：wx.setStorageSync("key","value")
                       wx.getStorageSync("key")
            2 存的时候 有没有做类型转换
                web：不管存入的是什么类型的数据，最终都会先调用一下toString()，把数据变成了字符串，再存进去
                小程序：不存在类型转换的这个操作，存什么类型的数据进去，获取的时候就是什么类型
            
        1 先判断一下本地存储中有没有旧的数据
        2 没有旧数据 直接发送新请求
        3 有旧的数据 同时 旧的数据也没有过期 就使用 本地存储中的旧数据即可
        */
        // this.getCates();
        // 1 获取本地存储中的数据
        const Cates = wx.getStorageSync("cates");
        // 2 判断
        if (!Cates) {
            // 不存在 发送请求获取数据
            this.getCates();
        } else {
            // 有旧的数据 定义一个过期时间 10s
            if (Date.now() - Cates.time > 1000 * 10) {
                // 重新发送请求
                this.getCates();
            } else {
                // 可以使用旧的数据
                // console.log("可以使用旧的数据");
                this.Cates = Cates.data;
                // 构造左侧的菜单数据
                let leftMenuList = this.Cates.map(v => v.cat_name);
                // 构造右侧的商品数据 （先获取第1个菜单的商品数据，渲染到页面中，后面再更改索引）
                let rightContent = this.Cates[0].children;
                this.setData({
                    leftMenuList,
                    rightContent
                })
            }

        }
    },
    // 获取分类数据
    async getCates() {
        // request({
        //     url: "/categories"
        // }).then(result => {
        //     // 先将数据整体保存到Cates中去
        //     this.Cates = result.data.message;

        //     // 把接口的数据存入到本地存储中
        //     wx.setStorageSync("cates", { time: Date.now(), data: this.Cates });

        //     // 构造左侧的菜单数据
        //     let leftMenuList = this.Cates.map(v => v.cat_name);
        //     // 构造右侧的商品数据 （先获取第1个菜单的商品数据，渲染到页面中，后面再更改索引）
        //     let rightContent = this.Cates[0].children;
        //     this.setData({
        //         leftMenuList,
        //         rightContent
        //     })
        // })

        // 1 使用es7的async await来发送请求
        const result = await request({ url: "/categories" });
        // 先将数据整体保存到Cates中去
        // this.Cates = result.data.message;
        this.Cates = result // 此时需要更改resolve(result)改为resolve(result.data.message)

        // 把接口的数据存入到本地存储中
        wx.setStorageSync("cates", { time: Date.now(), data: this.Cates });

        // 构造左侧的菜单数据
        let leftMenuList = this.Cates.map(v => v.cat_name);
        // 构造右侧的商品数据 （先获取第1个菜单的商品数据，渲染到页面中，后面再更改索引）
        let rightContent = this.Cates[0].children;
        this.setData({
            leftMenuList,
            rightContent
        })
    },
    // 左侧菜单的点击事件
    handleItemTap(e) {
        /* 
        1 获取被点击的标题身上的索引
        2 给data中的currentIndex赋值就可以了 
        */
        const { index } = e.currentTarget.dataset;
        let rightContent = this.Cates[index].children;
        this.setData({
            currentIndex: index,
            rightContent,
            // 重新设置 右侧内容的scroll-view标签的距离顶部的距离
            scrollTop: 0
        })
    }

})