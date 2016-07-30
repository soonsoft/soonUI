; (function(global, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        // For CommonJS and CommonJS-like environments where a proper `window`
        // is present, execute the factory and get avalon.
        // For environments that do not have a `window` with a `document`
        // (such as Node.js), expose a factory as module.exports.
        // This accentuates the need for the creation of a real `window`.
        // e.g. var ui = require("ui")(window);
        module.exports = global.document ? factory(global, true) : function(w) {
            if (!w.document) {
                throw new Error("ui.core.js requires a window with a document")
            }
            return factory(w);
        };
    } else {
        factory(global);
    }
}(typeof window !== "undefined" ? window : this, function(window, noGlobal) {
    var ui = window.ui = {};

    //常用正则表达式
    ui._rhtml = /<(\S*?)[^>]*>.*?<\/\1>|<.*? \/>/i;

    //按键常量
    ui.keyCode = {
        BACKSPACE: 8,
        COMMA: 188,
        DELETE: 46,
        DOWN: 40,
        END: 35,
        ENTER: 13,
        ESCAPE: 27,
        HOME: 36,
        LEFT: 37,
        NUMPAD_ADD: 107,
        NUMPAD_DECIMAL: 110,
        NUMPAD_DIVIDE: 111,
        NUMPAD_ENTER: 108,
        NUMPAD_MULTIPLY: 106,
        NUMPAD_SUBTRACT: 109,
        PAGE_DOWN: 34,
        PAGE_UP: 33,
        PERIOD: 190,
        RIGHT: 39,
        SPACE: 32,
        TAB: 9,
        UP: 38
    };

    //核心
    var core = ui.core = {};

    var DOC = document;
    //切割字符串为一个个小块，以空格或豆号分开它们，结合replace实现字符串的forEach
    var rword = /[^, ]+/g;
    var arrayInstance = [];
    var class2type = {};
    var oproto = Object.prototype;
    var ohasOwn = oproto.hasOwnProperty;
    var W3C = window.dispatchEvent;
    var root = DOC.documentElement;
    var serialize = oproto.toString;
    var aslice = arrayInstance.slice;
    var head = DOC.head || DOC.getElementsByTagName("head")[0];
    var rwindow = /^[object (Window|DOMWindow|global)]$/;
    var relement = /^[object HTML\w+Element]$;/;
    var isTouchAvailable = "ontouchstart" in window;

    "Boolean Number String Function Array Date RegExp Object Error".replace(rword, function (name) {
        class2type["[object " + name + "]"] = name.toLowerCase();
    });

    core.root = root;
    core.head = head;
    core.noop = function () { };
    core.slice = aslice;
    
    //判断IE版本
    function IE() {
        if (window.VBArray) {
            var mode = document.documentMode;
            return mode ? mode : (window.XMLHttpRequest ? 7 : 6);
        } else {
            return 0;
        }
    }
    core.ieVersion = IE();

    //获取类型
    function getType(obj) {
        if (obj === null) {
            return String(obj);
        }
        // 早期的webkit内核浏览器实现了已废弃的ecma262v4标准，可以将正则字面量当作函数使用，因此typeof在判定正则时会返回function
        return typeof obj === "object" || typeof obj === "function" ?
                class2type[serialize.call(obj)] || "object" :
                typeof obj;
    }

    core.type = getType;
    core.isWindow = function (obj) {
        if (!obj)
            return false;
        if (obj === window)
            return true;
        // 利用IE678 window == document为true,document == window竟然为false的神奇特性
        // 标准浏览器及IE9，IE10等使用 正则检测
        return obj == obj.document && obj.document != obj;
    };
    function isWindow(obj) {
        return rwindow.test(serialize.call(obj));
    };
    if (!isWindow(window)) {
        core.isWindow = isWindow;
    }
    //判定是否是一个朴素的javascript对象（Object），不是DOM对象，不是BOM对象，不是自定义类的实例。
    core.isPlainObject = function (obj) {
        if (this.type(obj) !== "object" || obj.nodeType || this.isWindow(obj)) {
            return false;
        }
        try {
            if (obj.constructor && !ohasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                return false;
            }
        } catch (e) {
            return false;
        }
        return true;
    };
    if (/\[native code\]/.test(Object.getPrototypeOf)) {
        core.isPlainObject = function (obj) {
            return obj && typeof obj === "object" && Object.getPrototypeOf(obj) === oproto;
        };
    }
    core.isEmptyObject = function (obj) {
        var name;
        for ( name in obj ) {
            return false;
        }
        return true;
    };
    core.isDomObject = function (obj) {
        return !!obj && !!obj.nodeType && obj.nodeType == 1;
    };
    core.isJQueryObject = function (obj) {
        return this.type(obj) === "object" && this.type(obj.jquery) === "string";
    };
    core.isSupportCanvas = function () {
        return !!document.createElement("canvas").getContext;
    };
    core.isTouchAvailable = function() {
        return isTouchAvailable;  
    };

    ///# jQuery Extensions
    //为jquery添加一个获取元素标签类型的方法
    $.fn.nodeName = function () {
        return this.prop("nodeName");
    };
    $.fn.isNodeName = function(nodeName) {
        return this.nodeName() === (nodeName + "").toUpperCase();
    };
    //判断一个元素是否出现了横向滚动条
    $.fn.hasHorizontalScroll = function() {
        var overflowValue = this.css("overflow");
        if(overflowValue === "visible" || overflowValue === "hidden") {
            return false;
        } else if(overflowValue === "scroll") {
            return true;
        } else {
            return this.get(0).scrollWidth > this.width();
        }
    };
    //判断一个元素是否出现了纵向滚动条
    $.fn.hasVerticalScroll = function() {
        var overflowValue = this.css("overflow");
        if(overflowValue === "visible" || overflowValue === "hidden") {
            return false;
        } else if(overflowValue === "scroll") {
            return true;
        } else {
            return this.get(0).scrollHeight > this.height();
        }
    };
    //获取对象的z-index值
    $.fn.zIndex = function (zIndex) {
        if (zIndex !== undefined) {
            return this.css("zIndex", zIndex);
        }

        if (this.length) {
            var elem = $(this[0]), position, value;
            while (elem.length && elem[0] !== document) {
                // Ignore z-index if position is set to a value where z-index is ignored by the browser
                // This makes behavior of this function consistent across browsers
                // WebKit always returns auto if the element is positioned
                position = elem.css("position");
                if (position === "absolute" || position === "relative" || position === "fixed") {
                    // IE returns 0 when zIndex is not specified
                    // other browsers return a string
                    // we ignore the case of nested elements with an explicit value of 0
                    // <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
                    value = parseInt(elem.css("zIndex"), 10);
                    if (!isNaN(value) && value !== 0) {
                        return value;
                    }
                }
                elem = elem.parent();
            }
        }
        return 0;
    };
    //填充select下拉框的选项
    $.fn.bindOptions = function (arr, valueField, textField) {
        if (this.nodeName() !== "SELECT") {
            return this;
        }
        if (!valueField) {
            valueField = "value";
        }
        if (!textField) {
            textField = "text";
        }
        if (!arr.length) {
            return this;
        }
        var i, len = arr.length,
            item, options = [];
        for (i = 0; i < len; i++) {
            item = arr[i];
            if (!item) {
                continue;
            }
            options.push("<option value='", item[valueField], "'>", item[textField], "</option>");
        }
        this.html(options.join(""));
        return this;
    };
    //获取一个select元素当前选中的value和text
    $.fn.selectOption = function () {
        if (this.nodeName() !== "SELECT") {
            return null;
        }
        var option = {
            value: this.val(),
            text: null
        };
        option.text = this.children("option[value='" + option.value + "']").text();
        return option;
    };
    //动态设置图片的src并自动调整图片的尺寸和位置
    $.fn.setImage = function (src, displayWidth, displayHeight) {
        if (this.nodeName() != "IMG") {
            return;
        }
        var parent = this.parent();
        if (arguments.length < 2) {
            if (parent.nodeName() == "BODY") {
                displayWidth = root.clientWidth;
                displayHeight = root.clientHeight;
            } else {
                displayWidth = parent.width();
                displayHeight = parent.height();
            }
        } else {
            if (!$.isNumeric(displayWidth) || !$.isNumeric(displayHeight)) {
                displayWidth = 320;
                displayHeight = 240;
            }
        }
        return reloadImage(this, src, displayWidth, displayHeight);
    };
    function reloadImage (img, src, displayWidth, displayHeight) {
        if (core.type(src) !== "string" || src.length == 0) {
            return;
        }
        var promise = new Promise(function(resolve, reject) {
            var reimg = new Image();
            reimg.onload = function () {
                reimg.onload = null;
                var size = setImageAndSize(img, reimg.src, displayWidth, displayHeight, reimg.width, reimg.height);
                size.img = img;
                resolve(size);
            };
            reimg.onerror = function () {
                img.prop("src", ui.str.empty);
                reject(img);
            };
            reimg.src = src;
        });
        return promise;
    }
    function setImageAndSize (img, src, displayWidth, displayHeight, imgWidth, imgHeight) {
        var width = imgWidth, 
            height = imgHeight;
        img.css({
            "margin-top": "0px",
            "margin-left": "0px"
        });
        if (displayWidth > displayHeight) {
            if(imgHeight > displayHeight) {
                height = displayHeight;
            }
            width = Math.floor(imgWidth * (height / imgHeight));
            if (width > displayWidth) {
                width = displayWidth;
                height = Math.floor(imgHeight * (width / imgWidth));
                img.css("margin-top", Math.floor((displayHeight - height) / 2) + "px");
            } else {
                img.css("margin-left", Math.floor((displayWidth - width) / 2) + "px");
                img.css("margin-top", Math.floor((displayHeight - height) / 2) + "px");
            }
        } else {
            if(width > displayWidth) {
                width = displayWidth;
            }
            height = Math.floor(imgHeight * (width / imgWidth));
            if (height > displayHeight) {
                height = displayHeight;
                width = Math.floor(imgWidth * (height / imgHeight));
                img.css("margin-left", Math.floor((displayWidth - width) / 2) + "px");
            } else {
                img.css("margin-left", Math.floor((displayWidth - width) / 2) + "px");
                img.css("margin-top", Math.floor((displayHeight - height) / 2) + "px");
            }
        }
        img.css({
            "width": width + "px",
            "height": height + "px",
            "vertical-align": "top"
        });
        img.prop("src", src);
        return {
            width: width,
            height: height
        };
    }
    //为jquery添加操作stylesheet的方法
    $.fn.sheet = function () {
        var sheet = null,
            nodeName = this.nodeName();
        if (nodeName === "STYLE" || nodeName === "LINK") {
            sheet = this.prop("sheet");
            if (!sheet)
                sheet = this.prop("styleSheet");
            if (sheet) sheet = $(sheet);
        }
        return sheet;
    };
    $.fn.cssRules = function () {
        var rules = null;
        var sheet = this;
        if (sheet.length > 0) {
            rules = sheet.prop("cssRules");
            if (!rules) {
                rules = sheet.prop("rules");
            }
        }
        return rules;
    };
    $.fn.addRule = function (selector, css) {
        var index = 0;
        var rules = this.cssRules();
        if (rules)
            index = rules.length;
        this.insertRule(selector, css, index);
    };
    $.fn.insertRule = function (selector, css, index) {
        var sheet = this[0],
            rule;
        if (sheet) {
            if (sheet.insertRule) {
                sheet.insertRule(selector + " {}", index);
            } else {
                sheet.addRule(selector, " ", index);
            }
            rule = $(this.cssRules()[index]);
            rule.css(css);
        }
    };
    $.fn.removeRule = function (selector) {
        throw new Error("not implement !");
    };
    $.fn.getRule = function (selector) {
        var rules = this.cssRules();
        if (!rules)
            return null;
        var item;
        selector = selector.toLowerCase();
        for (var i = 0, len = rules.length; i < len; i++) {
            item = $(rules[i]);
            if (item.prop("selectorText").toLowerCase() === selector) {
                return item;
            }
        }
        return null;
    };
    //为jquery添加mousewheel事件
    $.fn.mousewheel = function (data, fn) {
        var eventName = eventSupported("mousewheel", this) ? "mousewheel" : "DOMMouseScroll";
        return arguments.length > 0 ?
            this.on(eventName, null, data, fn) :
            this.trigger(eventName);
    };
    "mousewheel DOMMouseScroll".replace(rword, function (name) {
        jQuery.event.fixHooks[name] = {
            filter: function (event, originalEvent) {
                var delta = 0;
                if (originalEvent.wheelDelta) {
                    delta = originalEvent.wheelDelta / 120;
                    //opera 9x系列的滚动方向与IE保持一致，10后修正 
                    if (window.opera && window.opera.version() < 10)
                        delta = -delta;
                } else if (originalEvent.detail) {
                    delta = -originalEvent.detail / 3;
                }
                event.delta = Math.round(delta);

                return event;
            }
        };
    });
    function eventSupported(eventName, elem) {
        if (core.isDomObject(elem)) {
            elem = $(elem);
        } else if (core.isJQueryObject(elem) && elem.length == 0) {
            return false;
        }
        eventName = "on" + eventName;
        var isSupported = (eventName in elem[0]);
        if (!isSupported) {
            elem.attr(eventName, "return;");
            isSupported = core.type(elem[eventName]) === "function";
        }
        return isSupported;
    };
    
    //为jquery添加textinput事件
    if(core.ieVersion) {
        $(DOC).on("selectionchange", function(e) {
            var el = DOC.activeElement;
            if (el && typeof el.uiEventSelectionChange === "function") {
                el.uiEventSelectionChange();
            }
        });
    }
    
    $.fn.textinput = function(data, fn) {
        if(!this || this.length == 0) {
            return;
        }
        if($.isFunction(data)) {
            fn = data;
            data = null;
        }
        if(!$.isFunction(fn)) {
            return;
        }
        var ed = { data: data, target: this[0] },
            composing = false,
            nodeName = this.nodeName();
        if(nodeName !== "INPUT" && nodeName !== "TEXTAREA") {
            return;
        }
        
        if(core.ieVersion) {
            //监听IE点击input右边的X的清空行为
            if(core.ieVersion == 9) {
                //IE9下propertychange不监听粘贴，剪切，删除引发的变动
                this[0].uiEventSelectionChange = function() {
                    fn(ed);
                };
            }
            if (core.ieVersion > 8) {
                //IE9使用propertychange无法监听中文输入改动
                this.on("input", null, data, fn);
            } else {
                //IE6-8下第一次修改时不会触发,需要使用keydown或selectionchange修正
                this.on("propertychange", function(e) {
                    var propertyName = e.originalEvent ? e.originalEvent.propertyName : e.propertyName;
                    if (propertyName === "value") {
                        fn(ed);
                    }
                });
                this.on("dragend", null, data, function (e) {
                    setTimeout(function () {
                        fn(e);
                    });
                });
            }
        } else {
            this.on("input", null, data, function(e) {
                //处理中文输入法在maxlengh下引发的BUG
                if(composing) {
                    return;
                }
                fn(e);
            });
            //非IE浏览器才用这个
            this.on("compositionstart", function(e) {
                composing = true;
            });
            this.on("compositionend", function(e) {
                composing = false;
                fn(e);
            });
        }
        return this;
    };

    //为jquery添加拖拽特效
    $.fn.draggable = function (option) {
        var elem = this,
            position;
        if (!option || !option.target || !option.parent) {
            return;
        }
        if (!core.isDomObject(this[0]) || elem.nodeName() === "BODY") {
            return;
        }
        if (option.parent.nodeName() !== "BODY") {
            position = option.parent.css("position");
            if (position !== "absolute" && position !== "relative" && position !== "fixed") {
                option.parent.css("position", "relative");
            }
        }
        option.targetPosition = option.target.css("position");
        if (option.targetPosition !== "absolute") {
            option.target.css("position", "absolute");
        }
        option.getParentCssNum = function (prop) {
            var value = parseFloat(option.parent.css(prop), 10);
            if (isNaN(value)) value = 0;
            return value;
        };
        option.doc = $(document);
        option.onBeginDrag = function (e) {
            if (e.which !== 1) return;
            var option = e.data,
                p = option.parent.offset();
            if (!p) p = { top: 0, left: 0 };
            option.topLimit = p.top + option.getParentCssNum("border-top") + option.getParentCssNum("padding-top");
            option.leftLimit = p.left + option.getParentCssNum("border-left") + option.getParentCssNum("padding-left");
            option.rightLimit = p.left + (option.parent.outerWidth() || option.parent.width());
            option.bottomLimit = p.top + (option.parent.outerHeight() || option.parent.height());

            option.currentX = e.pageX;
            option.currentY = e.pageY;

            option.targetWidth = option.target.outerWidth();
            option.targetHeight = option.target.outerHeight();
            if($.isFunction(option.onBegin)) {
                option.onBegin();
            }

            option.doc
                .on("mousemove", option, option.onMoving)
                .on("mouseup", option, option.onEndDrag)
                .on("mouseleave", option, option.onEndDrag);
            //禁止文本选中
            document.onselectstart = function () { return false; };
            option.target.addClass("cancel-user-select");
            option.isStarted = true;
        };
        option.onMoving = function (e) {
            var option = e.data;
            if (!option.isStarted) return;
            var x = e.pageX - option.currentX,
                y = e.pageY - option.currentY;
            option.currentX = e.pageX;
            option.currentY = e.pageY;
            var p = option.target.position();
            p.top += y;
            p.left += x;

            if (p.top < option.topLimit) {
                p.top = option.topLimit;
            } else if (p.top + option.targetHeight > option.bottomLimit) {
                p.top = option.bottomLimit - option.targetHeight;
            }
            if (p.left < option.leftLimit) {
                p.left = option.leftLimit;
            } else if (p.left + option.targetWidth > option.rightLimit) {
                p.left = option.rightLimit - option.targetWidth;
            }

            option.target.css({
                "top": p.top + "px",
                "left": p.left + "px"
            });
        };
        option.onEndDrag = function (e) {
            if (e.which !== 1) return;
            var option = e.data;
            if (!option.isStarted) return;
            option.currentX = option.currentY = 0;
            option.isStarted = false;
            option.doc
                .off("mousemove", option.onMoving)
                .off("mouseup", option.onEndDrag)
                .off("mouseleave", option.onEndDrag);
            document.onselectstart = null;
            option.target.removeClass("cancel-user-select");
            
            if($.isFunction(option.onEnd)) {
                option.onEnd();
            }
        };
        elem.on("mousedown", option, option.onBeginDrag);
        elem.data("drag-option", option);
    };
    $.fn.dedraggable = function () {
        if (this.length == 0) {
            return;
        }
        var option = this.data("drag-option");
        if (!option) {
            return;
        }
        option.target.css("position", option.targetPosition);
        this.off("mousedown", option.onBeginDrag);
    };

    //为jquery添加数据拖入特效
    $.fn.droppable = function () {
    };

    ///# end jQuery Extensions

    ///# UI Utility
    //日志输出
    ui.log = function(str, force) {
        if (force || !window.console) {
            var div = DOC.body && DOC.createElement("div");
            if (div) {
                div.innerHTML = str;
                DOC.body.appendChild(div)
            }
        } else {
            window.console.log(str);
        }
    };
    //异常
    ui.error = function (msg) {
        throw new Error(msg);
    };
    //常用对象
    //获取浏览器滚动条的宽度
    ui.scrollbarHeight = ui.scrollbarWidth = 17;
    ui.tempDiv = $("<div style='position:absolute;left:-1000px;top:-100px;width:100px;height:100px;overflow:auto;' />");
    ui.tempInnerDiv = $("<div style='width:100%;height:50px;' />");
    ui.tempDiv.append(ui.tempInnerDiv);
    root.appendChild(ui.tempDiv.get(0));
    ui.tempWidth = ui.tempInnerDiv.width();
    ui.tempInnerDiv.css("height", "120px");
    ui.scrollbarHeight = ui.scrollbarWidth = ui.tempWidth - ui.tempInnerDiv.width();
    ui.tempInnerDiv.remove();
    ui.tempDiv.remove();
    delete ui.tempWidth;
    delete ui.tempInnerDiv;
    delete ui.tempDiv;
    //获取元素
    ui.getJQueryElement = function(arg) {
        var elem = null;
        if(ui.core.type(arg) === "string") {
            elem = $("#" + arg);
        } else if(ui.core.isJQueryObject(arg)) {
            elem = arg;
        } else if(ui.core.isDomObject(arg)) {
            elem = $(arg);
        }
        
        if(!elem || elem.length == 0) {
            return null;
        } else {
            return elem;
        }
    };
    //将元素移动到目标元素下方
    ui.setDown = function (target, panel) {
        if (!target || !panel) {
            return;
        }
        var width = panel.outerWidth(),
            height = panel.outerHeight();
        var css = ui.getDownLocation(target, width, height);
        css.top += "px";
        css.left += "px";
        panel.css(css);
    };
    //将元素移动到目标元素左边
    ui.setLeft = function (target, panel) {
        if (!target || !panel) {
            return;
        }
        var width = panel.outerWidth(),
            height = panel.outerHeight();
        var css = ui.getLeftLocation(target, width, height);
        css.top += "px";
        css.left += "px";
        panel.css(css);
    };
    //获取目标元素下方的坐标信息
    ui.getDownLocation = function (target, width, height) {
        var location = {
            left: 0,
            top: 0
        };
        if (!target) {
            return location;
        }
        var p = target.offset();
        var docel = ui.core.root;
        var top = p.top + target.outerHeight(),
            left = p.left;
        if ((top + height) > (docel.clientHeight + docel.scrollTop)) {
            top -= height + target.outerHeight();
        }
        if ((left + width) > docel.clientWidth + docel.scrollLeft) {
            left = left - (width - target.outerWidth());
        }
        location.top = top;
        location.left = left;
        return location;
    };
    //获取目标元素左边的坐标信息
    ui.getLeftLocation = function (target, width, height) {
        var location = {
            left: 0,
            top: 0
        };
        if (!target) {
            return location;
        }
        var p = target.offset();
        var docel = ui.core.root;
        var tw = target.outerWidth(),
            top = p.top,
            left = p.left + tw;
        if ((top + height) > (docel.clientHeight + docel.scrollTop)) {
            top -= (top + height) - (docel.clientHeight + docel.scrollTop);
        }
        if ((left + width) > docel.clientWidth + docel.scrollLeft) {
            left = p.left - width;
        }
        location.top = top;
        location.left = left;
        return location;
    };
    //全局遮罩是否开启
    ui.isMaskOpened = function() {
        var mask = $("#ui_maskPanel");
        return mask.css("display") === "block";
    };
    //开启遮罩
    ui.openMask = function (target, option) {
        var mask = $("#ui_maskPanel"),
            body = $(document.body);
        if(this.core.isPlainObject(target)) {
            option = target;
            target = null;
        }
        target = ui.getJQueryElement(target);
        if(!target) {
            target = body;
        }
        if(!option) {
            option = {};
        }
        option.color = option.color || "#000000";
        option.opacity = option.opacity || .6;
        option.animate = option.animate !== false;
        if (mask.length === 0) {
            mask = $("<div id='ui_maskPanel' class='mask-panel' />");
            body.append(mask);
            ui.resize(function (e, width, height) {
                mask.css({
                    "height": height + "px",
                    "width": width + "px"
                });
            }, ui.eventPriority.ctrlResize);
            this._mask_animator = ui.animator({
                target: mask,
                onChange: function (op) {
                    this.target.css({
                        "opacity": op / 100,
                        "filter": "Alpha(opacity=" + op + ")"
                    });
                }
            });
            this._mask_animator.duration = 500;
        }
        mask.css("background-color", option.color);
        this._mask_data = {
            option: option,
            target: target
        };
        if(target.nodeName() === "BODY") {
            this._mask_data.overflow = body.css("overflow");
            if(this._mask_data.overflow !== "hidden") {
                body.css("overflow", "hidden");
            }
            mask.css({
                top: "0px",
                left: "0px",
                width: root.clientWidth + "px",
                height: root.clientHeight + "px"
            });
        } else {
            var offset = target.offset();
            mask.css({
                top: offset.top + "px",
                left: offset.left + "px",
                width: target.outerWidth() + "px",
                height: target.outerHeight() + "px"
            });
        }
        
        if(option.animate) {
            mask.css({
                "display": "block",
                "opacity": "0",
                "filter": "Alpha(opacity=0)"
            });
            this._mask_animator[0].begin = 0;
            this._mask_animator[0].end = option.opacity * 100;
            this._mask_animator.start();
        } else {
            mask.css({
                "display": "block",
                "filter": "Alpha(opacity=" + (option.opacity * 100) + ")",
                "opacity": option.opacity
            });
        }
        return mask;
    };
    //关闭遮罩
    ui.closeMask = function () {
        var mask = $("#ui_maskPanel");
        if (mask.length == 0) {
            return;
        }
        var data = this._mask_data;
        if(data.target.nodeName() === "BODY") {
            data.target.css("overflow", data.overflow);
        }
        if(data.option.animate) {
            this._mask_animator[0].begin = 60;
            this._mask_animator[0].end = 0;
            this._mask_animator.start().done(function() {
                mask.css("display", "none");
            });
        } else {
            mask.css("display", "none");
        }
    };
    ///# end UI Utility

    /// 为ECMAScript3 添加ECMAScript5的方法
    // Array.prototype
    // isArray
    if(typeof Array.isArray !== "function") {
        Array.isArray = function(obj) {
            return ui.core.type(obj) === "array";
        };
    }
    // forEach
    if(typeof Array.prototype.forEach !== "function") {
        Array.prototype.forEach = function(fn, caller) {
            if(typeof fn !== "function") {
                return;
            }
            var i = 0,
                len = this.length;
            for(; i < len; i++) {
                if(!(i in this)) continue;
                fn.call(caller, this[i], i, this);
            }
        };
    }
    // map
    if(typeof Array.prototype.map !== "function") {
        Array.prototype.map = function(fn, caller) {
            if(typeof fn !== "function") {
                return;
            }
            var result = new Array(this.length);
            var i = 0,
                len = this.length;
            for(; i < len; i++) {
                if(!(i in this)) continue;
                result[i] = fn.call(caller, this[i], i, this);
            }
            return result;
        };
    }
    // filter
    if(typeof Array.prototype.filter !== "function") {
        Array.prototype.filter = function(fn, caller) {
            if(typeof fn !== "function") {
                return;
            }
            var result = [];
            var i = 0,
                len = this.length;
            for(; i < len; i++) {
                if(!(i in this)) continue;
                if(fn.call(caller, this[i], i, this)) {
                    result.push(this[i]);
                }
            }
            return result;
        };
    }
    // every
    if(typeof Array.prototype.every !== "function") {
        Array.prototype.every = function(fn, caller) {
            if(typeof fn !== "function") {
                return;
            }
            var i = 0,
                len = this.length;
            for(; i < len; i++) {
                if(!(i in this)) continue;
                if(!fn.call(caller, this[i], i, this)) {
                    return false;
                }
            }
            return true;
        };
    }
    // some
    if(typeof Array.prototype.some !== "function") {
        Array.prototype.some = function(fn, caller) {
            if(typeof fn !== "function") {
                return;
            }
            var i = 0,
                len = this.length;
            for(; i < len; i++) {
                if(!(i in this)) continue;
                if(fn.call(caller, this[i], i, this)) {
                    return true;
                }
            }
            return false;
        };
    }
    // reduce
    if(typeof Array.prototype.reduce !== "function") {
        Array.prototype.reduce = function(fn, defaultValue) {
            if(typeof fn !== "function") {
                return;
            }
            var i = 0,
                len = this.length;
            var result;
            if(arguments.length < 2) {
                if(len == 0) {
                    throw new TypeError("Reduce of empty array with no initial value");
                }
                result = this[i];
                i++;
            } else {
                result = defaultValue;
            }
            for(; i < len; i++) {
                if(!(i in this)) continue;
                result = fn.call(null, result, this[i], i, this);
            }
            return result;
        };
    }
    // reduceRight
    if(typeof Array.prototype.reduceRight !== "function") {
        Array.prototype.reduceRight = function(fn, defaultValue) {
            if(typeof fn !== "function") {
                return;
            }
            var len = this.length,
                i = len - 1;
            var result;
            if(arguments.length < 2) {
                if(len == 0) {
                    throw new TypeError("Reduce of empty array with no initial value");
                }
                result = this[i];
                i--;
            } else {
                result = defaultValue;
            }
            for(; i >= 0; i--) {
                if(!(i in this)) continue;
                result = fn.call(null, result, this[i], i, this);
            }
            return result;
        };
    }
    // indexOf
    if(typeof Array.prototype.indexOf !== "function") {
        Array.prototype.indexOf = function(value, startIndex) {
            if(!startIndex) startIndex = 0;
            var i, len = this.length,
                index = -1;
            if(len > 0) {
                while(startIndex < 0)
                    startIndex = len + startIndex;
                
                for(i = startIndex; i < len; i++) {
                    if(this[i] === value) {
                        index = i;
                        break;
                    }
                }
            }
            return index;
        };
    }
    // lastIndexOf
    if(typeof Array.prototype.lastIndexOf !== "function") {
        Array.prototype.lastIndexOf = function(value, startIndex) {
            if(!startIndex) startIndex = 0;
            var len = this.length,
                i = len - 1, 
                index = -1;
            if(len > 0) {
                while(startIndex < 0)
                    startIndex = len + startIndex;
                
                for(i = startIndex; i >= 0; i--) {
                    if(this[i] === value) {
                        index = i;
                        break;
                    }
                }
            }
            return index;
        };
    }

    // Array Object
    ui.ArrayObject = function () {
        this.setArray(this.makeArray(arguments));
        return this;
    };
    ui.ArrayObject.prototype = {
        isArray: function (obj) {
            return Object.prototype.toString.call(obj) === "[object Array]";
        },
        setArray: function (elems) {
            this.length = 0;
            //设置length以及重排索引
            Array.prototype.push.apply(this, elems);
            return this;
        },
        makeArray: function (arr) {
            //把传入参数变成数组
            var ret = [];
            if (arr != null) {
                var i = arr.length;
                //单个元素，但window, string、 function有 'length'的属性，加其它的判断
                if (i == null || arr.split || arr.setInterval || arr.call) {
                    ret[0] = arr;
                } else {
                    try {
                        ret = Array.prototype.slice.call(arr);
                    } catch (e) {
                        //Clone数组
                        while (i) ret[--i] = arr[i];
                    }
                }
            }
            return ret;
        },
        inArray: function (elem, array) {
            for (var i = 0, length = array.length; i < length; i++) {
                // Use === because on IE, window == document
                if (array[i] === elem) {
                    return i;
                }
            }
            return -1;
        },
        index: function (el) { return this.inArray(el, this) },
        toString: function () {
            //返回一个字符串
            var array = Array.prototype.slice.call(this);
            return array.toString();
        },
        valueOf: function () {
            return Array.prototype.slice.call(this);
        },
        shift: arrayInstance.shift,
        push: arrayInstance.push,
        sort: arrayInstance.sort,
        pop: arrayInstance.pop,
        splice: arrayInstance.splice,
        concat: arrayInstance.concat,
        slice: arrayInstance.slice,
        constructor: core.ArrayObject,
        get: function (num) {
            return num === undefined ? Array.prototype.slice.call(this) : this[num];
        }
    };
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

    //字典数组
    ui.keyArray = function () {
        ui.ArrayObject.apply(this);
        this._keys = {};
        return this;
    };
    ui.keyArray.prototype = $.extend({}, ui.ArrayObject.prototype);
    delete ui.keyArray.prototype.shift;
    delete ui.keyArray.prototype.push;
    delete ui.keyArray.prototype.sort;
    delete ui.keyArray.prototype.pop;
    delete ui.keyArray.prototype.splice;
    delete ui.keyArray.prototype.concat;
    delete ui.keyArray.prototype.slice;

    $.extend(ui.keyArray.prototype, {
        contains: function (key) {
            return this._keys.hasOwnProperty(key);
        },
        set: function (key, value) {
            if (typeof key !== "string") {
                ui.error("the key must be string");
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
        },
        toArray: function () {
            var arr = [];
            var i = this.length - 1;
            for (; i >= 0 ; i--) {
                arr[i] = this[i];
            }
            return arr;
        }
    });

    return ui;
}))

