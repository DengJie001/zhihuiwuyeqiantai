const md5=require('../../utils/md5.js');
Page({

    /**
     * 页面的初始数据
     */
    data: {
        aid: '18187',
        name: '支付测试',
        pay_type: 'native',
        price: '20.00',
        notify_url: 'http://localhost:8080/bysj/pay/testPay.do',
        more: '安卓支付测试',
        secret: 'cdcc2ed5c2434790abe36f0a037c5a23',
        order_id: new Date().getTime() + '',
        payUrl: ''
    },

    pay: function () {
        var that = this;
        wx.request({
          url: 'https://xorpay.com/api/pay/18187',
          data: {
              name: that.data.name,
              pay_type: that.data.pay_type,
              price: that.data.price,
              order_id: that.data.order_id,
              notify_url: that.data.notify_url,
              sign: md5.md5(that.data.name + that.data.pay_type + that.data.price + that.data.order_id + that.data.notify_url + that.data.secret)
          },
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          method: 'POST',
          dataType: 'json',
          success: function (res) {
              console.log(res);
              that.setData({
                  payUrl: 'https://xorpay.com/qr?data=' + res.data.info.qr
              });
          },
          fail: function (res) {
              console.log(res);
          }
        })
    },

    previewQRCode: function (res) {
        var that = this;
        var urls = [that.data.payUrl];
        wx.previewImage({
          urls: urls,
          current: urls[0],
          showmenu: true
        });
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