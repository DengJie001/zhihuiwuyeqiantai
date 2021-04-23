const baseUrl = 'http://localhost:8080/bysj/';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        complaint: {},
        nowDate: '',
        tips: ''
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-04-19
     * @description 提交用户结果
     */
    submitUserResult: function (e) {
        var that = this;
        if (that.data.complaint.managerResponse == '') {
            that.setData({
                showModal: 'yes',
                tips: '管理员还未回复,不能进行此操作!'
            });
            return;
        }
        wx.request({
          url: baseUrl + 'complaint/submitResult.do',
          data: {
              complaintId: that.data.complaint.id,
              result: e.currentTarget.dataset.result
          },
          method: 'post',
          dataType: 'json',
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          success: function (res) {
              if (res.data.msgId > 0) {
                  if (e.currentTarget.dataset.result == '满意') {
                      that.setData({
                          tips: '感谢反馈!',
                          showModal: 'yes'
                      });
                  } else {
                      that.setData({
                          tips: '我们会继续努力,提升服务质量!',
                          showModal: 'yes'
                      });
                  }
              } else {
                  console.log(res);
                  wx.showToast({
                    title: '提交失败!',
                    icon: 'error',
                    duration: 2000,
                    mask: true
                  });
              }
          },
          fail: function (errorRes) {
              wx.showToast({
                title: '预期之外的错误!',
                icon: 'error',
                duration: 2000,
                mask: true
              });
          }
        });
    },

    /**
     * @author DengJie
     * @date 2021-04-19
     * @description 用户点击右上角关闭弹窗
     */
    hideModal: function () {
        var that = this;
        that.setData({
            showModal: 'no'
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options);
        var that = this;
        var complaint = {};
        var year = new Date().getFullYear();
        var month = new Date().getMonth();
        var date = new Date().getDate();
        if (month + 1 <= 9) {
            month = '0' + (month + 1);
        }
        try {
            complaint = wx.getStorageSync(options.id);
        } catch (e) {
            wx.showToast({
              title: '缓存异常',
              icon: 'error',
              duration: 2000,
              mask: false
            });
        }
        if (complaint.complaintPicture != '') {
            var urls = complaint.complaintPicture.split('+');
            complaint.complaintPicture = urls;
        } else {
            complaint.complaintPicture = [];
        }
        that.setData({
            complaint: complaint,
            nowDate: year + '-' + month + '-' + date
        });
        console.log(that.data.complaint.complaintPicture);
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