function appendHTML(dom, html) {
    var divTemp = document.createElement("div"), nodes = null
        , fragment = document.createDocumentFragment();
    divTemp.innerHTML = html;
    nodes = divTemp.childNodes;
    for (var j = 0, length = nodes.length; j < length; j += 1) {
        fragment.appendChild(nodes[j].cloneNode(true));
    }
    dom.appendChild(fragment);
    nodes = null;
    fragment = null;
}

function showRequestSuccess(vm) {
    var len = arguments.length;
    setDataChanged(false);
    for (var submitKey in vm.submitCfgData) {
        vm.apiData.configData[submitKey] = vm.submitCfgData[submitKey];
    }
    if (len == 1) {
        showRequestSuccessWithInfo(arguments[0], vm.$t("SubmitSuccess"));
    } else if (len == 2) {
        showRequestSuccessWithInfo(arguments[0], arguments[1]);
    }

}

function showRequestSuccessWithInfo(vm, info) {
    vm.$notification["success"]({
        message: info,
        key:"successInfo",
        duration: 2,
    });
}


function showErrorInfo(vm, info) {
    vm.$notification["error"]({
        message: info,
        duration: 5,
        key:"errorInfo"
    });
    vm.loading = false;
}

function showWarningInfo(vm, info) {
    vm.$notification["warning"]({
        message: info,
        duration: 5,
    });
    vm.loading = false;
}
function isAnInterger(postData, DestEleId) {
    var Letters = "1234567890";
    var i;
    var c;

    for (i = 0; i < postData.length; i++) {
        c = postData.charAt(i);
        if (-1 == Letters.indexOf(c)) {
            return false;
        }
    }

    if (!checkLengthOfData(postData, 0, 63)) {
        return false;
    }
    return true;
}

function checkLengthOfData(postData, min_num, max_num) {
    var len = checkLength(postData);
    if (len < min_num || len > max_num) {
        return false;
    }

    return true;
}
function checkLength(destStr, destLen) {
    var byteLen = 0;
    var len = destStr.length;
    if (null != destStr) {
        for (var i = 0; i < len; i++) {
            if (destStr.charCodeAt(i) < 0x080) {
                byteLen += 1;
            }
            else if (destStr.charCodeAt(i) < 0x0800) {
                byteLen += 2;
            }
            else {
                byteLen += 3;
            }
        }
        return byteLen;
    }
    else {
        return 0;
    }

}
function isPort(postData) {
    if (!isAnInterger(postData)) {
        return false;
    }

    if (0 == postData.length) {
        return true;
    }

    if (Number(postData) > 65535 || Number(postData) <= 0 || postData.length < 0 || postData.length > 5) {
        //alert(DataRangeWarning);
        return false;
    }

    return true;
}
function getTransTitle(title, vm) {
    let index = title.indexOf("$t('");
    if (index == -1) {
        return title;
    } else {
        let lastIndex = title.substring(index, title.length).indexOf("')");
        let item = title.substring(index + 4, lastIndex + index);
        return title.replace("$t('" + item + "')", vm.$t(item));
    }
}


function getType(obj) {
    //tostring会返回对应不同的标签的构造函数
    var toString = Object.prototype.toString;
    var map = {
        '[object Boolean]': 'boolean',
        '[object Number]': 'number',
        '[object String]': 'string',
        '[object Function]': 'function',
        '[object Array]': 'array',
        '[object Date]': 'date',
        '[object RegExp]': 'regExp',
        '[object Undefined]': 'undefined',
        '[object Null]': 'null',
        '[object Object]': 'object'
    };
    if (obj instanceof Element) {
        return 'element';
    }
    return map[toString.call(obj)];
}

function deepClone(data) {
    var type = getType(data);
    var obj;
    if (type === 'array') {
        obj = [];
    } else if (type === 'object') {
        obj = {};
    } else {
        //不再具有下一层次
        return data;
    }
    if (type === 'array') {
        for (var i = 0, len = data.length; i < len; i++) {
            obj.push(deepClone(data[i]));
        }
    } else if (type === 'object') {
        for (var key in data) {
            obj[key] = deepClone(data[key]);
        }
    }
    return obj;
}

function getIndexByKey(data, key) {
    return data
        .map((item) => item.key)
        .indexOf(key);
}

function getItemByKey(data, contentKey, itemKey) {
    let contentIndex = getIndexByKey(data.contents, contentKey);
    let itemIndex = getIndexByKey(data.contents[contentIndex].items, itemKey);
    return data.contents[contentIndex].items[itemIndex];
}

