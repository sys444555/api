//index.js
//获取应用实例
const app = getApp()

Page({
	data: {
		indicatorDots: true,
		autoplay: true,
		interval: 3000,
		duration: 800,
		swiperCurrent: 0,
		iphone:false,
		loadingHidden: false, // loading
		wxlogin: true,
		loadingMoreHidden: true,
		showSearch: true,
    sales: [{
        "id": 2,
        "linkUrl": "/pages/fav-list/fav-list",
        "title": "我的收藏",
        "picUrl": "/images/icon/qiandao.png"
    },{
        "id": 1,
        "linkUrl": "/pages/withdraw/withdraw",
        "title": "会员充值",
        "picUrl": "/images/icon/zhuanlan.png"
      }, {
        "id": 3,
        "linkUrl": "/pages/order-list/order-list",
        "title": "我的订单",
        "picUrl": "/images/icon/kanjia.png"
      }],
    // hot:[{
    //   "linkUrl": "../Advertisement/Advertisement",
    //   "picUrl":"/images/mid1.png",
    // }, {
    //     "linkUrl": "../Advertisement/Advertisement",
    //     "picUrl": "/images/mid2.png",
    //   }, {
    //     "linkUrl": "../Advertisement/Advertisement",
    //     "picUrl": "/images/mid3.png",
    //   }, {
    //     "linkUrl": "../Advertisement/Advertisement",
    //     "picUrl": "/images/mid4.png",
    //   }]
    
	},
	onShow(){
		var that = this
		// app.fadeInOut(this,'fadeAni',0)

		//获取购物车商品数量
		app.getShopCartNum()
	},
	onLoad: function() {
		var that = this;
		app.fadeInOut(this,'fadeAni',0)
		if (app.globalData.iphone == true) {
			that.setData({
				iphone: true
			})
		}
		//首页顶部Logo
		wx.request({
			url: app.globalData.urls + '/api/banner/list',
			data: {
				type: 'toplogo'
			},
			success: function(res) {
				if (res.data.code == 0) {
					that.setData({
						toplogo: res.data.data[0].picUrl,
						topname: wx.getStorageSync('mallName')
					});
				}
			}
		})
		//首页幻灯片
		wx.request({
			url: app.globalData.urls + '/api/banner/list',
			data: {
				type: 'home'
			},
			success: function(res) {
				if (res.data.code == 0) {
					that.setData({
						banners: res.data.data
					});
				}
			}
		})
		// //4个功能展示位
	  // 	wx.request({
		//   url: app.globalData.urls + '/banner/list',
		//   data: {
		//     key: 'mallName',
		//     type: 'sale'
		//   },
		//   success: function (res) {
		//     if (res.data.code == 0) {
		//       that.setData({
		//         sales: res.data.data
		//       });
		//     }
		//   }
		// })
	//	4个热销广告位
		wx.request({
		  url: app.globalData.urls + '/api/banner/list',
		  data: {
		    type: 'hot'
		  },
		  success: function (res) {
        
		    if (res.data.code == 0) {
		      that.setData({
		        hot: res.data.data
		      });
		    }
		  }
		})
		//获取推荐商品信息
		wx.request({
		  url: app.globalData.urls + '/api/list',
		  data: {
		    key: 'topgoods'
		  },
		  success: function (res) {
		    if (res.data.code == 0) {
		      that.setData({
		        topgoods: res.data.data[0].value
		      });
		      wx.request({
		        url: app.globalData.urls + '/api/shop/goods/list',
		        data: {
		          recommendStatus: 1,
		          pageSize: 10
		        },
		        success: function (res) {
              console.log(res);
              
		          that.setData({
		            goods: [],
		            loadingMoreHidden: true
		          });
		          var goods = [];
              
		          if (res.data.code != 0 || res.data.data.list.length == 0) {
		            that.setData({
		              loadingMoreHidden: false,
		            });
		            return;
		          }
              for (var i = 0; i < res.data.data.list.length; i++) {
               
		            goods.push(res.data.data.list[i]);
		          }
		          that.setData({
		            goods: goods,
		          });
		        }
		      })
		    }
		  }
		})
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo']) {//授权了，可以获取用户信息了
          wx.getUserInfo({
            success: (res) => {
              that.setData({
                wxlogin: true
              })
            }
          })
        } else {//未授权，跳到授权页面
          that.setData({
            wxlogin: false
          })
          wx.hideTabBar();
        }
      }
    })
	},
  userlogin: function (e) {
    if (e.detail.userInfo) { //点击允许先
      var that = this;
      wx.request({
        url: app.globalData.urls + '/api/user/decodeUserInfo',
        data: {
          openId: getApp().globalData.openid, //用户的唯一标识
          nickName: e.detail.userInfo.nickName, //微信昵称
          avatarUrl: e.detail.userInfo.avatarUrl, //微信头像
          province: e.detail.userInfo.province, //用户注册的省
          city: e.detail.userInfo.city, //用户注册的市
          gender: e.detail.userInfo.gender, //用户性别
          country: e.detail.userInfo.country //用户所在国家
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded', // 默认值
          'token': getApp().globalData.token
        },
        method: "post",
        success: function (e) {
          if (e.data.code == 0) {
            wx.showToast({
              title: '授权已经成功',
              mask: true,
              duration: 2000,
              success: function () {
                that.setData({
                  wxlogin: true
                })
                wx.showTabBar();
                wx.removeStorageSync('shopCarInfo');
                wx.removeStorageSync('buykjInfo');
              }
            })
          }
        }
      })
    } else {
      wx.showModal({
        title: '授权通知',
        content: '为了体验建议告诉我们您的微信公开信息，绝对不会泄露隐私噢！',
      })
    }
  },

	swiperchange: function(e) {
		this.setData({
			swiperCurrent: e.detail.current
		})
	},
	toDetailsTap: function(e) {
		wx.navigateTo({
			url: "/pages/goods-detail/goods-detail?id=" + e.currentTarget.dataset.id
		})
	},
	tapBanner: function(e) {
		if (e.currentTarget.dataset.id != 0) {
			wx.navigateTo({
				url: "/pages/goods-detail/goods-detail?id=" + e.currentTarget.dataset.id
			})
		}
	},
	tapSales: function (e) {
	  if (e.currentTarget.dataset.id != 0) {
	    wx.navigateTo({
	      url: e.currentTarget.dataset.id
	    })
	  }
	},
  // 判断是否已经授权
  
	onPageScroll: function(t) {
		if(t.scrollTop >= 180){
			wx.setNavigationBarColor({
				frontColor: '#000000',
				backgroundColor: '#ffffff'
			})
			app.fadeInOut(this,'fadeAni',1)
		}else{
			wx.setNavigationBarColor({
				frontColor: '#ffffff',
				backgroundColor: '#ffffff'
			})
			app.fadeInOut(this,'fadeAni',0)
		}
	}
})
