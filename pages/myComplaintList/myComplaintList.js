const baseUrl = 'https://codemata.club/bysj/';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        complaintList: [],
        userId: '',
        limit: 10,  // 每页显示条数
        page: 1, // 当前页数
        count: 0,
        totalPages: 0,
        currentDeleteId: ''
    },

    /**
     * @author DengJie
     * @param {*} url 请求地址
     * @param {*} data 请求参数
     * @date 2021-04-19
     * @description 封装同步函数
     */
    useSync: function (url, data) {
        var that = this;
        return new Promise(function (resolve, reject) {
            wx.request({
              url: url,
              data: data,
              method: 'post',
              dataType: 'json',
              header: {'Content-Type': 'application/x-www-form-urlencoded'},
              success: function (res) {
                  resolve(res);
              },
              fail: function (errorRes) {
                  reject(errorRes);
              }
            });
        });
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-04-19
     * @description 打开弹窗询问用户是否确认删除
     */
    deleteThis: function (e) {
        var that = this;
        that.setData({
            showModal: 'yes',
            currentDeleteId: e.currentTarget.dataset.id
        });
    },

    toDetail: function (e) {
        var that = this;
        // 数据存入缓存 避免二次请求
        try {
            wx.setStorageSync(e.currentTarget.dataset.complaintid, that.data.complaintList[e.currentTarget.dataset.index]);
        } catch (e) {
            console.log(e);
        }
        wx.navigateTo({
          url: '../complaintDetail/complaintDetail?id=' + e.currentTarget.dataset.complaintid,
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
     * @author DengJie
     * @param {*} e 
     * @date 2021-04-19
     * @description 取消删除并且关闭弹窗
     */
    cancelAndHide: function (e) {
        var that = this;
        that.setData({
            showModal: 'no'
        });
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-04-19
     * @description 确认删除并且关闭弹窗
     */
    comfirmAndHide: async function (e) {
        var that = this;
        // TODO 删除!
        var tempComplaints = [];
        // 询问是否删除

        // 删除页面结构
        for (let i = 0; i < that.data.complaintList.length; ++i) {
            if (that.data.complaintList[i].id == e.currentTarget.dataset.id) {
                continue;
            } else {
                tempComplaints.push(that.data.complaintList[i]);
            }
        }
        that.setData({
            complaintList: tempComplaints
        });
        // 删除缓存 如果存在的话
        try {
            wx.removeStorageSync(e.currentTarget.dataset.id);
        } catch (e) {
            wx.showToast({
              title: '缓存异常',
              icon: 'error',
              duration: 2000,
              mask: true
            });
        }
        // 向服务端发起请求删除该条记录
        var res = await that.useSync(
            baseUrl + 'complaint/deleteComplaint.do',
            {
                id: that.data.currentDeleteId,
                userId: wx.getStorageSync('openid')
            }
        );
        that.hideModal();
        console.log(res);
        if (res.data.msgId == 1) {
            wx.showToast({
              title: res.data.msgContent,
              icon: 'success',
              duration: 2000,
              mask: true
            });
            console.log(1);
        } else {
            wx.showToast({
              title: '删除失败',
              icon: 'error',
              duration: 2000,
              mask: true
            });
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: async function (options) {
        var that = this;
        var res = {};
        try {
            that.setData({
                userId: wx.getStorageSync('openid')
            })
        } catch (e) {
            console.log(e);
            wx.showToast({
              title: '缓存异常!',
            });
        }
        res = await that.useSync(
            baseUrl + 'complaint/userGetAllComplaints.do',
            {
                userId: that.data.userId,
                limit: that.data.limit,
                page: that.data.page
            });
        if (res.data.code == 0) {
            that.setData({
                count: res.data.count,
                totalPages: Math.ceil(res.data.count / that.data.limit),
                complaintList: res.data.complaints
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
     * 刷新页面
     */
    onPullDownRefresh: function () {
        var that = this;
        wx.startPullDownRefresh({
          success: (res) => {
            wx.request({
                url: baseUrl + 'complaints/userGetAllComplaints.do',
                data: {
                    userId: that.data.userId,
                    page: 1,
                    limit: that.data.limit
                },
                method: 'POST',
                dataType: 'json',
                header: {'Content-Type': 'application/x-www-form-urlencoded'},
                success: function (res) {
                    if (res.data.code == 0) {
                        that.setData({
                            count: res.data.count,
                            totalPages: Math.ceil(res.data.count / that.data.limit),
                            complaintList: res.data.complaintList
                        });
                    }
                    wx.stopPullDownRefresh({});
                },
                fail: function (res) {
                    wx.showToast({
                      title: '刷新失败!',
                      icon: 'error',
                      duration: 2000,
                      mask: true
                    });
                    wx.stopPullDownRefresh({});
                }
              });
          },
        })
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: async function () {
        var that = this;
        var complaints = that.data.complaintList;
        if (that.data.page + 1 > that.data.totalPages) {
            wx.showToast({
              title: '没有更多数据',
              icon: 'none',
              duration: 2000,
              mask: true
            });
            return;
        }
        var res = await that.useSync(
            baseUrl + 'complaint/userGetAllComplaints.do',
            {
                limit: that.data.limit,
                page: that.data.page + 1,
                userId: wx.getStorageSync('openid')
            }
        );
        if (res.data.code == 0) {
            for (let i = 0; i < res.data.complaints.length; ++i) {
                complaints.push(res.data.complaints[i]);
            }
        }
        that.setData({
            complaintList: complaints,
            page: that.data.page + 1
        });
        console.log(that.data.complaintList);
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})