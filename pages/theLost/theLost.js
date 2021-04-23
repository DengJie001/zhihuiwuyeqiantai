const baseUrl = 'http://localhost:8080/bysj/'
const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        tabCur: 0,
        scrollLeft: 0,
        tabName: ['失物招领列表', '发布失物招领'],
        isIssueHidden: true,
        isListHidden: false,
        images: [],
        client_id: 'Vh5xHSvGo6nK8axB5O9SuEY9',
        client_secret: '8qRYG6RxibowuG2RLRzRvZB5TYqGIxKa',
        access_token: '',
        currentTime: 91,
        userPhoneNumber: '',
        verifyBtnText: '验证码',
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-04-16
     * @description 切换tab
     */
    tabSelect: function (e) {
        var that = this;
        if (e.currentTarget.dataset.id == 0) {
            that.setData({
                isListHidden: false,
                isIssueHidden: true
            });
        } else if (e.currentTarget.dataset.id == 1) {
            that.setData({
                isIssueHidden: false,
                isListHidden: true
            });
        }
        that.setData({
            tabCur: e.currentTarget.dataset.id,
            scrollLeft: (e.currentTarget.dataset.id-1) * 60,
        })
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-04-16
     * @description 获取输入框的值
     */
    getInputValue: function (e) {
        var that = this;
        if (e.currentTarget.dataset.id == 'phoneNumber') {
            that.setData({
                userPhoneNumber: e.detail.value
            });
        }
    },

    /**
     * @author DengJie
     * @date 2021-04-16
     * @description 选择失物招领中要上传的照片
     */
    chooseImages: function () {
        var that = this;
        wx.chooseImage({
          count: 4, // 最大允许的上传数量
          sizeType: ['original', 'compressed'], // 图片上传质量 原图和压缩图
          sourceType: ['album', 'camera'],  // 图片来源 图库和相机拍摄
          success: function (res) {
              if (that.data.images.length != 0) {
                  that.setData({
                      images: that.data.images.concat(res.tempFilePaths)
                  });
              } else {
                  that.setData({
                      images: res.tempFilePaths
                  });
              }
              var base64Img = wx.getFileSystemManager().readFileSync(that.data.images[0], 'base64');
              wx.request({
                url: 'https://aip.baidubce.com/rest/2.0/solution/v1/img_censor/v2/user_defined?access_token=' + that.data.access_token,
                data: {
                    image: base64Img
                },
                header: {'Content-Type': 'application/x-www-form-urlencoded'},
                method: 'POST',
                dataType: 'json',
                success: function (res) {
                    console.log(res);
                },
                fail: function (errorRes) {
                    console.log(errorRes);
                }
              });
          }
        });
    },

    /**
     * @author DengJie
     * @param {*} phoneNumber 
     * @date 2021-04-16
     * @description 验证手机号码格式是否正确
     */
    isPhoneNumber: function (phoneNumber) {
        var reg = /^[1][3,4,5,7,8][0-9]{9}$/;
        if (!reg.test(phoneNumber)) {
            return false;
        } else {
            return true;
        }
    },

    /**
     * @author DengJie
     * @date 2021-04-16
     * @description 发送验证码
     */
    sendVerifyCode: function () {
        var that = this;
        var currentTime = that.data.currentTime;
        // 判断手机号格式是否正确
        if (!that.isPhoneNumber(that.data.userPhoneNumber)) {
            wx.showToast({
              title: '手机号格式有误',
              icon: 'error',
              duration: 2000,
              mask: true
            });
            return false;
        }
        // 手机号格式正确 发送验证码 并且禁用按钮90秒
        var interval = setInterval(function () {
            --currentTime;
            that.setData({
                disabled: true,
                verifyBtnText: currentTime + '秒'
            });
            if (currentTime <= 0) {
                // 关闭定时器
                clearInterval(interval);
                that.setData({
                    verifyBtnText: '重新发送',
                    disabled: false,
                    currentTime: 91
                });
            }
        }, 1000);
        // 发送验证码
        wx.request({
          url: baseUrl + 'SMS/sendCode.do',
          data: {
              phoneNumber: that.data.userPhoneNumber
          },
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          method: 'POST',
          dataType: 'json',
          success: function (res) {
              console.log(res);
              if (res.data.sessionId != '' && res.data.sessionId != null) {
                  wx.showToast({
                    title: '发送成功',
                    icon: 'success',
                    duration: 2000,
                    mask: true
                  });
                  app.globalData.header.Cookie = res.data.sessionId;
              } else {
                  wx.showToast({
                    title: '发送失败',
                    icon: 'error',
                    duration: 2000,
                    mask: true
                  });
              }
          },
          fail: function (res) {
              console.log(res);
              wx.showToast({
                title: '预期之外的错误',
                icon: 'error',
                duration: 2000,
                mask: true
              });
          }
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        wx.request({
          url: 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=' + that.data.client_id + '&client_secret=' + that.data.client_secret,
          method: 'post',
          dataType: 'json',
          success: function (res) {
              that.setData({
                  access_token: res.data.access_token
              });
          },
          fail: function (errorRes) {
              console.log(errorRes);
          }
        });
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})