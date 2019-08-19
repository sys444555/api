//app.js
App({
  onLaunch: function() {
    var that = this;
    that.urls();
    wx.getSystemInfo({
      success: function(res) {
        if (res.model.search("iPhone X") != -1) {
          that.globalData.iphone = true;
          
        }
        if (res.model.search("MI 8") != -1) {
          that.globalData.iphone = true;
        }
      }
    });
    that.login()
  },
  urls: function() {
    var that = this;
    that.globalData.urls = that.siteInfo.url + that.siteInfo.subDomain;
    that.globalData.share = that.siteInfo.shareProfile;
  },
  siteInfo: require("config.js"),
  login: function() {
    var that = this;
    var token = that.globalData.token;

    if (token) {
      wx.request({
        url: that.globalData.urls + "/user/check-token",
        data: {
          token: token
        },
        success: function(res) {
          if (res.data.code != 0) {
            that.globalData.token = null;
            that.login();
          }
        }
      });
      return;
    }
    wx.login({

      success: function (res) {
        wx.request({
          url: "http://localhost/wx/user/getUserInfo",
          data: {
            appid: "wxfd945e2b4a767dc3",
            secret: "0d921f83d3a88312703d8771709fb7e1",
            js_code: res.code,
            grantType: 'authorization_code',

          },
          method: "POST",
          header: {
            "Content-Type": "application/x-www-form-urlencoded"
          },
          success: function (res) {
            console.log(res);
            if (res.data.code == 500) {
              that.globalData.usinfo = 0;
              return;
            }
            if (res.data.code != 0) {
              wx.hideLoading();
              wx.showModal({
                title: "提示",
                content: "无法登录，请重试",
                showCancel: false
              });
              return;
            }
            that.globalData.openid = res.data.data.openid;
            that.globalData.token = res.data.data.access_token;
            that.globalData.uid = res.data.data.uid;

          }
        });
      }
    });
  

  },
  sendTempleMsg: function(orderId, trigger, template_id, form_id, page, postJsonString) {
    var that = this;
    wx.request({
      url: that.globalData.urls + "/template-msg/put",
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        token: that.globalData.token,
        type: 0,
        module: "order",
        business_id: orderId,
        trigger: trigger,
        template_id: template_id,
        form_id: form_id,
        url: page,
        postJsonString: postJsonString
      }
    });
  },
  sendTempleMsgImmediately: function(template_id, form_id, page, postJsonString) {
    var that = this;
    wx.request({
      url: that.globalData.urls + "/template-msg/put",
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: {
        token: that.globalData.token,
        type: 0,
        module: "immediately",
        template_id: template_id,
        form_id: form_id,
        url: page,
        postJsonString: postJsonString
      }
    });
  },
  fadeInOut: function(that, param, opacity) {
    var animation = wx.createAnimation({
      //持续时间800ms
      duration: 300,
      timingFunction: 'ease',
    })
    animation.opacity(opacity).step()
    var json = '{"' + param + '":""}'
    json = JSON.parse(json);
    json[param] = animation.export()
    that.setData(json)
  },
  isStrInArray: function(item, arr) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] == item) {
        return true;
      }
    }
    return false;
  },
  getShopCartNum: function() {
    var that = this
    wx.getStorage({
      key: 'shopCarInfo',
      success: function(res) {
        if (res.data) {
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
  globalData: {
    usinfo: 0,
    openid: "",//登录用户的唯一标识
    appid: 'wxfd945e2b4a767dc3',//appid  
    secret: '0d921f83d3a88312703d8771709fb7e1',//secret秘钥
    token: ""
  }
})