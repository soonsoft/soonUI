; (function (mp) {
    mp.isHomePage = true;
    mp.noMenu = false;

    var showClass = "menu-show",
        currentClass = "current-menu",
        itemHeight = 30;

    var Menu = ui.define("ctrls.Menu", {
        _getOption: function () {
            return {
                //normal | modern
                style: "normal",
                urlPrefix: "",
                menubarPanel: null,
                contentContainer: null,
                menuButton: null,
                animation: true
            };
        },
        _create: function () {
            this.menubarWidth = 240;
            this.menubarNarrowWidth = 48;
            this.menubarPanel = this.option.menubarPanel;
            this.contentContainer = this.option.contentContainer;
            this.menuButton = this.option.menuButton;
            this.menuButtonBg = this.menuButton.children("b");

            this.menuStyle = this.option.style || "normal";
            this.hasAnimation = !!this.option.animation;
            if (this.hasAnimation) {
                this._initAnimators();
            }
        },
        _init: function () {
            this.menubarPanel.addClass("title-color");
            this.menubarPanel.children("dl").addClass("title-color");
            this.menubarPanel.css("width", this.menubarWidth + "px");

            if (this.menuStyle === "normal") {
                this.show = this._menuShow;
                this.hide = this._menuHide;
                this.subShow = this._submenuUnfold;
                this.subHide = this._submenuFold;
                this.resize = this._normalResize;
            } else {
                this.show = this._menuGrow;
                this.hide = this._menuNarrow;
                this.subShow = this._submenuShow;
                this.subHide = this._submenuHide;
                this.resize = this._modernResize;

                this._initSubmenuPanel();
            }
            
            if (this.defaultShow()) {
                this.menuButton.addClass(showClass);
            }
            this._initMenuList();
            /*
            var that = this;
            //注册主题切换功能
            ui.themeChanged(function (e, info) {
                that.initMenuTheme(info);
            });
            */
        },
        _initAnimators: function () {
            var that = this;
            //初始化动画
            this.menuPanelAnimator = ui.animator({
                target: this.menubarPanel,
                ease: ui.AnimationStyle.easeTo,
                onChange: function (val, elem) {
                    elem.css("left", val + "px");
                }
            }).addTarget({
                target: this.contentContainer,
                ease: ui.AnimationStyle.easeTo,
                onChange: function (val, elem) {
                    elem.css("left", val + "px");
                }
            }).addTarget({
                target: this.contentContainer,
                ease: ui.AnimationStyle.easeTo,
                onChange: function (val, elem) {
                    elem.css("width", val + "px");
                    mp.contentBodyWidth = val;

                    that._fireResize();
                }
            });
            this.menuPanelAnimator.duration = 240;

            this.menuItemAnimator = ui.animator({
                onChange: function (val, elem) {
                    elem.css("height", parseInt(val, 10) + "px");
                }
            });
            this.menuItemAnimator.addTarget({
                onChange: function (val, elem) {
                    elem.css("top", parseInt(val, 10) + "px");
                }
            });
        },
        _setRule: function (selector, css) {
            var rule = this.getRule(selector);
            if (!rule) {
                this.addRule(selector, css);
            } else {
                rule.css(css);
            }
        },
        initMenuTheme: function (theme) {
            var themeStyle = $("#GlobalThemeChangeStyle");
            if (themeStyle.length == 0) {
                return;
            }
            if (!theme) {
                theme = ui.theme.getCurrentThemeInfo();
            }
            if (!theme) {
                return;
            }
        },
        _initSubmenuPanel: function() {
            this.submenuPanel = $("<div class='submenu-panel' />");
            this.submenuPanel.css({
                "left": this.menubarNarrowWidth + "px",
                "width": this.menubarWidth + "px"
            });
            this.submenuPanel.addClass("title-color");
            this.submenuList = $("<ul class='submenu-list' />");
            this.submenuPanel.append("<b class='submenu-background'></b>");
            this.submenuPanel.append(this.submenuList);
            this.menubarPanel.prepend(this.submenuPanel);

            this.submenuAnimator = ui.animator({
                target: this.submenuPanel,
                ease: ui.AnimationStyle.easeTo,
                onChange: function (val) {
                    this.target.css("left", val);
                }
            });
            this.submenuAnimator.duration = 200;

            this.submenuListAnimator = ui.animator({
                target: this.submenuList,
                ease: ui.AnimationStyle.easeTo,
                onChange: function (val) {
                    this.target.css("left", val + "px")
                }
            });
            this.submenuListAnimator.duration = 100;
        },
        _initMenuList: function () {
            var nextdd;
            var that = this;
            this._onMenuItemClick = this._onMenuItemClickNormal;

            //展开选中的子菜单
            this.currentMenu = this.menubarPanel.find("dt." + currentClass);
            if (this.currentMenu.length == 0) {
                this.currentMenu = null;
            }
            if (this._isCloseStatus()) {
                this.menuButton.removeClass(showClass);
                this.hide(false);
            } else if(this.currentMenu) {
                nextdd = this.currentMenu.next();
                if (nextdd.nodeName() === "DD") {
                    this.subShow(nextdd, false);
                }
            }

            //菜单点击事件
            this.menubarPanel.find("dl").click(function (e) {
                that._onMenuItemClick(e);
            });
            //菜单汉堡按钮点击事件
            this.menuButton.click(function (e) {
                var elem = that.menuButton;
                if (elem.hasClass(showClass)) {
                    elem.removeClass(showClass);
                    that.hide(that.hasAnimation);
                } else {
                    elem.addClass(showClass);
                    that.show(that.hasAnimation);
                }
            });
        },
        _onMenuItemClickNormal: function (e) {
            e.stopPropagation();
            var elem = $(e.target),
                nodeName;
            while ((nodeName = elem.nodeName()) !== "DT") {
                if (nodeName === "DL" || nodeName === "A") {
                    return;
                }
                elem = elem.parent();
            }
            var openFunc = $.proxy(function () {
                this.currentMenu = elem;
                this.currentMenu.addHighlight(currentClass, "background");
                var subElem = this._getSubmenuElement();
                if (subElem) {
                    subElem.addHighlight(currentClass, "background");
                    this.subShow(subElem, this.hasAnimation);
                }
            }, this);

            var closeFunc = $.proxy(function () {
                this.currentMenu.removeHighlight(currentClass, "background");
                var subElem = this._getSubmenuElement();
                subElem.removeHighlight(currentClass, "background");
                subElem.css("display", "none");
                if (this.currentMenu[0] != elem[0]) {
                    this.currentMenu = null;
                    openFunc();
                } else {
                    this.currentMenu = null;
                }
            }, this);

            var subElem = null;
            if (this.currentMenu) {
                subElem = this._getSubmenuElement();
                if (subElem) {
                    this.subHide(subElem, this.hasAnimation, closeFunc);
                    return;
                } else {
                    this.currentMenu.removeHighlight(currentClass, "background");
                }
            }
            openFunc();
        },
        _onMenuItemClickModern: function (e) {
            e.stopPropagation();
            var elem = $(e.target),
                nodeName;
            while ((nodeName = elem.nodeName()) !== "DT") {
                if (nodeName === "DL" || nodeName === "A") {
                    return;
                }
                elem = elem.parent();
            }

            var subElem = elem.next();
            if(subElem.length == 0 || subElem.nodeName() !== "DD") {
                return;
            }

            var openFunc = $.proxy(function () {
                var submenuPanel = null;
                this.currentMenu = elem;
                this.currentMenu.addHighlight(currentClass, "background");
                submenuPanel = this._getSubmenuElement();
                submenuPanel.addHighlight(currentClass, "background");
                this.subShow(submenuPanel, this.hasAnimation);
            }, this);

            var closeFunc = $.proxy(function () {
                this.currentMenu.removeHighlight(currentClass, "background");
                var subElem = this._getSubmenuElement();
                subElem.removeHighlight(currentClass, "background");
                subElem.css("display", "none");
                this.currentMenu = null;
            }, this);

            if (this.currentMenu) {
                if (this.currentMenu[0] == elem[0]) {
                    this.subHide(this._getSubmenuElement(), this.hasAnimation, closeFunc);
                } else {
                    this.currentMenu.removeHighlight(currentClass, "background");
                    this.currentMenu = null;
                    openFunc();
                }
            } else {
                openFunc();
            }
        },
        _getSubmenuElement: function (isNarrow) {
            var subElement = null;
            if (ui.core.type(isNarrow) !== "boolean") {
                isNarrow = !this.isShow();
            }
            if (this.menuStyle === "modern" && isNarrow) {
                subElement = this.submenuPanel;
            } else {
                subElement = this.currentMenu.next();
                if(subElement.lenght == 0 || subElement.nodeName() !== "DD") {
                    subElement = null;
                }
            }
            return subElement;
        },
        _fireResize: function() {
            mp.disabledResize = true;
            ui.fire("resize");
            mp.disabledResize = false;
        },
        // normal
        _menuShow: function (animation) {
            if (animation === false) {
                this._normalResize();
                this._fireResize();
                return;
            }

            var animator = this.menuPanelAnimator,
                option;
            animator.stop();

            option = animator[0];
            var left = parseInt(option.target.css("left"), 10);
            if (left >= 0) {
                option.target.css("left", "0px");
                return;
            }
            option.begin = left;
            option.end = 0;

            option = animator[1];
            option.begin = parseInt(option.target.css("left"), 10);
            option.end = this.menubarWidth;

            option = animator[2];
            option.begin = parseInt(option.target.css("width"), 10);
            option.end = ui.core.root.clientWidth - this.menubarWidth;

            var that = this;
            animator.start().done(function () {
                that.hideState = false;
            });
        },
        _menuHide: function (animation) {
            if (animation === false) {
                this._normalResize();
                this._fireResize();
                return;
            }

            var animator = this.menuPanelAnimator,
                option;
            animator.stop();

            option = animator[0];
            var left = parseInt(option.target.css("left"), 10);
            if (left <= -this.menubarWidth) {
                option.target.css("left", -this.menubarWidth + "px");
                return;
            }
            animator[0].begin = left;
            animator[0].end = -this.menubarWidth;

            option = animator[1];
            option.begin = parseInt(option.target.css("left"), 10);
            option.end = 0;

            option = animator[2];
            option.begin = parseInt(option.target.css("width"), 10);
            option.end = ui.core.root.clientWidth;

            var that = this;
            animator.start().done(function () {
                that.hideState = true;
            });
        },
        _submenuUnfold: function (elem, animation) {
            var maxHeight = 0,
                ul = elem.children("ul"),
                count = ul.children().length;
            if (count == 0) {
                return;
            }
            maxHeight = count * itemHeight;

            elem.prev().find(".allow")
                .removeClass("fa-angle-down")
                .addClass("fa-angle-up");
            if (animation === false) {
                elem.css({
                    "display": "block",
                    "height": maxHeight + "px"
                });
                ul.css("top", "0px");
                return;
            }

            var animator = this.menuItemAnimator,
                option = animator[0];
            animator.stop();
            elem.css("display", "block");
            option.target = elem;
            animator.duration = 360;
            option.begin = elem.height();
            option.end = maxHeight;
            option.ease = ui.AnimationStyle.easeTo;

            var beginVal = option.end - option.begin;
            option = animator[1];
            option.target = ul;
            option.target.css("top", -beginVal + "px");
            option.begin = -beginVal;
            option.end = 0;
            option.ease = ui.AnimationStyle.easeTo;

            animator.onEnd = null;
            return animator.start();
        },
        _submenuFold: function (elem, animation, endFunc) {
            elem.prev().find(".allow")
                .removeClass("fa-angle-up")
                .addClass("fa-angle-down");

            var ul = elem.children("ul"),
               subMenusHeight = ul.children().length * itemHeight;
            if ($.isFunction(animation)) {
                endFunc = animation;
                animation = undefined;
            }
            if (animation === false) {
                elem.css({
                    "display": "none",
                    "height": "0px"
                });
                ul.css("top", -subMenusHeight);
                if ($.isFunction(endFunc)) {
                    endFunc();
                }
                return;
            }

            var animator = this.menuItemAnimator,
                option = animator[0];
            animator.stop();

            option.target = elem;
            animator.duration = 360;
            option.begin = elem.height();
            option.end = 0;
            option.ease = ui.AnimationStyle.easeFrom;

            option = animator[1];
            option.target = ul;
            option.begin = parseFloat(option.target.css("top"), 10);
            option.end = -subMenusHeight;
            option.ease = ui.AnimationStyle.easeFrom;

            animator.onEnd = endFunc;
            return animator.start();
        },
        _normalResize: function (contentWidth, contentHeight) {
            if (this.isShow()) {
                //显示菜单
                mp.contentBodyWidth -= this.menubarWidth;
                this.contentContainer.css({
                    "width": mp.contentBodyWidth + "px",
                    "left": this.menubarWidth + "px"
                });
                this.menubarPanel.css("left", "0px");
            } else {
                //隐藏菜单
                mp.contentBodyWidth += this.menubarWidth;
                this.contentContainer.css({
                    "width": "100%",
                    "left": "0px"
                });
                this.menubarPanel.css({
                    "left": -this.menubarWidth + "px"
                });
            }
        },
        // modern
        _menuGrow: function (animation) {
            var subElem = null,
                that = this;
            if (this.currentMenu) {
                //展开选中菜单的子菜单
                this.submenuPanel.removeHighlight(currentClass, "background");
                this.submenuPanel.css("display", "none");
                this.submenuList.html("");
                subElem = this._getSubmenuElement(false);
                if (subElem) {
                    subElem.addHighlight(currentClass, "background");
                    this._submenuUnfold(subElem, false);
                }
            }

            this._onMenuItemClick = this._onMenuItemClickNormal;
            this._updateStatusToSrc(false);
            this._modernResize();
            this._fireResize();
        },
        _menuNarrow: function (animation) {
            var subElem = null,
                callback = null,
                that = this;
            if (this.currentMenu) {
                //折叠已经展开的子菜单
                subElem = this._getSubmenuElement(false);
                if (subElem) {
                    subElemHeight = this
                    this._submenuFold(subElem, false, function () {
                        subElem.removeHighlight(currentClass, "background");
                        subElem.css("display", "none");
                    });
                }
                this.currentMenu.removeHighlight(currentClass, "background");
                this.currentMenu = null;
            }

            this._onMenuItemClick = this._onMenuItemClickModern;
            this._updateStatusToSrc(true);
            this._modernResize();
            this._fireResize();
        },
        _setSubmenuList: function() {
            var dd = this._getSubmenuElement(false);
            if(!dd) {
                return;
            }
            var htmlBuilder = [];
            var i = 0,
                list = dd.children().children(),
                len = list.length;
            for (; i < len; i++) {
                htmlBuilder.push(list[i].outerHTML);
            }
            this.submenuList.html(htmlBuilder.join(""));
        },
        _submenuShow: function (elem, animation) {
            var animator = null,
                option = null,
                submenuListShowFunc = null;
            if (this.isShow()) {
                this._submenuUnfold.apply(this, arguments);
            } else {
                if (animation === false) {
                    this._setSubmenuList();
                    this.submenuPanel.css("display", "block");
                    return;
                }
                animator = this.submenuAnimator;
                if(animator.isStarted) {
                    return;
                }
                animator.onEnd = null;
                submenuListShowFunc = $.proxy(function () {
                    this.submenuList.css("display", "none");
                    this._setSubmenuList();
                    var that = this;
                    setTimeout(function () {
                        that.submenuList.css({
                            "display": "block",
                            "left": -that.menubarWidth + "px"
                        });
                        var option = that.submenuListAnimator[0];
                        option.begin = -that.menubarWidth;
                        option.end = 0;
                        that.submenuListAnimator.start();
                    });

                }, this);
                if (elem.css("display") === "none") {
                    option = animator[0];
                    option.begin = -(this.menubarWidth - this.menubarNarrowWidth) + this.menubarNarrowWidth;
                    option.end = this.menubarNarrowWidth;

                    animator.onEnd = submenuListShowFunc;
                    option.target.css("display", "block");
                    animator.start();
                } else {
                    submenuListShowFunc();
                }
            }
        },
        _submenuHide: function (elem, animation, endFunc) {
            if (this.isShow()) {
                this._submenuFold.apply(this, arguments);
            } else {
                if (animation === false) {
                    this.submenuPanel.css("display", "none");
                    endFunc();
                    this.submenuList.html("");
                    return;
                }

                animator = this.submenuAnimator;
                if (animator.isStarted) {
                    return;
                }
                option = animator[0];
                option.begin = this.menubarNarrowWidth;
                option.end = -(this.menubarWidth - this.menubarNarrowWidth);

                animator.onEnd = endFunc;
                var that = this;
                animator.start().done(function () {
                    that.submenuList.html("");
                });
            }
        },
        _modernResize: function (contentWidth, contentHeight) {
            if (this.isShow()) {
                //展开菜单
                if (contentWidth) {
                    mp.contentBodyWidth = contentWidth - this.menubarWidth;
                } else {
                    mp.contentBodyWidth -= (this.menubarWidth - this.menubarNarrowWidth);
                }
                this.contentContainer.css({
                    "width": mp.contentBodyWidth + "px",
                    "left": this.menubarWidth + "px"
                });
                this.menubarPanel.removeClass("navigation-panel-narrow");
                this.menubarPanel.css("width", this.menubarWidth + "px");
            } else {
                //收缩菜单
                if (contentWidth) {
                    mp.contentBodyWidth = contentWidth - this.menubarNarrowWidth;
                } else {
                    mp.contentBodyWidth += (this.menubarWidth - this.menubarNarrowWidth);
                }
                this.contentContainer.css({
                    "width": mp.contentBodyWidth + "px",
                    "left": this.menubarNarrowWidth + "px"
                });
                this.menubarPanel.addClass("navigation-panel-narrow");
                this.menubarPanel.css("width", this.menubarNarrowWidth + "px");
            }
        },
        isShow: function () {
            return this.menuButton.hasClass(showClass);
        },
        defaultShow: function () {
            return true;
        },
        setMenuList: function (menus) {
            var dl = this.menubarPanel.children("dl");
            dl.empty();
            if (!Array.isArray(menus) || menus.length == 0) {
                return;
            }
            var htmlBuilder = [],
                m, cm;
            var currClass,
                funcCode = ui.url.getLocationParam("_m"),
                parentCode;
            var i, len, j;
            if (!ui.str.isNullOrEmpty(funcCode)) {
                funcCode = ui.str.base64Decode(funcCode);
                parentCode = this._parentCode(funcCode);
            }
            for (i = 0, len = menus.length; i < len; i++) {
                m = menus[i];
                if (ui.str.isNullOrEmpty(parentCode)) {
                    currClass = m.resourceCode === funcCode ? " class='current-menu background-highlight selected-menu'" : "";
                } else {
                    currClass = m.resourceCode === parentCode ? " class='current-menu background-highlight'" : "";
                }
                htmlBuilder.push("<dt", currClass, ">");
                htmlBuilder.push("<b class='menu-item-background'><b class='menu-item-color'></b></b>");
                htmlBuilder.push("<u class='menu-item-container'>");
                htmlBuilder.push("<i class='icon'>");
                htmlBuilder.push("<img src='", (m.icon ? this.option.urlPrefix + m.icon : ""), "' />");
                htmlBuilder.push("</i>");
                htmlBuilder.push("<span>", m.resourceName, "</span>");
                if (!m.children) {
                    htmlBuilder.push("<a href='", this._addMenuCodeToSrc(m.url, m.resourceCode), "'></a>");
                } else {
                    htmlBuilder.push("<i class='allow fa fa-angle-down'></i>");
                }
                htmlBuilder.push("</u>");

                htmlBuilder.push("</dt>");
                if (Array.isArray(m.children) && m.children.length > 0) {
                    htmlBuilder.push("<dd", currClass, "><ul>");
                    for (j = 0; j < m.children.length; j++) {
                        cm = m.children[j];
                        currClass = cm.resourceCode === funcCode ? " class='selected-menu'" : "";
                        htmlBuilder.push("<li", currClass, ">");
                        htmlBuilder.push("<b class='menu-item-background'><b class='menu-item-color'></b></b>");
                        htmlBuilder.push("<u class='menu-item-container'>");
                        htmlBuilder.push("<span>", cm.resourceName, "</span>");
                        htmlBuilder.push("<a href='", this._addMenuCodeToSrc(cm.url, cm.resourceCode), "'></a>");
                        htmlBuilder.push("</u>");
                        htmlBuilder.push("</li>");
                    }
                    htmlBuilder.push("</ul></dd>");
                }
            }
            dl.html(htmlBuilder.join(""));
        },
        _parentCode: function (code) {
            if (!code) {
                return null;
            }
            var index = code.lastIndexOf("_");
            if (index < 0) {
                return null;
            }
            return code.substring(0, index);
        },
        _getUrl: function(url) {
            var http = /^(http|https):\/\/\w*/i,
                result;
            if (ui.str.isNullOrEmpty(url)) {
                return "";
            }
            if (url.indexOf("javascript:") == 0) {
                return url;
            }

            if (http.test(url)) {
                result = url;
            } else {
                result = "" + url;
            }
            return this.option.urlPrefix + result;
        },
        _addMenuCodeToSrc: function (url, code) {
            var result = this._getUrl(url);
            if (result.indexOf("javascript:") == 0) {
                return result;
            }
            if (ui.str.isNullOrEmpty(result)) {
                return "javascript:void(0)";
            }
            if (!ui.str.isNullOrEmpty(code)) {
                if (result.indexOf("?") > -1) {
                    result += "&_m=" + ui.str.base64Encode(code);
                } else {
                    result += "?_m=" + ui.str.base64Encode(code);
                }
            }
            return result;
        },
        _updateStatusToSrc: function (isAdd) {
            var items = this.menubarPanel.children().children();
            var i = 0,
                len = items.length,
                item;
            var j,
                subItems,
                subNodeName = "DD";
            var menuStatusFunc;
            if (isAdd) {
                menuStatusFunc = this._addMenuStatus;
            } else {
                menuStatusFunc = this._removeMenuStatus;
            }
            for (; i < len; i++) {
                item = $(items[i]);
                if (item.next().nodeName() === subNodeName) {
                    i++;
                    subItems = item.next().children().children();
                    for (j = 0; j < subItems.length; j++) {
                        menuStatusFunc.call(this,
                            $(subItems[j]).children(".menu-item-container").children("a"));
                    }
                } else {
                    menuStatusFunc.call(this,
                        item.children(".menu-item-container").children("a"));
                }
            }
        },
        _addMenuStatus: function (anchor) {
            var link = this._getUrl(anchor.attr("href"));
            if (link.indexOf("javascript:") == 0) {
                return;
            }
            var index = link.indexOf("?");
            if (index == -1) {
                link += "?_s=close";
            } else {
                link += "&_s=close";
            }
            anchor.attr("href", link);
        },
        _removeMenuStatus: function (anchor) {
            var link = this._getUrl(anchor.attr("href"));
            if (link.indexOf("javascript:") == 0) {
                return;
            }
            var linkArr = link.split("?");
            if (linkArr.length == 1) {
                return;
            }
            var params = linkArr[1].split("&");
            var p;
            for (var i = 0, len = params.length; i < len; i++) {
                p = params[i];
                if (p && p.indexOf("_s=") == 0) {
                    params.splice(i, 1);
                    break;
                }
            }
            anchor.attr("href", linkArr[0] + "?" + params.join("&"));
        },
        _isCloseStatus: function () {
            var status = ui.url.getLocationParam("_s");
            return status === "close";
        }
    });

    var initElements = mp._initElements;
    mp._initElements = function () {
        initElements.apply(mp, arguments);
        var menuOption = {
            //animation: false,
            style: "modern",
            menubarPanel: $(".navigation-panel"),
            contentContainer: $(".content-container"),
            menuButton: $("#menuBtn")
        };
        if (this.noMenu) {
            menuOption.menubarPanel.remove();
            menuOption.menuButton.remove();
        } else {
            this.menubar = Menu(menuOption);
        }
    };
    var initContentSize = mp._initContentSize;
    mp._initContentSize = function () {
        if (this.disabledResize) {
            return;
        }
        initContentSize.apply(mp, arguments);
        if (this.noMenu) {
            $(".content-container").css({
                "width": "100%",
                "height": "100%"
            });
            return;
        }
        this.menubar.resize(mp.contentBodyWidth, mp.contentBodyHeight);
    };
})(masterpage);