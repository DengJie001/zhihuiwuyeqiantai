const baseUrl = 'https://codemata.club/bysj/';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        bills: [],
        userInfo: {},
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

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: async function (options) {
        var that = this;
        var user = await that.useSync(
            baseUrl + 'user/getUserInfo.do',
            {
                userId: wx.getStorageSync('openid')
            }
        );
        that.setData({
            userInfo: user.data.user
        });
        var bills = await that.useSync(
            baseUrl + 'bill/userGetPaidUtilityBills.do',
            {
                areaId: that.data.userInfo.areaId,
                unitId: that.data.userInfo.unitId,
                roomId: that.data.userInfo.roomId,
                userId: wx.getStorageSync('openid'),
                page: that.data.page,
                limit: that.data.limit
            }
        );
        that.setData({
            bills: bills.data.info.bills,
            pages: Math.ceil(bills.data.info.count / that.data.limit)
        });
        console.log(that.data.bills);
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
              title: '没有更多历史账单',
              icon: 'none',
              duration: 3000,
              mask: true
            });
            return;
        }
        wx.request({
          url: baseUrl + 'bill/userGetPaidUtilityBills.do',
          data: {
              areaId: that.data.userInfo.areaId,
              unitId: that.data.userInfo.unitId,
              roomId: that.data.userInfo.roomId,
              userId: wx.getStorageSync('openid'),
              page: that.data.page + 1,
              limit: that.data.limit
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
                  page: that.data.page + 1,
                  pages: Math.ceil(res.data.info.count / that.data.limit)
              });
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
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})