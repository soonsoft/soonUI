; (function () {

    if (!ui || !ui.ColumnStyle) {
        throw new Error("please include ui.columnStyle.js");
    }

    var cellCheckbox = "gridview-check",
        cellCheckboxAll = "gridview-check-all",
        lastCell = "last-cell",
        sortClass = "fa-sort",
        asc = "fa-sort-asc",
        desc = "fa-sort-desc";

    //event type
    var pageTurning = "pageTurning",
        selecting = "selecting",
        selected = "selected",
        deselected = "deselected",
        rebind = "rebind";

    var tag = /^((?:[\w\u00c0-\uFFFF\*_-]|\\.)+)/,
        attributes = /\[\s*((?:[\w\u00c0-\uFFFF_-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/;

    //private functions
    var preparePager = function (pager) {
        if (pager.displayDataInfo !== false) {
            pager.displayDataInfo = true;
            pager.pageInfoFormatter = {
                currentRowNum: function(val) {
                    return "<span>本页" + val + "行</span>";
                },
                rowCount: function(val) {
                    return "<span class='font-highlight'>共" + val + "行</span>";
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

    var reverse = function (arr1, arr2) {
        var i = 0, 
            j = arr1.length - 1,
            len = arr1.length / 2;
        var temp;
        for (; i < len; i++, j--) {
            temp = arr1[i];
            arr1[i] = arr1[j];
            arr1[j] = temp;

            temp = arr2[i];
            arr2[i] = arr2[j];
            arr2[j] = temp;
        }
    };
    var defaultSortFunc = function (v1, v2) {
        var val, i, len;
        if (Array.isArray(v1)) {
            val = 0;
            for (i = 0, len = v1.length; i < len; i++) {
                val = defaultSorting(v1[i], v2[i]);
                if (val !== 0) {
                    return val;
                }
            }
            return val;
        } else {
            return defaultSorting(v1, v2);
        }
    };
    var defaultSorting = function (v1, v2) {
        if (typeof v1 === "string") {
            return v1.localeCompare(v2);
        }
        if (v1 < v2) {
            return -1;
        } else if (v1 > v2) {
            return 1;
        } else {
            return 0;
        }
    };

    var ctrl = ui.define("ctrls.GridView", {
        _getOption: function () {
            return {
                /*
                    column property
                    text:       string|function     列名，默认为null
                    column:     string|Array        绑定字段名，默认为null
                    len:        number              列宽度，默认为auto
                    align:      center|left|right   列对齐方式，默认为left(但是表头居中)
                    formatter:  function            格式化器(别名：handler)，默认为null
                    sort:       boolean|function    是否支持排序，true支持，false不支持，默认为false
                */
                columns: [],
                dataTable: null,
                promptText: "没有数据",
                gridId: null,
                height: false,
                width: false,
                pager: {
                    pageIndex: 1,
                    pageSize: 100,
                    pageButtonCount: 5,
                    displayDataInfo: true
                },
                selection: {
                    //cell|row|disabled
                    type: "row",
                    //string 排除的标签类型，标记后点击这些标签将不会触发选择事件
                    exclude: false,
                    multiple: false
                }
            };
        },
        _getEvents: function () {
            return [pageTurning, selecting, selected, deselected, rebind];
        },
        _create: function () {
            this.gridColumns = null;
            this.dataTable = null;
            this.selectList = [];
            this.sorterIndexes = [];
            this.columnStateFunctions = {};

            this.hasPrompt = !!this.option.promptText;
            this.gridHead = null;
            this.gridBody = null;

            this.columnHeight = 30;
            this.pagerHeight = 30;
            this.pager = null;
            if(this.option.pager) {
                preparePager.call(this, this.option.pager);
            } else {
                this.pageIndex = 1;
                this.pageSize = 100;
            }

            if (!$.isNumeric(this.option.width) || this.option.width <= 0)
                this.option.width = false;
            if (!$.isNumeric(this.option.height) || this.option.height <= 0)
                this.option.height = false;

            //sorter
            this.sorter = new ui.Introsort();
            //当前checkbox勾选计数器
            this._checkedCount = 0;
        },
        _init: function () {
            if (!this.element) {
                this.element = $("#" + this.option.gridId);
                if (this.element.length == 0) {
                    throw new Error("grid div not exists!");
                }
            }

            this._initBorderWidth();

            this.gridHead = $("<div class='grid-head' />");
            this.gridBody = $("<div class='grid-body' />");
            if (this.hasPrompt) {
                this.dataPrompt = $("<div class='data-prompt'>");
                this.gridBody.append(this.dataPrompt);
                this._initDataPrompt();
            }

            this.element.append(this.gridHead);
            this.element.append(this.gridBody);

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
            //init gridview size
            this.setSize(this.option.width, this.option.height);

            //init event handler
            this.onSortProxy = $.proxy(this.onSort, this);

            var rowCount = 0;
            this.createGridHead(this.option.columns);
            if (Array.isArray(this.option.dataTable)) {
                rowCount = this.option.dataTable.length;
                this.createGridBody(this.option.dataTable, rowCount);
            }

            //bind scroll x event
            this.gridBody.scroll($.proxy(this.onScrollingX, this));
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
        createGridHead: function (columns) {
            this.gridColumns = columns;
            if (!this.tableHead) {
                this.tableHead = $("<table class='table-head' cellspacing='0' cellpadding='0' />");
                this.gridHead.append(this.tableHead);
            } else {
                this.tableHead.html("");
            }

            var colGroup = $("<colgroup />"),
                thead = $("<thead />");
            this.tableHead.append(colGroup);
            var tr = $("<tr />"),
                th = null,
                c = null;
            var args = null;
            for (var i = 0; i < columns.length; i++) {
                c = columns[i];
                if (!c._columnKeys) {
                    c._columnKeys = {};
                }
                colGroup.append(this.createCol(c));
                th = this.createCell("th", c);
                args = [c, th];
                if ($.isFunction(c.text)) {
                    th.append(c.text.apply(this, args));
                } else {
                    if(c.text) {
                        th.append(ui.ColumnStyle.cnfn.columnText.apply(this, args));
                    }
                }
                this.setSorter(th, c, i);
                if (i == columns.length - 1) {
                    th.addClass(lastCell);
                }
                tr.append(th);
            }

            this.headScrollCol = $("<col style='width:0px' />");
            colGroup.append(this.headScrollCol);
            tr.append($("<th class='scroll-cell' />"));

            thead.append(tr);
            this.tableHead.append(thead);
        },
        createGridBody: function (dataTable, rowCount) {
            var isRebind = false;
            if (!this.tableBody) {
                this.tableBody = $("<table class='table-body' cellspacing='0' cellpadding='0' />");
                if (this.isSelectable())
                    this.tableBody.click($.proxy(this.onElementSelected, this));
                this.gridBody.append(this.tableBody);
            } else {
                this.gridBody.scrollTop(0);
                this.empty(false);
                isRebind = true;
            }

            this.dataTable = dataTable;
            if (!Array.isArray(this.dataTable)) {
                this.dataTable = [];
            }
            if (this.dataTable.length == 0) {
                this.showDataPrompt();
                return;
            } else {
                this.hideDataPrompt();
            }

            var colGroup = $("<colgroup />"),
                tbody = $("<tbody />");
            this.tableBody.append(colGroup);
            var tr, i, j, c;
            var columnLength = this.gridColumns.length;
            this._tempHandler = null;

            for (j = 0; j < columnLength; j++) {
                c = this.gridColumns[j];
                colGroup.append(this.createCol(c));
            }

            for (i = 0; i < dataTable.length; i++) {
                tr = $("<tr />");
                this._createCells(tr, dataTable[i], i);
                tbody.append(tr);
            }
            this.tableBody.append(tbody);

            this._updateScrollState();
            //update page numbers
            if ($.isNumeric(rowCount)) {
                this.renderPageList(rowCount);
            }

            if (isRebind) {
                this.fire(rebind);
            }
        },
        _createCells: function (tr, rowData, rowIndex) {
            var columnLength = this.gridColumns.length;
            var formatter;
            var j, c, cval, td, el;
            for (j = 0; j < columnLength; j++) {
                c = this.gridColumns[j];
                //兼容column中的handler字段
                formatter = c.formatter || c.handler;
                if (!$.isFunction(formatter)) {
                    formatter = ui.ColumnStyle.cfn.defaultText;
                }
                cval = this.prepareValue(rowData, c);
                td = this.createCell("td", c);
                el = formatter.apply(this, [cval, c, rowIndex, td]);
                if (td.isAnnul)
                    continue;
                if (el)
                    td.append(el);
                if (j == columnLength - 1) {
                    td.addClass(lastCell);
                }
                tr.append(td);
                if(td.isFinal) {
                    td.addClass(lastCell);
                    break;
                }
            }
        },
        prepareValue: function (rowData, c) {
            var value,
                i, len;
            if (Array.isArray(c.column)) {
                value = {};
                for (i = 0, len = c.column.length; i < len; i++) {
                    value[i] = this._getValue(rowData, c.column[i], c);
                    value[c.column[i]] = value[i];
                }
            } else {
                value = this._getValue(rowData, c.column, c);
                if (value === undefined || value === null)
                    value = "";
            }
            return value;
        },
        _getValue: function (rowData, column, c) {
            if (typeof column !== "string") {
                return null;
            }
            if (!c._columnKeys.hasOwnProperty(column)) {
                c._columnKeys[column] = column.split(".");
            }
            var arr = c._columnKeys[column];
            var i = 0;
            var value = rowData[arr[i]];
            for (i = 1; i < arr.length; i++) {
                value = value[arr[i]];
                if (value === undefined || value === null) {
                    return value;
                }
            }
            return value;
        },
        createCol: function (column) {
            var col = $("<col />");
            var css = {};
            if (!isNaN(parseInt(column.len)))
                css["width"] = column.len + "px";
            col.css(css);
            return col;
        },
        createCell: function (tagName, column) {
            var cell = $("<" + tagName + " />");
            var css = {};
            if (column.align)
                css["text-align"] = column.align;
            cell.css(css);

            return cell;
        },
        setSorter: function (cell, column, i) {
            if (column.sort === true || $.isFunction(column.sort)) {
                cell.click(this.onSortProxy);
                cell.addClass("sorter");
                cell.append("<i class='fa fa-sort'></i>");
                this.sorterIndexes.push(i);
            }
        },
        empty: function () {
            if (this.tableBody) {
                this.tableBody.html("");
                this.dataTable = null;
                this.selectList = [];
                this.current = null;
                this.cancelColumnState();
            }
            if (this.tableHead) {
                this.resetSortColumnState();
                this.lastSortColumn = null;
            }
            if (this.pager) {
                this.pager.empty();
            }
            if (arguments[0] !== false) {
                this.showDataPrompt();
            }
        },
        renderPageList: function (rowCount) {
            if (!this.pager) {
                return;
            }
            this.pager.data = this.dataTable;
            this.pager.pageIndex = this.pageIndex;
            this.pager.pageSize = this.pageSize;
            this.pager.renderPageList(rowCount);
        },
        isSelectable: function () {
            var type = this.option.selection.type;
            return type === "row" || type === "cell"
        },
        isMultipleSelectable: function () {
            return (this.option.selection.type === "row" || this.option.selection.type === "cell")
                && this.option.selection.multiple === true;
        },
        /// events
        onScrollingX: function (e) {
            var scrollLeft = this.gridBody.scrollLeft();
            this.gridHead.scrollLeft(scrollLeft);
        },
        onAllSelected: function (e) {
            e.stopPropagation();

            var cbx = $(e.target);
            var name = cbx.prop("name");
            name = name.split("_");
            name.splice(name.length - 1, 1);
            name = name.join("_");

            var cbxList = this.gridBody.find("input[type='checkbox'][name='" + name + "']");
            var cbxVal = cbx.prop("checked"),
                tagName, selectedClass, func, gridview, i;
            if (cbxList.length > 0) {
                if (this.isMultipleSelectable()) {
                    tagName = this.option.selection.type === "cell" ? "TD" : "TR";
                    selectedClass = this.option.selection.type === "cell" ? "cell-selected" : "row-selected";
                    //如果是勾选则清空选择项
                    if (cbxVal) {
                        for (i = 0; i < this.selectList.length; i++) {
                            this.selectList[i].removeHighlight(selectedClass, "background");
                        }
                        this.selectList = [];
                    }
                    gridview = this;
                    func = function (elcbx) {
                        var nodeName;
                        while ((nodeName = elcbx.nodeName()) !== tagName) {
                            if (nodeName === "TABLE")
                                return;
                            elcbx = elcbx.parent();
                        }
                        gridview.multipleSelection(elcbx, selectedClass, cbxVal);
                    };
                }
                cbxList.prop("checked", function (index, oldPropertyValue) {
                    var el = $(this);
                    el.prop("checked", cbxVal);
                    if (func) func(el);
                });
                if (cbxVal)
                    this._checkedCount = this.count();
                else
                    this._checkedCount = 0;
            }
        },
        prepareRowCheckboxChangeHandler: function () {
            var that;
            if (!this._isBindRowCheckboxChangeHandler) {
                that = this;
                this.tableBody.change(function (e) {
                    var cbx = $(e.target);
                    if (!cbx.hasClass(cellCheckbox)) {
                        return;
                    }
                    if (!that._gridviewCheckAll) {
                        that._gridviewCheckAll = that.tableHead.find(".gridview-check-all");
                    }
                    if (cbx.prop("checked")) {
                        that._checkedCount++;
                    } else {
                        that._checkedCount--;
                    }
                    if (that._checkedCount == that.count()) {
                        that._gridviewCheckAll.prop("checked", true);
                    } else {
                        that._gridviewCheckAll.prop("checked", false);
                    }
                });
                this._isBindRowCheckboxChangeHandler = true;
            }
        },
        onElementSelected: function (e) {
            var el = $(e.target),
                tagName = this.option.selection.type === "cell" ? "TD" : "TR",
                selectedClass = this.option.selection.type === "cell" ? "cell-selected" : "row-selected";
            var nodeName;
            //触发元素是否被设置为排除
            var exclude = this.option.selection.exclude,
                result = true;
            if (exclude) {
                if (typeof exclude === "string") {
                    result = this._excludeElement(el, exclude);
                } else if ($.isFunction(exclude)) {
                    result = exclude.call(this, el);
                }
                if (result === false) return;
            }
            while ((nodeName = el.nodeName()) !== tagName) {
                if (nodeName === "TABLE")
                    return;
                el = el.parent();
            }
            if (this.option.selection.multiple === true) {
                this.multipleSelection(el, selectedClass);
            } else {
                this.singleSelection(el, selectedClass);
            } 
        },
        onSort: function (e) {
            e.stopPropagation();
            if (!Array.isArray(this.dataTable) || this.dataTable.length == 0) {
                return;
            }
            var elem = $(e.target),
                nodeName;
            while ((nodeName = elem.nodeName()) !== "TH") {
                if (nodeName == "TR") {
                    return;
                }
                elem = elem.parent();
            }

            var columnIndex = elem[0].cellIndex;
            var column = this.gridColumns[columnIndex];

            if (this.lastSortColumn !== column) {
                this.resetSortColumnState(elem.parent());
            }

            var func = $.proxy(this.sorting, this);
            var isSelf = this.lastSortColumn == column;
            this.lastSortColumn = column;

            var tempTbody = this.tableBody.find("tbody");
            var rows = tempTbody.children().get();
            if (!Array.isArray(rows) || rows.length != this.dataTable.length) {
                throw new Error("data row error!");
            }

            var icon = elem.find("i");
            if (icon.hasClass(asc)) {
                reverse(this.dataTable, rows);
                icon.removeClass(sortClass).removeClass(asc).addClass(desc);
            } else {
                if (isSelf) {
                    reverse(this.dataTable, rows);
                } else {
                    this.sorter.items = rows;
                    this.sorter.sort(this.dataTable, func);
                }
                icon.removeClass(sortClass).removeClass(desc).addClass(asc);
            }
            tempTbody.append(rows);
            this.refreshRowNumber();
        },
        sorting: function (v1, v2) {
            var column = this.lastSortColumn;
            var func = column.sort;
            if (!$.isFunction(func)) {
                func = defaultSortFunc;
            }
            var content1 = this.prepareValue(v1, column);
            var content2 = this.prepareValue(v2, column);;
            return func(content1, content2);
        },
        resetSortColumnState: function (tr) {
            if (!tr) {
                tr = this.tableHead.find("tr");
            }
            var icon, cells = tr.children(),
                i, len;
            for (i = 0, len = this.sorterIndexes.length; i < len; i++) {
                icon = $(cells[this.sorterIndexes[i]]);
                icon = icon.find("i");
                if (!icon.hasClass(sortClass)) {
                    icon.attr("class", "fa fa-sort");
                    return;
                }
            }
        },

        singleSelection: function (el, selectedClass) {
            var data = this.prepareData(el);
            var result = this.fire(selecting, el, data);
            if (result === false) return;

            if (this.current) {
                this.current.removeHighlight(selectedClass, "background");
                var currentData = this.prepareData(this.current);

                if (this.current[0] === el[0]) {
                    this.fire(deselected, this.current, currentData);
                    this.current = null;
                    return;
                }
            }

            el.addHighlight(selectedClass, "background");
            this.current = el;

            this.fire(selected, el, data);
        },
        multipleSelection: function (el, selectedClass, selectValue) {
            var data = null;
            if (el.hasClass(selectedClass)) {
                if (selectValue === true) {
                    return;
                }
                el.removeHighlight(selectedClass, "background");
                for (var i = 0; i < this.selectList.length; i++) {
                    if (this.selectList[i][0] === el[0]) {
                        this.selectList.splice(i, 1);
                        break;
                    }
                }
                data = this.prepareData(el);
                this.fire(deselected, el, data);
            } else {
                if (selectValue === false) {
                    return;
                }
                data = this.prepareData(el);
                var result = this.fire(selecting, el, data);
                if (result === false) return;

                el.addHighlight(selectedClass, "background");
                this.selectList.push(el);

                this.fire(selected, el, data);
            }
        },
        prepareData: function (el) {
            var data = {};
            if (this.option.selection.type === "cell") {
                data.rowIndex = el.parent().prop("rowIndex");
                data.rowData = this.dataTable[data.rowIndex];
                data.cellIndex = el.prop("cellIndex");
                data.columns = this.gridColumns[data.cellIndex].column;
            } else {
                data.rowIndex = el.prop("rowIndex");
                data.rowData = this.dataTable[data.rowIndex];
            }
            return data;
        },
        _excludeElement: function (el, exclude) {
            var tagName = el.nodeName().toLowerCase(),
                exArr = exclude.split(","),
                ex, 
                match,
                i = 0, len = exArr.length;
            for (; i < len; i++) {
                ex = $.trim(exArr[i]);
                match = ex.match(attributes);
                if (match) {
                    ex = ex.match(tag)[1];
                    if (ex === tagName) {
                        return !(el.attr(match[1]) === match[4]);
                    }
                } else {
                    if (ex.toLowerCase() === tagName) {
                        return false;
                    }
                }
            }
        },
        /// API
        //获取当前选择的所有checkbox的value
        getSelectedValue: function () {
            var checkboxList = this.gridBody.find("." + cellCheckbox);
            var result = [];
            var i = 0,
                len = checkboxList.length,
                checkbox = null;
            for (; i < len; i++) {
                checkbox = $(checkboxList[i]);
                if (checkbox.prop("name").indexOf("_all") >= 0 || !checkbox.prop("checked"))
                    continue;
                result.push(checkbox.val());
            }
            return result;
        },
        hasSelection: function() {
            if(this.option.selection.multiple === true) {
                return this.selectList.length > 0;
            } else {
                return !!this.current;
            }
        },
        //获取当前选择项的数据
        getCurrentSelection: function () {
            var data = null;
            if (this.current)
                data = this.prepareData(this.current);
            return data;
        },
        //获取当前多选项中的数据
        getMultipleSelection: function () {
            var dataList = [];
            if (this.selectList) {
                for (var i = 0; i < this.selectList.length; i++) {
                    dataList.push(this.prepareData(this.selectList[i]));
                }
            }
            return dataList;
        },
        //选择行
        selectRow: function (rowIndex) {
            if (!this.dataTable) {
                return;
            }
            var selectedClass = "row-selected",
                elem;
            if (rowIndex >= 0 && rowIndex < this.dataTable.length) {
                elem = $(this.tableBody[0].rows[rowIndex]);
                if (this.option.selection.multiple === true) {
                    this.multipleSelection(elem, selectedClass);
                } else {
                    this.singleSelection(elem, selectedClass);
                }
            }
        },
        //选择单元格
        selectCell: function (rowIndex, cellIndex) {
            if (!this.dataTable) {
                return;
            }
            var selectedClass = "cell-selected",
                elem;
            if (rowIndex >= 0 && rowIndex < this.dataTable.length) {
                if (cellIndex >= 0 && cellIndex < this.gridColumns.length) {
                    elem = $(this.tableBody[0].rows[rowIndex].cells[cellIndex]);
                    if (this.option.selection.multiple === true) {
                        this.multipleSelection(elem, selectedClass);
                    } else {
                        this.singleSelection(elem, selectedClass);
                    }
                }
            }
        },
        //取消选择
        cancelSelection: function () {
            if (this.option.selection.type === "disabled")
                return;
            var selectedClass = this.option.selection.type === "cell" ? "cell-selected" : "row-selected",
                elem,
                data;
            if (this.option.selection.multiple) {
                if (this.selectList.length == 0) {
                    return;
                }
                data = [];
                for (var i = 0, l = this.selectList.length, temp; i < l; i++) {
                    elem = this.selectList[i];
                    elem.removeHighlight(selectedClass, "background");
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
                data = this.prepareData(elem);
                elem.removeHighlight(selectedClass, "background");
                this.current = null;
            }
            this.fire(deselected, elem, data);
        },
        //取消列头的所有状态
        cancelColumnState: function () {
            var func = null;
            for (var key in this.columnStateFunctions) {
                func = this.columnStateFunctions[key];
                if ($.isFunction(func)) {
                    try {
                        func.call(this);
                    } catch (error) { }
                }
            }
        },
        count: function () {
            if (!this.dataTable) {
                return 0;
            }
            return this.dataTable.length;
        },
        //移除行
        removeRow: function (row) {
            if (!row)
                return;
            if (!ui.core.isJQueryObject(row)) {
                row = $(row);
            }
            var index = row[0].rowIndex;
            if (this.current && this.current[0] == row[0]) {
                this.current = null;
            }
            row.remove();
            this.dataTable.splice(index, 1);
            this._updateScrollState();
            this.refreshRowNumber(index - 1);
        },
        //通过索引移除行
        removeRowByIndex: function (rowIndex) {
            if (!this.dataTable) {
                return;
            }
            if (rowIndex >= 0 && rowIndex < this.dataTable.length) {
                this.removeRow(
                    this.tableBody[0].rows[rowIndex]);
            }
        },
        //更新行
        updateRow: function (row, updateData) {
            if (!row || !updateData) {
                return;
            }
            if (!ui.core.isJQueryObject(row)) {
                row = $(row);
            }
            var index = row[0].rowIndex;
            row.html("");
            this.dataTable[index] = updateData;
            this._createCells(row, updateData, index);
        },
        //通过索引更新行
        updateRowByIndex: function (rowIndex, updateData) {
            if (!this.dataTable) {
                return;
            }
            if (rowIndex >= 0 && rowIndex < this.dataTable.length) {
                this.updateRow(
                    this.tableBody[0].rows[rowIndex], updateData);
            }
        },
        //追加一行
        appendRow: function (data) {
            if (!data) return;
            if (!Array.isArray(this.dataTable) || this.dataTable.length == 0) {
                if (this.tableBody) {
                    this.tableBody.remove();
                    this.tableBody = null;
                }
                this.createGridBody([data]);
                return;
            }
            var tr = $("<tr />");
            this.dataTable.push(data);
            this._createCells(tr, data, this.dataTable.length - 1);
            $(this.tableBody[0].tBodies[0]).append(tr);
            this._updateScrollState();
        },
        //插入一行
        insertRow: function (rowIndex, data) {
            var row = null;
            if (!data) return;
            if (!Array.isArray(this.dataTable) || this.dataTable.length == 0) {
                this.appendRow(data);
                return;
            }
            if (rowIndex < 0) {
                rowIndex = 0;
            }
            if (rowIndex >= 0 && rowIndex < this.dataTable.length) {
                row = $("<tr />");
                this.dataTable.splice(rowIndex, 0, data);
                this._createCells(row, data, rowIndex);
                $(this.tableBody[0].rows[rowIndex]).before(row);
                this._updateScrollState();
                this.refreshRowNumber(rowIndex);
            } else {
                this.appendRow(data);
            }
        },
        //刷新行号
        refreshRowNumber: function (startRowIndex, endRowIndex) {
            if (!this.dataTable || this.dataTable.length == 0)
                return;

            var colIndex = this._findRowNumberColumnIndex(),
                rowNumber = ui.ColumnStyle.cfn.rowNumber;
            if (colIndex == -1) return;
            if (isNaN(startRowIndex))
                startRowIndex = 0;
            else
                startRowIndex += 1;
            var rows = this.tableBody[0].rows;
            var cell,
                c = this.gridColumns[colIndex],
                i, l = $.isNumeric(endRowIndex) ? endRowIndex + 1 : rows.length;
            for (i = startRowIndex; i < l; i++) {
                cell = $(rows[i].cells[colIndex]);
                cell.html("");
                cell.append(rowNumber.apply(this, [null, c, i]));
            }
        },
        _findRowNumberColumnIndex: function() {
            var colIndex = -1;
            var i, 
                l = this.gridColumns.length, 
                c;
            for (i = 0; i < l; i++) {
                c = this.gridColumns[i];
                if (c.handler === ui.ColumnStyle.cfn.rowNumber) {
                    colIndex = i;
                    break;
                }
            }
            return colIndex;
        },
        //当前行上移
        currentUp: function() {
            var data = this.getCurrentSelection();
            if (!data || data.rowIndex == 0) {
                return;
            }
            this.moveRow(data.rowIndex, data.rowIndex - 1);
        },
        //当前行下移
        currentDown: function() {
            var data = this.getCurrentSelection();
            if (!data || data.rowIndex >= this.count()) {
                return;
            }
            this.moveRow(data.rowIndex, data.rowIndex + 1);
        },
        //根据索引将某一行移动到另一行的位置
        moveRow: function(rowIndex, destIndex) {
            var count = this.count();
            if(count == 0) {
                return;
            }
            if(destIndex < 0) {
                destIndex = 0;
            } else if(destIndex >= count) {
                destIndex = count - 1;
            }

            if(destIndex == rowIndex) {
                return;
            }

            var rows = this.tableBody[0].rows,
                destRow = $(rows[destIndex]);
            var temp = this.dataTable[rowIndex];
            this.dataTable.splice(rowIndex, 1);
            this.dataTable.splice(destIndex, 0, temp);
            if (destIndex > rowIndex) {
                destRow.after($(rows[rowIndex]));
                this.refreshRowNumber(rowIndex - 1, destIndex);
            } else {
                destRow.before($(rows[rowIndex]));
                this.refreshRowNumber(destIndex - 1, rowIndex);
            }
        },
        //获取行数据
        getRowData: function (rowIndex) {
            if (!this.dataTable || this.dataTable.length == 0) {
                return null;
            }
            if (!$.isNumeric(rowIndex) || rowIndex < 0 || rowIndex >= this.dataTable.length) {
                return null;
            }
            return this.dataTable[rowIndex];
        },
        //获取最后一行数据
        getLastRowData: function () {
            if (!this.dataTable || this.dataTable.length == 0) {
                return null;
            }
            return this.dataTable[this.dataTable.length - 1];
        },
        //获取第一行数据
        getFirstRowData: function () {
            return this.getRowData(0);
        },
        //设置表格内容显示区域的高度
        setHeight: function (height) {
            if ($.isNumeric(height)) {
                height -= this.columnHeight + this.borderHeight;
                if (this.pager)
                    height -= this.pagerHeight;
                this.gridBody.css("height", height + "px");
                if (arguments.length == 1) {
                    this._updateScrollState();
                    if (this.promptIsShow()) {
                        this._setPromptLocation();
                    }
                }
            }
        },
        //设置表格的宽度
        setWidth: function (width) {
            if ($.isNumeric(width)) {
                width -= this.borderWidth;
                this.element.css("width", width + "px");
                if (arguments.length == 1) {
                    this._updateScrollState();
                    if (this.promptIsShow()) {
                        this._setPromptLocation();
                    }
                }
            }
        },
        setSize: function (width, height) {
            this.setWidth(width, false);
            this.setHeight(height, false);
            this._updateScrollState();
            if (this.promptIsShow()) {
                this._setPromptLocation();
            }
        },
        _updateScrollState: function () {
            if (!this.tableHead) return;

            var gbh = this.gridBody.height(),
                gbw = this.gridBody.width(),
                sgbh = this.gridBody.get(0).scrollHeight,
                sgbw = this.gridBody.get(0).scrollWidth;
            if (sgbh > gbh) {
                this.headScrollCol.css("width", ui.scrollbarWidth + 0.1 + "px");
            } else {
                this.headScrollCol.css("width", "0px");
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
        }
    });

    $.fn.setGridview = function (option) {
        if (this.length == 0) {
            return null;
        }

        if (option.selection) {
            if (typeof option.selection.type === "string") {
                option.selection.type = option.selection.type.toLowerCase();
            } else {
                option.selection.type = "disabled";
            }
        }

        return ctrl(option, this);
    };
})();

/// TreeGrid
(function () {
    var childrenField = "_children",
        parentField = "_parent",
        flagField = "_fromList";

    var getValue = function (field) {
        return this[field];
    };

    var TreeGrid = function () {
        if(this instanceof TreeGrid) {
            this.initial();
        } else {
            return new TreeGrid();
        }
    };
    TreeGrid.prototype = {
        constructor: TreeGrid,
        initial: function() {
            this.lazy = false;
            this.loadChildrenHandler = null;
            this.gridview = null;
            var that = this;
            this.onFoldButtonClickHandler = function (e) {
                e.stopPropagation();
                that.onFoldButtonClick(e);
            };
        },
        formatLevelNode: function(content, columnObj, index, td) {
            if (!content) {
                return null;
            }
            var item = this.dataTable[index];
            if (!$.isNumeric(item._level)) {
                item._level = 0;
            }
            var span = $("<span />").text(content);
            span.css("margin-left", ((item._level + 1) * (12 + 5) + 5) + "px");
            return span;
        },
        formatTreeNode: function (content, columnObj, index, td) {
            if (!content) {
                return null;
            }
            var item = this.dataTable[index];
            if (!$.isNumeric(item._level)) {
                item._level = 0;
            }
            var span = $("<span />").text(content),
                fold = null;
            if (this.treeGrid.isTreeNode(item)) {
                item._isFolded = false;
                span = [null, span[0]];
                if (this.treeGrid.lazy) {
                    fold = $("<i class='fold font-highlight-hover fa fa-angle-right' />");
                } else {
                    fold = $("<i class='fold unfold font-highlight-hover fa fa-angle-down' />");
                }
                fold.css("margin-left", (item._level * (12 + 5) + 5) + "px");
                fold.click(this.treeGrid.onFoldButtonClickHandler);
                span[0] = fold[0];
            } else {
                span.css("margin-left", ((item._level + 1) * (12 + 5) + 5) + "px");
            }
            return span;
        },
        onFoldButtonClick: function (e) {
            var btn = $(e.target),
                rowIndex = btn.parent().parent()[0].rowIndex,
                rowData = this.gridview.getRowData(rowIndex);
            if (btn.hasClass("unfold")) {
                rowData._isFolded = true;
                btn.removeClass("unfold")
                    .removeClass("fa-angle-down")
                    .addClass("fa-angle-right");
                this.hideChildren(rowData, rowIndex);
            } else {
                rowData._isFolded = false;
                btn.addClass("unfold")
                    .removeClass("fa-angle-right")
                    .addClass("fa-angle-down");
                this.showChildren(rowData, rowIndex);
            }
        },
        addChildren: function (rowData, rowIndex, children) {
            var i = 0,
                len = children.length,
                item;
            var currRowIndex = rowIndex + 1,
            	row;
            rowData[childrenField] = [];
            for (; i < len; i++) {
                item = children[i];
                item._level = rowData._level + 1;
                item[parentField] = rowData;
                rowData[childrenField].push(currRowIndex);

                row = $("<tr />");
                this.gridview.dataTable.splice(currRowIndex, 0, item);
                this.gridview._createCells(row, item, currRowIndex);
                if (currRowIndex < this.gridview.dataTable.length - 1) {
                    $(this.gridview.tableBody[0].rows[currRowIndex]).before(row);
                } else {
                    this.gridview.tableBody.append(row);
                }

                currRowIndex++;
            }
            this.gridview._updateScrollState();
            this.gridview.refreshRowNumber(currRowIndex - 1);

            this._fixParentIndexes(rowData, rowIndex, len);
            this._fixTreeIndexes(
                rowIndex + 1 + len, 
                this.gridview.dataTable.length,
                this.gridview.dataTable, 
                len);
        },
        //修正父级元素的子元素索引
        _fixParentIndexes: function (rowData, rowIndex, count) {
            var parent = rowData[parentField];
            if (!parent)
                return;
            var children = parent[childrenField],
        		len = children.length,
        		i = 0;
            for (; i < len; i++) {
                if (children[i] > rowIndex) {
                    children[i] = children[i] + count;
                }
            }
            rowIndex = children[0] - 1;
            if (rowIndex >= 0) {
                arguments.callee.call(this, parent, rowIndex, count);
            }
        },
        //修正所有的子元素索引
        _fixTreeIndexes: function (startIndex, endIndex, dataTable, count) {
            var i = startIndex,
        		len = endIndex;
            var item,
        		children,
        		j;
            for (; i < len; i++) {
                item = dataTable[i];
                if (this.isTreeNode(item)) {
                    children = item[childrenField];
                    if (!children) {
                        continue;
                    }
                    for (j = 0; j < children.length; j++) {
                        children[j] = children[j] + count;
                    }
                }
            }
        },
        showChildren: function (rowData, rowIndex) {
            if (!rowData[childrenField]) {
                if (this.lazy && $.isFunction(this.loadChildrenHandler)) {
                    this.loadChildrenHandler(rowData, rowIndex);
                }
            } else {
                this.operateChildren(rowData[childrenField], function (item, row) {
                    $(row).css("display", "table-row");
                    if (item._isFolded === true) {
                        return false;
                    }
                });
            }
        },
        hideChildren: function (rowData) {
            if (rowData[childrenField]) {
                this.operateChildren(rowData[childrenField], function (item, row) {
                    $(row).css("display", "none");
                });
            }
        },
        operateChildren: function (list, action) {
            if (!list) {
                return;
            }
            var i = 0,
                len = list.length,
                rowIndex;
            var dataTable = this.gridview.dataTable,
                rows = this.gridview.tableBody[0].rows,
                item,
                result;
            for (; i < len; i++) {
                rowIndex = list[i];
                item = dataTable[rowIndex];
                result = action.call(this, item, rows[rowIndex]);
                if (result === false) {
                    continue;
                }
                if (item[childrenField]) {
                    arguments.callee.call(this, item[childrenField], action);
                }
            }
        },
        changeLevel: function(rowIndex, cellIndex, value, changeChildrenLevel) {
            var rowData,
                dataTable = this.gridview.dataTable, 
                level,
                i;
            if(ui.core.type(rowIndex) !== "number" || rowIndex < 0 || rowIndex >= dataTable.length) {
                return;
            }
            rowData = dataTable[rowIndex];
            
            changeChildrenLevel = !!changeChildrenLevel;
            
            level = rowData._level;
            this._changeLevel(rowIndex, cellIndex, rowData, value); 
            if(changeChildrenLevel) {
                i = rowIndex + 1;
                while(i < dataTable.length) {
                    rowData = dataTable[i];
                    if(rowData._level <= level) {
                        return;
                    }
                    this._changeLevel(i, cellIndex, rowData, value);
                    i++;
                }
            }
        },
        _changeLevel: function(rowIndex, cellIndex, rowData, value) {
            var level = rowData._level + value;
            if(level < 0)
                level = 0;
            rowData._level = level;
            
            var	column = this.gridview.option.columns[cellIndex],
                cell = $(this.gridview.tableBody.get(0).rows[rowIndex].cells[cellIndex]);
            cell.empty();
            cell.append(
                column.handler.call(
                    this.gridview, 
                    this.gridview.prepareValue(rowData, column), 
                    column, 
                    rowIndex, 
                    cell));
        },
        isTreeNode: function (item) {
            return !!item[childrenField];
        },
        listTreeByLevel: function(list, parentField, valueField) {
            var listTree = [];
            var getParentValue = getValue,
                getChildValue = getValue;
            if (!Array.isArray(list) || list.length == 0)
                return listTree;
            
            var parents = [],
                rootChildren = [],
                i, 
                item,
                parentItem,
                level;
            for(i = 0; i < list.length; i++) {
                item = list[i];
                item[childrenField] = [];
                item[parentField] = null;
                
                if(i > 0) {
                    if(item._level - list[i - 1]._level > 1) {
                        item._level = list[i - 1]._level + 1;
                    }
                } else {
                    item._level = 0; 
                }
                
                level = item._level;
                parents[level] = item;
                if(level == 0) {
                    rootChildren.push(item);
                    continue;
                }
                parentItem = parents[level - 1];
                parentItem[childrenField].push(item);
                item[parentField] = getParentValue.call(parentItem, valueField);
            }
            
            this._sortListTree(rootChildren, listTree, null, 0);
            return listTree;
        },
        listTree: function (list, parentField, valueField) {
            var listTree = [];
            var getParentValue = getValue,
                getChildValue = getValue;
            if (!Array.isArray(list) || list.length == 0)
                return listTree;

            if ($.isFunction(parentField)) {
                getParentValue = parentField;
            }
            if ($.isFunction(valueField)) {
                getChildValue = valueField;
            }

            var tempList = {}, temp, root,
                item, i, id, pid;
            for (i = 0; i < list.length; i++) {
                item = list[i];
                pid = getParentValue.call(item, parentField) + "" || "__";
                if (tempList.hasOwnProperty(pid)) {
                    temp = tempList[pid];
                    temp[childrenField].push(item);
                } else {
                    temp = {};
                    temp[childrenField] = [];
                    temp[childrenField].push(item);
                    tempList[pid] = temp;
                }
                id = getChildValue.call(item, valueField) + "";
                if (tempList.hasOwnProperty(id)) {
                    temp = tempList[id];
                    item[childrenField] = temp[childrenField];
                    tempList[id] = item;
                    item[flagField] = true;
                } else {
                    item[childrenField] = [];
                    item[flagField] = true;
                    tempList[id] = item;
                }
            }
            for (var key in tempList) {
                if(tempList.hasOwnProperty(key)) {
                    temp = tempList[key];
                    if (!temp.hasOwnProperty(flagField)) {
                        root = temp;
                        break;
                    }
                }
            }
            
            this._sortListTree(root[childrenField], listTree, null, 0);
            return listTree;
        },
        _sortListTree: function (tree, listTree, parent, level) {
            var i = 0,
                len = tree.length,
                item;
            for (; i < len; i++) {
                item = tree[i];
                delete item[flagField];
                item._level = level;
                item[parentField] = parent;
                listTree.push(item);
                tree[i] = listTree.length - 1;
                if (item[childrenField].length > 0) {
                    arguments.callee.call(this, item[childrenField], listTree, item, level + 1);
                } else {
                    delete item[childrenField];
                }
            }
        },
        setGridView: function (gridview) {
            if(gridview instanceof ui.ctrls.GridView) {
                this.gridview = gridview;
                this.gridview.treeGrid = this;
            }
        }
    };

    ui.ctrls.TreeGrid = TreeGrid;
})();

/// GroupGrid
(function() {
    function defaultCreateGroupItem(groupKey) {
        return {
            groupText: groupKey
        };
    }
    function isGroupItem() {
        return ui.core.type(this.itemIndexes) === "array";
    }
    function GroupGrid() {
        if(this instanceof GroupGrid) {
            this.initial();
        } else {
            return new GroupGrid();
        }
    }
    function renderGroupItemCell(data, column, index, td) {
        td.isFinal = true;
        td.attr("colspan", this.option.columns.length);
        td.click(this.groupGrid.onGroupRowClickHandler);
        this.groupGrid["_last_group_index_"] = data.groupIndex;
        return this.groupGrid.formatGroupItem.apply(this, arguments);
    }
    
    GroupGrid.prototype = {
        constructor: GroupGrid,
        initial: function() {
            this.gridview = null;
            var that = this;
            this.onGroupRowClickHandler = function (e) {
                e.stopPropagation();
                that.onGroupRowClick(e);
            };
        },
        listGroup: function(list, groupField, createGroupItem) {
            var groupList = [];
            var dict = {};
            
            if(!Array.isArray(list) || list.length == 0) {
                return groupList;
            }
            createGroupItem = $.isFunction(createGroupItem) ? createGroupItem : defaultCreateGroupItem;
            var i = 0,
                len = list.length;
            var item,
                groupKey,
                groupItem;
            for(; i < len; i++) {
                item = list[i];
                groupKey = item[groupField];
                if(!dict.hasOwnProperty(groupKey)) {
                    groupItem = createGroupItem.call(item, groupKey);
                    groupItem.itemIndexes = [i];
                    dict[groupKey] = groupItem;
                } else {
                    dict[groupKey].itemIndexes.push(i);
                }
            }
            for(groupKey in dict) {
                groupItem = dict[groupKey];
                groupList.push(groupItem);
                groupItem.groupIndex = groupList.length - 1;
                for(i = 0, len = groupItem.itemIndexes.length; i < len; i++) {
                    groupList.push(list[groupItem.itemIndexes[i]]);
                    groupItem.itemIndexes[i] = groupList.length - 1;
                }
            }
            return groupList;
        },
        onGroupRowClick: function(e) {
            var td = $(e.target);
            while(!td.isNodeName("td")) {
                if(td.isNodeName("tr")) {
                    return;
                }
                td = td.parent();
            }
            var groupItem = this.gridview.dataTable[td.parent().get(0).rowIndex];
            if(td.hasClass("group-fold")) {
                td.removeClass("group-fold");
                this.operateChildren(groupItem.itemIndexes, function(item, row) {
                    $(row).css("display", "table-row");
                });
            } else {
                td.addClass("group-fold");
                this.operateChildren(groupItem.itemIndexes, function(item, row) {
                    $(row).css("display", "none");
                });
            }
        },
        operateChildren: function (list, action) {
            var i = 0,
                len = list.length,
                rowIndex;
            var dataTable = this.gridview.dataTable,
                rows = this.gridview.tableBody[0].rows,
                item,
                result;
            for (; i < len; i++) {
                rowIndex = list[i];
                item = dataTable[rowIndex];
                action.call(this, item, rows[rowIndex]);
            }
        },
        formatRowNumber: function(value, column, index, td) {
            var data = this.dataTable[index];
            if(isGroupItem.call(data)) {
                return renderGroupItemCell.call(this, data, column, index, td);
            } else {
                return "<span>" + (index - this.groupGrid["_last_group_index_"]) + "</span>";
            }
        },
        formatText: function(value, column, index, td) {
            var data = this.dataTable[index];
            if(isGroupItem.call(data)) {
                return renderGroupItemCell.call(this, data, column, index, td);
            } else {
                return ui.ColumnStyle.cfn.defaultText.apply(this, arguments);
            }
        },
        formatGroupItem: ui.core.noop,
        setGridView: function(gridview) {
            if(gridview instanceof ui.ctrls.GridView) {
                this.gridview = gridview;
                this.gridview.groupGrid = this;
            }
        }
    };
    
    ui.ctrls.GroupGrid = GroupGrid;
})();