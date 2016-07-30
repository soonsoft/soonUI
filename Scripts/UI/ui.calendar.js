; (function () {
    var ui = window.ui;
    var fontColor = ui.theme.highlight.font;

    /// events
    //日历视图切换前
    var viewChanging = "viewChanging",
        //日历视图切换后
        viewChanged = "viewChanged",
        //日历内容更新前
        changing = "changing",
        //日历内容更新后
        changed = "changed",
        //日历选择前
        selecting = "selecting",
        //日历选择后
        selected = "selected",
        //日历取消选择
        deselected = "deselected",
        //周和日视图标题点击
        weekTitleClick = "weekTitleClick";

    //constant
    var timeTitleWidth = 80,
        hourHeight = 25,
        sundayFirstWeek = ["日", "一", "二", "三", "四", "五", "六"],
        mondayFirstWeek = ["一", "二", "三", "四", "五", "六", "日"];

    var ctrl = ui.define("ctrls.Calendar", {
        _getOption: function () {
            return {
                views: ["YearView", "MonthView", "WeekView", "DayView"],
                defaultView: "WeekView",
                unitTime: 30,
                sundayFirst: false,
                startDate: null,
                yearMultipleSelect: false,
                monthMultipleSelect: false
            };
        },
        _getEvents: function () {
            return [
                viewChanging,
                viewChanged,
                changing,
                changed,
                selecting,
                selected,
                deselected,
                weekTitleClick
            ];
        },
        _create: function () {
            if (!$.isNumeric(this.option.unitTime)) {
                this.option.unitTime = 30;
            } else {
                var temp = 60 / this.option.unitTime;
                if (temp % 2) {
                    temp -= 1;
                    this.option.unitTime = 60 / temp;
                }
            }

            this.viewTypes = {
                "YearView": YearView,
                "MonthView": MonthView,
                "WeekView": WeekView,
                "DayView": DayView
            };
            this.views = {};
            if (this.option.startDate instanceof Date) {
                this.currentDate = this.option.startDate;
            } else {
                this.currentDate = new Date();
            }

            this.viewChangeAnimator = ui.animator(null, {
                ease: ui.AnimationStyle.easeTo,
                onChange: function (val, elem) {
                    elem.css("left", val + "px");
                }
            });
            this.viewChangeAnimator.addTarget(null, {
                ease: ui.AnimationStyle.easeFrom,
                onChange: function (val, elem) {
                    elem.css({
                        "filter": "Alpha(opacity=" + val + ")",
                        "opacity": val / 100
                    });
                }
            });
            this.viewChangeAnimator.duration = 500;
        },
        _init: function () {
            var i = 0,
                viewName;
            for (; i < this.option.views.length; i++) {
                viewName = this.option.views[i];
                if (this.viewTypes.hasOwnProperty(viewName)) {
                    this.views[viewName] = new this.viewTypes[viewName](this);
                }
            }
            this.element.css("position", "relative");
            this.changeView(this.option.defaultView);
        },
        getWeek: function (date) {
            this.currentDate = new Date(date.getTime());
            var week;
            var days = [];
            if (this.option.sundayFirst) {
                week = date.getDay();
                date.setDate(date.getDate() - week);
            } else {
                week = date.getDay() || 7;
                date.setDate(date.getDate() - week + 1);
            }
            var firstDay = new Date(date.getTime());
            days.push(firstDay);
            for (var i = 1; i < 7; i++) {
                days.push(new Date(date.setDate(date.getDate() + 1)));
            }
            return days;
        },
        getWeekStartEnd: function (date) {
            date = new Date(date.getTime());
            var week;
            var result = {
                year: date.getFullYear(),
                month: date.getMonth()
            };
            if (this.option.sundayFirst) {
                week = date.getDay();
                date.setDate(date.getDate() - week);
                result.startDate = date.getDate();
            } else {
                week = date.getDay() || 7;
                date.setDate(date.getDate() - week + 1);
                result.startDate = date.getDate();
            }
            result.endDate = result.startDate + week - 1;
            return result;
        },
        getDateIndex: function (date) {
            var week = date.getDay();
            if (!this.option.sundayFirst) {
                if (week == 0) {
                    week = 6;
                } else {
                    week--;
                }
            }
            return week;
        },
        getWeekendIndex: function () {
            var result = {
                saturday: 6,
                sunday: 0
            };
            if (!this.option.sundayFirst) {
                result.saturday = 5;
                result.sunday = 6;
            }
            return result;
        },
        getTableIndexOfMonth: function (date) {
            var first = new Date(date.getFullYear(), date.getMonth(), 1);
            var startIndex = this.getDateIndex(first),
                day = date.getDate() + startIndex - 1;
            var result = {
                rowIndex: Math.floor(day / 7),
                cellIndex: 0
            };
            result.cellIndex = day - result.rowIndex * 7;
            return result;
        },
        getWeekNames: function () {
            if (this.option.sundayFirst) {
                return sundayFirstWeek;
            } else {
                return mondayFirstWeek;
            }
        },
        indexToTime: function (index) {
            var count = this._getTimeCellCount(),
                h = index / count;
            h = h < 10 ? "0" + h : h + "";
            var arr = h.split(".");
            var text = arr[0] + ":";
            if (arr.length > 1) {
                text += parseFloat("0." + arr[1]) * 60;
            } else {
                text += "00";
            }
            return text;
        },
        timeToIndex: function (time) {
            return Math.ceil(this._timeToCellNumber(time));
        },
        timeToPosition: function(time, unitHeight) {
            return this._timeToCellNumber(time) * unitHeight;
        },
        _timeToCellNumber: function(time) {
            var beginArr = time.split(":"),
                count = this._getTimeCellCount();
            var hour = parseInt(beginArr[0], 10),
                minute = parseInt(beginArr[1], 10),
                second = parseInt(beginArr[2], 10);
            return (hour + minute / 60) * count;
        },
        _getTimeCellCount: function () {
            return Math.floor(60 / this.option.unitTime) || 1;
        },
        prev: function () {
            this.doChange("prev");
        },
        next: function () {
            this.doChange("next");
        },
        today: function () {
            this.doChange("today");
        },
        showTimeLine: function (parent) {
            if (!this.currentTime) {
                this.currentTime = $("<div class='current-time border-highlight font-highlight' />");
                this.currentTime.css("width", timeTitleWidth + "px");
                this.element.append(this.currentTime);
            } else {
                this.currentTime.css("display", "block");
            }
            if (this.timeoutHandler) {
                window.clearTimeout(this.timeoutHandler);
            }
            parent.append(this.currentTime);
            var updateInterval = 60 * 1000,
                that = this;
            var updateTimeFunc = function () {
                var time = formatTime(new Date());
                var index = that.timeToIndex(time),
                    top = that.timeToPosition(time, hourHeight),
                    ct = that.currentTime;
                ct.html("<span>" + time.substring(0, 5) + "</span>");
                if (index == 0) {
                    ct.addClass("current-time-top").css("top", top + "px");
                } else {
                    ct.removeClass("current-time-top").css("top", top - ui.scrollbarWidth + "px")
                }
                that.timeoutHandler = window.setTimeout(
                    arguments.callee, updateInterval);
            };
            this.timeoutHandler = window.setTimeout(updateTimeFunc, 1);
        },
        hideTimeLine: function () {
            if (this.timeoutHandler) {
                window.clearTimeout(this.timeoutHandler);
            }
            if (this.currentTime) {
                this.currentTime.css("display", "none");
            }
        },
        doChange: function (action) {
            var result = this.fire(changing, this.currentView, action);
            if (result === false) {
                return;
            }
            this.currentView[action].call(this.currentView);
            this.fire(changed, this.currentView, action);
        },
        changeView: function (viewName) {
            var view = this.views[viewName];
            if (!view) {
                ui.error("没有注册" + viewName + "视图");
            }

            var result = this.fire(viewChanging, this.currentView, view);
            if (result === false) {
                return;
            }

            if (this.currentView) {
                this.viewChangeAnimator.stop();
                this.currentView.viewPanel.css({
                    "display": "none",
                    "filter": "Alpha(opacity=0)",
                    "opacity": 0
                });
                this.currentView.dormant();
            }
            var width = this.element.width();
            view.viewPanel.css({
                "display": "block",
                "left": (width / 3) + "px"
            });
            var isInitialled = false, isChanged = false;
            if (!view.initialled) {
                view.init();
                isInitialled = true;
            }
            var isChanged = view.checkChange();
            view.setSize(this.element.width(), this.element.height());
            this.currentView = view;

            var option = this.viewChangeAnimator[0];
            option.target = view.viewPanel;
            option.begin = width / 3;
            option.end = 0;

            option = this.viewChangeAnimator[1];
            option.target = view.viewPanel;
            option.begin = 0;
            option.end = 100;

            var that = this;
            this.viewChangeAnimator.onEnd = function () {
                that.currentView.active();
                that.fire(viewChanged, that.currentView);
                if (isInitialled || isChanged) {
                    that.fire(changed, that.currentView);
                }
            };
            this.viewChangeAnimator.start();
        },
        setSize: function (width, height) {
            this.element.css("height", height + "px");
            this.currentView.setSize(width, height);
        },
        getTitle: function () {
            return this.currentView.getTitle();
        },
        isView: function (view, viewName) {
            if (!view) {
                return false;
            }
            return view.toString().lastIndexOf(viewName) !== -1;
        },
        getView: function (viewName) {
            if (this.views.hasOwnProperty(viewName))
                return this.views[viewName];
            else
                return null;
        }
    });

    var YearView = function (calendar) {
        this.calendar = calendar;
        this.viewPanel = $("<div class='view-panel' />");
        this.initialled = false;

        this.selectList = [];
        this.isMultiple = !!this.calendar.option.yearMultipleSelect;

        this.year = null;
        this.calendar.element.append(this.viewPanel);
    };
    YearView.prototype = {
        init: function () {
            if (this.initialled) {
                return;
            }

            this.yearPanel = $("<div class='year-panel' />");
            this._createYear();

            this.viewPanel.append(this.yearPanel);
            this.initialled = true;
        },
        getMonthCount: function (width) {
            if (width >= 1024) {
                return 4;
            } else if (width >= 768) {
                return 3;
            } else if (width >= 512) {
                return 2;
            } else {
                return 1;
            }
        },
        _createYear: function () {
            var div,
                i = 0;
            for (; i < 12; i++) {
                div = $("<div class='year-month-panel' />");
                div.append(
                    $("<div class='year-month-title' />")
                        .append("<span class='font-highlight'>" + (i + 1) + "月" + "</span>"));
                div.append("<div class='year-month-content' />");
                this.yearPanel.append(div);
            }
            this.yearPanel.append("<br style='clear:left' />");
        },
        oddStyle: function (cell, count, i) {
            if (i % 2) {
                cell.addClass("year-month-odd");
            }
        },
        evenStyle: function (cell, count, i) {
            if (Math.floor(i / count) % 2) {
                if (i % 2) {
                    cell.addClass("year-month-odd");
                }
            } else {
                if (i % 2 == 0) {
                    cell.addClass("year-month-odd");
                }
            }
        },
        _setCellSize: function (width, height) {
            var count = this.getMonthCount(width),
                oddFunc;
            if (count % 2) {
                oddFunc = this.oddStyle;
            } else {
                oddFunc = this.evenStyle;
            }
            this.yearPanel.find(".year-month-odd").removeClass("year-month-odd");
            var cells = this.yearPanel.children(),
                cell = null,
                unitWidth = Math.floor(width / count),
                unitHeight = Math.floor(unitWidth / 4 * 3);
            if (unitHeight * (12 / count) > height || this.yearPanel[0].scrollHeight > height) {
                width -= ui.scrollbarWidth;
                unitWidth = Math.floor(width / count);
            }
            if (unitHeight < 248) {
                unitHeight = 248;
            }
            for (var i = 0; i < 12; i++) {
                cell = $(cells[i]);
                cell.css("width", unitWidth + "px")
                    .css("height", unitHeight + "px");
                cell.find(".year-month-content").css("height", unitHeight - 48 + "px");
                oddFunc.call(this, cell, count, i);
            }
        },
        _updateYear: function () {
            var cells = this.yearPanel.children(),
                year = this.calendar.currentDate.getFullYear(),
                cell = null,
                today = new Date(), i;
            for (i = 0; i < 12; i++) {
                cell = $(cells[i]);
                this._createMonth($(cell.children()[1]), year, i, today);
            }
        },
        _createMonth: function (content, year, month, today) {
            var table = $("<table class='year-month-table unselectable' cellspacing='0' cellpadding='0' />");
            var week = this.calendar.getWeekNames(),
                colgroup = $("<colgroup />"),
                thead = $("<thead />"),
                tbody = $("<tbody />"),
                row, cell, i = 0, j;
            row = $("<tr />");
            for (i = 0; i < 7; i++) {
                colgroup.append("<col />");
                row.append("<th>" + week[i] + "</th>");
            }
            thead.append(row);

            var first = 1,
                date = new Date(year, month, first),
                startIndex = this.calendar.getDateIndex(date),
                last = (new Date(year, month + 1, 0)).getDate(),
                dayVal, flag = false, day;
            if (year == today.getFullYear() && month == today.getMonth()) {
                flag = true;
                day = today.getDate();
            }
            for (i = 0; i < 6; i++) {
                row = $("<tr />");
                for (j = 0; j < 7; j++) {
                    cell = $("<td />");
                    row.append(cell);
                    if (i == 0 && j < startIndex) {
                        continue;
                    } else if (first <= last) {
                        dayVal = $("<span>" + first + "</span>");
                        if (flag && first == day) {
                            dayVal.addHighlight("today", "background");
                        }
                        cell.append(dayVal);
                        first++;
                    }
                }
                tbody.append(row);
            }
            table.append(colgroup).append(thead).append(tbody);
            content.html("").append(table);

            var that = this;
            tbody.data("month", month);
            tbody.click(function (e) {
                var elem = $(e.target),
                    nodeName;
                while ((nodeName = elem.nodeName()) !== "TD") {
                    if (nodeName === "TBODY") {
                        return;
                    }
                    elem = elem.parent();
                }

                that.onSelectDay(elem);
            });
        },
        active: function () {

        },
        dormant: function () {

        },
        prev: function () {
            var day = this.calendar.currentDate;
            day.setFullYear(day.getFullYear() - 1);
            this.onYearChange();
        },
        next: function () {
            var day = this.calendar.currentDate;
            day.setFullYear(day.getFullYear() + 1);
            this.onYearChange();
        },
        today: function (day) {
            if (!day || !(day instanceof Date)) {
                day = new Date();
            }
            this.calendar.currentDate = new Date(day.getTime());
            this.onYearChange();
        },
        addSchedules: function (data, dateField, callback, formatAction) {
            if ($.isFunction(dateField)) {
                if ($.isFunction(callback)) {
                    formatAction = callback;
                }
                callback = dateField;
                dateField = null;
            }
            if (!$.isFunction(formatAction)) {
                formatAction = null;
            }
            var action = function (item) {
                var i = this.children("i");
                if (i.length == 0) {
                    this.append("<i class='day-marker border-highlight'></i>");
                }
                if (formatAction) {
                    formatAction.call(this, item);
                }
            };
            this._fillSchedules(data, dateField, callback, action);
        },
        removeSchedules: function (data, dateField, callback, formatAction) {
            if ($.isFunction(dateField)) {
                if ($.isFunction(callback)) {
                    formatAction = callback;
                }
                callback = dateField;
                dateField = null;
            }
            if (!$.isFunction(formatAction)) {
                formatAction = null;
            }
            var action = function (item) {
                var i = this.children("i");
                if (i.length > 0) {
                    i.remove();
                }
                if (formatAction) {
                    formatAction.call(this, item);
                }
            };
            this._fillSchedules(data, dateField, callback, action);
        },
        clearSchedules: function() {
            var cells = this.yearPanel.children(),
                dayCell,
                item,
                i = 0, 
                len = cells.length;
            for (; i < len; i++) {
                dayCell = $(cells[i]);
                item = this.children("i");
                if (item.length > 0) {
                    item.remove();
                }
            }
        },
        _fillSchedules: function (data, dateField, callback, formatAction) {
            if (ui.core.type(data) !== "array") {
                return;
            }
            if (!dateField) {
                dateField = "date";
            }
            if (!$.isFunction(callback)) {
                callback = null;
            }
            this.scheduleData = data;
            var cells = this.yearPanel.children(),
                dayCell, d, item,
                i = 0, len = data.length;
            for (; i < len; i++) {
                item = data[i];
                if (!(item instanceof Date)) {
                    if (callback) {
                        d = callback.call(this, item);
                    } else {
                        d = d[dateField];
                    }
                    if (!(d instanceof Date)) {
                        continue;
                    }
                } else {
                    d = item;
                }
                dayCell = this._getCellByDate(cells, d);
                formatAction.call(dayCell, item);
            }
        },

        _setCurrent: function () {
            this.year = this.calendar.currentDate.getFullYear();
        },
        checkChange: function () {
            this.calendar.hideTimeLine();
            if (this.year === this.calendar.currentDate.getFullYear()) {
                return false;
            }
            this.onYearChange();
            return true;
        },
        onYearChange: function () {
            this._setCurrent();
            this._setCellSize(this.viewPanel.width(), this.viewPanel.height());
            this._updateYear();

            this.current = null;
            this.selectList = [];
        },
        onSelectDay: function (td) {
            if (!this.isDateCell(td)) {
                return;
            }
            var date = this._getDateByCell(td);
            var selectedClass = "selected";

            if (this.isMultiple) {
                this.multipleSelection(td, date, selectedClass);
            } else {
                this.singleSelection(td, date, selectedClass);
            }
        },
        singleSelection: function (td, date, selectedClass) {
            var result = this.calendar.fire(selecting, this, td, date);
            if (result === false) return;

            if (this.current) {
                this.current.removeClass(selectedClass);

                if (this.current[0] === td[0]) {
                    this.calendar.fire(deselected, this, td, date);
                    this.current = null;
                    return;
                }
            }

            td.addClass(selectedClass);
            this.current = td;
            this.calendar.fire(selected, this, td, date);
        },
        multipleSelection: function (td, date, selectedClass) {
            if (td.hasClass(selectedClass)) {
                td.removeClass(selectedClass);
                for (var i = 0; i < this.selectList.length; i++) {
                    if (this.selectList[i][0] === td[0]) {
                        this.selectList.splice(i, 1);
                        break;
                    }
                }
                this.calendar.fire(deselected, this, td, date);
            } else {
                var result = this.calendar.fire(selecting, this, td, date);
                if (result === false) return;

                td.addClass(selectedClass);
                this.selectList.push(td);

                this.calendar.fire(selected, this, td, date);
            }
        },
        getCurrentSelection: function () {
            var date = null;
            if (this.current)
                date = this._getDateByCell(this.current);
            return date;
        },
        getMultipleSelection: function () {
            var dataList = [];
            if (this.selectList) {
                for (var i = 0; i < this.selectList.length; i++) {
                    dataList.push(this._getDateByCell(this.selectList[i]));
                }
            }
            return dataList;
        },
        cancelSelection: function () {
            var date,
                elem,
                i;
            var selectedClass = "selected";
            if (this.isMultiple) {
                if (this.selectList.length > 0) {
                    date = [];
                    for (i = 0; i < this.selectList.length; i++) {
                        elem = this.selectList[i];
                        elem.removeClass(selectedClass);
                        date.push(this._getDateByCell(elem));
                    }
                    elem = null;
                    this.selectList = [];
                }
            } else {
                if (this.current) {
                    this.current.removeClass(selectedClass);
                    date = this._getDateByCell(this.current);
                    this.current = null;
                }
            }
            this.calendar.fire(deselected, this, elem, date);
        },
        selectCell: function (dates) {
            if (!Array.isArray(dates)) {
                dates = [dates];
            }
            var i, date, cell,
                error = new Error("Dates do not belong to " + this.year);
            var months = this.yearPanel.children();
            for (i = 0; i < dates.length; i++) {
                date = dates[i];
                if (!(date instanceof Date)) {
                    continue;
                }
                if (date.getFullYear() !== this.year) {
                    throw error;
                }
                cell = this._getCellByDate(months, date);
                this.onSelectDay(cell);
            }
        },
        _getDateByCell: function (td) {
            var children = td.children();
            if (children.length == 0) {
                return null;
            }
            var month,
                tbody = td.parent().parent();
            month = tbody.data("month");
            return new Date(this.year, month,
                parseInt($(children[0]).text(), 10));
        },
        _getCellByDate: function (months, date) {
            var month = $($(months[date.getMonth()]).children()[1]);
            var indexer = this.calendar.getTableIndexOfMonth(date);
            var dayCell = $(month.children()[0].tBodies[0].rows[indexer.rowIndex].cells[indexer.cellIndex]);
            return dayCell;

        },
        isDateCell: function (td) {
            return td.children().length > 0;
        },
        setSize: function (width, height) {
            this._setCellSize(width, height);
        },
        getTitle: function () {
            return this.year + "年";
        },
        toString: function () {
            return "ui.ctrls.Calendar.YearView";
        }
    };

    var MonthView = function (calendar) {
        this.calendar = calendar;
        this.viewPanel = $("<div class='view-panel' />");
        this.weekPanel = null;
        this.dayPanel = null;
        this.initialled = false;

        this.selectList = [];
        this.isMultiple = !!this.calendar.option.monthMultipleSelect;

        this.year;
        this.month;

        this.calendar.element.append(this.viewPanel);
    };
    MonthView.prototype = {
        init: function () {
            if (this.initialled) {
                return;
            }

            this._setCurrent();
            this.weekPanel = $("<div class='month-week-panel' />");
            this._createWeek();

            this.dayPanel = $("<div class='month-day-panel' />");
            this._createDay();

            this.viewPanel.append(this.weekPanel).append(this.dayPanel);
            this.initialled = true;
        },
        _createWeek: function () {
            this.weekTable = $("<table class='week-title unselectable' cellspacing='0' cellpadding='0' />");
            var weekNames = this.calendar.getWeekNames(),
                i = 0,
                thead = $("<thead />"),
                colgroup = $("<colgroup />"),
                th;
            this.weekTable.append(colgroup).append(thead);
            var tr = $("<tr />");
            for (; i < weekNames.length; i++) {
                colgroup.append("<col />");
                th = $("<th />").append("<span>星期" + weekNames[i] + "</span>");
                if (i == weekNames.length - 1) {
                    th.addClass("last");
                }
                tr.append(th);
            }
            thead.append(tr);
            this.weekPanel.append(this.weekTable);
        },
        _createDay: function () {
            var isUpdate = false;
            if (!this.dayTable) {
                this.dayTable = $("<table class='days unselectable' cellspacing='0' cellpadding='0' />");
            } else {
                this.dayTable.html("");
                isUpdate = true;
            }

            var tbody = $("<tbody />"),
                colgroup = $("<colgroup />");
            this.dayTable.append(colgroup).append(tbody);
            var i = 0,
                j,
                tr, td;
            for (j = 0; j < 7; j++) {
                colgroup.append("<col />");
            }
            var day = this.calendar.currentDate,
                first = new Date(day.getFullYear(), day.getMonth(), 1),
                last = (new Date(first.getFullYear(), first.getMonth() + 1, 0)).getDate();
            var startIndex = this.calendar.getDateIndex(first),
                today = new Date(),
                checkToday = null,
                todayVal = today.getDate(),
                weekend = this.calendar.getWeekendIndex();
            if (today.getFullYear() == day.getFullYear() && today.getMonth() == day.getMonth()) {
                checkToday = function (td, day) {
                    if (day == todayVal) {
                        td.find(".date").addClass(fontColor);
                    }
                }
            }
            first = 1;
            for (; i < 6; i++) {
                tr = $("<tr />")
                for (j = 0; j < 7; j++) {
                    td = $("<td />").append("<div />");
                    if (j == weekend.saturday || j == weekend.sunday) {
                        td.addClass("weekend");
                    }
                    if (j == 6) {
                        td.addClass("last");
                    }
                    tr.append(td);
                    if (i == 0 && j < startIndex) {
                        continue;
                    } else if (first > last) {
                        continue;
                    }
                    td.children().html("<span class='date'>" + first + "</span><ul class='schedule'></ul>");
                    if (checkToday) {
                        checkToday(td, first);
                    }
                    first++;
                }
                tbody.append(tr);
                if (first > last) {
                    break;
                }
            }
            this.dayPanel.append(this.dayTable);

            var that = this;
            if (!isUpdate) {
                this.dayTable.click(function (e) {
                    var elem = $(e.target),
                        nodeName;
                    while ((nodeName = elem.nodeName()) !== "TD") {
                        if (nodeName === "TABLE") {
                            return;
                        }
                        elem = elem.parent();
                    }

                    that.onSelectDay(elem);
                });
            }
        },
        _setCellSize: function (width, height) {
            var unitWidth = this._setCellWidth(width);
            var rows = this.dayTable[0].rows,
                rowCount = rows.length;
            height -= rowCount;
            var unitHeight = Math.floor(height / rowCount),
                lastHeight = height - unitHeight * (rowCount - 1);

            var tr, i = 0;
            for (; i < rowCount; i++) {
                tr = $(rows[i]);
                if (i < rowCount - 1) {
                    tr.children().css("height", unitHeight + "px");
                } else {
                    tr.children().css("height", lastHeight + "px");
                }
            }
            var cells = this.weekTable[0].tHead.rows[0].cells,
                prefix = "",
                names = this.calendar.getWeekNames();
            if (unitWidth >= 60) {
                prefix = "星期";
            }
            for (i = 0; i < cells.length; i++) {
                $(cells[i]).children().text(prefix + names[i]);
            }
        },
        _setCellWidth: function (width) {
            var unitWidth = Math.floor(width / 7);
            var wcols = this.weekTable.find("col"),
                dcols = this.dayTable.find("col");
            wcols.splice(6, 1);
            dcols.splice(6, 1);
            wcols.css("width", unitWidth + "px");
            dcols.css("width", unitWidth + "px");
            return unitWidth;
        },
        active: function () { },
        dormant: function () { },
        prev: function () {
            var day = this.calendar.currentDate;
            day.setMonth(day.getMonth() - 1);
            this.onMonthChange();
        },
        next: function () {
            var day = this.calendar.currentDate;
            day.setMonth(day.getMonth() + 1);
            this.onMonthChange();

        },
        today: function (day) {
            if (!day || !(day instanceof Date)) {
                day = new Date();
            }
            this.calendar.currentDate = new Date(day.getTime());
            this.onMonthChange();
        },
        addSchedules: function (data, dateField, textField, callback) {
            if (ui.core.type(data) !== "array") {
                return;
            }
            if ($.isFunction(dateField)) {
                if ($.isFunction(textField)) {
                    callback = textField;
                }
                textField = dateField;
                dateField = null;
            }
            if (ui.core.type(dateField) !== "string") {
                dateField = "date";
            }
            if (!$.isFunction(callback)) {
                callback = null;
            }
            var isString = ui.core.type(textField) === "string",
                isFunction = $.isFunction(textField);
            this.scheduleData = data;

            var item,
                cell, ul,
                text, i;
            for (i = 0; i < data.length; i++) {
                item = data[i];
                if (!item || !(item[dateField] instanceof Date)) {
                    continue;
                }
                cell = this._getCellByDate(item[dateField]);
                ul = cell.find(".schedule");
                if (isString) {
                    text = item[textField] || "";
                } else if (isFunction) {
                    text = textField.call(ul, item);
                }
                ul.append("<li class='schedule-item background-highlight'><span>" + text + "</span></li>");
                if (callback) {
                    callback.call(ul, item);
                }
            }
            this._setCellWidth(this.dayPanel.width());
        },
        removeSchedules: function () {
            ui.error("not support");
        },
        clearSchedules: function(removeAction) {
            var i = 1,
                len = (new Date(this.year, this.month + 1, 0)).getDate();
            var cell,
                schedule;
            var hasFunction = $.isFunction(removeAction);
            for (; i <= len; i++) {
                cell = this._getCellByDate(new Date(this.year, this.month, i));
                schedule = cell.find(".schedule");
                schedule.children().remove();
                if (hasFunction)
                    removeAction.call(schedule);
            }
        },
        _setCurrent: function () {
            var day = this.calendar.currentDate;
            this.year = day.getFullYear();
            this.month = day.getMonth();
        },
        checkChange: function () {
            this.calendar.hideTimeLine();
            var day = this.calendar.currentDate;
            if (this.year == day.getFullYear() && this.month == day.getMonth()) {
                return false;
            }
            this.onMonthChange();
            return true;
        },
        onMonthChange: function () {
            this._setCurrent();
            this._createDay();
            this._setCellSize(this.viewPanel.width(), this.viewPanel.height() - 26);

            this.current = null;
            this.selectList = [];
        },
        onSelectDay: YearView.prototype.onSelectDay,
        singleSelection: YearView.prototype.singleSelection,
        multipleSelection: YearView.prototype.multipleSelection,
        getCurrentSelection: YearView.prototype.getCurrentSelection,
        getMultipleSelection: YearView.prototype.getMultipleSelection,
        cancelSelection: YearView.prototype.cancelSelection,
        selectCell: function (dates) {
            if (!Array.isArray(dates)) {
                dates = [dates];
            }
            var i, date, cell,
                error = new Error("Dates do not belong to " + this.year + "-" + this.month);
            for (i = 0; i < dates.length; i++) {
                date = dates[i];
                if (!(date instanceof Date)) {
                    continue;
                }
                if (date.getFullYear() !== this.year || date.getMonth() !== this.month) {
                    throw error;
                }
                cell = this._getCellByDate(date);
                this.onSelectDay(cell);
            }
        },
        _getDateByCell: function (td) {
            var children = $(td.children()[0]).children();
            if (children.length == 0) {
                return null;
            }
            return new Date(this.year, this.month,
                parseInt($(children[0]).text(), 10));
        },
        _getCellByDate: function (date) {
            var rows = this.dayTable[0].rows;
            var indexer = this.calendar.getTableIndexOfMonth(date);
            var cell = $(rows[indexer.rowIndex].cells[indexer.cellIndex]);
            return cell;
        },
        isDateCell: function (td) {
            return $(td.children()[0]).children().length > 0;
        },
        setSize: function (width, height) {
            height -= 26;
            this.dayPanel.css("height", height + "px");
            this._setCellSize(width, height);
        },
        getTitle: function () {
            return this.year + "年" + (this.month + 1) + "月";
        },
        toString: function () {
            return "ui.ctrls.Calendar.MonthView";
        }
    };

    var WeekView = function (calendar) {
        this.calendar = calendar;
        this.viewPanel = $("<div class='view-panel' />");
        this.todayIndex = -1;
        this.weekDays = null;
        this.weekHours = [];
        this.initialled = false;

        this.startDate;
        this.endDate;

        this.calendar.element.append(this.viewPanel);
    };
    WeekView.prototype = {
        weekNames: sundayFirstWeek,
        init: function () {
            if (this.initialled) {
                return;
            }
            this.weekDays = this.calendar.getWeek(this.calendar.currentDate);
            this._setCurrent();

            this.weekDayPanel = $("<div class='week-day-panel' />");
            this._createWeek();

            this.hourPanel = $("<div class='hour-panel' />");
            this._createHourName();
            this._createHour();

            this._setTodayStyle();

            this.viewPanel.append(this.weekDayPanel).append(this.hourPanel);
            this.selector = Selector(this, this.hourPanel, this.hourTable);
            this.selector.active();

            this.hourAnimator = ui.animator(this.hourPanel, {
                ease: ui.AnimationStyle.easeTo,
                onChange: function (val, elem) {
                    elem.scrollTop(val);
                }
            });
            this.hourAnimator.duration = 800;
            this.initialled = true;
        },
        _createWeek: function () {
            this.weekTable = $("<table class='weekday unselectable' cellspacing='0' cellpadding='0' />");
            var thead = $("<thead />"),
                colgroup = $("<colgroup />");
            var tr = $("<tr />"),
                th = null,
                day = null,
                i = 0;
            for (; i < 7; i++) {
                day = this.weekDays[i];
                th = $("<th />");
                th.text(this._formatDayText(day));
                tr.append(th);
                colgroup.append("<col />");
            }
            thead.append(tr);
            this.weekTable.append(colgroup).append(thead);
            this.weekDayPanel.append(this.weekTable);

            var that = this;
            this.weekTable.click(function (e) {
                var th = $(e.target);
                if (th.nodeName() !== "TH") {
                    return;
                }
                var weekIndex = th[0].cellIndex;
                that.calendar.fire(weekTitleClick, that, weekIndex);
            });
        },
        _createHourName: function () {
            this.hourNames = $("<ul class='hour-name' />");

            var count = this.calendar._getTimeCellCount(),
                height = count * 24 + (count),
                i = 0, j,
                li = null;
            for (; i < 24; i++) {
                li = $("<li />");
                li.css("height", height + "px");
                li.append("<span>" + i + "</span>");
                this.hourNames.append(li);
            }
            this.hourPanel.append(this.hourNames);
        },
        _createHour: function () {
            this.hourTable = $("<table class='weekhour unselectable' cellspacing='0' cellpadding='0' />"),
                tbody = $("<tbody />"),
                colgroup = $("<colgroup />");
            var i = 0;
            for (; i < 7; i++) {
                colgroup.append("<col />");
            }
            var tr = null,
                td = null,
                count = this.calendar._getTimeCellCount(),
                len = 24 * count,
                weekend = this.calendar.getWeekendIndex();
            for (i = 0; i < len; i++) {
                tr = $("<tr />");
                for (j = 0; j < 7; j++) {
                    td = $("<td />");
                    if (j == weekend.saturday || j == weekend.sunday) {
                        td.addClass("weekend");
                    }
                    if ((i + 1) % count)
                        td.addClass("odd");
                    tr.append(td);
                }
                tbody.append(tr);
            }

            this.hourTable.append(colgroup).append(tbody);
            this.hourPanel.append(this.hourTable);
        },
        _setCellSize: function (width, height) {
            var scrollWidth = 0;
            if (height < this.hourPanel[0].scrollHeight) {
                scrollWidth = ui.scrollbarWidth;
            }
            var realWidth = width - timeTitleWidth - scrollWidth,
                unitWidth = Math.floor(realWidth / 7);
            if (unitWidth < 95) {
                unitWidth = 95;
            }
            var wcols = this.weekTable.find("col"),
                hcols = this.hourTable.find("col");
            this.weekTable.css("width", unitWidth * 7 + "px");
            this.hourTable.css("width", unitWidth * 7 + "px");
            wcols.css("width", unitWidth + "px");
            hcols.css("width", unitWidth + "px");

            if (this.selector.cellWidth > 1) {
                this._resetScheduleInfo(unitWidth - this.selector.cellWidth);
            }

            this.selector.cellWidth = unitWidth;
            this.selector.cancelSelection();
        },
        _updateWeek: function () {
            var tr = this.weekTable[0].tHead.rows[0],
                    th = null,
                    day = null;
            for (var i = 0; i < 7; i++) {
                day = this.weekDays[i];
                th = $(tr.cells[i]);
                th.text(this._formatDayText(day));
                th.removeClass("holiday");
            }
        },
        _clearTodayStyle: function () {
            var todayHours = this.hourTable.find(".today");
            todayHours.removeClass("today");
        },
        _setTodayStyle: function () {
            var today = new Date(),
                date = null,
                i = 0;
            this.todayIndex = -1;
            for (; i < 7; i++) {
                date = this.weekDays[i];
                if (date.getFullYear() == today.getFullYear() && date.getMonth() == today.getMonth() && date.getDate() == today.getDate()) {
                    this.todayIndex = i;
                    break;
                }
            }
            if (this.todayIndex < 0) {
                return;
            }

            var table = this.hourTable[0],
                tableRow = null;
            for (i = 0; i < table.rows.length; i++) {
                tableRow = table.rows[i];
                $(tableRow.cells[this.todayIndex]).addClass("today");
            }
        },
        _setHolidayStyle: function () {

        },
        _formatDayText: function (day) {
            return (day.getMonth() + 1) + " / " + day.getDate() + "（" + this.weekNames[day.getDay()] + "）";
        },
        active: function () {
            this.selector.active();
        },
        dormant: function () {
            this.selector.dormant();
        },
        prev: function () {
            var day = this.calendar.currentDate;
            this.weekDays = this.calendar.getWeek(
                new Date(day.getFullYear(), day.getMonth(), day.getDate() - 7));
            this.onWeekChange();
        },
        next: function () {
            var day = this.calendar.currentDate;
            this.weekDays = this.calendar.getWeek(
                new Date(day.getFullYear(), day.getMonth(), day.getDate() + 7));
            this.onWeekChange();
        },
        today: function (day) {
            if (!day || !(day instanceof Date)) {
                day = new Date();
            }
            this.weekDays = this.calendar.getWeek(day);
            this.onWeekChange();
        },
        setBeginTime: function (beginTime) {
            var height = this.hourPanel.height(),
                scrollHeight = this.hourPanel[0].scrollHeight;
            if (height >= scrollHeight) {
                return;
            }
            this.hourAnimator.stop();
            var index = this.calendar.timeToIndex(beginTime),
                count = this.calendar._getTimeCellCount();
            if (index > count) {
                index -= count;
            }
            var maxTop = scrollHeight - height,
                scrollTop = index * hourHeight;
            if (scrollTop > maxTop) {
                scrollTop = maxTop;
            }
            var option = this.hourAnimator[0];
            option.begin = this.hourPanel.scrollTop();
            option.end = scrollTop;
            this.hourAnimator.start();
        },
        addSchedules: function (data, beginDateTimeField, endDateTimeField, formatAction, getColumnFunc) {
            if (ui.core.type(data) !== "array") {
                return;
            }
            if ($.isFunction(beginDateTimeField)) {
                formatAction = beginDateTimeField;
                beginDateTimeField = null;
            }
            if (!beginDateTimeField) {
                beginDateTimeField = "beginTime";
            }
            if (!endDateTimeField) {
                endDateTimeField = "endTime";
            }
            if (!$.isFunction(getColumnFunc)) {
                getColumnFunc = function (date) {
                    return this.calendar.getDateIndex(date);
                };
            }
            var item, i = 0,
                scheduleInfo = null,
                beginTime,
                endTime;
            for (; i < data.length; i++) {
                item = data[i];
                scheduleInfo = {
                    data: item,
                    beginDate: null,
                    endDate: null,
                    itemPanel: null
                };
                scheduleInfo.beginDate = item[beginDateTimeField];
                scheduleInfo.endDate = item[endDateTimeField];
                scheduleInfo.columnIndex = getColumnFunc.call(this, scheduleInfo.beginDate);
                beginTime = formatTime(scheduleInfo.beginDate);
                endTime = formatTime(scheduleInfo.endDate, scheduleInfo.beginDate);
                scheduleInfo.beginRowIndex = this.calendar.timeToIndex(beginTime);
                scheduleInfo.endRowIndex = this.calendar.timeToIndex(endTime);

                this.addScheduleItem(
                    $(this.hourTable[0].rows[scheduleInfo.beginRowIndex].cells[scheduleInfo.columnIndex]),
                    $(this.hourTable[0].rows[scheduleInfo.endRowIndex].cells[scheduleInfo.columnIndex]),
                    formatAction, scheduleInfo,
                    beginTime.substring(0, 5) + " - " + endTime.substring(0, 5));
            }
        },
        removeSchedules: function (beginDateArray) {
            this.findScheduleInfo(beginDateArray, function (scheduleInfo) {
                scheduleInfo.itemPanel.remove();
                return "delete";
            });
        },
        clearSchedules: function() {
            this.removeAllSchedules();
        },
        removeAllSchedules: function () {
            var i = 0, j,
                weekDay;
            for (; i < this.weekHours.length; i++) {
                weekDay = this.weekHours[i];
                if (weekDay) {
                    for (j = 0; j < weekDay.length; j++) {
                        weekDay[j].itemPanel.remove();
                    }
                }
            }
            this.weekHours = [];
        },
        addScheduleItem: function (beginCell, endCell, formatAction, scheduleInfo, titleText) {
            var scheduleItem = $("<div class='schedule-item-panel' />");
            var title = $("<div class='time-title' />"),
                record = $("<div class='record-panel' />");
            title.html("<span>" + titleText + "</span>");
            scheduleItem.append(title).append(record);

            var bp = this.getPositionAndSize(beginCell),
                ep = this.getPositionAndSize(endCell);
            scheduleItem.css({
                "top": bp.top + "px",
                "left": bp.left + "px",
                "width": bp.width + "px",
                "height": ep.height + ep.top - bp.top + "px"
            });
            $(this.hourPanel).append(scheduleItem);

            scheduleInfo.itemPanel = scheduleItem;
            this.setScheduleInfo(scheduleInfo.columnIndex, scheduleInfo);
            if ($.isFunction(formatAction)) {
                formatAction.call(this, scheduleInfo, scheduleItem);
            }
        },
        findScheduleInfo: function (beginDateArray, callback, caller) {
            if (beginDateArray instanceof Date) {
                beginDateArray = [beginDateArray];
            }
            if (!Array.isArray(beginDateArray)) {
                return;
            }
            if (!$.isFunction(callback)) {
                callback = null;
            }
            if (!caller) {
                caller = this;
            }
            var i, j, date,
                weekIndex, beginRowIndex, dayItems;
            for (i = 0; i < beginDateArray.length; i++) {
                date = beginDateArray[i];
                if (date instanceof Date) {
                    weekIndex = this.calendar.getDateIndex(date);
                    beginRowIndex = this.calendar.timeToIndex(formatTime(date));
                    dayItems = this.getScheduleInfo(weekIndex);
                    if (dayItems) {
                        for (j = 0; j < dayItems.length; j++) {
                            if (beginRowIndex === dayItems[j].beginRowIndex) {
                                if (callback.call(caller, dayItems[j]) === "delete") {
                                    dayItems.splice(j, 1);
                                    j--;
                                }
                            }
                        }
                    }
                }
            }
        },
        setScheduleInfo: function (weekIndex, info) {
            var weekDay = this.weekHours[weekIndex];
            if (!weekDay) {
                weekDay = [];
                this.weekHours[weekIndex] = weekDay;
            }
            info.weekIndex = weekIndex;
            weekDay.push(info);
        },
        getScheduleInfo: function (weekIndex) {
            var weekDay = this.weekHours[weekIndex];
            if (!weekDay) {
                return null;
            }
            return weekDay;
        },
        hasSchedule: function (weekIndex) {
            var weekDay = this.weekHours[weekIndex];
            if (!weekDay) {
                return false;
            }
            return weekDay.length > 0;
        },
        _resetScheduleInfo: function (val) {
            var column, left, width;
            var i = 0, j,
                weekDay, panel;
            for (; i < this.weekHours.length; i++) {
                weekDay = this.weekHours[i];
                if (weekDay) {
                    for (j = 0; j < weekDay.length; j++) {
                        panel = weekDay[j].itemPanel;
                        column = weekDay[j].weekIndex;
                        left = parseFloat(panel.css("left"));
                        width = parseFloat(panel.css("width"));
                        panel.css({
                            "left": (left + column * val) + "px",
                            "width": (width + val) + "px"
                        });
                    }
                }
            }
        },
        getPositionAndSize: function (td) {
            var position = td.position();
            position.left = position.left + timeTitleWidth;
            position.top = position.top;
            return {
                top: position.top,
                left: position.left,
                width: td.outerWidth() - 1,
                height: td.outerHeight() - 1
            };
        },
        _setCurrent: function () {
            var day = this.weekDays[0];
            this.startDate = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0, 0, 0);
            day = this.weekDays[6];
            this.endDate = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59);

            this.year = day.getFullYear();
            this.month = day.getMonth();
            this.day = day.getDate();
        },
        checkChange: function () {
            this.calendar.showTimeLine(this.hourPanel);
            var day = this.calendar.currentDate;
            if (day >= this.startDate && day <= this.endDate) {
                return false;
            } else {
                this.weekDays = this.calendar.getWeek(day);
            }
            this.onWeekChange();
            return true;
        },
        onWeekChange: function () {
            this._setCurrent();
            this.removeAllSchedules();
            this._clearTodayStyle();
            this.selector.cancelSelection();
            this._updateWeek();
            this._setTodayStyle();
        },
        onWeekDayClick: function () {

        },
        setSize: function (width, height) {
            this.hourPanel.css("height", height - 25 + "px");
            this._setCellSize(width, height);
        },
        getTitle: function () {
            return ui.str.stringFormat("{0}年{1}月{2}日 ~ {3}年{4}月{5}日",
                this.startDate.getFullYear(), this.startDate.getMonth() + 1, this.startDate.getDate(),
                this.endDate.getFullYear(), this.endDate.getMonth() + 1, this.endDate.getDate());
        },
        toString: function () {
            return "ui.ctrls.Calendar.WeekView";
        }
    };

    var DayView = function (calendar) {
        this.calendar = calendar;
        this.viewPanel = $("<div class='view-panel' />");
        this.initialled = false;

        this.dayHours = [];

        this.year;
        this.month;
        this.day;

        this.calendar.element.append(this.viewPanel);
    };
    DayView.prototype = {
        init: function () {
            if (this.initialled) {
                return;
            }
            this._setCurrent();

            this.dayPanel = $("<div class='day-panel' />");
            this._createDay();

            this.hourPanel = $("<div class='hour-panel' />");
            this._createHourName();
            this._createHour();

            this.viewPanel.append(this.dayPanel).append(this.hourPanel);
            this.selector = Selector(this, this.hourPanel, this.hourTable);
            this.selector.active();
            
            this.hourAnimator = ui.animator(this.hourPanel, {
                ease: ui.AnimationStyle.easeTo,
                onChange: function (val, elem) {
                    elem.scrollTop(val);
                }
            });
            this.hourAnimator.duration = 800;
            this.initialled = true;
        },
        _createDay: function () {
            this.dayTitle = $("<div class='day-title-panel' />");
            this._setDayText();
            this.dayPanel.append(this.dayTitle);

            var that = this;
            this.dayTitle.click(function (e) {
                that.calendar.fire(weekTitleClick, that, 0);
            });
        },
        _createHourName: WeekView.prototype._createHourName,
        _createHour: function () {
            this.hourTable = $("<table class='weekhour unselectable' cellspacing='0' cellpadding='0' />"),
                tbody = $("<tbody />");
            var tr = null,
                td = null,
                count = this.calendar._getTimeCellCount(),
                len = 24 * count, i;
            for (i = 0; i < len; i++) {
                tr = $("<tr />");
                td = $("<td style='width:100%' />");
                if ((i + 1) % count)
                    td.addClass("odd");
                tr.append(td);
                tbody.append(tr);
            }
            this.hourTable.append(tbody);
            this.hourPanel.append(this.hourTable);
        },
        _setCellSize: function (width, height) {
            var scrollWidth = 0;
            if (height < this.hourPanel[0].scrollHeight) {
                scrollWidth = ui.scrollbarWidth;
            }
            var realWidth = width - timeTitleWidth - scrollWidth - 2;
            this.dayTitle.css("width", realWidth + "px");
            this.hourTable.css("width", realWidth + "px");

            if (this.selector.cellWidth > 1) {
                this._resetScheduleInfo(realWidth - this.selector.cellWidth);
            }

            this.selector.cellWidth = realWidth;
            this.selector.cancelSelection();
        },
        _setDayText: function () {
            this.dayTitle.html("<span>" +
                WeekView.prototype._formatDayText(this.calendar.currentDate) + "</span>");
        },
        active: function () {
            this.selector.active()
        },
        dormant: function () {
            this.selector.dormant()
        },
        prev: function () {
            this.calendar.currentDate.setDate(
                this.calendar.currentDate.getDate() - 1);
            this.onDateChange();
        },
        next: function () {
            this.calendar.currentDate.setDate(
                this.calendar.currentDate.getDate() + 1);
            this.onDateChange();
        },
        today: function (day) {
            if (!day || !(day instanceof Date)) {
                day = new Date();
            }
            this.calendar.currentDate = new Date(day.getTime());
            this.onDateChange();
        },
        setBeginTime: WeekView.prototype.setBeginTime,
        addSchedules: function (data, beginDateTimeField, endDateTimeField, formatAction) {
            WeekView.prototype.addSchedules.call(this,
                data, beginDateTimeField, endDateTimeField, formatAction,
                function () {
                    return 0;
                }
            );
        },
        clearSchedules: function() {
            this.removeAllSchedules();
        },
        removeAllSchedules: function () {
            var i = 0;
            for (; i < this.dayHours.length; i++) {
                this.dayHours[i].itemPanel.remove();
            }
            this.dayHours = [];
        },
        addScheduleItem: WeekView.prototype.addScheduleItem,
        setScheduleInfo: function (weekIndex, info) {
            this.dayHours.push(info);
        },
        getScheduleInfo: function (weekIndex) {
            return this.dayHours;
        },
        hasSchedule: function (weekIndex) {
            return this.dayHours.length > 0;
        },
        _resetScheduleInfo: function (val) {
            var column, left, width;
            var i = 0, panel;
            for (; i < this.dayHours.length; i++) {
                panel = this.dayHours[i].itemPanel;
                column = this.dayHours[i].weekIndex;
                left = parseFloat(panel.css("left"));
                width = parseFloat(panel.css("width"));
                panel.css({
                    "left": (left + column * val) + "px",
                    "width": (width + val) + "px"
                });
            }
        },
        getPositionAndSize: WeekView.prototype.getPositionAndSize,
        _setCurrent: function () {
            var day = this.calendar.currentDate;
            this.year = day.getFullYear();
            this.month = day.getMonth();
            this.day = day.getDate();
        },
        checkChange: function () {
            this.calendar.showTimeLine(this.hourPanel);
            var day = this.calendar.currentDate;
            if (this.year == day.getFullYear() && this.month == day.getMonth() && this.day == day.getDate()) {
                return false;
            }
            this.onDateChange();
            return true;
        },
        onDateChange: function () {
            this._setCurrent();
            this.removeAllSchedules();
            this.selector.cancelSelection();
            this._setDayText();
        },
        setSize: function (width, height) {
            this.hourPanel.css("height", height - 25 + "px");
            this._setCellSize(width, height);
        },
        getTitle: function () {
            return ui.str.stringFormat("{0}年{1}月{2}日",
                this.year, this.month + 1, this.day);
        },
        toString: function () {
            return "ui.ctrls.Calendar.DayView";
        }
    };

    var Selector = function (view, panel, table) {
        return (this instanceof Selector) ?
            this._init(view, panel, table) :
            new Selector(view, panel, table);
    };
    Selector.prototype = {
        _init: function (view, panel, table) {
            this.view = view;
            this.panel = panel;
            this.grid = table;

            this.isBeginSelect = false;
            this.cellWidth = 1;
            this.cellHeight = 25;

            this.grid[0].onselectstart = function () { return false; }

            this.selectionBox = $("<div class='selector unselectable click-enabled border-highlight' />");
            this.selectionBox.boxTextSpan = $("<span class='select-time-text click-enabled' />");
            this.selectionBox.append(this.selectionBox.boxTextSpan);
            this.panel.append(this.selectionBox);

            this.mouseLeftButtonDown = $.proxy(function (e) {
                if (e.which !== 1)
                    return;
                $(document).bind("mousemove", this.mouseMove);
                $(document).bind("mouseup", this.mouseLeftButtonUp);
                this.onMouseDown($(e.target), e.clientX, e.clientY);
            }, this);
            this.mouseMove = $.proxy(function (e) {
                if (!this.isBeginSelect) {
                    return;
                }
                this.onMouseMove(e);
            }, this);
            this.mouseLeftButtonUp = $.proxy(function (e) {
                if (e.which !== 1 || !this.isBeginSelect)
                    return;
                this.isBeginSelect = false;
                $(document).unbind("mousemove", this.mouseMove);
                $(document).unbind("mouseup", this.mouseLeftButtonUp);
                this.onMouseUp(e);
            }, this);

            var that = this;
            this.selectAnimator = ui.animator(this.selectionBox, {
                ease: ui.AnimationStyle.swing,
                onChange: function (val, elem) {
                    if (that.selectDirection === "up") {
                        return;
                    }
                    elem.css("top", val + "px");
                }
            });
            this.selectAnimator.addTarget(this.selectionBox, {
                ease: ui.AnimationStyle.swing,
                onChange: function (val, elem) {
                    elem.css("left", val + "px");
                }
            }).addTarget(this.selectionBox, {
                ease: ui.AnimationStyle.swing,
                onChange: function (val, elem) {
                    elem.css("width", val + "px");
                }
            }).addTarget(this.selectionBox, {
                ease: ui.AnimationStyle.swing,
                onChange: function (val, elem) {
                    if (that.selectDirection) {
                        return;
                    }
                    elem.css("height", val + "px");
                }
            });
            this.selectAnimator.onEnd = function () {
                if (that.animating && !that.isBeginSelect) {
                    that.onSelectCompleted();
                }
                that.animating = false;
            };
            this.selectAnimator.duration = 200;
            this.selectAnimator.fps = 60;
        },
        onMouseDown: function (el, x, y) {
            if (!this.isClickInGrid(x, y)) {
                this.clickInGrid = false;
                return;
            }
            this.clickInGrid = true;
            var td = el,
                tagName = td.prop("tagName"),
                point = this.changeToGridPoint(x, y);
            if (tagName !== "TD") {
                if (!td.hasClass("click-enabled")) {
                    return;
                }
                td = this.getCellByPoint(this.focusX, point.gridY);
            } else {
                td.locationInGrid = {
                    row: td.parent()[0].rowIndex,
                    column: td[0].cellIndex
                };
            }

            this.view.calendar.fire(selecting, this.view);

            this.startCell = td;
            this.selectCell(td);

            //确定可选区间
            this.checkSelectable(td);

            this.isBeginSelect = true;
            this.focusX = point.gridX;
            this.focusY = point.gridY;
        },
        onMouseMove: function (e) {
            var point = this.changeToGridPoint(e.clientX, e.clientY);
            var td = this.getCellByPoint(this.focusX, point.gridY),
                p = this.getPositionAndSize(td),
                p2 = this.getPositionAndSize(this.startCell);

            if (td.locationInGrid.row < this.selectableMin || td.locationInGrid.row > this.selectableMax) {
                return;
            }

            var begin = null,
                end = null;
            var box = this.selectionBox;
            if (point.gridY > this.focusY) {
                begin = this.startCell;
                end = td;
                box.css({
                    "height": (p.top + p.height - p2.top) + "px"
                });
                this.selectDirection = "down";
                this.autoScrollY(p.top + p.height, this.selectDirection);
            } else {
                begin = td;
                end = this.startCell;
                box.css({
                    "top": p.top + "px",
                    "height": p2.top + p2.height - p.top + "px"
                });
                this.selectDirection = "up";
                this.autoScrollY(p.top, this.selectDirection);
            }

            var beginTime = this.view.calendar.indexToTime(begin.locationInGrid.row),
                endTime = this.view.calendar.indexToTime(end.locationInGrid.row + 1);
            box.boxTextSpan.text(beginTime + " - " + endTime);
        },
        onMouseUp: function (e) {
            if (this.clickInGrid) {
                if (!this.animating) {
                    this.onSelectCompleted();
                }
            }
        },
        onSelectCompleted: function () {
            var box = null,
                that = this;
            if (arguments.length > 0 && arguments[0]) {
                box = arguments[0];
            } else {
                box = this.selectionBox;
            }
            //保证动画流畅
            window.setTimeout(function () {
                var data = {
                    top: parseFloat(box.css("top")),
                    left: parseFloat(box.css("left")),
                    parentWidth: that.view.viewPanel.width() - timeTitleWidth,
                    parentHeight: that.view.hourTable.outerHeight()
                };
                that.view.calendar.fire(selected, that.view, box, data);
            }, 50);
        },
        selectCell: function (td) {
            var box = this.selectionBox,
                p = this.getPositionAndSize(td),
                beginIndex = td.locationInGrid.row,
                endIndex = td.locationInGrid.row + 1;
            if (arguments.length > 1 && arguments[1]) {
                endIndex = arguments[1].locationInGrid.row + 1;
                var p2 = this.getPositionAndSize(arguments[1]);
                p.height = p2.top + p2.height - p.top
            }

            this.selectAnimator.stop();
            this.selectDirection = null;
            var option = this.selectAnimator[0];
            option.begin = parseFloat(option.target.css("top"));
            option.end = p.top;

            option = this.selectAnimator[1];
            option.begin = parseFloat(option.target.css("left"));
            option.end = p.left;

            option = this.selectAnimator[2];
            option.begin = parseFloat(option.target.css("width"));
            option.end = p.width;

            option = this.selectAnimator[3];
            option.begin = parseFloat(option.target.css("height"));
            option.end = p.height;

            box.css("display", "block");
            this.animating = true;
            this.selectAnimator.start();

            //设置选择时间
            var beginTime = this.view.calendar.indexToTime(beginIndex),
                endTime = this.view.calendar.indexToTime(endIndex);
            box.boxTextSpan.text(beginTime + " - " + endTime);
        },
        selectCellByTime: function (weekDay, beginTime, endTime) {
            var pointX = (weekDay + 1) * this.cellWidth - 1;
            var beginPointY = (this.view.calendar.timeToIndex(beginTime) + 1) * this.cellHeight - 1,
                endPointY = this.view.calendar.timeToIndex(endTime) * this.cellHeight - 1;
            var begin = this.getCellByPoint(pointX, beginPointY),
                end = this.getCellByPoint(pointX, endPointY);

            this.focusX = pointX;
            this.focusY = beginPointY;

            this.view.setBeginTime(beginTime);

            this.startCell = begin;
            this.selectCell(begin, end);
        },
        cancelSelection: function () {
            var box = this.selectionBox;
            box.css("display", "none");
            this.startCell = null;
            this.focusX = 0;
            this.focusY = 0;

            this.view.calendar.fire(deselected, this.view, box);
        },
        autoScrollY: function (value, direction) {
            var currentScrollY = this.panel.scrollTop();
            if (direction === "up") {
                if (value < currentScrollY) {
                    this.panel.scrollTop(currentScrollY < this.cellHeight ? 0 : currentScrollY - this.cellHeight);
                }
            } else if (direction === "down") {
                var bottom = currentScrollY + this.panel.height();
                if (value > bottom) {
                    this.panel.scrollTop(currentScrollY + this.cellHeight);
                }
            }
        },
        isClickInGrid: function (x, y) {
            var position = this.panel.offset();
            var left = position.left + timeTitleWidth,
                top = position.top,
                right = null,
                bottom = null;
            var width = this.grid.width(),
                height = this.panel.height();
            right = left + width - 1;
            bottom = top + height;
            if (height < this.panel[0].scrollHeight) {
                right -= ui.scrollbarWidth;
            }
            return x >= left && x <= right && y >= top && y <= bottom;
        },
        checkSelectable: function (td) {
            var count = this.view.calendar._getTimeCellCount();
            this.selectableMin = 0;
            this.selectableMax = 24 * count - 1;
        },
        changeToGridPoint: function (x, y) {
            var position = this.panel.offset();
            position.left = position.left + timeTitleWidth;
            return {
                gridX: x - position.left + this.panel.scrollLeft(),
                gridY: y - position.top + this.panel.scrollTop()
            };
        },
        getPositionAndSize: function (td) {
            var position = td.position();
            position.left = position.left + timeTitleWidth;
            return {
                top: position.top - 2,
                left: position.left - 2,
                width: td.outerWidth() - 1,
                height: td.outerHeight() - 1
            };
        },
        getCellByPoint: function (x, y) {
            var columnIndex = Math.ceil(x / this.cellWidth),
                rowIndex = Math.ceil(y / this.cellHeight),
                count = this.view.calendar._getTimeCellCount() * 24;
            if (columnIndex < 1)
                columnIndex = 1;
            if (columnIndex > 7)
                columnIndex = 7;
            if (rowIndex < 1)
                rowIndex = 1;
            if (rowIndex > count)
                rowIndex = count;

            rowIndex--;
            columnIndex--;
            var locationInGrid = {
                row: rowIndex,
                column: columnIndex
            };
            var table = this.grid[0],
                tableRow = table.rows[rowIndex],
                tableCell = null;

            tableCell = $(tableRow.cells[columnIndex]);
            tableCell.locationInGrid = locationInGrid;
            return tableCell;
        },
        getSelectedCells: function () {
            var cells = [];
            var box = this.selectionBox;
            if (box.css("display") === "none") {
                return cells;
            }
            var text = box.text().split("-");
            var beginIndex = ui.str.trim(text[0] || ""),
                endIndex = ui.str.trim(text[1] || "");
            if (!beginIndex || !endIndex) {
                return cells;
            }
            beginIndex = this.view.calendar.timeToIndex(beginIndex);
            endIndex = this.view.calendar.timeToIndex(endIndex) - 1;
            var boxBorderTopWidth = parseFloat(box.css("border-top-width")),
                top = beginIndex * this.cellHeight + 1,
                left = parseFloat(box.css("left")) + boxBorderTopWidth + 1;
            var first = this.getCellByPoint(left, top);
            cells.push(first);
            var count = endIndex - beginIndex + 1,
                table = this.grid[0],
                tableRow = null,
                tableCell = null;
            var firstCellIndex = first.locationInGrid.column,
                firstRowIndex = first.locationInGrid.row,
                locationInGrid = null;
            for (var i = 1; i < count; i++) {
                tableRow = table.rows[i + firstRowIndex];
                tableCell = $(tableRow.cells[firstCellIndex]);
                locationInGrid = {
                    row: i + firstRowIndex,
                    column: firstCellIndex
                };
                tableCell.locationInGrid = locationInGrid;
                cells.push(tableCell);
            }
            return cells;
        },
        active: function (justEvent) {
            if (!justEvent) {
                this.selectionBox.css("display", "none");
            }
            $(document).mousedown(this.mouseLeftButtonDown);
        },
        dormant: function (justEvent) {
            if (!justEvent) {
                this.cancelSelection();
            }
            $(document).unbind("mousedown", this.mouseLeftButtonDown);
        }
    };

    var formatTime = function (date, beginDate) {
        var h = date.getHours(),
            m = date.getMinutes(),
            s = date.getSeconds();
        var tempDate, value;
        if (beginDate) {
            tempDate = new Date(beginDate.getFullYear(), beginDate.getMonth(), beginDate.getDate(), 0, 0, 0);
            value = date - tempDate;
            value = value / 1000 / 60 / 60;
            if (value >= 24) {
                h = 24;
            }
        }
        return [
            h < 10 ? "0" + h : h,
            ":",
            m < 10 ? "0" + m : m,
            ":",
            s < 10 ? "0" + s : s].join("");
    };

    //theme
    var themeStyle = null;
    var initTheme = function (data) {
        if(!themeStyle) {
            themeStyle = $("#GlobalThemeChangeStyle");
            if (themeStyle.length == 0) {
                themeStyle = null;
                return;
            }
        }
        data = data || ui.theme.getCurrentThemeInfo();
        var baseColor = ui.theme.backgroundColor || "#FFFFFF",
            color,
            sheet = themeStyle.sheet();

        color = ui.theme.overlay(data.Color, baseColor, .4);
        setRule.call(sheet, ".selector", {
            "background-color": color
        });
        setRule.call(sheet, "div.schedule-item-panel", {
            "background-color": color
        });
        setRule.call(sheet, "div.schedule-item-panel:hover", {
            "background-color": data.Color
        });
        setRule.call(sheet, "div.month-day-panel table.days td.selected", {
            "background-color": color
        });
        setRule.call(sheet, "div.year-panel div.year-month-content table.year-month-table td.selected", {
            "background-color": color
        });
        color = ui.theme.overlay(data.Color, baseColor, .85);
        setRule.call(sheet, "table.weekhour td.today", {
            "background-color": color
        });
    };
    var setRule = function (selector, css) {
        var rule = this.getRule(selector);
        if (!rule) {
            this.addRule(selector, css);
        } else {
            rule.css(css);
        }
    };
    ui.themeChanged(function (e, info) {
        initTheme(info);
    });

    $.fn.setCalendar = function (option) {
        if (!this || this.length == 0) {
            return null;
        }
        if (!themeStyle) {
            initTheme();
        }
        return ctrl(option, this);
    };
})();