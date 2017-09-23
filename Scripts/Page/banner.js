var isTouchAvailable = "ontouchstart" in window;

function onBannerContianerTouchStart(e) {
    if(this.status === "changing" || this.isTouchBegan || this.touchSlideAnimationStart) {
        return;
    }

    this.stop();
    this.isTouchBegan = true;

    this.currentX = 0;
    this.x = 0;
}
function onBannerContianerTouchMove(e) {
    var touch,
        value,
        that;
    if(!this.isTouchBegan || e.touches.length === 0) {
        return;
    }

    touch = e.touches[0];
    value = touch.pageX - this.currentX;
    this.x = value;
    this.currentX = touch.pageX;

    setTimeout(function() {
        if(that.touchSlideAnimationStart) {
            return;
        }
        that.slideBanner(value);
    }, 16);
}
function onBannerContianerTouchEnd(e) {
    if(!this.isTouchBegan) {
        return;
    }
    this.isTouchBegan = false;
    this.slideAnimation(this.x, function() {
        this.play();
    });
}

function Banner(container) {
    if(this instanceof Banner) {
        this.initialize(container);
    } else {
        return new Banner(container);
    }
}
Banner.prototype = {
    constructor: Banner,
    initialize: function(container) {
        var that = this,
            minInfo;
        this.status = "stop";
        this.index = 0;
        this.interval = 20000;

        this.container = container;
        this.banner = this.container.children(".banner");
        this.items = [];
        this.banner.children(".banner-item").get().forEach(function(item, i) {
            var bannerItem = $(item);
            that.items.push(bannerItem);
            if(i === 0) {
                bannerItem.addClass("banner-show");
            } else {
                bannerItem.css("display", "none");
            }
        });
        minInfo = this.container.next();
        this.minItems = [];
        if(minInfo.length > 0 && minInfo.hasClass("banner-info")) {
            minInfo.children(".min-info").children().get().forEach(function (item, i) {
                that.minItems.push($(item));
            });
        }

        this._initPreviousNext();
        this._initIndicator();
        if(this.isTouchAvailable()) {
            this._initGesture();
        }
    },
    _initPreviousNext: function() {
        this.prev = $("<a class='banner-prev' href='javascript:void(0)'><i class='fa fa-angle-left'></i></a>");
        this.next = $("<a class='banner-next' href='javascript:void(0)'><i class='fa fa-angle-right'></i></a>");

        this.prev.click($.proxy(function () {
            if(this.status === "changing") {
                return;
            }
            this.stop();
            this._prev();
        }, this));
        this.next.click($.proxy(function () {
            if(this.status === "changing") {
                return;
            }
            this.stop();
            this._next();
        }, this));

        this.container
                .append(this.prev)
                .append(this.next);
    },
    _initIndicator: function() {
        var i, len,
            indicatorPanel;
        this.indicators = [];
        for(i = 0, len = this.items.length; i < len; i++) {
            this.indicators.push(
                $("<a class='indicator' href='javascript:void(0)'></a>")
                    .attr("data-index", i));
        }

        this.indicators[this.index].addClass("indicator-selected");
        indicatorPanel = $("<div class='indicator-panel'></div>");
        indicatorPanel.append(this.indicators);
        indicatorPanel.click($.proxy(function(e) {
            var elem = $(e.target),
                index;
            if(!elem.hasClass("indicator") || elem.hasClass("indicator-selected")) {
                return;
            }
            if(this.status === "changing") {
                return;
            }
            index = parseInt(elem.attr("data-index"), 10);
            if(!isNaN(index)) {
                this.stop();
                this._change(index);
            }
        }, this));
        this.container.append(indicatorPanel);
    },
    _initGesture: function() {
        this.onTouchStartHandler = onBannerContianerTouchStart.bind(this);
        this.onTouchMoveHandler = onBannerContianerTouchMove.bind(this);
        this.onTouchEndHandler = onBannerContianerTouchStart.bind(this);

        this.touchSlideAnimationStart = false;

        this.container.on("touchstart", this.onTouchStartHandler);
        this.container.on("touchmove", this.onTouchMoveHandler);
        this.container.on("touchend", this.onTouchEndHandler);
        this.container.on("touchcancel", this.onTouchEndHandler);
    },
    isTouchAvailable: function() {
        return isTouchAvailable;
    },
    stop: function() {
        if(this.setTimeoutHandler) {
            clearTimeout(this.setTimeoutHandler);
            this.setTimeoutHandler = null;
        }
        if(this.changedHandler) {
            clearTimeout(this.changedHandler);
            this.changedHandler = null;
        }
        this.status = "stop";
    },
    play: function() {
        var that,
            playFn;
        if(this.setTimeoutHandler) {
            return;
        }

        that = this;
        playFn = function() {
            that.setTimeoutHandler = null;
            that._next();
        };
        this.setTimeoutHandler = setTimeout(playFn, this.interval);
        this.status = "play";
    },
    _prev: function() {
        var index = this.index - 1;
        if(index < 0) {
            index = this.items.length - 1;
        }
        this._change(index);
    },
    _next: function() {
        var index = this.index + 1;
        if(index >= this.items.length) {
            index = 0;
        }
        this._change(index);
    },
    _change: function(nextIndex) {
        var current,
            next,
            that;

        if(this.index === nextIndex) {
            return;
        }

        current = this.items[this.index];
        next = this.items[nextIndex];
        this.indicators[this.index].removeClass("indicator-selected");
        this.indicators[nextIndex].addClass("indicator-selected");
        if(this.minItems.length > 0) {
            this.minItems[this.index].removeClass("min-info-show");
            this.minItems[nextIndex].addClass("min-info-show");
        }

        this.index = nextIndex;
        this.status = "changing";

        next.css("display", "block");
        current.addClass("banner-fade-out");
        that = this;
        this.changedHandler = setTimeout(function() {
            that.changedHandler = null;
            current.css("display", "none");
            current
                .removeClass("banner-fade-out")
                .removeClass("banner-show");
            next.addClass("banner-show");
            that.play();
        }, 1000);
    },
    slideBanner: function(x) {
        var distance,
            width,
            left,
            banner;

        banner = this.current;
        width = banner.width();
        distance = Math.abs(x);
        left = (parseFloat(banner.css("left")) || 0) + x;
        banner.css({
            "left":  left + "px",
            "opacity": left / width
        });
    },
    slideAnimation: function(x, callback) {
        var animationClass,
            beginValue,
            endValue,
            currentBanner,
            nextBanner,
            nextIndex,
            that;

        currentBanner = this.current;

        beginValue = 0;
        endValue = currentBanner.width();

        this.touchSlideAnimationStart = true;
        if(this.items.length > 1 && Math.abs(x) / endValue >= 0.5) {
            if(x > 0) {
                animationClass = "banner-slide-right";
                nextIndex = this.index + 1;
                if(nextIndex >= this.items.length) {
                    nextIndex = 0;
                }
            } else {
                animationClass = "banner-slide-left";
                nextIndex = this.index - 1;
                if(nextIndex < 0) {
                    nextIndex = this.items.length - 1;
                }
            }

            nextBanner = this.items[nextIndex];
            if(this.minItems.length > 0) {
                this.minItems[this.index].removeClass("min-info-show");
                this.minItems[nextIndex].addClass("min-info-show");
            }
        } else {
            animationClass = "banner-restore";
        }
        
        that = this;
        if(nextBanner) {
            nextBanner.css("display", "block");
        }
        currentBanner.addClass(animationClass);
        setTimeout(function() {
            that.touchSlideAnimationStart = false;
            currentBanner.css("display", "none");
            currentBanner.removeClass(animationClass);
            if(nextBanner) {
                currentBanner.removeClass("banner-show");
                that.current = nextBanner;
                that.current.addClass("banner-show");
                this.index = nextIndex;
            }
        }, 320);
    }
};
