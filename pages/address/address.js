//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    addressList: [],
    provinceStr: '',
    cityStr: '',
    areaStr: ''
  },

  selectTap: function(e) {
    var id = e.currentTarget.dataset.id;
    wx.request({
      url: app.globalData.urls + '/api/user/shipping-address/updateAddressDefault',
      data: {
        id: id,
        isDefault: 1
      },
      success: (res) => {
        wx.navigateBack({})
      }
    })
  },

  addAddess: function() {
    wx.navigateTo({
      url: "/pages/address-add/address-add"
    })
  },

  editAddess: function(e) {
    wx.navigateTo({
      url: "/pages/address-add/address-add?id=" + e.currentTarget.dataset.id
    })
  },

  onLoad: function() {
    var that = this;
    if (app.globalData.iphone == true) {
      that.setData({
        iphone: 'iphone'
      })
    }
  },
  onShow: function() {
    this.initShippingAddress();
  },
  initShippingAddress: function() {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/api/user/shipping-address/list',
      data: {
        openId: app.globalData.openid
      },
      success: (res) => {
        if (res.data.code == 0) {
          that.setData({
            addressList: res.data.data,
            loadingMoreHidden: true
          });
        } else if (res.data.code == 500) {
          that.setData({
            addressList: null,
            loadingMoreHidden: false
          });
        }
      }
    })
  }


})