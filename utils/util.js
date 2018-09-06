// 字符串截取len位加...
const formatName = (str, len) => {
    var length = str.lenght;
    if (length === void 0) {
        length = len + 3;
    }
    var r = /[^\x00-\xff]/g;
    if (str.replace(r, "mm").length <= length) {
        return str + "";
    }
    var m = Math.floor(length / 2);
    for (var i = m; i < str.length; i++) {
        if (str.substring(0, i).replace(r, "mm").length >= length) {
            return str.substring(0, i) + "...";
        }
    }
    return str + "";
};

// 格式化秒数
const formatTime = (timestamp, format) => {
    // 10位时间戳
    var time = new Date(timestamp * 1000);
    var format = "yyyy-mm-dd hh:mm:ss";
    var y = time.getFullYear();
    var m = time.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = time.getDate();
    d = d < 10 ? ('0' + d) : d;
    var h = time.getHours();
    h = h < 10 ? ('0' + h) : h;
    var minute = time.getMinutes();
    var second = time.getSeconds();
    minute = minute < 10 ? ('0' + minute) : minute;
    second = second < 10 ? ('0' + second) : second;
    format = format.replace("yyyy", y + "");
    format = format.replace("mm", m + '');
    format = format.replace("dd", d + '');
    format = format.replace('hh', h + '');
    format = format.replace('mm', minute + '');
    format = format.replace('ss', second + '');
    return format;
};

const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

const formatTime2 = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
};

const sortingAdData = (data) => {
    let adOneList = data;
    let adOneWeightArr = [];
    for (let i = 0; i < adOneList.length; i++) {
        let len = adOneList[i].weight;
        for (let n = 0; n < len; n++) {
            adOneWeightArr.push(i);
        }
    };
    let random = Math.floor(Math.random() * adOneWeightArr.length);
    return data[adOneWeightArr[random]] || null;
};

let shareTitle = ['快来帮我猜猜这是什么歌？一起领红包', '这是什么歌，答对领红包','这首歌我猜不到，你会吗？'];
let shareImg = ['/assets/share1.png', '/assets/share2.png', '/assets/share3.png', '/assets/share4.png', '/assets/share5.png', '/assets/share6.png'];

module.exports = {
    formatName: formatName,
    formatTime: formatTime,
    formatTime2: formatTime2,
    formatNumber: formatNumber,
    sortingAdData: sortingAdData,
    shareTitle: shareTitle,
    shareImg: shareImg,
}