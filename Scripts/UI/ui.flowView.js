; (function () {
    var selectedClass = "view-item-selected";

    //event type
    var pageTurning = "pageTurning",
        selecting = "selecting",
        selected = "selected",
        deselected = "deselected",
        rebind = "rebind";

    var preparePager = function (pager) {
        if (pager.displayDataInfo !== false) {
            pager.displayDataInfo = true;
            pager.pageInfoFormatter = {
                currentRowNum: function(val) {
                    return "<span>本页" + val + "项</span>";
                },
                rowCount: function(val) {
                    return "<span class='font-highlight'>共" + val + "项</span>";
                },
                pageCount: function(val) {
                    return "<span>" + val + "页</span>";
                }
            };
        }

        if (!$.isNumeric(pager.pageIndex) && !$.isNumeric(pager.pageSize)) {
            return;
        }
        this.pager = new ui.ctrls.Pager(pager);
        this.pageIndex = this.pager.pageIndex;
        this.pageSize = this.pager.pageSize;
    };

    var ctrl = ui.define("ctrls.FlowView", {
        _getOption: function() {
            return {
                data: null,
                promptText: "没有数据",
                width: false,
                height: false,
                itemWidth: 200,
                itemHeight: 200,
                renderItem: null,
                pager: {
                    pageIndex: 1,
                    pageSize: 30,
                    pageButtonCount: 5,
                    displayDataInfo: true
                },
                selection: {
                    multiple: false
                }
            };
        },
        _getEvents: function() {
            return [pageTurning, selecting, selected, deselected, rebind];
        },
        _create: function() {
            this.data = null;
            this.selectList = [];

            this.hasPrompt = !!this.option.promptText;
            this.viewBody = null;
            this.pagePanel = null;

            this.pagerHeight = 30;
            this.pager = null;
            if(this.option.pager) {
                preparePager.call(this, this.option.pager);
            }
        },
        _init: function() {
            if (!this.element) {
                return;
            }

            this._initBorderWidth();

            this.viewBody = $("<div class='view-body' />");
            if (this.hasPrompt) {
                this.dataPrompt = $("<div class='data-prompt'>");
                this.viewBody.append(this.dataPrompt);
                this._initDataPrompt();
            }
            this.element.append(this.viewBody);

            if (this.pager) {
                this.gridFoot = $("<div class='view-foot' />");
                this.pager.pageNumPanel = $("<div class='page-panel' />");
                if (this.option.pager.displayDataInfo) {
                    this.pager.pageInfoPanel = $("<div class='data-info' />");
                    this.gridFoot.append(this.pager.pageInfoPanel)
                } else {
                    this.pager.pageNumPanel.css("width", "100%");
                }

                this.gridFoot.append(this.pager.pageNumPanel).append($("<br style='clear:both' />"));
                this.element.append(this.gridFoot);
                this.pager.pageChanged(function(pageIndex, pageSize) {
                    this.pageIndex = pageIndex;
                    this.pageSize = pageSize;
                    this.fire(pageTurning, pageIndex, pageSize);
                }, this);
            }

            this.setSize(this.option.width, this.option.height);
        },
        _initBorderWidth: function () {
            this.borderHeight = 0;
            var bw = parseInt(this.element.css("border-top-width"), 10);
            if (isNaN(bw)) {
                bw = 0;
            }
            this.borderHeight += bw;
            bw = parseInt(this.element.css("border-bottom-width"), 10);
            if (isNaN(bw)) {
                bw = 0;
            }
            this.borderHeight += bw;

            this.borderWidth = 0;
            bw = parseInt(this.element.css("border-left-width"), 10);
            if (isNaN(bw)) {
                bw = 0;
            }
            this.borderWidth += bw;
            bw = parseInt(this.element.css("border-right-width"), 10);
            if (isNaN(bw)) {
                bw = 0;
            }
            this.borderWidth += bw;
        },
        fill: function(data, rowCount) {
            var isRebind = false;
            if(!this.viewPanel) {
                this.viewPanel = $("<div class='view-panel'/>");
                if(this.option.selection)
                    this.viewPanel.click($.proxy(this.onElementSelected, this));
                this.viewBody.append(this.viewPanel);
            } else {
                this.viewBody.scrollTop(0);
                this.empty(false);
                isRebind = true;
            }
            this.data = data;
            if (!Array.isArray(this.data)) {
                this.data = [];
            }
            if (this.data.length == 0) {
                this.showDataPrompt();
                return;
            } else {
                this.hideDataPrompt();
            }
            this._rasterizeItems(data, function(itemData, index, top, left) {
                var elem = this._createItem(itemData, index);
                elem.css({
                    "top": top + "px",
                    "left": left + "px"
                });
                this._renderItem(elem, itemData, index);
                this.viewPanel.append(elem);
            });

            //update page numbers
            if ($.isNumeric(rowCount)) {
                this.renderPageList(rowCount);
            }

            if (isRebind) {
                this.fire(rebind);
            }
        },
        _createItem: function(itemData, index) {
            var div = $("<div class='view-item' />");
            div.css({
                "width": this.option.itemWidth + "px",
                "height": this.option.itemHeight + "px"
            });
            div.attr("data-index", index);
            return div;
        },
        _renderItem: function(itemElement, itemData, index) {
            var elem, frame;
            if($.isFunction(this.option.renderItem)) {
                elem = this.option.renderItem.call(this, itemData, index);
                if(elem) {
                    itemElement.append(elem);
                }
            }
            frame = $("<div class='frame-panel border-highlight'/>");
            frame.css({
                "width": this.option.itemWidth - 8 + "px",
                "height": this.option.itemHeight - 8 + "px"
            });
            itemElement.append(frame);
            itemElement.append("<i class='check-marker border-highlight'></i>");
            itemElement.append("<i class='check-icon fa fa-check'></i>");
        },
        renderPageList: function(rowCount) {
            if (!this.pager) {
                return;
            }
            this.pager.data = this.data;
            this.pager.pageIndex = this.pageIndex;
            this.pager.pageSize = this.pageSize;
            this.pager.renderPageList(rowCount);
        },
        _getMargin: function(length, scrollHeight) {
            var currentWidth = this.viewBody.width(),
                currentHeight = this.viewBody.height(),
                result,
                restWidth,
                flag,
                checkOverflow = function(len, res) {
                    if(res.count == 0) {
                        return res;
                    }
                    var sh = Math.floor((len + res.count - 1) / res.count) * (res.margin + this.option.itemHeight) + res.margin;
                    if(sh > currentHeight) {
                        return this._getMargin(len, sh);
                    } else {
                        return res;
                    }
                };
            if(scrollHeight) {
                flag = true;
                if(scrollHeight > currentHeight) {
                    currentWidth -= ui.scrollbarWidth;
                }
            }
            result = {
                count: Math.floor(currentWidth / this.option.itemWidth),
                margin: 0
            };
            restWidth = currentWidth - result.count * this.option.itemWidth;
            result.margin = Math.floor(restWidth / (result.count + 1));
            if(result.margin >= 3) {
                return flag ? result : checkOverflow.call(this, length, result);
            }
            result.margin = 3;

            result.count = Math.floor((currentWidth - ((result.count + 1) * result.margin)) / this.option.itemWidth);
            restWidth = currentWidth - result.count * this.option.itemWidth;
            result.margin = Math.floor(restWidth / (result.count + 1));

            return flag ? result : checkOverflow.call(this, length, result);
        },
        _rasterizeItems: function(arr, func) {
            if(arr.length == 0) {
                return;
            }
            var d = this._getMargin(arr.length);
            if(d.count == 0) return;
            var i = 0, j,
                index,
                top, left,
                isFunction = $.isFunction(func),
                rows = Math.floor((arr.length + d.count - 1) / d.count);
            this.viewPanel.css("height", (rows * (this.option.itemHeight + d.margin) + d.margin) + "px");
            for(; i < rows; i++) {
                for(j = 0; j < d.count; j++) {
                    index = (i * d.count) + j;
                    if(index >= arr.length) {
                        return;
                    }
                    top = (i + 1) * d.margin + (i * this.option.itemHeight);
                    left = (j + 1) * d.margin + (j * this.option.itemWidth);
                    if(isFunction) {
                        func.call(this, arr[index], index, top, left);
                    }
                }
            }
        },
        setLocation: function() {
            if(!this.viewPanel)
                return;
            var arr = this.viewPanel.children();
            this._rasterizeItems(arr, function(item, index, top, left) {
                $(item).css({
                    "top": top + "px",
                    "left": left + "px"
                });
            });
        },
        /**
         * 获取当前尺寸下一行能显示多少个元素
         */
        getColumnCount: function() {

        },
        empty: function () {
            if (this.viewPanel) {
                this.viewPanel.html("");
                this.data = null;
                this.selectList = [];
                this.current = null;
            }
            if (this.pager) {
                this.pager.empty();
            }
            if (arguments[0] !== false) {
                this.showDataPrompt();
            }
        },
        //设置内容显示区域的高度
        setHeight: function (height) {
            if ($.isNumeric(height)) {
                height -= this.borderHeight;
                if (this.pager)
                    height -= this.pagerHeight;
                this.viewBody.css("height", height + "px");
                if (arguments.length == 1) {
                    if (this.promptIsShow()) {
                        this._setPromptLocation();
                    } else {
                        this.setLocation();
                    }
                }
            }
        },
        //设置内容显示区域宽度
        setWidth: function (width) {
            if ($.isNumeric(width)) {
                width -= this.borderWidth;
                this.element.css("width", width + "px");
                if (arguments.length == 1) {
                    if (this.promptIsShow()) {
                        this._setPromptLocation();
                    }
                }
            }
        },
        setSize: function (width, height) {
            this.setWidth(width, false);
            this.setHeight(height, false);
            if (this.promptIsShow()) {
                this._setPromptLocation();
            }
        },
        _initDataPrompt: function () {
            var text = this.option.promptText;
            if (ui.core.type(text) === "string" && text.length > 0) {
                this.dataPrompt.html("<span class='font-highlight'>" + text + "</span>");
            } else if ($.isFunction(text)) {
                text = text();
                this.dataPrompt.append(text);
            }
        },
        _setPromptLocation: function () {
            var height = this.dataPrompt.height();
            this.dataPrompt.css("margin-top", -(height / 2) + "px");
        },
        showDataPrompt: function () {
            if (!this.hasPrompt) {
                return;
            }
            this.dataPrompt.css("display", "block");
            this._setPromptLocation();
        },
        hideDataPrompt: function () {
            if (!this.hasPrompt) {
                return;
            }
            this.dataPrompt.css("display", "none");
        },
        promptIsShow: function () {
            return this.hasPrompt && this.dataPrompt.css("display") === "block";
        },
        onElementSelected: function(e) {
            var elem = $(e.target);
            while(!elem.hasClass("view-item")) {
                if(elem.hasClass("view-panel")) {
                    return;
                }
                elem = elem.parent();
            }
            if (this.option.selection.multiple === true) {
                this.multipleSelection(elem);
            } else {
                this.singleSelection(elem);
            }
        },
        _prepareData: function(elem) {
            var index = parseInt(elem.attr("data-index"), 10);
            var data = {
                itemIndex: index,
                itemData: this.data[index]
            };
            return data;
        },
        multipleSelection: function(elem) {
            var data = null,
                i, result;
            if(elem.hasClass(selectedClass)) {
                elem.removeClass(selectedClass);
                for(i = 0; i < this.selectList.length; i++) {
                    if(this.selectList[i][0] === elem[0]) {
                        this.selectList.splice(i, 1);
                        break;
                    }
                }
                data = this._prepareData(elem);
                this.fire(deselected, elem, data);
            } else {
                data = this._prepareData(elem);
                result = this.fire(selecting, elem, data);
                if (result === false) return;

                elem.addClass(selectedClass);
                this.selectList.push(elem);
                this.fire(selected, elem, data);
            }
        },
        singleSelection: function(elem) {
            var data = this._prepareData(elem),
                currentData;
            var result = this.fire(selecting, elem, data);
            if(result === false) return;
            if(this.current) {
                this.current.removeClass(selectedClass);
                currentData = this._prepareData(this.current);
                if(this.current[0] === elem[0]) {
                    this.fire(deselected, this.current, currentData);
                    this.current = null;
                    return;
                }
            }

            this.current = elem;
            this.current.addClass(selectedClass);
            this.fire(selected, this.current, data);
        },
        //获取当前选择项的数据
        getCurrentSelection: function () {
            var data = null;
            if (this.current)
                data = this._prepareData(this.current);
            return data;
        },
        //获取当前多选项中的数据
        getMultipleSelection: function () {
            var dataList = [];
            if (this.selectList) {
                for (var i = 0; i < this.selectList.length; i++) {
                    dataList.push(this._prepareData(this.selectList[i]));
                }
            }
            return dataList;
        },
        //取消选择
        cancelSelection: function () {
            if (this.option.selection.type === "disabled")
                return;
            var elem,
                data;
            if (this.option.selection.multiple) {
                if (this.selectList.length == 0) {
                    return;
                }
                data = [];
                for (var i = 0, l = this.selectList.length, temp; i < l; i++) {
                    elem = this.selectList[i];
                    elem.removeClass(selectedClass);
                    temp = this.prepareData(elem);
                    temp.element = elem;
                    data.push(temp);
                }
                elem = null;
                this.selectList = [];
            } else {
                if (!this.current) {
                    return;
                }
                elem = this.current;
                data = this._prepareData(elem);
                elem.removeClass(selectedClass);
                this.current = null;
            }
            this.fire(deselected, elem, data);
        },
        //获取项目数
        count: function() {
            if(!this.data) {
                return 0;
            }
            return this.data.length;
        },
        _getItemElement: function(index) {
            if(!this.viewPanel) {
                return null;
            }
            var items = this.viewPanel.children();
            var item = items[index];
            if(item) {
                return $(item);
            }
            return null;
        },
        _updateIndexes: function(start) {
            if(start < 0) {
                start = 0;
            }
            children = this.viewPanel.children();
            for(var i = start, len = children.length; i < len; i++) {
                $(children[i]).attr("data-index", i);
            }
        },
        //移除项目
        removeItem: function (item) {
            if (!item)
                return;
            if (!ui.core.isJQueryObject(item)) {
                item = $(item);
            }
            var index = parseInt(item.attr("data-index"), 10);
            if (this.current && this.current[0] == item[0]) {
                this.current = null;
            }
            item.remove();
            this._updateIndexes(index);
            
            this.data.splice(index, 1);
            this.setLocation();
        },
        //根据索引移除项目
        removeItemByIndex: function (itemIndex) {
            if (!this.data) {
                return;
            }
            if (itemIndex >= 0 && itemIndex < this.data.length) {
                this.removeItem(this._getItemElement(itemIndex));
            }
        },
        //更新项目
        updateItem: function (item, updateData) {
            if (!item || !updateData) {
                return;
            }
            if (!ui.core.isJQueryObject(item)) {
                item = $(item);
            }
            var index = parseInt(item.attr("data-index"), 10);
            item.html("");
            this.data[index] = updateData;
            this._renderItem(item, updateData, index);
        },
        //根据索引根系项目
        updateItemByIndex: function (itemIndex, updateData) {
            if (!this.data) {
                return;
            }
            if (itemIndex >= 0 && itemIndex < this.data.length) {
                this.updateItem(this._getItemElement(itemIndex), updateData);
            }
        },
        //追加项目
        appendItem: function (itemData) {
            if (!itemData) return;
            if (!Array.isArray(this.data) || this.data.length == 0) {
                if (this.viewPanel) {
                    this.viewPanel.remove();
                    this.viewPanel = null;
                }
                this.fill([itemData]);
                return;
            }
            var itemElem = this._createItem(itemData, this.data.length);
            this.data.push(itemData);
            this._renderItem(itemElem, itemData, this.data.length - 1);
            this.viewPanel.append(itemElem);
            this.setLocation();
        },
        //插入项目
        insertItem: function (itemIndex, itemData) {
            var itemElem = null;
            if (!itemData) return;
            if (!Array.isArray(this.data) || this.data.length == 0) {
                this.appendItem(itemData);
                return;
            }
            if (itemIndex < 0) {
                itemIndex = 0;
            }
            if (itemIndex >= 0 && itemIndex < this.data.length) {
                itemElem = this._createItem(itemData, itemIndex);
                this.data.splice(itemIndex, 0, itemData);
                this._renderItem(itemElem, itemData, itemIndex);
                this._getItemElement(itemIndex).before(itemElem);
                this._updateIndexes(itemIndex);
                this.setLocation();
            } else {
                this.appendItem(itemData);
            }
        }
    });

    $.fn.setFlowView = function (option) {
        if (this.length == 0) {
            return null;
        }

        return ctrl(option, this);
    };
})();
