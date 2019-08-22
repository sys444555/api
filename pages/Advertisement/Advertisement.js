var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hidden: false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {

    var that = this;
    //图片 文字 展示
    wx.request({
      url: app.globalData.urls + '/api/advertisement/home',
      data: {
        bannerId: e.bannerId
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            home: res.data.data
          });
          //商品展示
          wx.request({
            url: app.globalData.urls + '/api/advertisement/shop',
            data: {
              shopId: res.data.data.shopId,
            },
            success: function (res) {
              console.log(res)
              if (res.data.code == 0) {
                that.setData({
                  shop: res.data.data,
                  hidden: true
                });
              }
            }
          })
        }
      }

    })




  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})