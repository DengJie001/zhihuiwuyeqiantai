// pages/epidemic/epidemic.js
Page({

    /**
     * 页面的初始数据
     */
    data: {
        tabName: ['风险地区', '核酸检测机构'],
        tabCur: 0,
        scrollLeft: 0,
        isRegionHidden: false,
        isOrganizationHidden: true,
        regions: [],
        multiIndex: [0, 0],
        citys: [],
        cityInfos: [],
        organizations: [],
        highRiskRegions: [],
        middleRiskRegions: [],
        infoUpdateTime: ''
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
                isRegionHidden: false,
                isOrganizationHidden: true
            });
        } else if (e.currentTarget.dataset.id == 1) {
            that.setData({
                isOrganizationHidden: false,
                isRegionHidden: true
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
     * @date 2021-04-25
     * @description 监听地区选择框首列变化
     */
    multiChange: function (e) {
        var that = this;
        that.setData({
            multiIndex: e.detail.value
        });
        // 查询该地的核算检测机构
        console.log();
        wx.request({
          url: 'https://apis.juhe.cn/springTravel/hsjg',
          data: {
              key: '5758542001e82e57ea719945c2ae018a',
              city_id: that.data.cityInfos[that.data.multiIndex[0]][that.data.multiIndex[1]].city_id
          },
          method: 'post',
          dataType: 'json',
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          success: function (res) {
              if (res.data.error_code == 0) {
                  that.setData({
                      organizations: res.data.result.data
                  });
              } else {
                  wx.showToast({
                    title: '查询失败',
                    icon: 'error',
                    duration: 3000,
                    mask: true
                  });
              }
          },
          fail: function (res) {
              wx.showToast({
                title: '查询失败',
                icon: 'error',
                duration: 3000,
                mask: true
              });
          }
        });
    },

    /**
     * @author DengJie
     * @param {*} e 
     * @date 2021-04-25
     * @description 监听下拉框第二列变化
     */
    multiColumnChange: function (e) {
        var that = this;
        if (e.detail.column == 0) {
            that.setData({
                ['multiIndex[' + 0 + ']']: e.detail.value,
                ['regions[' + 1 + ']']: that.data.citys[e.detail.value],
            });
        } else if (e.detail.column == 1) {
            that.setData({
                ['multiIndex[' + 1 + ']']: e.detail.value,
                ['regions[' + 1 + ']']: that.data.citys[that.data.multiIndex[0]],
            });
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var that = this;
        // 获取支持查询疫情信息的地址
        wx.request({
          url: 'https://apis.juhe.cn/springTravel/citys',
          data: {
              key: '5758542001e82e57ea719945c2ae018a'
          },
          method: 'POST',
          dataType: 'json',
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          success: function (res) {
              if (res.data.error_code == 0) {
                  var tempRegions = [[], []];
                  var tempCitys = [];
                  var infos = [];
                  for (let i = 0; i < res.data.result.length; ++i) {
                      tempRegions[0].push(res.data.result[i].province);
                  }
                  for (let i = 0; i < res.data.result[0].citys.length; ++i) {
                      tempRegions[1].push(res.data.result[0].citys[i].city);
                  }
                  for (let i = 0; i < res.data.result.length; ++i) {
                      var temp = [];
                      var tempinfos = [];
                      for (let j = 0; j < res.data.result[i].citys.length; ++j) {
                          temp.push(res.data.result[i].citys[j].city);
                          tempinfos.push(res.data.result[i].citys[j]);
                      }
                      tempCitys.push(temp);
                      infos.push(tempinfos);
                  }
                  that.setData({
                      regions: tempRegions,
                      citys: tempCitys,
                      cityInfos: infos
                  });
              }
          },
          fail: function (res) {
              console.log(res);
          }
        });
        // 获取风险地区地址
        wx.request({
          url: 'https://apis.juhe.cn/springTravel/risk',
          data: {
              key: '5758542001e82e57ea719945c2ae018a'
          },
          method: 'POST',
          dataType: 'json',
          header: {'Content-Type': 'application/x-www-form-urlencoded'},
          success: function (res) {
              console.log(res.data.result);
              if (res.data.error_code == 0) {
                  that.setData({
                      infoUpdateTime: res.data.result.updated_date,
                      highRiskRegions: res.data.result.high_list,
                      middleRiskRegions: res.data.result.middle_list
                  });
              } else {
                  wx.showToast({
                    title: '查询失败',
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