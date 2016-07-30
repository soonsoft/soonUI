; (function () {
    // 信息提示框
    function MessageBox() {
        if(this instanceof MessageBox) {
            this.initial();
        } else {
            return new MessageBox();
        }
    }
    MessageBox.prototype = {
        initial: function() {
            this.box = null;
            this.isStartHide = false;
        },
        getBox: function () {
            if (!this.box) {
                this.box = $("<div class='message-box background-highlight' />");
                this.box.css({
                    "left": ui.core.root.clientWidth + "px"
                });
                var close = $("<a href='javascript:void(0)' class='close-button'>×</a>");
                var that = this;
                close.click(function (e) {
                    that.hide(true);
                });
                this.box.mouseenter(function (e) {
                    if (that.isClosing) {
                        return;
                    }
                    if (that.isStartHide) {
                        that._show();
                    } else {
                        clearTimeout(that.hideHandler);
                    }
                });
                this.box.mouseleave(function (e) {
                    that.waitSeconds(5);
                });

                this.box.append(close);
                $(document.body).append(this.box);
            }
            return this.box;
        },
        isShow: function() {
            return this.getBox().css("display") === "block";
        },
        show: function (text, isError) {
            var box = this.getBox(),
                p = $("<p />");
            if ($.isFunction(text)) {
                p.html(text);
            } else {
                p.text(text + "");
            }
            if (this.isShow()) {
                box.append(p);
                return;
            }
            box.children("p").remove();
            box.append(p);
            if (isError === true) {
                box.addClass("message-box-error");
            } else {
                box.removeClass("message-box-error");
            }
            this._show(function () {
                messagebox.waitSeconds(5);
            });
        },
        _show: function (completedHandler) {
            var box = this.getBox();
            this.isStartHide = false;

            box.stop();
            box.css({
                "left": ui.core.root.clientWidth + "px",
                "display": "block"
            });
            box.animate({
                "left": (ui.core.root.clientWidth - box.width()) + "px"
            }, 150, "swing", completedHandler);
        },
        hide: function (flag) {
            if (flag) {
                this.isClosing = true;
            }
            var box = this.getBox();
            this.isStartHide = true;

            box.stop();
            box.animate({
                "left": ui.core.root.clientWidth + "px"
            }, 150, "swing", function () {
                box.css("display", "none");
                if (flag) {
                    this.isClosing = false;
                }
            });
        },
        waitSeconds: function (seconds) {
            var that = this;
            if (that.hideHandler)
                window.clearTimeout(that.hideHandler);
            if (isNaN(parseInt(seconds)))
                seconds = 5;
            that.hideHandler = window.setTimeout(function () {
                that.hideHandler = null;
                if (that.isStartHide === false) {
                    that.hide();
                }
            }, seconds * 1000);
        }
    }

    var messagebox = MessageBox();
    ui.resize(function (e) {
        var box;
        if (messagebox.isShow()) {
            box = messagebox.getBox();
            box.css("left", (ui.core.root.clientWidth - box.width()) + "px");
        }
    });
    ui.msgshow = function (text, isError) {
        messagebox.show(text, isError);
    };
    ui.msghide = function () {
        messagebox.hide(true);
    };

    // 加载提示框
    function LoadingBox(option) {
        if(this instanceof LoadingBox) {
            this.initial(option);
        } else {
            return new LoadingBox(option);
        }
    }
    LoadingBox.prototype = {
        initial: function(option) {
            if(!option) {
                option = {};
            }
            this.delay = option.delay;
            if(ui.core.type(this.delay) !== "number" || this.delay < 0) {
                this.delay = 1000;
            }
            this.timeoutHandle = null;
            this.isOpening = false;
            this.box = null;
            this.openCount = 0;
        },
        getBox: function() {
            if(!this.box) {
                this.box = $("#loadingElement");
            }
            return this.box;
        },
        isShow: function() {
            return this.getBox().css("display") === "block";
        },
        show: function() {
            var that;
            if(this.isOpening || this.isShow()) {
                this.openCount++;
                return;
            }
            this.isOpening = true;
            that = this;
            this.timeoutHandle = setTimeout(function() {
                that.timeoutHandle = null;
                that._doShow();
            }, this.delay);
        },
        _doShow: function() {
            this.getBox();
            this.box
                .addClass("c_dotsPlaying")
                .css("display", "block");
        },
        hide: function() {
            if(this.openCount > 0) {
                this.openCount--;
                return;
            }
            this.isOpening = false;
            if(this.timeoutHandle) {
                clearTimeout(this.timeoutHandle);
                return;
            }
            this.getBox();
            this.box
                .removeClass("c_dotsPlaying")
                .css("display", "none");
        }
    };

    var loadingBox = LoadingBox();
    ui.loadingShow = function() {
        loadingBox.show();
    };
    ui.loadingHide = function() {
        loadingBox.hide();
    };
})();