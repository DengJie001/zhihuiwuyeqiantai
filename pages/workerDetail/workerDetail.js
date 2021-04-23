const baseUrl = 'http://localhost:8080/bysj/';
const md5=require('../../utils/md5.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        worker: {},
        repairDescription: '',
        aid: '18187',
        name: '物业维修支付',
        pay_type: 'native',
        price: '',
        notify_url: 'http://codemata.club:8080/bysj/pay/addRepairPayment.do',
        more: '',
        secret: 'cdcc2ed5c2434790abe36f0a037c5a23',
        order_id: '',
        payCode: '',
        evaluationList: [1, 3, 5, 7, 9],
        pages: 1,
        page: 1,
        limit: 10
    },

    /**
     * @author DengJie
     * @param {*} url 请求地址
     * @param {*} data 请求参数
     * @date 2021-04-20
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
     * @date 2021-04-21
     * @description 展示付款码
     */
    previewQrCode: function () {
        var that = this;
        wx.previewImage({
          urls: [that.data.payCode],
        });
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @description 获取用户输入框的值
     */
    getTextAreaValue: function (e) {
        var that = this;
        that.setData({
            repairDescription: e.detail.value
        });
    },

    /**
     * @author DengJie
     * @date 2021-04-21
     * @description 跳转到支付步骤页面
     */
    toPayStep: function () {
        wx.navigateTo({
          url: '../payStep/payStep',
        });
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-04-22
     * @description 关闭弹窗
     */
    hideModal: function (e) {
        var that = this;
        if (e.currentTarget.dataset.name == 'tips') {
            that.setData({
                showTips: 'no',
                show: 'yes'
            });
        } else if (e.currentTarget.dataset.name == 'description') {
            that.setData({
                show: 'no'
            });
        } else if (e.currentTarget.dataset.name == 'QrCode') {
            that.setData({
                showQrCode: 'no'
            });
        }
    },

    /**
     * @author DengJie
     * @date 2021-04-20
     * @description 下单维修
     */
    addOneOrder: function () {
        var that = this;
        that.setData({
            show: 'yes'
        });
    },

    /**
     * @author DengJie
     * @date 2021-04-20
     * @description 提交物业维修信息
     */
    submit: async function () {
        var that = this;
        if (that.data.repairDescription == '') {
            that.setData({
                tips: '请输入物业维修要求',
                showTips: 'yes',
                show: 'no'
            });
            return;
        }
        // 提交申请
        var orderRes = await that.useSync(
            baseUrl + 'PropertyRepair/addOrder.do',
            {
                userId: that.data.userId,
                workerId: that.data.worker.workerId,
                repairDescription: that.data.repairDescription
            }
        );
        console.log(orderRes);
        if (orderRes.data.status == 'error') {
            that.setData({
                show: 'no'
            });
            wx.showToast({
              title: '发生了错误!',
              icon: 'none',
              duration: 2000,
              mask: true
            });
            return;
        } else if (orderRes.data.status == 'exception') {
            that.setData({
                show: 'no'
            });
            wx.showToast({
              title: '发生异常!',
              icon: 'none',
              duration: 2000,
              mask: true
            });
            return;
        }
        // 获取支付二维码
        that.setData({
            order_id: orderRes.data.data.id,
            price: orderRes.data.data.cost + '',
            more: '物业维修支付'
        });
        var qrCode = await that.useSync(
            'https://xorpay.com/api/pay/18187',
            {
                name: that.data.name,
                pay_type: that.data.pay_type,
                price: that.data.price,
                order_id: that.data.order_id,
                notify_url: that.data.notify_url,
                more: that.data.more,
                expire: 60 * 60 * 24 * 30,
                sign: md5.md5(that.data.name + that.data.pay_type + that.data.price + that.data.order_id + that.data.notify_url + that.data.secret)
            }
        );
        if (qrCode.data.status == 'ok') {
            that.setData({
                showQrCode: 'yes',
                show: 'no',
                payCode: 'https://xorpay.com/qr?data=' + qrCode.data.info.qr
            });
            var qrRes = await that.useSync(
                baseUrl + 'QrCode/addQrCode.do',
                {
                    codeId: that.data.order_id,
                    qrCode: qrCode.data.info.qr
                }
            );
            console.log('qrRes:');
            console.log(qrRes);
        } else {
            that.setData({
                show: 'no'
            });
            wx.showToast({
              title: '获取支付码失败',
              icon: 'none',
              duration: 3000,
              mask: true
            });
            return;
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        that.setData({
            worker: wx.getStorageSync(options.workerId),
            userId: wx.getStorageSync('openid')
        });
        wx.request({
          url: baseUrl + 'RepairEvaluation/getRepairEvaluations.do',
          data: {
              page: that.data.page,
              limit: that.data.limit,
              workerId: options.workerId
          },
          method: 'POST',
          dataType: 'json',
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          success: function (res) {
              console.log(res);
              if (res.data.status == 'success') {
                  for (let i = 0; i < res.data.info.length; ++i) {
                      res.data.info[i].stars = Math.ceil(res.data.info[i].evaluationScore / 20);
                  }
                  that.setData({
                      evaluationList: res.data.info,
                      pages: Math.ceil(res.data.info.length / that.data.limit)
                  });
              }
          },
          fail: function (res) {
              wx.showToast({
                title: '获取评论异常',
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
              title: '没有更多评价',
              icon: 'none',
              duration: 3000,
              mask: true
            });
            return;
        }
        wx.request({
          url: baseUrl + 'RepairEvaluation/getRepairEvaluations.do',
          data: {
              page: that.data.page + 1,
              limit: that.data.limit,
              wrokerId: that.data.workerId
          },
          method: 'POST',
          dataType: 'json',
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          success: function (res) {
              if (res.data.status == 'success') {
                  var tempList = that.data.evaluationList;
                  for (let i = 0; i < res.data.info.length; ++i) {
                      tempList.push(res.data.info[i]);
                  }
                  that.setData({
                      pages: Math.ceil(res.data.info.length / that.data.limit),
                      page: that.data.pages + 1,
                      evaluationList: tempList
                  });
              } else {
                  wx.showToast({
                    title: '获取评价失败',
                    icon: 'none',
                    duration: 3000,
                    mask: true
                  });
              }
          },

        })
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})