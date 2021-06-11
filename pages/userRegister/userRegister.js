var baseUrl = 'https://codemata.club/bysj/';
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
        verifyCodeAnimation: false,
        areaIndex: -1,
        unitIndex: -1,
        roomIndex: -1
    },

    syncGetUserProfile: function () {
        var that = this;
        return new Promise(function (resolve, reject) {
            wx.getUserProfile({
                desc: '用于完善用户资料',
                success: function (res) {
                    resolve(res);
                },
                fail: function (errorRes) {
                    reject(errorRes);
                }
            });
        });
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-04-05
     * @description 监听区域号选择
     */
    areaChange: function (e) {
        var that = this;
        if (e.detail.value != -1) {
            var unitList = [];
            for (let i = 0; i < that.data.address.length; ++i) {
                if (that.data.address[i].areaId == that.data.areas[e.detail.value]) {
                    if (unitList.indexOf(that.data.address[i].unitId) == -1) {
                        unitList.push(that.data.address[i].unitId);
                    }
                }
            }
            that.setData({
                units: unitList,
                areaIndex: e.detail.value
            });
        }
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-05-05
     * @description 监听单元号选择
     */
    unitChange: function (e) {
        var that = this;
        if (e.detail.value != -1) {
            var roomList = [];
            for (let i = 0; i < that.data.address.length; ++i) {
                if (that.data.address[i].areaId == that.data.areas[that.data.areaIndex] && that.data.address[i].unitId == that.data.units[e.detail.value]) {
                    if (roomList.indexOf(that.data.address[i].roomId) == -1) {
                        roomList.push(that.data.address[i].roomId);
                    }
                }
            }
            that.setData({
                unitIndex: e.detail.value,
                rooms: roomList
            });
        }
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-05-05
     * @description 监听门牌号选择
     */
    roomChange: function (e) {
        var that = this;
        that.setData({
            roomIndex: e.detail.value
        });
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
              phoneNumber: that.data.phoneNumber,
              userId: wx.getStorageSync('openid')
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

        if (that.data.areaIndex == -1 || that.data.unitIndex == -1 || that.data.roomIndex == -1) {
            canSubmit = false;
        }
        var userProfile = await that.syncGetUserProfile();
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
              verifyCode: that.data.verifyCode,
              userId: wx.getStorageSync('openid'),
              userTel: that.data.phoneNumber,
              userName: that.data.name,
              gender: userProfile.userInfo.gender == 1 ? '男' : '女',
              nationality: userProfile.userInfo.country,
              province: userProfile.userInfo.province,
              city: userProfile.userInfo.city,
              areaId: that.data.areas[that.data.areaIndex],
              unitId: that.data.units[that.data.unitIndex],
              roomId: that.data.rooms[that.data.roomIndex]
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
                  wx.switchTab({
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
        var that = this;
        wx.request({
          url: baseUrl + 'HouseInfo/userGetAllHouseInfos.do',
          data: {
              userId: wx.getStorageSync('openid')
          },
          method: 'POST',
          dataType: 'json',
          header: {'Content-Type': 'application/x-www-form-urlencoded', 'cookie': 'JSESSIONID=' + app.globalData.header.Cookie},
          success: function (res) {
              if (res.data.status == 'success') {
                  var areaList = [];
                  for (let i = 0; i < res.data.info.length; ++i) {
                      if (areaList.indexOf(res.data.info[i].areaId) == -1) {
                          areaList.push(res.data.info[i].areaId);
                      }
                  }
                  that.setData({
                      areas: areaList,
                      address: res.data.info
                  });
              }
          },
          fail: function (res) {
              wx.showToast({
                title: '拉取房产数据失败',
                icon: 'none',
                duration: 3000,
                mask: true
              });
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