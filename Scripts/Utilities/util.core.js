//utility
; (function($){
    var util = window.util = {
        ajax: {},
        str: {},
        url: {},
        obj: {}
    };

    util.fixedNumber = function (number, precision) {
        var b = 1;
        if (isNaN(number)) return number;
        if (number < 0) b = -1;
        var multiplier = Math.pow(10, precision);
        return Math.round(Math.abs(number) * multiplier) / multiplier * b;
    };

    util.random = function (min, max) {
        var val = null;
        if (isNaN(min)) {
            min = 0;
        }
        if (isNaN(max)) {
            max = 100;
        }
        if (max == min) {
            return min;
        }
        var temp;
        if (max < min) {
            temp = max;
            max = min;
            min = temp;
        }
        while (true) {
            val = Math.random();
            val = parseInt(val * max, 10);
            if (val >= min && val < max) {
                break;
            }
        }
        return val;
    };

    //Ajax
    $.extend(util.ajax, {
        ajaxGet: function (url, args, complete, error, isAsync) {
            this._ajaxCall("GET", url, args, complete, error, isAsync);
        },

        ajaxPost: function (url, args, complete, error, isAsync) {
            this._ajaxCall("POST", url, args, complete, error, isAsync);
        },

        _ajaxCall: function (method, url, args, complete, error, isAsync) {
            $.ajax({
                type: method.toUpperCase() === "GET" ? "GET" : "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                url: url,
                async: isAsync === false ? false : true,
                data: (args === null || args === undefined) ? "{}" : args,
                success: function (data) {
                    if ($.isFunction(complete)) {
                        complete(data);
                    }
                },
                error: function (result, status) {
                    try {
                        //未经过身份验证，或者操作超过身份验证时间，则任何对服务器端的访问都会收到401(Unauthorized)错误。
                        //301或者302表示HTTP重定向
                        if (result.status == 401 || result.status == 302 || result.status == 0) {
                            alert("等待操作超时，您需要重新登录");
                            window.location.href = "/Account/Login";
                        } else if (result.status == 403) {
                            alert("您没有访问权限");
                            window.location.href = "/Account/Login";
                        } else {
                            if ($.isFunction(error)) {
                                if (result.responseText) {
                                    error($.parseJSON(result.responseText));
                                } else {
                                    var e2 = { Message: 'Unknown exception, error status is ' + result.status };
                                    error(e2);
                                }
                            }
                        }
                    } catch (e) { }
                }
            });
        }
    });

    //String
    $.extend(util.str, {
        empty: "",
        trim: function (str) {
            var c = arguments[1];
            if (!c) {
                c = " ";
            }
            return str.replace(/(^\s*)|(\s*$)/g, c);
        },
        lTrim: function (str) {
            var c = arguments[1];
            if (!c) {
                c = " ";
            }
            return str.replace(/(^\s*)/g, c);
        },
        rTrim: function (str) {
            var c = arguments[1];
            if (!c) {
                c = " ";
            }
            return str.replace(/(\s*$)/g, c);
        },
        isNullOrEmpty: function (str) {
            if (!str)
                return true;
            else if (str.length == 0)
                return true;
            else
                return false;
        },

        StrformatReg: /\\?\{([^{}]+)\}/gm,
        //格式化字符串，Format("He{0}{1}o", "l", "l") 返回 Hello
        stringFormat: function (str, params) {
            var Arr_slice = Array.prototype.slice;
            var array = Arr_slice.call(arguments, 1);
            return str.replace(this.StrformatReg, function (match, name) {
                if (match.charAt(0) == '\\')
                    return match.slice(1);
                var index = Number(name);
                if (index >= 0)
                    return array[index];
                if (params && params[name])
                    return params[name];
                return '';
            });
        },

        _weekFormat: function (week) {
            var name = "日一二三四五六";
            return "周" + name.charAt(week);
        },
        //格式化日期: y|Y 年; M 月; d|D 日; H|h 小时; m 分; S|s 秒; ms|MS 毫秒; wk|WK 星期;
        dateFormat: function (date, format, weekFormat) {
            if (!date) {
                date = new Date();
            } else if (typeof date === "string") {
                format = date;
                date = new Date();
            }
            if (!$.isFunction(weekFormat))
                weekFormat = this._weekFormat;

            var zero = "0";
            format = format.replace(/y+/i, function ($1) {
                var year = date.getFullYear() + "";
                return year.substring(year.length - $1.length);
            });
            var tempVal = null;
            var formatFunc = function ($1) {
                return ($1.length > 1 && tempVal < 10) ? zero + tempVal : tempVal;
            };
            tempVal = date.getMonth() + 1;
            format = format.replace(/M+/, formatFunc);
            tempVal = date.getDate();
            format = format.replace(/d+/i, formatFunc);
            tempVal = date.getHours();
            format = format.replace(/H+/, formatFunc);
            format = format.replace(/h+/, function ($1) {
                var ampmHour = tempVal % 12 || 12;
                return ((tempVal > 12) ? "PM" : "AM") + (($1.length > 1 && ampmHour < 10) ? zero + ampmHour : ampmHour);
            });
            tempVal = date.getMinutes();
            format = format.replace(/m+/, formatFunc);
            tempVal = date.getSeconds();
            format = format.replace(/S+/i, formatFunc);
            format = format.replace(/ms/i, date.getMilliseconds());
            format = format.replace(/wk/i, weekFormat(date.getDay()));
            return format;
        },
        convertDate: function (dateStr, format) {
            var year = 1970,
                month = 0,
                day = 1,
                hour = 0,
                minute = 0,
                second = 0,
                ms = 0;
            var result = /y+/i.exec(format);
            if (result != null) {
                year = parseInt(dateStr.substring(result.index, result.index + result[0].length), 10);
            }
            result = /M+/.exec(format);
            if (result != null) {
                month = parseInt(dateStr.substring(result.index, result.index + result[0].length), 10) - 1;
            }
            result = /d+/i.exec(format);
            if (result != null) {
                day = parseInt(dateStr.substring(result.index, result.index + result[0].length), 10);
            }
            result = /H+/.exec(format);
            if (result != null) {
                hour = parseInt(dateStr.substring(result.index, result.index + result.index + result[0].length), 10);
            }
            result = /h+/.exec(format);
            if (result != null) {
                hour = parseInt(dateStr.substring(result.index, result.index + result[0].length), 10);
                if (dateStr.substring(result.index - 2, 2) === "PM")
                    hour += 12;
            }
            result = /m+/.exec(format);
            if (result != null) {
                minute = parseInt(dateStr.substring(result.index, result.index + result[0].length), 10);
            }
            result = /S+/i.exec(format);
            if (result != null) {
                second = parseInt(dateStr.substring(result.index, result.index + result[0].length), 10);
            }
            result = /ms/i.exec(format);
            if (result != null) {
                ms = parseInt(dateStr.substring(result.index, result.index + result[0].length), 10);
            }
            return new Date(year, month, day, hour, minute, second, ms);
        },
        jsonnetToDate: function (jsonDate) {
            var val = /Date\(([^)]+)\)/.exec(jsonDate)[1];
            return new Date(Number(val));
        },
        jsonToDate: function (jsonDate) {
            var date = new Date(jsonDate);
            var val = null;
            if (isNaN(date)) {
                val = /Date\(([^)]+)\)/.exec(jsonDate);
                if (val != null) {
                    date = new Date(Number(val[1]));
                } else {
                    date = this.convertDate(jsonDate, "yyyy-MM-ddTHH:mm:ss");
                }
            }
            return date;
        },
        numberFormatScale: function (number, zeroCount) {
            if (isNaN(number))
                return NaN;
            if (isNaN(zeroCount))
                zeroCount = 2;
            number = util.fixedNumber(number, zeroCount);
            var integerText = number + "";
            var scaleText;
            var index = integerText.indexOf(".");
            if (index < 0) {
                scaleText = "";
            } else {
                scaleText = integerText.substring(index + 1);
                integerText = integerText.substring(0, index);
            }
            var len = zeroCount - scaleText.length;
            var i;
            for (i = 0; i < len; i++) {
                scaleText += "0";
            }
            return integerText + "." + scaleText;
        },
        integerFormat: function (number, count) {
            number = parseInt(number, 10);
            if (isNaN(number))
                return NaN;
            if (isNaN(count))
                count = 8;
            var numText = number + "";
            var len = count - numText.length;
            var i;
            for (i = 0; i < len; i++) {
                numText = "0" + numText;
            }
            return numText;
        }
    });

    //object
    $.extend(util.obj, {
        clone: function (result, source) {
            for (var key in source) {
                result[key] = source[key];
            }
            return result;
        },
        //深克隆对象
        deepClone: function (result, source) {
            var copy = null;
            for (var key in source) {
                copy = source[key];
                if (result === copy)
                    continue;

                if (this.is(copy, "Object")) {
                    result[key] = arguments.callee.apply(this, [result[key] || {}, copy]);
                } else if (this.is(copy, "Array")) {
                    result[key] = arguments.callee.apply(this, [result[key] || [], copy]);
                } else {
                    result[key] = copy;
                }
            }
            return result;
        },
        //判断对象的类型
        is: function (obj, type) {
            var toString = Object.prototype.toString;
            return (type === "Null" && obj === null) ||
               (type === "Undefined" && obj === undefined) ||
               (type === "Function" && typeof document.getElementById === "object" ?
                    /^\s*\bfunction\b/.test(obj + "") :
                    toString.call(obj).slice(8, -1) === type
               );
        }
    });

    //url
    var url_rquery = /\?/,
        r20 = /%20/g;
    $.extend(util.url, {
        //获取url的各种信息
        urlInfo: function (url) {
            var a = document.createElement('a');
            a.href = url;
            return {
                source: url,
                protocol: a.protocol.replace(':', ''),
                host: a.hostname,
                port: a.port,
                search: a.search,
                params: (function () {
                    var ret = {},
                seg = a.search.replace(/^\?/, '').split('&'),
                len = seg.length, i = 0, s;
                    for (; i < len; i++) {
                        if (!seg[i]) { continue; }
                        s = seg[i].split('=');
                        ret[s[0]] = s[1];
                    }
                    return ret;
                })(),
                file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
                hash: a.hash.replace('#', ''),
                path: a.pathname.replace(/^([^\/])/, '/$1'),
                relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1],
                segments: a.pathname.replace(/^\//, '').split('/')
            };
        },
        //取得URL的参数，以对象形式返回！
        getParam: function (url) {
            var result = {}
            var param = /([^?=&]+)=([^&]+)/ig;
            var match;
            while ((match = param.exec(url)) != null) {
                result[match[1]] = match[2];
            }
            return result;
        },
        //获取地址栏参数值
        getLocationParam: function (name) {
            var sUrl = window.location.search.substr(1);
            var r = sUrl.match(new RegExp("(^|&)" + name + "=([^&]*)(&|$)"));
            return (r == null ? null : unescape(r[2]));
        },
        //为url添加参数
        appendParams: function (url, data) {
            var s = [],
                add = function (key, value) {
                    value = jQuery.isFunction(value) ? value() : (value == null ? "" : value);
                    s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
                },
                i, t;
            if ($.isArray(data)) {
                for (i = 0; i < data.length; i++) {
                    t = data[i];
                    if (t.hasOwnProperty("name")) {
                        add(t.name, t.value);
                    }
                }
            } else if ($.isPlainObject(data)) {
                for (key in data) {
                    add(key, data[key]);
                }
            }

            if (s.length > 0) {
                return url + (url_rquery.test(url) ? "&" : "?") + s.join("&").replace(r20, "+");
            } else {
                return url;
            }
        }
    });

    ///guid
    util.guid = {
        empty: "00000000-0000-0000-0000-000000000000",
        _s4: function () {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        },
        newGuid: function () {
            return (this._s4() + this._s4() + "-"
                + this._s4() + "-"
                + this._s4() + "-"
                + this._s4() + "-"
                + this._s4() + this._s4() + this._s4());
        }
    };

    util.data = {
        listToTree: function (list, parentField, idField, childrenField) {
            if (!$.isArray(list) || list.length == 0)
                return;
            var tempList = {}, temp, root,
                item, i, id, pid,
                childField = childrenField || "children",
                flagField = "fromList";
            for (i = 0; i < list.length; i++) {
                item = list[i];
                pid = item[parentField] + "";
                if (tempList.hasOwnProperty(pid)) {
                    temp = tempList[pid];
                    temp[childField].push(item);
                } else {
                    temp = {};
                    temp[childField] = [];
                    temp[childField].push(item);
                    tempList[pid] = temp;
                }
                id = item[idField] + "";
                if (tempList.hasOwnProperty(id)) {
                    temp = tempList[id];
                    item[childField] = temp[childField];
                    tempList[id] = item;
                    temp[flagField] = true;
                } else {
                    item[childField] = [];
                    item[flagField] = true;
                    tempList[id] = item;
                }
            }
            for (var key in tempList) {
                temp = tempList[key];
                if (!temp.hasOwnProperty(flagField)) {
                    root = temp;
                    break;
                }
            }
            return root[childField];
        }
    };

    //字典对象
    var dictionary = util.dictionary = function (key, value) {
        return (this instanceof dictionary) ? this._init(key, value) : new dictionary(key, value);
    };
    $.extend(dictionary.prototype, {
        _init: function (key, value) {
            this._content = {};
            this._keys = [];
            if (typeof key !== "string")
                return this;
            else
                return this.set(key, value);
        },
        set: function (key, value) {
            if (!this._content.hasOwnProperty(key)) {
                this._keys.push(key);
            }
            this._content[key] = value;
            return this;
        },
        get: function (key) {
            if (this._content.hasOwnProperty(key)) {
                return this._content[key];
            } else {
                return null;
            }
        },
        contains: function (key) {
            return this._content.hasOwnProperty(key);
        },
        keys: function () {
            return this._keys;
        },
        count: function () {
            return this._keys.length;
        },
        clear: function () {
            this._content = {};
            this._keys = [];
        },
        remove: function (key) {
            for (var i = 0; i < this._keys.length; i++) {
                if (this._keys[i] === key) {
                    this._keys.splice(i, 1);
                    break;
                }
            }
            delete this._content[key];
        }
    });

    var arrayInstance = [];
    var rebuildIndex = function (obj, key) {
        var flag = false;
        for (var k in obj) {
            if (k === key) {
                flag = true;
                continue;
            }
            if (!flag) {
                continue;
            }
            obj[k] = --obj[k];
        }
    };

    //KVList
    util.keyArray = function () {
        ui.ArrayObject.apply(this);
        this._keys = {};
        return this;
    };
    util.keyArray.prototype = $.extend({}, ui.ArrayObject.prototype);
    delete util.keyArray.prototype.shift;
    delete util.keyArray.prototype.push;
    delete util.keyArray.prototype.sort;
    delete util.keyArray.prototype.pop;
    delete util.keyArray.prototype.splice;
    delete util.keyArray.prototype.concat;
    delete util.keyArray.prototype.slice;

    $.extend(util.keyArray.prototype, {
        contains: function (key) {
            return this._keys.hasOwnProperty(key);
        },
        set: function (key, value) {
            if (typeof key !== "string") {
                throw new Error("the key must be string");
            }
            if (this.contains(key)) {
                this[this._keys[key]] = value;
            } else {
                arrayInstance.push.apply(this, [value]);
                this._keys[key] = this.length - 1;
            }
        },
        get: function (key) {
            if (this.contains(key)) {
                return this[this._keys[key]];
            } else {
                return null;
            }
        },
        remove: function (key) {
            if (this.contains(key)) {
                var index = this._keys[key];
                arrayInstance.splice.apply(this, [index, 1]);
                rebuildIndex(this._keys, key);
                delete this._keys[key];
            }
        },
        removeAt: function (index) {
            if (index >= 0 && index < this.length) {
                var key, flag = false;
                for (var k in this._keys) {
                    if (this._keys[k] === index) {
                        flag = true;
                        key = k;
                    }
                    if (!flag) {
                        continue;
                    }
                    this._keys[k] = --this._keys[k];
                }
                delete this._keys[key];
                arrayInstance.splice.apply(this, [index, 1]);
            }
        },
        clear: function () {
            arrayInstance.splice.apply(this, [0, this.length]);
            this._keys = {};
        }
    });
})(jQuery);
