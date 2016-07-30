; (function () {
    ///磁贴显示容器
    var tileDisplay = null;

    ///磁贴组
    var tileSize = {
        small: { width: 60, height: 60, iconSize: 32 },
        medium: { width: 128, height: 128, iconSize: 64 },
        wide: { width: 264, height: 128, iconSize: 64 },
        large: { width: 264, height: 264, iconSize: 64 }
    };
    var tileType = {
        small: "small",
        medium: "medium",
        wide: "wide",
        large: "large"
    };
    var marginLeft = 48,
        margin = 8,
        maxWidth = tileSize.medium.width * 2 + margin;
    var titleHeight = 24;

    var tilePanelCount = 0;

    var defaultBackground = "#FFFFFF",
        borderTopWidth = 4;
    var hasAnimation = !!ui.AnimationStyle;

    //handlerInfo 当前更新体贴方法
    var nextFunc = function () {
        if (!this.tileIndex || this.tileIndex.length == 0)
            return null;
        this.currentIndex++;
        if (this.currentIndex >= this.tileIndex.length) {
            this.currentIndex = 0;
        }
        return this.tileIndex[this.currentIndex];
    };

    var tileDisplayMethods = {
        addTiles: function (option, target) {
            option.margin = parseInt(option.margin) || 48;

            var tc = new TileCtrl();
            tilePanelCount++;
            tc.currentCount = tilePanelCount;
            tc.option = $.extend(tc.option, option);
            tc.target = target;
            tc.create();
            if (!this.vertical) {
                tc.resetPanelHeight(this.baseValue);
            } else {
                tc.resetPanelWidth(this.baseValue);
            }
            tc.initUpdateHandlers();

            this.push(tc);
            return tc;
        },
        updateStart: function () {
            for (var i = 0, len = this.length; i < len; i++) {
                this[i].updateStart();
            }
        },
        resetDisplayHeight: function (height) {
            for (var i = 0, len = this.length; i < len; i++) {
                this[i].resetPanelHeight(height);
            }
        },
        resetDisplayWidth: function (width) {
            for (var i = 0, len = this.length; i < len; i++) {
                this[i].resetPanelWidth(width);
            }
        }
    };

    var createTileDisplay = function (panel) {
        var arrObj = new ui.ArrayObject();
        arrObj.tileDisplayPanel = panel;
        for (var key in tileDisplayMethods) {
            arrObj[key] = tileDisplayMethods[key];
        }

        arrObj.baseValue = 0;
        arrObj.tileDisplayPanel.mousewheel(function (e) {
            var val = (-e.delta) * tileSize.medium.width;
            var panel = arrObj.tileDisplayPanel;
            val += panel.scrollLeft();
            panel.scrollLeft(val);
        });
        return arrObj;
    };

    var TileCtrl = function () {
        this.tiles = [];
        this.option = {
            title: "",
            margin: 48,
            tiles: [],
            updateHandlers: []
        };
        this.currentCount = 0;
        this.tilesPanel = null;
    };
    TileCtrl.prototype = {
        create: function () {
            marginLeft = this.option.margin;
            this.panel = $("<div class='tile-group-panel'/>");

            this.titlePanel = $("<div class='title-panel' />");
            if (typeof this.option.title === "string" && this.option.title.length > 0) {
                this.titlePanel.append($("<span />").text(this.option.title))
            }
            this.tilesPanel = $("<div class='tiles-panel' />");

            this.panel.append(this.titlePanel);
            this.panel.append(this.tilesPanel);
            this.target.append(this.panel);
            this.titleHeight = this.titlePanel.height();

            this.createTiles(this.option.tiles);
        },
        createTiles: function (opTiles) {
            var tile = null;
            var opTile = null;
            var i = 0;
            for (i = 0; i < opTiles.length; i++) {
                opTile = opTiles[i];
                if (hasAnimation && opTile.type !== tileSize.small) {
                    opTile.animationOption = {
                        duration: 800,
                        fps: 100,
                        ease: ui.AnimationStyle.easeFromTo,
                        onEnd: null
                    };
                }
                tile = this.createTile(opTile);
                tile.prop("id", this.createId(i));
                this.tiles.push(tile);
                this.tilesPanel.append(tile);
            }
        },
        createId: function (index) {
            return "tile_" + this.currentCount + "_" + index;
        },
        createTile: function (tmd) {
            var size = tileSize[tmd.type];
            var th = 0;
            var tile = $("<div class='tile'/>");
            tile.addClass(tmd.type);
            tile.css("background-color", tmd.bgColor);

            //内容显示区
            var content = null;
            //标题显示区
            var title = null;
            var span = null;
            var smallIcon = null;
            if (tmd.type !== tileType.small) {
                content = $("<div class='tile-content'/>");
                tile.append(content);

                title = $("<div class='tile-title'/>");
                span = $("<span />");
                span.text(tmd.title);
                title.append(span);
                tile.append(title);

                if (tmd.icon) {
                    smallIcon = $("<img class='small-icon' />");
                    smallIcon.prop("src", tmd.icon);
                    tile.append(smallIcon);
                }

                th = titleHeight;
            } else {
                tile.prop("title", tmd.title);
            }
            //图标显示
            var icon = null;
            if(tmd.icon) {
                icon = $("<img class='tile-icon' />");
                icon.prop("src", tmd.icon);
                icon.css({
                    "width": size.iconSize + "px",
                    "height": size.iconSize + "px",
                    "left": (size.width - size.iconSize) / 2 + "px",
                    "top": (size.height - th / 2 - size.iconSize) / 2 + "px"
                });
                if (content) {
                    content.append(icon);
                } else {
                    tile.append(icon);
                }
            }
            //显示更新区域
            var updatePanel = null;
            if (content) {
                updatePanel = this.createUpdateContentPanel(size.height - th, size.width);
                content.append(updatePanel);
            }
            //添加超链接
            var link = null;
            if (tmd.link) {
                link = $("<a class='tile-link'></a>");
                link.addClass(tmd.type);
                link.prop("href", tmd.link);
                tile.append(link);
            }

            return tile;
        },
        createUpdateContentPanel: function (contentHeight, width) {
            var panel = $("<div class='update-panel' />");
            panel.css({
                "top": contentHeight + "px",
                "width": width + "px",
                "height": contentHeight + "px"
            });
            return panel;
        },
        setTilesLocation: function () {
            var tiles = this.tiles,
                tile = null;
            var maxHeight = this.tilesPanel.height();
            var size;
            var columnCount = 0,
                top = 0, left = 0,
                oldWidth = 0, oldHeight = 0,
                height = 0, width = 0,
                totalWidth = 0;
            var surplusWidth = 0, surplusHeight = 0,
                currentMaxWidth = 0,
                flag;
            var i = 0;
            for (; i < tiles.length; i++) {
                tile = tiles[i];
                size = tileSize[this.option.tiles[i].type];
                height = size.height;
                width = size.width;
                currentMaxWidth = maxWidth * (columnCount + 1) + margin * columnCount;

                flag = left + width > currentMaxWidth;
                if (!flag) {
                    if (height < oldHeight) {
                        surplusHeight = oldHeight - height;
                        surplusWidth = oldWidth;
                    }
                }
                if (flag) {
                    top += oldHeight + margin;
                    left = maxWidth * columnCount + margin * columnCount;
                    if (surplusHeight > 0) {
                        left += surplusWidth + margin;
                        surplusHeight -= height + margin;
                    }
                }
                if (top + height > maxHeight) {
                    top = 0;
                    columnCount++;
                    left = maxWidth * columnCount + margin * columnCount;
                }

                tile.css({
                    "top": top + "px", "left": left + "px"
                });
                left += width + margin;
                if (left > totalWidth)
                    totalWidth = left;

                oldWidth = width;
                oldHeight = height;
            }
            this.panel.css("width", totalWidth + margin + marginLeft - margin + "px");
        },
        resetLocation: function () {
            if (tileDisplay.length == 0) {
                this.panel.css("left", marginLeft + "px");
                return;
            }

            var i = 0;
            var len = tileDisplay.length;
            var index = -1;
            for (; i < len; i++) {
                if (tileDisplay[i] == this) {
                    index = i;
                    break;
                }
            }
            if (index == -1) {
                index = len;
            }
            var width = 0;
            for (i = 0; i < index; i++) {
                width += tileDisplay[i].panel.width();
            }
            width += marginLeft;
            this.panel.css("left", width + "px");
        },
        setVerticalTilesLocation: function() {
            var tiles = this.tiles,
                tile = null;
            var size;
            var top = 0, left = 0,
                oldWidth = 0, oldHeight = 0,
                height = 0, width = 0,
                totalHeight = 0;
            var surplusWidth = 0, surplusHeight = 0,
                currentMaxWidth = 0,
                flag;
            var i;
            for (i = 0; i < tiles.length; i++) {
                tile = tiles[i];
                size = tileSize[this.option.tiles[i].type];
                height = size.height;
                width = size.width;
                currentMaxWidth = maxWidth + margin * 2;

                flag = left + width > currentMaxWidth;
                if (!flag) {
                    if (height < oldHeight) {
                        surplusHeight = oldHeight - height;
                        surplusWidth = oldWidth;
                    }
                }
                if (flag) {
                    top += oldHeight + margin;
                    left = 0;
                    if (surplusHeight > 0) {
                        left += surplusWidth + margin;
                        surplusHeight -= height + margin;
                    }
                }

                tile.css({
                    "top": top + "px", "left": left + "px"
                });

                left += width + margin;
                totalHeight = top + height + margin;

                oldWidth = width;
                oldHeight = height;
            }
            this.panel.css("height", (totalHeight + margin + this.titleHeight) + "px");
        },
        resetVerticalLocation: function () {
            this.panel.css("left", margin + "px");
            if (tileDisplay.length == 0) {
                this.panel.css("top", "0px");
                return;
            }

            var i = 0;
            var len = tileDisplay.length;
            var index = -1;
            for (; i < len; i++) {
                if (tileDisplay[i] == this) {
                    index = i;
                    break;
                }
            }
            if (index == -1) {
                index = len;
            }
            var height = 0;
            for (i = 0; i < index; i++) {
                height += tileDisplay[i].panel.height();
            }
            this.panel.css("top", height + "px");
        },
        showSmallIcon: function (tile) {
            var smallIcon = tile.find(".small-icon");
            if (smallIcon.length > 0 && !smallIcon.hasClass("show")) {
                smallIcon.addClass("show");
            }
        },
        initUpdateHandlers: function () {
            var i;
            var handlers = this.option.updateHandlers;
            var handlerInfo = null;
            if (handlers && handlers.length > 0) {
                for (i = 0; i < handlers.length; i++) {
                    handlerInfo = handlers[i];
                    handlerInfo.index = i;
                    handlerInfo.currentIndex = -1;
                    if (this.checkDynamicTile(handlerInfo) && $.isFunction(handlerInfo.func)) {
                        handlerInfo.func = this.createHandlerFunc(handlerInfo.func, handlerInfo);
                        handlerInfo.canCall = true;
                        handlerInfo.next = nextFunc;
                        if (!$.isNumeric(handlerInfo.interval)) {
                            handlerInfo.interval = 60;
                        }
                    }
                }
            }
        },
        createHandlerFunc: function(func, handlerInfo) {
            return function () {
                func.apply(handlerInfo, [handlerInfo]);
            };
        },
        checkDynamicTile: function (handlerInfo) {
            var names = handlerInfo.tileNames;
            var i;
            var tile;
            handlerInfo.tileIndex = [];
            if (Array.isArray(names)) {
                for (i = 0; i < names.length; i++) {
                    tile = this.findOpTileByName(names[i], handlerInfo.tileIndex);
                    if (!tile) {
                        continue;
                    }
                    if (tile.type === tileType.small) {
                        throw new Error("small tile can not update !");
                    }
                }
            } else if (typeof names === "string") {
                tile = this.findOpTileByName(names, handlerInfo.tileIndex);
                if (!tile) {
                    return false;
                }
                if (tile.type === tileType.small) {
                    throw new Error("small tile can not update !");
                }
            }
            return true;
        },
        findOpTileByName: function (name, indexes) {
            var opTile = null;
            for (var i = 0, l = this.option.tiles.length; i < l; i++) {
                opTile = this.option.tiles[i];
                if (opTile.name && opTile.name === name) {
                    indexes.push(i);
                    return opTile;
                }
            }
            indexes.push(null);
            return opTile;
        },
        updateStart: function () {
            var i;
            var handlerInfo;
            for (i = 0; i < this.option.updateHandlers.length; i++) {
                handlerInfo = this.option.updateHandlers[i];
                if (handlerInfo.canCall) {
                    handlerInfo.func(handlerInfo);
                }
            }
        },
        updateContinue: function (handlerInfo) {
            if (!handlerInfo) return;
            handlerInfo.intervalKey = setTimeout(handlerInfo.func,
                handlerInfo.interval * 1000 * 60);
        },
        //默认磁贴更新
        updateContent: function (tileIndex, content) {
            if (!$.isNumeric(tileIndex))
                return;

            var tile = this.tiles[tileIndex];
            var opTile = this.getOptionTile(tile.prop("id"));
            if(!tile) {
                return;
            }
            var contentPanel, updatePanel;
            contentPanel = tile.find(".tile-content");
            updatePanel = contentPanel.find(".update-panel");
            updatePanel.html("");

            var elem = null;
            var arr = [], i;
            if (typeof content === "string") {
                elem = $("<p />");
                elem.html("<span>" + content + "</span>");
                updatePanel.append(elem);
            } else if (Array.isArray(content)) {
                elem = $("<p />");
                for (i = 0; i < content.length; i++) {
                    arr.push("<span>", content[i], "</span>");
                    if (i < content.length - 1)
                        arr.push("<br />");
                }
                elem.html(arr.join(""));
                updatePanel.append(elem);
            } else if ($.isFunction(content)) {
                content.call(this, updatePanel);
            } else {
                return;
            }

            this.showSmallIcon(tile);
            if (hasAnimation) {
                contentPanel.scrollTop(0);
                this.updatePlay(contentPanel, opTile);
            }
        },
        //完整磁贴更新，不再显示磁贴的标题和图标
        updateFullContent: function (tileIndex, content, bgColor) {
            if (!$.isNumeric(tileIndex))
                return;
            var tile = this.tiles[tileIndex];
            if (!tile) {
                return;
            }
            var contentPanel = tile.find(".tile-content"),
                updatePanel = contentPanel.find(".update-panel"),
                opTile = this.getOptionTile(tile.prop("id")),
                size = this.getSize(opTile.type);
            if (!Array.isArray(this._contentState)) {
                this._contentState = [];
            }
            if (!this._contentState[tileIndex]) {
                contentPanel.css("height", size.height + "px");
                updatePanel.css({
                    "color": "#666666",
                    "top": (size.height + borderTopWidth) + "px",
                    "height": (size.height - borderTopWidth) + "px"
                });
                this._contentState[tileIndex] = true;
            }
            if (typeof bgColor !== "string" || bgColor.length == 0) {
                bgColor = defaultBackground;
            }
            updatePanel.css("background-color", bgColor);

            if ($.isFunction(content)) {
                content = content();
            }
            updatePanel.html("").append(content);

            tile.find(".tile-title").css("display", "none");
            if (hasAnimation) {
                contentPanel.scrollTop(0);
                this.updatePlay(contentPanel, opTile, function (c, s) {
                    this.change = s.height;
                });
            }
        },
        updatePlay: function (content, opTile, func) {
            if (!opTile.animationOption) return;

            var size = tileSize[opTile.type];
            content.animationStop();
            if ($.isFunction(func)) {
                func.call(opTile.animationOption, content, size);
            } else {
                opTile.animationOption.change = size.height - titleHeight;
            }
            opTile.animationOption.begin = content.scrollTop();
            opTile.animationOption.end = opTile.animationOption.begin + opTile.animationOption.change;
            opTile.animationOption.onChange = function (val) {
                content.scrollTop(val);
            };
            content.animationStart(opTile.animationOption);
        },
        getUpdateTile: function (updateHandlerIndex) {
            var handlerInfo = this.option.updateHandlers[updateHandlerIndex];
            var result = [], i;
            var tileIndex = handlerInfo.tileIndex;
            for (i = 0; i < tileIndex.length; i++) {
                result.push(this.tiles[tileIndex]);
            }
            return result;
        },
        getOptionTile: function (id) {
            if (!id) {
                return null;
            }
            var arr = id.split("_");
            var index = parseInt(arr[arr.length - 1], 10);
            var opTile = this.option.tiles[index];
            return opTile;
        },
        getSize: function (value) {
            if (typeof value === "string") {
                return tileSize[value];
            } else if ($.isNumeric(value)) {
                return tileSize[this.option.tiles[parseInt(value, 10)]];
            }
        },
        resetPanelHeight: function (height) {
            var tileHeight = tileSize.medium.height;
            var count = window.parseInt((height - 8) / (tileHeight + 8), 10);
            var panelHeight = count * (tileHeight + 8);
            this.tilesPanel.css("height", panelHeight + "px");
            this.setTilesLocation();
            this.resetLocation();
        },
        resetPanelWidth: function (width) {
            var tileWidth = tileSize.medium.width;
            var count = window.parseInt((width - 8) / (tileWidth + 8), 10);
            var panelWidth = count * (tileWidth + 8);
            this.tilesPanel.css("width", panelWidth + "px");
            this.setVerticalTilesLocation();
            this.resetVerticalLocation();
        }
    };

    $.fn.renderTiles = function () {
        if (!tileDisplay) {
            tileDisplay = createTileDisplay(this);
        };

        var value = arguments[0];
        var i = 0;
        if ($.isNumeric(value)) {
            tileDisplay.baseValue = parseInt(value, 10);
            i = 1;
        } else {
            tileDisplay.baseValue = tileSize.medium.height * 3 + margin * 3;
        }
        var vertical = false;
        if (i == 0 && ui.core.type(arguments[0]) === "boolean") {
            i = 1;
            vertical = arguments[0];
        } else if (ui.core.type(arguments[1]) === "boolean") {
            i = 2;
            vertical = arguments[1];
        }
        tileDisplay.vertical = vertical;
        if (vertical) {
            tileDisplay.baseValue = tileSize.medium.width * 2 + margin * 3;
        }

        var option = null;
        var j;
        for (; i < arguments.length; i++) {
            option = arguments[i];
            if (option) {
                if (Array.isArray(option)) {
                    for (j = 0; j < option.length; j++) {
                        tileDisplay.addTiles(option[j], this);
                    }
                } else {
                    tileDisplay.addTiles(option, this);
                }
            }
        }
        
        return tileDisplay;
    };
})();

