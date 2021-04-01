// pages/complaint/complaint.js
Page({

    /**
     * 页面的初始数据
     */
    data: {

    },

    chooseImage: function () {
        wx.chooseImage({
          count: 1,
          sizeType: ['original'],
          sourceType: ['album', 'camera'],
          success: function (res) {
              console.log(res);
              wx.request({
                url: 'https://ocr.tencentcloudapi.com',
                data: {
                    Action: 'WaybillOCR',
                    ImageUrl: res.tempFilePaths[0],
                    Version: '2018-11-19',
                    Region: 'ap-beijing',
                    Timestamp: new Date().getTime(),
                    Nonce: Math.floor(Math.random() * 10000),
                    SecretId: 'AKID5wdT60yHafYZ6Zf5L7h5MRKxZ0JOtwxm'
                },
                header: {'Content-Type': 'application/x-www-form-urlencoded'},
                dataType: 'json',
                method: 'POST',
                success: function (res) {
                    console.log('成功');
                    console.log(res);
                },
                fail: function (res) {
                    console.log('失败');
                    console.log(res);
                }
              });
          }
        })
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