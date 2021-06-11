const md5 = require('../../utils/md5.js');
const baseUrl = 'https://codemata.club/bysj/';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        placeInfo: {},
        tips: '',    // 提示信息
        startDate: '2021-04-09',
        endDate: '2021-04-09',
        userId: '',
        textAreaValue: '',
        cost: 0,
        aid: '18187',
        name: '物业维修支付',
        pay_type: 'native',
        price: '',
        notify_url: 'http://codemata.club:8080/bysj/pay/addPlaceApplicationPayment.do',
        more: '',
        secret: 'cdcc2ed5c2434790abe36f0a037c5a23',
        order_id: '',
        payCode: ''
    },

    /**
     * @author DengJie
     * @param {*} url 请求地址
     * @param {*} data 请求参数
     * @date 2021-04-21
     * @description 封装同步函数
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
              fail: function (errorRes) {
                  reject(errorRes);
              }
            });
        });
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-04-08
     * @description 预览图片
     */
    previewPicture: function (e) {
        var that = this;
        // 预览图片
        wx.previewImage({
          urls: that.data.placeInfo.placePicture,
        });
    },

    /**
     * @author DengJie
     * @date 2021-04-09
     * @description 申请使用当前场地
     */
    apply: function () {
        var that = this;
        var placeInfo = that.data.placeInfo;
        if (placeInfo.placeStatus == '使用中' || placeInfo.placeStatus == '维护中' || placeInfo.placeStatus == '审核中') {
            that.setData({
                modal: 'yes',
                tips: '当前场地正在' + placeInfo.placeStatus + ',暂时无法使用!'
            });
        } else {
            that.setData({
                showApplicationForm: 'yes'
            });
        }
    },

    /**
     * @author DengJie
     * @date 2021-04-09
     * @description 关闭提示框
     */
    hideModal: function () {
        var that = this;
        that.setData({
            modal: 'no',
            showApplicationForm: 'no',
            showQrCode: 'no'
        });
    },

    /**
     * @author DengJie
     * @date 2021-04-22
     * @description 跳转到支付步骤界面
     */
    toPayStep: function () {
        wx.navigateTo({
          url: '../payStep/payStep',
        });
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-04-09
     * @description 选择场地开始使用时间
     */
    startDateChange: function (e) {
        var that = this;
        that.setData({
            startDate: e.detail.value
        });
        var cost = that.calculatePaidCost(that.data.startDate, that.data.endDate);
        that.setData({
            cost: cost
        });
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-04-09
     * @description 选择场地使用结束时间
     */
    endDateChange: function (e) {
        var that = this;
        that.setData({
            endDate: e.detail.value
        });
        var cost = that.calculatePaidCost(that.data.startDate, that.data.endDate);
        that.setData({
            cost: cost
        });
    },

    /**
     * @author DengJie
     * @param {*} start 场地开始使用时间
     * @param {*} end  场地使用结束的时间
     * @date 2021-04-09
     * @description 验证场地使用的起始时间是否正确,即开始时间不能大于结束时间
     */
    verifyDate: function (start, end) {
        if (start >= end) {
            return false;
        } else {
            return true;
        }
    },

    /**
     * @author DengJie
     * @Date 2021-04-12
     * @description 获取文本域中用户输入的值
     */
    getTextAreaValue: function (e) {
        var that = this;
        that.setData({
            textAreaValue: e.detail.value
        });
    },

    /**
     * @author DengJie
     * @param {*} startDate 费用计算的开始时间 
     * @param {*} endDate 费用计算的结束时间
     * @date 2021-04-12
     * @description 计算申请场地需要的费用,含头不含尾
     */
    calculatePaidCost: function (startDate, endDate) {
        var that = this;
        var start = new Date(startDate);
        var end = new Date(endDate);
        if (start >= end) {
            return 0;
        }
        var days = (end - start) / (1000 * 60 * 60 * 24);
        return days * that.data.placeInfo.placePrice;
    },

    /**
     * @author DengJie
     * @date 2021-04-09
     * @description 提交场地申请
     */
    submitApplication: async function () {
        var that = this;
        var placeApplication = {
            placeId: that.data.placeInfo.placeId,
            applicationUser: that.data.userId,
            applicationReason: that.data.textAreaValue,
            beginDate: that.data.startDate,
            endDate: that.data.endDate,
            applicationNote: '无'
        };
        // 如果起始时间不正确 阻止提交
        if (!that.verifyDate(that.data.startDate, that.data.endDate)) {
            that.hideModal();
            that.setData({
                modal: 'yes',
                tips: '开始时间不能在结束时间之后'
            });
            return;
        }
        if (placeApplication.applicationReason == '') {
            that.setData({
                showApplicationForm: 'no',
                modal: 'yes',
                tips: '申请原因不允许为空'
            });
            return;
        }
        // 提交信息
        var res = await that.useSync(
            baseUrl + 'PlaceApplication/savePlaceApplication.do',
            {
                placeApplication: JSON.stringify(placeApplication),
                userId: wx.getStorageSync('openid')
            }
        );
        if (res.data.status == 'success') {
            that.setData({
                showApplicationForm: 'no',
                order_id: res.data.data.applicationId,
                price: res.data.data.cost + '',
                more: '场地申请费用支付'
            });
        } else {
            wx.showToast({
              title: '提交失败',
              icon: 'none',
              duration: 2000,
              mask: true
            });
        }
        // 获取支付二维码
        var qrCode = await that.useSync(
            'https://xorpay.com/api/pay/18187',
            {
                userId: wx.getStorageSync('openid'),
                name: that.data.name,
                pay_type: that.data.pay_type,
                price: that.data.price,
                order_id: that.data.order_id,
                notify_url: that.data.notify_url,
                more: that.data.more,
                expire: 60 * 60 * 24 * 365,
                sign: md5.md5(that.data.name + that.data.pay_type + that.data.price + that.data.order_id + that.data.notify_url + that.data.secret)
            }
        );
        if (qrCode.data.status == 'ok') {
            that.setData({
                showQrCode: 'yes',
                payCode: 'https://xorpay.com/qr?data=' + qrCode.data.info.qr
            });
            var qrRes = await that.useSync(
                baseUrl + 'QrCode/addQrCode.do',
                {
                    codeId: that.data.order_id,
                    qrCode: qrCode.data.info.qr
                }
            );
        } else {
            wx.showToast({
              title: '支付异常!',
              icon: 'none',
              duration: 2000,
              mask: true
            });
            return;
        }
        // 修改场地状态
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        var year = new Date().getFullYear();
        var month = new Date().getMonth() + 1;
        var date = new Date().getDate();
        if (month <= 9) {
            month = '0' + month
        }
        try {
            that.setData({
                placeInfo: wx.getStorageSync(options.placeId),
                userId: wx.getStorageSync('openid'),
                startDate: year + '-' + month + '-' + date,
                endDate: year + '-' + month + '-' + date
            });
        } catch (e) {
            wx.showToast({
              title: '获取缓存异常',
              icon: 'error',
              duration: 2000,
              mask: true
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

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})