const app = getApp()
import Loginfunc from '../../utils/loginfunc.js';
import util from '../../utils/util.js';

Page({

    data: {

    },

    onLoad: function(options) {
        this.setData({
            withdrawal_amount: app.globalData.withdrawal_amount,
            mydoller: app.globalData.available,
            daily_cash_count:app.globalData.daily_cash_count,
        })

    },

    onShow: function() {

    },

    onHide: function() {

    },

    onUnload: function() {

    },

    onShareAppMessage: function() {
        let random = Math.floor(Math.random() * app.shareList.length);
        return {
            title: `${app.shareList[random].title}`,
            path: `pages/index/index?uid=${app.user_id}`,
            imageUrl: `${Loginfunc.QiNiuURl}${app.shareList[random].pic}`,
            success: function () {
                if (app.globalData.musicStatus) {
                    setTimeout(function () {
                        app.globalData.music.play();

                    }, 200)
                }
            },
            fail: function () {
                if (app.globalData.musicStatus) {
                    setTimeout(function () {
                        app.globalData.music.play();

                    }, 200)
                }
            }
        };
    },

    withdrawFun: function() {
        wx.showLoading({
            title: 'loading',
            mask: true,
        });
        console.log(Math.floor(app.globalData.available));
        console.log(parseFloat(app.globalData.withdrawal_amount));
        if (parseFloat(app.globalData.available) < parseFloat(app.globalData.withdrawal_amount)) {
            wx.hideLoading();
            wx.showModal({
                title: '提现失败',
                content: `账户余额小于${app.globalData.withdrawal_amount}元`,
                showCancel: false,
                success: function(res) {

                }
            })
        }

        if (parseFloat(app.globalData.available) >= parseFloat(app.globalData.withdrawal_amount)) {
            let withDrawUrl = Loginfunc.domin + `api/getcashflow`;
            Loginfunc.requestURl(app, withDrawUrl, "POST", {
                user_id: app.user_id,
            }, function(data) {
                console.log('withDrawUrl', data);
                wx.hideLoading();
                if (data.code == 200) {
                    wx.showModal({
                        title: '提现成功',
                        content: `成功提现${parseFloat(app.globalData.withdrawal_amount)}元`,
                        showCancel: false,
                        success: function(res) {
                            wx.navigateBack({
                                delta: 1
                            })
                        }
                    })

                }else{
                    wx.showModal({
                        title: '提现失败',
                        content: `${data.msg}`,
                        showCancel: false,
                        success: function (res) {

                        }
                    })
                }                
            })

        }
    }
})