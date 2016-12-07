; (function () {

    function getLargeImageSrc(img) {
        var src = img.attr("data-large-src");
        if(!src) {
            src = img.prop("src");
        }
        return src;
    }

    function loadImageSize(src) {
        var promise = new Promise(function(resolve, reject) {
            var reimg = new Image();
            var size = {
                src: src,
                width: -1,
                height: -1
            };
            reimg.onload = function () {
                reimg.onload = null;
                size.width = reimg.width;
                size.height = reimg.height;
                resolve(size);
            };
            reimg.onerror = function () {
                reject(size);
            };
            reimg.src = src;
        });
        return promise;
    }


    //图片放大器
    ui.define("ctrls.ImageZoomer", {
        _getOption: function () {
            return {
                parentContent: $(document.body),
                onNext: null,
                onPrev: null,
                hasNext: null,
                hasPrev: null,
                getLargeImageSrc: null
            };
        },
        _getEvents: function () {
            return ["hided"];
        },
        _create: function () {
            this.parentContent = this.option.parentContent;
            this.closeButton = null;
            this.mask = null;
            this.width;
            this.height;

            this.target = null;
            this.targetTop;
            this.targetLeft;

            if($.isFunction(this.option.getLargeImageSrc)) {
                this._getLargeImageSrc = this.option.getLargeImageSrc;
            } else {
                this._getLargeImageSrc = getLargeImageSrc;
            }
        },
        _init: function () {
            this.imagePanel = $("<div class='show-image-panel' />");
            this.currentView = $("<div class='image-view-panel' style='display:none;' />");
            this.nextView = $("<div class='image-view-panel' style='display:none;' />");
            this.currentView.append("<img class='image-view-img' />");
            this.nextView.append("<img class='image-view-img' />");
            this.closeButton = $("<a class='close-button font-highlight-hover' href='javascript:void(0)'>×</a>");
            
            var that = this;
            this.closeButton.click(function () {
                that.hide();
            });
            
            this.imagePanel
                .append(this.currentView)
                .append(this.nextView)
                .append(this.closeButton);
            if($.isFunction(this.option.onNext)) {
                this.nextButton = $("<a class='next-button font-highlight-hover disabled-button' style='right:10px;' href='javascript:void(0)'><i class='fa fa-angle-right'></i></a>");
                this.nextButton.click(function(e) {
                    that._doNextView();
                });
                this.imagePanel.append(this.nextButton);
            }
            if($.isFunction(this.option.onPrev)) {
                this.prevButton = $("<a class='prev-button font-highlight-hover disabled-button' style='left:10px;' href='javascript:void(0)'><i class='fa fa-angle-left'></i></a>");
                this.prevButton.click(function(e) {
                    that._doPrevView();
                });
                this.imagePanel.append(this.prevButton);
            }
            $(document.body).append(this.imagePanel);
            
            ui.resize(function(e) {
                that.resizeZoomImage();
            }, ui.eventPriority.ctrlResize);
            
            if(this.prevButton || this.nextButton) {
                this.changeViewAnimator = ui.animator({
                    ease: ui.AnimationStyle.easeFromTo,
                    onChange: function(val) {
                        this.target.css("left", val + "px");
                    }
                }).addTarget({
                    ease: ui.AnimationStyle.easeFromTo,
                    onChange: function(val) {
                        this.target.css("left", val + "px");
                    }
                });
            }
        },
        _showOptionButtons: function() {
            if(this.prevButton) {
                this.prevButton.removeClass("disabled-button");
            }
            if(this.nextButton) {
                this.nextButton.removeClass("disabled-button");
            }
        },
        _hideOptionButtons: function() {
            if(this.prevButton) {
                this.prevButton.addClass("disabled-button");
            }
            if(this.nextButton) {
                this.nextButton.addClass("disabled-button");
            }
        },
        _updateButtonState: function() {
            if($.isFunction(this.option.hasNext)) {
                if(this.option.hasNext.call(this)) {
                    this.nextButton.removeClass("disabled-button");
                } else {
                    this.nextButton.addClass("disabled-button");
                }
            }
            if($.isFunction(this.option.hasPrev)) {
                if(this.option.hasPrev.call(this)) {
                    this.prevButton.removeClass("disabled-button");
                } else {
                    this.prevButton.addClass("disabled-button");
                }
            }
        },
        show: function (target) {
            this.target = target;
            var content = this._setImageSize();
            if (!content) {
                return;
            }
            var img = this.currentView.children("img");
            img.prop("src", this.target.prop("src"));
            img.css({
                "width": this.target.width() + "px",
                "height": this.target.height() + "px",
                "left": this.targetLeft + "px",
                "top": this.targetTop + "px"
            });
            this.imagePanel.css({
                "display": "block",
                "width": content.parentW + "px",
                "height": content.parentH + "px",
                "left": content.parentLoc.left + "px",
                "top": content.parentLoc.top + "px"
            });
            this.currentView.css("display", "block");
            var left = (content.parentW - this.width) / 2;
            var top = (content.parentH - this.height) / 2;
            
            var that = this;
            ui.openMask({
                opacity: .8
            });
            img.animate({
                "left": left + "px",
                "top": top + "px",
                "width": this.width + "px",
                "height": this.height + "px"
            }, 240, function() {
                that._updateButtonState();
            });
        },
        hide: function () {
            var that = this,
                img = this.currentView.children("img");
            ui.closeMask();
            img.animate({
                "top": this.targetTop + "px",
                "left": this.targetLeft + "px",
                "width": this.target.width() + "px",
                "height": this.target.height() + "px"
            }, 240, function() {
                that._hideOptionButtons();
                that.imagePanel.css("display", "none");
                that.currentView.css("display", "none");
                that.fire("hided", that.target);
            });
        },
        _doNextView: function() {
            if(this.changeViewAnimator.isStarted) {
                return;
            }
            var nextImg = this.option.onNext.call(this);
            if(!nextImg) {
                return;
            }
            this._doChangeView(nextImg, function() {
                this.target = nextImg;
                this._updateButtonState();
                this._changeView(-this.parentContent.width());
            });
        },
        _doPrevView: function() {
            if(this.changeViewAnimator.isStarted) {
                return;
            }
            var prevImg = this.option.onPrev.call(this);
            if(!prevImg) {
                return;
            }
            this._doChangeView(prevImg, function() {
                this.target = prevImg;
                this._updateButtonState();
                this._changeView(this.parentContent.width());
            });
        },
        _doChangeView: function(changeImg, action) {
            var largeSize = changeImg.data("LargeSize");
            var that = this;
            if(largeSize) {
                action.call(this);
            } else {
                loadImageSize(this._getLargeImageSrc(changeImg))
                    .then(
                        //success
                        function(size) {
                            changeImg.data("LargeSize", size);
                            action.call(that);
                        },
                        //failed
                        function (size) {
                            action.call(that);
                        }
                    );
            }
        },
        _changeView: function(changeValue) {
            var temp = this.currentView;
            this.currentView = this.nextView;
            this.nextView = temp;
            var largeSrc = this._getLargeImageSrc(this.target);

            var content = this._setImageSize();
            if (!content) {
                return;
            }
            var img = this.currentView.children("img");
            img.prop("src", largeSrc);
            img.css({
                "left": (content.parentW - this.width) / 2 + "px",
                "top": (content.parentH - this.height) / 2 + "px",
                "width": this.width + "px",
                "height": this.height + "px"
            });
            this.currentView.css("display", "block");
            this.currentView.css("left", (-changeValue) + "px");
            
            var option = this.changeViewAnimator[0];
            option.target = this.nextView;
            option.begin = 0;
            option.end = changeValue;
            
            option = this.changeViewAnimator[1];
            option.target = this.currentView;
            option.begin = -changeValue;
            option.end = 0;
            
            var that = this;
            this.changeViewAnimator.start().done(function() {
                that.nextView.css("display", "none");
            });
            
        },
        resizeZoomImage: function () {
            var content = this._setImageSize();
            if (!content) {
                return;
            }
            var left = (content.parentW - this.width) / 2;
            var top = (content.parentH - this.height) / 2;
            
            this.imagePanel.css({
                "width": content.parentW + "px",
                "height": content.parentH + "px",
            });
            var img = this.currentView.children("img");
            img.css({
                "left": left + "px",
                "top": top + "px",
                "width": this.width + "px",
                "height": this.height + "px"
            });
        },
        _getActualSize: function (img) {
            var largeSize = img.data("LargeSize");
            var mem, w, h;
            if(!largeSize) {
                //保存原来的尺寸  
                mem = { w: img.width(), h: img.height() };
                //重写
                img.css({
                    "width": "auto",
                    "height": "auto"
                });
                //取得现在的尺寸 
                w = img.width();
                h = img.height();
                //还原
                img.css({
                    "width": mem.w + "px",
                    "height": mem.h + "px"
                });
                largeSize = { width: w, height: h };
            }
            
            return largeSize;
        },
        _setImageSize: function () {
            if (!this.currentView) {
                return;
            }
            if (!this.target) {
                return;
            }
            var img = this.currentView.children("img");
            img.stop();
            
            var size = this._getActualSize(this.target);

            var parentH = this.parentContent.height();
            var parentW = this.parentContent.width();
            var imageW = size.width;
            var imageH = size.height;
            if (imageW / parentW < imageH / parentH) {
                if(imageH >= parentH) {
                    this.height = parentH;
                } else {
                    this.height = imageH;
                }
                this.width = Math.floor(imageW * (this.height / imageH));
            } else {
                if(imageW >= parentW) {
                    this.width = parentW;
                } else {
                    this.width = imageH;
                }
                this.height = Math.floor(imageH * (this.width / imageW));
            }
            var loc = this.target.offset();
            var parentLoc = this.parentContent.offset();
            this.targetTop = loc.top - parentLoc.top;
            this.targetLeft = loc.left - parentLoc.left;
            var content = {
                parentW: parentW,
                parentH: parentH,
                parentLoc: parentLoc
            };
            return content;
        }
    });
    
    //图片局部放大查看器
    ui.define("ctrls.ImageWatcher", {
        _getOption: function () {
            return {
                position: "right",
                zoomWidth: null,
                zoomHeight: null
            };
        },
        _getEvents: function () {
            
        },
        _create: function () {
            this.borderWidth = 1;
            this.viewMargin = 10;
            
            this.option.position = this.option.position.toLowerCase();
            this.zoomWidth = this.option.zoomWidth;
            this.zoomHeight = this.option.zoomHeight;
        },
        _init: function () {
            this.element.addClass("image-watch-panel");
            this.focusView = $("<div class='focus-view border-highlight' />");
            this.zoomView = $("<div class='zoom-view border-highlight' />");
            this.zoomImage = $("<img alt='' />");
            
            this.zoomView.append(this.zoomImage);
            this.element.append(this.focusView)
                .append(this.zoomView);
            
            this._initImage();
            this._initZoomer();
        },
        _initImage: function() {
            this.image = $(this.element.children("img")[0]);
            if(this.image.length == 0) {
                throw new Error("元素中没有图片，无法使用图片局部查看器");
            }
            this.imageOffsetWidth = this.image.width();
            this.imageOffsetHeight = this.image.height();
            this.image.css({
                "width": "auto",
                "height": "auto"
            });
            this.imageWidth = this.image.width();
            this.imageHeight = this.image.height();
            this.image.css({
                "width": this.imageOffsetWidth + "px",
                "height": this.imageOffsetHeight + "px"
            });
            
            this.zoomImage.prop("src", this.image.prop("src"));
        },
        _initZoomer: function() {
            var that = this;
            if(ui.core.type(this.option.zoomHeight) !== "number") {
                this.zoomHeight = this.element.height();
            }
            if(ui.core.type(this.option.zoomWidth) !== "number") {
                this.zoomWidth = this.zoomHeight;
            }
            this.zoomView.css({
                "width": this.zoomWidth - this.borderWidth * 2 + "px",
                "height": this.zoomHeight - this.borderWidth * 2 + "px"
            });
            
            this.element
                .mouseenter(function(e) {
                    that.start = true;
                    that._setFocusView(e);
                    that._setZoomView();
                })
                .mousemove(function(e) {
                    if(!that.start) {
                        return;
                    }
                    that._setFocusView(e);
                    that._setZoomView();
                })
                .mouseleave(function(e) {
                    that.start = false;
                    that.focusView.css("display", "none");
                    that.zoomView.css("display", "none");
                });
        },
        _setFocusView: function(e) {
            var offset = this.image.offset(),
                offsetX = e.clientX - offset.left,
                offsetY = e.clientY - offset.top;
            var ratio = this.imageOffsetWidth / this.imageWidth,
                width = this.zoomWidth * ratio,
                height = this.zoomHeight * ratio;
            var top, left,
                parentOffset = this.element.offset(),
                marginTop = offset.top - parentOffset.top,
                marginLeft = offset.left - parentOffset.left;
            if(offsetX < 0 || offsetX > this.imageOffsetWidth || offsetY < 0 || offsetY > this.imageOffsetHeight) {
                this.focusView.css("display", "none");
                return;
            }
            left = offsetX + marginLeft - width / 2;
            if(left < marginLeft) {
                left = marginLeft;
            } else if(left + width > this.imageOffsetWidth + marginLeft) {
                left = this.imageOffsetWidth + marginLeft - width;
            }
            top = offsetY + marginTop - height / 2;
            if(top < marginTop) {
                top = marginTop;
            } else if(top + height > this.imageOffsetHeight + marginTop) {
                top = this.imageOffsetHeight + marginTop - height;
            }
            this.focusView.css({
                "display": "block",
                "width": width - this.borderWidth * 2 + "px",
                "height": height - this.borderWidth * 2 + "px",
                "top": top + "px",
                "left": left + "px"
            });
            
            this.topRatio = (top - marginTop) / this.imageOffsetHeight;
            this.leftRatio = (left - marginLeft) / this.imageOffsetWidth;
        },
        _setZoomView: function() {
            if(this.focusView.css("display") === "none") {
                this.zoomView.css("display", "none");
                return;
            }
            var top, left;
            if(this.option.position === "top") {
                left = 0;
                top = -(this.zoomHeight + this.viewMargin);
            } else if(this.option.position === "bottom") {
                left = 0;
                top = (this.element.outerHeight() + this.viewMargin);
            } else if(this.option.position === "left") {
                left = -(this.zoomWidth + this.viewMargin);
                top = 0;
            } else {
                left = (this.element.outerWidth() + this.viewMargin);
                top = 0;
            }
            
            this.zoomView.css({
                "display": "block",
                "top": top + "px",
                "left": left + "px"
            });
            this.zoomImage.css({
                "top": -(this.imageHeight * this.topRatio) + "px",
                "left": -(this.imageWidth * this.leftRatio) + "px"
            });
        }
    });
    
    //图片轮播视图
    ui.define("ctrls.ImageViewer", {
        _getOption: function () {
            return {
                //是否显示切换
                hasSwitchButtom: false,
                //是否自动切换
                interval: 2000,
                //vertical | horizontal
                direction: "horizontal",
                //图片路径
                images: []
            };
        },
        _getEvents: function () {
            return ["changed", "ready"];
        },
        _create: function () {
            if(ui.core.type(this.option.images) !== "array") {
                this.option.images = [];
            }
            if(ui.core.type(this.option.interval) !== "number" || this.option.interval <= 0) {
                this.isAutoView = false
            } else {
                this.isAutoView = true;
            }
            this.stopAutoView = false;
            this.currentIndex = -1;
            this.images = [];
            
            this.isHorizontal = this.option.direction === "horizontal";
            this.animationCssItem = this.isHorizontal ? "left" : "top";
        },
        _init: function () {
            this.element.addClass("image-view-panel");
            this.currentView = null;
            this.nextView = null;
            
            var that = this;
            this.viewAnimator = ui.animator({
                ease: ui.AnimationStyle.easeTo,
                onChange: function(val) {
                    this.target.css(that.animationCssItem, val + "px");
                }
            }).addTarget({
                ease: ui.AnimationStyle.easeTo,
                onChange: function(val) {
                    this.target.css(that.animationCssItem, val + "px");
                }
            });
            this.viewAnimator.onEnd = function() {
                that.currentView.css("display", "none");
                that.currentView = that.nextView;
                that.nextView = null;
                
                if(that.isAutoView && !that.stopAutoView) {
                    that._autoViewHandler = setTimeout(function() {
                        that.next();
                    }, that.option.interval);
                }
                that.fire("changed", that.currentIndex, that.images[that.currentIndex]);
            };
            this.viewAnimator.duration = 500;
            this._loadImages(this.option.images);
            
            if(this.isAutoView) {
                this.element.mouseenter(function(e) {
                    that.stopAutoView = true;
                    if(that._autoViewHandler) {
                        clearTimeout(that._autoViewHandler);
                    }
                });
                this.element.mouseleave(function(e) {
                    that.stopAutoView = false;
                    that._autoViewHandler = setTimeout(function() {
                        that.next();
                    }, that.option.interval);
                });
            }
        },
        setImages: function() {
            if(arguments.length == 0) {
                return;
            }
            this.empty();
            var images = [],
                i = 0,
                len = arguments.length,
                img = null;
            for(; i < len; i++) {
                img = arguments[i];
                if(Array.isArray(img)) {
                    images = images.concat(img);
                } else if(ui.core.type(img) === "string") {
                    images.push(img);
                }
            }
            this._loadImages(images);
        },
        _loadImages: function(images) {
            if(images.length == 0) {
                return;
            }
            
            if(this.option.hasSwitchButtom === true) {
                this.prevBtn = $("<a href='javascript:void(0)' class='image-switch-button switch-button-prev font-highlight-hover'><i class='fa fa-angle-left'></i></a>");
                this.nextBtn = $("<a href='javascript:void(0)' class='image-switch-button switch-button-next font-highlight-hover'><i class='fa fa-angle-right'></i></a>");
                this.prevBtn.click($.proxy(function(e) {
                    this.prev();
                }, this));
                this.nextBtn.click($.proxy(function(e) {
                    this.next();
                }, this));
                this.element
                    .append(this.prevBtn)
                    .append(this.nextBtn);
            }
            
            var promises = [],
                i = 0,
                that = this;
            for(; i < images.length; i++) {
                promises.push(this._loadImage(images[i]));
            }
            Promise.all(promises).done(function(result) {
                var i = 0,
                    len = result.length,
                    image;
                for(; i < len; i++) {
                    image = result[i];
                    if(image) {
                        image.view = $("<div class='image-view' />");
                        image.view.append("<img src='" + image.src + "' alt='' />");
                        that.element.append(image.view);
                        that.images.push(image);
                    }
                }
                if(that.images.length > 0) {
                    that.showImage(0);
                }
                
                that.fire("ready", that.images);
            });
        },
        _loadImage: function(src) {
            if(ui.core.type(src) !== "string" || src.length == 0) {
                return;
            }
            var promise = new Promise(function(resolve, reject) {
                var img = new Image();
                img.onload = function () {
                    img.onload = null;
                    resolve({
                        src: src,
                        width: img.width,
                        height: img.height
                    });
                };
                img.onerror = function () {
                    resolve(null);
                };
                img.src = src;
            });
            return promise;
        },
        _startView: function(isNext) {
            this.viewAnimator.stop();

            var width = this.element.width(),
                height = this.element.height(),
                cssValue = this.isHorizontal ? width : height,
                option;
            
            option = this.viewAnimator[0];
            option.target = this.currentView;
            option.begin = parseFloat(option.target.css(this.animationCssItem), 10);
            if(isNext) {
                option.end = -cssValue;
            } else {
                option.end = cssValue;
            }
            option = this.viewAnimator[1];
            option.target = this.nextView;
            option.begin = parseFloat(option.target.css(this.animationCssItem), 10);
            option.end = 0;
            
            this.viewAnimator.start();
        },
        _setImage: function(index, view) {
            var image = this.images[index];
            var displayWidth = this.element.width(),
                displayHeight = this.element.height();
            var img = null,
                width, height;
            view = view || this.currentView;
            img = view.children("img");
            
            if (displayWidth > displayHeight) {
                height = displayHeight;
                width = Math.floor(image.width * (height / image.height));
                if (width > displayWidth) {
                    width = displayWidth;
                    height = Math.floor(image.height * (width / image.width));
                    img.css("top", Math.floor((displayHeight - height) / 2) + "px");
                } else {
                    img.css("left", Math.floor((displayWidth - width) / 2) + "px");
                }
            } else {
                width = displayWidth;
                height = Math.floor(image.height * (width / image.width));
                if (height > displayHeight) {
                    height = displayHeight;
                    width = Math.floor(image.width * (height / image.height));
                    img.css("left", Math.floor((displayWidth - width) / 2) + "px");
                } else {
                    img.css("top", Math.floor((displayHeight - height) / 2) + "px");
                }
            }
            img.css({
                "width": width + "px",
                "height": height + "px"
            });
        },
        showImage: function(index) {
            if(this.images.length == 0) {
                return;
            }
            if(this._autoViewHandler) {
                clearTimeout(this._autoViewHandler);
            }
            
            var width = this.element.width(),
                height = this.element.height(),
                that = this,
                css = {
                    "display": "block"
                },
                cssValue = this.isHorizontal ? width : height,
                flag;
            this.element.css("overflow", "hidden");
            if(this.currentIndex < 0) {
                this.currentIndex = index;
                this.currentView = this.images[this.currentIndex].view;
                this._setImage(index);
                this.currentView.css("display", "block");
                if(this.isAutoView) {
                    this._autoViewHandler = setTimeout(function() {
                        that.next();
                    }, this.option.interval);
                }
                return;
            }
            
            if(this.nextView) {
                this.currentView
                    .css("display", "none")
                    .css(this.animationCssItem, -cssValue + "px");
                this.currentView = this.nextView;
                this.currentView.css(this.animationCssItem, "0px");
            }
            if(index > this.currentIndex) {
                if(index >= this.images.length) {
                    index = 0;
                }
                css[this.animationCssItem] = cssValue + "px";
                flag = true;
            } else {
                if(index < 0) {
                    index = this.images.length - 1;
                }
                css[this.animationCssItem] = -cssValue + "px";
                flag = false;
            }
            this.nextView = this.images[index].view;
            this.nextView.css(css);
            this._setImage(index, this.nextView);
            this.currentIndex = index;
            this._startView(flag);
        },
        prev: function() {
            if(this.currentIndex >= 0) {
                this.showImage(this.currentIndex - 1);
            } else {
                this.showImage(0);
            }
        },
        next: function() {
            if(this.currentIndex >= 0) {
                this.showImage(this.currentIndex + 1);
            } else {
                this.showImage(0);
            }
        },
        empty: function() {
            this.images = [];
            this.currentIndex = -1;
            this.viewAnimator.stop();
            clearTimeout(this._autoViewHandler);
            
            this.element.empty();
            this.prevBtn = null;
            this.nextBtn = null;
            this.currentView = null;
            this.nextView = null;
        }
        
    });
    
    ui.images = {
        createImageZoomer: function(option) {
            return ui.ctrls.ImageZoomer(option);
        }
    };

    $.fn.addImageZoomer = function (image) {
        if (!this || this.length == 0) {
            return null;
        }
        if (image instanceof ui.ctrls.ImageZoomer) {
            this.click(function(e) {
                var target = $(e.target);
                var largeSize = target.data("LargeSize");
                if(largeSize) {
                    image.show(target);
                } else {
                    loadImageSize(image._getLargeImageSrc(target))
                        .then(
                            //success
                            function(size) {
                                target.data("LargeSize", size);
                                image.show(target);
                            },
                            //failed
                            function(size) {
                                image.show(target)
                            }
                        );
                }
            });
        }
    };
    
    $.fn.imageWatcher = function(option) {
        if(!this || this.length == 0) {
            return;
        }
        return ui.ctrls.ImageWatcher(option, this);
    };
    
    $.fn.imageViewer = function(option) {
        if(!this || this.length == 0) {
            return;
        }
        return ui.ctrls.ImageViewer(option, this);
    };
    
    //图片预览视图
    ui.define("ctrls.ImagePreview", {
         _getOption: function () {
            return {
                chooserButtonSize: 16,
                imageMargin: 10,
                //vertical | horizontal
                direction: "horizontal"
            };
        },
        _getEvents: function () {
            return ["changing", "changed", "ready"];
        },
        _create: function () {
            this.element.addClass("image-preview");
            this.viewer = this.element.children(".image-view-panel");
            this.chooser = this.element.children(".image-preview-chooser");
            
            if(this.viewer.length == 0) {
                throw new Error("需要设置一个class为image-view-panel的元素");
            }
            if(this.chooser.length == 0) {
                throw new Error("需要设置一个class为image-preview-chooser的元素");
            }
            
            this.isHorizontal = this.option.direction === "horizontal";
            if(!ui.core.type(this.option.chooserButtonSize) || this.option.chooserButtonSize < 2) {
                this.option.chooserButtonSize = 16;
            }
            this.item = [];
        },
        _init: function () {
            this.chooserQueue = $("<div class='chooser-queue' />");
            this.chooserPrev = $("<a href='javascript:void(0)' class='chooser-button font-highlight-hover'></a>");
            this.chooserNext = $("<a href='javascript:void(0)' class='chooser-button font-highlight-hover'></a>");
            this.chooser.append(this.chooserPrev)
                .append(this.chooserQueue)
                .append(this.chooserNext);
            
            this.chooserPrev.click($.proxy(function(e) {
                this.beforeItems();
            }, this));
            this.chooserNext.click($.proxy(function(e) {
                this.afterItems();
            }, this));
            
            this.chooserAnimator = ui.animator({
                target: this.chooserQueue,
                ease: ui.AnimationStyle.easeFromTo
            });
            
            var buttonSize = this.option.chooserButtonSize,
                showCss = null;
            if(this.isHorizontal) {
                this.smallImageSize = this.chooser.height();
                this.chooserAnimator[0].onChange = function(val) {
                    this.target.scrollLeft(val);
                };
                showCss = {
                    "width": buttonSize + "px",
                    "height": "100%"
                };
                this.chooserPrev
                    .append("<i class='fa fa-angle-left'></i>")
                    .css(showCss);
                this.chooserNext
                    .append("<i class='fa fa-angle-right'></i>")
                    .css(showCss)
                    .css("right", "0px");
                this.isOverflow = function() {
                    return this.chooserQueue[0].scrollWidth > this.chooserQueue.width();
                };
                this.showChooserButtons = function() {
                    this.chooserPrev.css("display", "block");
                    this.chooserNext.css("display", "block");
                    this.chooserQueue.css({
                        "left": buttonSize + "px",
                        "width": this.chooser.width() - this.option.chooserButtonSize * 2 + "px"
                    });
                };
                this.hideChooserButtons = function() {
                    this.chooserPrev.css("display", "none");
                    this.chooserNext.css("display", "none");
                    this.chooserQueue.css({
                        "left": "0px",
                        "width": "100%"
                    });
                };
            } else {
                this.smallImageSize = this.chooser.width();
                this.chooserAnimator[0].onChange = function(val) {
                    this.target.scrollTop(val);
                };
                showCss = {
                    "height": buttonSize + "px",
                    "width": "100%",
                    "line-height": buttonSize + "px"
                };
                this.chooserPrev
                    .append("<i class='fa fa-angle-up'></i>")
                    .css(showCss);
                this.chooserNext
                    .append("<i class='fa fa-angle-down'></i>")
                    .css(showCss)
                    .css("bottom", "0px");
                showCss = {
                    "display": "block"
                };
                this.isOverflow = function() {
                    return this.chooserQueue[0].scrollHeight > this.chooserQueue.height();
                };
                this.showChooserButtons = function() {
                    this.chooserPrev.css("display", "block");
                    this.chooserNext.css("display", "block");
                    this.chooserQueue.css({
                        "top": buttonSize + "px",
                        "height": this.chooser.height() - buttonSize * 2 + "px"
                    });
                };
                this.hideChooserButtons = function() {
                    this.chooserPrev.css("display", "none");
                    this.chooserNext.css("display", "none");
                    this.chooserQueue.css({
                        "top": "0px",
                        "height": "100%"
                    });
                };
            }
            this.chooserQueue.click($.proxy(this._onClickHandler, this));
            
            this.setImages(this.option.images);
        },
        _initImages: function(images) {
            var width, 
                height,
                marginValue = 0;
            var i = 0, 
                len = images.length,
                image,
                item, img,
                css;
            height = this.smallImageSize - 4;
            width = height;

            this.imageSource = images;
            for(; i < len; i++) {
                image = images[i];
                css = this._getImageDisplay(width, height, image.width, image.height);
                item = $("<div class='small-img' />");
                item.attr("data-index", i);
                img = $("<img alt='' />");
                img.css({
                    width: css.width,
                    height: css.height,
                    "margin-top": css.top,
                    "margin-left": css.left
                });
                img.prop("src", image.src);
                item.append(img);
                this.chooserQueue.append(item);

                if(this.isHorizontal) {
                    item.css("left", marginValue + "px");
                    marginValue += this.option.imageMargin + item.outerWidth();
                } else {
                    item.css("top", marginValue + "px");
                    marginValue += this.option.imageMargin + item.outerHeight();
                }
                this.items.push(item);
            }
            
            if(this.isOverflow()) {
                this.showChooserButtons();
            } else {
                this.hideChooserButtons();
            }

            if(this.imageViewer.currentIndex >= 0) {
                this.selectItem(this.imageViewer.currentIndex);
                this.fire("changed", this.imageViewer.currentIndex);
            }
        },
        _getImageDisplay: function(displayWidth, displayHeight, imgWidth, imgHeight) {
            var width,
                height;
            var css = {
                top: "0px",
                left: "0px"
            };
            if (displayWidth > displayHeight) {
                height = displayHeight;
                width = Math.floor(imgWidth * (height / imgHeight));
                if (width > displayWidth) {
                    width = displayWidth;
                    height = Math.floor(imgHeight * (width / imgWidth));
                    css.top = Math.floor((displayHeight - height) / 2) + "px";
                } else {
                    css.left = Math.floor((displayWidth - width) / 2) + "px";
                }
            } else {
                width = displayWidth;
                height = Math.floor(imgHeight * (width / imgWidth));
                if (height > displayHeight) {
                    height = displayHeight;
                    width = Math.floor(imgWidth * (height / imgHeight));
                    css.left = Math.floor((displayWidth - width) / 2) + "px";
                } else {
                    css.top = Math.floor((displayHeight - height) / 2) + "px";
                }
            }
            css.width = width + "px";
            css.height = height + "px";
            return css;
        },
        _onClickHandler: function(e) {
            var elem = $(e.target),
                nodeName = elem.nodeName();
            if(elem.hasClass("chooser-queue")) {
                return;
            }
            if(nodeName === "IMG") {
                elem = elem.parent();
            }
            var index = parseInt(elem.attr("data-index"), 10);
            if(this.fire("changing", index) === false) {
                return;
            }
            if(this.selectItem(index) === false) {
                return;
            }
            this.imageViewer.showImage(index);
        },
        selectItem: function(index) {
            var elem = this.items[index];
            if(this.currentChooser) {
                if(this.currentChooser[0] === elem[0]) {
                    return false;
                }
                this.currentChooser
                    .removeClass("chooser-selected")
                    .removeClass("border-highlight");
            }
            this.currentChooser = elem;
            this.currentChooser
                .addClass("chooser-selected")
                .addClass("border-highlight");
            if(this.isOverflow()) {
                this._moveChooserQueue(index);
            }
        },
        empty: function() {
            this.items = [];
            this.chooserQueue.empty();
            
            if(this.imageViewer) {
                this.imageViewer.empty();
            }
        },
        setImages: function(images) {
            if(ui.core.type(images) !== "array" || images.length == 0) {
                return;
            }
            this.empty();
            
            this.option.images = images;
            var that = this;
            if(!this.imageViewer) {
                this.imageViewer = this.viewer.imageViewer(this.option);
                this.imageViewer.ready(function(e, images) {
                    that._initImages(images);
                    that.fire("ready");
                });
                this.imageViewer.changed(function(e, index) {
                    that.selectItem(index);
                    that.fire("changed", index);
                });
            } else {
                this.imageViewer.setImages(images);
            }
        },
        _caculateScrollValue: function(fn) {
            var currentValue,
                caculateValue,
                queueSize,
                scrollLength;
            if(this.isHorizontal) {
                queueSize = this.chooserQueue.width();
                currentValue = this.chooserQueue.scrollLeft();
                scrollLength = this.chooserQueue[0].scrollWidth;
            } else {
                queueSize = this.chooserQueue.height();
                currentValue = this.chooserQueue.scrollTop();
                scrollLength = this.chooserQueue[0].scrollHeight;
            }
            
            caculateValue = fn.call(this, queueSize, currentValue);
            if(caculateValue < 0) {
                caculateValue = 0;
            } else if(caculateValue > scrollLength - queueSize) {
                caculateValue = scrollLength - queueSize;
            }
            return {
                from: currentValue,
                to: caculateValue
            };
        },
        _moveChooserQueue: function(index) {
            var scrollValue = this._caculateScrollValue(function(queueSize, currentValue) {
                var fullSize = this.smallImageSize + this.option.imageMargin,
                    count = Math.floor(queueSize / fullSize),
                    beforeCount = Math.floor(count / 2);
                var scrollCount = index - beforeCount;
                if(scrollCount < 0) {
                    return 0;
                } else if(scrollCount + count > this.items.length - 1) {
                    return this.items.length * fullSize;
                } else {
                    return scrollCount * fullSize;
                }
            });
            this._setScrollValue(scrollValue);
        },
        _setScrollValue: function(scrollValue) {
            if(isNaN(scrollValue.to)) {
                return;
            }
            this.chooserAnimator.stop();
            var option = this.chooserAnimator[0];
            if(Math.abs(scrollValue.from - scrollValue.to) < this.smallImageSize) {
                option.onChange.call(option, scrollValue.to);
            } else {
                option.begin = scrollValue.from;
                option.end = scrollValue.to;
                this.chooserAnimator.start();
            }
        },
        beforeItems: function() {
            var scrollValue = this._caculateScrollValue(function(queueSize, currentValue) {
                var fullSize = this.smallImageSize + this.option.imageMargin,
                    count = Math.floor(queueSize / fullSize),
                    currentCount = Math.floor(currentValue / fullSize);
                return (currentCount + count * -1) * fullSize;
            });
            this._setScrollValue(scrollValue);
        },
        afterItems: function() {
            var scrollValue = this._caculateScrollValue(function(queueSize, currentValue) {
                var fullSize = this.smallImageSize + this.option.imageMargin,
                    count = Math.floor(queueSize / fullSize),
                    currentCount = Math.floor(currentValue / fullSize);
                return (currentCount + count) * fullSize;
            });
            this._setScrollValue(scrollValue);
        }
    });
    
    $.fn.imagePreview = function(option) {
        if(!this || this.length == 0) {
            return;
        }
        return ui.ctrls.ImagePreview(option, this);
    };
})();