///utiliy 工具集
///# custom event 事件管理器
; (function () {
    ui.EventTarget = function (target) {
        this._listeners = {};
        this._eventTarget = target || this;
    };
    ui.EventTarget.prototype = {
        addEventListener: function (type, callback, scope, priority) {
            if (isFinite(scope)) {
                priority = scope
                scope = null;
            }
            priority = priority || 0;
            var list = this._listeners[type], index = 0, listener, i;
            if (list == null) {
                this._listeners[type] = list = [];
            }
            i = list.length;
            while (--i > -1) {
                listener = list[i];
                if (listener.callback === callback) {
                    list.splice(i, 1);
                } else if (index === 0 && listener.priority < priority) {
                    index = i + 1;
                }
            }
            list.splice(index, 0, {
                callback: callback,
                scope: scope,
                priority: priority
            });
        },
        removeEventListener: function (type, callback) {
            var list = this._listeners[type], i;
            if (list) {
                i = list.length;
                while (--i > -1) {
                    if (list[i].callback === callback) {
                        list.splice(i, 1);
                        return;
                    }
                }
            }
        },
        dispatchEvent: function (type) {
            var list = this._listeners[type];
            if (list && list.length > 0) {
                var target = this._eventTarget,
                    args = Array.apply([], arguments),
                    i = list.length,
                    listener;
                var result;
                while (--i > -1) {
                    listener = list[i];
                    target = listener.scope || target;
                    args[0] = {
                        type: type,
                        target: target
                    }
                    result = listener.callback.apply(target, args);
                }
                return result;
            }
        },
        hasEvent: function (type) {
            var list = this._listeners[type];
            return list && list.length > 0;
        },
        initEvents: function (events, target) {
            if (!target) {
                target = this._eventTarget;
            }
            if (!events) {
                events = target.events;
            }
            if (ui.core.type(events) !== "array" || events.length == 0) {
                return;
            }

            var that = this;
            target.on = function (type, callback, scope, priority) {
                that.addEventListener(type, callback, scope, priority);
            };
            target.off = function (type, callback) {
                that.removeEventListener(type, callback);
            };
            target.fire = function (type) {
                var args = Array.apply([], arguments);
                return that.dispatchEvent.apply(that, args);
            };

            var i = 0, 
                len = events.length, 
                eventName;
            for (; i < len; i++) {
                eventName = events[i];
                target[eventName] = this._createEventFunction(eventName, target);
            }
        },
        _createEventFunction: function (type, target) {
            var eventName = type;
            return function (callback, scope, priority) {
                if (arguments.length > 0) {
                    target.on(eventName, callback, scope, priority);
                }
            };
        }
    };
})()

