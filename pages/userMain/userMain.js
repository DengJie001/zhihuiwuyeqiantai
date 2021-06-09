const baseUrl = 'https://codemata.club/bysj/';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        unPaymentTotal: 0,
        unread: 0,
        user: {},
        userAvatar: ''
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-04-19
     * @description 获取用户头像
     */
    getAvatar: function (e) {
        var that = this;
        wx.getUserProfile({
            desc: '用户完善用户资料',
            success: (res) => {
                that.setData({
                    userAvatar: res.userInfo.avatarUrl
                });
                wx.setStorageSync('userAvatar', res.userInfo.avatarUrl);
            },
            fail:(res) => {
                wx.showToast({
                  title: '用户取消授权!',
                  icon: 'none',
                  duration: 2000, 
                  mask: true
                });
            }
        });
    },

    /**
     * @author DengJie
     * @param {*} url 请求地址
     * @param {*} data 请求参数
     * @date 2021-04-19
     * @description 封装同步请求
     */
    useSync: function (url, data) {
        var that = this;
        return new Promise(function (resolve, reject) {
            wx.request({
              url: url,
              data: data,
              dataType: 'json',
              method: 'POST',
              header: {'Content-Type': 'application/x-www-form-urlencoded'},
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
     * @date 2021-04-19
     * @description 页面跳转
     */
    goto: function (e) {
        var that = this;
        var page = e.currentTarget.dataset.page;
        var url = '';
        switch (page) {
            case '投诉建议':
                url = '../myComplaintList/myComplaintList';
                break;
            case '缴费':
                url = '../payment/payment'
                break;
        }
        wx.navigateTo({
          url: url
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: async function (options) {
        var that = this;
        var userId = '';
        that.setData({
            userAvatar: wx.getStorageSync('userAvatar')
        })
        try {
            userId = wx.getStorageSync('openid');
        } catch (e) {
            wx.showToast({
              title: '缓存异常!',
              icon: 'none',
              duration: 2000,
              mask: true
            });
        }
        var res = await that.useSync(
            baseUrl + 'complaint/getUserUnreadComplaintReply.do',
            {
                userId: userId
            }
        );
        var user = await that.useSync(
            baseUrl + 'user/getUserInfo.do',
            {
                userId: userId
            }
        );
        var bills = await that.useSync(
            baseUrl + 'bill/userGetUnpaidBills.do',
            {
                userId: wx.getStorageSync('openid'),
                areaId: user.data.user.areaId,
                unitId: user.data.user.unitId,
                roomId: user.data.user.roomId
            }
        );
        that.setData({
            unread: res.data.msgId,
            unPaymentTotal: bills.data.unpaid
        });
        if (user.data.user == 'error') {
            wx.showToast({
              title: '未查找到用户',
              icon: 'none',
              duration: 2000,
              mask: true
            });
        } else {
            that.setData({
                user: user.data.user
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

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})