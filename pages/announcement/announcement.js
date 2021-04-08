const baseUrl = 'http://localhost:8080/bysj/announcement/';  // 请求前缀
Page({

    /**
     * 页面的初始数据
     */
    data: {
        property: ['标题', '发布人', '日期'],
        index: 0,
        tips: '',   // 弹出的提示框中的提示信息
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
        var that = this;
        var showModal = '';
        that.setData({
            index: e.detail.value
        });
        showModal = wx.getStorageSync('showModal');
        // 如果是第一次选择按照日期搜索 展示搜索格式
        if (that.data.index == 2 && showModal == '') {
            let date = new Date().getDate();    // 获取当前日期
            let month = new Date().getMonth() + 1;  // 获取月份
            let year = new Date().getFullYear();    // 获取年份
            // 如果日期的数值小于10，则需要拼接0
            if (date < 10) {
                date = '0' + date;
            }
            // 如果月份的数值小于10，则需要拼接0
            if (month < 10) {
                month = '0' + month
            }
            that.setData({
                modal: 'yes',
                tips: '日期格式:xxxx-xx-xx,例如:' + year + '-' + month + '-' + date
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
     * @param {*} str 
     * @date 2021-04-02
     * @description 验证用户输入的格式日期是否正确
     */
    verifyDateFormat: function (str) {
        var strs = str.split('-');
        console.log(strs.length);
        // 正确的日期格式 分割之后的数组长度一定为3 如果不为3则表示日期格式有错误
        if (strs.length != 3) {
            return false;
        }
        // 对分割后的数组进行日期格式检测
        // 年份的字符串长度一定为4 不为4则证明日期格式不合法
        // 月份的字符串长度一定为2 不为2则证明日期格式不合法
        // 日期的字符串长度一定为2 不为2则证明日期格式不合法
        if (strs[0].length != 4 || strs[1].length != 2 || strs[2].length != 2) {
            return false;
        }
        // 如果月份的数值小于0 或者 大于12 则证明日期格式不合法
        if (parseInt(strs[1]) <= 0 || parseInt(strs[1]) >=12) {
            return false;
        }
        // 如果日期的数值小于0或者大于31 则证明日期格式不合法
        if (parseInt(strs[2]) <= 0 || parseInt(strs[2]) > 31) {
            return false;
        }
        // 如果以上检测都通过 则证明日期格式合法
        return true;
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-03-23
     * @description 根据关键字搜索公告
     */
    search: function (e) {
        var that = this;
        let date = new Date().getDate();    // 获取当前日期
        let month = new Date().getMonth() + 1;  // 获取月份
        let year = new Date().getFullYear();    // 获取年份
        // 如果日期的数值小于10，则需要拼接0
        if (date < 10) {
            date = '0' + date;
        }
        // 如果月份的数值小于10，则需要拼接0
        if (month < 10) {
            month = '0' + month
        }
        // 如果下拉框的下标设置为了2，则表明选择了日期，就需要验证日期格式
        if (that.data.index == 2 && !that.verifyDateFormat(that.data.inputValue)) {
            that.setData({
                modal: 'yes',
                tips: '输入的日期格式有错误,请参照:' + year + '-' + month + '-' + date
            });
            // 日期格式不合法 阻止提交
            return;
        }
        that.setData({
            page: 1
        });
        // 日期格式合法 提交查询数据
        wx.request({
          url: baseUrl + 'getAnnouncements.do',
          data: {
              page: 1,
              limit: that.data.limit,
              property: that.data.property[that.data.index],
              value: that.data.inputValue
          },
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          dataType: 'json',
          method: 'post',
          success: function (res) {
              console.log(res);
              if (res.data.announcements.length > 0) {
                  that.setData({
                      announcements: res.data.announcements,
                      count: res.data.count,
                      page: that.data.page + 1
                  });
                  that.setData({
                    pageNum: Math.ceil(that.data.count / that.data.limit)
                  });
                  // 将数据存入缓存
                  for (let i = 0; i < res.data.announcements.length; ++i) {
                      wx.setStorageSync(res.data.announcements[i].id, res.data.announcements[i]);
                  }
              }
          },
          fail: function (res) {
              console.log(res);
          }
        });
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-04-02
     * @description 跳转至公告详情界面
     */
    toDetail: function (e) {
        // 页面跳转并且携带被点击公告的ID
        console.log(e.currentTarget.dataset);
        wx.redirectTo({
          url: '../announcementDetail/announcementDetail?announcementId=' + e.currentTarget.dataset.announcementid,
        });
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
                  // 数据存入缓存
                  for (let i = 0; i < res.data.announcements.length; ++i) {
                      wx.setStorageSync(res.data.announcements[i].id, res.data.announcements[i]);
                  }
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
              if (res.data.announcements.length > 0) {
                  that.setData({
                      announcements: res.data.announcements,
                      count: res.data.count,
                      page: that.data.page + 1
                  });
                  that.setData({
                    pageNum: Math.ceil(that.data.count / that.data.limit)
                  });
                  // 数据存入缓存
                  for (let i = 0; i < res.data.announcements.length; ++i) {
                      wx.setStorageSync(res.data.announcements[i].id, res.data.announcements[i]);
                  }
              }
          },
          fail: function () {
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
              limit: that.data.limit,
              property: that.data.property[that.data.index],
              value: that.data.inputValue
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
                  // 数据存入缓存
                  for (let i = 0; i < res.data.announcements.length; ++i) {
                      wx.setStorageSync(res.data.announcements[i].id, res.data.announcements[i]);
                  }
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