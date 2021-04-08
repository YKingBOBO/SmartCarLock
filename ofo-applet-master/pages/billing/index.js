const app = getApp()

function inArray(arr, key, val) {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === val) {
      return i;
    }
  }
  return -1;
}
function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
  }
// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}


Page({
    data: {
        hours: 0,
        minuters: 0,
        id: 0,
        seconds: 0,
        number: 0,
        billing: "正在计费",
        devices: [],
        connected: false,
        chs: [],
        output: 49,
    },  
    closeBluetoothAdapter() {
      wx.closeBluetoothAdapter()
      this._discoveryStarted = false
    },
    downcar() {
      // 向蓝牙设备发送一个0x00的16进制数据
      let buffer = new ArrayBuffer(1)
      let dataView = new DataView(buffer)
      //32
      dataView.setUint8(0,50)
      wx.writeBLECharacteristicValue({
        deviceId: "8ABE7786-8425-8CD2-0B2B-D3CB0D6B9E0B",
        serviceId: "0000FFE0-0000-1000-8000-00805F9B34FB",
        characteristicId: "0000FFE1-0000-1000-8000-00805F9B34FB",
        value: buffer,
      })
      console.log("buffer"+ab2hex(buffer))
    },
// 页面加载
    onLoad: function (options) {
        console.log("跳转到计费页面了")
        console.log("options： "+options.number)
        // 获取车牌号，设置定时器
        this.setData({
            number: options.number,
            timer: this.timer
        })
        console.log(this.data.number)

// --------------------------蓝牙-----------------------------
wx.navigateTo({
  url: '../blue/index'
})

//-----------------------------数据库----------------------------
 wx.request({
            url: 'http://8.136.109.38:9000/setZeroAvl?number='+this.data.number,
            data: {},
            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            success: (res) => {
                console.log(this.data.number+"号车位已设置为不可用")
            },
            fail: function (res) {
                // fail
            },
            complete: function (res) {
                // complete
            }
})

wx.request({
    url: 'http://8.136.109.38:9000/getCarPark?number='+this.data.number,
    data: {},
    method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
    success: (res) => {
        console.log("该车位停车场id为"+res.data)
        this.setData({
            id: res.data
        })
        wx.request({
            url: 'http://8.136.109.38:9000/downParkNum/'+this.data.id,
            data: {},
            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            success: (res) => {
                console.log(this.data.id+"号停车场数量减一")
            },
            fail: function (res) {
                // fail
            },
            complete: function (res) {
                // complete
            }
        })
    },
    fail: function (res) {
        // fail
    },
    complete: function (res) {
        // complete
    }
})


// -------------------------------------------------------


        // 初始化计时器
        let s = 0;
        let m = 0;
        let h = 0;
        // 计时开始
        this.timer = setInterval(() => {
            this.setData({
                seconds: s++
            })
            if (s == 60) {
                s = 0;
                m++;
                setTimeout(() => {
                    this.setData({
                        minuters: m
                    });
                }, 1000)
                if (m == 60) {
                    m = 0;
                    h++
                    setTimeout(() => {
                        this.setData({
                            hours: h
                        });
                    }, 1000)
                }
            }
            ;
        }, 1000)
    },
// 结束骑行，清除定时器
    endRide: function () {
        clearInterval(this.timer);
        this.timer = "";
        // ---------------蓝牙------
        this.downcar()

        // -------------------------------------------------------
        wx.request({
            url: 'http://8.136.109.38:9000/setOneAvl?number='+this.data.number,
            data: {},
            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            success: (res) => {
                console.log(this.data.number+"号车位已设置为可用")
            },
            fail: function (res) {
                // fail
            },
            complete: function (res) {
                // complete
            }
        })
        wx.request({
            url: 'http://8.136.109.38:9000/upParkNum?id='+this.data.id,
            data: {},
            method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            success: (res) => {
                console.log(this.data.id+"号停车场数量加一")
            },
            fail: function (res) {
                // fail
            },
            complete: function (res) {
                // complete
            }
        })

        // -------------------------------------------------------
        this.setData({
            billing: "本次停车耗时",
            disabled: true
        })
        
    },
// 携带定时器内容回到地图
    moveToIndex: function () {
        // 如果定时器为空
        if (this.timer == "") {
            // 关闭计费页跳到地图
            wx.redirectTo({
                url: '../index/index'
            })
            // 保留计费页跳到地图
        } else {
            wx.navigateTo({
                url: '../index/index?timer=' + this.timer
            })
        }
    }
})