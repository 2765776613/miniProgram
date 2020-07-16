# 微信小程序之商城搭建

我将<font size='20' color="red">总结</font>写在开头，经过这个项目的学习，我认为我学到的不仅仅只是**实现整个效果**这么简单，更重要的是自己将**小程序的语法**基本上学了一遍（后期可能还需要重新学习），以前做的基本都是静态页面，而这个项目全部都是从接口中拿到**数据渲染**到页面，这一开发风格符合公司的要求。（这个项目的订单以及支付那一块我掌握的还不好），后期还需要对vue、es6、es7、less等进行学习。

**上线还需要注意的地方**：必须把所有的接口域名添加到白名单（点击开发----开发设置）

## 第一步 项目准备

1. 删除多余文件夹（logs，utils），清空js、wxml、wxss文件内容，重新生成js文件内容

   ```js
   index.js   ---  wx-page  + Enter
   app.js     ---  wx-app   + Enter
   ```

2. 删除app.json中的logs部分，并且在index.json加入以下部分**（json文件中不能含有注释）**

   ```js
   "navigationBarTitleText": "优购首页"
   ```

3. 搭建目录结构

   ```
   styles     存放公共样式
   components 存放组件
   lib        存放第三方库
   utils      自己的帮助库
   request    自己的接口帮助库
   ```

4. 搭建项目的页面结构

   > 首页：index                                         搜索页面：search	
   >
   > 分类页面：category                            个人中心页面：user
   >
   > 商品列表页面：goods_list				  意见反馈页面：feedback
   >
   > 商品详情页面：goods_detail             登录页面：login
   >
   > 购物车页面：cart                                 授权页面：auth
   >
   > 收藏页面：collect                                结算页面：pay
   >
   > 订单页面：order

5. 引入字体图标：在iconfont官网添加图标至项目后，点击查看在线链接，进入此链接，复制页面的代码，在styles文件夹中新建iconfont.wxss，将代码粘贴到此文件，然后在全局样式文件中引用此样式文件。

   ```css
   @import "./styles/iconfont.wxss";
   /* 使用字体图标 */
   <text class="iconfont icon-shoucang"></text>
   ```

6. 搭建项目tabBar结构：在app.json文件中输入tabBar按下enter键即可构建基本结构

   ```js
       "tabBar": {
           "color": "",    // 未选中字体颜色
           "selectedColor": "",  // 选中后字体颜色
           "backgroundColor": "",
           "position": "bottom",
           "borderStyle": "black",
           // list大小至少为2时才能运行成功
           "list": [
               {
                   "pagePath": "",  // 页面路径
                   "text": "",      // tab名称
                   "iconPath": "",  // 未选中图标路径
                   "selectedIconPath": ""  // 选中后图标路径
               }
           ]
       }
   ```

7. 初始化页面样式(app.wxss)   **在微信小程序中不支持通配符 ‘*’**

   ```css
   /*
   主体颜色 通过变量来实现
   1 less(css预处理语言)中存在变量
   2 原生的css和wxss也是支持变量的
   */
   page {
       /*定义主体颜色*/
       --themeColor: #eb4450;
       /* 定义统一的字体大小 */
       font-size: 28rpx;
   }
   
   /* 使用主题颜色 */
   view {
       color: var(--themeColor);
   }
   ```

## 第二步 首页制作

1. 搜索框制作：由于此结构在多个页面中都有使用，所以选择自定义组件来实现这个结构

   1. 新建组件
   2. 在需要使用组件的页面的配置文件中进行引用声明
   3. 在wxml文件中使用组件(以标签的形式)  例如：<SearchInput></SearchInput>

2. 轮播图制作

   1. 获取接口数据：通过发送异步请求wx.request  （**不合法域名的报错是如何处理的？**）

   2. 将数据渲染到页面中去

      >  1 swiper标签存在默认的宽度和高度 100% * 150px
      >
      >  2 image标签也存在默认的宽度和高度 320px * 240px
      >
      >  3 设计图片和轮播图
      >
      > ​         1 原图宽高 750*340
      >
      > ​         2 让图片的高度自适应 宽度等于100%
      >
      >   4 图片标签
      >
      > ​          mode属性表示渲染模式=widthFix
      >
      >   5 circular 循环轮播 autoplay 自动轮播 