///日期时间磁贴
(function () {
    var weekChars = "日一二三四五六";

    var TileDatetime = function () {
        this.timePanel = null;
        this.datePanel = null;
    };
    TileDatetime.prototype = {
        getTime: function () {
            var date = new Date();
            var hour = date.getHours();
            var minute = date.getMinutes();
            return [hour < 10 ? "0" + hour : hour.toString(),
                minute < 10 ? "0" + minute : minute.toString()];
        },
        timeWide: function () {
            var content = this.timePanel.find(".tile-content");
            var times = this.getTime();
            var hour = $("<span />").text(times[0]);
            var spliter = $("<span />").text(":").addClass("time-spliter");
            var minute = $("<span />").text(times[1]);
            if (content.length > 0) {
                content.addClass("time-wide");
                content.html("");
                content.append(hour)
                        .append(spliter)
                        .append(minute);
            }
        },
        timeMedium: function () {
            var content = this.timePanel.find(".tile-content");
            var times = this.getTime();
            var hour = $("<span class='hour-text' />").text(times[0]);
            var minute = $("<span class='minute-text' />").text(times[1]);
            if (content.length > 0) {
                content.addClass("time-medium");
                content.html("");
                content.append(hour)
                        .append("<span class='hour'>时</span>")
                        .append("<hr />")
                        .append(minute)
                        .append("<span class='minute'>分</span>");
            }
        },

        getDate: function () {
            var date = new Date();
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var day = date.getDate();
            var week = date.getDay();

            return [year.toString(),
                month < 10 ? "0" + month : month.toString(),
                day < 10 ? "0" + day : day.toString(),
                week];
        },
        dateWide: function () {
            var content = this.datePanel.find(".tile-content");
            var dates = this.getDate();
            var year = $("<span class='year' />").text(dates[0]);
            var date = $("<span class='date' />").text(dates[1] + "月" + dates[2] + "日 ("
                + "星期" + weekChars.charAt(dates[3]) + ")");

            if (content.length > 0) {
                content.addClass("date-wide");
                content.html("");
                this.datePanel.find(".small-icon").addClass("show");
                content.append(year).append("<br />").append(date);
            }
        },
        dateMedium: function () {
            var content = this.datePanel.find(".tile-content");
            var dates = this.getDate();
            var yearMonth = $("<span />").text(dates[0] + "年" + dates[1] + "月");
            var week = $("<span />").text("星期" + weekChars.charAt(dates[3]));
            var day = $("<span class='day' />").text(dates[2]);

            if (content.length > 0) {
                content.addClass("date-medium");
                content.html("");
                content.append(yearMonth).append("<br />").append(week).append(day);
            }
        }
    };

    var datetime = new TileDatetime();

    $.fn.updateDate = function (tilesCtrl, weatherInfo) {
        if (!this.hasClass("tile")) {
            throw new Error("element is not tile !");
        }
        var id = this.prop("id");
        var opTile = tilesCtrl.getOptionTile(id);
        datetime.datePanel = this;
        if (opTile.type === "wide") {
            datetime.dateWide();
        } else if (opTile.type === "medium") {
            datetime.dateMedium();
        } else {
            throw new Error("weather must be large or wide tile !");
        }
    };

    $.fn.updateTime = function (tilesCtrl) {
        if (!this.hasClass("tile")) {
            throw new Error("element is not tile !");
        }
        var id = this.prop("id");
        var opTile = tilesCtrl.getOptionTile(id);
        datetime.timePanel = this;
        if (opTile.type === "wide") {
            datetime.timeWide();
        } else if (opTile.type === "medium") {
            datetime.timeMedium();
        } else {
            throw new Error("weather must be large or wide tile !");
        }
    };
})();

