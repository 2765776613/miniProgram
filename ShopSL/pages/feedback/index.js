/*
1 点击'+' 触发tap点击事件
    1 调用小程序内置的选择图片的api
    2 获取到图片路径 数组
    3 把图片路径都存入data中
    4 页面就可以根据data进行循环显示了
2 点击自定义图片组件
    1 获取被点击元素的索引
    2 获取data中的图片数组
    3 根据索引 数组中删除对应的元素
    4 把数组重新设置回data中
3 点击 "提交"
    1 获取文本域的内容
    2 对这些内容 合法性验证
    3 验证通过 用户选择的图片 上传到专门的图片的服务器 返回图片外网的链接
    4 文本域和外网的图片的路径 一起提交到服务器   // 前端的模拟 不会发送到后台
    5 清空当前页面
    6 返回上一页
*/
Page({

    /**
     * 页面的初始数据
     */
    data: {
        tabs: [{
                id: 0,
                value: "体验问题",
                isActive: true
            },
            {
                id: 1,
                value: "商品、商家投诉",
                isActive: false
            }
        ],
        chooseImgs: [],
        // 文本域的内容
        textVal: ""
    },

    // 外网的图片路径数组
    UpLoadImgs: [],

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
    // 点击 '+' 选择图片
    handleChooseImg() {
        // 1 调用小程序内置的选择图片api
        wx.chooseImage({
            count: 9, // 同时选中图片的最大数量
            sizeType: ['original', 'compressed'], // 图片的格式 原图和压缩
            sourceType: ['album', 'camera'], // 图片的来源 相册和相机
            success: (result) => {
                // 图片数组 进行拼接
                this.setData({ chooseImgs: [...this.data.chooseImgs, ...result.tempFilePaths] });
            }
        });
    },
    // 点击自定义图片组件
    handleRemoveImg(e) {
        // 1 获取被点击的组件的索引
        const { index } = e.currentTarget.dataset;
        // 2 获取data中的图片数组
        let { chooseImgs } = this.data;
        // 3 删除元素
        chooseImgs.splice(index, 1);
        // 4 重新填充回data中
        this.setData({ chooseImgs });
    },
    // 文本域的输入事件
    handleTextInput(e) {
        this.setData({ textVal: e.detail.value });
    },
    // 提交按钮的点击
    handleFormSubmit() {
        // 1 获取文本域的内容
        const { textVal, chooseImgs } = this.data;
        // 2 合法性验证 空字符串
        if (!textVal.trim()) {
            // 不合法
            wx.showToast({
                title: '输入不合法',
                mask: true
            });
            return;
        }
        // 3 准备上传图片 到专门的服务器
        // 上传文件的api 不支持多个文件同时上传 遍历数组
        // 显示正在等待的图片
        wx.showLoading({
            title: "正在上传中",
            mask: true
        });
        // 判断有没有需要上传的图片数组
        if (chooseImgs.length) {
            chooseImgs.forEach((v, i) => {
                wx.uploadFile({
                    // 由于此图床api不可用 无法完成图片上传到图床的操作
                    url: 'https://imgurl.org/', // 图片要上传到哪里
                    filePath: v, // 被上传的文件的路径
                    name: "file", // 上传的文件名称  后台来获取文件
                    formData: {}, // 顺带的一些文本信息
                    success: (result) => {
                        let url = JSON.parse(result.data).url;
                        this.UpLoadImgs.push(url);
                        // 所有的图片都上传完毕了才触发
                        if (i === chooseImgs.length - 1) {
                            wx.hideLoading();
                            console.log("把文本的内容和外网的图片数组提交到后台");
                            // 重置页面
                            this.setData({
                                textVal: "",
                                chooseImgs: []
                            });
                            // 返回上一个页面
                            wx.navigateBack({
                                delta: 1
                            });
                        }
                    }
                });
            });
        } else {
            wx.hideLoading();
            console.log("只是提交了文本");
            wx.navigateBack({
                delta: 1
            });
        }


    }

})