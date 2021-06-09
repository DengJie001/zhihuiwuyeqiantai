const baseUrl = 'https://codemata.club/bysj/'

Page({

    /**
     * 页面的初始数据
     */
    data: {
        properties: ['选择属性', '排队人数', '评分', '技能'],
        propertyIndex: 0,
        workers: [],
        pageTotal: 0,
        page: 1,
        limit: 10,
        inputValue: ''
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

    getInputValue: function (e) {
        var that = this;
        that.setData({
            inputValue: e.detail.value
        });
    },

    /**
     * @author DengJie
     * @date 2021-04-20
     * @description 预览头像
     */
    previewPictures: function (e) {
        var that = this;
        var urls = [that.data.workers[e.currentTarget.dataset.index].workerAvatar];
        wx.previewImage({
          urls: urls
        });
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-04-19
     * @description 监听下拉框变化
     */
    pickerChange: function (e) {
        var that = this;
        that.setData({
            propertyIndex: e.detail.value
        });
    },

    hideModal: function () {
        var that = this;
        that.setData({
            showModal: 'no'
        });
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-04-20
     * @description 搜索维修人员信息
     */
    search: async function (e) {
        var that = this;
        var property = '';
        var value = '';
        if (that.data.propertyIndex == 0) {
            that.setData({
                tips: '请先选择属性',
                showModal: 'yes'
            });
            return;
        }
        if (that.data.inputValue == '') {
            that.setData({
                tips: '请输入搜索关键字',
                showModal: 'yes'
            });
            return;
        }
        property = that.data.properties[that.data.propertyIndex];
        value = that.data.inputValue;
        var res = await that.useSync(
            baseUrl + 'worker/search.do',
            {
                property: property,
                value: value,
                limit: that.data.limit,
                page: 1,
                userId: wx.getStorageSync('openid')
            }
        );
        if (res.data.code == 0 && res.data.count > 0) {
            that.setData({
                workers: res.data.workers,
                pageTotal: Math.ceil(res.data.count / that.data.limit)
            });
        } else if (res.data.code == 0 && res.data.count == 0) {
            that.setData({
                tips: '暂无数据，将显示原始数据',
                showModal: 'yes'
            });
        } else if (res.data.code == -1) {
            wx.showToast({
              title: '发生异常',
              icon: 'none',
              duration: 2000,
              mask: true
            });
        } else {
            wx.showToast({
              title: '预期之外的错误',
              icon: 'none',
              duration: 2000,
              mask: true
            });
        }
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-04-20
     * @description 去往维修下单界面
     */
    toDetail: function (e) {
        var that = this;
        // 数据存入缓存
        try {
            wx.setStorageSync(that.data.workers[e.currentTarget.dataset.index].workerId, that.data.workers[e.currentTarget.dataset.index]);
        } catch (e) {
            wx.showToast({
              title: '缓存异常',
              icon: 'none',
              duration: 2000,
              mask: true
            });
        }
        wx.navigateTo({
          url: '../workerDetail/workerDetail?workerId=' + that.data.workers[e.currentTarget.dataset.index].workerId,
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: async function (options) {
        var that = this;
        var res = await that.useSync(
            baseUrl + 'worker/getAllWorkers.do',
            {
                limit: that.data.limit,
                page: 1,
                userId: wx.getStorageSync('openid')
            }
        );
        if (res.data.code == 0 && res.data.count > 0) {
            that.setData({
                workers: res.data.workers,
                pageTotal: Math.ceil(res.data.count / that.data.limit)
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
        var that = this;
        var property = '';
        var value = ''
        if (that.data.propertyIndex == 0 || that.data.inputValue == '') {
            property = '';
            value = '';
        } else {
            property = that.data.properties[that.data.propertyIndex];
            value = that.data.inputValue;
        }
        if (that.data.page + 1 > that.data.pageTotal) {
            wx.showToast({
              title: '没有更多数据',
              icon: 'none',
              duration: 2000,
              mask: true
            });
            return;
        }
        wx.request({
          url: baseUrl + 'worker/search.do',
          data: {
              limit: that.data.limit,
              page: that.data.page + 1,
              property: property,
              value: value,
              userId: wx.getStorageSync('openid')
          },
          method: 'POST',
          dataType: 'json',
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          success: function (res) {
              if (res.data.code == 0) {
                  var tempWorkers = that.data.workers;
                  for (let i = 0; i < res.data.workers.length; ++i) {
                      tempWorkers.push(res.data.workers[i])
                  }
                  that.setData({
                      workers: tempWorkers,
                      page: that.data.page + 1
                  });
              } else if (res.data.code == -1) {
                  wx.showToast({
                    title: '异常错误!',
                    icon: 'none',
                    duration: 2000,
                    mask: true
                  });
              }
          },
          fail: function (res) {
              wx.showToast({
                title: '预期之外的错误',
                icon: 'none',
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