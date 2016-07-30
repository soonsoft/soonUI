/// <reference path="../jquery.validate.min.js" />

; (function () {
    if (!$.fn.validate)
        throw new Error("please include jquery.validate.min.js");

    //提示信息
    $.extend($.validator.messages, {
        required: "该字段为必输项",
        remote: "请修正该字段的内容",
        email: "请输入一个正确的Email",
        url: "请输入一个正确的URL",
        date: "请输入一个正确的日期",
        dateISO: "请输入一个符合ISO规则的日期",
        number: "请输入一个正确的数字",
        digits: "只能输入整数",
        creditcard: "请输入一个合法的信用卡号",
        equalTo: "请再次输入相同的值",
        accept: "请输入一个符合要求的后缀",
        maxlength: $.validator.format("输入的字符不能超过 {0} 个"),
        minlength: $.validator.format("输入的字符不能小于 {0} 个"),
        rangelength: $.validator.format("输入的字符长度只能介于 {0} 和 {1} 之间"),
        range: $.validator.format("请输入一个介于 {0} 和 {1} 之间的值"),
        max: $.validator.format("请输入一个最大为{0} 的值"),
        min: $.validator.format("请输入一个最小为{0} 的值")
    });

    ///扩展验证规则
    //用户名
    $.validator.addMethod("username", function(value, element) {
        return this.optional(element) || /^[\u0391-\uFFE5\w]+$/.test(value);
    }, "用户名只能包括中文字、英文字母、数字和下划线");

    //姓名 只能输入中文、英文和空格
    $.validator.addMethod("username", function(value, element) {
        return this.optional(element) || /^[\u0391-\uFFE5A-Za-z\s]+$/i.test(value);
    }, "姓名只能包括中文字、英文字母和空格");

    //固话
    $.validator.addMethod("linePhone", function(value, element) {
        var phone = /^((0|1|4|8)\d{2,3})?(-)?\d{7,8}$/;
        return this.optional(element) || phone.test(value);
    }, "请输入一个正确的固话号码");

    //手机号码
    $.validator.addMethod("cellPhone", function (value, element) {
        var mobile = /^1(3|4|5|7|8)\d(-)?\d{4}(-)?\d{4}$/;
        return this.optional(element) || mobile.test(value);
    }, "请输入一个正确的手机号码");

    //电话号码 可以是固话也可以是手机
    $.validator.addMethod("phone", function (value, element) {
        var mobile = /^1(3|4|5|7|8)\d(-)?\d{4}(-)?\d{4}$/;
        var phone = /^((0|1|4|8)\d{2,3})?(-)?\d{7,8}$/;
        return this.optional(element) || mobile.test(value) || phone.test(value);
    }, "请输入一个正确的电话号码，可以是固话也可以是手机");

    //身份证号码（15位或是18位）
    $.validator.addMethod("CID", function(value, element) {
        return this.optional(element) || /^\d{17}[\d|X|x]$|^\d{15}$/.test(value);
    }, "请输入一个正确的身份证号码");

    //邮政编码
    $.validator.addMethod("zipcode", function(value, element) {
        return this.optional(element) || /^[1-9]\d{5}(?!\d)$/.test(value);
    }, "请输入一个正确的邮政编码");

    //时间格式
    $.validator.addMethod("time", function(value, element) {
        return this.optional(element) || /^(20|21|22|23)|([0-1]?\d):[0-5]?\d:[0-5]?\d$/.test(value);
    }, "请输入一个正确的时间");

    //中文日期格式 包含如：[2016年6月1日]这样的格式
    $.validator.addMethod("Cdate", function(value, element) {
        return this.optional(element) || /^\d{1,4}(-|\\|年)(10|11|12|([0]?[1-9]))(-|\\|月)(30|31|([0-2]?\d))[日]?$/.test(value);
    }, "请输入一个正确的日期");

    //数字精度验证
    $.validator.addMethod("numberPrecision", function (value, element, param) {
        if (!Array.isArray(param)) {
            return true;
        }
        var dCount = parseInt(param[0], 10) || 1,
            fCount = parseInt(param[1], 10);

        var patt = null;
        if (isNaN(fCount)) {
            patt = new RegExp("^\\d{1," + dCount + "}$");
        } else {
            patt = new RegExp("^\\d{1," + dCount + "}(\\.\\d{1," + fCount + "})?$");
        }
        return this.optional(element) || patt.test(value);
    }, "请输入一个符合精度规定的数字");

    //特殊字符验证
    $.validator.addMethod("spechars", function (value, element) {
        return this.optional(element) || !(/[,.<>{}()~!?+\\/\|\]\[;:"'@#$%^&*]/.test(value));
    }, "不可以包含特殊字符");

    //自定义验证
    $.validator.addMethod("custom", function (value, element, param) {
        if(param && $.isFunction(param.method)) {
            return this.optional(element) || !!param.method(value, element);
        } else if ($.isFunction(param)) {
            return this.optional(element) || !!param(value, element);
        } else {
            return this.optional(element) || !!param;
        }
    }, "");

    var errorClass = "validate-error",
        validClass = "",
        errorStyle = {
            "border-color": "#E53935",
            "background-color": "#f9cecd",
            "color": "#E53935",
            "background-image": "none"
        };

    function setErrorStyle (element, errorClass, validClass) {
        var elem = $(element),
            oldStyle, styleCss, css, cssItem,
            i, l;

        if (!elem.hasClass(errorClass)) {
            elem.addClass(errorClass);

            oldStyle = elem.attr("style");
            if (typeof oldStyle === "string" && oldStyle.length > 0) {
                styleCss = {};
                css = oldStyle.split(";");
                for (i = 0, l = css.length; i < l; i++) {
                    cssItem = $.trim(css[i]);
                    cssItem = cssItem.split(":");
                    styleCss[cssItem[0]] = cssItem[1];
                }
                elem.data("oldStyle", styleCss);
            }
            elem.css(errorStyle);
        }
    }
    function removeErrorStyle (element, errorClass, validClass) {
        var elem = $(element),
            oldStyle = elem.data("oldStyle");
        if (elem.hasClass(errorClass)) {
            elem.removeClass(errorClass);
            elem.removeAttr("style");
            if (oldStyle) {
                elem.css(oldStyle);
                elem.removeData("oldStyle");
            }
            elem.removeAttr("title");
        }
    }
    function clearErrorStyle () {
        if (this.errorList && this.errorList.length > 0) {
            var errElem = null;
            for (var i = 0; i < this.errorList.length; i++) {
                errElem = $(this.errorList[i].element);
                removeErrorStyle(errElem, errorClass, validClass);
            }
            this.resetForm();
        }
    }

    var defaultSetting = {
        errorClass: errorClass,
        validClass: validClass,
        //错误元素
        errorElement: "span",
        //获取焦点后禁用验证逻辑
        focusInvalid: true,
        //是否在提交时验证,默认:true
        onsubmit: false,
        onfocusin: function (element, e) {
            removeErrorStyle(element, errorClass, validClass);
        },
        onfocusout: false,
        onkeyup: false,
        onclick: false,
        highlight: function (element, errorClass, validClass) {
            setErrorStyle(element, errorClass, validClass);
        },
        unhighlight: function(element, errorClass, validClass) {
            removeErrorStyle(element, errorClass, validClass);
        },
        errorPlacement: function (error, element) {
            element.attr("title", error.text());
        }
    };

    $.fn.setValidate = function(option) {
        defaultSetting = $.extend(defaultSetting, option);
        var vld = this.validate(defaultSetting);
        vld["clearErrorStyle"] = clearErrorStyle;
        return vld;
    };
})();