const baseUrl = 'https://codemata.club/bysj/';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        lostItems: [],
        limit: 10,
        page: 1,
        pages: 1
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-05-04
     * @description 监听页面开始滑动动作
     */
    listTouchStart: function (e) {
        var that = this;
        that.setData({
            ListTouchStart: e.touches[0].pageX
        });
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-05-04
     * @description 计算listTouch方向
     */
    listTouchMove: function (e) {
        var that = this;
        that.setData({
            ListTouchDirection: e.touches[0].pageX - that.data.ListTouchStart > 0 ? 'right' : 'left'
        });
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-05-04
     * @description 监听滑动事件结束 计算滚动距离
     */
    listTouchEnd: function (e) {
        var that = this;
        if (that.data.ListTouchDirection == 'left') {
            that.setData({
                modalName: e.currentTarget.dataset.target
            });
        } else {
            that.setData({
                modalName: null
            });
        }
        that.setData({
            ListTouchDirection: null
        });
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-05-04
     * @description 删除该条失物招领记录
     */
    delete: function (e) {
        var that = this;
        wx.showModal({
            title: '是否确认删除?',
            confirmText: '确定',
            cancelText: '再想想',
            showCancel: true,
            success: function (res) {
                if (res.confirm) {
                    wx.request({
                      url: baseUrl + 'LostItem/userDeleteLostItem.do',
                      data: {
                          userId: wx.getStorageSync('openid'),
                          id: that.data.lostItems[e.currentTarget.dataset.index].id
                      },
                      method: 'POST',
                      dataType: 'json',
                      header: {'Content-Type': 'application/x-www-form-urlencoded'},
                      success: function (res) {
                          if (res.data.status == 'success') {
                              var list = [];
                              for (let i = 0; i < that.data.lostItems.length; ++i) {
                                  if (i == e.currentTarget.dataset.index) {
                                      continue;
                                  } else {
                                      list.push(that.data.lostItems[i]);
                                  }
                              }
                              that.setData({
                                  lostItems: list
                              });
                              wx.showToast({
                                title: '删除成功',
                                icon: 'success',
                                duration: 3000,
                                mask: true
                              });
                          }
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
                }
            }
        });
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-05-08
     * @description 将该条失物招领的状态设置为已完成
     */
    complete: function (e) {
        console.log(e.currentTarget.dataset.index);
        var that = this;
        wx.request({
          url: baseUrl + 'LostItem/modifyItemStatus.do',
          data: {
              userId: wx.getStorageSync('openid'),
              itemId: that.data.lostItems[e.currentTarget.dataset.index].id
          },
          method: 'post',
          dataType: 'json',
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          success: function (res) {
              if (res.data.status == 'success') {
                  wx.showToast({
                    title: '修改成功',
                    icon: 'success',
                    duration: 3000,
                    mask: false
                  });
                  that.setData({
                      ['lostItems[' + e.currentTarget.dataset.index + '].itemStatus']: '已解决'
                  });
              } else {
                  wx.showToast({
                    title: '服务端异常',
                    icon: 'error',
                    duration: 3000,
                    mask: false
                  });
              }
          },
          fail: function (res) {
              wx.showToast({
                title: '预期之外的错误',
                icon: 'none',
                duration: 3000,
                mask: false
              });
          }
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        wx.request({
          url: baseUrl + 'LostItem/getUserAllLostItems.do',
          data: {
              userId: wx.getStorageSync('openid'),
              page: 1,
              limit: 10
          },
          method: 'POST',
          dataType: 'json',
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          success: function (res) {
              if (res.data.status == 'success') {
                  for (let i = 0; i < res.data.info.items.length; ++i) {
                      res.data.info.items[i].itemPicture = res.data.info.items[i].itemPicture.split('+');
                      res.data.info.items[i].hidden = false;
                  }
                  that.setData({
                      lostItems: res.data.info.items,
                      pages: Math.ceil(res.data.info.count / that.data.limit)
                  });
                  console.log(that.data.lostItems);
              } else {
                  wx.showToast({
                    title: '服务端异常',
                    icon: 'error',
                    duration: 3000,
                    mask: true
                  });
              }
          },
          fail: function (res) {
              wx.showToast({
                title: '拉取数据失败',
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
              title: '没有更多数据',
              icon: 'none',
              duration: 3000,
              mask: true
            });
            return;
        }
        wx.request({
          url: baseUrl + 'LostItem/getUserAllLostItems.do',
          data: {
              userId: wx.getStorageSync('openid'),
              limit: that.data.limit,
              page: that.data.page + 1,
          },
          method: 'POST',
          dataType: 'json',
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          success: function (res) {
              if (res.data.status == 'success') {
                  var list = that.data.lostItems;
                  for (let i = 0; i < res.data.info.items.length; ++i) {
                      res.data.info.items[i].itemPicture = res.data.info.items[i].itemPicture.split('+');
                      list.push(res.data.info.items[i]);
                  }
                  that.setData({
                      lostItems: list
                  });
              } else {
                  wx.showToast({
                    title: '服务端异常',
                    icon: 'error',
                    duration: 3000,
                    mask: true
                  });
              }
          },
          fail: function (res) {
              wx.showToast({
                title: '拉取数据失败',
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