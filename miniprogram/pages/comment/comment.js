const db = wx.cloud.database() // 初始化数据库

Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail: {},
    appraisal: '',
    rateValue: 5,
    images: [],
    fileID: [],
    movieid: -1
  },

  onAppraisalChange: function (event) {
    this.setData({
      appraisal: event.detail
    })
  },
  onRateChange: function (event) {
    this.setData({
      rateValue: event.detail
    })
  },
  uploadImage: function () {
    wx.chooseImage({
      count: 6,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths

        this.setData({
          images: this.data.images.concat(tempFilePaths)
        })
      }
    })
  },
  submit: function () {
    // 上传图片到云存储
    wx.showLoading({
      title: '评论中'
    })
    let promiseArr = []
    for (let i = 0; i < this.data.images.length; i++) {
      promiseArr.push(new Promise((resolve, reject) => {
        let item = this.data.images[i]
        let suffix = /\.\w+$/.exec(item)[0] // 正则表达式，返回文件扩展名
        wx.cloud.uploadFile({
          cloudPath: new Date().getTime() + suffix, // 上传至云端的路径
          filePath: item, // 小程序临时文件路径
          success: res => {
            // 返回文件 ID
            this.setData({
              fileID: this.data.fileID.concat(res.fileID)
            })
            resolve()
          },
          fail: console.error
        })
      }))
    }

    Promise.all(promiseArr).then(res => {
      // 插入数据
      db.collection('comment').add({
        data: {
          appraisal: this.data.appraisal,
          movieid: this.data.movieid,
          rateValue: this.data.rateValue,
          fileID: this.data.fileID
        }
      }).then(res => {
        wx.hideLoading()
        wx.showToast({
          title: '评论成功',
        })
      }).catch(err => {
        wx.hideLoading()
        wx.showToast({
          title: '评论失败',
        })
      })
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      movieid: options.movieid
    })
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: 'getDetail',
      data: {
        movieid: options.movieid
      }
    }).then(res => {
      this.setData({
        detail: JSON.parse(res.result)
      })
      wx.hideLoading()
    }).catch(error => {
      console.error(error)
      wx.hideLoading()
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