///Initial
; (function () {
    //主题
    ui.theme = {};
    ui.theme.highlight = {
        font: "font-highlight",
        fontHover: "font-highlight-hover",
        background: "background-highlight",
        backgroundHover: "background-highlight-hover",
        border: "border-highlight",
        borderHover: "border-highlight-hover",
        button: "button-highlight"
    };
    ui.theme.baseColor = {
        font: "theme-font-color",
        background: "theme-background-color",
        toolbar: "theme-toolbar-color",
        border: "theme-border-color",
        backgroundCtrl: "theme-ctrl-background-color"
    };
    //为jquery对象添加主题色操作方法
    $.fn.addHighlight = function () {
        var i = 1,
            len = arguments.length;
        if(len == 0) {
            return this;
        }
        var className,
            classes = [arguments[0]];
        for (; i < len; i++) {
            className = ui.theme.highlight[arguments[i].toLowerCase()];
            if(className) {
                classes.push(className);
            }
        }
        this.addClass(classes.join(" "));
        return this;
    };
    $.fn.removeHighlight = function () {
        var i = 1,
            len = arguments.length;
        if(len == 0) {
            return this;
        }
        var className,
            classes = [arguments[0]];
        for (; i < len; i++) {
            className = ui.theme.highlight[arguments[i].toLowerCase()];
            if(className) {
                classes.push(className);
            }
        }
        this.removeClass(classes.join(" "));
        return this;
    };
    //默认主题背景颜色是亮色
    ui.theme.background = "Light";
    var defaultThemeId = "Default";
    ui.theme.getTheme = function (themeId) {
        if (!themeId)
            themeId = defaultThemeId;
        var info;
        var themeInfo = null;
        if (Array.isArray(this.Colors)) {
            for (var i = 0, l = this.Colors.length; i < l; i++) {
                info = this.Colors[i];
                if (info.Id === themeId) {
                    themeInfo = info;
                    break;
                }
            }
        }
        return themeInfo;
    };
    ui.theme.getCurrentThemeId = function () {
        if(this.themeId) {
            return this.themeId;
        }
        var themeStyle = $("#theme");
        if (themeStyle.length == 0) {
            return null;
        }
        var url = themeStyle.prop("href");
        var themeId = ui.url.getParam(url).themeId;
        if (!themeId)
            themeId = defaultThemeId;
        return themeId;
    };
    ui.theme.getCurrentColor = function () {
        if (!Array.isArray(this.Colors)) {
            return null;
        }
        var themeId = this.getCurrentThemeId();
        if (!themeId) {
            return null;
        }
        var i, item;
        for (i = 0; i < this.Colors.length; i++) {
            item = this.Colors[i];
            if (item.Id === themeId) {
                return item.Color;
            }
        }
        return null;
    };
    ui.theme.overlay = function (color1, color2, alpha) {
        if (isNaN(alpha))
            alpha = .5;
        color1 = getRGB(color1);
        color2 = getRGB(color2);
        if(!color1 || !color2) {
            return null;
        }
        var newColor = [];
        for (var i = 0, l = color1.length; i < l; i++) {
            newColor[i] = parseInt((1 - alpha) * color1[i] + alpha * color2[i], 10);
        }
        return "#" + toHex(newColor[0]) + toHex(newColor[1]) + toHex(newColor[2]);
    };
    var hexchars = "0123456789ABCDEF";
    function toHex(n) {
        n = parseInt(n, 10) || 0;
        n = Math.round(Math.min(Math.max(0, n), 255));
        return hexchars.charAt((n - n % 16) / 16) + hexchars.charAt(n % 16);
    }
    function getRGB(color) {
        var t = ui.core.type(color),
            rgb;
        if(t !== "string") {
            return null;
        }
        rgb = [];
        if(color.charAt(0) === "#") {
            color = color.substring(1);
            rgb[0] = (toDec(color.substr(0, 1)) * 16) + toDec(color.substr(1, 1)) || 0;
            rgb[1] = (toDec(color.substr(2, 1)) * 16) + toDec(color.substr(3, 1)) || 0;
            rgb[2] = (toDec(color.substr(4, 1)) * 16) + toDec(color.substr(5, 1)) || 0;
        } else {
            rgb = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            if(rgb) {
                rgb = [parseInt(rgb[1], 10), parseInt(rgb[2], 10), parseInt(rgb[3], 10)];
            }
        }
        return rgb;
    }
    function toDec(hexchar) {
        return hexchars.indexOf(hexchar.toUpperCase());
    }
    
    
    var DOC = document,
        root = DOC.documentElement;
    var themeChanged = "themeChanged",
        docReady = "docReady",
        docClick = "docClick",
        docMouseUp = "docMouseUp",
        resize = "resize",
        hashchange = "hashchange";
    //ui 全局事件
    ui.events = [themeChanged, docReady, docClick, docMouseUp, resize, hashchange];
    ui.eventPriority = {
        masterReady: 3,
        pageReady: 2,

        bodyResize: 3,
        ctrlResize: 2,
        elementResize: 2
    };
    ui.eventTarget = new ui.EventTarget(ui);
    ui.eventTarget.initEvents();

    //注册全局document事件
    $(document).ready(function (e) {
        ui.fire(docReady);
    }).click(function (e) {
        ui.fire(docClick);
    });

    $(window)
        //注册全局resize事件
        .on(resize, function (e) {
            ui.fire(resize, root.clientWidth, root.clientHeight);
        })
        //注册全局hashchange事件
        .on(hashchange, function(e) {
            var hash = "";
            if(window.location.hash) {
                hash = window.location.hash;
            }
            ui.fire(hashchange, hash);
        });

    var docClickHideHandler = [];
    var hideCtrls = function (currentCtrl) {
        if (docClickHideHandler.length == 0) {
            return;
        }
        var handler,
            retain = [];
        while (handler = docClickHideHandler.shift()) {
            if (currentCtrl && currentCtrl === handler.ctrl) {
                continue;
            }
            if (handler.func.call(handler.ctrl) === "retain") {
                retain.push(handler);
            }
        }

        docClickHideHandler.push.apply(docClickHideHandler, retain);
    };
    ui.docClick(function (e) {
        hideCtrls();
    });
    ui.addHideHandler = function (ctrl, func) {
        if (ctrl && $.isFunction(func)) {
            docClickHideHandler.push({
                ctrl: ctrl,
                func: func
            });
        }
    };
    ui.hideAll = function (currentCtrl) {
        hideCtrls(currentCtrl);
    };
})()

