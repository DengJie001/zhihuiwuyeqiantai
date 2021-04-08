const baseUrl = 'http://localhost:8080/bysj/';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        placeInfos: [], // 公告信息
        page: 1,    // 当前页数
        limit: 10, // 每页限制,也就是触底后再获取多少条消息
        pageTotal: 1,   // 所有数据一共可以分成多少页
        infosTotal: 1   // 一共有多少条信息
    },

    /**
     * @author DengJie
     * @date 2021-04-09
     * @description 预览图片
     */
    previewPictures: function (e) {
        var that = this;
        var index = e.currentTarget.dataset.index;  // 被点击的图片所属公告的下标
        // 预览图片
        wx.previewImage({
          urls: that.data.placeInfos[index].placePicture,
          current: that.data.placeInfos[index].firstPicture
        });
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-04-09
     * @description 跳转到场地申请界面
     */
    toApplyPlace: function (e) {
        wx.redirectTo({
          url: '../applyPlace/applyPlace?placeid=' + e.currentTarget.dataset.placeid,
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        var urls = [];
        wx.request({
          url: baseUrl + 'PlaceInfo/getPlaceInfos.do',
          data: {
              page: 1,
              limit: 10,
              property: null,
              value: null
          },
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          method: 'POST',
          dataType: 'json',
          success: function (res) {
              that.setData({
                  placeInfos: res.data.placeInfos
              });
              for (let i = 0; i < res.data.placeInfos.length; ++i) {
                  urls = that.data.placeInfos[i].placePicture.split('+');
                  that.setData({
                      ['placeInfos[' + i + '].placePicture']: urls,
                      ['placeInfos[' + i + '].firstPicture']: urls[0]
                  });
                  wx.setStorageSync(that.data.placeInfos[i].placeId, that.data.placeInfos[i]);
              }
              console.log(that.data.placeInfos);
          },
          fail: function (errorRes) {
              console.log(errorRes);
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