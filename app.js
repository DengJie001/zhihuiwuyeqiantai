// app.js
var baseUrl = 'https://codemata.club/bysj/user/'
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        wx.showLoading({
          title: '登录中……',
        })
        wx.request({
          url: baseUrl + 'getUserOpenid.do',
          data: {
            code: res.code
          },
          method: 'POST',
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          success: function (res) {
            console.log(res);
            wx.setStorageSync('openid', res.data.openid);
            if (res.data.openid) {
              wx.request({
                url: 'https://codemata.club/bysj/login/userLogin.do',
                data: {
                  userId: res.data.openid
                },
                method: 'post',
                dataType: 'json',
                header: {'Content-Type': 'application/x-www-form-urlencoded'},
                success: function (res) {
                  console.log(res);
                  if (res.data.msgId == 1) {
                    wx.hideLoading({});
                    wx.switchTab({
                      url: '../index/index',
                    });
                  } else {
                    wx.hideLoading({});
                    wx.redirectTo({
                      url: '../userRegister/userRegister',
                    });
                  }
                },
                fail: function (res) {
                  console.log(res);
                }
              });
            }
          },
          fail: function (res) {
            console.log(res);
          }
        });
      }
    });
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          });
        }
      }
    });
    // 获取系统状态栏信息
    wx.getSystemInfo({
        success: e => {
            this.globalData.StatusBar = e.statusBarHeight;
            let capsule = wx.getMenuButtonBoundingClientRect();
            if (capsule) {
                this.globalData.Custom = capsule;
                this.globalData.CustomBar = capsule.bottom + capsule.top - e.statusBarHeight;
            } else {
                this.globalData.CustomBar = e.statusBarHeight + 50;
            }
        }
    });
  },
  globalData: {
    userInfo: null,
    header: {
      'Cookie': ''
    }
  }
})
