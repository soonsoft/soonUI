; (function (mp) {
    mp.isHomePage = true;
    mp.noMenu = false;

    var showClass = "menu-show",
        itemHeight = 30;
        
    var MenuBar = ui.define("ctrls.MenuBar", {
        _create: function() {
            this.isHomePage = false;
            this.noMenu = false;
            
            this.menubarWidth = 240;
            this.menubarPanel = null;
            this.pageContent = null;
            this.menuButton = null;
            
            var that = this;
            this.menuPanelAnimator = ui.animator({
                ease: ui.AnimationStyle.easeTo,
                onChange: function (val, elem) {
                    elem.css("left", val + "px");
                }
            }).addTarget({
                ease: ui.AnimationStyle.easeTo,
                onChange: function (val, elem) {
                    elem.css("left", val + "px");
                }
            }).addTarget({
                ease: ui.AnimationStyle.easeTo,
                onChange: function (val, elem) {
                    elem.css("width", val + "px");
                    mp.contentBodyWidth = val;
                    
                    that.disabledResize = true;
                    ui.fire("resize");
                    that.disabledResize = false;
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
        _init: function() {
            var that = this;
            //注册主题切换功能
            ui.themeChanged(function(e, info) {
                that.initMenuTheme(info);
            });
        },
        _setRule: function(selector, css) {
            var rule = this.getRule(selector);
            if(!rule) {
                this.addRule(selector, css);
            } else {
                rule.css(css);
            }
        },
        initMenuTheme: function(data) {
            var themeStyle = $("#GlobalThemeChangeStyle");
            if(themeStyle.length == 0) {
                return;
            }
            if(!data) {
                data = ui.theme.getCurrentThemeInfo();
            }
            if(!data) {
                return;
            }
            var color = data.Color,
                sheet = themeStyle.sheet();
            this._setRule.call(sheet, "dl.menu-list dd li.selected-menu", {
                "color": color
            });
            this._setRule.call(sheet, "dl.menu-list dt.current-menu b", {
                "background-color": color
            });
            this._setRule.call(sheet, "dl.menu-list dd.current-menu b", {
                "background-color": color
            });
            this._setRule.call(sheet, "dl.menu-list dt.selected-menu", {
                "color": color
            });
        },
        initMenuList: function() {
            var currentClass = "current-menu",
                nextdd;
            this.currentMenu = this.menubarPanel.find("dt." + currentClass);
            if (this.currentMenu.length == 0) {
                this.currentMenu = null;
            } else {
                nextdd = this.currentMenu.next();
                if (nextdd.nodeName() === "DD") {
                    this.menuUnfold(nextdd);
                }
            }
    
            this.onMenuItemClick = $.proxy(function (e) {
                var elem = $(e.target),
                    nodeName = null,
                    dd = null;
                while ((nodeName = elem.nodeName()) !== "DT") {
                    if (nodeName === "DL" || nodeName === "A") {
                        return;
                    }
                    elem = elem.parent();
                }
                var openFunc = $.proxy(function () {
                    this.currentMenu = elem;
                    this.currentMenu.addClass(currentClass);
                    var dd = this.currentMenu.next();
                    if (dd.length > 0 && dd.nodeName() === "DD") {
                        dd.addClass(currentClass);
                        this.menuUnfold(dd);
                    }
                }, this);
    
                var closeFunc = $.proxy(function () {
                    this.currentMenu.removeClass(currentClass);
                    var dd = this.currentMenu.next();
                    dd.removeClass(currentClass);
                    dd.css("display", "none");
                    if (this.currentMenu[0] != elem[0]) {
                        this.currentMenu = null;
                        openFunc();
                    } else {
                        this.currentMenu = null;
                    }
                }, this);
    
                if (this.currentMenu) {
                    dd = this.currentMenu.next();
                    if (dd.length > 0 && dd.nodeName() === "DD") {
                        this.menuFold(dd, closeFunc);
                        return;
                    } else {
                        this.currentMenu.removeClass(currentClass);
                    }
                }
                openFunc();
            }, this);
            this.menubarPanel.find("dl").click(this.onMenuItemClick);
    
            this.menuButton.click($.proxy(function (e) {
                var elem = this.menuButton;
                if (elem.hasClass(showClass)) {
                    elem.removeClass(showClass);
                    this.menubarHide();
                } else {
                    elem.addClass(showClass);
                    this.menubarShow();
                }
            }, this));
        },
        menuUnfold: function(elem, animation) {
            var maxHeight = 0,
                ul = elem.find("ul"),
                count = ul.children().length;
            if (count == 0) {
                return;
            }
            maxHeight = count * itemHeight;
    
            if (animation) {
                elem.css({
                    "display": "block",
                    "height": maxHeight + "px"
                });
                return;
            }
    
            var animator = this.menuItemAnimator,
                option = animator[0];
            animator.stop();
            elem.css("display", "block");
            option.target = elem;
            animator.duration = 300;
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
        menuFold: function(elem, endFunc) {
            var animator = this.menuItemAnimator,
                option = animator[0];
    
            animator.stop();
    
            option.target = elem;
            animator.duration = 300;
            option.begin = elem.height();
            option.end = 0;
            option.ease = ui.AnimationStyle.easeFrom;
    
            var ul = elem.find("ul"),
                count = ul.children().length,
                height = count * itemHeight;
            option = animator[1];
            option.target = ul;
            option.begin = parseFloat(option.target.css("top"), 10);
            option.end = -height;
            option.ease = ui.AnimationStyle.easeFrom;
    
            animator.onEnd = endFunc;
            return animator.start();
        },
        menubarShow: function() {
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
            option.end = this.menubarWidth + 1;
    
            option = animator[2];
            option.begin = parseInt(option.target.css("width"), 10);
            option.end = ui.core.root.clientWidth - (this.menubarWidth + 1);
    
            var that = this;
            animator.start().done(function () {
                that.hideState = false;
            });
        },
        menubarHide: function() {
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
        isShow: function() {
            return this.menuButton.hasClass(showClass);
        },
        defaultShow: function() {
            return true;  
        },
        setMenuList: function(menus) {
            var dl = this.menubarPanel.children("dl");
            dl.empty();
            if(!Array.isArray(menus) || menus.length == 0) {
                return;
            }
            var htmlBuilder = [],
                m, cm;
            var currentClass,
                funcCode = ui.url.getLocationParam("_m"),
                parentCode;
            var i, len, j;
            if(!ui.str.isNullOrEmpty(funcCode)) {
                funcCode = ui.str.base64Decode(funcCode);
                parentCode = this._parentCode(funcCode);
            }
            for(i = 0, len = menus.length; i < len; i++) {
                m = menus[i];
                if(ui.str.isNullOrEmpty(parentCode)) {
                    currentClass = m.resourceCode === funcCode ? " class='current-menu selected-menu'" : "";
                } else {
                    currentClass = m.resourceCode === parentCode ? " class='current-menu'" : "";
                }
                htmlBuilder.push("<dt", currentClass, ">");
                htmlBuilder.push("<b></b>");
                htmlBuilder.push("<i class='background-highlight'>");
                htmlBuilder.push("<img src='", this._formatSrc(m.icon), "' />");
                htmlBuilder.push("</i>");
                htmlBuilder.push("<span>", m.resourceName, "</span>");
                if(!m.children) {
                    htmlBuilder.push("<a href='", this._formatSrc(m.url, m.resourceCode), "'></a>");
                }
                htmlBuilder.push("</dt>");
                if(Array.isArray(m.children) && m.children.length > 0) {
                    htmlBuilder.push("<dd", currentClass, "><ul>");
                    for(j = 0; j < m.children.length; j++) {
                        cm = m.children[j];
                        currentClass = cm.resourceCode === funcCode ? " class='selected-menu'" : "";
                        htmlBuilder.push("<li", currentClass, ">");
                        htmlBuilder.push("<b></b>");
                        htmlBuilder.push("<span>", cm.resourceName, "</span>");
                        htmlBuilder.push("<a href='", this._formatSrc(cm.url, cm.resourceCode), "'></a>");
                        htmlBuilder.push("</li>");
                    }
                    htmlBuilder.push("</ul></dd>");
                }
            }
            dl.html(htmlBuilder.join(""));
        },
        _parentCode: function(code) {
            if(!code) {
                return null;
            }
            var index = code.lastIndexOf("_");
            if(index < 0) {
                return null;
            }
            return code.substring(0, index);
        },
        _formatSrc: function(url, code) {
            var http = /^(http|https):\/\/\w*/i,
                result;
            if(ui.str.isNullOrEmpty(url)) {
                return "javascript:void(0)";
            }
            if(url === "javascript:void(0)") {
                return url;
            }
    
            if(http.test(url)) {
                result = url;
            } else {
                result = "" + url;
            }
    
            if(!ui.str.isNullOrEmpty(code)) {
                if(result.indexOf("?") > -1) {
                    result += "&_m=" + ui.str.base64Encode(code);
                } else {
                    result += "?_m=" + ui.str.base64Encode(code);
                }
            }
            return result;
        }
    });

    var initElements = mp._initElements;
    mp._initElements = function () {
        this.menubar = MenuBar(null);
        initElements.apply(mp, arguments);
        
        this.menubar.menubarPanel = $(".navigation-panel");
        this.menubar.pageContent = $(".page-content");
        this.menubar.menuButton = $("#menuBtn");
        this.menubar.menuPanelAnimator[0].target = this.menubar.menubarPanel;
        this.menubar.menuPanelAnimator[1].target = this.menubar.pageContent;
        this.menubar.menuPanelAnimator[2].target = this.menubar.pageContent;
        if(this.menubar.defaultShow()) {
            this.menubar.menuButton.addClass(showClass);
        }
        
        if(this.menubar.noMenu) {
            this.menubar.menubarPanel.remove();
            this.menubar.menuButton.remove();
        } else {
            this.menubar.menubarPanel.css("width", this.menubar.menubarWidth + "px");
            this.menubar.initMenuList();
        }
    };
    var initContentSize = mp._initContentSize;
    mp._initContentSize = function () {
        if (this.menubar.disabledResize) {
            return;
        }
        initContentSize.apply(mp, arguments);
        if(this.menubar.noMenu) {
            return;
        }
        if(this.menubar.isShow()) {
            this.contentBodyWidth -= this.menubar.menubarWidth + 1;
            this.menubar.pageContent.css({
                "width": this.contentBodyWidth + "px",
                "left": (this.menubar.menubarWidth + 1) + "px"
            });
            this.menubar.menubarPanel.css("left", "0px");
        } else {
            this.menubar.pageContent.css({
                "width": "100%",
                "left": "0px"
            });
            this.menubar.menubarPanel.css("left", -(this.menubar.menubarWidth + 1) + "px");
        }
    };
})(masterpage);