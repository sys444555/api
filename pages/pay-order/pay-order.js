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
    vipCode : 0,
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

    console.log(e)
    var that = this;

    if (app.globalData.iphone == true) {
      that.setData({
        iphone: 'iphone'
      })
    }
    //显示收货地址标识
    that.setData({
      isNeedLogistics: 1,
      orderType: e.orderType,
      vipCode : e.vip
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

    var wxData = "";

    var that = this;

    var orderOn = util.orderId();

    var goodsJsonStr = that.data.goodsJsonStr;
    if (that.data.curAddressData) {
      var addressId = that.data.curAddressData.id;
    } else {
      wx.showToast({
        title: '请填写收货地址',
        duration: 3000,
        mask: true,
        icon: 'none'
      })
      return;
    }


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
        wxData = res.data.data;

        // ---------------
        wx.request({
          url: app.globalData.urls + '/api/order/create',
          method: 'POST',
          header: {
            'token': app.globalData.token,
            'content-type': 'application/x-www-form-urlencoded'
          },
          data: postData,
          success: function(res) {
            
            if (res.data.code == 0) {
              if (e && "buyNow" != that.data.orderType) {
                // 清空购物车数据
                wx.removeStorageSync('shopCarInfo');
                wx.removeStorageSync('buykjInfo');
              }
              wx.hideLoading();
              
              // 生成预付款单
              wx.requestPayment({
                timeStamp: wxData.timeStamp,
                nonceStr: wxData.nonceStr,
                package: wxData.package,
                signType: 'MD5',
                paySign: wxData.paySign,
                success: function(res) {               
                  wx.switchTab({
                    url: '/pages/cart/cart',
                  })
                }
              })
            }
          }
        })
      },
    })
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
    debugger;
    var allGoodsAndYunPrice = that.data.vipCode == 1 ? allGoodsPrice * 0.4 : allGoodsPrice
    allGoodsAndYunPrice = parseFloat(allGoodsAndYunPrice.toFixed(2))
    //console.log(goodsJsonStr);
    that.setData({
      isNeedLogistics: isNeedLogistics,
      goodsJsonStr: goodsJsonStr,
      allGoodsAndYunPrice: allGoodsAndYunPrice,
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
  }
})