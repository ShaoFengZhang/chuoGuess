const app = getApp();
import Loginfunc from '../../utils/loginfunc.js';
import util from '../../utils/util.js';
Page({

    data: {
        answerList: [],
        showCountdownMask: false,
        showcountdownTOP: true,
        ifnewuser: false,
        maskOpacity: 1,
        ifShowSub: 0,
        countbodyHeight: 610,
        shareTextstage: '分享到群即可复活',
    },

    onLoad: function(options) {
        let _this = this;

        wx.showShareMenu({
            withShareTicket: true
        });

        this.creatOKAudioFun();
        this.creatERRORAudioFun();
        this.creatSWITCHAudioFun();
        this._createLeftCurtainAnimations();
        this._createRightCurtainAnimations();
        this._createAnswerAnimations();
        this._createCurtainTextAnimations();

        this.setData({
            gamechs: app.gamechs,
            // ifnewuser: app.isnew == 1 ? true : false,
            counttopic: app.globalData.questionNum,
        });
        console.log('app.globalData.ifshownewuser', app.globalData.ifshownewuser)
        if (!app.globalData.ifshownewuser) {
            this.setData({
                ifnewuser: app.success == 0 ? true : false,
            });
        }

        this.CountShareTime = app.globalData.sharetime; //分享获得电池的总分享机会
        this.shareTime = 0; //已经分享获得电池的次数
        this.currentTopic = 0; //当前题数
        this.titleArr = []; //前边的题目编号数组
        this.resurrection = false; //是否复活过   
        _this.getTheTopicDry();
    },

    onShow: function() {},

    onHide: function() {
        console.log("HIDE");
        if (this.OKAudio) {
            this.OKAudio.stop();
            this.OKAudio.seek(0);
        };
        if (this.ERRORAudio) {
            this.ERRORAudio.stop();
            this.ERRORAudio.seek(0);
        };
        if (this.SWITCHAudio) {
            this.SWITCHAudio.stop();
            this.SWITCHAudio.seek(0);
        };
    },

    onUnload: function() {
        let _this = this;
        this.endGame();
        this.destroy();
        // clearTimeout(this.chooseTime);
        // clearTimeout(this.curtainTime);
        this.setData({
            AnswerAnimation: null,
        })
    },

    onShareAppMessage: function(res) {
        let _this = this;
        let random = Math.floor(Math.random() * app.shareList.length);
        if (res.target && res.target.id == "shareGame") { //复活
            clearInterval(_this.reviveTime);
            var shareType = 4;
            var sharetypeUrl = Loginfunc.domin + `api/addchannel`;
        };

        if (res.target && res.target.id == "helpShareBtn") { //增加戳洞次数
            var shareType = 5;
            var sharetypeUrl = Loginfunc.domin + `api/addgamechs`
        };

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
                                Loginfunc.requestURl(app, sharetypeUrl, "POST", {
                                    user_id: app.user_id,
                                    encryptedData: encryptedData,
                                    iv: iv,
                                    type: shareType
                                }, function(data) {
                                    console.log('sharetypeUrl', data);
                                    if (data.code == 200) {
                                        if (shareType == 4) {
                                            _this.resurrection = true;
                                            for (let i = 0; i < _this.data.answerList.length; i++) {
                                                _this.data.answerList[i].showAerror = false;
                                            }
                                            _this.setData({
                                                showCountdownMask: false,
                                                answerList: _this.data.answerList
                                            });
                                            wx.showToast({
                                                title: '复活成功',
                                                icon: 'success',
                                            });
                                        };
                                        if (shareType == 5) {
                                            app.gamechs = parseInt(data.gamechs);
                                            _this.shareTime++
                                                _this.setData({
                                                    showHelpMask: false,
                                                    gamechs: app.gamechs
                                                });
                                            wx.showToast({
                                                title: `电池+${data.gamechs}`,
                                                icon: 'success',
                                            });
                                        };

                                        _this.setData({
                                            chooseAnswer: 'chooseAnswer',
                                            moveposition: 'moveposition'
                                        });
                                    } else {
                                        wx.showToast({
                                            title: `${data.msg}`,
                                            icon: 'none',
                                        });
                                        if (res.target && res.target.id == "shareGame") {
                                            _this.setData({
                                                showCountdownMask: true,
                                            })
                                        }

                                    }
                                });
                            }
                        })
                    } else {
                        if (shareType == 4) {
                            wx.showToast({
                                title: '复活失败,请分享到群',
                                icon: 'none',
                            });
                        };
                        if (shareType == 5) {
                            wx.showToast({
                                title: '分享好友失败,请分享到群',
                                icon: 'none',
                            }); 
                        }

                        if (res.target && res.target.id == "shareGame") {
                            _this.setData({
                                showCountdownMask: true,
                            })
                        }
                    }
                } else {
                    wx.showToast({
                        title: '分享成功',
                        icon: 'none',
                    });
                }
                if (app.globalData.musicStatus) {
                    app.globalData.music.play();
                }

            },
            fail: function(data) {
                wx.showToast({
                    title: '分享失败',
                    icon: 'none',
                });
                if (res.target && res.target.id == "shareGame") {
                    _this.setData({
                        showCountdownMask: true,
                    })
                }
                if (app.globalData.musicStatus) {
                    setTimeout(function () {
                        app.globalData.music.play();

                    }, 200)
                }

            }
        };
    },

    moveposition: function(e) {
        if (app.gamechs <= 0) {
            // this.shareTime++;
            console.log('????????????????', this.shareTime)
            if (this.shareTime >= this.CountShareTime) {
                this.setData({
                    showChallengeMask: true
                })
            } else {
                this.setData({
                    showHelpMask: true
                })
            }
            return;
        }
        app.gamechs--;
        this.setData({
            gamechs: app.gamechs,
            ifShowSub: 1,
        })
        let _this = this;
        let x = e.touches[0].pageX;
        let y = e.touches[0].pageY;
        wx.createSelectorQuery().select('.titlMask').boundingClientRect(function(rect) {
            _this.SWITCHAudio.play();
            _this.setData({
                width: (-rect.width / 2) + x,
                height: (-rect.height / 2) + y,
            })
            _this.gifTime = setTimeout(function() {
                _this.setData({
                    ifShowSub: 0,
                })
            }, 600)
        }).exec()
    },

    chooseAnswer: function(e) {
        let _this = this;
        this.setData({
            chooseAnswer: '',
            moveposition: '',
            AnswerAnimation: null,
        });
        let options = e.currentTarget.dataset.num;
        let index = parseInt(e.currentTarget.dataset.index);
        let submitAnswerURl = Loginfunc.domin + `api/getanswer2`;
        Loginfunc.requestURl(app, submitAnswerURl, "POST", {
            answer: options,
            imgid: _this.topicNum,
            user_id: app.user_id,
            num: _this.currentTopic,
        }, function(data) {
            console.log('submitAnswerURl', data);
            if (data.code && data.code == 200) {
                _this.data.answerList[index].showAok = true;
                _this.OKAudio.seek(0);
                _this.OKAudio.play();
                _this.setData({
                    answerList: _this.data.answerList,
                    maskOpacity: 0,
                    ifShowGif: 1,
                });
                if (_this.currentTopic < app.globalData.questionNum) {
                    _this.getTheTopicDry();
                } else {
                    _this.currentTopic++
                };
                _this.chooseTime = setTimeout(function() {
                    _this.setData({
                        ifShowGif: 0,
                        maskOpacity: 1,
                    })
                    if (data.code && data.code == 200) {
                        if (_this.currentTopic == app.globalData.questionNum + 1) {
                            _this.endGame();
                            wx.redirectTo({
                                url: '/pages/redBao/redBao'
                            })
                        } else {

                        }
                    }
                }, 2000)

            };
            if (data.code && data.code == 201) {
                _this.data.answerList[index].showAerror = true;
                _this.setData({
                    answerList: _this.data.answerList,
                    maskOpacity: 1,
                    ifShowGif: 0,
                })
                _this.ERRORAudio.seek(0);
                _this.ERRORAudio.play();
                wx.vibrateLong();
                if (!_this.resurrection) {
                    _this.setData({
                        showCountdownMask: true,
                    });
                } else {
                    _this.setData({
                        showCountdownMask: true,
                        showcountdownTOP: false,
                        countbodyHeight: 400,
                        shareTextstage: '重新开始吧~',
                    });
                }
            };

        });
    },

    getTheTopicDry: function() {
        let _this = this;
        let getTheTopicDryUrl = Loginfunc.domin + `api/getproblems3`;
        this.setData({
            botImgUrl: `/assets/player/mask${app.globalData.hard[this.currentTopic]}.png`,
            width: 0,
            hieght: 0,
        })
        this.currentTopic++;
        Loginfunc.requestURl(app, getTheTopicDryUrl, "POST", {
            img_id: _this.titleArr,
            num: _this.currentTopic,
            user_id: app.user_id,
        }, function(data) {
            console.log('getTheTopicDryUrl', data);
            if (_this.currentTopic == 1) {
                _this.setData({
                    LeftCurtainAnimation: _this.LeftCurtainAnimation,
                    RightCurtainAnimation: _this.RightCurtainAnimation,
                });
            }
            if(data==undefined){
                wx.showModal({
                    title: '提示',
                    content: '网络异常,请稍后再试',
                    showCancel: false,
                    success: function (res) {
                        wx.reLaunch({
                            url: '/pages/index/index'
                        })
                    }
                });
                return;
            }
            if (data.code && data.code == 200) {
                _this.topicNum = data.data.imgid; //题目编号
                _this.titleArr.push(data.data.imgid); //去重编号
                let answer = data.data.answer.split('|');
                let answerList = [];
                for (let i = 0; i < answer.length; i++) {
                    let objanswer = {
                        options: answer[i].split(':')[0],
                        answer: answer[i].split(':')[1]==undefined?'其他':answer[i].split(':')[1].slice(0, 6),
                        showAok: false,
                        showAerror: false,
                    }
                    answerList.push(objanswer);
                }

                if (_this.currentTopic == 1) {
                    _this.setDataListTime = setTimeout(function() {
                        _this.setData({
                            maskOpacity: 1,
                            currentTopic: _this.currentTopic,
                            // topicURL: Loginfunc.QiNiuURl + data.data.link,
                            answerList: answerList,
                            answershow: 0,
                            topicType: data.data.type,
                        })
                    }, 0)

                    _this.setTopicLoadTime = setTimeout(function() {
                        _this.setData({
                            topicURL: Loginfunc.QiNiuURl + data.data.link,
                        })
                    }, 120)
                } else {
                    _this.setDataListTime = setTimeout(function() {
                        _this.setData({
                            maskOpacity: 1,
                            currentTopic: _this.currentTopic,
                            // topicURL: Loginfunc.QiNiuURl + data.data.link,
                            answerList: answerList,
                            answershow: 0,
                            topicType: data.data.type,
                        })
                    }, 1800)

                    _this.setTopicLoadTime = setTimeout(function() {
                        _this.setData({
                            topicURL: Loginfunc.QiNiuURl + data.data.link,
                        })
                    }, 1880)
                }
            } else {
                wx.showModal({
                    title: '提示',
                    content: `${data.msg}`,
                    showCancel: false,
                    success: function(res) {
                        _this.endGame();
                        wx.navigateBack({
                            delta: 1
                        })
                    }
                })
            }
        });
    },

    receveGame: function() {
        let _this = this;
        // this.endGame();
        // wx.navigateBack({
        //     delta: 1
        // })
        this.setData({
            showChallengeMask: false
        })
    },

    receveGame2: function() {
        let _this = this;
        this.endGame();
        wx.navigateBack({
            delta: 1
        })
        this.setData({
            showChallengeMask: false
        })
    },

    creatOKAudioFun: function() {
        this.OKAudio = wx.createInnerAudioContext();
        this.OKAudio.autoplay = false;
        this.OKAudio.src = '/assets/audio/ok3.mp3';
        this.OKAudio.volume = 1;
    },

    creatERRORAudioFun: function() {
        this.ERRORAudio = wx.createInnerAudioContext();
        this.ERRORAudio.autoplay = false;
        this.ERRORAudio.src = '/assets/audio/error2.mp3';
        this.ERRORAudio.volume = 1;
    },

    creatSWITCHAudioFun: function() {
        this.SWITCHAudio = wx.createInnerAudioContext();
        this.SWITCHAudio.autoplay = false;
        this.SWITCHAudio.src = '/assets/audio/switch.mp3';
        this.SWITCHAudio.volume = 1;
    },

    _createLeftCurtainAnimations() {
        let animate = wx.createAnimation({
            timingFunction: "linear",
            duration: 9000
        });
        animate.translateX(-402).step();
        this.LeftCurtainAnimation = animate.export();
    },

    _createRightCurtainAnimations() {
        let animate = wx.createAnimation({
            timingFunction: "linear",
            duration: 9000
        });
        animate.translateX(402).step();
        this.RightCurtainAnimation = animate.export();
    },

    _createAnswerAnimations() {
        let animate = wx.createAnimation({
            timingFunction: "ease-in-out",
            duration: 2100
        });
        animate.translateY(200).opacity(0).step({
            timingFunction: "step-start",
            duration: 10
        });
        animate.translateY(0).opacity(1).step({
            timingFunction: "linear",
            duration: 2000,
            delay: 90
        });
        this.AnswerAnimation = animate.export();
    },

    _createCurtainTextAnimations() {
        let animate = wx.createAnimation({
            timingFunction: "ease-in-out",
            duration: 1000
        });

        animate.translateY(300).opacity(0).step({
            timingFunction: "step-start",
            duration: 10
        });

        animate.translateY(0).opacity(1).step({
            timingFunction: "linear",
            duration: 1000,
            delay: 90
        });
        animate.translateY(-200).opacity(0).step({
            timingFunction: "step-start",
            duration: 10,
            delay: 800
        });

        this.CurtainTextAnimation = animate.export();
    },


    destroy: function() {
        if (this.OKAudio) {
            this.OKAudio.destroy();
        };
        if (this.ERRORAudio) {
            this.ERRORAudio.destroy();
        };
        if (this.SWITCHAudio) {
            this.SWITCHAudio.destroy();
        };
        clearTimeout(this.chooseTime);
        clearInterval(this.reviveTime);
        clearTimeout(this.setTopicLoadTime);
        clearTimeout(this.setDataListTime);
        clearTimeout(this.imgLoadTime);
        clearTimeout(this.showTime2);
        clearTimeout(this.gifTime);
    },

    endGame: function() {
        let endGameUrl = Loginfunc.domin + `api/end`;
        Loginfunc.requestURl(app, endGameUrl, "POST", {
            user_id: app.user_id
        }, function(data) {
            console.log('endGameUrl', data)
        });
    },

    closenochanceMask: function() {
        this.setData({
            showHelpMask: false,
        });
        // wx.navigateBack({
        //     data: 1
        // })
    },

    imgUrlLoad: function(e) {
        let _this = this;
        this.setData({
            answershow: 1,
        });
        this.imgLoadTime = setTimeout(function() {
            _this.setData({
                chooseAnswer: 'chooseAnswer',
                moveposition: 'moveposition',
                CurtainTextAnimation: _this.CurtainTextAnimation,
                AnswerAnimation: _this.AnswerAnimation,
            })
        }, 80)

    },

    closeUserNav: function() {
        app.globalData.ifshownewuser = 1;
        this.setData({
            ifnewuser: false,
        })
    },
})