3. 分类导航制作(**类似轮播图搭建的步骤**)

4. 楼层制作

   1. 获取接口数据
   
   2. 将数据渲染到页面中去（双层循环）                    **（重点在于页面的布局和图片高度的计算）**
          // 后面四张图片的高度计算（因为其高度是第一张图片高度的一半）   
                 // 首先根据宽高等比例关系，计算出第一张图片在页面中的高度，然后除以2就是后面四张图片高度  
                 height: 33.33vw * 386 / 232 / 2;      (第一张图片的原图为232*386)  

## 第三步 分类制作

1. 获取接口数据：

   ```js
   // 获取分类数据
   /*
   v=>v.cat_name
   等价于 function(v){
   	return v.cat_name;
   }
   */
   getCates() {
       request({
           url: "https://api-hmugo-web.itheima.net/api/public/v1/categories"
       }).then(result => {
           // 先将数据整体保存到Cates数组中去
           this.Cates = result.data.message;
           // 构造左侧的菜单数据
           let leftMenuList = this.Cates.map(v => v.cat_name);
           // 构造右侧的商品数据
           let rightContent = this.Cates[0].children;
           this.setData({
               leftMenuList,
               rightContent
           })
       })
   },
   ```

2. 渲染数据到页面中

   ```html
   <!-- 左侧菜单  -->
   <!-- 
   scroll-y 控制标签纵向滚动
   index==currentIndex?'active':'' 当索引为鼠标所选的索引时，将为菜单栏添加class='active'
   wx:key="*this"  因为循环项是一个普通数组
   通过点击事件可以获取index的值，是因为设置了data-index
   flex-wrap: wrap ---- flex布局中默认是不换行的,但是如果我们一行有好几个盒子而父盒子宽度又不够宽的话,不换行就会自动改变盒子大小影响布局。
   vw：1vw等于视口宽度的1%    vh：1vh等于视口高度的1%
   -->
   <scroll-view scroll-y class="left_menu" >
       <view 
             class="menu_item {{index==currentIndex?'active':''}}"
             wx:for="{{leftMenuList}}"
             wx:key="*this"
             bindtap="handleItemTap"
             data-index="{{index}}"
             >
           {{item}}
       </view>
   </scroll-view>
   <!-- 右侧商品内容  -->
   <scroll-view scroll-y class="right_content">
       <view class="goods_group"
             wx:for="{{rightContent}}"
             wx:key="cat_id"
             wx:for-item="item1"
             wx:for-index="index1"
             >
           <view class="goods_title">
               <text class="delimiter">/</text>
               <text class="title">{{item1.cat_name}}</text>
               <text class="delimiter">/</text>
           </view>
           <view class="goods_list">
               <navigator
                          wx:for="{{item1.children}}"
                          wx:key="cat_id"
                          wx:for-item="item2"
                          wx:for-index="index2"
                          >
                   <image src="{{item2.cat_icon}}" mode="widthFix"></image>
                   <view class="goods_name">{{item2.cat_name}}</view>
               </navigator>
           </view>
       </view>
   </scroll-view>
   ```

## 第四步 商品列表制作

1. 自定义组件（实现tab切换效果）
   1. 菜单切换：利用组件之间绑定事件（传递点击的索引值）
   2. 内容切换：利用slot标签
2. 下拉刷新
   1. 生命周期事件：onPullDownRefresh()
   2.  页面配置：  "enablePullDownRefresh": true,"backgroundTextStyle": "dark"
3. 滚动条触底事件：onReachBottom()
4. 显示消息提示框：wx.showToast({ title: '没有下一页数据了' })

## 第五步 商品详情制作

1. 文字省略显示固定代码：

   ```css
   display: -webkit-box;
   overflow: hidden;
   -webkit-box-orient: vertical;
   -webkit-line-clamp: 2;
   ```

2. **商品详情模块**的制作只需使用一个富文本标签**rich-text**即可

   ```html
   <rich-text nodes="{{goodsObj.goods_introduce}}"></rich-text>
   ```

