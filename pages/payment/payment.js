const md5=require('../../utils/md5.js');
const baseUrl = 'https://codemata.club/bysj/';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        aid: '18187',
        name: '物业缴费',
        pay_type: 'native',
        price: '',
        notify_url: 'http://codemata.club:8080/bysj/pay/addUtilityBillPayment.do',
        more: '',
        secret: 'cdcc2ed5c2434790abe36f0a037c5a23',
        order_id: '',
        payCode: '',
        bills: [],
        page: 1,
        pages: 1,
        limit: 10
    },

    /**
     * @author DengJie
     * @param {*} url 请求地址
     * @param {*} data 请求参数
     * @date 2021-04-26
     * @description 封装同步函数
     */
    useSync: function (url, data) {
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

    pay: function (e) {
        var that = this;
        that.setData({
            showQrCode: 'yes',
            currentSelectedItemIndex: e.currentTarget.dataset.index,
            order_id: that.data.bills[e.currentTarget.dataset.index].billId + '/' + new Date().getTime().toString(),
            price: that.data.bills[e.currentTarget.dataset.index].billFigure,
            more: wx.getStorageSync('openid')
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
              sign: md5.md5(that.data.name + that.data.pay_type + that.data.price + that.data.order_id + that.data.notify_url + that.data.secret)
          },
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          method: 'POST',
          dataType: 'json',
          success: function (res) {
              that.setData({
                  payCode: 'https://xorpay.com/qr?data=' + res.data.info.qr
              });
          },
          fail: function (res) {
              console.log(res);
          }
        });
    },

    previewQrCode: function (res) {
        var that = this;
        var urls = [that.data.payCode];
        wx.previewImage({
          urls: urls,
          current: urls[0],
          showmenu: true
        });
    },

    hideModal: function () {
        var that = this;
        that.setData({
            showQrCode: 'no'
        });
        wx.request({
          url: baseUrl + 'bill/userGetAllBills.do',
          data: {
              areaId: that.data.userInfo.areaId,
              unitId: that.data.userInfo.unitId,
              roomId: that.data.userInfo.roomId,
              page: that.data.page,
              limit: that.data.limit,
              userId: wx.getStorageSync('openid')
          },
          method: 'POST',
          dataType: 'json',
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          success: function (res) {
              that.setData({
                  bills: res.data.info.bills,
                  pages: Math.ceil(res.data.info.count / that.data.limit)
              });
          },
          fail: function (res) {
              wx.showToast({
                title: '物业账单查询失败',
                icon: 'none',
                duration: 3000,
                mask: true
              });
          }
        });
    },

    /**
     * @author DengJie
     * @date 2021-04-26
     * @description 跳转到支付步骤界面
     */
    toPayStep: function () {
        wx.navigateTo({
          url: '../payStep/payStep',
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: async function (options) {
        var that = this;
        var userInfo = await that.useSync(
            baseUrl + 'user/getUserInfo.do',
            {
                userId: wx.getStorageSync('openid')
            }
        );
        that.setData({
            userInfo: userInfo.data.user
        });
        var res = await that.useSync(
            baseUrl + 'bill/userGetAllBills.do',
            {
                areaId: that.data.userInfo.areaId,
                unitId: that.data.userInfo.unitId,
                roomId: that.data.userInfo.roomId,
                userId: wx.getStorageSync('openid'),
                page: that.data.page,
                limit: that.data.limit
            }
        );
        if (res.data.status == 'success') {
            that.setData({
                bills: res.data.info.bills,
                pages: Math.ceil(res.data.info.count / that.data.limit)
            });
        } else {
            wx.showToast({
              title: '拉取账单失败,请重试',
              icon: 'none',
              duration: 3000,
              mask: true
            });
        }
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
              title: '没有更多账单',
              icon: 'none',
              duration: 3000,
              mask: true
            });
            return;
        }
        wx.request({
          url: baseUrl + 'bill/userGetAllBills.do',
          data: {
              areaId: that.data.userInfo.areaId,
              unitId: that.data.userInfo.unitId,
              roomId: that.data.userInfo.roomId,
              userId: wx.getStorageSync('openid'),
              limit: that.data.limit,
              page: that.data.page + 1
          },
          method: 'POST',
          dataType: 'json',
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          success: function (res) {
              var billList = that.data.bills;
              for (let i = 0; i < res.data.info.bills.length; ++i) {
                  billList.push(res.data.info.bills[i]);
              }
              that.setData({
                  bills: billList,
                  pages: Math.ceil(res.data.info.count / that.data.limit),
                  page: that.data.page + 1
              });
          },
          fail: function (res) {
              wx.showToast({
                title: '拉取物业账单失败',
                icon: 'none',
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