; (function () {

    if (!ui || !ui.ColumnStyle) {
        throw new Error("please include ui.columnStyle.js");
    }

    var cellCheckbox = "gridview-check",
        cellCheckboxAll = "gridview-check-all",
        lastCell = "last-cell",
        pagerButtonClass = "pager-button",
        pagerCurrentButtonClass = "pager-current",
        sortClass = "fa-sort",
        asc = "fa-sort-asc",
        desc = "fa-sort-desc";

    var DataBody = "DataBody";

    var defaultFixedCellWidth = 40,
        rowHeight = 30,
        emptyRow = "empty-row";

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
    }
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

    var ctrl = ui.define("ctrls.ReportView", {
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
                fixedGroupColumns: null,
                dataGroupColumns: null,
                fixedColumns: [],
                dataColumns: [],
                dataTable: null,
                promptText: "没有数据",
                reportId: null,
                height: false,
                width: false,
                fitColumns: true,
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
            this.selectList = [];
            this.sorterIndexes = [];
            this.columnStateFunctions = {};

            this.hasPrompt = !!this.option.promptText;
            this.reportHead = null;
            this.reportFixedHead = null;
            this.reportDataHead = null;
            this.reportBody = null;
            this.reportFixedBody = null;
            this.reportDataBody = null;

            this.columnHeight = rowHeight;
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
                this.element = $("#" + this.option.reportId);
                if (this.element.length == 0) {
                    throw new Error("report view div not exists!");
                }
            }

            this._initBorderWidth();

            this.reportHead = $("<div class='report-head' />");
            this.reportFixedHead = $("<div class='fixed-head' />");
            this.reportDataHead = $("<div class='data-head'>");
            this.reportHead.append(this.reportFixedHead).append(this.reportDataHead);
            this.element.append(this.reportHead);

            this.reportBody = $("<div class='report-body' />");
            this.reportFixedBody = $("<div class='fixed-body' />");
            this.fixedBodyScroll = $("<div class='fixed-body-scroll' />")
            this.reportDataBody = $("<div class='data-body' />");
            this.fixedBodyScroll.css("height", ui.scrollbarHeight);
            this.reportBody.append(this.reportFixedBody).append(this.fixedBodyScroll)
                .append(this.reportDataBody);
            if (this.hasPrompt) {
                this.dataPrompt = $("<div class='data-prompt'>");
                this.reportBody.append(this.dataPrompt);
                this._initDataPrompt();
            }
            this.element.append(this.reportBody);
            this.fitLine = $("<hr class='fit-line background-highlight' />");
            this.element.append(this.fitLine);
            if(this.option.fitColumns) {
                this.reportDataHead.on("mousedown", $.proxy(this.onStartFitDataColumn, this));
            }

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

            //init reportview size
            this.setSize(this.option.width, this.option.height);
            //init event handler
            this.onSortProxy = $.proxy(this.onSort, this);

            //init reportview head and body
            this.createReportHead(
                this.option.fixedGroupColumns, 
                this.option.dataGroupColumns);

            var rowCount = 0;
            if (Array.isArray(this.option.dataTable)) {
                rowCount = this.option.dataTable.length;
                this.createReportBody(this.option.dataTable, rowCount);
            }

            //bind scroll x event
            this.reportDataBody.scroll($.proxy(this.onScrolling, this));
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
        createReportHead: function (fixedGroupColumns, dataGroupColumns) {
            if (fixedGroupColumns && Array.isArray(fixedGroupColumns)) {
                this.fixedColumns = [];
                if(!Array.isArray(fixedGroupColumns[0])) {
                    fixedGroupColumns = [fixedGroupColumns];
                }
                this._createFixedHead(this.fixedColumns, fixedGroupColumns);
            }

            if (dataGroupColumns && Array.isArray(dataGroupColumns)) {
                this.dataColumns = [];
                if(!Array.isArray(dataGroupColumns[0])) {
                    dataGroupColumns = [dataGroupColumns];
                }
                this._createDataHead(this.dataColumns, dataGroupColumns);
            }
            this.reportFixedHead.css("height", this.columnHeight + "px");
            this.reportDataHead.css("height", this.columnHeight + "px");
            this.reportHead.css("height", this.columnHeight + "px");
        },
        //更健壮的columns参数处理，暂时没有使用，可以支持数组和基本元素混合设置
        _prepareColumns: function(columns) {
            var i = 0,
                len = columns.length;
            var result = [],
                tempArr = null,
                item;
            for(; i < len; i++) {
                item = columns[i];
                if(Array.isArray(item)) {
                    if(tempArr) {
                        result.push(tempArr);
                        tempArr = null;
                    }
                    result.push(item);
                } else {
                    if(!tempArr) {
                        tempArr = [];
                    }
                    tempArr.push(item);
                }
            }
            if(tempArr) {
                result.push(item);
            }
            return result;
        },
        _createFixedHead: function (fixedColumns, fixedGroupColumns) {
            if (!this.tableFixedHead) {
                this.tableFixedHead = $("<table class='table-fixed-head' cellspacing='0' cellpadding='0' />");
                this.reportFixedHead.append(this.tableFixedHead);
            } else {
                this.tableFixedHead.html("");
            }
            this.fixedColumnWidth = 0;
            this._createHeadTable(this.tableFixedHead, fixedColumns, fixedGroupColumns,
                function (c) {
                    if (!c.len) {
                        c.len = defaultFixedCellWidth;
                    }
                    this.fixedColumnWidth += c.len + 1;
                }
            );
            this.reportFixedHead.css("width", this.fixedColumnWidth + "px");
        },
        _createDataHead: function (dataColumns, dataGroupColumns) {
            if (!this.tableDataHead) {
                this.tableDataHead = $("<table class='table-data-head' cellspacing='0' cellpadding='0' />");
                this.reportDataHead.append(this.tableDataHead);
                this.reportDataHead.css("left", this.fixedColumnWidth + "px");
            } else {
                this.tableDataHead.html("");
            }
            this._createHeadTable(this.tableDataHead, dataColumns, dataGroupColumns,
                function (c, th, cidx, len) {
                    if (cidx == len - 1) {
                        th.addClass(lastCell);
                    }
                },
                this.createScrollCol);
        },
        createReportBody: function (dataTable, rowCount) {
            this.dataTable = dataTable;
            if (this.fixedColumns && Array.isArray(this.fixedColumns)) {
                this._createFixedBody(dataTable, this.fixedColumns);
            }

            if (this.dataColumns && Array.isArray(this.dataColumns)) {
                this._createDataBody(dataTable, this.dataColumns, rowCount);
            }
        },
        _createFixedBody: function (dataTable, columns) {
            if (!this.tableFixedBody) {
                this.tableFixedBody = $("<table class='table-fixed-body' cellspacing='0' cellpadding='0' />");
                if (this.isSelectable()) {
                    this.tableFixedBody.click($.proxy(this.onFixedSelected, this));
                }
                this.reportFixedBody.append(this.tableFixedBody);
            } else {
                this.reportFixedBody.scrollTop(0);
                this.emptyFixed();
            }

            if (!Array.isArray(this.dataTable)) {
                return;
            }

            this._createBodyTable(this.tableFixedBody, dataTable, columns);

            this.reportFixedBody.css("width", this.fixedColumnWidth + "px");
            this.fixedBodyScroll.css("width", this.fixedColumnWidth + "px");
        },
        _createDataBody: function (dataTable, columns, rowCount) {
            var isRebind = false;
            if (!this.tableDataBody) {
                this.tableDataBody = $("<table class='table-data-body' cellspacing='0' cellpadding='0' />");
                if (this.isSelectable()) {
                    this.tableDataBody.click($.proxy(this.onElementSelected, this));
                }
                this.reportDataBody.append(this.tableDataBody);
                this.reportDataBody.css("left", this.fixedColumnWidth + "px");
            } else {
                this.reportDataBody.scrollTop(0);
                this.emptyData();
                isRebind = true;
            }

            if (!Array.isArray(this.dataTable)) {
                this.dataTable = [];
            }
            if (this.dataTable.length == 0) {
                this.showDataPrompt();
                return;
            } else {
                this.hideDataPrompt();
            }

            this._createBodyTable(this.tableDataBody, dataTable, columns, { type: DataBody });

            this._updateScrollState();
            //update page numbers
            if ($.isNumeric(rowCount)) {
                this.renderPageList(rowCount);
            }

            if (isRebind) {
                this.fire(rebind);
            }
        },
        _createHeadTable: function (headTable, columns, groupColumns, eachFunc, colFunc) {
            var hasFunc = $.isFunction(eachFunc);
            var colGroup = $("<colgroup />"),
                thead = $("<thead />");
            headTable.append(colGroup);
            var tr = null,
                th = null,
                c = null,
                el = null;
            var i, j, row;
            var cHeight = 0;
            var args = null;
            var columnIndex;
            var isDataHeadTable = headTable.hasClass("table-data-head");

            if (Array.isArray(groupColumns)) {
                for (i = 0; i < groupColumns.length; i++) {
                    row = groupColumns[i];
                    tr = $("<tr />");
                    if (!row || row.length == 0) {
                        tr.addClass(emptyRow);
                    }
                    columnIndex = 0;
                    for (j = 0; j < row.length; j++) {
                        c = row[j];
                        th = this.createCell("th", c);
                        args = [c, th];
                        if ($.isFunction(c.text)) {
                            el = c.text.apply(this, args);
                        } else {
                            if(c.text) {
                                el = ui.ColumnStyle.cnfn.columnText.apply(this, args);
                            }
                        }
                        if (el) {
                            th.append(el);
                        }

                        if (c.column || $.isFunction(c.handler)) {
                            if (!c._columnKeys) {
                                c._columnKeys = {};
                            }
                            while (columns[columnIndex]) {
                                columnIndex++;
                            }
                            this.setSorter(th, c, columnIndex);

                            delete c.rowspan;
                            delete c.colspan;
                            th.data("columnIndex", columnIndex);
                            c.cell = th;
                            c.columnIndex = columnIndex;
                            columns[columnIndex] = c;
                        }
                        if(this.option.fitColumns && isDataHeadTable) {
                            th.append("<b class='fit-column-handle' />");
                        }
                        tr.append(th);

                        columnIndex += c.colspan || 1;
                    }
                    thead.append(tr);
                    cHeight += rowHeight;
                }
            }

            for (i = 0; i < columns.length; i++) {
                c = columns[i];
                c.cellIndex = i;
                colGroup.append(this.createCol(c));

                args = [c, c.cell];
                if (hasFunc) {
                    args.push(i);
                    args.push(columns.length);
                    eachFunc.apply(this, args);
                }
            }
            if ($.isFunction(colFunc)) {
                colFunc.apply(this, [headTable, tr, colGroup]);
            }
            if (cHeight > this.columnHeight) {
                this.columnHeight = cHeight;
            }
            headTable.append(thead);
        },
        _createBodyTable: function (bodyTable, dataTable, columns, tempData, afterFunc) {
            var colGroup = $("<colgroup />"),
                tbody = $("<tbody />");
            bodyTable.append(colGroup);
            var obj, tr, c, i, j;
            var columnLength = columns.length;
            var lastCellFlag = !!tempData && tempData.type === DataBody;
            this._tempHandler = null;

            for (j = 0; j < columnLength; j++) {
                c = columns[j];
                colGroup.append(this.createCol(c));
            }

            for (i = 0; i < dataTable.length; i++) {
                tr = $("<tr />");
                obj = dataTable[i];
                this._createCells(tr, obj, i, columns, lastCellFlag);
                tbody.append(tr);
            }
            bodyTable.append(tbody);

            if ($.isFunction(afterFunc)) {
                afterFunc.apply(this, [bodyTable]);
            }
        },
        _createCells: function (tr, rowData, rowIndex, columns, lastCellFlag) {
            var columnLength = columns.length;
            var formatter;
            var j, c, cval, td, el;
            for (j = 0; j < columnLength; j++) {
                c = columns[j];
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
                if (lastCellFlag && j == columnLength - 1) {
                    td.addClass(lastCell);
                }
                tr.append(td);
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
        createScrollCol: function (headTable, tr, colGroup) {
            this.dataHeadScrollCol = $("<col style='width:0px' />");
            colGroup.append(this.dataHeadScrollCol);

            var rows = tr.parent().children();
            var rowspan = rows.length;
            var th = $("<th class='scroll-cell' />");
            if (rowspan > 1) {
                th.attr("rowspan", rowspan);
            }
            $(rows[0]).append(th);
        },
        createCell: function (tagName, column) {
            var cell = $("<" + tagName + " />");
            if ($.isNumeric(column.colspan)) {
                cell.prop("colspan", column.colspan);
            }
            if ($.isNumeric(column.rowspan)) {
                cell.prop("rowspan", column.rowspan);
                if(column.rowspan > 1) {
                    cell.css("height", column.rowspan * rowHeight - 1);
                }
            }
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
            this.emptyFixed();
            this.dataTable = null;
            this.emptyData();
            this.resetSortColumnState();
            this.showDataPrompt();
            
            this._checkedCount = 0;
        },
        emptyFixed: function () {
            if (this.tableFixedBody) {
                this.tableFixedBody.html("");
                this.cancelColumnState();
                this.lastSortColumn = null;
            }
        },
        emptyData: function () {
            if (this.tableDataBody) {
                this.tableDataBody.html("");
                this.selectList = [];
                this.current = null;
            }
            if (this.pager) {
                this.pager.empty();
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
        onScrolling: function (e) {
            var scrollLeft = this.reportDataBody.scrollLeft();
            var scrollTop = this.reportDataBody.scrollTop();
            this.reportDataHead.scrollLeft(scrollLeft);
            this.reportFixedBody.scrollTop(scrollTop);
        },
        onAllSelected: function (e) {
            e.stopPropagation();
            var cbx = $(e.target);
            var name = cbx.prop("name");
            name = name.split("_");
            name.splice(name.length - 1, 1);
            name = name.join("_");
            var cbxList = $("input[type='checkbox'][name='" + name + "']");

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
        prepareRowCheckboxChangeHandler: function (e) {
            var that = this;
            if (!this._isBindRowCheckboxChangeHandler) {
                this.reportBody.change(function (e) {
                    var cbx = $(e.target);
                    if (!cbx.hasClass(cellCheckbox)) {
                        return;
                    }
                    if (!that._gridviewCheckAll) {
                        that._gridviewCheckAll = that.reportHead.find(".gridview-check-all");
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
        onFixedSelected: function (e) {
            var elem = $(e.target);
            var tagName = "TR";
            var rowIndex = -1;
            var selectedClass = "row-selected";
            var nodeName;
            if (this.option.selection.type === "cell") {
                return;
            }
            //触发元素是否被设置为排除
            var exclude = this.option.selection.exclude,
                result = true;
            if (exclude) {
                if (typeof exclude === "string") {
                    result = this._excludeElement(elem, exclude);
                } else if ($.isFunction(exclude)) {
                    result = exclude.call(this, elem);
                }
                if (result === false) return;
            }
            while ((nodeName = elem.nodeName()) !== tagName) {
                if (nodeName === "TABLE")
                    return;
                elem = elem.parent();
            }
            rowIndex = elem[0].rowIndex;
            elem = $(this.tableDataBody[0].rows[rowIndex]);
            if (this.option.selection.multiple === true) {
                this.multipleSelection(elem, selectedClass);
            } else {
                this.singleSelection(elem, selectedClass);
            }
        },
        onStartFitDataColumn: function(e) {
            var elem = $(e.target);
            if(!elem.isNodeName("b")) {
                return;
            }
            var elemOffset = elem.offset();
            var panelOffset = this.element.offset();
            var left = elemOffset.left - panelOffset.left + elem.width();
            
            var that = this,
                option = {
                    context: this,
                    target: this.fitLine,
                    th: elem.parent(),
                    doc: $(document),
                    beginLeft: left,
                    endLeft: left,
                    currentX: left,
                    leftLimit: panelOffset.left,
                    rightLimit: panelOffset.left + this.element.outerWidth(),
                    onMoving: this._onFitLineMoving,
                    onEndDrag: this._onFitLineEndDrag
                };
            option.doc
                .on("mousemove", option, option.onMoving)
                .on("mouseup", option, option.onEndDrag)
                .on("mouseleave", option, option.onEndDrag);
            //禁止文本选中
            if(!document.onselectstart) {
                document.onselectstart = function () { return false; };
                option.removeOnselectstart = true;
            }
            
            option.isStarted = true;
            this.fitLine.css({
                "left": left + "px",
                "display": "block"
            });
        },
        _onFitLineMoving: function(e) {
            var option = e.data;
            if (!option.isStarted) return;
            var x = e.pageX - option.currentX;
            option.currentX = e.pageX;
            var left = parseFloat(option.target.css("left"));
            left += x;
            
            if (left < option.leftLimit) {
                left = option.leftLimit;
            } else if (left > option.rightLimit) {
                left = option.rightLimit;
            }
            option.endLeft = left;
            option.target.css("left", left + "px");
        },
        _onFitLineEndDrag: function(e) {
            if (e.which !== 1) return;
            var option = e.data,
                that = option.context;
            if (!option.isStarted) return;
            option.currentX = 0;
            option.isStarted = false;
            option.target.css("display", "none");
            option.doc
                .off("mousemove", option.onMoving)
                .off("mouseup", option.onEndDrag)
                .off("mouseleave", option.onEndDrag);
            if(option.removeOnselectstart) {
                document.onselectstart = null;
            }
            
            var columnIndex = option.th.data("columnIndex");
            var column = that.dataColumns[columnIndex];
            if(!column) {
                return;
            }
            if(option.endLeft === option.beginLeft) {
                return;
            }
            var width = column.len + (option.endLeft - option.beginLeft);
            if(width < 30) {
                width = 30;
            }
            column.len = width;
            var headCol = null,
                bodyCol = null;
            if(that.tableDataHead) {
                headCol = that.tableDataHead.children("colgroup").children()[columnIndex];
                if(headCol) {
                    headCol = $(headCol);
                    headCol.css("width", column.len + "px");
                }
            }
            if(that.tableDataBody) {
                bodyCol = that.tableDataBody.children("colgroup").children()[columnIndex];
                if(bodyCol) {
                    bodyCol = $(bodyCol);
                    bodyCol.css("width", column.len + "px");
                }
            }
            that._updateScrollState();
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

            var table = elem.parent().parent().parent();
            var columnIndex = elem.data("columnIndex") || elem[0].cellIndex;
            var column = null;
            if (table.hasClass("table-fixed-head")) {
                column = this.fixedColumns[columnIndex];
            } else {
                column = this.dataColumns[columnIndex];
            }

            if (this.lastSortColumn !== column) {
                this.resetSortColumnState();
            }

            var func = $.proxy(this.sorting, this);
            var isSelf = this.lastSortColumn == column;
            this.lastSortColumn = column;

            var tempTbody = null;
            if(this.tableFixedBody) {
                tempTbody = this.tableFixedBody.find("tbody");
            } else {
                tempTbody = this.tableDataBody.find("tbody");
            }
            var rows = tempTbody.children().get(),
                oldRows = rows.slice(0),
                icon;

            if (!Array.isArray(rows) || rows.length != this.dataTable.length) {
                throw new Error("data row error!");
            }

            icon = elem.find("i");
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
            
            var srows, i, len;
            if(this.tableFixedBody) {
                tempTbody = this.tableDataBody.find("tbody");
                rows = tempTbody.children().get();
                srows = new Array(rows.length);
                for (i = 0, len = oldRows.length; i < len; i++) {
                    srows[oldRows[i].rowIndex] = rows[i];
                }
                tempTbody.append(srows);
            }
            this.refreshRowNumber();
        },
        sorting: function (v1, v2) {
            var column = this.lastSortColumn;
            var func = column.sort;
            if (!$.isFunction(func)) {
                func = defaultSortFunc;
            }
            var content1 = this.prepareValue(v1, column);
            var content2 = this.prepareValue(v2, column);
            return func(content1, content2);
        },
        resetSortColumnState: function () {
            var cells, cells1, cells2;
            if (this.tableFixedHead) {
                cells1 = this.fixedColumns;
            }
            if (this.tableDataHead) {
                cells2 = this.dataColumns;
            }

            cells = cells1;
            if(!cells) {
                cells = cells2;
            }
            if(!cells) {
                return;
            }
            var icon, i, len,
                lastIndex = -1, index;
            for (i = 0, len = this.sorterIndexes.length; i < len; i++) {
                index = this.sorterIndexes[i];
                if (index <= lastIndex || !cells[index]) {
                    cells = cells2;
                    lastIndex = -1;
                } else {
                    lastIndex = index;
                }

                icon = cells[index].cell;
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
                    if (this.selectList[i][0] == el[0]) {
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
                data.columns = this.dataColumns[data.cellIndex].column;
            } else {
                data.rowIndex = el.prop("rowIndex");
                data.rowData = this.dataTable[data.rowIndex];
            }
            return data;
        },
        _excludeElement: function (el, exclude) {
            var tagName = el.nodeName().toLowerCase(),
                exArr = exclude.split(","),
                ex, match;
            for (var i = 0, l = exArr.length; i < l; i++) {
                ex = $.trim(exArr[i]);
                match = ex.match(attributes);
                if (match) {
                    ex = ex.match(tag)[1];
                    if (ex === tagName) {
                        return !(el.attr(match[1]) === match[4]);
                    }
                } else {
                    if (ex === tagName) {
                        return false;
                    }
                }
            }
        },

        /// API
        //获取当前选择的所有checkbox的value
        getSelectedValue: function () {
            var checkboxList = this.reportFixedBody.find("." + cellCheckbox);
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
            var fixedRow;
            if (this.tableFixedBody) {
                fixedRow = $(this.tableFixedBody[0].rows[index]);
                fixedRow.remove();
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
                    this.tableDataBody[0].rows[rowIndex]);
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
            var fixedRow;
            if (this.tableFixedBody) {
                fixedRow = $(this.tableFixedBody[0].rows[index]);
                fixedRow.html("");
                this._createCells(fixedRow, updateData, index, this.fixedColumns);
            }
            row.html("");
            this.dataTable[index] = updateData;
            this._createCells(row, updateData, index, this.dataColumns, true);
        },
        //通过索引更新行
        updateRowByIndex: function (rowIndex, updateData) {
            if (!this.dataTable) {
                return;
            }
            if (rowIndex >= 0 && rowIndex < this.dataTable.length) {
                this.updateRow(
                    this.tableDataBody[0].rows[rowIndex], updateData);
            }
        },
        //追加一行
        appendRow: function (data) {
            if (!data) return;
            if (!Array.isArray(this.dataTable) || this.dataTable.length == 0) {
                if (this.tableFixedBody) {
                    this.tableFixedBody.remove();
                    this.tableFixedBody = null;
                }
                if (this.tableDataBody) {
                    this.tableDataBody.remove();
                    this.tableDataBody = null;
                }
                this.createReportBody([data]);
                return;
            }

            var tr = null;
            if (this.tableFixedBody) {
                tr = $("<tr />");
                this._createCells(tr, data, this.dataTable.length, this.fixedColumns);
                $(this.tableFixedBody[0].tBodies[0]).append(tr);
            }
            tr = $("<tr />");
            this.dataTable.push(data);
            this._createCells(tr, data, this.dataTable.length - 1, this.dataColumns, true);
            $(this.tableDataBody[0].tBodies[0]).append(tr);
            this._updateScrollState();
        },
        //插入一行
        insertRow: function (rowIndex, data) {
            if (!data) return;
            if (!Array.isArray(this.dataTable) || this.dataTable.length == 0) {
                this.appendRow(data);
                return;
            }
            if (rowIndex < 0) {
                rowIndex = 0;
            }
            if (rowIndex >= 0 && rowIndex < this.dataTable.length) {
                var tr = null;
                if (this.tableFixedBody) {
                    tr = $("<tr />");
                    this._createCells(tr, data, rowIndex, this.fixedColumns);
                    $(this.tableFixedBody[0].rows[rowIndex]).before(tr);
                }
                tr = $("<tr />");
                this.dataTable.splice(rowIndex, 0, data);
                this._createCells(tr, data, rowIndex, this.dataColumns, true);
                $(this.tableDataBody[0].rows[rowIndex]).before(tr);
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
            if (!this.fixedColumns || !Array.isArray(this.fixedColumns))
                return;

            var colIndex = this._findRowNumberColumnIndex(),
                rowNumber = ui.ColumnStyle.cfn.rowNumber;
            if (colIndex == -1) return;
            if (isNaN(startRowIndex))
                startRowIndex = 0;
            else
                startRowIndex += 1;
            var rows = this.tableFixedBody[0].rows;
            var cell,
                c = this.fixedColumns[colIndex],
                i, l = $.isNumeric(endRowIndex) ? endRowIndex + 1 : rows.length;
            for (i = startRowIndex; i < l; i++) {
                cell = $(rows[i].cells[colIndex]);
                cell.html("");
                cell.append(rowNumber.apply(this, [null, c, i]));
            }
        },
        _findRowNumberColumnIndex: function () {
            var colIndex = -1;
            if (!Array.isArray(this.fixedColumns)) {
                return colIndex;
            }
            var i,
                l = this.fixedColumns.length,
                c;
            for (i = 0; i < l; i++) {
                c = this.fixedColumns[i];
                if (c.handler === ui.ColumnStyle.cfn.rowNumber) {
                    colIndex = i;
                    break;
                }
            }
            return colIndex;
        },
        //当前行上移
        currentUp: function () {
            var data = this.getCurrentSelection();
            if (!data || data.rowIndex == 0) {
                return;
            }
            this.moveRow(data.rowIndex, data.rowIndex - 1);
        },
        //当前行下移
        currentDown: function () {
            var data = this.getCurrentSelection();
            if (!data || data.rowIndex >= this.count()) {
                return;
            }
            this.moveRow(data.rowIndex, data.rowIndex + 1);
        },
        //根据索引将某一行移动到另一行的位置
        moveRow: function (rowIndex, destIndex) {
            var count = this.count();
            if (count == 0) {
                return;
            }
            if (destIndex < 0) {
                destIndex = 0;
            } else if (destIndex >= count) {
                destIndex = count - 1;
            }

            if (destIndex == rowIndex) {
                return;
            }

            var rows = this.tableDataBody[0].rows,
                destRow = $(rows[destIndex]),
                hasFixed = Array.isArray(this.fixedColumns) && this.fixedColumns.length > 0,
                temp;
            if (destIndex > rowIndex) {
                temp = this.dataTable[rowIndex];
                this.dataTable.splice(rowIndex, 1);
                this.dataTable.splice(destIndex, 0, temp);

                destRow.after($(rows[rowIndex]));
                if (hasFixed) {
                    rows = this.tableFixedBody[0].rows;
                    destRow = $(rows[destIndex]);
                    destRow.after($(rows[rowIndex]));
                }
                this.refreshRowNumber(rowIndex - 1, destIndex);
            } else {
                temp = this.dataTable[rowIndex];
                this.dataTable.splice(rowIndex, 1);
                this.dataTable.splice(destIndex, 0, temp);

                destRow.before($(rows[rowIndex]));
                if (hasFixed) {
                    rows = this.tableFixedBody[0].rows;
                    destRow = $(rows[destIndex]);
                    destRow.before($(rows[rowIndex]));
                }
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
        _updateScrollState: function () {
            if (!this.reportDataBody || !this.tableDataHead) {
                return;
            }
            var h = this.reportDataBody.height(),
                w = this.reportDataBody.width(),
                sh = this.reportDataBody.get(0).scrollHeight,
                sw = this.reportDataBody.get(0).scrollWidth;

            if (sh > h) {
                //滚动条应该是17像素，在IE下col会显示为16.5，有效为16为了修正此问题设置为17.1
                this.dataHeadScrollCol.css("width", ui.scrollbarWidth + 0.1 + "px");
            } else {
                this.dataHeadScrollCol.css("width", "0px");
            }

            if (sw > w) {
                this.reportFixedBody.css("height", h - ui.scrollbarWidth + "px");
                this.fixedBodyScroll.css("display", "block");
            } else {
                this.reportFixedBody.css("height", h + "px");
                this.fixedBodyScroll.css("display", "none");
            }
        },
        _setHeight: function (height) {
            if ($.isNumeric(height)) {
                this.height = height;
                height -= this.columnHeight + this.borderHeight;
                if (this.pager)
                    height -= this.pagerHeight;
                this.reportBody.css("height", height + "px");
                this.reportFixedBody.css("height", height + "px");
                this.reportDataBody.css("height", height + "px");
            }
        },
        _setWidth: function (width) {
            if ($.isNumeric(width)) {
                width -= this.borderWidth;
                this.width = width;
                this.element.css("width", width + "px");
            }
        },
        setSize: function (width, height) {
            this._setWidth(width);
            this._setHeight(height);
            this._updateScrollState();
            if (this.promptIsShow()) {
                this._setPromptLocation();
            }
        },
        _initDataPrompt: function () {
            var text = this.option.promptText;
            if (ui.core.type(text) === "string" && text.length > 0) {
                this.dataPrompt.html("<span class='font-highlight'>" + text + "</span>");
            } else if ($.isFunction(text)) {
                text = text() + "";
                this.dataPrompt.append(text);
            }
        },
        _setPromptLocation: function () {
            if (!this.hasPrompt) {
                return;
            }
            var height = this.dataPrompt.height();
            this.dataPrompt.css("margin-top", -(height / 2) + "px");
        },
        showDataPrompt: function () {
            this.dataPrompt.css("display", "block");
            this._setPromptLocation();
        },
        hideDataPrompt: function () {
            this.dataPrompt.css("display", "none");
        },
        promptIsShow: function () {
            return this.hasPrompt && this.dataPrompt.css("display") === "block";
        }
    });

    $.fn.setReportView = function (option) {
        if (this.length == 0 || this.nodeName() !== "DIV") {
            return null;
        }
        if (option.selection) {
            if (typeof option.selection.type === "string") {
                option.selection.type = option.selection.type.toLowerCase();
            } else {
                option.selection.type = "disabled";
            }
        }
        var width = this.width();
        var height = this.height();
        if (!$.isNumeric(option.width) && width > 0)
            option.width = width;
        if (!$.isNumeric(option.height) && height > 0)
            option.height = height;

        return ctrl(option, this);
    };
})();