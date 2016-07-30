; (function (mp) {
    mp.isHomePage = true;
    mp.noMenu = false;

    var showClass = "menu-show",
        itemHeight = 30,
        isInitElements = false;

    var setRule = function(selector, css) {
        var rule = this.getRule(selector);
        if(!rule) {
            this.addRule(selector, css);
        } else {
            rule.css(css);
        }
    };

    var initElements = mp._initElements;
    mp._initElements = function () {
        initElements.apply(mp, arguments);
        var that = this;

        this.navigatorWidth = 200;
        this.navigator = $(".navigation-panel");
        this.pageContent = $(".page-content");
        this.menuIcon = $("#menuBtn").addClass(showClass);

        this.menuPanelAnimator = ui.animator(this.navigator, {
            ease: ui.AnimationStyle.easeTo,
            onChange: function (val, elem) {
                elem.css("left", val + "px");
            }
        }).addTarget({
            target: this.pageContent,
            ease: ui.AnimationStyle.easeTo,
            onChange: function (val, elem) {
                elem.css("left", val + "px");
            }
        }).addTarget({
            target: this.pageContent,
            ease: ui.AnimationStyle.easeTo,
            onChange: function (val, elem) {
                elem.css("width", val + "px");

                that.contentBodyWidth = val;
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

        ui.themeChanged(function(e, info) {
            mp.initMenuTheme(info);
        });
        if (!this.noMenu) {
            this.initMenuList();
        } else {
            this.menuIcon.css("display", "none");
            this.navigator.css("display", "none");
            this.pageContent.css({
                "left": "0px",
                "width": "100%"
            });
        }
    };
    mp.initMenuTheme = function(data) {
        var themeStyle = $("#GlobalThemeChangeStyle");
        if(themeStyle.length == 0) {
            return;
        }
        data = data || ui.theme.getCurrentThemeInfo();
        var color = data.Color,
            sheet = themeStyle.sheet();
        setRule.call(sheet, "dl.menu-list dd li.selected-menu", {
            "color": color
        });
        setRule.call(sheet, "dl.menu-list dt.current-menu b", {
            "background-color": color
        });
        setRule.call(sheet, "dl.menu-list dd.current-menu b", {
            "background-color": color
        });
        setRule.call(sheet, "dl.menu-list dt.selected-menu", {
            "color": color
        });
        setRule.call(sheet, "dl.menu-list dt i", {
            "background-image": "url(/shjs/content/icons/" + data.Id + "_32.png)"
        });
    };

    var initContentSize = mp._initContentSize;
    mp._initContentSize = function () {
        if (this.disabledResize) {
            return;
        }
        
        initContentSize.apply(mp, arguments);
        var left = this.navigatorWidth + 1;
        this.contentBodyWidth -= left;
        this.pageContent.css({
            "width": this.contentBodyWidth + "px"
        });
        if (this.hideState !== false) {
            this.pageContent.css("left", left + "px");
            this.navigator.css({
                "width": this.navigatorWidth + "px",
                "left": "0px"
            });
            this.hideState = false;
        }
    };
    mp.initMenuList = function() {
        var currentClass = "current-menu",
            nextdd;
        this.currentMenu = this.navigator.find("dt." + currentClass);
        if (this.currentMenu.length == 0) {
            this.currentMenu = null;
        } else {
            nextdd = this.currentMenu.next();
            if (nextdd.nodeName() === "DD") {
                this.menuOpen(nextdd);
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
                    this.menuOpen(dd);
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
                    this.menuClose(dd, closeFunc);
                    return;
                } else {
                    this.currentMenu.removeClass(currentClass);
                }
            }
            openFunc();
        }, this);
        this.navigator.find("dl").click(this.onMenuItemClick);

        this.menuIcon.click($.proxy(function (e) {
            var elem = this.menuIcon;
            if (elem.hasClass(showClass)) {
                elem.removeClass(showClass);
                this.navigatorHide();
            } else {
                elem.addClass(showClass);
                this.navigatorShow();
            }
        }, this));
    };
    mp.menuOpen = function(elem, animation) {
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
    };
    mp.menuClose = function(elem, endFunc) {
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
    };
    mp.navigatorShow = function() {
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
        option.end = this.navigatorWidth + 1;

        option = animator[2];
        option.begin = parseInt(option.target.css("width"), 10);
        option.end = ui.core.root.clientWidth - (this.navigatorWidth + 1);

        var that = this;
        animator.start().done(function () {
            that.hideState = false;
        });
    };
    mp.navigatorHide = function() {
        var animator = this.menuPanelAnimator,
            option;
        animator.stop();

        option = animator[0];
        var left = parseInt(option.target.css("left"), 10);
        if (left <= -this.navigatorWidth) {
            option.target.css("left", -this.navigatorWidth + "px");
            return;
        }
        animator[0].begin = left;
        animator[0].end = -this.navigatorWidth;

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
    };
})(masterpage);