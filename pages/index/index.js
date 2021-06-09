// index.js
// 获取应用实例
const app = getApp()

Page({
  data: {
    cardCur: 0,
    swiperList: [{
      id: 0,
      type: 'image',
      url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big84000.jpg'
    }, {
      id: 1,
        type: 'image',
        url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big84001.jpg',
    }, {
      id: 2,
      type: 'image',
      url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big39000.jpg'
    }, {
      id: 3,
      type: 'image',
      url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big10001.jpg'
    }, {
      id: 4,
      type: 'image',
      url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big25011.jpg'
    }, {
      id: 5,
      type: 'image',
      url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big21016.jpg'
    }, {
      id: 6,
      type: 'image',
      url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big99008.jpg'
    }],
  },
  // 页面跳转
  goto: function (e) {
    var url = '';
    // TODO 完成页面跳转
    switch(e.currentTarget.dataset.tag) {
      case '社区公告':
        url = '../announcement/announcement';
        break;
      case '场地申请':
        url = '../placeApplication/placeApplication';
        break;
      case '缴费中心':
        url = '../payment/payment';
        break;
      case '小区活动':
        url = '../activities/activities';
        break;
      case '物业报修':
        url = '../repair/repair';
        break;
      case '投诉建议':
        url = '../complaint/complaint';
        break;
      case '今日油价':
        url = '../oilPrice/oilPrice';
        break;
      case '天气预报':
        url = '../weather/weather';
        break;
      case '防疫查询':
        url = '../epidemic/epidemic'
        break;
      case '失物招领':
        url = '../theLost/theLost'
    }
    wx.navigateTo({
      url: url,
    });
  },
  // 事件处理函数
  onLoad() {
  },
})
