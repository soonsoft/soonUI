; (function () {
    var defaultWidth = 640,
        defaultHeight = 480;
    
    /// events
    var opening = "opening",
        opened = "opened",
        closing = "closing",
        closed = "closed",
        resize = "resize";

    var openTypes = {
        up: function () {
            var clientHeight = ui.core.root.clientHeight,
                clientWidth = ui.core.root.clientWidth;

            var option = this.animator[0];
            option.begin = clientHeight;
            option.end = (clientHeight - this.offsetHeight) / 2;
            var that = this;
            option.onChange = function (top) {
                that.cwindow.css("top", top + "px");
            };
            this.openMask();
            this.animator.onEnd = function () {
                that.onOpened();
            };

            this.cwindow.css({
                "top": option.begin + "px",
                "left": (clientWidth - this.offsetWidth) / 2 + "px",
                "display": "block"
            });
        },
        down: function () {
            var clientHeight = ui.core.root.clientHeight,
                clientWidth = ui.core.root.clientWidth;

            var option = this.animator[0];
            option.begin = -this.offsetHeight;
            option.end = (clientHeight - this.offsetHeight) / 2;
            var that = this;
            option.onChange = function (top) {
                that.cwindow.css("top", top + "px");
            };
            this.openMask();
            this.animator.onEnd = function () {
                that.onOpened();
            };

            this.cwindow.css({
                "top": option.begin + "px",
                "left": (clientWidth - this.offsetWidth) / 2 + "px",
                "display": "block"
            });
        },
        left: function () {
            var clientHeight = ui.core.root.clientHeight,
                clientWidth = ui.core.root.clientWidth;

            var option = this.animator[0];
            option.begin = -this.offsetWidth;
            option.end = (clientWidth - this.offsetWidth) / 2;
            var that = this;
            option.onChange = function (left) {
                that.cwindow.css("left", left + "px");
            };
            this.openMask();
            this.animator.onEnd = function () {
                that.onOpened();
            };

            this.cwindow.css({
                "top": (clientHeight - this.offsetHeight) / 2 + "px",
                "left": option.begin + "px",
                "display": "block"
            });
        },
        right: function () {
            var clientHeight = ui.core.root.clientHeight,
                clientWidth = ui.core.root.clientWidth;

            var option = this.animator[0];
            option.begin = clientWidth;
            option.end = (clientWidth - this.offsetWidth) / 2;
            var that = this;
            option.onChange = function (left) {
                that.cwindow.css("left", left + "px");
            };
            this.openMask();
            this.animator.onEnd = function () {
                that.onOpened();
            };

            this.cwindow.css({
                "top": (clientHeight - this.offsetHeight) / 2 + "px",
                "left": option.begin + "px",
                "display": "block"
            });
        },
        fadein: function () {
            var clientHeight = ui.core.root.clientHeight,
                clientWidth = ui.core.root.clientWidth;

            var option = this.animator[0];
            option.begin = 0;
            option.end = 100;
            var that = this;
            option.onChange = function (opacity) {
                that.cwindow.css({
                    "filter": "Alpha(opacity=" + opacity + ")",
                    "opacity": opacity / 100
                });
            };
            this.openMask();
            this.animator.onEnd = function () {
                that.onOpened();
            };

            this.cwindow.css({
                "top": (clientHeight - this.offsetHeight) / 2 + "px",
                "left": (clientWidth - this.offsetWidth) / 2 + "px",
                "opacity": 0,
                "filter": "Alpha(opacity=0)",
                "display": "block"
            });
        }
    };

    var closeTypes = {
        up: function () {
            var option = this.animator[0];
            option.begin = parseFloat(this.cwindow.css("top"), 10);
            option.end = -this.offsetHeight;
            var that = this;
            option.onChange = function (top) {
                that.cwindow.css("top", top + "px");
            };

            this.closeMask();
            this.animator.onEnd = function () {
                that.onClosed();
            };
        },
        down: function () {
            var option = this.animator[0];
            option.begin = parseFloat(this.cwindow.css("top"), 10);
            option.end = ui.core.root.clientHeight;
            var that = this;
            option.onChange = function (top) {
                that.cwindow.css("top", top + "px");
            };

            this.closeMask();
            this.animator.onEnd = function () {
                that.onClosed();
            };
        },
        left: function () {
            var option = this.animator[0];
            option.begin = parseFloat(this.cwindow.css("left"), 10);
            option.end = -this.offsetWidth;
            var that = this;
            option.onChange = function (left) {
                that.cwindow.css("left", left + "px");
            };

            this.closeMask();
            this.animator.onEnd = function () {
                that.onClosed();
            };
        },
        right: function () {
            var option = this.animator[0];
            option.begin = parseFloat(this.cwindow.css("left"), 10);
            option.end = ui.core.root.clientWidth;
            var that = this;
            option.onChange = function (left) {
                that.cwindow.css("left", left + "px");
            };

            this.closeMask();
            this.animator.onEnd = function () {
                that.onClosed();
            };
        },
        fadeout: function () {
            var option = this.animator[0];
            option.begin = 100;
            option.end = 0;
            var that = this;
            option.onChange = function (opacity) {
                that.cwindow.css({
                    "filter": "Alpha(opacity=" + opacity + ")",
                    "opacity": opacity / 100
                });
            };
            this.closeMask();
            this.animator.onEnd = function () {
                that.onClosed();
            };

            this.cwindow.css({
                "filter": "Alpha(opacity=100)",
                "opacity": 1,
                "display": "block"
            });
        }
    };

    var ctrl = ui.define("ctrls.ContentWindow", {
        _getOption: function () {
            return {
                title: "",
                show: "up",
                hide: "down",
                done: "up",
                src: null,
                width: defaultWidth,
                height: defaultHeight,
                hasMask: true,
                windowStyle: null,
                titleHeight: 48,
                ctrlHeight: 48,
                //是否为响应式
                isRespond: true,
                //可以调整窗体大小
                resizeable: false,
                //可以拖拽
                draggable: false,
                closeButtonStyle: "close-button font-highlight-hover"
            };
        },
        _getEvents: function () {
            return [opening, opened, closing, closed, resize];
        },
        _create: function () {
            this.cwindow = null;
            this.mask = null;
            this.hasMask = !!this.option.hasMask;
            this.isOpened = false;
            this.animator = ui.animator();
            this.animator.duration = 500;
            this.animating = false;

            this.offsetWidth = this.width = this.option.width;
            this.offsetHeight = this.height = this.option.height;
            this.contentWidth = this.width;
            this.contentHeight = 0;
            if(!$.isNumeric(this.width) || this.width < 0) {
                this.width = defaultWidth;
            }
            if(!$.isNumeric(this.height) || this.height < 0) {
                this.height = defaultHeight;
            }
            this.option.isRespond = !!this.option.isRespond;
            this.option.resizeable = !!this.option.resizeable;
            this.option.draggable = !!this.option.draggable;
            
            var that = this;
            "show hide done".replace(/[^, ]+/g, function (name) {
                that[name + "Async"] = function(callback) {
                    this._asyncCall(name, callback);
                };
            });
        },
        _init: function () {
            this.cwindow = $("<div class='content-window border-highlight' />");
            this.titlePanel = $("<div class='cw-title-panel' />");
            this.contentPanel = $("<div class='cw-content-panel' />");
            this.ctrlPanel = null;

            this.contentPanel.append(this.element);

            var title = this.option.title;
            if (ui.core.isPlainObject(title)) {
                this.setTitle(title.text, title.hasHr, title.style);
            } else if (title) {
                this.setTitle(title);
            }
            if (this.option.draggable) {
                this._initDraggable();
            }

            this.option.closeButtonStyle = this.option.closeButtonStyle || "close-button";
            var close = $("<a href='javascript:void(0)'>×</a>")
                    .attr("class", this.option.closeButtonStyle);
            var that = this;
            close.click(function (e) {
                that.hide();
            });

            this.cwindow.append(this.titlePanel);
            this.cwindow.append(this.contentPanel);
            this.cwindow.append(close);

            if (this.option.resizeable) {
                this._initResizeable();
            }

            this.animator.addTarget(this.cwindow, {
                ease: ui.AnimationStyle.easeFromTo
            });
            var body = $(document.body);
            if (this.hasMask) {
                this.mask = $("<div class='cw-mask-panel' />");
                body.append(this.mask);
                this.animator.addTarget(this.mask, {
                    ease: ui.AnimationStyle.easeFrom
                });
            }
            body.append(this.cwindow);

            var resizeFunc;
            if (this.option.isRespond) {
                resizeFunc = function (e, clientWidth, clientHeight) {
                    that._calculateSize(clientWidth, clientHeight);
                };
                resizeFunc();
                ui.resize(resizeFunc, ui.eventPriority.ctrlResize);
            } else {
                this._setSize(this.width, this.height, false);
            }
            if (ui.core.isPlainObject(this.option.windowStyle)) {
                this.cwindow.css(this.option.windowStyle);
            }
            this.contentPanel.css({
                "height": this.contentHeight + "px",
                "top": this.option.titleHeight + "px"
            });
        },
        _initDraggable: function () {
            var option = {
                target: this.cwindow,
                parent: $(document.body)
            };
            var that = this;
            if(this.element.nodeName() === "IFRAME") {
                option.onBegin = function() {
                    that.element.hide();
                };
                option.onEnd = function() {
                    that.element.show();
                };
            }
            this.titlePanel.addClass("dragable-title");
            this.titlePanel.draggable(option);
        },
        _initResizeable: function () {
            this.resizeHandle = $("<u class='resize-handle' />");
            this.cwindow.append(this.resizeHandle);
            var option = {
                target: this,
                parent: $(document.body),
                minWidth: 320,
                minHeight: 240,
                doc: $(document),
                onBeginDrag: function (e) {
                    if (e.which !== 1) return;
                    var option = e.data;

                    option.currentX = e.pageX;
                    option.currentY = e.pageY;

                    option.doc
                        .on("mousemove", option, option.onMoving)
                        .on("mouseup", option, option.onEndDrag);
                    document.onselectstart = function () { return false; };
                    option.isStarted = true;
                    
                    if($.isFunction(option.onBegin)) {
                        option.onBegin();
                    }
                },
                onMoving: function (e) {
                    var option = e.data;
                    if (!option.isStarted) return;
                    var x = e.pageX - option.currentX,
                        y = e.pageY - option.currentY;
                    option.currentX = e.pageX;
                    option.currentY = e.pageY;
                    var width = option.target.offsetWidth + x;
                    var height = option.target.offsetHeight + y;
                    if (width < option.minWidth) {
                        width = option.minWidth;
                    }
                    if (height < option.minHeight) {
                        height = option.minHeight;
                    }
                    option.target._setSize(width, height);
                },
                onEndDrag: function (e) {
                    if (e.which !== 1) return;
                    var option = e.data;
                    if (!option.isStarted) return;
                    option.currentX = option.currentY = 0;
                    option.isStarted = false;
                    option.doc
                        .off("mousemove", option.onMoving)
                        .off("mouseup", option.onEndDrag);
                    document.onselectstart = null;
                    
                    if($.isFunction(option.onEnd)) {
                        option.onEnd();
                    }
                }
            };
            var that = this;
            if(this.element.nodeName() === "IFRAME") {
                option.onBegin = function() {
                    that.element.hide();
                };
                option.onEnd = function() {
                    that.element.show();
                };
            }
            this.resizeHandle.on("mousedown", option, option.onBeginDrag);
        },
        _contentAppend: function (elem) {
            if (ui.core.isDomObject(elem)) {
                elem = $(elem);
            } else if (!ui.core.isJQueryObject(elem)) {
                return;
            }
            this.contentPanel.append(elem);
        },
        buttonAppend: function (elem) {
            if (ui.core.type(elem) === "string") {
                elem = $("#" + elem);
            } else if (ui.core.isDomObject(elem)) {
                elem = $(elem);
            } else if (!ui.core.isJQueryObject(elem)) {
                return;
            }
            if (!this.ctrlPanel) {
                this.ctrlPanel = $("<div class='cw-ctrl-panel' />");
                this._updateContentPanelHeight();
                this.cwindow.append(this.ctrlPanel);
                this.fire(resize);
            }
            this.ctrlPanel.append(elem);
            return this;
        },
        _updateContentPanelHeight: function() {
            this.contentHeight = this.height - this.option.titleHeight - (this.ctrlPanel ? this.option.ctrlHeight : 0);
            this.contentPanel.css("height", this.contentHeight + "px");
        },
        setTitle: function(title, hasHr, style) {
            var titleContent = null,
                titleInner;
            if(ui.core.type(title) === "string") {
                titleContent = $("<span class='font-highlight' />").text(title);
                if (hasHr !== false) {
                    hasHr = true;
                }
            } else if (ui.core.isDomObject(title)) {
                titleContent = $(title);
            } else if (ui.core.isJQueryObject(title)) {
                titleContent = title;
            }

            this.titlePanel.empty();
            titleInner = $("<div class='title-inner-panel' />");
            titleInner.append(titleContent);
            if (hasHr) {
                titleInner.append(
                    $("<hr class='cw-title-text-spline background-highlight' />"));
            }
            this.titlePanel.append(titleInner);
            var i = 0;
            if (ui.core.type(style) === "array") {
                for (; i < style.length; i++) {
                    this.titlePanel.addClass(style[i]);
                }
            } else if (ui.core.isPlainObject(style)) {
                this.titlePanel.css(style);
            }
        },
        _calculateSize: function (parentWidth, parentHeight) {
            if (!$.isNumeric(parentWidth)) {
                parentWidth = ui.core.root.clientWidth;
            }
            if (!$.isNumeric(parentHeight)) {
                parentHeight = ui.core.root.clientHeight;
            }

            var winWidth = this.option.width;
            var winHeight = parentHeight * 0.85;
            if (this.height > winHeight) {
                if (this.height > parentHeight) {
                    winHeight = parentHeight;
                } else {
                    winHeight = this.height;
                }
            }
            if (winWidth > parentWidth) {
                winWidth = parentWidth;
            }
            this.setSizeLocation(winWidth, winHeight, parentWidth, parentHeight);
        },
        setSizeLocation: function (newWidth, newHeight, parentWidth, parentHeight) {
            if (!$.isNumeric(parentWidth)) {
                parentWidth = ui.core.root.clientWidth;
            }
            if (!$.isNumeric(parentHeight)) {
                parentHeight = ui.core.root.clientHeight;
            }
            this._setSize(newWidth, newHeight);
            this.cwindow.css({
                "top": (parentHeight - this.offsetHeight) / 2 + "px",
                "left": (parentWidth - this.offsetWidth) / 2 + "px"
            });
            if (this.hasMask) {
                this.mask.css("height", parentHeight + "px");
            }
        },
        _setSize: function (newWidth, newHeight, canFire) {
            var borderTop = parseInt(this.cwindow.css("border-top-width"), 10) || 0,
                borderBottom = parseInt(this.cwindow.css("border-bottom-width"), 10) || 0,
                borderLeft = parseInt(this.cwindow.css("border-left-width"), 10) || 0,
                borderRight = parseInt(this.cwindow.css("border-right-width"), 10) || 0;

            if ($.isNumeric(newWidth) && newWidth > 0) {
                this.offsetWidth = newWidth;
                this.width = this.offsetWidth - borderLeft - borderRight;
                this.cwindow.css("width", this.width + "px");
            }
            if ($.isNumeric(newHeight) && newHeight > 0) {
                this.offsetHeight = newHeight;
                this.height = this.offsetHeight - borderTop - borderBottom;
                this.cwindow.css("height", this.height + "px");
                this._updateContentPanelHeight();
            }
            if (canFire !== false)
                this.fire(resize);
        },
        show: function () {
            this.fire(opening);

            if (this.animating || this.isOpened) {
                return;
            }
            var func = openTypes[this.option.show];
            if ($.isFunction(func)) {
                func.call(this);

                this.animating = true;
                return this.animator.start();
            }
        },
        hide: function () {
            this.fire(closing);

            if (this.animating || !this.isOpened) {
                return;
            }
            var func = closeTypes[this.option.hide];
            if ($.isFunction(func)) {
                func.call(this);

                this.animating = true;
                return this.animator.start();
            }
        },
        done: function () {
            this.fire(closing);

            if (this.animating || !this.isOpened) {
                return;
            }
            var func = closeTypes[this.option.done];
            if ($.isFunction(func)) {
                func.call(this);

                this.animating = true;
                return this.animator.start();
            }
        },
        _asyncCall: function(method, callback) {
            var deferred = null;
            if($.isFunction(this[method])) {
                deferred = this[method].call(this);
                if (deferred && $.isFunction(callback)) {
                    deferred.done(callback);
                }
            }
        },
        onOpened: function() {
            this.animating = false;
            this.isOpened = true;
            this.fire(opened);
        },
        onClosed: function() {
            this.animating = false;
            this.isOpened = false;
            this.cwindow.css("display", "none");
            if (this.hasMask) {
                $(document.body).css("overflow", this._oldBodyOverflow);
                this.mask.css("display", "none");
            }

            this.fire(closed);
        },
        openMask: function () {
            var body = $(document.body),
                option;
            if (this.hasMask) {
                this._oldBodyOverflow = body.css("overflow");
                body.css("overflow", "hide");
                this.mask.css("height", ui.core.root.clientHeight + "px");

                option = this.animator[1];
                option.begin = 0;
                option.end = 70;
                option.onChange = function (op) {
                    this.target.css({
                        "opacity": op / 100,
                        "filter": "Alpha(opacity=" + op + ")"
                    });
                }

                this.mask.css("display", "block");
            }
        },
        closeMask: function () {
            var option;
            if (this.hasMask) {
                option = this.animator[1];
                option.begin = 70;
                option.end = 0;
                option.onChange = function (op) {
                    this.target.css({
                        "filter": "Alpha(opacity=" + op + ")",
                        "opacity": op / 100
                    });
                }
            }
        },
        getCurrentLocation: function () {
            var offset = this.cwindow.offset();
            return offset;
        },
        getCurrentOpacity: function () {

        }
    });

    $.fn.putWindow = function (option) {
        if (!this || this.length == 0) {
            return null;
        }
        return ctrl(option, this);
    };

    ui.win = {
        createUrlWindow: function (option) {
            var iframe = $("<iframe class='content-frame' frameborder='0' scrolling='auto' />");
            if (ui.core.type(option.src) === "string") {
                iframe.prop("src", option.src);
            }
            return ctrl(option, iframe);
        },
        setShowStyle: function (name, func) {
            if (ui.core.type(name) === "string" && name) {
                if ($.isFunction(func)) {
                    openTypes[name] = func;
                }
            }
        },
        setHideStyle: function (name, func) {
            if (ui.core.type(name) === "string" && name) {
                if ($.isFunction(func)) {
                    closeTypes[name] = func;
                }
            }
        }
    };
})();