/// promise
; (function () {
    //chrome36的原生Promise还多了一个defer()静态方法，允许不通过传参就能生成Promise实例，
    //另还多了一个chain(onSuccess, onFail)原型方法，意义不明
    //目前，firefox24, opera19也支持原生Promise(chrome32就支持了，但需要打开开关，自36起直接可用)
    //本模块提供的Promise完整实现ECMA262v6 的Promise规范
    //2015.3.12 支持async属性
    function ok(val) {
        return val;
    }
    function ng(e) {
        throw e;
    }

    function done(onSuccess) {
        //添加成功回调
        return this.then(onSuccess, ng);
    }
    function fail(onFail) {
        //添加出错回调
        return this.then(ok, onFail);
    }
    function defer() {
        var ret = {};
        ret.promise = new this(function (resolve, reject) {
            ret.resolve = resolve;
            ret.reject = reject;
        });
        return ret;
    }
    var uiPromise = function (executor) {
        this._callbacks = [];
        var me = this;
        if (typeof this !== "object")
            throw new Error("Promises must be constructed via new");
        if (typeof executor !== "function")
            throw new Error("not a function");

        executor(function (value) {
            _resolve(me, value);
        }, function (reason) {
            _reject(me, reason);
        })
    };
    function fireCallbacks(promise, fn) {
        var isAsync;
        if (ui.core.type(promise.async) === "boolean") {
            isAsync = promise.async;
        } else {
            isAsync = promise.async = true;
        }
        if (isAsync) {
            window.setTimeout(fn, 0);
        } else {
            fn();
        }
    }
    //返回一个已经处于`resolved`状态的Promise对象
    uiPromise.resolve = function (value) {
        return new uiPromise(function (resolve) {
            resolve(value);
        });
    }
    //返回一个已经处于`rejected`状态的Promise对象
    uiPromise.reject = function (reason) {
        return new uiPromise(function (resolve, reject) {
            reject(reason);
        });
    }

    uiPromise.prototype = {
        //一个Promise对象一共有3个状态：
        //- `pending`：还处在等待状态，并没有明确最终结果
        //- `resolved`：任务已经完成，处在成功状态
        //- `rejected`：任务已经完成，处在失败状态
        constructor: uiPromise,
        _state: "pending",
        _fired: false, //判定是否已经被触发
        _fire: function (onSuccess, onFail) {
            if (this._state === "rejected") {
                if (typeof onFail === "function") {
                    onFail(this._value);
                } else {
                    throw this._value;
                }
            } else {
                if (typeof onSuccess === "function") {
                    onSuccess(this._value);
                }
            }
        },
        _then: function (onSuccess, onFail) {
            if (this._fired) {//在已有Promise上添加回调
                var me = this;
                fireCallbacks(me, function () {
                    me._fire(onSuccess, onFail);
                });
            } else {
                this._callbacks.push({onSuccess: onSuccess, onFail: onFail});
            }
        },
        then: function (onSuccess, onFail) {
            onSuccess = typeof onSuccess === "function" ? onSuccess : ok;
            onFail = typeof onFail === "function" ? onFail : ng;
            //在新的Promise上添加回调
            var me = this;
            var nextPromise = new uiPromise(function (resolve, reject) {
                me._then(function (value) {
                    try {
                        value = onSuccess(value);
                    } catch (e) {
                        // https://promisesaplus.com/#point-55
                        reject(e);
                        return;
                    }
                    resolve(value);
                }, function (value) {
                    try {
                        value = onFail(value);
                    } catch (e) {
                        reject(e);
                        return;
                    }
                    resolve(value);
                });
            });
            for (var i in me) {
                if (!personal[i]) {
                    nextPromise[i] = me[i];
                }
            }
            return nextPromise;
        },
        "done": done,
        "catch": fail,
        "fail": fail
    };
    var personal = {
        _state: 1,
        _fired: 1,
        _value: 1,
        _callbacks: 1
    };
    function _resolve(promise, value) {
        //触发成功回调
        if (promise._state !== "pending")
            return;
        if (value && typeof value.then === "function") {
            //thenable对象使用then，Promise实例使用_then
            var method = value instanceof uiPromise ? "_then" : "then";
            value[method](function (val) {
                _transmit(promise, val, true);
            }, function (reason) {
                _transmit(promise, reason, false);
            });
        } else {
            _transmit(promise, value, true);
        }
    }
    function _reject(promise, value) {
        //触发失败回调
        if (promise._state !== "pending")
            return;
        _transmit(promise, value, false);
    }
    //改变Promise的_fired值，并保持用户传参，触发所有回调
    function _transmit(promise, value, isResolved) {
        promise._fired = true;
        promise._value = value;
        promise._state = isResolved ? "fulfilled" : "rejected";
        fireCallbacks(promise, function () {
            var data;
            for(var i = 0, len = promise._callbacks.length; i < len; i++) {
                data = promise._callbacks[i];
                promise._fire(data.onSuccess, data.onFail);
            }
        });
    }
    function _some(any, iterable) {
        iterable = ui.core.type(iterable) === "array" ? iterable : [];
        var n = 0, result = [], end;
        return new uiPromise(function (resolve, reject) {
            // 空数组直接resolve
            if (!iterable.length)
                resolve();
            function loop(a, index) {
                a.then(function (ret) {
                    if (!end) {
                        result[index] = ret;
                        //保证回调的顺序
                        n++;
                        if (any || n >= iterable.length) {
                            resolve(any ? ret : result);
                            end = true;
                        }
                    }
                }, function (e) {
                    end = true;
                    reject(e);
                });
            }
            for (var i = 0, l = iterable.length; i < l; i++) {
                loop(iterable[i], i);
            }
        });
    }

    uiPromise.all = function (iterable) {
        return _some(false, iterable);
    };
    uiPromise.race = function (iterable) {
        return _some(true, iterable);
    };
    uiPromise.defer = defer;

    ui.Promise = uiPromise;
    var nativePromise = window.Promise;
    if (/native code/.test(nativePromise)) {
        nativePromise.prototype.done = done;
        nativePromise.prototype.fail = fail;
        if (!nativePromise.defer) { 
            //chrome实现的私有方法
            nativePromise.defer = defer;
        }
    }
    return window.Promise = nativePromise || uiPromise;
})()

/// animation
; (function () {
    //初始化动画播放器
    var prefix = ["ms", "moz", "webkit", "o"],
        i = 0;
    for (; i < prefix.length && !window.requestAnimationFrame; i++) {
        window.requestAnimationFrame = window[prefix[i] + "RequestAnimationFrame"];
        window.cancelAnimationFrame = window[prefix[i] + "CancelAnimationFrame"] || window[prefix[i] + "CancelRequestAnimationFrame"];
    }
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function (callback, fps) {
            fps = fps || 60;
            setTimeout(callback, 1000 / fps);
        };
    }
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function (handle) {
            clearTimeout(handle);
        };
    }

    //动画效果
    ui.AnimationStyle = {
        easeInQuad: function (pos) {
            return Math.pow(pos, 2);
        },
        easeOutQuad: function (pos) {
            return -(Math.pow((pos - 1), 2) - 1);
        },
        easeInOutQuad: function (pos) {
            if ((pos /= 0.5) < 1) return 0.5 * Math.pow(pos, 2);
            return -0.5 * ((pos -= 2) * pos - 2);
        },
        easeInCubic: function (pos) {
            return Math.pow(pos, 3);
        },
        easeOutCubic: function (pos) {
            return (Math.pow((pos - 1), 3) + 1);
        },
        easeInOutCubic: function (pos) {
            if ((pos /= 0.5) < 1) return 0.5 * Math.pow(pos, 3);
            return 0.5 * (Math.pow((pos - 2), 3) + 2);
        },
        easeInQuart: function (pos) {
            return Math.pow(pos, 4);
        },
        easeOutQuart: function (pos) {
            return -(Math.pow((pos - 1), 4) - 1)
        },
        easeInOutQuart: function (pos) {
            if ((pos /= 0.5) < 1) return 0.5 * Math.pow(pos, 4);
            return -0.5 * ((pos -= 2) * Math.pow(pos, 3) - 2);
        },
        easeInQuint: function (pos) {
            return Math.pow(pos, 5);
        },
        easeOutQuint: function (pos) {
            return (Math.pow((pos - 1), 5) + 1);
        },
        easeInOutQuint: function (pos) {
            if ((pos /= 0.5) < 1) return 0.5 * Math.pow(pos, 5);
            return 0.5 * (Math.pow((pos - 2), 5) + 2);
        },
        easeInSine: function (pos) {
            return -Math.cos(pos * (Math.PI / 2)) + 1;
        },
        easeOutSine: function (pos) {
            return Math.sin(pos * (Math.PI / 2));
        },
        easeInOutSine: function (pos) {
            return (-.5 * (Math.cos(Math.PI * pos) - 1));
        },
        easeInExpo: function (pos) {
            return (pos == 0) ? 0 : Math.pow(2, 10 * (pos - 1));
        },
        easeOutExpo: function (pos) {
            return (pos == 1) ? 1 : -Math.pow(2, -10 * pos) + 1;
        },
        easeInOutExpo: function (pos) {
            if (pos == 0) return 0;
            if (pos == 1) return 1;
            if ((pos /= 0.5) < 1) return 0.5 * Math.pow(2, 10 * (pos - 1));
            return 0.5 * (-Math.pow(2, -10 * --pos) + 2);
        },
        easeInCirc: function (pos) {
            return -(Math.sqrt(1 - (pos * pos)) - 1);
        },
        easeOutCirc: function (pos) {
            return Math.sqrt(1 - Math.pow((pos - 1), 2));
        },
        easeInOutCirc: function (pos) {
            if ((pos /= 0.5) < 1) return -0.5 * (Math.sqrt(1 - pos * pos) - 1);
            return 0.5 * (Math.sqrt(1 - (pos -= 2) * pos) + 1);
        },
        easeOutBounce: function (pos) {
            if ((pos) < (1 / 2.75)) {
                return (7.5625 * pos * pos);
            } else if (pos < (2 / 2.75)) {
                return (7.5625 * (pos -= (1.5 / 2.75)) * pos + .75);
            } else if (pos < (2.5 / 2.75)) {
                return (7.5625 * (pos -= (2.25 / 2.75)) * pos + .9375);
            } else {
                return (7.5625 * (pos -= (2.625 / 2.75)) * pos + .984375);
            }
        },
        easeInBack: function (pos) {
            var s = 1.70158;
            return (pos) * pos * ((s + 1) * pos - s);
        },
        easeOutBack: function (pos) {
            var s = 1.70158;
            return (pos = pos - 1) * pos * ((s + 1) * pos + s) + 1;
        },
        easeInOutBack: function (pos) {
            var s = 1.70158;
            if ((pos /= 0.5) < 1) return 0.5 * (pos * pos * (((s *= (1.525)) + 1) * pos - s));
            return 0.5 * ((pos -= 2) * pos * (((s *= (1.525)) + 1) * pos + s) + 2);
        },
        elastic: function (pos) {
            return -1 * Math.pow(4, -8 * pos) * Math.sin((pos * 6 - 1) * (2 * Math.PI) / 2) + 1;
        },
        swingFromTo: function (pos) {
            var s = 1.70158;
            return ((pos /= 0.5) < 1) ? 0.5 * (pos * pos * (((s *= (1.525)) + 1) * pos - s)) :
                0.5 * ((pos -= 2) * pos * (((s *= (1.525)) + 1) * pos + s) + 2);
        },
        swingFrom: function (pos) {
            var s = 1.70158;
            return pos * pos * ((s + 1) * pos - s);
        },
        swingTo: function (pos) {
            var s = 1.70158;
            return (pos -= 1) * pos * ((s + 1) * pos + s) + 1;
        },
        swing: function (pos) {
            return 0.5 - Math.cos(pos * Math.PI) / 2;
        },
        bounce: function (pos) {
            if (pos < (1 / 2.75)) {
                return (7.5625 * pos * pos);
            } else if (pos < (2 / 2.75)) {
                return (7.5625 * (pos -= (1.5 / 2.75)) * pos + .75);
            } else if (pos < (2.5 / 2.75)) {
                return (7.5625 * (pos -= (2.25 / 2.75)) * pos + .9375);
            } else {
                return (7.5625 * (pos -= (2.625 / 2.75)) * pos + .984375);
            }
        },
        bouncePast: function (pos) {
            if (pos < (1 / 2.75)) {
                return (7.5625 * pos * pos);
            } else if (pos < (2 / 2.75)) {
                return 2 - (7.5625 * (pos -= (1.5 / 2.75)) * pos + .75);
            } else if (pos < (2.5 / 2.75)) {
                return 2 - (7.5625 * (pos -= (2.25 / 2.75)) * pos + .9375);
            } else {
                return 2 - (7.5625 * (pos -= (2.625 / 2.75)) * pos + .984375);
            }
        },
        easeFromTo: function (pos) {
            if ((pos /= 0.5) < 1) return 0.5 * Math.pow(pos, 4);
            return -0.5 * ((pos -= 2) * Math.pow(pos, 3) - 2);
        },
        easeFrom: function (pos) {
            return Math.pow(pos, 4);
        },
        easeTo: function (pos) {
            return Math.pow(pos, 0.25);
        },
        linear: function (pos) {
            return pos
        },
        sinusoidal: function (pos) {
            return (-Math.cos(pos * Math.PI) / 2) + 0.5;
        },
        reverse: function (pos) {
            return 1 - pos;
        },
        mirror: function (pos, transition) {
            transition = transition || ui.AnimationStyle.sinusoidal;
            if (pos < 0.5)
                return transition(pos * 2);
            else
                return transition(1 - (pos - 0.5) * 2);
        },
        flicker: function (pos) {
            pos = pos + (Math.random() - 0.5) / 5;
            return ui.AnimationStyle.sinusoidal(pos < 0 ? 0 : pos > 1 ? 1 : pos);
        },
        wobble: function (pos) {
            return (-Math.cos(pos * Math.PI * (9 * pos)) / 2) + 0.5;
        },
        pulse: function (pos, pulses) {
            return (-Math.cos((pos * ((pulses || 5) - .5) * 2) * Math.PI) / 2) + .5;
        },
        blink: function (pos, blinks) {
            return Math.round(pos * (blinks || 5)) % 2;
        },
        spring: function (pos) {
            return 1 - (Math.cos(pos * 4.5 * Math.PI) * Math.exp(-pos * 6));
        },
        none: function (pos) {
            return 0;
        },
        full: function (pos) {
            return 1;
        }
    };

    //动画执行器
    var Animator = function () {
        //动画持续时间
        this.duration = 500;
        //动画的帧，一秒执行多少次
        this.fps = 60;
        //开始回调
        this.onBegin = false;
        //结束回调
        this.onEnd = false;
        //动画是否循环
        this.loop = false;
        //动画是否开始
        this.isStarted = false;
    };
    Animator.prototype = new ui.ArrayObject();
    Animator.prototype.addTarget = function (target, option) {
        if (arguments.length == 1) {
            option = target;
            target = option.target;
        }
        if (option) {
            option.target = target;
            this.push(option);
        }
        return this;
    };
    Animator.prototype.removeTarget = function (option) {
        var index = -1;
        if (ui.core.type(option) !== "number") {
            for (var i = 0; i < this.length; i++) {
                if (this[i] === option) {
                    index = i;
                    break;
                }
            }
        } else {
            index = option;
        }
        if (index < 0) {
            return;
        }
        this.splice(index, 1);
    };
    Animator.prototype.doAnimation = function () {
        if (this.length == 0) {
            return;
        }

        this.isStarted = true;
        var duration = parseInt(this.duration, 10) || 500,
            fps = parseInt(this.fps, 10) || 60,
            that = this,
            i = 0,
            len = this.length;
        //开始执行的时间
        var startTime = new Date().getTime();
        this.stopHandle = null;
        (function () {
            var option = null;
            that.stopHandle = requestAnimationFrame(function () {
                //当前帧开始的时间
                var newTime = new Date().getTime(),
                    //逝去时间
                    timestamp = newTime - startTime,
                    delta;
                for (i = 0; i < len; i++) {
                    option = that[i];
                    if (option.disabled) {
                        continue;
                    }
                    try {
                        delta = option.ease(timestamp / duration);
                        option.current = Math.ceil(option.begin + delta * option.change);
                        option.onChange(option.current, option.target, that);
                    } catch(e) {
                        that.promise._reject(e);
                    }
                }
                if (duration <= timestamp) {
                    for (i = 0; i < len; i++) {
                        option = that[i];
                        try {
                            option.onChange(option.end, option.target, that);
                        } catch(e) {
                            that.promise._reject(e);
                        }
                    }

                    that.isStarted = false;
                    that.stopHandle = null;
                    if ($.isFunction(that.onEnd)) {
                        that.onEnd.call(that);
                    }
                } else {
                    that.stopHandle = requestAnimationFrame(arguments.callee);
                }
            }, 1000 / fps);
        })();
    };
    Animator.prototype._prepare = function () {
        var i = 0,
            option = null,
            disabledCount = 0;
        for (; i < this.length; i++) {
            option = this[i];
            if (!option) {
                this.splice(i, 1);
                i--;
            }

            option.disabled = false;
            //开始位置
            option.begin = option.begin || 0;
            //结束位置
            option.end = option.end || 0;
            //变化量
            option.change = option.end - option.begin;
            //当前值
            option.current = option.begin;
            if (option.change == 0) {
                option.disabled = true;
                disabledCount++;
                continue;
            }
            //必须指定，基本上对top,left,width,height这个属性进行设置
            option.onChange = option.onChange || ui.core.noop;
            //要使用的缓动公式
            option.ease = option.ease || ui.AnimationStyle.easeFromTo;
        }
        return this.length == disabledCount;
    };
    Animator.prototype.start = function (duration) {
        var flag,
            fn,
            that = this;
        this.onBegin = $.isFunction(this.onBegin) ? this.onBegin : ui.core.noop;
        this.onEnd = $.isFunction(this.onEnd) ? this.onEnd : ui.core.noop;
        
        var _resolve, _reject;
        var promise = new Promise(function(resolve, reject) {
            _resolve = resolve;
            _reject = reject;
        });
        this.promise = promise;
        this.promise._resolve = _resolve;
        this.promise._reject = _reject;

        if (!this.isStarted) {
            if(ui.core.type(duration) === "number" && duration > 0) {
                this.duration = duration;
            }
            flag = this._prepare();
            this.onBegin.call(this);

            if (flag) {
                setTimeout(function() {
                    that.onEnd.call(that);
                    promise._resolve(that);
                });
            } else {
                fn = this.onEnd;
                this.onEnd = function () {
                    this.onEnd = fn;
                    fn.call(this);
                    promise._resolve(this);
                };
                this.doAnimation();
            }
        }
        return promise;
    };
    Animator.prototype.stop = function () {
        window.cancelAnimationFrame(this.stopHandle);
        this.isStarted = false;
        this.stopHandle = null;
        
        if(this.promise) {
            this.promise = null;
        }
    };

    ui.animator = function (target, option) {
        var list = new Animator();
        list.addTarget.apply(list, arguments);
        return list;
    };

    //jquery扩展
    var animateKey = "animationExOption"
    $.fn.animationStart = function (option) {
        var elem = this;
        var a = ui.animator(elem, option);

        a.duration = option.duration;
        a.fps = option.fps;
        delete option.duration;
        delete option.fps;

        elem.data(animateKey, a);
        return a.start();
    };
    $.fn.animationStop = function () {
        var elem = this,
            a = elem.data(animateKey);
        if (a) {
            a.stop();
        }
    };
    $.fn.isAnimationStart = function () {
        var elem = this;
        var option = elem.data(animateKey);
        return option.isStarted && option.stopHandler !== null;
    };
})()

