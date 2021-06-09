const baseUrl = 'https://codemata.club/bysj/';
const md5 = require('../../utils/md5.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        repairList: [],
        pages: 0,
        limit: 10,
        page: 1,
        payCode: '',
        listIndex: 0,
        score: '',
        evaluateContent: '',
        aid: '18187',
        name: '物业维修支付',
        pay_type: 'native',
        notify_url: 'http://codemata.club:8080/bysj/pay/addRepairPayment.do',
        more: '',
        secret: 'cdcc2ed5c2434790abe36f0a037c5a23',
        order_id: ''
    },

    /**
     * @author DengJie
     * @param {*} url 请求地址
     * @param {*} data 请求参数
     * @date 2021-04-22
     * @description 封装同步函数
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
     * @date 2021-04-23
     * @description 移除arr数组中下标为index的元素
     */
    removeArratElem: function (index) {
        var that = this;
        var tempList = [];
        for (let i = 0; i < that.data.repairList.length; ++i) {
            if (i == index) {
                continue;
            }
            tempList.push(that.data.repairList[i]);
        }
    },

    getQrCode: function () {
        var that = this;
        that.setData({
            order_id: that.data.repairList[that.data.listIndex].repairId + '/' + new Date().getTime().toString(),
            price: that.data.repairList[that.data.listIndex].cost
        })
        wx.request({
          url: 'https://xorpay.com/api/pay/18187',
          data: {
              name: that.data.name,
              pay_type: that.data.pay_type,
              price: that.data.price,
              order_id: that.data.order_id,
              notify_url: that.data.notify_url,
              expire: 60 * 60 * 24 * 30,
              sign: md5.md5(that.data.name + that.data.pay_type + that.data.price + that.data.order_id + that.data.notify_url + that.data.secret)
          },
          method: 'POST',
          dataType: 'json',
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          success: function (res) {
              that.setData({
                  payCode: 'https://xorpay.com/qr?data=' + res.data.info.qr
              });
              wx.request({
                url: baseUrl + 'QrCode/modifyCode.do',
                data: {
                    codeId: that.data.repairList[that.data.listIndex].repairId,
                    qrCode: res.data.info.qr,
                    userId: wx.getStorageSync('openid')
                },
                method: 'POST',
                dataType: 'json',
                header: {'Content-Type': 'application/x-www-form-urlencoded'},
                success: function (res) {

                },
                fail: function (res) {

                }
              });
          },
          fail: function (res) {
              console.log(res);
              wx.showToast({
                title: '支付码获取失败',
                icon: 'none',
                duration: 3000,
                mask: true
              });
          }
        })
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-04-22
     * @description 显示完整的维修要求
     */
    showDescription: function (e) {
        var that = this;
        that.setData({
            description: that.data.repairList[e.currentTarget.dataset.index].repairDescription,
            showDescription: 'yes'
        });
    },

    /**
     * @author DengJie
     * @date 2021-04-22
     * @description 关闭弹窗
     */
    hideModal: function () {
        var that = this;
        that.setData({
            showDescription: 'no',
            showQrCode: 'no',
            showEvaluate: 'no'
        });
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-04-22
     * @description 选择分数
     */
    selectScore: function (e) {
        var that = this;
        that.setData({
            isSelected: e.currentTarget.dataset.selected,
            score: e.currentTarget.dataset.selected * 10
        });
    },

    /**
     * @author DengJie
     * @date 2021-04-22
     * @description 获取用户输入框的值
     */
    getInputValue: function (e) {
        var that = this;
        that.setData({
            evaluateContent: e.detail.value == '' ? '系统默认评价!' : e.detail.value
        });
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-04-22
     * @description 删除或取消一个订单
     */
    delete: async function (e) {
        var that = this;
        var tempList = [];
        wx.showModal({
            title: '提示',
            content: '是否确认删除?',
            showCancel: true,
            cancelText: '再想想',
            confirmText: '确认',
            success: async function (res) {
                // 进入无穷的if else吧 👴吐了
                // 我是傻逼 我是傻逼 我是傻逼
                if (res.confirm) {
                    if (that.data.repairList[e.currentTarget.dataset.index].orderStatus == '未完成' && that.data.repairList[e.currentTarget.dataset.index].payStatus == '已支付') {
                        var paymentRes = await that.useSync(
                            baseUrl + 'pay/getPayment.do',
                            {billId: that.data.repairList[e.currentTarget.dataset.index].repairId, userId: wx.getStorageSync('openid')}
                        );
                        // 查到了支付记录ID才进行退款 否则直接返回报错
                        if (paymentRes.data.status == 'success') {
                            var refundRes = await that.useSync(
                                'https://xorpay.com/api/refund/' + paymentRes.data.payment.payId,
                                {
                                    price: parseFloat(that.data.repairList[e.currentTarget.dataset.index].cost + ''),
                                    sign: md5.md5(parseFloat(that.data.repairList[e.currentTarget.dataset.index].cost + '') + 'cdcc2ed5c2434790abe36f0a037c5a23')
                                }
                            );
                            if (refundRes.data.status == 'ok' || paymentRes.data.status == 'order_error') {
                                // 在数据库中删除这条记录
                                var deleteRes = await that.useSync(
                                    baseUrl + 'PropertyRepair/userDelete.do',
                                    {
                                        id: that.data.repairList[e.currentTarget.dataset.index].repairId,
                                        type: that.data.repairList[e.currentTarget.dataset.index].orderStatus == '已完成' ? '删除' : '取消',
                                        userId: wx.getStorageSync('openid')
                                    }
                                );
                                if (deleteRes.data.status == 'success') {
                                    wx.showToast({
                                      title: '删除成功',
                                      icon: 'success',
                                      duration: 3000,
                                      mask: true
                                    });
                                    that.removeArratElem(e.currentTarget.dataset.index);
                                } else {
                                    wx.showToast({
                                      title: '删除失败',
                                      icon: 'error',
                                      duration: 3000,
                                      mask: true
                                    });
                                }
                            } else {
                                wx.showToast({
                                  title: '没查询到付款记录',
                                  icon: 'none',
                                  duration: 3000,
                                  mask: true
                                });
                            }
                        } else {
                            wx.showToast({
                              title: '账单异常,请重试!',
                              icon: 'none',
                              duration: 3000,
                              mask: true
                            });
                            return;
                        }
                    } else if (that.data.repairList[e.currentTarget.dataset.index].orderStatus == '未完成' && that.data.repairList[e.currentTarget.dataset.index].payStatus == '未支付') {
                        let res = await that.useSync(
                            baseUrl + 'PropertyRepair/userDelete.do',
                            {
                                id: that.data.repairList[e.currentTarget.dataset.index].repairId,
                                type: '取消',
                                userId: wx.getStorageSync('openid')
                            }
                        );
                        if (res.data.status == 'success') {
                            wx.showToast({
                              title: '取消成功',
                              icon: 'success',
                              duration: 3000,
                              mask: true
                            });
                            that.removeArratElem(e.currentTarget.dataset.index);
                        } else {
                            wx.showToast({
                              title: '删除失败',
                              icon: 'error',
                              duration: 3000,
                              mask: true
                            });
                        }
                    } else if (that.data.repairList[e.currentTarget.dataset.index].orderStatus == '已完成' && that.data.repairList[e.currentTarget.dataset.index].payStatus == '未支付') {
                        wx.showToast({
                          title: '请先支付再删除!',
                          icon: 'none',
                          duration: 3000,
                          mask: true
                        });
                        return;
                    }else {
                        let res = await that.useSync(
                            baseUrl + 'PropertyRepair/userDelete.do',
                            {
                                id: that.data.repairList[e.currentTarget.dataset.index].repairId,
                                type: '删除',
                                userId: wx.getStorageSync('openid')
                            }
                        );
                        if (res.data.status == 'success') {
                            wx.showToast({
                              title: '删除成功',
                              icon: 'success',
                              duration: 3000,
                              mask: true
                            });
                            that.removeArratElem(e.currentTarget.dataset.index);
                        } else {
                            wx.showToast({
                              title: '删除失败',
                              icon: 'error',
                              duration: 3000,
                              mask: true
                            });
                        }
                    }
                }
            }
        });
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-04-22
     * @description 支付
     */
    pay: function (e) {
        var that = this;
        that.setData({
            showQrCode: 'yes',
            listIndex: e.currentTarget.dataset.index
        });
        wx.request({
          url: baseUrl + 'QrCode/getQrCode.do',
          data: {
              codeId: that.data.repairList[e.currentTarget.dataset.index].repairId,
              userId: wx.getStorageSync('openid')
          },
          method: 'POST',
          dataType: 'json',
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          success: function (res) {
              that.setData({
                  payCode: 'https://xorpay.com/qr?data=' + res.data.code.qrCode
              });
          },
          fail: function (res) {
              console.log(res);
              wx.showToast({
                title: '支付码获取失败,请重试',
                icon: 'none',
                duration: 3000,
                mask: true
              });
          }
        });
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-04-22
     * @description 对物业维修进行评价
     */
    evaluate: function (e) {
        var that = this;
        that.setData({
            showEvaluate: 'yes',
            listIndex: e.currentTarget.dataset.index
        });
    },

    /**
     * @author DengJie
     * @date 2021-04-22
     * @description 提交本次服务评价
     */
    submit: function () {
        var that = this;
        wx.request({
          url: baseUrl + 'RepairEvaluation/addRepairEvaluation.do',
          data: {
              userId: wx.getStorageSync('openid'),
              workerId: that.data.repairList[that.data.listIndex].workerId,
              evaluationContent: that.data.evaluateContent,
              evaluationScore: that.data.score,
              repairId: that.data.repairList[that.data.listIndex].repairId
          },
          method: 'POST',
          dataType: 'json',
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          success: function (res) {
              that.setData({
                  showEvaluate: 'no'
              });
              if (res.data.status == 'success') {
                  
                  wx.showToast({
                    title: '评价成功',
                    icon: 'success',
                    duration: 2000,
                    mask: true
                  });
              } else {
                  wx.showToast({
                    title: '发生异常',
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
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        wx.request({
          url: baseUrl + 'PropertyRepair/getRepairInfos.do',
          data: {
              limit: that.data.limit,
              page: 1,
              property: '用户ID',
              value: wx.getStorageSync('openid')
          },
          method: 'POST',
          dataType: 'json',
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          success: function (res) {
              console.log(res);
              if (res.data.code == 0 && res.data.count > 0) {
                  that.setData({
                      repairList: res.data.repairInfos,
                      pages: Math.ceil(res.data.count / that.data.limit)
                  });
              }
          },
          fail: function (res) {
              wx.showToast({
                title: '发生异常',
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
          url: baseUrl + 'PropertyRepair/getRepairInfos.do',
          data: {
              page: that.data.page + 1,
              limit: that.data.limit,
              property: '用户ID',
              value: wx.getStorageSync('openid')
          },
          method: 'POST',
          dataType: 'json',
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          success: function (res) {
              if (res.data.code == 0 && res.data.count > 0) {
                  var temp = that.data.repairList;
                  for (let i = 0; i < res.data.repairInfos.length; ++i) {
                      temp.push(res.data.repairInfos[i]);
                  }
                  that.setData({
                      repairList: temp,
                      page: that.data.page + 1
                  });
              } else {
                  wx.showToast({
                    title: '发生了异常',
                    icon: 'none',
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
        })
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})