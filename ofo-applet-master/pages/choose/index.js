// pages/choose/choose.js
Page({
       data: {
        number:1001,
       },
       onLoad: function (options) {
       },
       /**
        * 生命周期函数--监听页面显示
        */
       onShow: function () {

       },

// 扫码使用车位
       saoma:function(){
              if (this.timer === "" || this.timer === undefined) {
                     wx.scanCode({                      
                         success: (res) => {            
                           console.log(res)
                           wx.showLoading({
                             title: '正在请求中中',
                             mask: true
                           })
                         //   向服务器请求密码                   
                                 setTimeout(function () {
                                     //要延时执行的代码
                                     wx.hideLoading();
                                   }, 1000)           
                                   // 请求密码成功隐藏等待框
                                   wx.navigateTo({
                                    url: '../billing/index?number=1001'                                  
                                })
                                wx.showToast({
                                  title: '请求成功',
                                  duration: 1000
                                })         
                     // 当前已经在计费就回退到计费页
                 }
                 })
                }
                 else {
                     wx.navigateTo({
                       url: '../billing/index.js',
                     })
                 }
                },
// 输入车位号使用车位
              shuru:function(){
                wx.navigateTo({
                  url: '../input/index'
              })
              }
})