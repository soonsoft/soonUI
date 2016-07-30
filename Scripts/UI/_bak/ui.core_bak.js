; (function ($) {
    if (!window.ui) window.ui = {};
    //主题
    ui.theme = {};
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

    //主题
    ui.theme.Classes = {
        HeadColor: "head-color",
        TitleColor: "title-color",
        FontHighlight: "font-highlight",
        BackgroundHighlight: "background-highlight",
        BorderHighlight: "border-highlight",
        ButtonHighlight: "button-highlight"
    };

    ui.GlobalClass = {
        CloseButton: "close-button"
    };

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
    var relement = /^[object HTML\w+Element]$;/

    "Boolean Number String Function Array Date RegExp Object Error".replace(rword, function (name) {
        class2type["[object " + name + "]"] = name.toLowerCase()
    });

    core.root = root;
    core.head = head;
    core.noop = function () { };
    core.slice = aslice;

    //获取类型
    function getType(obj) {
        if (obj == null) {
            return String(obj);
        }
        // 早期的webkit内核浏览器实现了已废弃的ecma262v4标准，可以将正则字面量当作函数使用，因此typeof在判定正则时会返回function
        return typeof obj === "object" || typeof obj === "function" ?
                class2type[serialize.call(obj)] || "object" :
                typeof obj;
    };

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
    }
    if (/\[native code\]/.test(Object.getPrototypeOf)) {
        core.isPlainObject = function (obj) {
            return obj && typeof obj === "object" && Object.getPrototypeOf(obj) === oproto;
        };
    };
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

    //类型重写
    ui.override = function (name, prototype) {
        if (!core.isPlainObject(prototype)) {
            return;
        }
        if (core.type(name) !== "string") {
            return;
        }
        var nameArray = name.split(".");
        var namespace = nameArray[0];
        name = nameArray[1];

        var base = ui[namespace];
        if (!base) {
            return;
        }
        base = base[name];
        if (!base) {
            return;
        }

        var baseFunctions = {};
        $.each(prototype, function (key, value) {
            var property = prototype[key];
            if (!$.isFunction(property)) {
                base.prototype[key] = property;
            } else {
                if (!base.prototype.hasOwnProperty(key)) {
                    base.prototype[key] = func;
                } else {
                    baseFunctions[key] = base.prototype[key];
                    base.prototype[key] = (function () {
                        var _super = function () {
                            return baseFunctions[key].apply(this, arguments);
                        },
                        _superApply = function (args) {
                            return baseFunctions[key].apply(this, args);
                        };
                        return function () {
                            var __super = this._super,
                                __superApply = this._superApply,
                                returnValue;

                            this._super = _super;
                            this._superApply = _superApply;

                            returnValue = property.apply(this, arguments);

                            this._super = __super;
                            this._superApply = __superApply;

                            return returnValue;
                        };
                    })();
                }
            }
        });
    };

    //组件管理器
    ui.Widget = function () { };
    ui.Widget.prototype = {
        widgetName: "widget",
        namespace: "ui",
        version: "1.5.0.0",
        option: {},

        extend: function(target) {
            var input = aslice.call(arguments, 1),
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
            this.document = DOC;
            this.window = window;
            this.element = element || null;

            this.option = this.extend({}, this.option,
                this._getCreateOption(),
                option);

            this._create();
            this._initEvents();
            this._init();

            return this;
        },
        _getCreateOption: core.noop,
        _getEvents: core.noop,
        _create: core.noop,
        _init: core.noop,
        _initEvents: function () {
            var events = this._getEvents();
            if (core.type(events) === "array" && events.length > 0) {
                this.eventTarget = new core.EventTarget(this);
                this.eventTarget.initEvents(events);
            }
        },
        toString: function () {
            return this.fullName;
        }
    };

    ///# custom event 事件管理器
    core.EventTarget = function (target) {
        this._listeners = {};
        this._eventTarget = target || this;
    };
    core.EventTarget.prototype = {
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
            if (!$.isArray(events)) {
                return;
            }

            var $this = this;
            var i, l = events.length, eventName;
            var bind = function (type, callback, scope, priority) {
                $this.addEventListener(type, callback, scope, priority);
            };
            var unbind = function (type, callback) {
                $this.removeEventListener(type, callback);
            };
            var fire = function (type) {
                var args = Array.apply([], arguments);
                return $this.dispatchEvent.apply($this, args);
            };

            target["bind"] = bind;
            target["unbind"] = unbind;
            target["fire"] = fire;

            for (i = 0; i < l; i++) {
                eventName = events[i];
                target[eventName] = this._createEventFunction(eventName, target);
            }
        },
        _createEventFunction: function (type, target) {
            var eventName = type;
            return function (callback, scope, priority) {
                if (arguments.length > 0) {
                    target.bind(eventName, callback, scope, priority);
                }
            };
        }
    };
    ///# end custom event

    ///# Like Array Object
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
    ///# end Like Array Object

    //添加link
    core.addLink = function (src) {
        if (head) {
            var link = DOC.createElement("link");
            link.setAttribute("rel", "stylesheet");
            link.setAttribute("type", "text/css");
            link.setAttribute("href", src);
            head.appendChild(link);
        }
    };

    //添加script
    core.addScript = function (src) {
        if (DOC.body) {
            var body = $(DOC.body);
            var script = DOC.createElement('script');
            script.type = "text/javascript"
            script.charset = "utf-8";
            script.src = src;
            body.append(script);
        }
    };

    ///鼠标事件监听器
    //ui.mouse = {
    //    _mouseInit: function() {

    //    },
    //    _mouseDestroy: function() {

    //    }
    //};

    ///# animation
    
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
        swing: function(pos) {
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
            var pos = pos + (Math.random() - 0.5) / 5;
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
        this.fps = 100;
        //开始回调
        this.onBegin = false;
        //结束回调
        this.onEnd = false;

        //动画是否开始
        this.isStarted = false;
    };
    Animator.prototype = new ui.ArrayObject();
    Animator.prototype.addTarget = function (target, option) {
        if (arguments.length == 1) {
            option = target;
            target = null;
        }
        if (option) {
            option.target = target;
            this.push(option);
        }
        return this;
    };
    Animator.prototype.start = function (duration) {
        var flag,
            option,
            disabledOptions = [];
        if (!this.isStarted) {
            flag = this._prepare();
            if ($.isFunction(this.onBegin)) {
                this.onBegin.call(this);
            }

            if (flag) {
                if ($.isFunction(this.onEnd)) {
                    this.onEnd.call(this);
                }
            } else {
                this.doAnimation();
            }
        }
    };
    Animator.prototype.doAnimation = function () {
        if (this.length == 0) {
            return;
        }

        this.isStarted = true;
        var duration = parseInt(this.duration, 10) || 500,
            fps = parseInt(this.fps, 10) || 100,
            that = this,
            i = 0,
            len = this.length;
        //开始执行的时间
        var startTime = new Date().getTime();
        this.stopHandler = null;
        (function () {
            var option = null;
            that.stopHandler = setInterval(function () {
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
                    delta = option.ease(timestamp / duration);
                    option.onChange(
                        Math.ceil(option.begin + delta * option.change), option.target);
                }
                if (duration <= timestamp) {
                    that.stop();
                    for (i = 0; i < len; i++) {
                        option = that[i];
                        option.onChange(option.end, option.target);
                    }
                    if ($.isFunction(that.onEnd)) {
                        that.onEnd.call(that);
                    }
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
            if (option.change == 0) {
                option.disabled = true;
                disabledCount++;
                continue;
            }
            //必须指定，基本上对top,left,width,height这个属性进行设置
            option.onChange = option.onChange || core.noop;
            //要使用的缓动公式
            option.ease = option.ease || ui.AnimationStyle.easeFromTo;
        }
        return this.length == disabledCount;
    };
    Animator.prototype.stop = function () {
        clearInterval(this.stopHandler);
        this.isStarted = false;
        this.stopHandler = null;
    };

    ui.animator = function (target, option) {
        var list = new Animator();
        list.addTarget.apply(list, arguments);
        return list;
    };

    ///# end animation

    ///# sorter introsort

    //sort
    var size_threshold = 16;
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
            var i = parseInt(num / 2, 10), j;
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
            while (i <= parseInt(n / 2, 10)) {
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

    ///# jQuery Extensions

    //为jquery添加一个获取元素标签类型的方法
    $.fn.nodeName = function () {
        return this.prop("nodeName");
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
        option.text = this.find("option[value='" + option.value + "']").text();
        return option;
    };

    //动态设置图片的src并自动调整图片的尺寸和位置
    $.fn.setImage = function (src, displayWidth, displayHeight, callback) {
        if (this.nodeName() != "IMG") {
            return;
        }
        if ($.isFunction(displayWidth)) {
            callback = displayWidth;
            displayWidth = null;
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

        reloadImage(this, src, displayWidth, displayHeight, callback);
    };

    var reloadImage = function (img, src, displayWidth, displayHeight, callback) {
        if (core.type(src) !== "string" || src.length == 0) {
            return;
        }
        var complete = function (reimg) {
            var size = setImageAndSize(img, reimg.src, displayWidth, displayHeight, reimg.width, reimg.height);
            if ($.isFunction(callback)) {
                callback.call(img, size);
            }
        };
        var reimg = new Image();
        reimg.onload = function () {
            reimg.onload = null;
            complete(reimg);
        };
        reimg.onerror = function (e) {
            img.prop("src", ui.str.empty);
        };
        reimg.src = src;
    };

    var setImageAndSize = function (img, src, displayWidth, displayHeight, imgWidth, imgHeight) {
        var width,
            height;

        img.css({
            "margin-top": "0px",
            "margin-left": "0px"
        });
        if (displayWidth > displayHeight) {
            height = displayHeight;
            width = parseInt(imgWidth * (height / imgHeight), 10);
            if (width > displayWidth) {
                width = displayWidth;
                height = parseInt(imgHeight * (width / imgWidth), 10);
                img.css("margin-top", parseInt((displayHeight - height) / 2, 10) + "px");
            } else {
                img.css("margin-left", parseInt((displayWidth - width) / 2, 10) + "px");
            }
        } else {
            width = displayWidth;
            height = parseInt(imgHeight * (width / imgWidth), 10);
            if (height > displayHeight) {
                height = displayHeight;
                width = parseInt(imgWidth * (height / imgHeight), 10);
                img.css("margin-left", parseInt((displayWidth - width) / 2, 10) + "px");
            } else {
                img.css("margin-top", parseInt((displayHeight - height) / 2, 10) + "px");
            }
        }
        img.css({
            "width": width + "px",
            "height": height + "px"
        });
        img.prop("src", src);
        return {
            width: width,
            height: height
        };
    };

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
        var sheet = this[0];
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

    //为jquery添加拖拽特效
    $.fn.draggable = function () {
    };

    //为jquery添加数据拖入特效
    $.fn.droppable = function () {
    };

    //为jquery对象添加主题色操作方法
    $.fn.addHighlight = function () {
        var len = arguments.length;
        if (len == 0) {
            return;
        }
        var txt = "highlight";
        for (var i = 0; i < len; i++) {
            this.addClass(arguments[i].toLowerCase() + "-" + txt);
        }
        return this;
    };
    $.fn.removeHighlight = function () {
        var len = arguments.length;
        if (len == 0) {
            return;
        }
        var txt = "highlight";
        for (var i = 0; i < len; i++) {
            this.removeClass(arguments[i].toLowerCase() + "-" + txt);
        }
        return this;
    };

    var animateKey = "animationExOption"
    $.fn.animationStart = function (option) {
        var elem = this;
        var a = ui.animator(elem, option);

        a.duration = option.duration;
        a.fps = option.fps;
        delete option.duration;
        delete option.fps;

        elem.data(animateKey, a);
        a.start();
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
    ///# end jQuery Extensions

    ///# UI Utility
    core.setDown = function (target, panel) {
        if (!target || !panel) {
            return;
        }
        var width = panel.outerWidth(),
            height = panel.outerHeight();
        var css = core.getDownLocation(target, width, height);
        css.top += "px";
        css.left += "px";
        panel.css(css);
    };
    core.setLeft = function (target, panel) {
        if (!target || !panel) {
            return;
        }
        var width = panel.outerWidth(),
            height = panel.outerHeight();
        var css = core.getLeftLocation(target, width, height);
        css.top += "px";
        css.left += "px";
        panel.css(css);
    };
    core.getDownLocation = function (target, width, height) {
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
    core.getLeftLocation = function (target, width, height) {
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

    var bodyOldOverflow = null;
    core.openMask = function (color, opacity) {
        var mask = $("#ui_maskPanel"),
            body = $(document.body);
        if (mask.length === 0) {
            mask = $("<div id='ui_maskPanel' class='mask-panel' />");
            body.append(mask);
            ui.resize(function (e, width, height) {
                mask.css({
                    "height": height + "px"
                });
            }, ui.eventPriority.ctrlResize);
        }
        bodyOldOverflow = body.css("overflow");
        body.css("overflow", "hidden");
        if (this.type(color) === "string") {
            mask.css("background-color", color);
        } else if ($.isNumeric(color)) {
            opacity = color;
        }
        opacity = parseFloat(opacity, 10);
        if (!isNaN(opacity)) {
            mask.css({
                "opacity": opacity,
                "filter": "Alpha(opacity=" + (opacity * 100) + ")"
            });
        }
        mask.css({
            "height": root.clientHeight + "px",
            "display": "block"
        });
        return mask.zIndex();
    };
    core.closeMask = function () {
        var mask = $("#ui_maskPanel"),
            body = $(document.body);
        if (mask.length == 0) {
            return;
        }
        if (bodyOldOverflow) {
            body.css("overflow", bodyOldOverflow);
        }
        mask.css("display", "none");
    };
    ///# end UI Utility

    ///# Theme
    var defaultThemeId = "Default";
    ui.theme.getTheme = function (themeId) {
        if (!themeId)
            themeId = defaultThemeId;
        var info;
        var themeInfo = null;
        if ($.isArray(this.Colors)) {
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
        if (!$.isArray(this.Colors)) {
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
    ///# end Theme

    ///# Initial
    var themeChanged = "themeChanged",
        docReady = "docReady",
        docClick = "docClick",
        docMouseUp = "docMouseUp",
        resize = "resize";
    //ui 全局事件
    ui.events = [themeChanged, docReady, docClick, docMouseUp, resize];
    ui.eventPriority = {
        masterReady: 3,
        pageReady: 2,

        bodyResize: 3,
        ctrlResize: 2,
        elementResize: 0
    };
    ui.eventTarget = new core.EventTarget(ui);
    ui.eventTarget.initEvents();

    //注册全局document事件
    $(document).ready(function (e) {
        ui.fire(docReady);
    }).click(function (e) {
        ui.fire(docClick);
    });
    //注册全局window resize
    $(window).bind(resize, function (e) {
        ui.fire(resize, root.clientWidth, root.clientHeight);
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
    ///# end Initial
})(jQuery);

//utiliy 工具集
//utility
; (function ($) {
    ui.fixedNumber = function (number, precision) {
        var b = 1;
        if (isNaN(number)) return number;
        if (number < 0) b = -1;
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
    ui.ajax = {
        ajaxGet: function (url, args, complete, error, isAsync) {
            this._ajaxCall("GET", url, args, complete, error, isAsync);
        },
        ajaxPost: function (url, args, complete, error, isAsync) {
            this._ajaxCall("POST", url, args, complete, error, isAsync);
        },
        ajaxPostOnce: function (btn, url, args, complete, error, isAsync) {
            if (!btn) {
                throw ui.core.error("btn is NULL");
            }
            if (ui.core.type(btn) === "string") {
                btn = $("#" + btn);
            } else if (ui.core.isDomObject(btn)) {
                btn = $(btn);
            }

            var text = null,
                textFormat = "正在{0}...",
                func;
            if (btn.nodeName() === "INPUT") {
                text = btn.val();
                btn.val(ui.str.stringFormat(textFormat, text));
                func = function () {
                    btn.val(text);
                };
            } else if (btn.nodeName() === "BUTTON") {
                text = btn.text();
                if (text.length > 0) {
                    btn.text(ui.str.stringFormat(textFormat, text));
                    func = function () {
                        btn.text(text);
                    };
                } else {
                    func = ui.core.noop;
                }
            } else {
                func = ui.core.noop;
            }
            btn.attr("disabled", "disabled");
            
            var completeProxy = function(){
                btn.removeAttr("disabled");
                func();
                complete.apply(arguments.callee.caller, arguments);
            };
            var errorProxy = function () {
                btn.removeAttr("disabled");
                func();
                error.apply(arguments.callee.caller, arguments);
            };
            this._ajaxCall("POST", url, args, completeProxy, errorProxy, isAsync);
        },
        _ajaxCall: function (method, url, args, complete, error, isAsync) {
            if ($.isFunction(args)) {
                error = complete;
                complete = args;
                args = null;
            }
            if (!$.isFunction(complete)) {
                complete = ui.core.noop;
            }
            if (!$.isFunction(error)) {
                error = ui.core.noop;
            }
            if (isAsync !== false) {
                isAsync = true;
            }
            $.ajax({
                type: method.toUpperCase() === "GET" ? "GET" : "POST",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                url: url,
                async: isAsync,
                data: (ui.core.type(args) !== "string") ? "{}" : args,
                success: function (data) {
                    complete(data);
                },
                error: function (result, status) {
                    var jsonData = null;
                    try {
                        //未经过身份验证，或者操作超过身份验证时间，则任何对服务器端的访问都会收到401(Unauthorized)错误。
                        if (result.status == 403) {
                            jsonData = $.parseJSON(result.responseText);
                            if (jsonData.StatusCode === 401) {
                                alert("等待操作超时，您需要重新登录");
                            } else {
                                alert("您没有访问权限");
                            }
                            window.location.href = "/Account/Login";
                        } else {
                            if (result.responseText) {
                                error($.parseJSON(result.responseText));
                            } else {
                                var e2 = { Message: 'Unknown exception, error status is ' + result.status };
                                error(e2);
                            }
                        }
                    } catch (e) {
                        e.Message = e.message;
                        error(e);
                    }
                }
            });
        }
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
        numberFormatScale: function (number, zeroCount) {
            if (isNaN(number))
                return NaN;
            if (isNaN(zeroCount))
                zeroCount = 2;
            number = ui.fixedNumber(number, zeroCount);
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
        },
        formatMoney: function (value, symbol) {
            if (!symbol) {
                symbol = "￥";
            }
            var content = ui.str.numberFormatScale(value, 2);
            if (isNaN(content)) {
                return null;
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
        //浅克隆
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

                if (ui.core.type(copy) === "object") {
                    result[key] = arguments.callee.apply(this, [result[key] || {}, copy]);
                } else if (ui.core.type(copy) === "array") {
                    result[key] = arguments.callee.apply(this, [result[key] || [], copy]);
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

    ui.data = {
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
                    item[flagField] = true;
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
    ui.dictionary = function (key, value) {
        return (this instanceof dictionary) ? this._init(key, value) : new dictionary(key, value);
    };
    ui.dictionary.prototype = {
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
    };

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

///颜色计算器
(function ($) {
    /// 颜色计算
    ui.color = new function () {
        // Adapted from http://www.easyrgb.com/math.html
        // hsv values = 0 - 1
        // rgb values 0 - 255
        this.hsv2rgb = function (h, s, v) {
            var r, g, b;
            if (s == 0) {
                r = v * 255;
                g = v * 255;
                b = v * 255;
            } else {
                // h must be < 1
                var var_h = h * 6;
                if (var_h == 6) {
                    var_h = 0;
                }

                //Or ... var_i = floor( var_h )
                var var_i = Math.floor(var_h);
                var var_1 = v * (1 - s);
                var var_2 = v * (1 - s * (var_h - var_i));
                var var_3 = v * (1 - s * (1 - (var_h - var_i)));

                if (var_i == 0) {
                    var_r = v;
                    var_g = var_3;
                    var_b = var_1;
                } else if (var_i == 1) {
                    var_r = var_2;
                    var_g = v;
                    var_b = var_1;
                } else if (var_i == 2) {
                    var_r = var_1;
                    var_g = v;
                    var_b = var_3
                } else if (var_i == 3) {
                    var_r = var_1;
                    var_g = var_2;
                    var_b = v;
                } else if (var_i == 4) {
                    var_r = var_3;
                    var_g = var_1;
                    var_b = v;
                } else {
                    var_r = v;
                    var_g = var_1;
                    var_b = var_2
                }

                //rgb results = 0 � 255
                r = var_r * 255
                g = var_g * 255
                b = var_b * 255


            }
            return [Math.round(r), Math.round(g), Math.round(b)];
        };

        // added by Matthias Platzer AT knallgrau.at 
        this.rgb2hsv = function (r, g, b) {
            //RGB values = 0 ~ 255
            var r = (r / 255);
            var g = (g / 255);
            var b = (b / 255);

            //Min. value of RGB
            var min = Math.min(r, g, b);
            //Max. value of RGB
            var max = Math.max(r, g, b);
            //Delta RGB value
            deltaMax = max - min;

            var v = max;
            var s, h;
            var deltaRed, deltaGreen, deltaBlue;

            //This is a gray, no chroma...
            if (deltaMax == 0) {
                //HSV results = 0 � 1
                h = 0;
                s = 0;
            } else {
                //Chromatic data...
                s = deltaMax / max;

                deltaRed = (((max - r) / 6) + (deltaMax / 2)) / deltaMax;
                deltaGreen = (((max - g) / 6) + (deltaMax / 2)) / deltaMax;
                deltaBlue = (((max - b) / 6) + (deltaMax / 2)) / deltaMax;

                if (r == max)
                    h = deltaBlue - deltaGreen;
                else if (g == max)
                    h = (1 / 3) + deltaRed - deltaBlue;
                else if (b == max)
                    h = (2 / 3) + deltaGreen - deltaRed;

                if (h < 0)
                    h += 1;
                if (h > 1)
                    h -= 1;
            }

            return [h, s, v];
        }

        this.rgb2hex = function (r, g, b) {
            return this.toHex(r) + this.toHex(g) + this.toHex(b);
        };

        this.hexchars = "0123456789ABCDEF";

        this.toHex = function (n) {
            n = n || 0;
            n = parseInt(n, 10);
            if (isNaN(n))
                n = 0;
            n = Math.round(Math.min(Math.max(0, n), 255));


            return this.hexchars.charAt((n - n % 16) / 16) + this.hexchars.charAt(n % 16);
        };

        this.toDec = function (hexchar) {
            return this.hexchars.indexOf(hexchar.toUpperCase());
        };

        this.hex2rgb = function (str) {
            if (typeof str !== "string") {
                return null;
            }
            if (str.charAt(0) === "#") {
                str = str.substring(1);
            }
            var rgb = [];
            rgb[0] = (this.toDec(str.substr(0, 1)) * 16) +
                    this.toDec(str.substr(1, 1));
            rgb[1] = (this.toDec(str.substr(2, 1)) * 16) +
                    this.toDec(str.substr(3, 1));
            rgb[2] = (this.toDec(str.substr(4, 1)) * 16) +
                    this.toDec(str.substr(5, 1));
            return rgb;
        };

        this.isValidRGB = function (a) {
            if ((!a[0] && a[0] != 0) || isNaN(a[0]) || a[0] < 0 || a[0] > 255)
                return false;
            if ((!a[1] && a[1] != 0) || isNaN(a[1]) || a[1] < 0 || a[1] > 255)
                return false;
            if ((!a[2] && a[2] != 0) || isNaN(a[2]) || a[2] < 0 || a[2] > 255)
                return false;

            return true;
        };

        this.cssRGB = function (rgbStr) {
            if (typeof rgbStr !== "string")
                return null;
            if (rgbStr.length == 0)
                return null;
            var valArr = rgbStr.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            var color = [parseInt(valArr[1]), parseInt(valArr[2]), parseInt(valArr[3])];
            return color;
        };

        this.overlay = function (color1, color2, alpha) {
            if (isNaN(alpha))
                alpha = .5;
            if (typeof color1 === "string")
                color1 = this.hex2rgb(color1);
            if (typeof color2 === "string")
                color2 = this.hex2rgb(color2);

            var newColor = [];
            for (var i = 0, l = color1.length; i < l; i++) {
                newColor[i] = parseInt((1 - alpha) * color1[i] + alpha * color2[i], 10);
            }
            return this.rgb2hex(newColor[0], newColor[1], newColor[2]);
        }
    };
})(jQuery);