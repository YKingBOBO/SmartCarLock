//index.js
//获取应用实例
var app = getApp()
Page({
    data: {
        scale: 18,
        latitude: 0,
        longitude: 0,
        output:"",
        avlnum: 0,
        cars:"",
        markers: [{
          id: 1,
          latitude: 29.88204322,
          longitude: 121.531615,
          name: '停车场一号',
          num:0
        },
        {
          id: 2,
          latitude: 29.88304322,
          longitude: 121.532615,
          name: '停车场二号',
          num:0
        },
        {
          id: 3,
          latitude: 29.88308322,
          longitude: 121.532815,
          name: '停车场三号',
          num:0
        },
      ]
    },
// 页面加载
    onLoad: function (options) {
        // 1.获取定时器，用于判断是否已经在计费
        // 1.页面初始化 options为页面跳转所带来的参数
        this.timer = options.timer;
        // 2.调用wx.getLocation系统API,获取并设置当前位置经纬度
        wx.getLocation({
            type: "gcj02",
            success: (res) => {
              console.log('输出为   latitude=' + res.latitude +';longitude=' + res.longitude)
                this.setData({
                    longitude: res.longitude,
                    latitude: res.latitude
                })
            }
        });

        // 3.设置地图控件的位置及大小，通过设备宽高定位
        wx.getSystemInfo({
            success: (res) => {
                this.setData({
                    controls: [{
                        id: 1,
                        iconPath: '/images/location.png',
                        position: {
                            left: 20,
                            top: res.windowHeight - 80,
                            width: 50,
                            height: 50
                        },
                        clickable: true
                    },
                        {
                            id: 2,
                            iconPath: '/images/use.png',
                            position: {
                                left: res.windowWidth / 2 - 45,
                                top: res.windowHeight - 100,
                                width: 90,
                                height: 90
                            },
                            clickable: true
                        },
                        {
                            id: 3,
                            iconPath: '/images/warn.png',
                            position: {
                                left: res.windowWidth - 70,
                                top: res.windowHeight - 80,
                                width: 50,
                                height: 50
                            },
                            clickable: true
                        },
                        {
                            id: 4,
                            iconPath: '/images/marker.png',
                            position: {
                                left: res.windowWidth / 2 - 11,
                                top: res.windowHeight / 2 - 45,
                                width: 30,
                                height: 45
                            },
                            clickable: true
                        },
                        {
                            id: 5,
                            iconPath: '/images/avatar.png',
                            position: {
                                left: res.windowWidth - 68,
                                top: res.windowHeight - 155,
                                width: 45,
                                height: 45
                            },
                            clickable: true
                        }]
                })
            }
        });
    },
// 页面显示
    onShow: function () {
        // 1.创建地图上下文，移动当前位置到地图中心
        this.mapCtx = wx.createMapContext("ofoMap");
        this.movetoPosition()
    },
// 地图控件点击事件
    bindcontroltap: function (e) {
        // 判断点击的是哪个控件 e.controlId代表控件的id，在页面加载时的第3步设置的id
        switch (e.controlId) {
            // 点击定位控件
            case 1:
                this.movetoPosition();
                break;
            // 点击转换到选择页面
            case 2:
                wx.navigateTo({
                    url: '../choose/index'
                });
                break;
            // 点击保障控件，跳转到报障页
            case 3:
                wx.navigateTo({
                    url: '../warn/index'
                });
                break;
            // 点击头像控件，跳转到个人中心
            case 5:
                wx.navigateTo({
                    url: '../my/index'
                });
                break;
            default:
                break;
        }
    },

// 地图标记点击事件，连接用户位置和点击的单车位置
    bindmarkertap: function (e) {
        console.log("e.markerId是"+e.markerId);
        let _markers = this.data.markers;
        let markerId = e.markerId-1;
        let currMaker = _markers[markerId];
        this.setData({
            polyline: [{
                points: [{
                    longitude: this.data.longitude,
                    latitude: this.data.latitude
                }, {
                    longitude: currMaker.longitude,
                    latitude: currMaker.latitude
                }],
                color: "#FF0000DD",
                width: 1,
                dottedLine: true
            }],
            scale: 18
        })


        wx.request({
            url: 'http://8.136.109.38:9000/getNumByid?id='+e.markerId,
            data: {},
            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            success: (res) => {
          this.setData({
                avlnum: res.data
          })
            },
            fail: function (res) {
                // fail
            },
            complete: function (res) {
                // complete
            }
        })

        wx.request({
            url: 'http://8.136.109.38:9000/queryCarList?park='+e.markerId,
            data: {},
            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            success: (res) => {
                this.setData({
                    output: JSON.stringify(res.data)
                })
                
            },
            fail: function (res) {
                // fail
            },
            complete: function (res) {
                // complete
            }
        })

        this.data.output=this.data.output.replace(/\[/g,"");
        this.data.output=this.data.output.replace(/\]/g," ");
        this.data.output=this.data.output.replace(/{/g," ");
        this.data.output=this.data.output.replace(/},/g,"\r\n");
        this.data.output=this.data.output.replace(/}/g," ");

        setTimeout(function () {
            //要延时执行的代码
            wx.hideLoading();
          }, 1000)       
        wx.showModal({
            title: "可用车位锁",
            content: "空余车位数量为："+this.data.avlnum+"\r\n"+this.data.output,
            showCancel: false,
            confirmText: "确定"
        })


    },
// 定位函数，移动位置到地图中心
    movetoPosition: function () {
        this.mapCtx.moveToLocation();
    }
})
