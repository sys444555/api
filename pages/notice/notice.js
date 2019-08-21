var app = getApp();
var WxParse = require('../../wxParse/wxParse.js');
Page({
  data: {
    notice:{
      title:213
    }
  },
  onLoad: function (e) {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/notice/detail',
      data: {
        id: e.id
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            notice: res.data.data
          });
          WxParse.wxParse('article', 'html', res.data.data.content, that, 5);
        }
      }
    })
  }
})