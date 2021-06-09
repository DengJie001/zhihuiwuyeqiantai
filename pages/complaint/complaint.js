const baseUrl = 'https://codemata.club/bysj/';

Page({

    /**
     * 页面的初始数据
     */
    data: {
        images: [],
        imageFiles: [],
        client_id: 'Vh5xHSvGo6nK8axB5O9SuEY9',
        client_secret: '8qRYG6RxibowuG2RLRzRvZB5TYqGIxKa',
        access_token: '',
        category: ['选择类型', '投诉', '建议'],
        categoryIndex: 0,
        content: '',
        tips: ''
    },

    /**
     * @author DengJie
     * @param {*} url 请求地址
     * @param {*} data 请求参数
     * @date 2021-04-16
     * @description 封装同步请求
     */
    postData: function (url, data) {
        var that = this;
        return new Promise(function (resolve, reject) {
            wx.request({
              url: url,
              data: data,
              method: 'POST',
              header: {'Content-Type': 'application/x-www-form-urlencoded'},
              dataType: 'json',
              success: function (res) {
                  resolve(res);
              },
              fail: function (res) {
                  reject(res);
              }
            });
        });
    },

    uploadImages: function (url, data) {
        var that = this;
        return new Promise(function (resolve, reject) {
            wx.uploadFile({
              filePath: data,
              name: 'image',
              formData: {
                  userId: wx.getStorageSync('openid')
              },
              url: baseUrl + 'complaint/uploadComplaintImages.do',
              header: {'Content-Type': 'multipart/x-www-form-urlencoded'},
              dataType: 'json',
              success: function (res) {
                  resolve(res);
              },
              fail: function (res) {
                  reject(res);
              }
            });
        });
    },

    /**
     * @author DengJie
     * @date 2021-04-16
     * @description 获取用户输入的投诉/建议的内容
     */
    getInputValue: function (e) {
        var that = this;
        that.setData({
            content: e.detail.value
        });
    },

    /**
     * @author DengJie
     * @date 2021-04-16
     * @description 选择图片
     */
    chooseImages: function () {
        var that = this;
        wx.chooseImage({
          count: that.data.images.length == 4 ? 0 : 4 - that.data.images.length,
          sizeType: ['original', 'compressed'],
          sourceType: ['album', 'camera'],
          success: function (res) {
              if (that.data.images.length != 0) {
                  that.setData({
                      images: that.data.images.concat(res.tempFilePaths),
                      imageFiles: that.data.imageFiles.concat(res.tempFiles)
                  });
              } else {
                  that.setData({
                      images: res.tempFilePaths,
                      imageFiles: res.tempFiles
                  });
              }
          },
          fail: function (errorRes) {
              wx.showToast({
                title: '拉起图片失败',
                icon: 'none',
                duration: 3000,
                mask: true
              });
          }
        })
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-04-16
     * @description 预览图片
     */
    previewImages: function (e) {
        var that = this;
        wx.previewImage({
          urls: that.data.images,
          current: e.currentTarget.dataset.url
        });
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-04-16
     * @description 删除一张图片
     */
    deleteImage: function (e) {
        var that = this;
        wx.showModal({
            title: '提示',
            content: '是否确认删除',
            cancelText: '取消',
            confirmText: '确定',
            success: function (res) {
                that.data.images.splice(e.currentTarget.dataset.index, 1);
                that.setData({
                    images: that.data.images
                });
            }
        })
    },

    /**
     * @author DengJie
     * @date 2021-04-16
     * @description 监听下拉框变化
     */
    pickerChange: function (e) {
        var that = this;
        that.setData({
            categoryIndex: e.detail.value
        });
    },

    /**
     * @author DengJie
     * @data 2021-04-16
     * @description 提交投诉/建议
     */
    submit: async function () {
        var that = this;
        var sensitiveContent;
        var sensitiveImages = [];
        var tips = '';
        var canSubmit = true;
        var imagesPath = null;
        var userId = wx.getStorageSync('openid');
        // 验证用户是否选择了提交类型
        if (that.data.categoryIndex == 0) {
            wx.showModal({
                title: '提示',
                content: '请选择一个提交类型',
                confirmText: '明白了',
                showCancel: false
            });
            return;
        }

        // 验证用户是否输入了内容
        if (that.data.content == '') {
            wx.showModal({
                title: '提示',
                content: '请详细描述投诉/建议的内容!',
                showCancel: false,
                confirmText: '明白了!'
            });
            return;
        }
        wx.showLoading({
          title: '提交中',
          mask: true
        });
        sensitiveContent = await that.postData('https://aip.baidubce.com/rest/2.0/solution/v1/text_censor/v2/user_defined?access_token=' + that.data.access_token, {text: that.data.content});
        // 如果用户上传了图片 那么就对图片也进行图片检测敏感内容
        if (that.data.images.length > 0) {
            for (let i = 0; i < that.data.images.length; ++i) {
                var base64Image = wx.getFileSystemManager().readFileSync(that.data.images[i], 'base64');
                var temp = await that.postData('https://aip.baidubce.com/rest/2.0/solution/v1/img_censor/v2/user_defined?access_token=' + that.data.access_token, {image: base64Image});
                sensitiveImages.push(temp);
            }
        }
        if (sensitiveContent.data.conclusionType == 2) {
            for (let i = 0; i < sensitiveContent.data.data.length; ++i) {
                tips += (sensitiveContent.data.data[i].msg + '\n');
                canSubmit = false;
            }
        }
        for (let i = 0; i < sensitiveImages.length; ++i) {
            if (sensitiveImages[i].data.conclusionType == 2) {
                for (let j = 0; j < sensitiveImages[i].data.data.length; ++j) {
                    tips += (sensitiveImages[i].data.data[j].msg + '\n');
                }
                canSubmit = false;
            }
        }
        // canSubmit为false则证明有不合规字符和图片 打断提交
        if (!canSubmit) {
            wx.hideLoading({});
            that.setData({
                modal: 'yes',
                tips: tips
            });
            return;
        }

        // 先将图片上传到后端服务器
        if (that.data.images.length != 0) {
            imagesPath = '';
            for (let i = 0; i < that.data.images.length; ++i) {
                var temp = await that.uploadImages(
                    baseUrl + 'complaint/uploadComplaintImages.do',
                    that.data.images[i]
                );
                // 将所有图片链接使用'+'进行拼接 以存入数据库中
                if (temp.data != "error") {
                    imagesPath = imagesPath + "+" + temp.data;
                }
            }
        }
        var submitRes = await that.postData(
            baseUrl + 'complaint/addComplaint.do',
            {
                userId: userId,
                category: that.data.category[that.data.categoryIndex],
                pictures: imagesPath,
                content: that.data.content
            }
        );
        wx.hideLoading({});
        if (submitRes.data.msgId == 1) {
            wx.showToast({
              title: '提交成功',
              icon: 'success',
              duration: 2000,
              mask: true
            });
            setTimeout(function () {
                wx.switchTab({
                  url: '../index/index',
                });
            }, 2000);
        } else {
            wx.showToast({
              title: '提交失败',
              icon: 'error',
              duration: 2000,
              mask: true
            });
        }
    },

    /**
     * @author DengJie
     * @date 2021-04-16
     * @description 关闭提示框
     */
    hideModal: function () {
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
        // 获取API调用的access_token
        wx.request({
            url: 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=' + that.data.client_id + '&client_secret=' + that.data.client_secret,
            method: 'post',
            dataType: 'json',
            success: function (res) {
                that.setData({
                    access_token: res.data.access_token
                });
            },
            fail: function (errorRes) {
                wx.showToast({
                  title: '信息拉取失败',
                  icon: 'none',
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

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})