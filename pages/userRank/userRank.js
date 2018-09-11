const app = getApp()
import Loginfunc from '../../utils/loginfunc.js';
import util from '../../utils/util.js';

Page({

    data: {
        userList: [],
    },

    onLoad: function(options) {
        wx.showShareMenu({
            withShareTicket: true
        });
        wx.showLoading({
            title: 'loading',
            mask: true,
        });
        this.getDataList();
        
    },

    onShow: function() {
        
    },

    onShareAppMessage: function() {
        let random = Math.floor(Math.random() * app.shareList.length);
        return {
            title: `${app.shareList[random].title}`,
            path: `pages/index/index?uid=${app.user_id}`,
            imageUrl: `${Loginfunc.QiNiuURl}${app.shareList[random].pic}`,
        };
    },

    getDataList: function() {
        let _this = this;
        let rankUrl = Loginfunc.domin + `api/getAllDraw`;
        Loginfunc.requestURl(app, rankUrl, "POST", {
            user_id: app.user_id
        }, function(data) {
            console.log(data);
            if (data.code == 200) {
                let userList = data.data;
                console.log(userList)
                for (let i = 0; i < userList.length; i++) {
                    if (userList[i].nick_name){
                        userList[i].nick_name = userList[i].nick_name.slice(0, 11);
                    }else{
                        userList[i].nick_name = '未授权用户';
                    }
                    if(i<3){
                        userList[i].nick_name = userList[i].nick_name.slice(0, 5);
                    }
                    userList[i].success_num = parseInt(userList[i].success_num * app.globalData.score_multiple);
                }
                _this.setData({
                    myImgUrl: data.avatar_url,
                    myName: data.nick_name.slice(0, 12),
                    myScore: parseInt(data.success_num * app.globalData.score_multiple) ,
                    userList: userList.slice(3),
                    firstUsre: userList.slice(0, 1),
                    secondUsre: userList.slice(1, 2),
                    threeUsre: userList.slice(2, 3),
                })
            } else {
                wx.showModal({
                    title: '提示',
                    content: '网络异常,请重试',
                    showCancel: false,
                    success: function(res) {
                        _this.getDataList();
                    }
                })
            };
            wx.hideLoading();
        });
    }
})