//天气预报
(function () {
    var TileWeather = function () {
        this.weatherInfo = null;
        this.weatherPanel = null;
        this.size = null;
    };
    TileWeather.prototype = {
        createWeahterPanel: function () {
            var li = null,
                image = null,
                text = null,
                day = null,
                n = "";
            var weather = this.weatherPanel.find(".weather-panel");
            var hasWeather = weather.length > 0;
            if (!hasWeather) {
                weather = $("<div class='weather-panel large' />");
            }

            var info = this.weatherInfo;
            if (info.DayOrNight === 1) {
                weather.css("background-color", "#021C29");
                n = "N";
            } else {
                weather.css("background-color", "#7EA9D8");
            }

            var el = null,
                i = 0, l = info.Days.length;
            if (l < 6) {
                l = 6;
            }
            for (; i < l; i++) {
                day = info.Days[i];
                li = $("<li />");
                if (day) {
                    image = $("<div  class=\"image-info\" />");
                    image.css("background-image", "url(/Content/weather/" + n + day.Type + ".jpg)");
                    image.append("<div class=\"temperature\">" + (i == 0 ? info.Current.Temperature + "℃" : "&nbsp;") + "</div>");
                    image.append("<div>" + day.Description + ", " + day.Celsius + "</div>");
                    image.append("<div>" + day.WindInfo + "</div>");

                    text = $("<div class=\"text-info\">");
                    text.append($("<span>" + ui.str.dateFormat(ui.str.jsonToDate(day.Date), "yyyy/MM/dd wk") + "</span>"));
                    el = $("<span class=\"wtext\">" + day.Description + ", " + day.Celsius + "</span>");
                    text.append(el);
                    if (i == 0) {
                        li.addClass("curr").css("height", "134px");
                        el.css("display", "none");
                    } else {
                        image.css("display", "none");
                    }
                    if (i == l - 1)
                        li.css("border-bottom", "0px none");
                    li.append(image).append(text);
                } else {
                    li.append($("<div class=\"text-info nothing\">").css("cursor", "default"));
                }
                weather.append(li);
            }
            if (!hasWeather) {
                this.weatherPanel.append(weather);
            }
            this.weatherPanel.find("div.text-info").click(
                $.proxy(this.textInfoClick, this));
        },
        textInfoClick: function (e) {
            var weather = this.weatherPanel,
                    curr = weather.find("li.curr"),
                    li = $(e.target),
                    nodeName;
            if (li.hasClass("nothing")) {
                return;
            }
            while ((nodeName = li.nodeName()) !== "LI") {
                if (nodeName === "UL") {
                    return;
                }
                li = li.parent();
            }
            if (li.hasClass("curr")) {
                return false;
            }
            curr.find(".wtext").css("display", "inline");
            curr.find(".image-info").fadeOut();
            curr.removeClass("curr");
            weather.find("li").stop().animate({
                "height": 25
            });
            li.stop().addClass("curr").find(".wtext").css("display", "none");
            li.animate({
                "height": 134
            });
            weather.find("li.curr .image-info").fadeIn();
        }
    };

    $.fn.updateWeather = function (tilesCtrl, weatherInfo) {
        if (!this.hasClass("tile")) {
            throw new Error("element is not tile !");
        }
        var id = this.prop("id");
        var opTile = tilesCtrl.getOptionTile(id);
        if (opTile.type !== "large") {
            throw new Error("weather must be large tile !");
        }
        if (!weatherInfo || !weatherInfo.Days) {
            return;
        }
        var weatherTile = new TileWeather();
        weatherTile.weatherInfo = weatherInfo;
        weatherTile.weatherPanel = this;
        weatherInfo.size = tilesCtrl.getSize(opTile.type);
        weatherTile.createWeahterPanel();
    };
})();