function getContentByKey(data, contentKey) {
    let contentIndex = getIndexByKey(data.contents, contentKey);
    return data.contents[contentIndex];
}

function checkFileFormat(uploadFileName, fileType, expandLenth) {
    if (uploadFileName == "") {
        return false;
    }
    var fileExpand = uploadFileName.substring(uploadFileName.length - expandLenth, uploadFileName.length);
    if (fileExpand.toUpperCase() != fileType.toUpperCase()) {
        //alert(FileFormatWarning);
        return false;
    }
    return true;
}

function notContainInvalid_Sub(postData) {
    // var Letters = "&=\'%*#^<>|＇＂";
    var Letters = "&=\'%";
    var i, c, j;
    for (i = 0; i < postData.length; i++) {
        c = postData.charCodeAt(i);
        for (j = 0; j < Letters.length; j++) {
            if (c == Letters.charCodeAt(j)) { return false; }
        }
    }
    return true;
}

function checkRangeOfNumber(postData, min_num, max_num) {
    if (!isAnInterger(postData)) {
        return false;
    }
    if (Number(postData) > max_num || Number(postData) < min_num) {
        return false;
    }
    return true;
}

function notContainInvalid(postData) {
    if (!checkLengthOfData(postData, 0, 63)) {
        return false;
    }
    return notContainInvalid_Sub(postData);
}

//return 1 代表小端口错误
//return 2 代表大端口错误
//return 3 代表大小端口都有错
function isPortUsed(minPort, maxPort, comparedPort) {
    for (var i = 0; i < comparedPort.length; i++) {
        if (comparedPort[i]) {
            if (Number(minPort) > Number(comparedPort[i].max) ||
                (Number(maxPort) < Number(comparedPort[i].min))){
                continue;
            }
            
            if (Number(minPort) > Number(comparedPort[i].min) && Number(maxPort) > Number(comparedPort[i].max)){
                return 1;
            } else if (Number(minPort) < Number(comparedPort[i].min) && Number(maxPort) < Number(comparedPort[i].max)){
                return 2;
            } else{
                return 3;
            }
        }
    }
    return 0;
}
function getEnableSelectItems(vm) {
    return [{ key: 0, label: vm.$t("Disabled") }, { key: 1, label: vm.$t("Enabled") }];
}

function checkIpAddr(ipStr) {
    if (!checkIpAddr_Simp(ipStr))
        return false;
    return true;
}

function checkIpAddr_Simp(ipStr) {
    var strlength = ipStr.length;
    if (ipStr == "") {
        return false;
    }
    if (strlength > 15 || (strlength < 7 && strlength > 0)) //IP的字段长度的限制 
    {
        return false;
    }
    var patrn = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;//正则表达式，\d为数字,{1,3}一位或为三位. 
    if (!patrn.exec(ipStr)) {
        return false;
    }
    var laststr;
    laststr = ipStr.split(".");    //用.把字符串str分开 
    var last_patrn = /^\d{1,3}$/;
    if (parseInt(laststr[0]) > 255 || parseInt(laststr[1]) > 255 || parseInt(laststr[2]) > 255 || parseInt(laststr[3]) > 255) //判断IP每位的大小 
    {
        return false;
    }
    if (!last_patrn.exec(laststr[3])) {
        return false;
    }
    return true;
}

function binValOfNum(Val) {
    var tmp = parseFloat(Val).toString(2);
    var tmpZ;
    if (0 == tmp) { return "00000000"; }
    if (tmp.length < 8) {
        tmpZ = ""
        var i = 0;
        while (i < 8 - tmp.length) {
            tmpZ = "0" + tmpZ;
            i++;
        }
        tmp = tmpZ + tmp;
    }
    return tmp;//格式化输出(补零) 
}

function checkSubMaskV4(ipStr, subnetMask) {
    if (!checkIpAddr_Simp(ipStr) || !checkIpAddr_Simp(subnetMask)) {
        return false;
    }
    if ("255.255.255.255" == subnetMask
        || "255.255.255.254" == subnetMask
        || "0.0.0.0" == subnetMask) {
        return false;
    }
    var subMArr = subnetMask.split(".");
    var subMBinStr = binValOfNum(subMArr[0]) + binValOfNum(subMArr[1]) + binValOfNum(subMArr[2]) + binValOfNum(subMArr[3]);
    if (-1 != subMBinStr.indexOf("01")) {
        return false;
    }
    var ipArr = ipStr.split(".");
    var ipBinStr = binValOfNum(ipArr[0]) + binValOfNum(ipArr[1]) + binValOfNum(ipArr[2]) + binValOfNum(ipArr[3]);
    if (ipBinStr == ipBinStr & subMBinStr) { return false; }
    return true;
}

