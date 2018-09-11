const app = getApp();
import Loginfunc from '../../utils/loginfunc.js';
import util from '../../utils/util.js';

Page({

    data: {
        showNormalBox: false,
        showDoubleBox: false,
        haploidDoller: '0.00',
        doubleDoller: '0.00',
    },

    onLoad: function(options) {
        wx.showShareMenu({
            withShareTicket: true
        });
        this.getDollerData();
        if (app.globalData.userInfo) {
            this.setData({
                userImg: app.globalData.userInfo.avatarUrl,
                userName: app.globalData.userInfo.nickName.slice(0, 11) || '未授权用户',
                isExamine: app.globalData.isExamine
            })
        } else {
            this.setData({
                userImg: '/assets/player/crown.png',
                userName: '未授权用户',
                isExamine: app.globalData.isExamine
            })
        }
        this.creatVictoryAudioFun();
    },

    onShow: function() {

    },

    onHide: function() {
        if (this.VictoryAudio) {
            this.VictoryAudio.stop();
        }
    },

    onUnload: function() {
        if (this.VictoryAudio) {
            this.VictoryAudio.stop();
        }
    },

    onShareAppMessage: function(res) {
        let _this = this;
        console.log(res);
        if (res.from === 'button') {
            wx.reportAnalytics('botenvelopeclick', {
                uid: app.user_id,
            });
        }
        let groupCheckUrl = Loginfunc.domin + `api/issharedraw`;
        let random = Math.floor(Math.random() * app.shareList.length);
        return {
            title: `${app.shareList[random].title}`,
            path: `pages/index/index?uid=${app.user_id}`,
            imageUrl: `${Loginfunc.QiNiuURl}${app.shareList[random].pic}`,
            success: function(data) {
                if (res.from === 'button') {
                    if (data && data.shareTickets) {
                        wx.getShareInfo({
                            shareTicket: data.shareTickets[0],
                            success: function(value) {
                                let iv = value.iv;
                                let encryptedData = value.encryptedData;
                                Loginfunc.requestURl(app, groupCheckUrl, "POST", {
                                    encryptedData: encryptedData,
                                    iv: iv,
                                    user_id: app.user_id,
                                    type: 2
                                }, function(data) {
                                    console.log('groupCheckUrl', data);
                                    if (data.code == 200) {
                                        _this.setData({
                                            showDoubleBox: true
                                        })
                                    } else if (data.code == 223) {
                                        wx.showToast({
                                            title: '此群已分享',
                                            icon: 'none',
                                        })
                                    } else {
                                        wx.showToast({
                                            title: '分享失败',
                                            icon: 'none',
                                        })
                                    }
                                });
                            }
                        })
                    } else {
                        wx.showToast({
                            title: '请分享到群',
                            icon: 'none',
                        })
                    }
                } else {
                    wx.showToast({
                        title: '分享成功',
                        icon: 'none',
                    })
                }


            },
            fail: function(data) {
                console.log("fail", data);
                wx.showToast({
                    title: '分享失败',
                    icon: 'none',
                })
            }
        };
    },

    getDollerData: function() {
        let _this = this;
        let getDollerURL = Loginfunc.domin + `api/withdraw`;
        Loginfunc.requestURl(app, getDollerURL, "POST", {
            user_id: app.user_id
        }, function(data) {
            console.log('getDollerURL', data)
            if (data.code == 200) {
                _this.setData({
                    haploidDoller: data.randnum1,
                    doubleDoller: data.randnum2,
                    receivehaploid: 'receivehaploid',
                    receivedouble: 'receivedouble',
                })
            } else {
                wx.showModal({
                    title: '红包领取失败,请重试',
                    content: `${data.msg}`,
                    showCancel: false,
                    success: function(res) {

                    }

                })
            }
        });
    },

    receiveDoller: function(log) {
        let _this = this;
        let receiveDollerURL = Loginfunc.domin + `api/issharedraw`;
        Loginfunc.requestURl(app, receiveDollerURL, "POST", {
            user_id: app.user_id,
            type: log
        }, function(data) {
            console.log('getDollerURL', data);
            wx.hideLoading();
            if (log && log == 1) {
                _this.setData({
                    showNormalBox: true,
                })
            }
        });
    },

    receivehaploid: function() {
        wx.showLoading({
            title: 'loading',
            mask: true,
        });
        wx.reportAnalytics('danredclick', {
            uid: app.user_id,
        });
        this.receiveDoller(1)
    },

    continueGame: function() {
        this.setData({
            showNormalBox: false,
            showDoubleBox: false,
        })
        wx.navigateBack({
            delta: 1
        })
    },

    checkRedBao: function() {
        this.setData({
            showNormalBox: false,
            showDoubleBox: false,
        })
        wx.redirectTo({
            url: '/pages/usercenter/usercenter'
        })
    },

    creatVictoryAudioFun: function() {
        this.VictoryAudio = wx.createInnerAudioContext();
        this.VictoryAudio.autoplay = false;
        this.VictoryAudio.src = '/assets/audio/Victory.mp3';
        this.VictoryAudio.volume = 1;
        this.VictoryAudio.play();
    },
})