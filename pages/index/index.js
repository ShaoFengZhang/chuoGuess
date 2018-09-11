const app = getApp()
import Loginfunc from '../../utils/loginfunc.js';
import util from '../../utils/util.js';

Page({
    data: {
        hasUserInfo: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        ifShowChanceMask: false,
        showNochanceMask: false,
        musicTxt:'开',
        musicStatus:true,
        ifShowRuleMask:false,
    },

    onLoad: function() {
        this.creatEBgMusicAudioFun();
        Loginfunc.wxloginfnc(app, this);
        this.configshowload=true;
        wx.showLoading({
            title: 'loading',
            mask: true,
        });
        let _this = this;
        wx.showShareMenu({
            withShareTicket: true
        });
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            });
        } else if (this.data.canIUse) {
            app.userInfoReadyCallback = res => {
                app.globalData.userInfo = res.userInfo;
                console.log(">>>>>>>>>>>>>>>", res.userInfo)
                this.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true
                });
                Loginfunc.checkUserInfo(app, res);
            }
        } else {
            wx.getUserInfo({
                success: res => {
                    console.log("LLLLLLLLLLLL", res.userInfo)
                    app.globalData.userInfo = res.userInfo
                    this.setData({
                        userInfo: res.userInfo,
                        hasUserInfo: true
                    });
                    Loginfunc.checkUserInfo(app, res);
                }
            })
        }
       
    },

    onShow: function() {
        let _this=this;
        this.getConfigFun();
    },

    onHide: function() {

    },

    onUnload: function() {

    },

    getUserInfo: function(e) {
        console.log('??????????????', e.detail);
        if (e.detail && e.detail.userInfo) {
            app.globalData.userInfo = e.detail.userInfo
            this.setData({
                userInfo: e.detail.userInfo,
                hasUserInfo: true
            });
            Loginfunc.checkUserInfo(app, e.detail);
            this.startGame();
        }
    },

    getUserInfo1: function(e) {
        if (e.detail && e.detail.userInfo) {
            app.globalData.userInfo = e.detail.userInfo
            this.setData({
                userInfo: e.detail.userInfo,
                hasUserInfo: true
            });
            Loginfunc.checkUserInfo(app, e.detail);
            this.navegatiRank();
        }
    },

    getUserInfo2: function (e) {
        if (e.detail && e.detail.userInfo) {
            app.globalData.userInfo = e.detail.userInfo
            this.setData({
                userInfo: e.detail.userInfo,
                hasUserInfo: true
            });
            Loginfunc.checkUserInfo(app, e.detail);
            this.navegatiRedBao();
        }
    },

    startGame: function(e) {
        let _this = this;
        let starGameUrl = Loginfunc.domin + `api/start`;
        if (e && parseInt(e.detail.formId) > 0) {
            let formID = e.detail.formId;
            let formIdUrl = Loginfunc.domin + `api/insertForm`;
            Loginfunc.requestURl(app, formIdUrl, "POST", {
                form_id: formID,
                user_id: app.user_id,
            }, function(data) {
                console.log('formIdUrl', data);
            });
        }

        wx.showLoading({
            title: 'loading',
            mask: true,
        });

        Loginfunc.requestURl(app, starGameUrl, "POST", {
            user_id: app.user_id,
        }, function(data) {
            wx.hideLoading();
            console.log('starGameUrl', data);
            if (data.code && data.code == 200) {
                wx.navigateTo({
                    url: `/pages/player/player`,
                });
                app.gamechs = data.gamechs;
            }
            if (data.code && data.code == 208) {
                _this.setData({
                    showNochanceMask: true,
                })
            }
            if (data.code && data.code == 210) {


                let endGameUrl = Loginfunc.domin + `api/end`;
                Loginfunc.requestURl(app, endGameUrl, "POST", {
                    user_id: app.user_id
                }, function(data) {
                    console.log('endGameUrl', data)
                    if (data.code == 200) {
                        _this.startGame();
                    } else {
                        wx.showModal({
                            title: '提示',
                            content: '网络异常,请稍后再试',
                            showCancel: false,
                            success: function(res) {}
                        })
                    }
                });
            }
        });
    },

    navegatiRank: function() {
        wx.showLoading({
            title: 'loading',
            mask: true,
        });
        wx.navigateTo({
            url: '/pages/userRank/userRank',
        });
        wx.hideLoading();
    },

    navegatiRedBao: function() {
        wx.showLoading({
            title: 'loading',
            mask: true,
        })
        wx.navigateTo({
            url: '/pages/usercenter/usercenter',
        });
        wx.hideLoading();
    },

    onShareAppMessage: function(res) {
        let _this = this;
        console.log(res);
        let groupCheckUrl = Loginfunc.domin + `api/addchannel`;
        console.log(groupCheckUrl);
        let random = Math.floor(Math.random() * app.shareList.length);
        return {
            title: `${app.shareList[random].title}`,
            path: `pages/index/index?uid=${app.user_id}`,
            imageUrl: `${Loginfunc.QiNiuURl}${app.shareList[random].pic}`,
            success: function(data) {
                console.log(`${Loginfunc.QiNiuURl}${app.shareList[random].pic}`)
                if (res.from === 'button') {
                    if (data && data.shareTickets) {
                        wx.getShareInfo({
                            shareTicket: data.shareTickets[0],
                            success: function(value) {
                                console.log('94', value);
                                let iv = value.iv;
                                let encryptedData = value.encryptedData;
                                Loginfunc.requestURl(app, groupCheckUrl, "POST", {
                                    encryptedData: encryptedData,
                                    iv: iv,
                                    user_id: app.user_id,
                                    type: 3
                                }, function(data) {
                                    console.log('groupCheckUrl', data);
                                    if (data.code == 200) {
                                        _this.setData({
                                            showNochanceMask: false,
                                        });
                                        wx.showToast({
                                            title: '挑战机会 +1',
                                            icon: 'success',
                                        });
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
                }


            },
            fail: function(data) {
                wx.showToast({
                    title: '分享失败',
                    icon: 'none',
                })
            }
        };
    },

    getConfigFun: function() {
        let _this = this;
        let getConfifUrl = Loginfunc.domin + `api/indexlogin`;
        Loginfunc.requestURl(app, getConfifUrl, "POST", {
            user_id: app.user_id,
        }, function(data) {
            console.log('getConfifUrl', data);
            app.globalData.isExamine = parseInt(data.data.isExamine);
            app.globalData.questionNum = data.data.questionNum;
            app.globalData.withdrawal_amount = parseFloat(data.data.withdrawal_amount);
            app.globalData.hard = data.data.question_level_list.split('-');
            app.globalData.sharetime = parseInt(data.data.share_game_time);
            app.globalData.score_multiple = parseFloat(data.data.score_multiple);
            app.globalData.daily_cash_count = parseInt(data.data.daily_cash_count);
            for (let n = 0; n < data.data.share_list.length; n++){
                if (data.data.share_list[n].name =="index_url"){
                    app.globalData.ruleUrl = `${Loginfunc.QiNiuURl}` + data.data.share_list[n].pic;
                    data.data.share_list.splice(n,1);
                }
            }
            app.shareList = data.data.share_list;
            _this.setData({
                navAppid: data.data.appid,
                ruleimg: app.globalData.ruleUrl,
            });
            if (_this.configshowload){
                wx.hideLoading();
                _this.configshowload=false;
            }
            
        });
    },

    hiddenChanceMask: function() {
        this.setData({
            ifShowChanceMask: false,
        });
        wx.showToast({
            title: '挑战机会+1',
            icon: 'success',
            duration: 800
        })
    },

    closenochanceMask: function() {
        this.setData({
            showNochanceMask: false,
        })
    },

    hiddendollereMask: function() {
        this.setData({
            showdollermask: false,
        })
    },

    backgroundMusic:function(){
        if (this.data.musicStatus){
            this.setData({
                musicTxt: '关',
                musicStatus:false,
            });
            wx.pauseBackgroundAudio();
        } else{
            this.setData({
                musicTxt: '开',
                musicStatus: true,
            });
            this.creatEBgMusicAudioFun();
        }      
    },

    // 创建背景音乐
    creatEBgMusicAudioFun: function () {
        // this.bgMusicAudio = wx.createInnerAudioContext();
        // this.bgMusicAudio.autoplay = false;
        // this.bgMusicAudio.src = 'https://tp.datikeji.com/ccaa/backgroundMusic.mp3';
        // this.bgMusicAudio.volume = 0.2;
        // this.bgMusicAudio.loop = true;
        // this.bgMusicAudio.play();

        wx.playBackgroundAudio({
            dataUrl: 'https://tp.datikeji.com/ccaa/backgroundMusic.mp3',
            title: '背景音乐',
        });
    },

    gameRuleFun:function(){
        this.setData({
            ifShowRuleMask: true
        });
    },

    switchRuleMask: function () {
        this.setData({
            ifShowRuleMask: !this.data.ifShowRuleMask
        });
    },  
})