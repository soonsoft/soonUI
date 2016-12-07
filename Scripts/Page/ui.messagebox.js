; (function () {
    var MessageType = {
        message: 0,
        warn: 1,
        error: 3,
        success: 4,
        failed: 5
    };
    var defaultWaitSeconds = 5;
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
            this.type = MessageType;
            this.isStartHide = false;
            this.boxAnimator = null;
            this.width = 322;
            this.top = 88;
        },
        _initAnimator: function() {
            this.boxAnimator = ui.animator({
                target: this.box,
                ease: ui.AnimationStyle.easeTo,
                onChange: function(val) {
                    this.target.css("left", val + "px");
                }
            });
            this.boxAnimator.duration = 200;
        },
        getIcon: function(type) {
            if(type === MessageType.warn) {
                return "mb-warn fa fa-exclamation-triangle";
            } else if(type === MessageType.error) {
                return "mb-error fa fa-times-circle";
            } else if(type === MessageType.success) {
                return "mb-success fa fa-check-circle-o";
            } else if(type === MessageType.failed) {
                return "mb-failed fa fa-times-circle-o";
            } else {
                return "mb-message fa fa-commenting";
            }
        },
        getBox: function () {
            var clientWidth,
                clientHeight;
            if (!this.box) {
                clientWidth = ui.core.root.clientWidth;
                clientHeight = ui.core.root.clientHeight;
                this.box = $("<div class='message-box theme-action-color border-highlight' />");
                this.box.css({
                    "top": this.top + "px",
                    "left": clientWidth + "px",
                    "max-height": clientHeight - (this.top * 2) + "px"
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
                    that.waitSeconds(defaultWaitSeconds);
                });

                this.box.append(close);
                $(document.body).append(this.box);

                this._initAnimator();
            }
            return this.box;
        },
        isShow: function() {
            return this.getBox().css("display") === "block";
        },
        show: function (text, type) {
            var box,
                messageItem,
                htmlBuilder = [];
            
            messageItem = $("<div class='message-item' />")
            htmlBuilder.push("<i class='message-icon ", this.getIcon(type), "'></i>");
            htmlBuilder.push("<div class='message-content'>");
            if($.isFunction(text)) {
                htmlBuilder.push(text());
            } else {
                htmlBuilder.push(ui.str.htmlEncode(text + ""));
            }
            htmlBuilder.push("</div>");
            messageItem.html(htmlBuilder.join(""));

            box = this.getBox();
            if(this.isShow()) {
                box.append(messageItem);
                return;
            }
            box.children(".message-item").remove();
            box.append(messageItem);
            this._show(function () {
                messagebox.waitSeconds(defaultWaitSeconds);
            });
        },
        _show: function (completedHandler) {
            var box = this.getBox(),
                option,
                clientWidth = ui.core.root.clientWidth;
            this.isStartHide = false;

            this.boxAnimator.stop();
            option = this.boxAnimator[0];
            option.begin = parseFloat(option.target.css("left")) || clientWidth;
            option.end = clientWidth - this.width;
            option.target.css("display", "block");
            this.boxAnimator.start().done(completedHandler);
        },
        hide: function (flag) {
            var box,
                option,
                that = this,
                clientWidth = ui.core.root.clientWidth;
            if (flag) {
                this.isClosing = true;
            }
            box = this.getBox();
            this.isStartHide = true;

            this.boxAnimator.stop();
            option = this.boxAnimator[0];
            option.begin = parseFloat(option.target.css("left")) || clientWidth - this.width;
            option.end = clientWidth;
            this.boxAnimator.start().done(function() {
                box.css("display", "none");
                that.isClosing = false;
                that.isStartHide = false;
            });
        },
        waitSeconds: function (seconds) {
            var that = this;
            if (that.hideHandler)
                window.clearTimeout(that.hideHandler);
            if (isNaN(parseInt(seconds)))
                seconds = defaultWaitSeconds;
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
        var box = messagebox.getBox(),
            clientWidth = ui.core.root.clientWidth,
            clientHeight = ui.core.root.clientHeight,
            left;
        if(messagebox.isShow()) {
            left = clientWidth - messagebox.width;
        } else {
            left = clientWidth;
        }
        messagebox.waitSeconds(defaultWaitSeconds);
        box.css({
            "left": left + "px",
            "max-height": clientHeight - (messagebox.top * 2) + "px"
        });
    });
    ui.msgshow = function (text, type) {
        if(type === true) {
            type = MessageType.error;
        } else {
            if(!type) {
                type = MessageType.message;
            }
        }
        messagebox.show(text, type);
    };
    ui.msghide = function () {
        messagebox.hide(true);
    };
    ui.messageShow = function(text) {
        ui.msgshow(text, MessageType.message);
    };
    ui.warnShow = function(text) {
        ui.msgshow(text, MessageType.warn);
    };
    ui.errorShow = function(text) {
        ui.msgshow(text, MessageType.error);
    };
    ui.successShow = function(text) {
        ui.msgshow(text, MessageType.success);
    };
    ui.failedShow = function(text) {
        ui.msgshow(text, MessageType.failed);
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