3. 点击轮播图预览大图功能：previewImage

   ```js
   handlePreviewImage(e) {
       // 1 先构造要预览的图片数组
       const urls = this.GoodsInfo.pics.map(v => v.pics_mid);
       // 2 接收传递过来的图片url  
       var current = e.currentTarget.dataset.url;  // wxml中轮播图标签有一个属性data-url
       wx.previewImage({
           current: current,
           urls: urls
       });
   }
   ```

4. 加入购物车功能：缓存技术

   ```js
   // 点击加入购物车
   handleCartAdd() {
    // 1 先获取缓存中的购物车数组
       let cart = wx.getStorageSync("cart") || [];
       // 2 判断 商品对象是否存在与购物车数组中
       let index = cart.findIndex(v => v.goods_id === this.GoodsInfo.goods_id);
       if (index == -1) {
           // 3 不存在 表示第一次添加
           this.GoodsInfo.num = 1;
           cart.push(this.GoodsInfo);
       } else {
           // 4 已经存在
           cart[index].num++;
       }
       // 5 把购物车重新添加到缓存中
       wx.setStorageSync("cart", cart);
       // 6 弹窗提示
       wx.showToast({
           title: '加入成功',
           icon: 'success',
           mask: true
       });
   }
   ```
   

## 第六步 购物车页面

1. 收货地址显示与隐藏：通过wx:if来进行判断，若地址对象中没有数据，则显示收货地址，若有数据，则向页面中渲染收货地址详情。

2. 重要步骤如下：

   ```js
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
   ```

## 第七步 支付页面

1. 页面的搭建：为了节省时间，我将这个页面搭建的和购物车页面基本一致，因此只需要将购物车的代码复制过来即可，唯一需要实现的功能就是，支付页面应该只支付购物车**已选中**的商品，而不是将cart中的所有商品都渲染到页面中进行支付。

   ```js
   // 1 获取缓存中的购物车数据
   let cart = wx.getStorageSync("cart") || [];        
   // 2 过滤后的购物车数组
   cart = cart.filter(v => v.checked);
   ```

2. 支付流程：创建订单(获取订单编号order_number)---准备预支付(获取支付参数pay)---发起微信支付(提交pay参数)---查询订单

   **由于支付接口访问不了，此部分功能未实现，可学习一下思路**

## 第八步 个人中心页面

1. 主要实现了页面的布局效果，都是静态页面，由于接口访问不了，无法实现动态渲染

2. 订单页面无法完成：只做了tap栏，数据未渲染到页面

3. 收藏功能：（该功能放置在商品详情页面）

   1. 首先需要接收从列表页传过来的goods_id：由于收藏页需要多次加载，因此不可以使用onLoad来获取列表页传过来的goods_id，只能使用onShow；

      ```js
      onShow: function() {
          let pages = getCurrentPages();  // 获取当前小程序的页面栈（数组格式）
          let currentPage = pages[pages.length - 1]; // 获取页面栈中索引最大的页面即当前页面
          let options = currentPage.options; 
          let goods_id = options.goods_id;
      }
      ```

   2.  页面一旦加载就会加载商品详情数据，并且收藏按钮也应该加载出来，所以需要将下面的代码写到商品详情数据加载的函数中。

       ```js
       // 1 获取缓存中的商品收藏按钮
       let collect = wx.getStorageSync("collect") || [];
       // 2 判断当前商品是否被收藏  isCollect: true收藏图标为一种   false收藏图标变为另外一种
       let isCollect = collect.some(v => v.goods_id === this.GoodsInfo.goods_id);
       this.setData({isCollect});   // 存入data中 立即渲染页面
       ```

   3.  点击收藏功能：（给标签绑定点击事件bindtap="handleCollect"）

       ```js
       // 点击 商品收藏
       // 一个是更新缓存collect数组  另外是更新isCollect(用来改变图标)
       handleCollect() {
           let isCollect = false;  // 重新赋初值
           // 1 获取缓存中的商品收藏数组
           let collect = wx.getStorageSync("collect") || [];
           // 2 判断该商品是否被收藏过
           let index = collect.findIndex(v => v.goods_id === this.GoodsInfo.goods_id);
           // 3 当index!=-1表示 已经收藏过
           if (index != -1) {
               // 能找到 已经收藏过了 
               collect.splice(index, 1);  // 在数组中删除该商品
               isCollect = false;  // 此时按钮变为 未收藏状态
               // 弹框提示
               wx.showToast({
                   title: '取消成功',
                   icon: 'success',
                   mask: true
               });
           } else {
               // 要收藏该商品
               collect.push(this.GoodsInfo);  // 在数组中添加该商品
               isCollect = true;  // 此时按钮变为 收藏状态
               // 弹框提示
               wx.showToast({
                   title: '收藏成功',
                   icon: 'success',
                   mask: true
               });
           }
           // 4 把数组存入都缓存中  页面一旦加载就需要查询，所以才存入缓存中
           wx.setStorageSync("collect", collect);
           // 5 修改data中的属性 isCollect
           this.setData({ isCollect });
       }
       ```