///# sorter introsort
; (function () {
    //sort
    var core = ui.core,
        size_threshold = 16;
    ui.Introsort = function () {
        this.keys = null;
        this.items = null;
        this.comparer = function (a, b) {
            if (core.type(a) === "string") {
                return a.localeCompare(b);
            }
            if (a < b) {
                return -1;
            } else if (b > a) {
                return 1;
            } else {
                return 0;
            }
        };
    };
    ui.Introsort.prototype = {
        sort: function (arr) {
            if (core.type(arr) === "function") {
                this.comparer = arr;
            } else {
                this.keys = arr;
                if (core.type(arguments[1]) === "function") {
                    this.comparer = arguments[1];
                }
            }
            if (core.type(this.keys) !== "array") {
                return;
            }
            if (this.keys.length < 2) {
                return;
            }
            if (core.type(this.items) !== "array") {
                this.items = null;
            }
            this._introsort(0, this.keys.length - 1, 2 * this._floorLog2(this.keys.length));
        },
        //introsort
        _introsort: function (lo, hi, depthLimit) {
            var num;
            while (hi > lo) {
                num = hi - lo + 1;
                if (num <= size_threshold) {
                    if (num == 1) {
                        return;
                    }
                    if (num == 2) {
                        this._compareAndSwap(lo, hi);
                        return;
                    }
                    if (num == 3) {
                        this._compareAndSwap(lo, hi - 1);
                        this._compareAndSwap(lo, hi);
                        this._compareAndSwap(hi - 1, hi);
                        return;
                    }
                    this._insertionsort(lo, hi);
                    return;
                }
                else {
                    if (depthLimit == 0) {
                        this._heapsort(lo, hi);
                        return;
                    }
                    depthLimit--;
                    num = this.partition(lo, hi);
                    this._introsort(num + 1, hi, depthLimit);
                    hi = num - 1;
                }
            }
        },
        partition: function (lo, hi) {
            var num = parseInt(lo + (hi - lo) / 2, 10);
            this._compareAndSwap(lo, num);
            this._compareAndSwap(lo, hi);
            this._compareAndSwap(num, hi);

            var a = this.keys[num];
            this._swap(num, hi - 1);

            var i = lo;
            num = hi - 1;
            while (i < num) {
                while (this.comparer(this.keys[++i], a) < 0) {
                }
                while (this.comparer(a, this.keys[--num]) < 0) {
                }
                if (i >= num) {
                    break;
                }
                this._swap(i, num);
            }
            this._swap(i, hi - 1);
            return i;
        },
        //Heapsort
        _heapsort: function (lo, hi) {
            var num = hi - lo + 1;
            var i = Math.floor(num / 2), j;
            for (; i >= 1; i--) {
                this._downHeap(i, num, lo);
            }
            for (j = num; j > 1; j--) {
                this._swap(lo, lo + j - 1);
                this._downHeap(1, j - 1, lo);
            }
        },
        _downHeap: function (i, n, lo) {
            var a = this.keys[lo + i - 1];
            var b = (this.items) ? this.items[lo + i - 1] : null;
            var num;
            while (i <= Math.floor(n / 2)) {
                num = 2 * i;
                if (num < n && this.comparer(this.keys[lo + num - 1], this.keys[lo + num]) < 0) {
                    num++;
                }
                if (this.comparer(a, this.keys[lo + num - 1]) >= 0) {
                    break;
                }
                this.keys[lo + i - 1] = this.keys[lo + num - 1];
                if (this.items != null) {
                    this.items[lo + i - 1] = this.items[lo + num - 1];
                }
                i = num;
            }
            this.keys[lo + i - 1] = a;
            if (this.items != null) {
                this.items[lo + i - 1] = b;
            }
        },
        //Insertion sort
        _insertionsort: function (lo, hi) {
            var i, num;
            var a, b
            for (i = lo; i < hi; i++) {
                num = i;
                a = this.keys[i + 1];
                b = (this.items) ? this.items[i + 1] : null;
                while (num >= lo && this.comparer(a, this.keys[num]) < 0) {
                    this.keys[num + 1] = this.keys[num];
                    if (this.items != null) {
                        this.items[num + 1] = this.items[num];
                    }
                    num--;
                }
                this.keys[num + 1] = a;
                if (this.items) {
                    this.items[num + 1] = b;
                }
            }
        },
        _swap: function (i, j) {
            var temp = this.keys[i];
            this.keys[i] = this.keys[j];
            this.keys[j] = temp;
            if (this.items) {
                temp = this.items[i];
                this.items[i] = this.items[j];
                this.items[j] = temp;
            }
        },
        _compareAndSwap: function (i, j) {
            if (i != j && this.comparer(this.keys[i], this.keys[j]) > 0) {
                this._swap(i, j);
            }
        },
        _floorLog2: function (len) {
            var num = 0;
            while (len >= 1) {
                num++;
                len /= 2;
            }
            return num;
        }
    };
    ///# end sorter
})()

// Json2
; (function () {
    if (!window.JSON) {
        window.JSON = {};
    }
    var JSON = window.JSON;
    function f(n) {
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {
        Date.prototype.toJSON = function (key) {
            return isFinite(this.valueOf())
                ? this.getUTCFullYear() + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate()) + 'T' +
                    f(this.getUTCHours()) + ':' +
                    f(this.getUTCMinutes()) + ':' +
                    f(this.getUTCSeconds()) + 'Z'
                : null;
        };

        String.prototype.toJSON =
            Number.prototype.toJSON =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        },
        rep;

    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }

    function str(key, holder) {
        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];
        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }
        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

        switch (typeof value) {
            case 'string':
                return quote(value);
            case 'number':
                return isFinite(value) ? String(value) : 'null';
            case 'boolean':
            case 'null':
                return String(value);
            case 'object':
                if (!value) {
                    return 'null';
                }
                gap += indent;
                partial = [];

                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }
                    v = partial.length === 0
                        ? '[]'
                        : gap
                            ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                            : '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }

                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        if (typeof rep[i] === 'string') {
                            k = rep[i];
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }
                v = partial.length === 0
                    ? '{}'
                    : gap
                        ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                        : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
        }
    }
    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {
            var i;
            gap = '';
            indent = '';
            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }
            } else if (typeof space === 'string') {
                indent = space;
            }
            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }
            return str('', { '': value });
        };
    }

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {
            var j;
            function walk(holder, key) {
                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

                j = eval('(' + text + ')');

                return typeof reviver === 'function'
                    ? walk({ '': j }, '')
                    : j;
            }
            throw new SyntaxError('JSON.parse');
        };
    }
}())

