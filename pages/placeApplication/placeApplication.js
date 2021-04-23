const baseUrl = 'http://localhost:8080/bysj/';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        placeInfos: [], // 公告信息
        properties: ['关键字', '价格', '面积', '使用状态'],
        index: 0,
        page: 1,    // 当前页数
        limit: 10, // 每页限制,也就是触底后再获取多少条消息
        pageTotal: 1,   // 所有数据一共可以分成多少页
        infosTotal: 1,   // 一共有多少条信息
        property: null,
        value: null,
        lowerValue: 0,
        higherValue: 0,
        keyWords: '',
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
     * @date 2021-04-13
     * @description 监听下拉框选择变化
     */
    pickerChange: function (e) {
        var that = this;
        that.setData({
            index: e.detail.value
        });
        if (that.data.index == 1 || that.data.index == 2) {
            that.setData({
                showRangeInput: 'yes'
            });
        }
    },

    /**
     * @author DengJie
     * @date 2021-04-13
     * @description 关闭弹出层
     */
    hideModal: function () {
        var that = this;
        that.setData({
            showRangeInput: 'no'
        });
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-04-13
     * @description 获取输入框的值
     */
    getInputValue: function (e) {
        var that = this;
        if (e.currentTarget.dataset.key == 'keyWords') {
            that.setData({
                keyWords: e.detail.value
            });
        } else if (e.currentTarget.dataset.key == 'higher') {
            that.setData({
                higherValue: e.detail.value
            });
        } else if (e.currentTarget.dataset.key == 'lower') {
            that.setData({
                lowerValue: e.detail.value
            });
        }
    },

    /**
     * @author DengJie
     * @date 2021-04-13
     * @description 根据区间进行场地信息搜索,价格区间或者面积区间
     */
    searchByRange: function () {
        var that = this;
        that.setData({
            page: 1,
        });
        wx.request({
          url: baseUrl + 'PlaceInfo/searchByRange.do',
          data: {
              property: that.data.properties[that.data.index],
              lowerValue: that.data.lowerValue,
              higherValue: that.data.higherValue
          },
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          method: 'POST',
          dataType: 'json',
          success: function (res) {
              if (res.data.code == 0) {
                  for (let i = 0; i < res.data.placeInfos.length; ++i) {
                      var urls = res.data.placeInfos[i].placePicture.split('+')
                      res.data.placeInfos[i].placePicture = urls;
                      res.data.placeInfos[i].firstPicture = urls[0];
                  }
                  that.setData({
                      placeInfos: res.data.placeInfos,
                  });
                  that.hideModal();
              } else {
                  wx.showToast({
                    title: '发生了异常',
                    icon: 'error',
                    duration: 3000,
                    mask: true
                  });
              }
          },
          fail: function (errorRes) {
              wx.showToast({
                title: '预期之外的错误',
                icon: 'error',
                duration: 3000,
                mask: true
              });
          }
        })
    },

    /**
     * @author DengJie
     * @date 2021-04-13
     * @description 按照关键字进行搜索
     */
    search: function () {
        var that = this;
        var urls = [];
        wx.request({
          url: baseUrl + 'PlaceInfo/getPlaceInfos.do',
          data: {
              page: 1,
              limit: that.data.limit,
              property: that.data.properties[that.data.index],
              value: that.data.keyWords
          },
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          method: 'POST',
          dataType: 'json',
          success: function (res) {
              if (res.data.code == 0) {
                  for (let i = 0; i < res.data.placeInfos.length; ++i) {
                      urls = res.data.placeInfos[i].placePicture.split('+');
                      res.data.placeInfos[i].placePicture = urls;
                      res.data.placeInfos[i].firstPicture = urls[0];
                  }
                  that.setData({
                      placeInfos: res.data.placeInfos,
                      infosTotal: res.data.count,
                      pageTotal: Math.ceil(res.data.count / that.data.limit),
                      page: that.data.page + 1
                  });
                  console.log('pageTotal:' + that.data.pageTotal);
                  console.log('page:' + that.data.page);
              } else {
                  wx.showToast({
                    title: '发生了异常!',
                    icon: 'error',
                    duration: 3000,
                    mask: true
                  });
              }
          },
          fail: function (errorRes) {
              wx.showToast({
                title: '预期之外的错误',
                icon: 'error',
                duration: 3000,
                mask: true
              });
          }
        })
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-04-09
     * @description 跳转到场地申请界面
     */
    toApplyPlace: function (e) {
        var that = this;
        // 将被点击的场地信息存入缓存
        try {
            wx.setStorageSync(that.data.placeInfos[e.currentTarget.dataset.index].placeId + '', that.data.placeInfos[e.currentTarget.dataset.index]);
        } catch (e) {
            console.log(e);
            wx.showToast({
              title: '缓存异常!',
              icon: 'error',
              duration: 2000,
              mask: true
            });
        }
        wx.redirectTo({
          url: '../applyPlace/applyPlace?placeId=' + that.data.placeInfos[e.currentTarget.dataset.index].placeId,
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
                  placeInfos: res.data.placeInfos,
                  infosTotal: res.data.count,
                  page: that.data.page + 1
              });
              that.setData({
                  pageTotal: Math.ceil(that.data.infosTotal / that.data.limit)
              });
              for (let i = 0; i < res.data.placeInfos.length; ++i) {
                  urls = that.data.placeInfos[i].placePicture.split('+');
                  that.setData({
                      ['placeInfos[' + i + '].placePicture']: urls,
                      ['placeInfos[' + i + '].firstPicture']: urls[0]
                  });
              }
          },
          fail: function (errorRes) {
              wx.showToast({
                title: '预期之外的错误',
                icon: 'error',
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
        var placeInfos = that.data.placeInfos;
        var urls = [];
        var property = '';
        var value = '';
        if (that.data.index == -1) {
            property = null;
            value = null;
        } else {
            property = that.data.properties[that.data.index],
            value = that.data.keyWords
        }
        // 如果是通过区间查询 则不允许触底刷新
        if (that.data.index == 1 || that.data.index == 2) {
            return;
        }
        // 如果当前页数小于了总页数 证明所有场地信息已经全部查出来 阻止查询
        if (that.data.pageTotal < that.data.page) {
            wx.showToast({
              title: '没有更多数据',
              icon: 'none',
              duration: 3000,
              mask: true
            });
            return;
        }
        wx.request({
          url: baseUrl + 'PlaceInfo/getPlaceInfos.do',
          data: {
              page: that.data.page,
              limit: that.data.limit,
              property: property,
              value: value
          },
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          method: 'POST',
          dataType: 'json',
          success: function (res) {
              // 状态码code为0则是查询正常
              if (res.data.code == 0) {
                  for (let i = 0; i < res.data.placeInfos.length; ++i) {
                      urls = res.data.placeInfos[i].placePicture.split('+');
                      res.data.placeInfos[i].placePicture = urls;
                      res.data.placeInfos[i].firstPicture = urls[0];
                      placeInfos.push(res.data.placeInfos[i]);
                  }
                  that.setData({
                      placeInfos: placeInfos,
                      page: that.data.page + 1
                  });
                  // 对场地信息中的图片链接进行拆分
                  console.log(placeInfos);
              } else {
                  wx.showToast({
                    title: res.data.msg,
                    icon: 'error',
                    duration: 2000,
                    mask: true
                  });
              }
          },
          fail: function (errorRes) {
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
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})