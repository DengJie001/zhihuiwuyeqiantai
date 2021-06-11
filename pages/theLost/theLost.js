const baseUrl = 'https://codemata.club/bysj/'
const app = getApp();

Page({

    /**
     * 页面的初始数据
     */
    data: {
        tabCur: 0,
        scrollLeft: 0,
        tabName: ['失物招领列表', '发布失物招领'],
        isIssueHidden: true,
        isListHidden: false,
        images: [],
        client_id: 'Vh5xHSvGo6nK8axB5O9SuEY9',
        client_secret: '8qRYG6RxibowuG2RLRzRvZB5TYqGIxKa',
        access_token: '',
        currentTime: 91,
        userPhoneNumber: '',
        verifyBtnText: '验证码',
        categories: ['失物招领', '寻物启事'],
        categoryIndex: 0,
        itemDescription: '',
        lostItems: [],
        limit: 10,
        page: 1,
        pages: 1,
        complaintInfo: ['引人不适的图片或文本', '政治敏感内容', '其他内容', '宗教敏感'],
        complaintCategory: '其他'
    },

    /**
     * @author DengJie
     * @param {*} url 请求地址
     * @param {*} data 请求参数
     * @date 2021-04-29 
     * @description 封装同步请求
     */
    useSync: function (url, data) {
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

    syncUploadImage: function (url, data) {
        return new Promise(function (resolve, reject) {
            wx.uploadFile({
              filePath: data,
              name: 'picture',
              url: url,
              formData: {
                  userId: wx.getStorageSync('openid')
              },
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
     * @param {*} e 
     * @date 2021-05-03
     * @description 预览失物招领图片
     */
    previewImage: function (e) {
        var that = this;
        wx.previewImage({
          urls: that.data.lostItems[e.currentTarget.dataset.itemindex].itemPicture,
          current: e.currentTarget.dataset.firsturl
        });
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @description 设置展示条件
     */
    setCondition: function (e) {
        var that = this;
        var index = 1;
        var msg = '';
        switch(e.currentTarget.dataset.msg) {
            case '未解决':
                index = 1;
                for (let i = 0; i < that.data.lostItems.length; ++i) {
                    if (that.data.lostItems[i].itemStatus == '未解决') {
                        that.setData({
                            ['lostItems[' + i + '].hidden']: false
                        });
                    } else {
                        that.setData({
                            ['lostItems[' + i + '].hidden']: true
                        });
                    }
                }
                break;
            case '全部':
                index = 2;
                for (let i = 0; i < that.data.lostItems.length; ++i) {
                    that.setData({
                        ['lostItems[' + i + '].hidden']: false
                    });
                }
                break;
            case '失物招领':
                index = 3;
                for (let i = 0; i < that.data.lostItems.length; ++i) {
                    if (that.data.lostItems[i].itemCategory == '失物招领') {
                        that.setData({
                            ['lostItems[' + i + '].hidden']: false
                        });
                    } else {
                        that.setData({
                            ['lostItems[' + i + '].hidden']: true
                        });
                    }
                }
                break;
            case '寻物启事':
                index = 4;
                for (let i = 0; i < that.data.lostItems.length; ++i) {
                    if (that.data.lostItems[i].itemCategory == '寻物启事') {
                        that.setData({
                            ['lostItems[' + i + '].hidden']: false
                        });
                    } else {
                        that.setData({
                            ['lostItems[' + i + '].hidden']: true
                        });
                    }
                }
                break;
        };
        that.setData({
            btnSelected: index
        });
    },

    /**
     * @author DengJie
     * @date 2021-04-29
     * @description 关闭弹窗
     */
    hideModal: function () {
        var that = this;
        that.setData({
            showTips: 'no',
            showRadio: 'no'
        });
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-04-16
     * @description 切换tab
     */
    tabSelect: function (e) {
        var that = this;
        if (e.currentTarget.dataset.id == 0) {
            that.setData({
                isListHidden: false,
                isIssueHidden: true
            });
        } else if (e.currentTarget.dataset.id == 1) {
            that.setData({
                isIssueHidden: false,
                isListHidden: true
            });
        }
        that.setData({
            tabCur: e.currentTarget.dataset.id,
            scrollLeft: (e.currentTarget.dataset.id-1) * 60,
        })
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-04-16
     * @description 获取输入框的值
     */
    getInputValue: function (e) {
        var that = this;
        that.setData({
            itemDescription: e.detail.value
        });
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-04-26
     * @description 监听下拉框变化
     */
    categoryChange: function (e) {
        var that = this;
        that.setData({
            categoryIndex: e.detail.value
        });
    },

    /**
     * @author DengJie
     * @date 2021-04-16
     * @description 选择失物招领中要上传的照片
     */
    chooseImages: function () {
        var that = this;
        wx.chooseImage({
          count: that.data.images.length == 4 ? 0 : 4 - that.data.images.length , // 最大允许的上传数量
          sizeType: ['original', 'compressed'], // 图片上传质量 原图和压缩图
          sourceType: ['album', 'camera'],  // 图片来源 图库和相机拍摄
          success: function (res) {
              if (that.data.images.length != 0) {
                  that.setData({
                      images: that.data.images.concat(res.tempFilePaths)
                  });
              } else {
                  that.setData({
                      images: res.tempFilePaths
                  });
              }
          },
          fail: function (res) {}
        });
    },

    /**
     * @author DengJie
     * @date 2021-04-29
     * @description 提交失物招领信息
     */
    submit: async function () {
        var that = this;
        var canSubmit = true;
        var itemPicture = '';
        var tips = '';
        var sensitiveText;
        // 数据格式/内容合法性验证
        if (that.data.itemDescription == '') {
            tips += '详细描述不允许为空\n';
            canSubmit = false;
        }
        if (that.data.images.length == 0) {
            tips += '请上传至少一张图片\n';
            canSubmit = false;
        }
        if (!canSubmit) {
            that.setData({
                showTips: 'yes',
                tips: tips
            });
            return;
        }
        // 验证图片或文字是否有敏感内容
        wx.showLoading({
          title: '提交中',
          mask: true
        });
        sensitiveText = await that.useSync(
            'https://aip.baidubce.com/rest/2.0/solution/v1/text_censor/v2/user_defined?access_token=' + that.data.access_token, 
            {text: that.data.itemDescription}
        );
        if (sensitiveText.data.conclusionType == 2) {
            for (let i = 0; i < sensitiveText.data.data.length; ++i) {
                tips += (sensitiveText.data.data[i].msg + '\n');
            }
            canSubmit = false;
        }
        for (let i = 0; i < that.data.images.length; ++i) {
            var base64Image = wx.getFileSystemManager().readFileSync(that.data.images[i], 'base64');
            var temp = await that.useSync(
            'https://aip.baidubce.com/rest/2.0/solution/v1/img_censor/v2/user_defined?access_token=' + that.data.access_token, 
            {image: base64Image});
            if (temp.data.conclusionType == 2) {
                tips += (temp.data.data.msg + '\n');
                canSubmit = false;
            }
        }
        if (!canSubmit) {
            that.setData({
                tips: tips,
                showTips: 'yes'
            });
            wx.hideLoading({});
            return;
        }
        // 先提交图片
        if (that.data.images.length != 0) {
            for (let i = 0; i < that.data.images.length; ++i) {
                var submitPicRes = await that.syncUploadImage(
                    baseUrl + 'LostItem/uploadPicture.do',
                    that.data.images[i]
                );
                if (submitPicRes.data != 'error') {
                    itemPicture = itemPicture + '+' + submitPicRes.data
                } else {
                    wx.showToast({
                      title: '上传第' + i + '张图片时出错,请重试!',
                      icon: 'none',
                      duration: 3000,
                      mask: true
                    });
                    wx.hideLoading({});
                    return;
                }
            }
        }
        // 提交文本信息和图片链接
        var submitRes = await that.useSync(
            baseUrl + 'LostItem/addLostItem.do',
            {
                userId: wx.getStorageSync('openid'),
                itemDescription: that.data.itemDescription,
                itemPicture: itemPicture,
                itemCategory: that.data.categories[that.data.categoryIndex]
            }
        );
        wx.hideLoading({});
        if (submitRes.data.status == 'success') {
            wx.showToast({
              title: '提交成功',
              icon: 'success',
              duration: 3000,
              mask: true
            });
        } else if (submitRes.data.status == 'exception') {
            wx.showToast({
              title: '服务端异常!',
              icon: 'error',
              duration: 3000,
              mask: true
            });
        } else {
            wx.showToast({
              title: '预期之外的错误',
              icon: 'none',
              duration: 3000,
              mask: true
            });
        }
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-05-07
     * @description 选择举报的类别
     */
    selectComplaintCategory: function (e) {
        var that = this;
        that.setData({
            complaintCategory: e.detail.value
        });
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-05-07
     * @description 用户举报失物招领信息
     */
    userComplain: function (e) {
        var that = this;
        that.setData({
            showRadio: 'yes',
            currentSelectedIndex: e.currentTarget.dataset.index
        });
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-05-07
     * @description 提交关于失物招领的举报
     */
    submitComplain: function (e) {
        var that = this;
        wx.request({
          url: baseUrl + 'LostItemComplaint/addComplaint.do',
          data: {
              userId: wx.getStorageSync('openid'),
              lostItemId: that.data.lostItems[that.data.currentSelectedIndex].id,
              complaintCategory: that.data.complaintCategory
          },
          method: 'POST',
          dataType: 'json',
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          success: function (res) {
              if (res.data.status == 'success') {
                that.setData({
                    showRadio: 'no'
                });
                  wx.showToast({
                    title: '举报成功',
                    icon: 'success',
                    duration: 3000,
                    mask: true
                  });
              } else {
                  wx.showToast({
                    title: '提交失败',
                    icon: 'none',
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
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        // 获取内容和图片审核的token
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
              console.log(errorRes);
          }
        });

        // 获取所有的失物招领信息
        wx.request({
          url: baseUrl + 'LostItem/getAllLostItems.do',
          data: {
              userId: wx.getStorageSync('openid'),
              limit: that.data.limit,
              page: that.data.page
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
          url: baseUrl + 'LostItem/getAllLostItems.do',
          data: {
              userId: wx.getStorageSync('openid'),
              limit: that.data.limit,
              page: that.data.page + 1
          },
          method: 'POST',
          dataType: 'json',
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          success: function (res) {
              if (res.data.status == 'success') {
                  var list = that.data.lostItems;
                  for (let i = 0; i < res.data.info.items.length; ++i) {
                      res.data.info.items[i].itemPicture = res.data.info.items[i].itemPicture.split('+');
                      res.data.info.items[i].hidden = false;
                      list.push(res.data.info.items[i])
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
                title: '预期之外的错误',
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