function notContainInvalid_NotEmpty(postData) {
    if (!checkLengthOfData(postData, 1, 63)) {
        return false;
    }

    return notContainInvalid_Sub(postData);
}

function isHour(postData) {
    var Letters = "1234567890";
    var i;
    var c;
    //var hasDigit; 
    for (i = 0; i < postData.length; i++) {
        c = postData.charAt(i);
        if (-1 == Letters.indexOf(c)) {
            return false;
        }
    }

    if (0) {
        if (Number(postData) > 12 || Number(postData) < 0)
            return false;
    }
    else {
        if (Number(postData) > 23 || Number(postData) < 0) {
            //alert(InvalidTimeWarning);
            return false;
        }
    }

    if (postData.length > 2 || postData.length < 1) {
        return false;
    }

    return true;
}

function isMinuteOrSec(postData) {
    if (!isAnInterger(postData)) {
        //alert(InvalidTimeWarning);
        return false;
    }

    if (Number(postData) > 59 || Number(postData) < 0) {
        //alert(InvalidTimeWarning);
        return false;
    }

    if (postData.length > 2 || postData.length < 1) {
        return false;
    }

    return true;
}

function checkFileSize(inputFile, UpLimit, LowerLimit) {
    try {
        var byteSize = inputFile.size;
        var MbyteSize = Math.ceil(byteSize / 1024);// Size returned in KB.
        if (MbyteSize >= UpLimit) {
            //file too large
            return -2;
        }
        else if (MbyteSize < LowerLimit) {
            //file too small
            return -3;
        }
        else if (0 == MbyteSize) {
            return -1;
        }
        return 0;
    } catch (e) {
        return 0;
    }
}

function isAValidDialedNumber(postData) {
    if (!checkLengthOfData(postData, 0, 63)) {
        return false;
    }

    if (!isDigitOrAlphabetMouseSign(postData)) {
        return false;
    }
    return true;
}

function isDigitOrAlphabetMouseSign(postData) {
    for (let i = 0; i < postData.length; i++) {
        let n = postData.charCodeAt(i);
        if (!((n >= 48 && n <= 57) || (n >= 65 && n <= 90) || (n >= 97 && n <= 122) || 64 == n || 46 == n || 43 == n || 45 == n || 42 == n)) {
            return false;
        }
    }
    return true;
}

function dateFtt(fmt, date) {
    var o = {
        "M+": date.getMonth() + 1,     //月份 
        "d+": date.getDate(),     //日 
        "h+": date.getHours(),     //小时 
        "m+": date.getMinutes(),     //分 
        "s+": date.getSeconds(),     //秒 
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
        "S": date.getMilliseconds()    //毫秒 
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}

function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    var strTime = hours + ':' + minutes + ':' + seconds + ' ' + ampm;
    return strTime;
}

function onWebHangup(vm) {
    let requestData = {
        target: "phoneCall",
        action: "hangup",
    };
    vm.$axios.post("api", requestData).then((response) => {
        let retcode = response.data.retcode;
        if (retcode == 0) {
            showRequestSuccessWithInfo(vm, vm.$t("SendSuccess"));
        } else if (retcode == -2) {
            showErrorInfo(vm, vm.$t("CallFailedWarn"));
        }
    });
}

function onWebDial(vm,number,account,isNumber){
    var accountNumber = "";
    if(isNumber){
        accountNumber = account;
        account = "";
    }
    let requestData = {
        target: "phoneCall",
        action: "dial",
        data: {
          number: number,
          account: account,
          accountNumber: accountNumber,
        },
      };
    vm.$axios.post("api", requestData).then((response) => {
    let retcode = response.data.retcode;
    if (retcode == 0) {
        showRequestSuccessWithInfo(vm, vm.$t("DialOutSuccess"));
    } else if (retcode == -2) {
        showErrorInfo(vm, vm.$t("CallFailedWarn"));
    } else if (retcode == -3) {
        showErrorInfo(vm, vm.$t("PhoneTalkingWarning"));
    }
    });
}

