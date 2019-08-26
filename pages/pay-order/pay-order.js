//index.js
//获取应用实例
var app = getApp()
var util = require('../../utils/util.js')

Page({
  data: {
    goodsList: [],
    isNeedLogistics: 0, // 是否需要物流信息
    allGoodsPrice: 0,
    yunPrice: 0,
    allGoodsAndYunPrice: 0,
    goodsJsonStr: "",
    orderType: "", //订单类型，购物车下单或立即支付下单，默认是购物车，

    hasNoCoupons: true,
    coupons: [],
    youhuijine: 0, //优惠券金额
    curCoupon: null // 当前选择使用的优惠券
  },
  onShow: function() {
    //console.log(this.data.orderType)
    var that = this;
    var shopList = [];

    //立即购买下单
    if ("buyNow" == that.data.orderType) {
      var buyNowInfoMem = wx.getStorageSync('buyNowInfo');
      if (buyNowInfoMem && buyNowInfoMem.shopList) {
        shopList = buyNowInfoMem.shopList
      }
    } else {
      //购物车下单
      var shopCarInfoMem = wx.getStorageSync('shopCarInfo');
      if (shopCarInfoMem && shopCarInfoMem.shopList) {
        // shopList = shopCarInfoMem.shopList
        shopList = shopCarInfoMem.shopList.filter(entity => {
          return entity.active;
        });
      }
    }
    that.setData({
      goodsList: shopList,
    });
    that.initShippingAddress();
  },

  onLoad: function(e) {
    
    //console.log(e)
    var that = this;
    if (app.globalData.iphone == true) {
      that.setData({
        iphone: 'iphone'
      })
    }
    //显示收货地址标识
    that.setData({
      isNeedLogistics: 1,
      orderType: e.orderType
    });
  },

  getDistrictId: function(obj, aaa) {
    if (!obj) {
      return "";
    }
    if (!aaa) {
      return "";
    }
    return aaa;
  },

  createOrder: function(e) {

    
    var that = this;

    var orderOn = util.orderId();

    var goodsJsonStr = that.data.goodsJsonStr;
    var addressId = that.data.curAddressData.id;

    var remark = "";

    if (e) {
      remark = e.detail.value.remark; // 备注信息
    }

    var postData = {
      goodsJsonStr: goodsJsonStr,
      remark: remark,
      orderOn: orderOn,
      addressId: addressId,
      payId: 0,
      actualPrice: this.data.allGoodsPrice
    }

    console.log(goodsJsonStr)

    

    wx: wx.request({
      url: app.globalData.urls + '/api/wxPay',
      data: {
        body: "款项支付",
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
        var data = res.data.data;
        // 生成预付款单
        wx.requestPayment({
          timeStamp: data.timeStamp,
          nonceStr: data.nonceStr,
          package: data.package,
          signType: 'MD5',
          paySign: data.paySign,
          success: function(res) {
            wx.request({
              url: app.globalData.urls + '/api/order/create',
              method: 'POST',
              header: {
                'token': app.globalData.token,
                'content-type': 'application/x-www-form-urlencoded'
              },
              data: postData,
              success: function(res) {
                debugger;
                if (e && "buyNow" != that.data.orderType) {
                  // 清空购物车数据
                  wx.removeStorageSync('shopCarInfo');
                  wx.removeStorageSync('buykjInfo');
                }

                wx.navigateBack({
                  
                })

                // console.log(postData)
                //wx.hideLoading();


              }
            })

          }
        })
      },
    })


    // debugger;
    // wx.showLoading();
    // var that = this;
    // var loginToken = app.globalData.token // 用户登录 token
    // var remark = ""; // 备注信息
    // if (e) {
    //   remark = e.detail.value.remark; // 备注信息
    // }
    // /* 备注信息必填
    // if (e && that.data.orderType == 'buykj' && remark == '') {
    //   wx.hideLoading();
    //   wx.showModal({
    //     title: '提示',
    //     content: '请添加备注信息！',
    //     showCancel: false
    //   })
    //   return;
    // }
    // */
    // var postData = {
    //   //token: loginToken,
    //   goodsJsonStr: that.data.goodsJsonStr,
    //   remark: remark
    // };
    // if (that.data.isNeedLogistics > 0) {
    //   if (!that.data.curAddressData) {
    //     wx.hideLoading();
    //     wx.showModal({
    //       title: '友情提示',
    //       content: '请先设置您的收货地址！',
    //       showCancel: false
    //     })
    //     return;
    //   }
    //   if ("buyPT" == that.data.orderType) {
    //     postData.pingtuanOpenId = that.data.goodsList[0].pingtuanId;
    //   } else if ("buykj" == that.data.orderType) {
    //     postData.kjid = that.data.goodsList[0].kjid
    //   }

    //   postData.addressId = that.data.curAddressData.addressId;

    //   postData.expireMinutes = app.siteInfo.closeorder;
    // }
    // if (that.data.curCoupon) {
    //   postData.couponId = that.data.curCoupon.id;
    // }
    // if (!e) {
    //   postData.calculate = "true";
    // }

    // wx.request({
    //   url: app.globalData.urls + '/api/order/create',
    //   method: 'POST',
    //   header: {
    //     'token': app.globalData.token,
    //     'content-type': 'application/x-www-form-urlencoded'
    //   },
    //   data: postData, // 设置请求的 参数
    //   success: (res) => {
    //     // console.log(postData)
    //     wx.hideLoading();
    //     if (res.data.code != 0) {
    //       wx.showModal({
    //         title: '错误',
    //         content: res.data.msg,
    //         showCancel: false
    //       })
    //       return;
    //     }

    //     if (e && "buyNow" != that.data.orderType) {
    //       // 清空购物车数据
    //       wx.removeStorageSync('shopCarInfo');
    //       wx.removeStorageSync('buykjInfo');
    //       wx.removeStorageSync('PingTuanInfo');
    //     }
    //     //console.log(that.data.goodsList[0].price)
    //     if (!e) {
    //       var allGoodsAndYunPrice = res.data.yunPrice + res.data.allGoodsPrice

    //       that.setData({
    //         isNeedLogistics: res.data.data.isNeedLogistics,
    //         allGoodsPrice: res.data.allGoodsPrice,
    //         allGoodsAndYunPrice: allGoodsAndYunPrice, //res.data.data.amountLogistics + res.data.data.amountTotle,
    //         yunPrice: res.data.yunPrice
    //       });
    //       that.getMyCoupons();
    //       return;
    //     }
    //     // 配置模板消息推送
    //     var postJsonString = {};
    //     postJsonString.keyword1 = {
    //       value: res.data.data.dateAdd,
    //       color: '#173177'
    //     }
    //     postJsonString.keyword2 = {
    //       value: res.data.data.amountReal + '元',
    //       color: '#173177'
    //     }
    //     postJsonString.keyword3 = {
    //       value: res.data.data.orderNumber,
    //       color: '#173177'
    //     }
    //     postJsonString.keyword4 = {
    //       value: '订单已关闭',
    //       color: '#173177'
    //     }
    //     postJsonString.keyword5 = {
    //       value: '您可以重新下单，请在30分钟内完成支付',
    //       color: '#173177'
    //     }
    //     app.sendTempleMsg(res.data.data.id, -1,
    //       app.siteInfo.closeorderkey, e.detail.formId,
    //       'pages/index/index', JSON.stringify(postJsonString));
    //     postJsonString = {};
    //     postJsonString.keyword1 = {
    //       value: '您的订单已发货，请注意查收',
    //       color: '#173177'
    //     }
    //     postJsonString.keyword2 = {
    //       value: res.data.data.orderNumber,
    //       color: '#173177'
    //     }
    //     postJsonString.keyword3 = {
    //       value: res.data.data.dateAdd,
    //       color: '#173177'
    //     }
    //     app.sendTempleMsg(res.data.data.id, 2,
    //       app.siteInfo.deliveryorderkey, e.detail.formId,
    //       'pages/order-detail/order-detail?id=' + res.data.data.id, JSON.stringify(postJsonString));
    //     wx.redirectTo({
    //       url: "/pages/success/success?order=" + res.data.data.orderNumber + "&money=" + res.data.data.actualPrice + "&id=" + res.data.data.id
    //     });
    //   }
    // })
  },
  initShippingAddress: function() {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/api/user/shipping-address/default',
      data: {
        openId: app.globalData.openid
      },
      success: (res) => {
        if (res.data.code == 0) {
          that.setData({
            curAddressData: res.data.data
          });
        } else {
          that.setData({
            curAddressData: null
          });
        }
        that.processYunfei();
      }
    })
  },
  processYunfei: function() {
    
    var that = this;
    var goodsList = this.data.goodsList;
    var goodsJsonStr = "[";
    var isNeedLogistics = 0;
    var allGoodsPrice = 0;


    for (let i = 0; i < goodsList.length; i++) {
      let carShopBean = goodsList[i];
      if (carShopBean.logistics) {
        isNeedLogistics = 1;
      }
      allGoodsPrice += carShopBean.price * carShopBean.number;

      var goodsJsonStrTmp = '';
      if (i > 0) {
        goodsJsonStrTmp = ",";
      }


      let inviter_id = 0;
      let inviter_id_storge = wx.getStorageSync('inviter_id_' + carShopBean.goodsId);
      if (inviter_id_storge) {
        inviter_id = inviter_id_storge;
      }

      goodsJsonStrTmp += '{"goodsId":' + carShopBean.goodsId + ',"number":' + carShopBean.number + ',"specifications":"' + carShopBean.label.split(" ")[0].split(":")[1] + ":" + carShopBean.label.split(" ")[2].split(":")[1] + '"}';
      goodsJsonStr += goodsJsonStrTmp;


    }
    goodsJsonStr += "]";
    //console.log(goodsJsonStr);
    that.setData({
      isNeedLogistics: isNeedLogistics,
      goodsJsonStr: goodsJsonStr,
      allGoodsPrice: allGoodsPrice
    });
    //that.createOrder();
  },
  addAddress: function() {
    wx.navigateTo({
      url: "/pages/address-add/address-add"
    })
  },
  selectAddress: function() {
    wx.navigateTo({
      url: "/pages/address/address"
    })
  },
  getMyCoupons: function() {
    var that = this;
    wx.request({
      url: app.globalData.urls + '/api/discounts/my',
      data: {
        openId: app.globalData.openid,
        status: 0
      },
      success: function(res) {
        if (res.data.code == 0) {
          var coupons = res.data.data.filter(entity => {
            return entity.moneyHreshold <= that.data.allGoodsAndYunPrice;
          });
          if (coupons.length > 0) {
            that.setData({
              hasNoCoupons: false,
              coupons: coupons
            });
          }
        }
      }
    })
  },
  bindChangeCoupon: function(e) {
    const selIndex = e.detail.value[0] - 1;
    if (selIndex == -1) {
      this.setData({
        youhuijine: 0,
        curCoupon: null
      });
      return;
    }
    //console.log("selIndex:" + selIndex);
    this.setData({
      youhuijine: this.data.coupons[selIndex].money,
      curCoupon: this.data.coupons[selIndex]
    });
  }
})