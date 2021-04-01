var baseUrl = 'http://localhost:8080/bysj/';
const app = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        disabled: false,
        name: '',
        phoneNumber: '',
        verifyCode: '',
        btnText: '验证码',  // 倒计时
        currentTime: 91,
        nameAnimation: false,
        phoneNumberAnimation: false,
        verifyCodeAnimation: false
    },

    /**
     * @author DengJie
     * @param {*} options 
     * @date 2021-03-18
     * @description 发送验证码
     */
    sendVerifyCode: function () {
        var that = this;
        var currentTime = that.data.currentTime;
        // 判断手机号码格式是否正确
        if (!that.isPhoneNumber(that.data.phoneNumber)) {
            wx.showToast({
                title: '手机号格式有误',
                icon: 'error',
                duration: 2000,
                mask: true,
            });
            return false;
        }
        // 禁用发送验证码按钮90秒
        var interval = setInterval(function () {
            --currentTime;
            that.setData({
                disabled: true,
                btnText: currentTime + '秒'
            });
            if (currentTime <= 0) {
                // 关闭定时器
                clearInterval(interval);
                that.setData({
                    btnText: '重新发送',
                    disabled: false,
                    currentTime: 91
                });
            }
        }, 1000);
        // 发送验证码
        wx.request({
          url: baseUrl + 'SMS/sendCode.do',
          data: {
              phoneNumber: that.data.phoneNumber
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
                  app.globalData.header.Cookie = '';
              }
          },
          fail: function (res) {
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
     * @author DengJie
     * @param {*} phoneNumber 
     * @date 2021-03-18
     * @description 验证是否为正确格式的手机号码
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
     * @param {*} options 
     * @date 2021-03-18
     * @description 获取输入框,下拉框的值
     */
    getInputValue(options) {
        var that = this;
        let code = options.target.dataset.code;
        let value = options.detail.value;
        switch (code) {
            case 'name':
                that.setData({
                    name: value
                });
                break;
            case 'phoneNumber':
                that.setData({
                    phoneNumber: value
                });
                break;
            case 'verifyCode':
                that.setData({
                    verifyCode: value
                });
                break;
        }
    },

    /**
     * @author DengJie
     * @param {*} res 
     * @dare 2021-03-18
     * @description 提交表单注册用户
     */
    doRegister: async function (res) {
        var that = this;
        var name = that.data.name;
        var phoneNumber = that.data.phoneNumber;
        var verifyCode = that.data.verifyCode;
        var canSubmit = true;
        // 验证各个字段格式是否正确(不为空,且长度正确)
        // 验证姓名字段
        if (name == null || name == '') {
            canSubmit = false;
            that.setData({
                nameAnimation: true
            });
            that.toggle('nameAnimation');
        } else {
            that.setData({
                nameAnimation: false
            });
        }

        // 验证电话号码字段
        if (phoneNumber == null || phoneNumber == '' || !that.isPhoneNumber(phoneNumber)) {
            canSubmit = false;
            that.setData({
                phoneNumberAnimation: true
            });
            that.toggle('phoneNumberAnimation');
        } else {
            that.setData({
                phoneNumberAnimation: false
            });
        }

        // 验证码字段
        if (verifyCode == null || verifyCode =='' || verifyCode.length > 4) {
            canSubmit = false;
            that.setData({
                verifyCodeAnimation: true
            });
            that.toggle('verifyCodeAnimation');
        } else {
            that.setData({
                verifyCodeAnimation: false
            });
        }
        await wx.getUserProfile({
            desc: '授权使用你的头像,性别,地区'
        }).then( res => {
            console.log(res);
        });
        console.log('后续操作');
        return;
        // 如果含有格式不正确的字段 阻止提交
        if (!canSubmit) {
            wx.showToast({
              title: '格式不正确',
              icon: 'error'
            })
            return;
        }
        // 发起请求
        wx.request({
          url: baseUrl + 'user/register.do',
          data: {
              verifyCode: that.data.verifyCode
          },
          header: {"Content-Type": "application/x-www-form-urlencoded", 'cookie': 'JSESSIONID=' + app.globalData.header.Cookie},
          method: 'POST',
          dataType: 'json',
          success: function (res) {
              if (res.data.msgId > 0) {
                  wx.showToast({
                    title: '注册成功',
                    icon: 'success',
                    duration: 2000,
                    mask: true
                  });
                  wx.redirectTo({
                    url: '../index/index',
                  });
              } else {
                  wx.showToast({
                    title: res.data.msgContent,
                    icon: 'error',
                    duration: 2000,
                    mask: true
                  });
              }
          },
          fail: function (res) {
              wx.showToast({
                title: '请求发起失败',
                icon: 'error',
                duration: 2000,
                mask: true
              });
          }
        });
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-03-18
     * @description 执行动画
     */
    toggle: function(e) {
        var that = this;
        setTimeout(function () {
            if (e == 'nameAnimation') {
                that.setData({
                    nameAnimation: false
                });
            } else if (e == 'phoneNumberAnimation') {
                that.setData({
                    phoneNumberAnimation: false
                });
            } else if (e == 'verifyCodeAnimation') {
                that.setData({
                    verifyCodeAnimation: false
                });
            }
        }, 1000);
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

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