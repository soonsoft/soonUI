; (function () {
    var borderColor = ui.theme.highlight.border,
        fontColor = ui.theme.highlight.font;
    
    /// classes
    var currentClass = "tab-button-selection";

    /// events
    var changing = "changing",
        changed = "changed";

    var ctrl = ui.define("ctrls.TabPanel", {
        _getOption: function () {
            return {
                tabPanelId: "",
                bodyPanelId: "",
                //vertical | horizontal
                direction: "horizontal",
                duration: 800
            };
        },
        _getEvents: function () {
            return [changing, changed];
        },
        _create: function () {
            this.tabPanel = ui.getJQueryElement(this.option.tabPanelId);
            this.bodyPanel = ui.getJQueryElement(this.option.bodyPanelId);

            this.animator = ui.animator(this.bodyPanel, {
                ease: ui.AnimationStyle.easeFromTo
            });
            if(ui.core.type(this.option.duration) === "number") {
                this.animator.duration = this.option.duration;
            } else {
                this.animator.duration = 800;
            }

            this.bodies = this.option.tabBodies;
            this.direction = this.option.direction || "horizontal";
            this.width;
        },
        _init: function () {
            this.currentTab = null;
            
            if (this.direction === "horizontal") {
                this.animator[0].onChange = $.proxy(this.horizontalScroll, this);
                this.bodyShow = this.horizontalShow;
            } else {
                this.animator[0].onChange = $.proxy(this.verticalScroll, this);
                this.bodyShow = this.verticalShow;
            }

            if (!this.bodies) {
                this.bodies = this.bodyPanel.children(".tab-body");
            } else {
                if(!this.bodyPanel) {
                    this.bodyPanel = this.bodies.parent();
                }
            }
            if(this.tabPanel) {
                this._initTabs();
            }
            this._initBodies();
        },
        _initTabs: function () {
            this.tabs = this.tabPanel.find(".tab-button");
            this.tabs.addClass("font-highlight-hover");
            var tagName = this.tabs.nodeName();
            this.tabPanel.click($.proxy(function (e) {
                var curr = $(e.target),
                    nodeName;
                while ((nodeName = curr.nodeName()) !== tagName) {
                    if(curr[0] === this.tabPanel[0]) {
                        return;
                    }
                    curr = curr.parent();
                }
                this._setCurrent(curr);
            }, this));
        },
        _initBodies: function () {
            this.setBodiesLocation();
        },
        setBodiesLocation: function (width, height) {
            if (!$.isNumeric(width)) {
                width = this.bodyPanel.width();
            }
            if (!$.isNumeric(height)) {
                height = this.bodyPanel.height();
            }
            this.bodyWidth = width;
            this.bodyHeight = height;
            var val = 0, i, elem;
            if (this.direction === "horizontal") {
                for (i = 0; i < this.bodies.length; i++) {
                    elem = $(this.bodies[i]);
                    elem.css("left", val + "px");
                    width = parseInt(elem.css("width"), 10) || 0;
                    val += width;
                }
            } else {
                for (i = 0; i < this.bodies.length; i++) {
                    elem = $(this.bodies[i]);
                    elem.css("top", val + "px");
                    height = parseInt(elem.css("height"), 10) || 0;
                    val += height;
                }
            }
        },
        restore: function(animation) {
            var index;
            if(this.currentTab) {
                index = this.getSelectedIndex(this.currentTab);
                if(animation === false) {
                    this.bodySet(index);
                } else {
                    this.bodyShow(index);
                }
            }
        },
        _setCurrent: function (curr, index, animation) {
            if (this.currentTab) {
                if(this.currentTab[0] === curr[0]) {
                    return;
                }
                this.currentTab.removeClass(currentClass);
                if(this.tabs) {
                    this.currentTab.removeClass(borderColor)
                        .removeClass(fontColor);
                }
                this.currentTab = null;
            }
            if(ui.core.isJQueryObject(curr)) {
                curr.addClass(currentClass);
                if(this.tabs) {
                    curr.addClass(borderColor)
                        .addClass(fontColor);
                }
            }
            this.currentTab = curr;

            if (ui.core.type(index) !== "number") {
                index = this.getSelectedIndex(curr);
            }
            //事件调用
            this.onChanging(index);
            if (animation === false) {
                this.bodySet(index);
                this.fire(changed, index);
            } else {
                this.animator.onEnd = this.onChanged(index);
                this.bodyShow(index);
            }
        },
        setIndex: function (index, animation) {
            var tabs = this.tabs || this.bodies;
            if (index >= 0 && index < tabs.length) {
                this._setCurrent($(tabs[index]), index, animation);
            }
            return this;
        },
        getSelectedIndex: function (curr) {
            var tabs = this.tabs || this.bodies;
            curr = curr || this.currentTab;
            if(tabs && curr) {
                for (var i = 0; i < tabs.length; i++) {
                    if (tabs[i] === curr[0])
                        return i;
                }
            }
            return 0;
        },
        horizontalScroll: function (val) {
            this.bodyPanel.scrollLeft(val);
        },
        horizontalShow: function (index) {
            this.animator.stop();
            var option = this.animator[0];
            option.begin = this.bodyPanel.scrollLeft();
            option.end = index * this.bodyWidth;
            return this.animator.start();
        },
        verticalScroll: function (val) {
            this.bodyPanel.scrollTop(val);
        },
        verticalShow: function (index) {
            this.animator.stop();
            var option = this.animator[0];
            option.begin = this.bodyPanel.scrollTop();
            option.end = index * this.bodyHeight;
            return this.animator.start();
        },
        bodyShow: function () { },
        bodySet: function(index) {
            if (this.direction === "horizontal") {
                this.bodyPanel.scrollLeft(this.bodyWidth * index);
            } else {
                this.bodyPanel.scrollTop(this.bodyHeight * index);
            }
        },
        setBodyHeight: function (height) {
            if ($.isNumeric(height)) {
                var heightStyle = height + "px";
                this.bodyPanel.css("height", heightStyle);
                this.bodies.css("height", heightStyle);
            }
        },
        onChanging: function (index) {
            this.fire(changing, index);
        },
        onChanged: function (index) {
            var that = this,
                result;
            if (this.eventTarget.hasEvent(changed)) {
                result = function () {
                    that.fire(changed, index);
                };
            } else {
                result = false;
            }
            return result;
        }
    });

    var TabManager = function () {
        this.tabTools = [];
        this.tabLoadStates = [];
        this.tabChanging = function (e, index) {
            this.showTools(index);
        };
        this.tabChanged = ui.core.noop;
    };
    TabManager.prototype = {
        addTools: function() {
            var i, len;
            var elem, id, j;
            for (i = 0, len = arguments.length; i < len; i++) {
                id = arguments[i];
                if (ui.core.type(id) === "string") {
                    elem = $("#" + arguments[i]);
                    if (elem.length == 0) {
                        elem = undefined;
                    }
                } else if (Array.isArray(id)) {
                    elem = [];
                    for (j = 0; j < id.length; j++) {
                        elem.push($("#" + id[j]));
                        if (elem[elem.length - 1].length == 0) {
                            elem.pop();
                        }
                    }
                    if (elem.length == 1) {
                        elem = elem[0];
                    }
                }
                this.tabTools.push(elem);
            }
        },
        showTools: function(index) {
            var i, len, j;
            var elem;
            for(i = 0, len = this.tabTools.length; i < len; i++) {
                elem = this.tabTools[i];
                if(!elem) {
                    continue;
                }
                if (i === index) {
                    if (Array.isArray(elem)) {
                        for (j = 0; j < elem.length; j++) {
                            elem[j].css("display", "block");
                        }
                    } else {
                        elem.css("display", "block");
                    }
                } else {
                    if (Array.isArray(elem)) {
                        for (j = 0; j < elem.length; j++) {
                            elem[j].css("display", "none");
                        }
                    } else {
                        elem.css("display", "none");
                    }
                }
            }
        },
        tryCallLoadFunc: function(index, func, caller) {
            if(!$.isFunction(func)) {
                return;
            }
            var args = [];
            var i = 3, len = arguments.length;
            for(; i < len; i++) {
                args.push(arguments[i]);
            }
            if(!this.tabLoadStates[index]) {
                func.apply(caller, args);
                this.tabLoadStates[index] = true;
            }
        },
        resetAt: function(index) {
            if(index < 0 || index >= this.tabLoadStates.length) {
                return;
            }
            this.tabLoadStates[index] = false;
        },
        reset: function() {
            var i, len;
            for(i = 0, len = this.tabLoadStates.length; i < len; i++) {
                this.tabLoadStates[i] = false;
            }
        }
    };

    ui.tab = {
        createTabManager: function (tabChangingImpl, tabChangedImpl) {
            if (!tabChangedImpl) {
                tabChangedImpl = tabChangingImpl;
                tabChangingImpl = null;
            }
            if (!$.isFunction(tabChangedImpl)) {
                throw new Error("loadDataFunc方法必须实现！");
            }
            var tm = new TabManager();
            if ($.isFunction(tabChangingImpl)) {
                tm.tabChanging = tabChangingImpl;
            }
            tm.tabChanged = tabChangedImpl;
            return tm;
        },
        createTabs: function (option) {
            return ctrl(option);
        },
        createViews: function(option) {
            if(!option) {
                option = {};
            }
            if(ui.core.type(option.duration) !== "number") {
                option.duration = 500;
            }
            var tab = ctrl(option);
            return tab;
        }
    };
})();