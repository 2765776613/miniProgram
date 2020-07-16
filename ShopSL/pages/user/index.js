// pages/user/index.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userinfo: {},
        collectNum: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {

    },
    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
        const userinfo = wx.getStorageSync("userinfo");
        // 收藏数量
        const collectNum = wx.getStorageSync("collect").length;
        this.setData({
            userinfo,
            collectNum
        });
    },

})