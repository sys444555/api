var app = getApp()
var util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    boxStatus: true,
    balance: 0,
    tabArr: {
      curHdIndex: 0,
      curBdIndex: 0
    },
    vipCode: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    var that = this;

    if (app.globalData.iphone == true) {
      that.setData({
        iphone: 'iphone'
      })
    }
    wx.request({

      url: app.globalData.urls + '/api/user/find',
      data: {
        Openid: getApp().globalData.openid
      },
      success: function(res) {

        if (res.data.data.vip == 1) {
          that.setData({
            vipCode: 1
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this;

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  bindCancel: function() {
    wx.navigateBack({})
  },
  tabFun: function(e) {
    var _datasetId = e.target.dataset.id;
    var _obj = {};
    _obj.curHdIndex = _datasetId;
    _obj.curBdIndex = _datasetId;
    this.setData({
      tabArr: _obj
    });
  },
  //立即充值按钮时间
  Recharge: function(sName,sPhone) {
    var that = this;
    var WXdata = "";
    //判断是否已经是超级合伙人
    if (that.data.vipCode == 1) {
      wx.showToast({
        title: '您已经是合伙人,办理失败',
        icon: 'none',
        duration: 3000 //持续的时间
      })
      that.setData({
        boxStatus: true,
      })
    } else {
      var orderOn = util.orderId();
      //调用支付接口
      wx.request({
        url: app.globalData.urls + '/api/wxPay',
        data: {
          body: "申请超级合伙人",
          orderOn: orderOn,
          payNum: "1",
          openId: getApp().globalData.openid,
          refundFee: "0"
        },
        header: {
          "token": app.globalData.token,
          'content-type': 'application/x-www-form-urlencoded'
        },
        method: 'POST',
        dataType: 'json',
        responseType: 'text',
        success: function(res) {
          WXdata = res.data.data
          //数据库记入订单
          wx.request({
            url: app.globalData.urls + '/api/order/create/vip',
            method: 'POST',
            header: {
              'token': app.globalData.token,
              'content-type': 'application/x-www-form-urlencoded'
            },
            data: {
              orderOn: orderOn,
              remark: "超级合伙人业务办理",
              goodsPrice: 10000,
              openId: getApp().globalData.openid,
              actualPrice: 10000,
              payId: 0
            },
            success: function(res) {

              // 生成预付款单
              wx.requestPayment({

                timeStamp: WXdata.timeStamp,
                nonceStr: WXdata.nonceStr,
                package: WXdata.package,
                signType: 'MD5',
                paySign: WXdata.paySign,
                success: function(res) {
                  //更改会员状态
                  wx.request({
                    url: app.globalData.urls + '/api/user/vip',
                    method: 'POST',
                    header: {
                      'token': app.globalData.token,
                      'content-type': 'application/x-www-form-urlencoded'
                    },
                    data: {
                      openId: getApp().globalData.openid,
                      sName : sName,
                      sPhone, sPhone
                    },
                    success: function(res) {
                      that.setData({
                        vipCode: 1,
                        boxStatus : true
                      })
                      wx.showToast({
                        title: '办理成功,恭喜您成为超级合伙人',
                        icon: 'none',
                        duration: 2000 //持续的时间
                      })
                    }
                  })
                }
              })
            }
          })
        }
      })
    }
  },

  goBack: function() {
    var that = this;
    that.setData({
      boxStatus: true
    })
  },

  go: function() {
    var that = this;
    that.setData({
      boxStatus: false
    })
  },

  form: function(e) {
    var that = this;
    if (e.detail.value.sName == "" || e.detail.value.sPhone == "") {
      wx.showToast({
        title: '信息为空,请确认',
        icon: "none",
        duration: 3000
      })
      return;
    } 
    that.Recharge(e.detail.value.sName, e.detail.value.sPhone);
  }

})