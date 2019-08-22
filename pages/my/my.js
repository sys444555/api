const app = getApp()
Page({
  data: {
    balance: 0,
    freeze: 0,
    score: 0,
    score_sign_continuous: 0,
    tabClass: ["", "", "", "", ""],
    noplay: 0,
    notransfer: 0,
    noconfirm: 0,
    noreputation: 0,
    noticeList: {
    
    }
  },
  onLoad: function() {
    var that = this;
    that.getUserApiInfo();
    that.getUserAmount();
    that.getInfo();
    wx.request({
      url: app.globalData.urls + '/api/notice/list',
      data: {
        type: 'notice'
      },
      success: function(res) {
        if (res.data.code == 0) {
          that.setData({
            noticeList: res.data.data
          });
        }
      }
    });
  },
  onShow() {
    this.getUserApiInfo();
    this.getUserAmount();
    this.getInfo();
    this.getUserInfo();
    //更新订单状态
    var that = this;
    wx.request({
      url: app.globalData.urls + '/api/order/statistics',
      data: {
        opneId: app.globalData.openid
      },
      success: function(res) {
        if (res.data.code == 0 && res.data.data.length > 0) {
          if (res.data.data[0].noplay > 0) {
            wx.setTabBarBadge({
              index: 3,
              text: '' + res.data.data[0].noplay + ''
            })
          } else {
            wx.removeTabBarBadge({
              index: 3,
            })
          }
          that.setData({
            noplay: res.data.data[0].noplay,
            notransfer: res.data.data[0].notransfer,
            noconfirm: res.data.data[0].noconfirm,
            noreputation: res.data.data[0].noreputation
          });
        }
      }
    })
    wx.getStorage({
      key: 'shopCarInfo',
      success: function(res) {
        if (res.data) {
          that.data.shopCarInfo = res.data
          if (res.data.shopNum > 0) {
            wx.setTabBarBadge({
              index: 2,
              text: '' + res.data.shopNum + ''
            })
          } else {
            wx.removeTabBarBadge({
              index: 2,
            })
          }
        } else {
          wx.removeTabBarBadge({
            index: 2,
          })
        }
      }
    })
  },
  getUserApiInfo: function() {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/user/detail',
      data: {
        openId: app.globalData.openid
      },
      success: function(res) {
        if (res.data.code == 0) {
          that.setData({
            apiUserInfoMap: res.data.data
          });
        }
      }
    })
  },
  getUserAmount: function() {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/api/user/amount',
      data: {
        openId: app.globalData.openid
      },
      success: function(res) {
        if (res.data.code == 0) {
          that.setData({
            balance: res.data.data.balance,
            freeze: res.data.data.freeze,
            score: res.data.data.score
          });
        }
      }
    })
  },
  getInfo: function() {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/api/list',
      data: {
        key: "mallinfo"
      },
      success: function(res) {
        if (res.data.code == 0) {
          that.setData({
            getInfo: res.data.data[0].value
          });
        }
      }
    })
  },

  getUserInfo: function(cb) {
    var that = this
    wx.login({
      success: function() {
        wx.getUserInfo({
          success: function(res) {
            that.setData({
              userInfo: res.userInfo
            });
          }
        })
      }
    })
  },
  relogin: function() {
    var that = this;
    wx.authorize({
      scope: 'scope.userInfo',
      success() {
        app.globalData.token = null;
        app.login();
        wx.showModal({
          title: '提示',
          content: '重新登陆成功',
          showCancel: false,
          success: function(res) {
            if (res.confirm) {
              that.onShow();
            }
          }
        })
      },
      fail(res) {
        wx.openSetting({});
      }
    })
  },
 
})