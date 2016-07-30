; (function () {
    var borderColor = ui.theme.highlight.border,
        bgColor = ui.theme.highlight.background,
        fontColor = ui.theme.highlight.font;

    /* 内容过滤选择器 */
    var prefix = "filter_tool";
    var filterCount = 0;
    
    ui.define("ctrls.FilterTool", {
        _getOption: function () {
            //data item is { text: "", value: "" }
            return {
                data: [],
                defaultIndex: 0,
                filterCss: null
            };
        },
        _getEvents: function () {
            return ["selected", "deselected"];
        },
        _create: function () {
            this.data = Array.isArray(this.option.data) ? this.option.data : [];
            this.filterPanel = null;
            this.parent = this.element;

            this.radioName = prefix + "_" + (filterCount++);
        },
        _init: function () {
            this.filterPanel = $("<div class='filter-tools-panel'>");
            var i, len = this.data.length,
                item;
            for (i = 0; i < len; i++) {
                item = this.data[i];
                if (item.selected === true) {
                    this.option.defaultIndex = i;
                }
                this._createTool(item, i);
            }
            if (this.option.filterCss) {
                this.filterPanel.css(this.option.filterCss);
            }
            this.filterPanel.click($.proxy(this.onClickHandler, this));
            this.parent.append(this.filterPanel);

            if (!$.isNumeric(this.option.defaultIndex) || this.option.defaultIndex >= this.data.length || this.option.defaultIndex < 0) {
                this.option.defaultIndex = 0;
            }
            this.setIndex(this.option.defaultIndex);
        },
        _createTool: function (item, index) {
            if (!ui.core.isPlainObject(item)) {
                return;
            }

            item.index = index;
            var label = $("<label class='filter-tools-item' />"),
                radio = $("<input type='radio' name='" + this.radioName + "'/>"),
                span = $("<span />");
            label.append(radio).append(span);

            if (index === 0) {
                label.addClass("filter-tools-item-first");
            }
            label.addClass(fontColor).addClass(borderColor);
            radio.prop("value", item.value || "");
            span.text(item.text || "tool" + index);
            label.data("dataItem", item);

            this.filterPanel.append(label);
        },
        onClickHandler: function (e) {
            var elem = $(e.target);
            var nodeName;
            while ((nodeName = elem.nodeName()) !== "LABEL") {
                if (nodeName === "DIV") {
                    return;
                }
                elem = elem.parent();
            }
            this.selectFilterItem(elem);
        },
        selectFilterItem: function (label) {
            var item = label.data("dataItem"),
                currentItem;
            if (this.current) {
                currentItem = this.current.data("dataItem");
                if (item.index == currentItem.index) {
                    return;
                }

                this.current
                    .addClass(fontColor)
                    .removeClass(bgColor);
                this.fire("deselected", currentItem);
            }

            this.current = label;
            label.find("input").prop("checked", true);
            this.current
                .addClass(bgColor)
                .removeClass(fontColor);

            this.fire("selected", item);
        },
        _getIndexByValue: function(value) {
            var index = -1;
            if(!this.data) {
                return index;
            }
            var i = this.data.length - 1;
            for (; i >= 0; i--) {
                if (this.data[i].value === value) {
                    index = i;
                    break;
                }
            }
            return index;
        },
        setIndex: function (index) {
            if (!this.data) {
                return;
            }
            if (!$.isNumeric(index)) {
                index = 0;
            }
            var label;
            if (index >= 0 && index < this.data.length) {
                label = $(this.filterPanel.children()[index]);
                this.selectFilterItem(label);
            }
        },
        setValue: function(value) {
            var index = this._getIndexByValue(value);
            if(index > -1) {
                this.setIndex(index);
            }
        },
        hideIndex: function(index) {
            this._setDisplayIndex(index, true);
        },
        hideValue: function(value) {
            var index = this._getIndexByValue(value);
            if(index > -1) {
                this.hideIndex(index);
            }
        },
        showIndex: function(index) {
            this._setDisplayIndex(index, false);
        },
        showValue: function(value) {
            var index = this._getIndexByValue(value);
            if(index > -1) {
                this.showIndex(index);
            }
        },
        _setDisplayIndex: function(index, isHide) {
            if (!this.data) {
                return;
            }
            if (!$.isNumeric(index)) {
                index = 0;
            }
            var label;
            if (index >= 0 && index < this.data.length) {
                label = $(this.filterPanel.children()[index]);
                if(isHide) {
                    label.addClass("filter-tools-item-hide");
                } else {
                    label.removeClass("filter-tools-item-hide");
                }
                this._updateFirstClass();
            }  
        },
        _updateFirstClass: function() {
            var children = this.filterPanel.children();
            var i = 0,
                len = children.length,
                label,
                firstLabel;
            for(; i < len; i++) {
                label = $(children[i]);
                if(label.hasClass("filter-tools-item-hide")) {
                    continue;
                }
                if(!firstLabel) {
                    firstLabel = label;
                } else {
                    label.removeClass("filter-tools-item-first");
                }
            }
            if(firstLabel) {
                firstLabel.addClass("filter-tools-item-first");
            }
        },
        getCurrent: function () {
            var currentItem = null;
            if (this.current) {
                currentItem = this.current.data("dataItem");
            }
            return currentItem;
        }
    });
    $.fn.createFilterTools = function (option) {
        if (!this || this.length == 0) {
            return null;
        }
        return ui.ctrls.FilterTool(option, this);
    };
    
    
    /* 悬停视图 */
    var guid = 1;
    ui.define("ctrls.HoverView", {
        buffer: 30,
        _getOption: function () {
            return {
                width: 160,
                height: 160
            };
        },
        _getEvents: function () {
            return ["showing", "showed", "hiding", "hided"];
        },
        _create: function () {
            this.viewPanel = null;
            this.width;
            this.height;

            this.target = null;
            this.targetWidth;
            this.targetHeight;

            this.hasDocMousemoveEvent = false;

            this.animating = false;
            this.isShow = false;

            if (!$.isNumeric(this.option.width) || this.option.width <= 0) {
                this.option.width = 160;
            }
            if (!$.isNumeric(this.option.height) || this.option.height <= 0) {
                this.option.height = 160;
            }
        },
        _init: function () {
            this.viewPanel = $("<div class='hover-view-panel' />");
            this.viewPanel.addClass(borderColor);
            this.viewPanel.css({
                "width": this.option.width + "px",
                "max-height": this.option.height + "px"
            });

            $(document.body).append(this.viewPanel);

            this.onDocumentMousemove = $.proxy(this.doDocumentMousemove, this);
            this.onDocumentMousemove.guid = "hoverView" + (guid++);

            this.width = this.viewPanel.outerWidth();
            this.height = this.viewPanel.outerHeight();
        },
        empty: function () {
            this.viewPanel.empty();
            return this;
        },
        append: function (elem) {
            this.viewPanel.append(elem);
            return this;
        },
        doDocumentMousemove: function (e) {
            var x = e.clientX,
                y = e.clientY;
            if (this.animating) {
                return;
            }
            var p = this.target.offset();
            var tl = {
                top: Math.floor(p.top),
                left: Math.floor(p.left)
            };
            tl.bottom = tl.top + this.targetHeight;
            tl.right = tl.left + this.targetWidth;

            p = this.viewPanel.offset();
            var pl = {
                top: Math.floor(p.top),
                left: Math.floor(p.left)
            };
            pl.bottom = pl.top + this.height;
            pl.right = pl.left + this.width;

            //差值
            var xdv = -1,
                ydv = -1,
                l, r,
                t = tl.top < pl.top ? tl.top : pl.top,
                b = tl.bottom > pl.bottom ? tl.bottom : pl.bottom;
            //判断view在左边还是右边
            if (tl.left < pl.left) {
                l = tl.left;
                r = pl.right;
            } else {
                l = pl.left;
                r = tl.right;
            }

            //判断鼠标是否在view和target之外
            if (x < l) {
                xdv = l - x;
            } else if (x > r) {
                xdv = x - r;
            }
            if (y < t) {
                ydv = t - y;
            } else if (y > b) {
                ydv = y - b;
            }

            if (xdv == -1 && ydv == -1) {
                xdv = 0;
                if (x >= tl.left && x <= tl.right) {
                    if (y <= tl.top - this.buffer || y >= tl.bottom + this.buffer) {
                        ydv = this.buffer;
                    }
                } else if (x >= pl.left && x <= pl.right) {
                    if (y < pl.top) {
                        ydv = pl.top - y;
                    } else if (y > pl.bottom) {
                        ydv = y - pl.bottom;
                    }
                }
                if (ydv == -1) {
                    this.viewPanel.css({
                        "opacity": 1,
                        "filter": "Alpha(opacity=100)"
                    });
                    return;
                }
            }

            if (xdv > this.buffer || ydv > this.buffer) {
                this.hide();
                return;
            }

            var opacity = 1.0 - ((xdv > ydv ? xdv : ydv) / this.buffer);
            if (opacity < 0.2) {
                this.hide();
                return;
            }
            this.viewPanel.css({
                "opacity": opacity,
                "filter": "Alpha(opacity=" + opacity * 100 + ")"
            });
        },
        addDocMousemove: function () {
            if (this.hasDocMousemoveEvent) {
                return;
            }
            this.hasDocMousemoveEvent = true;
            $(document).bind("mousemove", this.onDocumentMousemove);
        },
        removeDocMousemove: function () {
            if (!this.hasDocMousemoveEvent) {
                return;
            }
            this.hasDocMousemoveEvent = false;
            $(document).unbind("mousemove", this.onDocumentMousemove);
        },
        setLocation: function () {
            ui.setLeft(this.target, this.viewPanel);
        },
        getLocation: function () {
            var location = ui.getLeftLocation(this.target, this.width, this.height);
            return location;
        },
        show: function (target) {
            var view = this;
            this.target = target;

            this.animating = true;

            var result = this.fire("showing");
            if (result === false) return;

            //update size
            this.targetWidth = this.target.outerWidth();
            this.targetHeight = this.target.outerHeight();
            this.height = this.viewPanel.outerHeight();

            this.viewPanel.stop();
            var loc = this.getLocation(),
                opacity,
                css;
            if (this.isShow) {
                css = {
                    left: loc.left + "px",
                    top: loc.top + "px"
                };
                opacity = parseFloat(this.viewPanel.css("opacity"), 10);
                if (opacity < 1) {
                    css["opacity"] = 1;
                    css["filter"] = "Alpha(opacity=100)"
                }
            } else {
                this.viewPanel.css({
                    "top": loc.top + "px",
                    "left": loc.left + "px",
                    "opacity": 0,
                    "filter": "Alpha(opacity=0)"
                });
                css = {
                    "opacity": 1,
                    "filter": "Alpha(opacity=100)"
                };
            }
            this.isShow = true;
            this.viewPanel.css("display", "block");
            var func = function () {
                view.animating = false;
                view.addDocMousemove();
                view.fire("showed");
            };
            this.viewPanel.animate(css, 240, func);
        },
        hide: function (complete) {
            var view = this;

            var result = this.fire("hiding");
            if (result === false) return;

            this.viewPanel.stop();
            this.removeDocMousemove();
            var func = function () {
                view.isShow = false;
                view.viewPanel.css("display", "none");
                view.fire("hided");
            };
            var css = {
                "opacity": 0,
                "filter": "Alpha(opacity=0)"
            };
            this.viewPanel.animate(css, 200, func);
        }
    });
    ui.createHoverView = function (option) {
        return ui.ctrls.HoverView(option);
    };
    $.fn.addHoverView = function (view) {
        if (!this || this.length == 0) {
            return null;
        }
        var that = this;
        if (view instanceof ui.ctrls.HoverView) {
            this.mouseover(function(e) {
                view.show(that);
            });
        }
    };
    
    
    /* 状态按钮 */


    /* 确认按钮 */
    ui.define("ctrls.ConfirmButton", {
        _getOption: function () {
            return {
                disabled: false,
                readonly: false,
                backTime: 5000,
                checkHandler: false,
                handler: false,
                color: null,
                backgroundColor: null
            };
        },
        _create: function() {
            this.state = 0;
            this.animating = false;
            if(ui.core.type(this.option.backTime) !== "number" || this.option.backTime <= 0) {
                this.option.backTime = 5000;
            }
        },
        _init: function () {
            if(!$.isFunction(this.option.handler)) {
                return;
            }
            var text = ui.str.trim(this.element.text());
            var textState = $("<span class='text-state' />");
            var confirmState = $("<i class='confirm-state' />");
            
            textState.text(text);
            if(!this.option.backgroundColor) {
                this.option.backgroundColor = this.element.css("color");
            }
            confirmState
                .text("确定")
                .css("background-color", this.option.backgroundColor);
            if(this.option.color) {
                confirmState.css("color", this.option.color);
            }
            this.element.addClass("confirm-button");
            this.element.css("width", this.element.width() + "px");
            this.element
                .empty()
                .append(textState)
                .append(confirmState);
            
            this.changeAnimator = ui.animator({
                target: textState,
                ease: ui.AnimationStyle.easeFromTo,
                onChange: function(val) {
                    this.target.css("margin-left", val + "%");
                }
            }).addTarget({
                target: confirmState,
                ease: ui.AnimationStyle.easeFromTo,
                onChange: function(val) {
                    this.target.css("left", val + "%");
                }
            });
            this.changeAnimator.duration = 200;
            this.element.click($.proxy(this.doClick, this));
            
            this.readonly(this.option.readonly);
            this.disabled(this.option.disabled);
        },
        doClick: function(e) {
            clearTimeout(this.backTimeHandler);
            if($.isFunction(this.option.checkHandler)) {
                if(this.option.checkHandler.call(this) === false) {
                    return;
                }
            }
            var that = this;
            if(this.state == 0) {
                this.next();
                this.backTimeHandler = setTimeout(function() {
                    that.back();
                }, this.option.backTime);
            } else if(this.state == 1) {
                this.next();
                this.option.handler.call(this);
            }
        },
        back: function() {
            if(this.animating) {
                return;
            }
            var that = this,
                option;
            this.state = 0;
            option = this.changeAnimator[0];
            option.target.css("margin-left", "-200%");
            option.begin = -200;
            option.end = 0;
            option = this.changeAnimator[1];
            option.target.css("left", "0%");
            option.begin = 0;
            option.end = 100;
            
            this.animating = true;
            this.changeAnimator.start().done(function() {
                that.animating = false;
            });
        },
        next: function(state) {
            if(this.animating) {
                return;
            }
            var that = this,
                option;
            if(this.state == 0) {
                option = this.changeAnimator[0];
                option.target.css("margin-left", "0%");
                option.begin = 0;
                option.end = -200;
                option = this.changeAnimator[1];
                option.target.css("left", "100%");
                option.begin = 100;
                option.end = 0;
                
                this.state = 1;
            } else {
                option = this.changeAnimator[0];
                option.target.css("margin-left", "100%");
                option.begin = 100;
                option.end = 0;
                option = this.changeAnimator[1];
                option.target.css("left", "0%");
                option.begin = 0;
                option.end = -100;
                
                this.state = 0;
            }
            this.animating = true;
            this.changeAnimator.start().done(function() {
                that.animating = false;
            });
        },
        disabled: function() {
            if(arguments.length == 0) {
                return this.option.disabled;
            } else {
                this.option.disabled = !!arguments[0];
                if(this.option.disabled) {
                    this.element.attr("disabled", "disabled");
                } else {
                    this.element.removeAttr("disabled")
                }
            }
        },
        readonly: function() {
            if(arguments.length == 0) {
                return this.option.readonly;
            } else {
                this.option.readonly = !!arguments[0];
                if(this.option.readonly) {
                    this.element.attr("readonly", "readonly");
                } else {
                    this.element.removeAttr("readonly");
                }
            }
        },
        text: function() {
            var span = this.element.children(".text-state");
            if(arguments.length == 0) {
                return span.text();
            } else {
                return span.text(ui.str.trim(arguments[0] + ""));
            }
        }
    });
    $.fn.confirmClick = function(option) {
        if (!this || this.length == 0) {
            return null;
        }
        if($.isFunction(option)) {
            if($.isFunction(arguments[1])) {
                option = {
                    checkHandler: option,
                    handler: arguments[1]
                };
            } else {
                option = {
                    handler: option
                };
            }
        }
        return ui.ctrls.ConfirmButton(option, this);
    };
    
    /* 开关按钮 */
    ui.define("ctrls.SwitchButton", {
        _getOption: function() {
            return {
                readonly: false,
                style: null
            };
        },
        _getEvents: function() {
            return ["changed"];
        },
        _create: function() {
            this.switchBox = $("<label class='switch-button' />");
            this.inner = $("<div class='switch-inner' />");
            this.thumb = $("<div class='switch-thumb' />");
            
            if(this.option.style === "lollipop") {
                this.switchBox.addClass("switch-lollipop");
                this._open = this._lollipopOpen;
                this._close = this._lollipopClose;
            } else if(this.option.style === "marshmallow") {
                this.switchBox.addClass("switch-marshmallow");
                this._open = this._lollipopOpen;
                this._close = this._lollipopClose;
            }
            
            this.animator = ui.animator({
                target: this.thumb,
                ease: ui.AnimationStyle.easeTo,
                onChange: function(val) {
                    this.target.css("background-color", 
                        ui.theme.overlay(this.beginColor, this.endColor, val / 100));
                }
            }).addTarget({
                target: this.thumb,
                ease: ui.AnimationStyle.easeFromTo,
                onChange: function(val, elem) {
                    elem.css("left", val + "px");
                }
            });
            this.animator.duration = 200;
        },
        _init: function() {
            this.element.wrap(this.switchBox);
            this.switchBox = this.element.parent();
            this.switchBox
                .append(this.inner)
                .append(this.thumb);
                
            this.width = this.switchBox.width();
            this.height = this.switchBox.height();
            
            var that = this;
            this.element.change(function(e) {
                that.onChange();
            });
            
            this.readonly(this.option.readonly);
            this.thumbColor = this.thumb.css("background-color");
            if(this.checked()) {
                this._open();
            }
        },
        onChange: function() {
            var checked = this.element.prop("checked");
            if(this.readonly()) {
                this.element.prop("checked", !checked);
                return;
            }
            if(checked) {
                this._open();
            } else {
                this._close();
            }
            this.fire("changed");
        },
        _open: function() {
            this.animator.stop();
            this.switchBox.addClass("switch-open");
            this.inner
                .addClass("border-highlight")
                .addClass("background-highlight");
            var option = this.animator[0];
            option.beginColor = this.thumbColor;
            option.endColor = "#FFFFFF";
            option.begin = 0;
            option.end = 100;
            
            option = this.animator[1];
            option.begin = parseFloat(option.target.css("left"), 10);
            option.end = this.width - this.thumb.width() - 3;
            this.animator.start();
        },
        _close: function() {
            this.animator.stop();
            this.switchBox.removeClass("switch-open");
            this.inner
                .removeClass("border-highlight")
                .removeClass("background-highlight");
            var option = this.animator[0];
            option.beginColor = "#FFFFFF";
            option.endColor = this.thumbColor;
            option.begin = 0;
            option.end = 100;
            
            option = this.animator[1];
            option.begin = parseFloat(option.target.css("left"), 10);
            option.end = 3;
            
            this.animator.start();     
        },
        _lollipopOpen: function() {
            this.animator.stop();
            this.switchBox.addClass("switch-open");
            this.inner.addClass("background-highlight");
            this.thumb
                .addClass("border-highlight")
                .addClass("background-highlight");
            var option = this.animator[0];
            option.begin = 0;
            option.end = 0;
            
            option = this.animator[1];
            option.begin = parseFloat(option.target.css("left"), 10);
            option.end = this.width - this.thumb.outerWidth();
            this.animator.start();
        },
        _lollipopClose: function() {
            this.animator.stop();
            this.switchBox.removeClass("switch-open");
            this.inner.removeClass("background-highlight");
            this.thumb
                .removeClass("border-highlight")
                .removeClass("background-highlight");
            var option = this.animator[0];
            option.begin = 0;
            option.end = 0;
            
            option = this.animator[1];
            option.begin = parseFloat(option.target.css("left"), 10);
            option.end = 0;
            
            this.animator.start();
        },
        isOpen: function() {
            return this.switchBox.hasClass("switch-open");  
        },
        readonly: function() {
            if(arguments.length == 0) {
                return this.option.readonly;
            } else {
                this.option.readonly = !!arguments[0];
                if(this.option.readonly) {
                    this.element.attr("readonly", "readonly");
                } else {
                    this.element.removeAttr("readonly");
                }
            }
        },
        val: function() {
            if(arguments.length == 0) {
                return this.element.val();
            } else {
                this.element.val(arguments[0]);
            }
        },
        checked: function() {
            var checked;
            if(arguments.length == 0) {
                return this.element.prop("checked");
            } else {
                arguments[0] = !!arguments[0];
                checked = this.element.prop("checked");
                if(arguments[0] !== checked) {
                    this.element.prop("checked", arguments[0]);
                    this.onChange();
                } else {
                    //修正checkbox和当前样式不一致的状态，可能是手动给checkbox赋值或者是reset导致
                    if(checked && !this.isOpen()) {
                        this._open();
                    } else if(!checked && this.isOpen()) {
                        this._close();
                    }
                }
            }
        }
    });
    $.fn.switchButton = function(option) {
        if (!this || this.length == 0) {
            return null;
        }
        if(this.nodeName() !== "INPUT" && this.prop("type") !== "checkbox") {
            ui.error("switch button must be checkbox");
        }
        return ui.ctrls.SwitchButton(option, this);
    };
    
    /* 异步按钮 */
    
    /* 扩展按钮 */
    ui.define("ctrls.ExtendButton", {
        _getOption: function() {
            return {
                buttonSize: 32,
                //centerIcon = close: 关闭按钮 | none: 中空结构 | htmlString: 提示信息
                centerIcon: "close",
                centerSize: null,
                buttons: [],
                parent: null
            };
        },
        _getEvents: function() {
            return ["showing", "showed", "hiding", "hided"];
        },
        _create: function() {
            this.parent = ui.getJQueryElement(this.option.parent);
            if(!this.parent) {
                this.parent = $(document.body);
                this.isBodyInside = true;
            } else {
                this.isBodyInside = false;
            }
            this.buttonPanelBGBorderWidth = 0;
            if(ui.core.type(this.option.buttonSize) !== "number") {
                this.option.buttonSize = 32;
            }
            this.centerSize = this.option.centerSize;
            if(ui.core.type(this.centerSize) !== "number") {
                this.centerSize = this.option.buttonSize;
            }
            if(ui.core.type(this.option.buttons) !== "array") {
                this.option.buttons = [];   
            }
            
            this.buttonPanel = $("<div class='extend-button-panel' />");
            this.buttonPanelBackground = $("<div class='extend-button-background border-highlight' />");
            
            this.hasCloseButton = false;
            if(this.option.centerIcon === "close") {
                this.hasCloseButton = true;
                this.centerIcon = $("<a class='center-icon close-button font-highlight' style='font-size:24px !important;' title='关闭'>×</a>");
            } else if(this.option.centerIcon === "none") {
                this.centerIcon = $("<a class='center-icon center-none border-highlight' />");
                this.backgroundColorPanel = $("<div class='background-panel' />");
                this.buttonPanelBackground.append(this.backgroundColorPanel);
                this.buttonPanelBackground.append(this.centerIcon);
                this.buttonPanelBackground.css("background-color", "transparent");
            } else {
                this.centerIcon = $("<a class='center-icon' />");
                if(!ui.str.isNullOrEmpty(this.option.centerIcon)) {
                    this.centerIcon.append(this.option.centerIcon);
                }
            }
            
            this.buttonPanelAnimator = ui.animator({
                target: this.buttonPanelBackground,
                onChange: function(val) {
                    this.target.css("top", val + "px");
                }
            }).addTarget({
                target: this.buttonPanelBackground,
                onChange: function(val) {
                    this.target.css("left", val + "px");
                }
            }).addTarget({
                target: this.buttonPanelBackground,
                onChange: function(val) {
                    this.target.css({
                        "width": val + "px",
                        "height": val + "px"
                    });
                }
            }).addTarget({
                target: this.buttonPanelBackground,
                onChange: function(op) {
                    this.target.css({
                        "opacity": op / 100,
                        "filter": "Alpha(opacity=" + op + ")"
                    });
                }
            });
            this.buttonPanelAnimator.duration =240;
            this.buttonAnimator = ui.animator();
            this.buttonAnimator.duration = 240;
        },
        _init: function() {
            var i = 0,
                len,
                that = this;
            
            this._caculateSize();
            this.buttonPanel.append(this.buttonPanelBackground);
            
            if(this.option.centerIcon === "none") {
                this.backgroundColorPanel.css({
                    "width": this.centerSize + "px",
                    "height": this.centerSize + "px"
                });
                this.buttonPanelAnimator[2].onChange = function(val) {
                    var borderWidth = (that.buttonPanelSize - that.centerSize) / 2;
                    if(val > that.centerSize) {
                        borderWidth = Math.ceil(borderWidth * (val / that.buttonPanelSize));
                    } else {
                        borderWidth = 0;   
                    }
                    this.target.css({
                        "width": val + "px",
                        "height": val + "px"
                    });
                    that.backgroundColorPanel.css("border-width", borderWidth + "px");
                };
                this.centerIcon.css({
                    "width": this.centerSize + "px",
                    "height": this.centerSize + "px",
                    "margin-left": -(this.centerSize / 2 + 1) + "px",
                    "margin-top": -(this.centerSize / 2 + 1) + "px"
                });
            } else {
                this.centerIcon.css({
                    "width": this.centerSize + "px",
                    "height": this.centerSize + "px",
                    "line-height": this.centerSize + "px",
                    "top": this.centerTop - this.centerSize / 2 + "px",
                    "left": this.centerLeft - this.centerSize / 2 + "px"
                });
                this.buttonPanel.append(this.centerIcon);
            }
            
            for(len = this.option.buttons.length; i < len; i++) {
                 this._createButton(this.option.buttons[i], this.deg * i);
            }
            if($.isFunction(this.element.addClass)) {
                this.element.addClass("extend-element");
            }
            this.parent.append(this.buttonPanel);
            this.buttonPanelBGBorderWidth = parseFloat(this.buttonPanelBackground.css("border-top-width"), 10) || 0;
            
            this.bindShowEvent();
            this.bindHideEvent();
            this.buttonPanel.click(function(e) {
                e.stopPropagation();
            });
        },
        bindShowEvent: function() {
            var that = this;
            this.element.click(function(e) {
                e.stopPropagation();
                that.show();
            });
        },
        bindHideEvent: function() {
            var that = this;
            if(this.hasCloseButton) {
                this.centerIcon.click(function(e) {
                    that.hide();
                });
            } else {
                ui.docClick(function(e) {
                    that.hide();
                });
            }
        },
        getElementCenter: function() {
            var position = this.isBodyInside 
                ? this.element.offset()
                : this.element.position();
            position.left = position.left + this.element.outerWidth() / 2;
            position.top = position.top + this.element.outerHeight()/ 2;
            return position;
        },
        isShow: function() {
            return this.buttonPanel.css("display") === "block";  
        },
        show: function(hasAnimation) {
            var that = this;
            if(this.isShow()) {
                return;
            }
            
            if(this.fire("showing") === false) {
                return;
            }
            
            this._setButtonPanelLocation();
            if(hasAnimation === false) {
                this.buttonPanel.css("display", "block");
            } else {
                this.buttonPanel.css("display", "block");
                this._setButtonPanelAnimationOpenValue(this.buttonPanelAnimator);
                this._setButtonAnimationOpenValue(this.buttonAnimator);
                this.buttonPanelAnimator.start();
                this.buttonAnimator.delayHandler = setTimeout(function() {
                    that.buttonAnimator.delayHandler = null;
                    that.buttonAnimator.start().done(function() {
                        that.fire("showed");
                    });
                }, 100);
            }
        },
        hide: function(hasAnimation) {
            var that = this;
            if(!this.isShow()) {
                return;
            }
            
            if(this.fire("hiding") === false) {
                return;
            }
            
            if(hasAnimation === false) {
                this.buttonPanel.css("display", "none");
            } else {
                this._setButtonPanelAnimationCloseValue(this.buttonPanelAnimator);
                this._setButtonAnimationCloseValue(this.buttonAnimator);
                this.buttonAnimator.start();
                this.buttonPanelAnimator.delayHandler = setTimeout(function() {
                    that.buttonPanelAnimator.delayHandler = null;
                    that.buttonPanelAnimator.start().done(function() {
                        that.buttonPanel.css("display", "none");
                        that.fire("hided");
                    });
                }, 100);
            }
        },
        _setButtonPanelAnimationOpenValue: function(animator) {
            var option,
                target;
            option = animator[0];
            target = option.target;
            option.begin = this.centerTop - this.centerSize / 2;
            option.end = 0 - this.buttonPanelBGBorderWidth;
            option.ease = ui.AnimationStyle.easeTo;
            
            option = animator[1];
            option.begin = this.centerLeft - this.centerSize / 2;
            option.end = 0 - this.buttonPanelBGBorderWidth;
            option.ease = ui.AnimationStyle.easeTo;
            
            option = animator[2];
            option.begin = this.centerSize;
            option.end = this.buttonPanelSize;
            option.ease = ui.AnimationStyle.easeTo;
            
            option = animator[3];
            option.begin = 0;
            option.end = 100;
            option.ease = ui.AnimationStyle.easeFrom;
            
            target.css({
                "left": this.centerLeft - this.buttonSize / 2 + "px",
                "top": this.centerTop - this.buttonSize / 2 + "px",
                "width": this.buttonSize + "px",
                "height": this.buttonSize + "px"
            });
        },
        _setButtonPanelAnimationCloseValue: function(animator) {
            var option,
                temp;
            var i = 0,
                len = animator.length;
            for(; i < len; i++) {
                option = animator[i];
                temp = option.begin;
                option.begin = option.end;
                option.end = temp;
                option.ease = ui.AnimationStyle.easeFrom;
            }
        },
        _setButtonAnimationOpenValue: function(animator) {
            var i = 0,
                len = animator.length;
            var option,
                button;
            for(; i < len; i ++) {
                button = this.option.buttons[i];
                option = animator[i];
                option.begin = 0;
                option.end = 100;
                option.ease = ui.AnimationStyle.easeTo;
                option.target.css({
                    "top": button.startTop + "px",
                    "left": button.startLeft + "px"
                });
            }
        },
        _setButtonAnimationCloseValue: function(animator) {
            var i = 0,
                len = animator.length;
            var option,
                button;
            for(; i < len; i ++) {
                button = this.option.buttons[i];
                option = animator[i];
                option.begin = 100;
                option.end = 0;
                option.ease = ui.AnimationStyle.easeFrom;
            }
        },
        _caculateSize: function() {
            var buttonCount = this.option.buttons.length;
            this.deg = 360 / buttonCount;
            var radian = this.deg / 180 * Math.PI;
            var length = this.option.buttonSize;
            var temp = length / 2 / Math.tan(radian / 2);
            if(temp <= length / 2) {
                temp = length / 2 + 4;
            }
            this.centerRadius = temp + length / 2;
            this.insideRadius = temp + length;
            this.outsideRadius = Math.sqrt(this.insideRadius * this.insideRadius + (length / 2) * (length / 2));
            this.outsideRadius += 20;
            
            this.buttonSize = length;
            this.buttonPanelSize = Math.ceil(this.outsideRadius * 2);
            
            this.centerTop = this.centerLeft = this.buttonPanelSize / 2;
        },
        _setButtonPanelLocation: function() {
            var center = this.getElementCenter();
            var buttonPanelTop = Math.floor(center.top - this.buttonPanelSize / 2);
            var buttonPanelLeft = Math.floor(center.left - this.buttonPanelSize / 2);
            
            this.buttonPanel.css({
                "top": buttonPanelTop + "px",
                "left": buttonPanelLeft + "px",
                "width": this.buttonPanelSize + "px",
                "height": this.buttonPanelSize + "px"
            });
        },
        _caculatePositionByCenter: function(x, y) {
            var position = {
                left: 0,
                top: 0
            };
            position.left = x - this.buttonSize / 2;
            position.top = y - this.buttonSize / 2;
            return position;
        },
        _createButton: function(button, deg) {
            var radian,
                position,
                x,
                y,
                that = this;
            button.elem = $("<a href='javascript:void(0)' class='extend-button background-highlight' />");
            if(button.icon) {
                button.elem.append(button.icon);
            }
            if(ui.str.isNullOrEmpty(button.title)) {
                button.elem.prop("title", button.title);
            }
            button.centerStartLeft = 0;
            button.centerStartTop = 0;
            
            radian = deg / 180 * Math.PI;
            x = this.centerRadius * Math.sin(radian) + button.centerStartLeft;
            y = this.centerRadius * Math.cos(radian) + button.centerStartTop;
            
            button.centerLeft = Math.floor(this.centerLeft + x);
            button.centerTop =  Math.floor(this.centerTop - y);
            
            position = this._caculatePositionByCenter(this.centerLeft, this.centerTop);
            button.startLeft = position.left;
            button.startTop = position.top;
            
            button.elem.css({
                "width": this.buttonSize + "px",
                "height": this.buttonSize + "px",
                "line-height": this.buttonSize + "px"
            });
            this.buttonPanel.append(button.elem);
            
            this.buttonAnimator.addTarget({
                target: button.elem,
                button: button,
                that: this,
                onChange: function(val) {
                    var centerLeft = (this.button.centerLeft - this.that.centerLeft) * val / 100 + this.that.centerLeft,
                        centerTop = (this.button.centerTop - this.that.centerTop) * val / 100 + this.that.centerTop;
                    var po = this.that._caculatePositionByCenter(centerLeft, centerTop);
                    this.target.css({
                        "left": po.left + "px",
                        "top": po.top + "px"
                    });
                }
            });
            
            if($.isFunction(button.handler)) {
                button.elem.click(function(e) {
                    button.handler.call(that, button);
                });
            }
        }
    });
    
    $.fn.extendButton = function(option) {
        if (!this || this.length == 0) {
            return null;
        }
        return ui.ctrls.ExtendButton(option, this);
    };
})();