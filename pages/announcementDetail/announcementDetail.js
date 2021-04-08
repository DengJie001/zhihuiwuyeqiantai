// pages/announcementDetail/announcementDetail.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        announcement: {},    // 从缓存中获取的公告信息
        tips: ''    // 提示
    },

    /**
     * @author DengJie
     * @date 2021-04-04
     * @description 弹出疑问提示框
     */
    question: function () {
        var that = this;
        that.setData({
            modal: 'yes',
            tips: '若有疑问,请联系管理员:' + that.data.announcement.authorTel
        });
    },

    /**
     * @authro DengJie
     * @date 2021-04-04
     * @description 隐藏疑问提示框
     */
    hideModal: function () {
        var that = this;
        that.setData({
            modal: 'no'
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        var announcement = wx.getStorageSync(options.announcementId);
        announcement.content = announcement.content.replace('<br/>', '\n');
        console.log(announcement.content);
        that.setData({
            announcement: announcement
        });
        console.log(that.data.announcement);
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