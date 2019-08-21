//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    favList: []
  },

  toDetailsTap: function(e) {
    wx.navigateTo({
      url: "/pages/goods-detail/goods-detail?id=" + e.currentTarget.dataset.id
    })
  },
  home: function() {
    wx.switchTab({
      url: "/pages/index/index"
    })
  },
  onShow: function() {
    var that = this;
    if (app.globalData.iphone == true) {
      that.setData({
        iphone: 'iphone'
      })
    }
    wx.request({
      url: app.globalData.urls + '/shop/goods/fav/list',
      data: {
        openId: app.globalData.openid
      },
      success: function(res) {
        console.log(res)
        if (res.data.code == 0) {
          that.setData({
            favList: res.data.data,
            loadingMoreHidden: true
          });
        } else if (res.data.code == 500 || res.data.code == 404) {
          that.setData({
            favList: null,
            loadingMoreHidden: false
          });
        }
      }
    })
  }



})