//utility
; (function () {
    ui.fixedNumber = function (number, precision) {
        var b = 1;
        if (isNaN(number)) return number;
        if (number < 0) b = -1;
        if (isNaN(precision)) precision = 0;
        var multiplier = Math.pow(10, precision);
        return Math.round(Math.abs(number) * multiplier) / multiplier * b;
    };

    ui.random = function (min, max) {
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
        var range = max - min;
        val = min + Math.floor(Math.random() * range);
        return val;
    };
    
    ui.parseInt = function(str, radix) {
        if(!radix)
            radix = 10;
        return parseInt(str + "", radix);
    };

    //String
    ui.str = {
        empty: "",
        trim: function (str) {
            if (ui.core.type(str) !== "string") {
                return str;
            }
            var c = arguments[1];
            if (!c) {
                c = "\\s";
            }
            var r = new RegExp("(^" + c + "*)|(" + c + "*$)", "g");
            return str.replace(r, this.empty);
        },
        lTrim: function (str) {
            if (ui.core.type(str) !== "string") {
                return str;
            }
            var c = arguments[1];
            if (!c) {
                c = "\\s";
            }
            var r = new RegExp("(^" + c + "*)", "g");
            return str.replace(r, this.empty);
        },
        rTrim: function (str) {
            if (ui.core.type(str) !== "string") {
                return str;
            }
            var c = arguments[1];
            if (!c) {
                c = "\\s";
            }
            var r = new RegExp("(" + c + "*$)", "g");
            return str.replace(r, this.empty);
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
                return ui.str.empty;
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
            if (!jsonDate) {
                return null;
            }
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
        
        _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
        base64Encode: function (input) {
            var output = "";
            var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
            var i = 0;

            input = this._utf8_encode(input);

            while (i < input.length) {
                chr1 = input.charCodeAt(i++);
                chr2 = input.charCodeAt(i++);
                chr3 = input.charCodeAt(i++);
                
                enc1 = chr1 >> 2;
                enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                enc4 = chr3 & 63;

                if (isNaN(chr2)) {
                    enc3 = enc4 = 64;
                } else if (isNaN(chr3)) {
                    enc4 = 64;
                }
                output = output +
                    this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                    this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
            }
            return output;
        },
        base64Decode: function (input) {
            var output = "";
            var chr1, chr2, chr3;
            var enc1, enc2, enc3, enc4;
            var i = 0;

            input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

            while (i < input.length) {
                enc1 = this._keyStr.indexOf(input.charAt(i++));
                enc2 = this._keyStr.indexOf(input.charAt(i++));
                enc3 = this._keyStr.indexOf(input.charAt(i++));
                enc4 = this._keyStr.indexOf(input.charAt(i++));

                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;

                output = output + String.fromCharCode(chr1);

                if (enc3 != 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output = output + String.fromCharCode(chr3);
                }
            }
            output = this._utf8_decode(output);
            return output;
        },
        _utf8_encode: function (string) {
            string = string.replace(/\r\n/g, "\n");
            var utftext = "",
                c;
            for (var n = 0; n < string.length; n++) {
                c = string.charCodeAt(n);
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                }
                else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
                else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
            }
            return utftext;
        },
        _utf8_decode: function (utftext) {
            var string = "";
            var i = 0;
            var c = 0, 
                c3 = 0, 
                c2 = 0;
            while (i < utftext.length) {
                c = utftext.charCodeAt(i);
                if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
                }
                else if ((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i + 1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
                }
                else {
                    c2 = utftext.charCodeAt(i + 1);
                    c3 = utftext.charCodeAt(i + 2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }
            }
            return string;
        },
        htmlEncode: function(str) {
            if (this.isNullOrEmpty(str)) {
                return this.empty;
            }
            return $("<span />").append(document.createTextNode(str)).html();
        },
        htmlDecode: function(str) {
            if (this.isNullOrEmpty(str)) {
                return this.empty;
            }
            return $("<span />").html(str).text();
        },
        numberFormatScale: function (num, zeroCount) {
            if (isNaN(num))
                return null;
            if (isNaN(zeroCount))
                zeroCount = 2;
            num = ui.fixedNumber(num, zeroCount);
            var integerText = num + ui.str.empty;
            var scaleText;
            var index = integerText.indexOf(".");
            if (index < 0) {
                scaleText = ui.str.empty;
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
        integerFormat: function (num, count) {
            num = parseInt(num, 10);
            if (isNaN(num))
                return NaN;
            if (isNaN(count))
                count = 8;
            var numText = num + ui.str.empty;
            var len = count - numText.length;
            var i;
            for (i = 0; i < len; i++) {
                numText = "0" + numText;
            }
            return numText;
        },
        formatMoney: function (value, symbol) {
            if (!symbol) {
                symbol = "￥";
            }
            var content = ui.str.numberFormatScale(value, 2);
            if (!content) {
                return content;
            }
            var arr = content.split(".");
            content = arr[0];
            var index = 0;
            var result = [];
            for (var i = content.length - 1; i >= 0; i--) {
                if (index == 3) {
                    index = 0;
                    result.push(",");
                }
                index++;
                result.push(content.charAt(i));
            }
            result.push(symbol);
            result.reverse();
            result.push(".", arr[1]);
            return result.join(ui.str.empty);
        }
    };

    //object
    ui.obj = {
        _ignore: function(ignore) {
            var ignoreType = ui.core.type(ignore);
            var prefix;
            if(ignoreType !== "function") {
                if(ignoreType === "string") {
                    prefix = ignore;
                    ignore = function() {
                        return index.indexOf(prefix) > -1;  
                    };
                } else {
                    ignore = function() {
                        return this.indexOf("_") > -1;  
                    };
                }
            }
            return ignore;
        },
        //浅克隆
        clone: function (source, ignore) {
            var result,
                type = ui.core.type(source);
            ignore = this._ignore(ignore);
            
            if(type === "object") {
                result = {};
            } else if(type === "array") {
                result = [];
            } else {
                return source;
            }
            for (var key in source) {
                if(ignore.call(key)) {
                    continue;
                }
                result[key] = source[key];
            }
            return result;
        },
        //深克隆对象
        deepClone: function (source, ignore) {
            var result,
                type = ui.core.type(source);
            if(type === "object") {
                result = {};
            } else if(type === "array") {
                result = [];
            } else {
                return source;
            }
            
            ignore = this._ignore(ignore);
            var copy = null;
            for (var key in source) {
                if(ignore.call(key)) {
                    continue;
                }
                copy = source[key];
                if (result === copy)
                    continue;
                type = ui.core.type(copy);
                if (type === "object" || type === "array") {
                    result[key] = arguments.callee.call(this, copy);
                } else {
                    result[key] = copy;
                }
            }
            return result;
        }
    };

    //url
    var url_rquery = /\?/,
        r20 = /%20/g;
    ui.url = {
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
                    value = $.isFunction(value) ? value() : (value == null ? "" : value);
                    s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
                },
                i, t, key;
            if ((list) || list.length == 0)
                return null;
            var tempList = {}, temp, root,
                item, i, id, pid,
                flagField = "fromList";
            var pField, vField;
            if (!$.isFunction(parentField)) {
                if (ui.core.type(parentField) === "string") {
                    pField = parentField;
                    parentField = function () {
                        return this[pField];
                    };
                } else {
                    ui.error("parentField isn't String or Function");
                }
            }
            if (!$.isFunction(valueField)) {
                if (ui.core.type(valueField) === "string") {
                    vField = valueField;
                    valueField = function () {
                        return this[vField];
                    };
                } else {
                    ui.error("valueField isn't String or Function");
                }
            }
            if (ui.core.type(childrenField) !== "string") {
                childrenField = "children";
            }

            for (i = 0; i < list.length; i++) {
                item = list[i];
                pid = parentField.call(item) + "" || "__";
                if (tempList.hasOwnProperty(pid)) {
                    temp = tempList[pid];
                    temp[childrenField].push(item);
                } else {
                    temp = {};
                    temp[childrenField] = [];
                    temp[childrenField].push(item);
                    tempList[pid] = temp;
                }
                id = valueField.call(item) + "";
                if (tempList.hasOwnProperty(id)) {
                    temp = tempList[id];
                    item[childrenField] = temp[childrenField];
                    tempList[id] = item;
                    item[flagField] = true;
                } else {
                    item[childrenField] = [];
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
            return root[childrenField];
        }
    };

    ///guid
    ui.guid = {
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

    /// 数据处理
    ui.data = {
        listToTree: function (list, parentField, valueField, childrenField) {
            if (!$.isArray(list) || list.length == 0)
                return null;
            var tempList = {}, temp, root,
                item, i, id, pid,
                flagField = "fromList";
            var pField, vField;
            if (!$.isFunction(parentField)) {
                if (ui.core.type(parentField) === "string") {
                    pField = parentField;
                    parentField = function () {
                        return this[pField];
                    };
                } else {
                    ui.error("parentField isn't String or Function");
                }
            }
            if (!$.isFunction(valueField)) {
                if (ui.core.type(valueField) === "string") {
                    vField = valueField;
                    valueField = function () {
                        return this[vField];
                    };
                } else {
                    ui.error("valueField isn't String or Function");
                }
            }
            if (ui.core.type(childrenField) !== "string") {
                childrenField = "children";
            }

            for (i = 0; i < list.length; i++) {
                item = list[i];
                pid = parentField.call(item) + "" || "__";
                if (tempList.hasOwnProperty(pid)) {
                    temp = tempList[pid];
                    temp[childrenField].push(item);
                } else {
                    temp = {};
                    temp[childrenField] = [];
                    temp[childrenField].push(item);
                    tempList[pid] = temp;
                }
                id = valueField.call(item) + "";
                if (tempList.hasOwnProperty(id)) {
                    temp = tempList[id];
                    item[childrenField] = temp[childrenField];
                    tempList[id] = item;
                    item[flagField] = true;
                } else {
                    item[childrenField] = [];
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
            return root[childrenField];
        }
    };
})()

//ajax
; (function () {
    var responsedJson = "X-Responded-JSON";
    function unauthorized(xhr, context) {
        var json = null;
        if(xhr.status == 401) {
            return unauthorizedHandler(context);
        } else if(xhr.status == 403) {
            return forbiddenHandler(context);
        } else if(xhr.status == 200) {
            json = xhr.getResponseHeader(responsedJson);
            if(!ui.str.isNullOrEmpty(json)) {
                try {
                    json = JSON.parse(json);
                } catch(e) {
                    json = null;
                }
                if(json) {
                    if(json.status == 401)
                        return unauthorizedHandler(context);
                    else if (json.status == 403)
                        return forbiddenHandler(context);
                }
            }
        }
        return true;
    }
    function unauthorizedHandler(context) {
        alert("等待操作超时，您需要重新登录");
        location.replace(location.href);
        return false;
    }
    function forbiddenHandler(context) {
        var error = {
            message: "您没有权限执行此操作，请更换用户重新登录或联系系统管理员。"
        };
        if(context && context.errorFn) {
             context.errorFn(error);
        }
        return false;
    }
    function successHandler(context, data, textStatus, xhr) {
        var result = unauthorized(xhr, context);
        if(result === false) {
            return;
        }
        context.successFn(data);
    }
    function errorHandler(context, xhr, textStatus, errorThrown) {
        var result = unauthorized(xhr, context);
        if(result === false) {
            return;
        }
        if(textStatus === "parsererror") {
            context.error.message = "没能获取预期的数据类型，转换json发生错误";
            context.error.responseText = xhr.responseText;
        } else {
            try {
                result = JSON.parse(xhr.responseText);
                context.error.message = result.Message;
            } catch(e) {
                context.error.message = xhr.responseText;
            }
        }
        context.errorFn(context.error);
    }
    function ajaxCall(method, url, args, successFn, errorFn, option) {
        var type,
            ajaxOption,
            context = {
                error: {}
            };
        if ($.isFunction(args)) {
            errorFn = successFn;
            successFn = args;
            args = null;
        }

        type = ui.core.type(args);
        if (type !== "string") {
            if (type === "array" || ui.core.isPlainObject(args)) {
                args = JSON.stringify(args);
            } else {
                args = "{}";
            }
        }

        ajaxOption = {
            type: method.toUpperCase() === "GET" ? "GET" : "POST",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            url: url,
            async: true,
            data: args
        };
        if (option) {
            ajaxOption = $.extend(ajaxOption, option);
        }
        if ($.isFunction(successFn)) {
            context.successFn = successFn;
            ajaxOption.success = function(d, s, r) {
                successHandler(context, d, s, r);
            };
        }
        if ($.isFunction(errorFn)) {
            context.errorFn = errorFn;
            ajaxOption.error = function(r, s, t) {
                errorHandler(context, r, s, t);
            }
        }
        return $.ajax(ajaxOption);
    }

    //Ajax
    ui.ajax = {
        ajaxGet: function (url, args, success, error, option) {
            return ajaxCall("GET", url, args, success, error, option);
        },
        ajaxPost: function (url, args, success, error, option) {
            return ajaxCall("POST", url, args, success, error, option);
        },
        ajaxPostOnce: function (btn, url, args, success, error, option) {
            btn = ui.getJQueryElement(btn);
            if(!btn) {
                throw ui.error("没有正确设置要禁用的按钮");
            }
            if(!option) {
                option = {};
            }

            var text = null,
                textFormat = "正在{0}...",
                func;
            if(option.textFormat) {
                textFormat = option.textFormat;
                delete option.textFormat;
            }
            btn.attr("disabled", "disabled");
            func = function() {
                btn.removeAttr("disabled");
            };
            if(btn.isNodeName("input")) {
                text = btn.val();
                if(text.length > 0) {
                    btn.val(ui.str.stringFormat(textFormat, text));
                } else {
                    btn.val(ui.str.stringFormat(textFormat, "处理"));
                }
                func = function() {
                    btn.val(text);
                    btn.removeAttr("disabled");
                };
            } else {
                text = btn.html();
                if(!ui._rhtml.test(text)) {
                    btn.text(ui.str.stringFormat(textFormat, text));
                    func = function() {
                        btn.text(text);
                        btn.removeAttr("disabled");
                    };
                }
            }
            
            option.complete = func;
            return ajaxCall("POST", url, args, success, error, option);
        },
        ajaxAll: function () {
            var promises;
            if (arguments.length == 1) {
                promises = arguments[0];
                if (!(promises)) {
                    promises = [promises];
                }
            } else if (arguments.length > 1) {
                promises = [].slice.call(arguments, 0);
            } else {
                return;
            }
            var promise = Promise.all(promises);
            promise._then_old = promise.then;

            promise.then = function () {
                var context;
                if (arguments.length > 1 && $.isFunction(arguments[1])) {
                    context = {
                        error: {},
                        errorFn: arguments[1]
                    };
                    arguments[1] = function(xhr) {
                        errorHandler(context, xhr);
                    };
                }
                return this._then_old.apply(this, arguments);
            };
            return promise;
        }
    };
})()

/// UI控件
; (function(core) {
    //类型管理
    ui.define = function (name, base, prototype) {
        var fullName = "",
            existingConstructor, constructor,
            //支持原型中的方法重写
            proxiedPrototype = {},
            basePrototype;

        var nameArray = name.split(".");
        var namespace = nameArray[0];
        name = nameArray[1];

        if (!prototype) {
            prototype = base;
            base = ui.Widget;
        }

        ui[namespace] = ui[namespace] || {};
        existingConstructor = ui[namespace][name];
        constructor = ui[namespace][name] = function (option, element) {
            if (!this._createWidget) {
                return new constructor(option, element);
            }
            if (arguments.length) {
                this._createWidget(option, element);
            }
        };

        if (existingConstructor) {
            $.extend(constructor, existingConstructor);
        }

        basePrototype = new base();
        //create options instance
        basePrototype.option = $.extend({}, basePrototype.option);
        if (basePrototype.namespace) {
            namespace = basePrototype.namespace.split('.')[0] + "." + namespace;
        } else {
            namespace = "ui." + namespace
        }
        fullName += namespace + "." + name;

        //方法重写
        $.each(prototype, function (prop, value) {
            if (!$.isFunction(value)) {
                return;
            }
            var func = base.prototype[prop];
            if (!$.isFunction(func)) {
                return;
            }
            delete prototype[prop];
            proxiedPrototype[prop] = (function () {
                var _super = function () {
                    return base.prototype[prop].apply(this, arguments);
                },
                _superApply = function (args) {
                    return base.prototype[prop].apply(this, args);
                };
                return function () {
                    var __super = this._super,
                        __superApply = this._superApply,
                        returnValue;

                    this._super = _super;
                    this._superApply = _superApply;

                    returnValue = value.apply(this, arguments);

                    this._super = __super;
                    this._superApply = __superApply;

                    return returnValue;
                };
            })();
        });

        constructor.prototype = $.extend(basePrototype,
            prototype, proxiedPrototype, {
            constructor: constructor,
            namespace: namespace,
            name: name,
            fullName: fullName
        });

        return constructor;
    };

    //控件基类
    ui.Widget = function () { };
    ui.Widget.prototype = {
        widgetName: "widget",
        namespace: "ui",
        version: "1.5.0.0",
        option: {},

        extend: function(target) {
            var input = core.slice.call(arguments, 1),
            i = 0, len = input.length,
            option, key, value;
            for (; i < len; i++) {
                option = input[i];
                for (key in option) {
                    value = option[key];
                    if (option.hasOwnProperty(key) && value !== undefined) {
                        // Clone objects
                        if (core.isPlainObject(value)) {
                            target[key] = core.isPlainObject(target[key]) ?
                                this.extend({}, target[key], value) :
                                // Don't extend strings, arrays, etc. with objects
                                this.extend({}, value);
                        // Copy everything else by reference
                        } else {
                            if (value !== null && value !== undefined) {
                                target[key] = value;
                            }
                        }
                    }
                }
            }
            return target;
        },
        _createWidget: function (option, element) {
            this.document = document;
            this.window = window;
            this.element = element || null;

            this.option = this.extend({}, this.option,
                this._getOption(),
                option);

            this._create();
            this._initEvents();
            this._init();

            return this;
        },
        _getOption: core.noop,
        _getEvents: core.noop,
        _create: core.noop,
        _init: core.noop,
        _initEvents: function () {
            var events = this._getEvents();
            if (core.type(events) === "array" && events.length > 0) {
                this.eventTarget = new ui.EventTarget(this);
                this.eventTarget.initEvents(events);
            }
        },
        toString: function () {
            return this.fullName;
        }
    };
    //下拉框基类
    ui.define("ctrls.DropDownPanel", {
        showTimeValue: 200,
        hideTimeValue: 200,
        _create: function() {
            this.setLayoutPanel(this.option.layoutPanel);
            this.onMousemoveHandler = $.proxy(function(e) {
                var eWidth = this.element.width(),
                    offsetX = e.offsetX;
                if(!offsetX) {
                    offsetX = e.clientX - this.element.offset().left;
                }
                if (eWidth - offsetX < 0 && this.isShow()) {
                    this.element.css("cursor", "pointer");
                    this._clearable = true;
                } else {
                    this.element.css("cursor", "auto");
                    this._clearable = false;
                }
            }, this);
            this.onMouseupHandler = $.proxy(function(e) {
                if(!this._clearable) {
                    return;
                }
                var eWidth = this.element.width(),
                    offsetX = e.offsetX;
                if(!offsetX) {
                    offsetX = e.clientX - this.element.offset().left;
                }
                if (eWidth - offsetX < 0) {
                    if ($.isFunction(this._clear)) {
                        this._clear();
                    }
                }
            }, this);
        },
        _init: function() {
            if(!this.element) {
                return;
            }
            var that = this;
            if(this.element.hasClass(this._selectTextClass)) {
                this.element.css("width", parseFloat(this.element.css("width"), 10) - 23 + "px");
                if(this.hasLayoutPanel()) {
                    this.element.parent().css("width", "auto");
                }
            }
            this.element.focus(function (e) {
                ui.hideAll(that);
                that.show();
            }).click(function (e) {
                e.stopPropagation();
            });
        },
        wrapElement: function(elem, panel) {
            if(panel) {
                this._panel = panel;
                if(!this.hasLayoutPanel()) {
                    $(document.body).append(this._panel);
                    return;
                }
            }
            if(!elem) {
                return;
            }
            var currentCss = {
                display: elem.css("display"),
                position: elem.css("position"),
                "margin-left": elem.css("margin-left"),
                "margin-top": elem.css("margin-top"),
                "margin-right": elem.css("margin-right"),
                "margin-bottom": elem.css("margin-bottom"),
                width: elem.outerWidth() + "px",
                height: elem.outerHeight() + "px"
            };
            if(currentCss.position === "relative" || currentCss.position === "absolute") {
                currentCss.top = elem.css("top");
                currentCss.left = elem.css("left");
                currentCss.right = elem.css("right");
                currentCss.bottom = elem.css("bottom");
            }
            currentCss.position = "relative";
            if(currentCss.display.indexOf("inline") === 0) {
                currentCss.display = "inline-block";
                currentCss["vertical-align"] = elem.css("vertical-align");
                elem.css("vertical-align", "top");
            } else {
                currentCss.display = "block";
            }
            var wrapElem = $("<div class='dropdown-wrap' />").css(currentCss);
            elem.css({
                    "margin": "0px"
                }).wrap(wrapElem);
            
            wrapElem = elem.parent();
            if(panel) {
                wrapElem.append(panel);
            }
            return wrapElem;
        },
        isWrapped: function(element) {
            if(!element) {
                element = this.element;
            }
            return element && element.parent().hasClass("dropdown-wrap");
        },
        moveToElement: function(element, dontCheck) {
            if(!element) {
                return;
            }
            var parent;
            if(!dontCheck && this.element && this.element[0] === element[0]) {
                return;
            }
            if(this.hasLayoutPanel()) {
                if(!this.isWrapped(element)) {
                    parent = this.wrapElement(element);
                } else {
                    parent = element.parent();
                }
                parent.append(this._panel);
            } else {
                $(document.body).append(this._panel);
            }
        },
        initPanelWidth: function(width) {
            if(!$.isNumeric(width)) {
                width = this.element 
                    ? (this.element.width()) 
                    : 100;
            }
            this.panelWidth = width;
            this._panel.css("width", width + "px");
        },
        hasLayoutPanel: function() {
            return !!this.layoutPanel;
        },
        setLayoutPanel: function(layoutPanel) {
            this.option.layoutPanel = layoutPanel;
            this.layoutPanel = ui.getJQueryElement(this.option.layoutPanel);
        },
        isShow: function() {
            return this._panel.hasClass(this._showClass);
        },
        show: function(fn) {
            ui.addHideHandler(this, this.hide);
            var parent, pw, ph,
                p, w, h,
                panelWidth, panelHeight,
                top, left;
            if (!this.isShow()) {
                this._panel.addClass(this._showClass);
                
                w = this.element.outerWidth();
                h = this.element.outerHeight();

                if(this.hasLayoutPanel()) {
                    parent = this.layoutPanel;
                    top = h;
                    left = 0;
                    p = this.element.parent().position();
                    panelWidth = this._panel.outerWidth();
                    panelHeight = this._panel.outerHeight();
                    if(parent.css("overflow") === "hidden") {
                        pw = parent.width();
                        ph = parent.height();
                    } else {
                        pw = parent[0].scrollWidth;
                        ph = parent[0].scrollHeight;
                        pw += parent.scrollLeft();
                        ph += parent.scrollTop();
                    }
                    if(p.top + h + panelHeight > ph) {
                        if(p.top - panelHeight > 0) {
                            top = -panelHeight;
                        }
                    }
                    if(p.left + panelWidth > pw) {
                        if(p.left - (p.left + panelWidth - pw) > 0) {
                            left = -(p.left + panelWidth - pw);
                        } else {
                            left = -p.left;
                        }
                    }
                    this._panel.css({
                        top: top + "px",
                        left: left + "px"
                    });
                } else {
                    ui.setDown(this.element, this._panel);
                }
                this.doShow(this._panel, fn);
            }
        },
        doShow: function(panel, fn) {
            var callback,
                that = this;
            if(!$.isFunction(fn)) {
                fn = undefined;
            }
            if (this._clearClass) {
                callback = function () {
                    that.element.addClass(that._clearClass);
                    that.element.on("mousemove", that.onMousemoveHandler);
                    that.element.on("mouseup", that.onMouseupHandler);

                    if(fn) fn.call(that);
                };
            } else {
                callback = fn;
            }
            panel.fadeIn(this.showTimeValue, callback);
        },
        hide: function(fn) {
            if (this.isShow()) {
                this._panel.removeClass(this._showClass);
                this.element.removeClass(this._clearClass);
                this.element.off("mousemove", this.onMousemoveHandler);
                this.element.off("mouseup", this.onMouseupHandler);
                this.element.css("cursor", "auto");
                this.doHide(this._panel, fn);
            }
        },
        doHide: function(panel, fn) {
            if(!$.isFunction(fn)) {
                fn = undefined;
            }
            panel.fadeOut(this.hideTimeValue, fn);
        },
        _clear: null
    });
    
    //侧滑面板基类
    ui.define("ctrls.Sidebar", {
        showTimeValue: 300,
        hideTimeValue: 300,
        _getOption: function() {
            return {
                parent: null,
                width: 240
            };
        },
        _getEvents: function () {
            return ["showing", "showed", "hiding", "hided", "resize"];
        },
        _create: function() {
            this.parent = ui.getJQueryElement(this.option.parent);
            this._panel = null;
            this._closeButton = null;
            
            this.height = 0;
            this.width = this.option.width || 240;
            this.borderWidth = 0;
            
            this.animator = null;
        },
        _init: function() {
            var that = this;
            
            this._panel = $("<aside class='sidebar-panel border-highlight' />");
            this._panel.css("width", this.width + "px");
            this._showClass = "sidebar-show";
            this.parent.append(this._panel);
            this._closeButton = $("<button class='icon-button' />");
            this._closeButton.append("<i class='fa fa-arrow-right'></i>");
            this._closeButton.css({
                "position": "absolute",
                "top": "6px",
                "right": "10px",
                "z-index": 999
            });
            
            if(this.element) {
                this._panel.append(this.element);
            }
            this._closeButton.click(function(e) {
                that.hide();
            });
            this._panel.append(this._closeButton);
            
            this.borderWidth += parseInt(this._panel.css("border-left-width"), 10) || 0;
            this.borderWidth += parseInt(this._panel.css("border-right-width"), 10) || 0;
            
            //进入异步调用，给resize事件绑定的时间
            setTimeout(function() {
                that.setSizeLocation();
            });
            ui.resize(function() {
                that.setSizeLocation();
            }, ui.eventPriority.ctrlResize);
            
            this.animator = ui.animator({
                target: this._panel,
                ease: ui.AnimationStyle.easeTo,
                onChange: function(val, elem) {
                    elem.css("left", val + "px");
                }
            });
        },
        set: function (elem) {
            if(this.element) {
                this.element.remove();
            }
            if(ui.core.isDomObject(elem)) {
                elem = $(elem);
            } else if(!ui.core.isJQueryObject(elem)) {
                return;
            }
            this.element = elem;
            this._closeButton.before(elem);
        },
        append: function(elem) {
            if(ui.core.isDomObject(elem)) {
                elem = $(elem);
            } else if(!ui.core.isJQueryObject(elem)) {
                return;
            }
            this._panel.append(elem);
            if(!this.element) {
                this.element = elem;
            }
        },
        setSizeLocation: function(width, resizeFire) {
            var parentWidth = this.parent.width(),
                parentHeight = this.parent.height();
            
            this.height = parentHeight;
            var sizeCss = {
                height: this.height + "px"
            };
            var right = this.width;
            if ($.isNumeric(width)) {
                this.width = width;
                sizeCss["width"] = this.width + "px";
                right = width;
            }
            this.hideLeft = parentWidth;
            this.left = parentWidth - this.width - this.borderWidth;
            this._panel.css(sizeCss);
            if (this.isShow()) {
                this._panel.css({
                    "left": this.left + "px",
                    "display": "block"
                });
            } else {
                this._panel.css({
                    "left": this.hideLeft + "px",
                    "display": "none"
                });
            }
            
            if(resizeFire !== false) {
                this.fire("resize", this.width, this.height);
            }
        },
        isShow: function() {
            return this._panel.hasClass(this._showClass);
        },
        show: function() {
            var op, 
                that = this,
                i, len;
            if(!this.isShow()) {
                this.animator.stop();
                this.animator.splice(1, this.length - 1);
                this.animator.duration = this.showTimeValue;
                
                op = this.animator[0];
                op.target.css("display", "block");
                op.target.addClass(this._showClass);
                op.begin = parseFloat(op.target.css("left"), 10) || this.hideLeft;
                op.end = this.left;

                for(i = 0, len = arguments.length; i < len; i++) {
                    if(arguments[i]) {
                        this.animator.addTarget(arguments[i]);
                    }
                }

                this.animator.onBegin = function() {
                    that.fire("showing");
                };
                this.animator.onEnd = function() {
                    this.splice(1, this.length - 1);
                    that.fire("showed");
                };
                return this.animator.start();
            }
            return null;
        },
        hide: function() {
            var op,
                that = this,
                i, len;
            if(this.isShow()) {
                this.animator.stop();
                this.animator.splice(1, this.length - 1);
                this.animator.duration = this.hideTimeValue;
                
                op = this.animator[0];
                op.target.removeClass(this._showClass);
                op.begin = parseFloat(op.target.css("left"), 10) || this.left;
                op.end = this.hideLeft;
                
                for(i = 0, len = arguments.length; i < len; i++) {
                    if(arguments[i]) {
                        this.animator.addTarget(arguments[i]);
                    }
                }

                this.animator.onBegin = function() {
                    that.fire("hiding");
                };
                this.animator.onEnd = function() {
                    this.splice(1, this.length - 1);
                    op.target.css("display", "none");
                    that.fire("hided");
                };
                return this.animator.start();
            }
            return null;
        }
    });
    
    //控件分页逻辑，Gridview, ReportView, flowView
    var pageHashPrefix = "page";
    ui.ctrls.Pager = function(option) {
        this.pageNumPanel = null;
        this.pageInfoPanel = null;

        this.pageButtonCount = 5;
        this.pageIndex = 1;
        this.pageSize = 100;

        this.data = [];
        this.pageInfoFormatter = option.pageInfoFormatter;

        if ($.isNumeric(option.pageIndex) && option.pageIndex > 0) {
            this.pageIndex = option.pageIndex;
        }
        if ($.isNumeric(option.pageSize) || option.pageSize > 0) {
            this.pageSize = option.pageSize;
        }
        if ($.isNumeric(option.pageButtonCount) || option.pageButtonCount > 0) {
            this.pageButtonCount = option.pageButtonCount;
        }
        this._ex = Math.floor((this.pageButtonCount - 1) / 2);
    };
    ui.ctrls.Pager.prototype = {
        renderPageList: function (rowCount) {
            var pageInfo = this._createPageInfo();
            if (!$.isNumeric(rowCount) || rowCount < 1) {
                if (this.data) {
                    rowCount = this.data.length || 0;
                } else {
                    rowCount = 0;
                }
            }
            pageInfo.pageIndex = this.pageIndex;
            pageInfo.pageSize = this.pageSize;
            pageInfo.rowCount = rowCount;
            pageInfo.pageCount = Math.floor((rowCount + this.pageSize - 1) / this.pageSize);
            if (this.pageInfoPanel) {
                this.pageInfoPanel.html("");
                this._showRowCount(pageInfo);
            }
            this._renderPageButton(pageInfo.pageCount);
            if (pageInfo.pageCount) {
                this._checkAndSetDefaultPageIndexHash(this.pageIndex);
            }
        },
        _showRowCount: function (pageInfo) {
            var dataCount = (this.data) ? this.data.length : 0;
            if (pageInfo.pageCount == 1) {
                pageInfo.currentRowNum = pageInfo.rowCount < pageInfo.pageSize ? pageInfo.rowCount : pageInfo.pageSize;
            } else {
                pageInfo.currentRowNum = dataCount < pageInfo.pageSize ? dataCount : pageInfo.pageSize;
            }
            
            if(this.pageInfoFormatter) {
                for(var key in this.pageInfoFormatter) {
                    if($.isFunction(this.pageInfoFormatter[key])) {
                        this.pageInfoPanel
                                .append(this.pageInfoFormatter[key].call(this, pageInfo[key]));
                    }
                }
            }
        },
        _createPageInfo: function() {
            return {
                rowCount: -1,
                pageCount: -1,
                pageIndex: -1,
                pageSize: -1,
                currentRowNum: -1
            }; 
        },
        _renderPageButton: function (pageCount) {
            if (!this.pageNumPanel) return;
            this.pageNumPanel.empty();

            //添加页码按钮
            var start = this.pageIndex - this._ex;
            start = (start < 1) ? 1 : start;
            var end = start + this.pageButtonCount - 1;
            end = (end > pageCount) ? pageCount : end;
            if ((end - start + 1) < this.pageButtonCount) {
                if ((end - (this.pageButtonCount - 1)) > 0) {
                    start = end - (this.pageButtonCount - 1);
                }
                else {
                    start = 1;
                }
            }

            if (start > 1)
                this.pageNumPanel.append(this._createPageButton("1..."));
            for (var i = start, btn; i <= end; i++) {
                if (i == this.pageIndex) {
                    btn = this._createCurrentPage(i);
                } else {
                    btn = this._createPageButton(i);
                }
                this.pageNumPanel.append(btn);
            }
            if (end < pageCount)
                this.pageNumPanel.append(this._createPageButton("..." + pageCount));
        },
        _createPageButton: function (pageIndex) {
            return "<a class='pager-button font-highlight-hover'>" + pageIndex + "</a>";
        },
        _createCurrentPage: function (pageIndex) {
            return "<span class='pager-current font-highlight'>" + pageIndex + "</span>";
        },
        pageChanged: function(eventHandler, eventCaller) {
            var that;
            if(this.pageNumPanel && $.isFunction(eventHandler)) {
                eventCaller = eventCaller || ui;
                this.pageChangedHandler = function() {
                    eventHandler.call(eventCaller, this.pageIndex, this.pageSize);
                };
                that = this;
                if(!ui.core.ie || ui.core.ie >= 8) {
                    ui.hashchange(function(e, hash) {
                        if(that._breakHashChanged) {
                            that._breakHashChanged = false;
                            return;
                        }
                        if(!that._isPageHashChange(hash)) {
                            return;
                        }
                        that.pageIndex = that._getPageIndexByHash(hash);
                        that.pageChangedHandler();
                    });
                }
                this.pageNumPanel.click(function(e) {
                    var btn = $(e.target);
                    if (btn.nodeName() !== "A")
                        return;
                    var num = btn.text();
                    num = num.replace("...", "");
                    num = parseInt(num, 10);

                    that.pageIndex = num;
                    if (!ui.core.ie || ui.core.ie >= 8) {
                        that._setPageHash(that.pageIndex);
                    }
                    that.pageChangedHandler();
                });
            }
        },
        empty: function() {
            if(this.pageNumPanel) {
                this.pageNumPanel.html("");
            }
            if(this.pageInfoPanel) {
                this.pageInfoPanel.html("");
            }
            this.data = [];
            this.pageIndex = 1;
        },
        _setPageHash: function(pageIndex) {
            if(!pageIndex) {
                return;
            }
            
            this._breakHashChanged = true;
            window.location.hash = pageHashPrefix + "=" + pageIndex;
        },
        _isPageHashChange: function(hash) {
            var index = 0;
            if(!hash) {
                return false;
            }
            if(hash.charAt(0) === "#") {
                index = 1;
            }
            return hash.indexOf(pageHashPrefix) == index;
        },
        _getPageIndexByHash: function(hash) {
            var pageIndex,
                index;
            if(hash) {
                index = hash.indexOf("=");
                if(index >= 0) {
                    pageIndex = hash.substring(index + 1, hash.length);
                    return parseInt(pageIndex, 10);
                }
            }
            return 1;
        },
        _checkAndSetDefaultPageIndexHash: function (pageIndex) {
            var hash = window.location.hash;
            var len = hash.length;
            if (hash.charAt(0) === "#")
                len--;
            if (len <= 0) {
                this._setPageHash(pageIndex);
            }
        }
    };
})(ui.core)

/// 浏览器版本检查
; (function () {
    var pf = (navigator.platform || "").toLowerCase(),
        ua = navigator.userAgent.toLowerCase(),
        s;
    function toFixedVersion(ver, floatLength) {
        ver = ("" + ver).replace(/_/g, ".");
        floatLength = floatLength || 1;
        ver = String(ver).split(".");
        ver = ver[0] + "." + (ver[1] || "0");
        ver = Number(ver).toFixed(floatLength);
        return ver;
    }

    function updateProperty(target, name, ver) {
        target = ui[target]
        target.name = name;
        target.version = ver;
        target[name] = ver;
    }

    // 提供三个对象,每个对象都有name, version(version必然为字符串)
    // 取得用户操作系统名字与版本号，如果是0表示不是此操作系统
    var platform = ui.platform = {
        name: (window.orientation != undefined) ? 'iPod' : (pf.match(/mac|win|linux/i) || ['unknown'])[0],
        version: 0,
        iPod: 0,
        iPad: 0,
        iPhone: 0,
        ios: 0,
        android: 0,
        windowsPhone: 0,
        win: 0,
        linux: 0,
        mac: 0
    };
    (s = ua.match(/windows ([\d.]+)/)) ? updateProperty("platform", "win", toFixedVersion(s[1])) :
            (s = ua.match(/windows nt ([\d.]+)/)) ? updateProperty("platform", "win", toFixedVersion(s[1])) :
            (s = ua.match(/linux ([\d.]+)/)) ? updateProperty("platform", "linux", toFixedVersion(s[1])) :
            (s = ua.match(/mac ([\d.]+)/)) ? updateProperty("platform", "mac", toFixedVersion(s[1])) :
            (s = ua.match(/ipod ([\d.]+)/)) ? updateProperty("platform", "iPod", toFixedVersion(s[1])) :
            (s = ua.match(/ipad[\D]*os ([\d_]+)/)) ? updateProperty("platform", "iPad", toFixedVersion(s[1])) :
            (s = ua.match(/iphone[\D]*os ([\d_]+)/)) ? updateProperty("platform", "iPhone", toFixedVersion(s[1])) :
            (s = ua.match(/android ([\d.]+)/)) ? updateProperty("platform", "android", toFixedVersion(s[1])) : 
            (s = ua.match(/windows phone ([\d.]+)/)) ? updateProperty("platform", "windowsPhone", toFixedVersion(s[1])) : 0;
    if(platform.iphone || platform.iPad) {
        platform.ios = platform.iphone || platform.iPad;
    }

    //============================================
    //取得用户的浏览器名与版本,如果是0表示不是此浏览器
    var browser = ui.browser = {
        name: "unknown",
        version: 0,
        ie: 0,
        edge: 0,
        firefox: 0,
        chrome: 0,
        opera: 0,
        safari: 0,
        mobileSafari: 0,
        //adobe 的air内嵌浏览器
        adobeAir: 0
    };
    //IE11的UA改变了没有MSIE
    (s = ua.match(/edge\/([\d.]+)/)) ? updateProperty("browser", "edge", toFixedVersion(s[1])) :
            (s = ua.match(/trident.*; rv\:([\d.]+)/)) ? updateProperty("browser", "ie", toFixedVersion(s[1])) : 
            (s = ua.match(/msie ([\d.]+)/)) ? updateProperty("browser", "ie", toFixedVersion(s[1])) :
            (s = ua.match(/firefox\/([\d.]+)/)) ? updateProperty("browser", "firefox", toFixedVersion(s[1])) :
            (s = ua.match(/chrome\/([\d.]+)/)) ? updateProperty("browser", "chrome", toFixedVersion(s[1])) :
            (s = ua.match(/opera.([\d.]+)/)) ? updateProperty("browser", "opera", toFixedVersion(s[1])) :
            (s = ua.match(/adobeair\/([\d.]+)/)) ? updateProperty("browser", "adobeAir", toFixedVersion(s[1])) :
            (s = ua.match(/version\/([\d.]+).*safari/)) ? updateProperty("browser", "safari", toFixedVersion(s[1])) : 0;
    //下面是各种微调
    //mobile safari 判断，可与safari字段并存
    (s = ua.match(/version\/([\d.]+).*mobile.*safari/)) ? updateProperty("browser", "mobileSafari", toFixedVersion(s[1])) : 0;

    if (platform.iPad) {
        updateProperty("browser", 'mobileSafari', '0.0');
    }

    if (browser.ie) {
        if (!document.documentMode) {
            document.documentMode = Math.floor(browser.ie)
            //http://msdn.microsoft.com/zh-cn/library/cc817574.aspx
            //IE下可以通过设置 <meta http-equiv="X-UA-Compatible" content="IE=8"/>改变渲染模式
            //一切以实际渲染效果为准
        } else if (document.documentMode !== Math.floor(browser.ie)) {
            updateProperty("browser", "ie", toFixedVersion(document.documentMode))
        }
    }

    //============================================
    //取得用户浏览器的渲染引擎名与版本,如果是0表示不是此浏览器
    ui.engine = {
        name: 'unknown',
        version: 0,
        trident: 0,
        gecko: 0,
        webkit: 0,
        presto: 0
    };

    (s = ua.match(/trident\/([\d.]+)/)) ? updateProperty("engine", "trident", toFixedVersion(s[1])) :
            (s = ua.match(/gecko\/([\d.]+)/)) ? updateProperty("engine", "gecko", toFixedVersion(s[1])) :
            (s = ua.match(/applewebkit\/([\d.]+)/)) ? updateProperty("engine", "webkit", toFixedVersion(s[1])) :
            (s = ua.match(/presto\/([\d.]+)/)) ? updateProperty("engine", "presto", toFixedVersion(s[1])) : 0;

    if (browser.ie) {
        if (browser.ie == 6) {
            updateProperty("engine", "trident", toFixedVersion("4"))
        } else if (browser.ie == 7 || browser.ie == 8) {
            updateProperty("engine", "trident", toFixedVersion("5"))
        }
    }
})();
