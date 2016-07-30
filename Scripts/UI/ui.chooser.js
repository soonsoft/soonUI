; (function () {
    var buttonColor = ui.theme.highlight.button;

    var listPanelClass = "chooser-list-panel",
        chooseClass = "chooser-panel-choose-item",
        selectedClass = "chooser-panel-choose-item-selected",
        itemEmptyClass = "chooser-panel-choose-item-empty";
    
    var sizeInfo = {
        S: 3,
        M: 5,
        L: 9
    };

    var borderWidth = 2,
        defaultMargin = 0,
        defaultItemSize = 32,
        defaultSize = "M";

    var minWidth = 120;
    
    /// events
    var selecting = "selecting",
        selected = "selected";

    var chooserTypes = {
        hourMinute: function () {
            var data = [];
            //时
            var i, limit, item;
            limit = 24;
            item = {
                list: [],
                title: "时"
            };
            for (i = 0; i < limit; i++) {
                item.list[i] = (i < 10) ? "0" + i : i.toString();
            }
            data.push(item);
            //分
            limit = 60;
            item = {
                list: [],
                title: "分"
            };
            for (i = 0; i < limit; i++) {
                item.list[i] = (i < 10) ? "0" + i : i.toString();
            }
            data.push(item);

            this.option.spliter = ":";
            this.defaultSelectValue = function () {
                var now = new Date();
                var hour = now.getHours(),
                    minute = now.getMinutes();
                var values = [
                    hour < 10 ? "0" + hour : hour.toString(),
                    minute < 10 ? "0" + minute : minute.toString()
                ];
                return values;
            };

            return data;
        },
        time: function () {
            var data = [];
            //时
            var i, limit, item;
            limit = 24;
            item = {
                list: [],
                title: "时"
            };
            for (i = 0; i < limit; i++) {
                item.list[i] = (i < 10) ? "0" + i : i.toString();
            }
            data.push(item);
            //分
            limit = 60;
            item = {
                list: [],
                title: "分"
            };
            for (i = 0; i < limit; i++) {
                item.list[i] = (i < 10) ? "0" + i : i.toString();
            }
            data.push(item);
            //秒
            limit = 60;
            item = {
                list: [],
                title: "秒"
            };
            for (i = 0; i < limit; i++) {
                item.list[i] = (i < 10) ? "0" + i : i.toString();
            }
            data.push(item);

            this.option.spliter = ":";
            this.defaultSelectValue = function () {
                var now = new Date();
                var hour = now.getHours(),
                    minute = now.getMinutes(),
                    second = now.getSeconds();
                var values = [
                    hour < 10 ? "0" + hour : hour.toString(),
                    minute < 10 ? "0" + minute : minute.toString(),
                    second < 10 ? "0" + second : second.toString()
                ];
                return values;
            };

            return data;
        },
        yearMonth: function () {
            var data = [];
            var date = new Date();
            var year = date.getFullYear();
            var begin = year - 49,
                end = year + 50;
            var i, item;
            item = {
                list: [],
                title: "年"
            };
            for (i = begin; i <= end; i++) {
                item.list.push(i.toString());
            }
            data.push(item);

            begin = 1;
            end = 12;
            item = {
                list: [],
                title: "月"
            };
            for (i = begin; i <= end; i++) {
                item.list.push((i < 10) ? "0" + i : i.toString());
            }
            data.push(item);

            this.option.spliter = "-";
            this.defaultSelectValue = function () {
                var now = new Date();
                var year = now.getFullYear(),
                    month = now.getMonth() + 1;
                var values = [
                    year < 10 ? "0" + year : year.toString(),
                    month < 10 ? "0" + month : month.toString()
                ];
                return values;
            };

            return data;
        }
    };

    var ctrl = ui.define("ctrls.Chooser", ui.ctrls.DropDownPanel, {
        _getOption: function () {
            return {
                type: false,
                data: null,
                spliter: ".",
                margin: defaultMargin,
                size: defaultSize,
                itemSize: defaultItemSize
            };
        },
        _getEvents: function () {
            return [selecting, selected];
        },
        _create: function () {
            this._super();
            
            if (sizeInfo.hasOwnProperty(this.option.size)) {
                this.size = sizeInfo[this.option.size];
            } else {
                this.size = sizeInfo[defaultSize];
            }

            if ($.isNumeric(this.option.margin) && this.option.margin > 0) {
                this.margin = this.option.margin;
            } else {
                this.margin = defaultMargin;
            }

            if ($.isNumeric(this.option.itemSize) && this.option.itemSize > 0) {
                this.itemSize = this.option.itemSize;
            } else {
                this.itemSize = defaultItemSize;
            }

            this.width = this.element.width();
            if (this.width < this.itemSize + (this.margin * 2)) {
                this.width = minWidth;
            }

            this.panel = null;
            this.scrollData = null;

            this.defaultSelectValue = false;
        },
        _init: function () {
            this.panel = $("<div class='chooser-panel border-highlight' />");
            this.panel.css("width", this.width + "px");
            var itemTitlePanel = $("<div class='item-title-panel' />");
            var itemListPanel = $("<div class='item-list-panel' />");
            this._createFocusElement(itemListPanel);
            this._createItemList(itemTitlePanel, itemListPanel);

            this.panel.append(itemTitlePanel)
                .append(itemListPanel);
            
            this._selectTextClass = "select-text";
            this._showClass = "chooser-show";
            this._clearClass = "chooser-clear";
            this._clear = function () {
                this.element.val("");
            };
            this.wrapElement(this.element, this.panel);
            this._super();
            
            var that = this;
            this.element.off("focus");
            this.element.on("focus", function (e) {
                ui.hideAll(that);
                that.show();
                that.updateState();
            });
            this.panel.click(function (e) {
                e.stopPropagation();
            });
        },
        _createFocusElement: function(itemListPanel) {
            var div = $("<div class='focus-choose-element' />");
            div.addClass("border-highlight");
            div.css("top", this.itemSize * ((this.size - 1) / 2));
            itemListPanel.append(div);
        },
        _createItemList: function (itemTitlePanel, itemListPanel) {
            var sizeData = this._fillList(itemTitlePanel, itemListPanel);
            this.panel.css({
                "width": sizeData.width + "px"
            });

            itemListPanel.css("height", sizeData.height + "px");
        },
        _fillList: function (itemTitlePanel, itemListPanel) {
            this.scrollData = [];
            var sizeData = {
                width: 0,
                height: this.size * (this.itemSize + this.margin) + this.margin
            };
            if (chooserTypes.hasOwnProperty(this.option.type)) {
                this.scrollData = chooserTypes[this.option.type].apply(this);
            } else if (Array.isArray(this.option.data)) {
                this.scrollData = this.option.data;
            } else {
                return sizeData;
            }

            var div, css, ul, item, i, tsd;
            sizeData.width = 0;
            var tempWidth = Math.floor(this.width / this.scrollData.length);
            var surWidth = this.width - tempWidth * this.scrollData.length;
            var temp;
            for (i = 0; i < this.scrollData.length; i++) {
                item = this.scrollData[i];
                if(surWidth > 0) {
                    temp = 1;
                    surWidth--;
                } else {
                    temp = 0;
                }
                css = {
                    "left": sizeData.width + "px",
                    "width": (tempWidth + temp) + "px"
                };
                div = $("<div class='title-item font-highlight' />");
                div.css(css);
                div.text(item.title || "");
                itemTitlePanel.append(div);

                div = $("<div />").addClass(listPanelClass);
                div.css(css);
                div.data("index", i);

                tsd = this.scrollData[i];
                tsd.target = div;
                tsd.lastFlag = null;

                sizeData.width += tempWidth + temp + this.margin;

                div.mousewheel({ target: div }, $.proxy(this.onMousewheel, this));
                div.click($.proxy(this.onItemClick, this));
                
                ul = this._createList(item);
                div.append(ul);
                itemListPanel.append(div);
            }
            return sizeData;
        },
        _createList: function (listItem) {
            var attCount = parseInt((this.size - 1) / 2, 10);
            var list = listItem.list;
            var resultList = null;
            var tempArr, index, limit = attCount;
            index = list.length - 1;
            tempArr = [];
            while (limit > 0) {
                tempArr.splice(0, 0, null);
                index--;
                if (index < 0) {
                    index = list.length - 1;
                }
                limit--;
            }
            resultList = tempArr.concat(list);
            index = 0;
            tempArr = [];
            limit = attCount;
            while (limit > 0) {
                tempArr.push(null);
                index++;
                if (index == list.length) {
                    index = 0;
                }
                limit--;
            }
            resultList = resultList.concat(tempArr);

            var ul = $("<ul />"), li = null;
            var i;
            for (i = 0, limit = resultList.length; i < limit; i++) {
                li = this._createItem(resultList[i]);
                li.data("index", i);
                ul.append(li);
            }
            li.css("margin-bottom", this.margin + "px");
            return ul;
        },
        _createItem: function (text) {
            var li = $("<li />");
            var css = {
                width: this.itemSize,
                height: this.itemSize
            };
            
            li.addClass(chooseClass);
            if (!!text) {
                li.text(text);
            } else {
                li.addClass(itemEmptyClass);
            }
            return li;
        },

        ///animation
        easeTo: function (pos) {
            return Math.pow(pos, 0.25);
        },
        startScroll: function (item) {
            if (item.beginAnimation) {
                item.duration = 200;
                item.startTime = (new Date()).getTime();
                return;
            }
            
            this.deselectItem(item);

            item.startTime = (new Date()).getTime();
            item.duration = 100;
            item.beginAnimation = true;

            var that = this;
            var fps = 50;
            var div = item.target;
            var ease = this.easeTo;

            item.stopScrollHandler = setInterval(function () {
                //当前帧开始的时间
                var newTime = new Date().getTime(),
                    //逝去时间
                    timestamp = newTime - item.startTime,
                    delta = ease(timestamp / item.duration),
                    change = item.scrollEnd - item.scrollBegin,
                    currVal = Math.ceil(item.scrollBegin + delta * change);
                div.scrollTop(currVal);
                if (item.duration <= timestamp) {
                    div.scrollTop(item.scrollEnd);
                    that.stopScroll(item);
                    that.selectItem(item);
                }
            }, 1000 / fps);
        },
        stopScroll: function (item) {
            clearInterval(item.stopScrollHandler);
            item.beginAnimation = false;
        },
        ///events
        onMousewheel: function (e) {
            e.stopPropagation();
            var div = e.data.target;

            var index = div.data("index");
            var item = this.scrollData[index];
            var val = this.itemSize + this.margin,
                change = (-e.delta) * val,
                flag = -e.delta > 0;
            if (item.lastFlag === null)
                item.lastFlag = flag;
            if (item.lastFlag !== flag) {
                item.lastFlag = flag;
                this.stopScroll(item);
            }
            if (!item.beginAnimation) {
                item.scrollBegin = div.scrollTop();
                item.scrollEnd = parseInt((item.scrollBegin + change) / val, 10) * val;
            } else {
                item.scrollBegin = div.scrollTop();
                item.scrollEnd = parseInt((item.scrollEnd + change) / val, 10) * val;
            }
            this.startScroll(item);
            return false;
        },
        onItemClick: function (e) {
            e.stopPropagation();
            var elem = $(e.target);
            while (!elem.isNodeName("li")) {
                if (elem.hasClass(listPanelClass)) {
                    return;
                }
                elem = elem.parent();
            }
            if (elem.hasClass(itemEmptyClass)) {
                return;
            }
            if (elem.hasClass(selectedClass)) {
                return;
            }
            var index = elem.data("index");
            var item = this.scrollData[elem.parent().parent().data("index")];

            this.chooseItem(item, index);
        },
        ///ctrl function
        disIndex: function() {
            return Math.floor((this.size - 1) / 2);
        },
        getValues: function () {
            var disindex = this.disIndex();
            var values = [];
            var i, item, index;
            for (i = 0; i < this.scrollData.length; i++) {
                item = this.scrollData[i];
                if (item.current) {
                    index = item.current.data("index");
                    index -= disindex;
                    values.push(this.scrollData[i].list[index]);
                } else {
                    values.push("");
                }
            }
            return values;
        },
        setValues: function (values) {
            if (!Array.isArray(values)) {
                return;
            }
            var i, item, j;
            var idxArr = [];
            for (i = 0; i < values.length; i++) {
                item = this.scrollData[i];
                if (!item) {
                    continue;
                }
                idxArr[i] = 0;
                for (j = 0; j < item.list.length; j++) {
                    if (item.list[j] === values[i]) {
                        idxArr[i] = j;
                        break;
                    }
                }
            }
            this.setSelectState(idxArr);
        },
        setValue: function (value) {
            if (typeof value === "string") {
                this.setValues(value.split(this.option.spliter));
            }
        },
        chooseItem: function (item, index) {
            if (item.beginAnimation) {
                this.stopScroll(item);
            }
            index -= this.disIndex();
            item.scrollBegin = item.target.scrollTop();
            item.scrollEnd = index * (this.itemSize + this.margin);
            this.startScroll(item);
        },
        deselectItem: function (item) {
            if (item.current) {
                item.current.removeHighlight(selectedClass, "font");
                item.current = null;
            }
        },
        selectItem: function (item) {
            var ul = item.target.find("ul");
            var scrollTop = item.target.scrollTop();
            var index = parseInt(scrollTop / (this.itemSize + this.margin), 10);
            item.current = $(ul.children()[index + this.disIndex()]);
            item.current.addHighlight(selectedClass, "font");
            
            var i;
            for (i = 0; i < this.scrollData.length; i++) {
                if (this.scrollData[i].beginAnimation) {
                    return;
                }
            }
            var values = this.getValues();
            var text = values.join(this.option.spliter);

            var result = this.fire(selecting, text, values);
            if (result === false) {
                return;
            }

            this.element.val(text);
            this.fire(selected, text, values);
        },
        setTop: function (div, index) {
            if (index < 0)
                index = 0;
            var top = index * (this.itemSize + this.margin);
            div.scrollTop(top);
        },
        updateState: function () {
            var val = this.element.val(), i, indexArr;
            if (val.length > 0) {
                this.setValues(val.split(this.option.spliter));
            } else if ($.isFunction(this.defaultSelectValue)) {
                this.setValues(this.defaultSelectValue());
            } else {
                indexArr = [];
                for (i = 0; i < this.scrollData.length; i++) {
                    indexArr.push(0);
                }
                this.setSelectState(indexArr);
            }
        },
        setSelectState: function (indexArr) {
            if (!Array.isArray(indexArr)) {
                return;
            }
            if (indexArr.length != this.scrollData.length) {
                return;
            }
            var item, index, i;
            for (i = 0; i < indexArr.length; i++) {
                index = indexArr[i];
                item = this.scrollData[i];
                this.deselectItem(item);
                this.setTop(item.target, index);
                this.selectItem(item);
            }
        }
    });


    var extendType = function (type, func) {
        if (!$.isFunction(func)) {
            return;
        }
        if (typeof type === "string" && !chooserTypes.hasOwnProperty(type)) {
            chooserTypes[type] = func;
        }
    };

    $.fn.setChooser = function (option) {
        if (!this || this.length == 0) {
            return null;
        }
        return ctrl(option, this);
    };
})();