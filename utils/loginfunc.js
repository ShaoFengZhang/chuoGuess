const domin = "https://xcx12.datikeji.com/";
const LoginURl = `${domin}api/login`;
const checkUserUrl = `${domin}api/getuserinfo`;
const QiNiuURl = `https://tp.datikeji.com/`;
import md5 from './md5.js';

const md5pition = (data) => {
    let secret = 'sld4s34f2o5sWe';
    data.timestamp = Date.parse(new Date());
    let str = '';
    let arr = Object.keys(data).sort();
    for (var i in arr) {
        if (arr[i] === 'signature') {
            continue
        }
        if (str !== '') {
            str += '&'
        }
        if (data[arr[i]]) {
            str += arr[i] + '=' + encodeURI(data[arr[i]])
        }
    };
    if (str !== '') {
        str += '&'
    };
    str += 'secret=' + secret;
    let encrypted = md5.hexMD5(str).toUpperCase();
    data.signature = encrypted;
    return data;
};

const wxloginfnc = (app) => {
    wx.login({
        success: res => {
            let data = {
                code: res.code
            };
            let data2 = md5pition(data);
            wx.request({
                url: LoginURl,
                method: "POST",
                data: data2,
                success: function(value) {
                    app.globalData.user_session = value.data.data;
                    wx.setStorageSync('user_session', value.data.data);
                }
            });
        },
    })
};

const wxloginfnc2 = (app, _this) => {
    wx.login({
        success: res => {
            wx.request({
                url: LoginURl,
                method: "POST",
                data: {
                    code: res.code
                },
                success: function(value) {
                    console.log('LoginURl', value);
                    app.user_id = value.data.user_id;
                    app.isnew = value.data.isnew;
                    if (value.data.isnew == 1) {
                        _this.setData({
                            showdollermask: true,
                            dollerNum: value.data.money
                        })
                    }
                    getDailyChannel(app, _this);
                    getSettingfnc(app);
                }
            });
        },
    })
};

const getDailyChannel = function(app, _this) {
    let getDailyChannel = domin + `api/getDailyChannel`;
    requestURl2(app, getDailyChannel, "POST", {
        user_id: app.user_id,
    }, function(data) {
        app.getLoadReward = data.getLoadReward; //1 已经获得奖励 没有获得奖励
        console.log('getDailyChannel', app.getLoadReward);
        _this.setData({
            ifShowChanceMask: data.getLoadReward == 1 ? true : false,
        })
    });
};

const getSettingfnc = (app) => {
    wx.getSetting({
        success: res => {
            if (res.authSetting['scope.userInfo']) {
                wx.getUserInfo({
                    lang: "zh_CN",
                    success: res => {
                        app.globalData.userInfo = res.userInfo;
                        console.log('??????????', res.userInfo)
                        checkUserInfo(app, res);
                        if (app.userInfoReadyCallback) {
                            app.userInfoReadyCallback(res);
                        }
                    }
                })
            }
        }
    })
};

const checkUserInfo = (app, res) => {
    console.log("88888888")
    if (wx.getStorageSync('rawData') != res.rawData) {
        console.log("9999999999")
        wx.setStorage({
            key: "rawData",
            data: res.rawData
        })
        requestURl2(app, checkUserUrl, "POST", {
            // encryptedData: res.encryptedData,
            // iv: res.iv,
            userinfo: res.rawData,
            user_id: app.user_id
        }, function(data) {
            console.log('checkUser', data);
        });
    }
};

const requestURl = (app, url, method, data, cb) => {
    let data2 = md5pition(data);
    wx.request({
        url: url,
        header: {
            'content-type': 'application/x-www-form-urlencoded',
            'Accept': '+json',
            'cookie': 'SESSION=' + wx.getStorageSync('user_session')
        },
        data: data2,
        method: method,
        success: function(resdata) {
            if (resdata.data.code == 201) {
                wxloginfnc(app);
                requestURl(app, url, method, data, cb);
            } else {
                cb(resdata.data);
            }
        },
        fali: function() {
            wx.showToast({
                title: "网络异常",
                icon: 'loading',
                duration: 2000
            })
        }
    })
};

const requestURl2 = (app, url, method, data, cb) => {
    wx.request({
        url: url,
        header: {
            'content-type': 'application/x-www-form-urlencoded',
            'Accept': '+json',
        },
        data: data,
        method: method,
        success: function(resdata) {
            // console.log(url, resdata);
            cb(resdata.data);
        },
        fali: function(res) {
            wx.showModal({
                title: '提示',
                content: '网络异常,请稍后再试',
                showCancel: false,
                success: function (res) { }
            })
        },
        complete: function(res) {
           
            if (!res.statusCode) {
                wx.hideLoading();
                wx.showModal({
                    title: '提示',
                    content: '网络异常,请稍后再试',
                    showCancel: false,
                    success: function (res) {
                        wx.reLaunch({
                            url: '/pages/index/index'
                        })
                    }
                })
            }

        }
    })
};

module.exports = {
    wxloginfnc: wxloginfnc2,
    getSettingfnc: getSettingfnc,
    checkUserInfo: checkUserInfo,
    requestURl: requestURl2,
    domin: domin,
    QiNiuURl: QiNiuURl,
}