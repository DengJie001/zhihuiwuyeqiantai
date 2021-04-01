const baseUrl = 'http://localhost:8080/bysj/announcement/';  // 请求前缀
Page({

    /**
     * 页面的初始数据
     */
    data: {
        property: ['标题', '发布人', '日期'],
        index: 0,
        inputValue: '', // 输入框的中用户输入的值
        limit: 10,  // 每页的公告条数
        page: 1, // 第几页
        topAnnouncement: {}, // 置顶公告
        announcements: [],   // 非置顶公告
        topIsExist: false,   // 是否有置顶公告
        count: 0,   // 公告总数
        pageNum: 0,  // 总页数
        isAll: true // 是否已经全部查出所有记录
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-03-22
     * @description 下拉框变化
     */
    pickerChange: function (e) {
        console.log(e);
        var that = this;
        var showModal = '';
        that.setData({
            index: e.detail.value
        });
        showModal = wx.getStorageSync('showModal');
        // 如果是第一次选择按照日期搜索 展示搜索格式
        if (that.data.index == 2 && showModal == '') {
            let date = new Date().getDate();
            if (date < 10) {
                date = '0' + date;
            }
            that.setData({
                modal: 'yes',
                year: new Date().getFullYear(),
                month: '0' + (new Date().getMonth() + 1),
                date: date
            });
            wx.setStorageSync('showModal', 'no');
        }
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-04-02
     * @description 获取输入框用户输入的值用于搜索
     */
    getInputValue: function (e) {
        var that = this;
        that.setData({
            inputValue: e.detail.value
        });
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-03-23
     * @description 根据关键字搜索公告
     */
    search: function (e) {
        var that = this;
        var pattern = /\d{4}(\-)\d{2}\1\d{2}/; // 日期格式的正则表达式 用于验证用户输入的日期格式是否合法
        console.log(pattern.test('2021-12-38'));
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-03-23
     * @description 隐藏modal
     */
    hideModal: function (e) {
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
        // 查询置顶公告
        wx.request({
          url: baseUrl + 'getTopAnnouncement.do',
          data: {},
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          method: 'POST',
          dataType: 'json',
          success: function (res) {
              if (res.data.announcements.length > 0) {
                  that.setData({
                      topIsExist: true,
                      topAnnouncement: res.data.announcements[0]
                  });
              }
          },
          fail: function(res) {
              wx.showToast({
                title: '发生了异常',
                icon: 'error',
                duration: 2000,
                mask: true
              });
          }
        });
        // 查询非置顶公告
        wx.request({
          url: baseUrl + 'getAnnouncements.do',
          data: {
              page: that.data.page,
              limit: that.data.limit
          },
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          method: 'POST',
          dataType: 'json',
          success: function (res) {
              console.log(res);
              if (res.data.announcements.length > 0) {
                  that.setData({
                      announcements: res.data.announcements,
                      page: that.data.page + 1,
                      count: res.data.count,
                  });
                  that.setData({
                    pageNum: Math.ceil(that.data.count / that.data.limit)
                  });
                  console.log("count:" + that.data.count);
                  console.log("pageNum:" + that.data.pageNum);
              }
          },
          fail: function (res) {
              wx.showToast({
                title: '发生了异常',
                icon: 'error',
                duration: 2000,
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
        var announcements = [];
        // 当前页数大于总页数说明所有公告记录全部查出来 阻止查询
        if (that.data.page > that.data.pageNum) {
            that.setData({
                isAll: true
            });
            return;
        }
        wx.request({
          url: baseUrl + 'getAnnouncements.do',
          data: {
              page: that.data.page,
              limit: that.data.limit
          },
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          method: 'POST',
          dataType: 'json',
          success: function (res) {
              if (res.data.announcements.length > 0) {
                  announcements = that.data.announcements;
                  for (let i = 0; i < res.data.announcements.length; ++i) {
                      announcements.push(res.data.announcements[i]);
                  }
                  that.setData({
                      page: that.data.page + 1,
                      announcements: announcements
                  });
                  console.log(that.data.announcements);
              }
          },
          fail: function (res) {
              wx.showToast({
                title: '发生了异常',
                icon: 'error',
                duration: 2000,
                mask: true
              });
          }
        })
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})