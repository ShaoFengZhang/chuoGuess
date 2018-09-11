const app = getApp()
import Loginfunc from '../../utils/loginfunc.js';
import util from '../../utils/util.js';

Page({

    data: {},

    onLoad: function(options) {
        wx.showLoading({
            title: 'loading',
            mask: true,
        });
        this.canvansBgList = ['../../assets/usercenter/pikachu.png', '../../assets/usercenter/ta.png', '../../assets/usercenter/xiangjiao.png'];
        this.canvasbg = this.canvansBgList[Math.floor(Math.random() * this.canvansBgList.length)];

    },

    onShow: function() {
        this.getMydata();
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
        };
    },

    showOffRecord: function() {
        wx.showLoading({
            title: '绘制中',
            mask: true,
        });
        wx.canvasToTempFilePath({
            destWidth: this.data.bgimgW * 6,
            destHeight: this.data.bgimgH * 6,
            canvasId: 'canvas',
            success: function(res) {
                wx.hideLoading();
                wx.saveImageToPhotosAlbum({
                    filePath: res.tempFilePath,
                    success: function() {
                        wx.showModal({
                            title: '温馨提示',
                            content: '图片已保存成功,快去分享朋友圈吧!',
                            showCancel: false,
                            success: function(data) {
                                wx.previewImage({
                                    urls: [res.tempFilePath]
                                })
                            }
                        });
                    },
                    fail: function() {
                        wx.previewImage({
                            urls: [res.tempFilePath]
                        })
                    }
                })
            }
        })
    },

    getMydata: function() {
        let _this = this;
        let myDataUrl = Loginfunc.domin + `api/getpercenter`;
        Loginfunc.requestURl(app, myDataUrl, "POST", {
            user_id: app.user_id,
        }, function(data) {
            console.log('myDataUrl', data);
            if (data.code == 200) {
                for(let i=0; i<data.data.length;i++){
                    data.data[i].account = data.data[i].account.toFixed(2);
                }
                _this.success_num = data.success_num;
                _this.setData({
                    user_avtime: data.avtime,
                    accumulative: data.accumulative,
                    available: data.available,
                    redBaoList: data.data,
                    success_num: parseInt(data.success_num * app.globalData.score_multiple),
                });
                app.globalData.accumulative = data.accumulative;
                app.globalData.available = data.available;
                // _this.drawcanvs();
                wx.hideLoading();
            } else {
                wx.showModal({
                    title: '提示',
                    content: '网络异常,请重试',
                    showCancel: false,
                    success: function(res) {
                        _this.getMydata();
                    }
                })
            }
        });
    },

    drawcanvs: function() {
        let _this = this;
        let ctx = wx.createCanvasContext('canvas');
        if (app.globalData.userInfo) {
            var userImg = app.globalData.userInfo.avatarUrl;
            var userName = app.globalData.userInfo.nickName.slice(0, 11);
        } else {
            var userImg = '../../assets/usercenter/userImg.jpg';
            var userName = '未授权用户';
        }
        console.log(userImg)
        wx.getImageInfo({
            src: this.canvasbg,
            success: function(res) {
                _this.setData({
                    bgimgH: res.height,
                    bgimgW: res.width,
                    bgimgUrl: res.path
                });
                ctx.drawImage(_this.canvasbg, 0, 0, res.width, res.height);
                ctx.drawImage('../../assets/usercenter/qr.jpg', 336, 283, 82, 82);
                ctx.setFontSize(20);
                ctx.setFillStyle('#BABFD3');
                ctx.setTextAlign('left');
                ctx.fillText("我已经猜中", 42, 328);
                ctx.setTextAlign('right');
                ctx.fillText("幅图啦~", 314, 328);
                ctx.setTextAlign('center');
                ctx.fillText(userName, 374, 260);
                ctx.fillText("快来帮我猜猜这是啥", 178, 368);
                ctx.setFillStyle('#F3BC7D');
                ctx.fillText(`${_this.success_num}`, 188, 328);
                wx.getImageInfo({
                    src: userImg,
                    success: function(res1) {
                        console.log(res1)
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(372, 202, 32, 0, 2 * Math.PI);
                        ctx.closePath();
                        ctx.clip();
                        ctx.drawImage(res1.path, 340, 170, 64, 64);
                        ctx.restore();

                        ctx.beginPath();
                        ctx.setLineWidth(2);
                        ctx.arc(372, 202, 33, 0, 2 * Math.PI);
                        ctx.setStrokeStyle('#BABFD3');
                        ctx.stroke();
                        ctx.draw();
                        wx.hideLoading();
                    }
                })


            }
        })
    },

    gotoWithdraw: function() {
        wx.showLoading({
            title: 'loading',
            mask: true,
        });

        wx.navigateTo({
            url: '/pages/withdraw/withdraw',
        })

        wx.hideLoading();
    }

})