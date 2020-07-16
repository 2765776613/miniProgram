/*
1 获取用户的收货地址
  1 绑定点击事件
  2 调用小程序内置的api 获取用户的收获地址 wx.chooseAddress

  2 获取用户对小程序所授予获取地址的权限状态 scope
    1 假设用户点击获取收货地址的提示框 确定 scope为true 直接调用获取收获地址
    2 假设用户从来没有调用过收货地址的api scope为undefined 直接调用获取收获地址
    3 假设用户点击获取收货地址的提示框 取消 scope为false
      1 诱导用户自己打开授权设置页面 当用户重新给予获取地址权限的时候
      2 获取收货地址
    4 把获取到的收货地址存入到本地存储中
2 页面加载完毕
    1 获取本地存储中的地址数据
    2 把数据设置给data中的一个变量
3 onShow
    1 获取缓存中的购物车数组
    2 把购物车数据 填充到data中
4 全选的实现 数据的展示
    1 onShow 获取缓存中的购物车数组
    2 根据购物车中的商品数据 所有的商品都被选中checked=true  全选就被选中
5 总价格和总数量
    1 都需要商品被选中 我们才进行计算
    2 获取到购物车数组
    3 遍历
    4 判断商品是否被选中
    5 总价格+=商品的单价*商品的数量
    5 总数量+=商品的数量
    6 把计算后的价格和数量设置回data中
6 商品的选中
    1 绑定change事件
    2 获取被修改的商品对象
    3 商品对象的选中状态 取反
    4 重新填充回data中和缓存中
    5 重新计算全选 总价格 总数量
7 全选和反选
    1 全选的复选框绑定事件 change
    2 获取data中的全选变量 allChecked
    3 直接取反 allChecked
    4 遍历购物车数组 让里面的商品选中状态跟随allChecked改变而改变
    5 把购物车数组和allChecked冲洗设置回data 把购物车重新设置回缓存中
8 商品数量的编辑
    1 "+" "-" 按钮 绑定同一个点击事件 区分的关键：自定义属性
    2 传递被点击的商品id goods_id 
    3 获取到data中的购物车数组 来获取需要被修改的商品对象
    4 当购物车数量=1 同时 用户点击 "-" 弹窗提示 询问用户是否要删除
        1 确定 直接执行删除
        2 取消 什么都不做
    4 直接修改商品对象的num
    5 重新设置 this.setCart
9 点击结算 
    1 判断有没有收获地址信息 
    2 判断用户有没有选购商品
    3 经过以上的验证 跳转到支付页面
*/
import { getSetting, chooseAddress, openSetting, showModel, showToast } from "../../utils/asyncWx.js"
import regeneratorRuntime from '../../lib/runtime/runtime.js';
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
        const cart = wx.getStorageSync("cart") || [];
        this.setData({
            address
        });
        this.setCart(cart);
    },
    // 点击收货地址
    async handleChooseAddress() {
        try {
            // 1 获取权限状态
            const res = await getSetting();
            const scopeAddress = res.authSetting["scope.address"];
            // 2 判断权限状态
            if (scopeAddress == false) {
                // 3 诱导用户打开授权页面
                await openSetting();
            }
            // 4 调用获取收货地址的api
            let address = await chooseAddress();
            address.all = address.provinceName + address.cityName + address.countyName + address.detailInfo

            // 5 存入到缓存中
            wx.setStorageSync("address", address);
        } catch (error) {
            console.log(error);
        }
    },
    // 商品的选中
    handleItemChange(e) {
        // 1 获取被修改的商品id
        const goods_id = e.currentTarget.dataset.id;
        // 2 获取购物车数组
        let cart = this.data.cart;
        // 3 找到被修改的商品对象
        let index = cart.findIndex(v => v.goods_id === goods_id);
        // 4 选中状态取反
        cart[index].checked = !cart[index].checked;
        this.setCart(cart);
    },
    // 设置购物车状态 同时计算 底部工具栏的数据
    setCart(cart) {
        let allChecked = true;
        // 1 总价格 总数量
        let totalPrice = 0;
        let totalNum = 0;
        cart.forEach(v => {
            if (v.checked) {
                totalPrice += v.num * v.goods_price;
                totalNum += v.num;
            } else {
                allChecked = false;
            }
        });
        // 判断数组是否为空
        allChecked = cart.length ? allChecked : false;

        // 5 6 购物车数据重新设置回data中和缓存中
        this.setData({
            cart,
            totalNum,
            totalPrice,
            allChecked
        });
        wx.setStorageSync("cart", cart);
    },
    // 商品的全选功能
    handleItemAllChecked() {
        // 1 获取data中的数据
        let cart = this.data.cart;
        let allChecked = this.data.allChecked;
        // 2 修改值
        allChecked = !allChecked;
        // 3 循环修改cart数组 中的商品选中状态
        cart.forEach(v => {
            v.checked = allChecked
        });
        // 4 把修改后的值 填充回data中或者缓存中
        this.setCart(cart);
    },
    // 商品数量的编辑功能
    async handleItemNumEdit(e) {
        // 1 获取传递过来的参数
        const id = e.currentTarget.dataset.id;
        const operation = e.currentTarget.dataset.operation;
        console.log(id, operation);
        // 2 获取购物车数组
        let cart = this.data.cart;
        // 3 找到需要修改的商品的索引
        const index = cart.findIndex(v => v.goods_id === id);
        // 4 判断是否要执行删除
        if (cart[index].num == 1 && operation == -1) {
            // 4.1 弹窗提示
            const result = await showModel({ content: "您是否要删除?" });
            if (result.confirm) {
                cart.splice(index, 1);
                this.setCart(cart);
            }
        } else {
            // 4 进行修改数量
            cart[index].num += operation;
            // 5 设置回缓存和data中
            this.setCart(cart);
        }
    },
    // 点击结算验证功能
    async handlePay() {
        // 1 判断收获地址
        const address = this.data.address;
        if (!address.userName) {
            await showToast({ title: "您还没有选择收货地址" });
            return; // 结束整个函数
        }
        // 2 判断用户有没有选购商品
        const totalNum = this.data.totalNum;
        if (totalNum == 0) {
            await showToast({ title: "您还没有选购商品" });
            return;
        }
        // 3 跳转到支付页面
        wx.navigateTo({
            url: '/pages/pay/index'
        });
    }

})