4.  **收藏页面**：和goods_list一样也需要使用Tabs组件，并且商品的展示页面和goods_list的页面展示一样（copy代码），注意这部分的数据是从缓存中获取的，然后渲染到页面中去

## 第九步 搜索页面

1. 前端功能（超出一行显示省略号）：

   ```css
   white-space: nowrap; // 使文本在一行内显示
   overflow: hidden;  // 超出隐藏
   text-overflow: ellipsis; // 末尾加上省略号
   ```

2. 动态渲染的过程：

   ```js
   wxml文件：
   <input value="{{inpValue}}" placeholder="请输入您要搜索的商品" bindinput="handleInput"/>
   <button hidden="{{!isFocus}}" bindtap="handleCancel">取消</button>
   js文件：
   data: {
       goods: [],  
       // 取消按钮是否显示  当输入框有内容时，显示:true  
       isFocus: false,  
       // 输入框的值
       inpValue: ""  // 点击取消按钮时重新赋值空
   },
   // 输入框的值一旦改变，就会触发bindinput事件
   handleInput(e) {
       // 1 获取输入框的值
       const { value } = e.detail;
       // 2 空字符串判断
       if (!value.trim()) {
           this.setData({
               goods: [],
               isFocus: false
           });
           // 值不合法
           return;
       }
       // 3 准备发送请求获取数据
       this.setData({ isFocus: true });   // 一旦输入，显示取消按钮
       clearTimeout(this.TimeId);      // 清空定时器
       // 设置定时器，防止每输入一个字符向服务器发送请求，加大服务器压力
       this.TimeId = setTimeout(() => {
           this.qsearch(value);   // 按value值进行查询，并存入goods数组中
       }, 1000);
   },
   // 点击取消按钮
   handleCancel() {
       this.setData({
           inpValue: "",  // 输入框赋值为空
           isFocus: false,  // 隐藏取消按钮
           goods: []  // 清空页面内容
       })
   }
   ```

## 第十步 意见反馈页面

1. 静态页面搭建

2. 从本地上传图片：

   ```js
   // 点击 '+' 选择图片
   handleChooseImg() {
       // 1 调用小程序内置的选择图片api
       wx.chooseImage({
           count: 9, // 同时选中图片的最大数量
           sizeType: ['original', 'compressed'], // 图片的格式 原图和压缩
           sourceType: ['album', 'camera'], // 图片的来源 相册和相机
           success: (result) => {
               // 2. 保存到图片数组  如果要连续添加，所以要进行拼接
               this.setData({ chooseImgs: [...this.data.chooseImgs, ...result.tempFilePaths] });
           }
       });
   }
   ```

3. 点击图片就会删除图片：

   ```js
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
   }
   ```

4. 将图片上传到专门的服务器，返回图片外网的链接：

   ```js
   // 上传文件的api 不支持多个文件同时上传 (因此需要遍历文件数组)
   var upTask = wx.uploadFile({
       url: '',    // 图片上传到的地方
       filePath: , // 被上传的文件的地址
       name: ,  // 上传的文件的名称， 供后台来获取文件
       formData: {}, // 上传需要顺带的一些文本信息
       success: (result)=>{
       	console.log(result);
   	}
   });
   ```

   

