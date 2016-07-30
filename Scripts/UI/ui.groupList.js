; (function () {
    //class name
    var selectedClass = "item-selected",
        disabledClass = "disabled-button";
    //events type
    var pageTurning = "pageTurning",
        selecting = "selecting",
        selected = "selected",
        deselected = "deselected",
        rebind = "rebind";

    var borderTopWidth = 0;

    var ctrl = ui.define("ctrls.GroupList", {
        _getOption: function () {
            return {
                groupField: "",
                h1Field: "",
                h2Field: "",
                fillItem: false,
                data: null,
                multiple: false,
                pageIndex: null,
                pageSize: null,
                itemFormat: null,
                titleFixed: false
            };
        },
        _getEvents: function () {
            return [pageTurning, selecting, selected, deselected, rebind];
        },
        _create: function () {
            if (ui.core.type(this.option.groupField) !== "string") {
                this.option.groupField = "";
            }
            if (!$.isFunction(this.option.fillItem)) {
                this.option.fillItem = false;
            }
            this.option.multiple = !!this.option.multiple;

            this.data = this.option.data;
            if (!Array.isArray(this.data) || this.data.length == 0) {
                this.data = [];
            }
            this.selectList = [];
            this.titleList = [];

            this.titleHeight = 30;
            this.itemHeight = 40;

            this.pagingHeight = 30;
            this.pageIndex = this.option.pageIndex;
            this.pageSize = this.option.pageSize;
            this.hasPaging = false;
            this.rowCount = this.data.length;
            if ($.isNumeric(this.pageIndex) && $.isNumeric(this.pageSize)) {
                this.hasPaging = true;
            }
            if (this.hasPaging) {
                if (this.pageIndex < 1) {
                    this.pageIndex = 1;
                }
                if (this.pageSize < 1) {
                    this.pageSize = 100;
                }
                this._updatePageCount();
            }
            if ($.isFunction(this.option.itemFormat)) {
                this._formatItem = this.option.itemFormat;
            }
        },
        _init: function () {
            this.element.addClass("group-list");
            this.width = this.element.width();
            borderTopWidth = parseInt(this.element.css("border-top-width"), 10);
            if (!$.isNumeric(borderTopWidth) || borderTopWidth < 0) {
                borderTopWidth = 0;
            }

            this.contentPanel = $("<div class='list-content-panel' />");

            this.element.append(this.contentPanel);

            if (this.hasPaging) {
                this.pagingPanel = $("<div class='list-paging-panel' />");
                this.prev = $("<i class='prev' />");
                this.next = $("<i class='next' />");
                this.prev.click($.proxy(this.onPrevPagingHandler, this));
                this.next.click($.proxy(this.onNextPagingHandler, this));
                this._updatePagingButtons();
                this.pagingPanel.append(
                    $("<div>").append(this.prev).append(this.next));
                this.element.append(this.pagingPanel);
            }

            this.onItemClick = $.proxy(this.onItemClickHandler, this);
            this._fillList();
            var that = this;
            if (this.option.titleFixed) {
                this.contentPanel.blur(function (e) {
                    that.removeFixed(that.currentTitle);
                });
                this.contentPanel.scroll(function (e) {
                    that.onScrollHandler(e);
                });
            }
        },
        _fillList: function (isRebind) {
            this.empty(false);

            if (this.option.groupField.length == 0) {
                this._fillItems();
            } else {
                this._fillGroup();
            }

            this.listHeight = this.contentList.height();

            if (isRebind !== false) {
                this.fire(rebind);
            }
        },
        _fillGroup: function () {
            var dataList = this.groupData(this.data, this.option.groupField);
            var i, j, item,
                dt, dd, ul;
            this.contentList = $("<dl />");
            this.contentPanel.append(this.contentList);
            var tempTop = 0,
                tempCount = 0;
            for (i = 0; i < dataList.length; i++) {
                item = dataList[i];
                dt = $("<dt />");

                this.addTitle(item, tempTop, item.children.length * this.itemHeight);
                this.contentList.append(dt);
                dd = $("<dd />");
                ul = $("<ul />");
                ul.click(this.onItemClick);
                dd.append(ul);

                for (j = 0; j < item.children.length; j++) {
                    ul.append(this._createItem(item.children[j], (tempCount + j)));
                }
                tempCount += j;
                this.contentList.append(dd);

                tempTop += this.titleHeight + j * this.itemHeight;
            }
        },
        _fillItems: function () {
            var i, item, dd, ul;
            this.contentList = $("<dl />");
            this.contentPanel.append(this.contentList);
            var dataList = this.data;
            dd = $("<dd />");
            ul = $("<ul />");
            ul.click(this.onItemClick);
            dd.append(ul);
            for (i = 0; i < dataList.length; i++) {
                item = dataList[i];
                ul.append(this._createItem(item, i));
            }
            this.contentList.append(dd);
        },
        _createItem: function (item, index) {
            var li = $("<li />");
            li.data("index", index);
            this._formatItem(li, item);
            return li;
        },
        _formatItem: function(li, data) {
            var displayData = {
                h1: "",
                h2: ""
            };
            if (this.option.fillItem) {
                this.option.fillItem(displayData, data);
            } else {
                displayData.h1 = data[this.option.h1Field];
                displayData.h2 = data[this.option.h2Field];
            }
            li.append($("<span class='title-text' />").text(displayData.h1))
                .append("<br />")
                .append($("<span class='title-info-text' />").text(displayData.h2));
        },
        addTitle: function (item, top, childrenHeight) {
            var title = $("<div class='group-title' />");
            title.css("top", top + "px");
            title.append(
                $("<span class='titlebox font-highlight' />").text(item.text));
            this.contentPanel.append(title);
            this.titleList.push({
                elem: title,
                top: top,
                bottom: top + childrenHeight
            });
        },
        _checkPosition: function () {
            if (!this.fixedPosition) {
                this.fixedPosition = this.contentPanel.offset();
                this.fixedPosition.left += this.contentPanel.position().left;
                if ((/^(?:r|a|f)/).test(this.contentPanel.css("position"))) {
                    this.fixedPosition.left += parseInt(this.contentPanel.css("left"), 10) || 0;
                    this.fixedPosition.top += parseInt(this.contentPanel.css("top"), 10) || 0;
                }
            }
        },
        setFixed: function (title) {
            this._checkPosition();
            this.currentTitle = title;
            title.elem.addClass("title-fixed");
            title.elem.css({
                "top": this.fixedPosition.top + "px",
                "left": this.fixedPosition.left + "px",
                "width": this.width - ui.scrollbarWidth + "px"
            });
        },
        removeFixed: function (title) {
            if (title) {
                title.elem.removeClass("title-fixed");
                title.elem.css({
                    "top": title.top + "px",
                    "left": "0px",
                    "width": "100%"
                });
            }
        },

        /// events
        onItemClickHandler: function (e) {
            var elem = $(e.target),
                tagName;
            while ((tagName = elem.nodeName()) !== "LI") {
                if (tagName === "UL") {
                    return;
                }
                elem = elem.parent();
            }
            this.selectItem(elem);
        },
        onScrollHandler: function (e) {
            var scrollTop = this.contentPanel.scrollTop();
            var i = 1,
                len = this.titleList.length,
                title, nextTitle;
            if (len > i) {
                for (; i < len; i++) {
                    title = this.titleList[i];
                    if (title.top > scrollTop) {
                        nextTitle = title;
                        title = this.titleList[i - 1];
                        break;
                    }
                }
            } else if(i == len) {
                title = this.titleList[0];
            } else {
                return;
            }

            if (!nextTitle) {
                this.removeFixed(this.currentTitle);
                this.setFixed(title);
                return;
            }
            var val = nextTitle.top - scrollTop;

            if (!nextTitle || val >= this.titleHeight) {
                this.removeFixed(this.currentTitle);
                this.setFixed(title);
            } else {
                this.removeFixed(this.currentTitle);
                this.currentTitle = null;
                title.elem.css("top", scrollTop - (this.titleHeight - val) + "px");
            }

        },
        onPrevPagingHandler: function (e) {
            if (!this.prev.hasClass(disabledClass)) {
                this._doPaging(-1);
            }
        },
        onNextPagingHandler: function (e) {
            if (!this.next.hasClass(disabledClass)) {
                this._doPaging(1);
            }
        },

        ///logic
        _getItemData: function (elem) {
            var index = elem.data("index"),
                data = null;
            var itemData = this.data[index];
            if (!itemData) {
                return data;
            }
            return {
                index: index,
                itemData: itemData
            };
        },
        _doPaging: function (step) {
            this.pageIndex += step;
            this.fire(pageTurning, this.pageIndex, this.pageSize);
            this._updatePagingButtons();
        },
        _updatePageCount: function () {
            if (this.rowCount > 0) {
                this.pageCount = Math.floor((this.rowCount + this.pageSize - 1) / this.pageSize);
            } else {
                this.pageCount = 0;
            }
        },
        _updatePagingButtons: function () {
            if (this.pageIndex == 1) {
                this.prev.addClass(disabledClass);
            } else {
                if (this.prev.hasClass(disabledClass)) {
                    this.prev.removeClass(disabledClass);
                }
            }
            if (this.pageIndex >= this.pageCount) {
                this.next.addClass(disabledClass);
            } else {
                if (this.next.hasClass(disabledClass)) {
                    this.next.removeClass(disabledClass);
                }
            }
        },

        /// api
        selectItem: function (li) {
            var data = this._getItemData(li);
            if (!data) {
                return;
            }

            if (this.option.multiple) {
                this.multipleSelection(li, data);
            } else {
                this.singleSelection(li, data);
            }
        },
        singleSelection: function (elem, data) {
            var result = this.fire(selecting, elem, data);
            if (result === false) return;

            if (this.current) {
                this.current.removeHighlight(selectedClass, "background");
                if (this.current[0] === elem[0]) {
                    this.current = null;
                    this.fire(deselected, elem, data);
                    return;
                }
            }

            this.current = elem;
            this.current.addHighlight(selectedClass, "background");
            this.fire(selected, elem, data);
        },
        multipleSelection: function (elem, data) {
            var result, i;
            if (elem.hasClass(selectedClass)) {
                elem.removeHighlight(selectedClass, "background");
                for (i = 0; i < this.selectList.length; i++) {
                    if (this.selectList[i][0] === elem[0]) {
                        this.selectList.splice(i, 1);
                        break;
                    }
                };
                this.fire(deselected, elem, data);
            } else {
                result = this.fire(selecting, elem, data);
                if (result === false) return;

                elem.addHighlight(selectedClass, "background");
                this.selectList.push(elem);

                this.fire(selected, elem, data);
            }
        },
        getCurrentSelection: function () {
            var data = null;
            if (this.current) {
                data = this._getItemData(this.current);
            }
            return data;
        },
        getMultipleSelection: function () {
            var data = [],
                i;
            if (Array.isArray(this.selectList)) {
                for (i = 0; i < this.selectList.length; i++) {
                    data.push(this._getItemData(this.selectList[i]));
                }
            }
            return data;
        },
        cancelSelection: function () {
            var i, l, elem;
            if (this.option.multiple) {
                for (i = 0, l = this.selectList.length; i < l; i++) {
                    elem = this.selectList[i];
                    elem.removeHighlight(selectedClass, "background");
                    this.fire(deselected, elem, this._getItemData(elem));
                }
                this.selectList = [];
            } else {
                if (this.current) {
                    elem = this.current;
                    elem.removeHighlight(selectedClass, "background");
                    this.current = null;
                    this.fire(deselected, elem, this._getItemData(elem));
                }
            }
        },
        setHeight: function (height) {
            height -= borderTopWidth;
            if (this.hasPaging) {
                this.contentPanel.css("height", (height - this.pagingHeight) + "px");
            } else {
                this.contentPanel.css("height", height + "px");
            }
            this.width = this.element.width();
        },
        groupData: function (data, groupField) {
            var groupData = [];
            if (!Array.isArray(data)) {
                return groupData;
            }
            var temp = {},
                i, item, groupValue;
            for (i = 0; i < data.length; i++) {
                item = data[i];
                groupValue = item[groupField];
                if (!temp.hasOwnProperty(groupValue)) {
                    temp[groupValue] = {
                        text: groupValue,
                        children: []
                    };
                }
                temp[groupValue].children.push(item);
            }
            for (var key in temp) {
                groupData.push(temp[key]);
            }
            return groupData;
        },
        setData: function (data, rowCount) {
            if (Array.isArray(data)) {
                this.data = data;
                if (this.hasPaging) {
                    if ($.isNumeric(rowCount)) {
                        this.rowCount = rowCount;
                    } else {
                        this.rowCount = data.length;
                    }
                    this._updatePageCount();
                    this._updatePagingButtons();
                }

                this._fillList();
            }
        },
        empty: function () {
            this.contentPanel.html("");
            this.titleList = [];
            if (arguments[0] !== false) {
                this.data = [];
                if (this.hasPaging) {
                    this.pageIndex = 1;
                    this.rowCount = 0;
                    this._updatePageCount();
                    this._updatePagingButtons();
                }
            }
        }
    });

    $.fn.setGroupList = function (option) {
        if (!this || this.length == 0 || this.nodeName() !== "DIV") {
            return;
        }
        return ctrl(option, this);
    };
})();