const langMap = new Map([
    [0, "ENGLISH"],
    [1, "CHINESE_S"],
    [2, "CHINESE_T"],
    [3, "RUSSIAN"],
    [4, "CZECH"],
    [5, "PORTUGUESE"],
    [6, "SPANISH"],
    [8, "DUTCH"],
    [9, "FRENCH"],
    [10, "GERMAN"],
    [13, "POLISH"],
    [14, "TURKISH"],
    [15, "JAPANESE"],
    [16, "MONGOLIA"],
    [17, "VIETNAMESE"],
]);

function getLangArray(vm) {
    return [
        { key: 0, label: vm.$t("English") },
        { key: 1, label: vm.$t("Chinese") },
        // { key: 2, label: vm.$t("ChineseTr") },
        // { key: 3, label: vm.$t("Russian") },
        // { key: 4, label: vm.$t("Czech") },
        // { key: 5, label: vm.$t("Portuguese") },
        // { key: 6, label: vm.$t("Spanish") },
        // { key: 8, label: vm.$t("Dutch") },
        // { key: 9, label: vm.$t("French") },
        // { key: 10, label: vm.$t("Germany") },
        // { key: 13, label: vm.$t("Polish") },
        // { key: 14, label: vm.$t("Turkish") },
        // { key: 15, label: vm.$t("Japanese") },
        // { key: 16, label: vm.$t("Mongolia") },
        // { key: 17, label: vm.$t("Vietnamese") },
    ];
}

function getAccountStatusStr(vm, str) {
    if (str == "2") {
        return vm.$t('Registered');
    }
    else if (str == "1") {
        return vm.$t('Registering');
    }
    else if (str == "3") {
        return vm.$t('RegistrationFailed');
    }
    else if (str == "0") {
        return vm.$t('Disabled');
    }
    else {
        return vm.$t('UnRegistered');
    }
}

function isValidLoginPsw(str)
{
	var bUpper = false;
	var bLower = false;
	var bDigits = false;
	var nFlag = 0;
	var c,charCode;
	if(8 <= str.length && 20 >= str.length)
		nFlag += 1;
	for(var i = 0; i < str.length;i++)
	{
		c = str.charAt( i ); 
		charCode = c.charCodeAt();
		if(65 <= charCode && 90 >= charCode && false == bUpper)
		{
			bUpper = true;
			nFlag += 8;
		}
		else if(97 <= charCode && 122 >= charCode && false == bLower)
		{
			bLower = true;
			nFlag += 4;
		}
		else if(48 <= charCode && 57 >= charCode && false == bDigits)
		{
			bDigits = true;
			nFlag += 2;
		}
	}

	return nFlag;
}

var dataChanged = false;

function getDataChanged(){
    return dataChanged;
}

function setDataChanged(value){
    dataChanged = value;
}

var isExitBySessionTimeOutFlag = false;

function isExitBySessionTimeOut(){
    return isExitBySessionTimeOutFlag;
}

function setExitBySessionTimeOut(flag){
    isExitBySessionTimeOutFlag = flag;
}

function checkShellRule(postData){
    var Letters = "~!#$%^&*={}[];\"'\\|/?,<>\`";
    var i, c, j;
    for (i = 0; i < postData.length; i++) {
        c = postData.charCodeAt(i);
        for (j = 0; j < Letters.length; j++) {
            if (c == Letters.charCodeAt(j)) { return false; }
        }
    }
    return true;
}

export {
    appendHTML,
    showRequestSuccess,
    showErrorInfo,
    isPort,
    getTransTitle,
    deepClone,
    getIndexByKey,
    getItemByKey,
    checkFileFormat,
    notContainInvalid,
    checkRangeOfNumber,
    isPortUsed,
    isAnInterger,
    getEnableSelectItems,
    checkIpAddr,
    checkSubMaskV4,
    notContainInvalid_NotEmpty,
    isHour,
    isMinuteOrSec,
    checkFileSize,
    showWarningInfo,
    isAValidDialedNumber,
    showRequestSuccessWithInfo,
    dateFtt,
    formatAMPM,
    onWebHangup,
    onWebDial,
    getAccountStatusStr,
    langMap,
    getLangArray,
    isValidLoginPsw,
    notContainInvalid_Sub,
    setDataChanged,
    getDataChanged,
    isExitBySessionTimeOut,
    setExitBySessionTimeOut,
    checkShellRule,
    getContentByKey
}