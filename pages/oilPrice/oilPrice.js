const oilPriceQueryKey = "5243b4154917a900f945eb3ce3f64cc2";
Page({

    /**
     * 页面的初始数据
     */
    data: {
        oilPrice: {},
        cityList: [],
        city: '',
        cityId: '',
        height: '',
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        // 获取系统信息
        wx.getSystemInfo({
          success: (result) => {
              that.setData({
                  height: result.screenHeight
              });
          },
        });
        // 查询全国油价
        wx.request({
          url: 'http://apis.juhe.cn/gnyj/query',
          data: {
              key: oilPriceQueryKey
          },
          method: 'post',
          dataType: 'json',
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          success: function (res) {
              if (res.data.reason == 'success!') {
                  for (let i = 0; i < res.data.result.length; ++i) {
                      that.setData({
                          ['cityList[' + i + '].city']: res.data.result[i].city,
                          ['cityList[' + i + '].NO_0']: res.data.result[i]["0h"],
                          ['cityList[' + i + '].NO_92']: res.data.result[i]["92h"],
                          ['cityList[' + i + '].NO_95']: res.data.result[i]["95h"],
                          ['cityList[' + i + '].NO_98']: res.data.result[i]["98h"],
                          ['cityList[' + i + '].id']: 'id_' + new Date().getTime().toString()
                      });
                      setInterval(function (){}, 1);
                  }
              }
              console.log(that.data.cityList);
          },
          fail: function (res) {
              wx.showToast({
                title: '预期之外的错误',
                icon: 'error',
                duration: 2000,
                mask: true
              });
          }
        });
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-03-22
     * @description 实现页面内锚点跳转 跳转到用户输入的省份
     */
    toCity: function (e) {
        var that = this;
        for (let i = 0; i < that.data.cityList.length; ++i) {
            console.log(1);
            if (that.data.cityList[i].city == that.data.city) {
                that.setData({
                    cityId: that.data.cityList[i].id
                });
                break;
            }
        }
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-03-22
     * @description 获取输入框输入的值
     */
    getInputValue: function (e) {
        var that = this;
        that.setData({
            city: e.detail.value
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