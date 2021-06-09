const baseUrl = 'https://codemata.club/bysj/';
const md5 = require('../../utils/md5.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        applicationList: [],
        page: 1,
        pages: 1,
        limit: 10,
        title: '',
        allContent: '',
        currentSelectedItemIndex: '',
        aid: '18187',
        name: '场地申请费用支付',
        pay_type: 'native',
        notify_url: 'http://codemata.club:8080/bysj/pay/addPlaceApplicationPayment.do',
        more: '',
        secret: 'cdcc2ed5c2434790abe36f0a037c5a23',
        order_id: ''
    },

    /**
     * @author DengJie
     * @param {*} url 请求地址
     * @param {*} data 请求参数
     * @date 2021-04-23
     * @description 封装同步请求
     */
    useSync: function (url, data) {
        var that = this;
        return new Promise(function (resolve, reject) {
            wx.request({
              url: url,
              data: data,
              method: 'POST',
              dataType: 'json',
              header: {'Content-Type': 'application/x-www-form-urlencoded'},
              success: function (res) {
                  resolve(res);
              },
              fail: function (res) {
                  reject(res);
              }
            });
        });
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-04-23
     * @description 显示完整的管理员备注
     */
    showResult: function (e) {
        var that = this;
        that.setData({
            showAllContent: 'yes',
            title: '备注',
            allContent: that.data.applicationList[e.currentTarget.dataset.index].resultDescription
        });
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-04-23
     * @description 显示完整的申请原因
     */
    showReason: function (e) {
        var that = this;
        that.setData({
            showAllContent: 'yes',
            title: '申请原因',
            allContent: that.data.applicationList[e.currentTarget.dataset.index].applicationReason
        });
    },

    /**
     * @author DengJie
     * @date 2021-04-23
     * @description 关闭弹窗
     */
    hideModal: function () {
        var that = this;
        that.setData({
            showAllContent: 'no',
            showQrCode: 'no',
            showTips: 'no'
        });
    },

    /**
     * @author DengJie
     * @date 2021-04-25
     * @description 跳转到支付步骤界面
     */
    toPayStep: function () {
        wx.navigateTo({
          url: '../payStep/payStep',
        });
    },

    /**
     * @auhtor DengJie
     * @param {*} e 
     * @date 2021-04-23
     * @description 展示付款码界面
     */
    showPay: function (e) {
        var that = this;
        that.setData({
            currentSelectedItemIndex: e.currentTarget.dataset.index,
            showQrCode: 'yes'
        });
        // 获取之前保存的支付码
        wx.request({
          url: baseUrl + 'QrCode/getQrCode.do',
          data: {
              userId: wx.getStorageSync('openid'),
              codeId: that.data.applicationList[e.currentTarget.dataset.index].applicationId
          },
          method: 'POST',
          dataType: 'json',
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          success: function (res) {
              console.log(res);
              if (res.data.status == 'success') {
                  // 验证支付码是否过期
                  var seconds = new Date().getTime() - new Date(res.data.code.date + ' 00:00:00').getTime();
                  console.log(seconds);
                  // 支付码过期 重新获取
                  if (seconds > 24 * 60 * 60 * 1000) {
                      that.setData({
                          order_id: that.data.applicationList[e.currentTarget.dataset.index].applicationId + '/' + new Date().getTime().toString(),
                          price: that.data.applicationList[e.currentTarget.dataset.index].cost
                      });
                      wx.request({
                        url: 'https://xorpay.com/api/pay/18187',
                        data: {
                            name: that.data.name,
                            pay_type: that.data.pay_type,
                            price: that.data.price,
                            order_id: that.data.order_id,
                            notify_url: that.data.notify_url,
                            more: that.data.more,
                            expire: 24 * 60 * 60 * 1000,
                            sign: md5.md5(that.data.name + that.data.pay_type + that.data.price + that.data.order_id + that.data.notify_url + that.data.secret)
                        },
                        method: 'POST',
                        dataType: 'json',
                        header: {'Content-Type': 'application/x-www-form-urlencoded'},
                        success: function (res) {
                            console.log(res);
                            wx.request({
                              url: baseUrl + 'QrCode/modifyCode.do',
                              data: {
                                  userId: wx.getStorageSync('openid'),
                                  codeId: that.data.order_id,
                                  qrCode: res.data.info.qr
                              },
                              method: 'POST',
                              dataType: 'json',
                              header: {'Content-Type': 'application/x-www-form-urlencoded'},
                              success: function (res) {
                                  console.log(res);
                              },
                              fail: function (res) {
                                  console.log(res);
                              }
                            });
                            that.setData({
                                payCode: 'https://xorpay.com/qr?data=' + res.data.info.qr
                            });
                        },
                        fail: function (res) {
                            console.log(res);
                        }
                      });
                  } else {
                    that.setData({
                        payCode: 'https://xorpay.com/qr?data=' + res.data.code.qrCode
                    });
                  }
              } else {
                  wx.showToast({
                    title: '服务端异常',
                    icon: 'error',
                    duration: 3000,
                    mask: true
                  });
              }
          },
          fail: function (res) {
              wx.showToast({
                title: '预期之外的错误',
                icon: 'error',
                duration: 3000,
                mask: true
              });
          }
        });
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-04-25
     * @description 删除或取消场地申请
     */
    delete: function (e) {
        var that = this;
        wx.showModal({
            title: '提示',
            confirmText: '确定',
            cancelText: '再想想',
            showCancel: true,
            success: function (res) {
                if (res.confirm) {
                    var seconds = new Date().getTime() - new Date(that.data.applicationList[e.currentTarget.dataset.index].beginDate + ' 00:00:00').getTime()
                    if (seconds > 0) {
                        that.setData({
                            showTips: 'yes',
                            tips: '已经开始使用,无法取消'
                        });
                        return;
                    } else if (that.data.applicationList[e.currentTarget.dataset.index].payStatus == '已支付') {
                        // 退款
                        wx.request({
                          url: baseUrl + 'pay/getPayment.do',
                          data: {
                              userId: wx.getStorageSync('openid'),
                              billId: that.data.applicationList[e.currentTarget.dataset.index].applicationId
                          },
                          method: 'post',
                          dataType: 'json',
                          header: {'Content-Type': 'application/x-www-form-urlencoded'},
                          success: function (res) {
                              console.log('查询支付订单');
                              console.log(res);
                              if (res.data.status == 'success') {
                                  wx.request({
                                    url: 'https://xorpay.com/api/refund/' + res.data.payment.payId,
                                    data: {
                                        price: that.data.applicationList[e.currentTarget.dataset.index].cost,
                                        sign: md5.md5(that.data.applicationList[e.currentTarget.dataset.index].cost + that.data.secret)
                                    },
                                    method: 'POST',
                                    dataType: 'json',
                                    header: {'Content-Type': 'application/x-www-form-urlencoded'},
                                    success: function (res) {
                                        console.log('退款')
                                        console.log(res);
                                        if (res.data.status == 'ok') {
                                            wx.showToast({
                                              title: '退款成功',
                                              icon: 'success',
                                              duration: 3000,
                                              mask: true
                                            });
                                            // 删除
                                            wx.request({
                                              url: baseUrl + 'PlaceApplication/userDeleteApplication.do',
                                              data: {
                                                  userId: wx.getStorageSync('openid'),
                                                  applicationId: that.data.applicationList[e.currentTarget.dataset.index].applicationId
                                              },
                                              method: 'POST',
                                              dataType: 'json',
                                              header: {'Content-Type': 'application/x-www-form-urlencoded'},
                                              success: function (res) {
                                                  console.log('删除')
                                                  if (res.data.status == 'success') {
                                                      wx.showToast({
                                                        title: '删除成功',
                                                        icon: 'success',
                                                        duration: 3000,
                                                        mask: true
                                                      });
                                                  } else {
                                                      wx.showToast({
                                                        title: '删除失败',
                                                        icon: 'error',
                                                        duration: 3000,
                                                        mask: true
                                                      });
                                                  }
                                              },
                                              fail: function (res) {
                                                  wx.showToast({
                                                    title: '预期之外的错误',
                                                    icon: 'none',
                                                    duration: 3000,
                                                    mask: true
                                                  });
                                              }
                                            });
                                        } else {
                                            wx.showToast({
                                              title: '退款失败',
                                              icon: 'error',
                                              duration: 3000,
                                              mask: true
                                            });
                                        }
                                    },
                                    fail: function (res) {
                                        wx.showToast({
                                          title: '退款失败',
                                          icon: 'error',
                                          duration: 3000,
                                          mask: true
                                        });
                                    }
                                  });
                              }
                          }
                        });
                    } else {
                        wx.request({
                          url: baseUrl + 'PlaceApplication/userDeleteApplication.do',
                          data: {
                              userId: wx.getStorageSync('openid'),
                              applicationId: that.data.applicationList[e.currentTarget.dataset.index].applicationId
                          },
                          method: 'POST',
                          dataType: 'json',
                          header: {'Content-Type': 'application/x-www-form-urlencoded'},
                          success: function (res) {
                              if (res.data.status == 'success') {
                                  wx.showToast({
                                    title: '删除成功',
                                    icon: 'success',
                                    duration: 3000,
                                    mask: true
                                  });
                              } else {
                                  wx.showToast({
                                    title: '删除失败',
                                    icon: 'error',
                                    duration: 3000,
                                    mask: true
                                  });
                              }
                          },
                          fail: function (res) {
                              console.log(res);
                              wx.showToast({
                                title: '预期之外的错误',
                                icon: 'none',
                                duration: 3000,
                                mask: true
                              });
                          }
                        });
                    }
                }
            }
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        wx.request({
          url: baseUrl + 'PlaceApplication/userGetApplications.do',
          data: {
              userId: wx.getStorageSync('openid'),
              page: that.data.page,
              limit: that.data.limit
          },
          method: 'POST',
          dataType: 'json',
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          success: function (res) {
              if (res.data.status == 'success') {
                  that.setData({
                      pages: Math.ceil(res.data.info.count / that.data.limit),
                      applicationList: res.data.info.placeApplications
                  });
              } else if (res.data.status == 'exception') {
                  wx.showToast({
                    title: '服务端异常',
                    icon: 'error',
                    duration: 3000,
                    mask: true
                  });
              }
          },
          fail: function (res) {
              wx.showToast({
                title: '获取数据失败,请重试!',
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
        var that = this;
        if (that.data.page + 1 > that.data.pages) {
            wx.showToast({
              title: '没有更多数据',
              icon: 'none',
              duration: 3000,
              mask: true
            });
            return;
        }
        wx.request({
          url: baseUrl + 'PlaceApplication/userGetApplications.do',
          data: {
              userId: wx.getStorageSync('openid'),
              limit: that.data.limit,
              page: that.data.page + 1
          },
          method: 'POST',
          dataType: 'json',
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          success: function (res) {
              if (res.data.status == 'success') {
                  var tempList = that.data.applicationList;
                  for (let i = 0; i < res.data.info.applications.length; ++i) {
                      tempList.push(res.data.info.applications[i]);
                  }
                  that.setData({
                      applicationList: tempList,
                      page: that.data.page + 1
                  });
              } else if (res.data.status == 'exception') {
                  wx.showToast({
                    title: '服务端异常!',
                    icon: 'error',
                    duration: 3000,
                    mask: true
                  });
              }
          },
          fail: function (res) {
              wx.showToast({
                title: '预期之外的错误',
                icon: 'error',
                duration: 3000,
                mask: true
              });
          }
        });
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})