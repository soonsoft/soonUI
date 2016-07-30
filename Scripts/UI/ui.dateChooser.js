; (function () { 
    ///日历
    var language = {};
    //简体中文
    language["zh-CN"] = {
        dateFormat: "yyyy-mm-dd",
        year: "年份",
        month: "月份",
        weeks: ["日", "一", "二", "三", "四", "五", "六"],
        months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
        seasons: ["一季", "二季", "三季", "四季"]
    };
    //英文
    language["en-US"] = {
        dateFormat: "yyyy-mm-dd",
        year: "Year",
        month: "Month",
        weeks: ["S", "M", "T", "W", "T", "F", "S"],
        months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        seasons: ["S I", "S II", "S III", "S IV"]
    };

    var fontColor = ui.theme.highlight.font;

    var formatYear = /y+/i,
        formatMonth = /M+/,
        formatDay = /d+/i,
        formatHour = /h+/i,
        formatMinute = /m+/,
        formatSecond = /s+/i;

    ui.define("ctrls.DateChooser", ui.ctrls.DropDownPanel, {
        _getOption: function () {
            return {
                dateFormat: "yyyy-MM-dd",
                language: "zh-CN",
                calendarPanel: null,
                isDateTime: false
            };
        },
        _getEvents: function () {
            return ["selecting", "selected", "canceled"];
        },
        _create: function () {
            this._super();
            var defaultFormat = "yyyy-MM-dd";
            this.isDateTime = !!this.option.isDateTime;
            if(this.isDateTime) {
                defaultFormat = "yyyy-MM-dd hh:mm:ss";
            }
            //日期格式化
            this.option.dateFormat = this.dateFormat = this.option.dateFormat || defaultFormat;

            //日期参数
            this._now = new Date();
            this._year = this._now.getFullYear();
            this._month = this._now.getMonth();
            this._selDay = this._now.getDate();

            //文字显示
            this._language = language[this.option.language];
            if (!this._language) {
                this._language = language["zh-CN"];
            }

            //元素
            this._calendarPanel = ui.getJQueryElement(this.option.calendarPanel);;
            this._daysTable = null;
            this._linkBtn = null;
            this._setDatePanel = null;
            this._monthsTable = null;
            this._yearsTable = null;
            this._currentlyObj = null;
        },
        _init: function () {
            if(!this._calendarPanel) {
                this._calendarPanel = $("<div />");
                this._calendarPanel.click(function (e) {
                    e.stopPropagation();
                });
            }
            this._calendarPanel.addHighlight("calendar-panel", "border");
            
            this._showClass = "dateChooser-show";
            this._panel = this._calendarPanel;
            this._selectTextClass = "date-text";
            this._clearClass = "dateChooser-clear";
            this._clear = $.proxy(function () {
                this.cancelSelection();
            }, this);

            //创建日期选择面板
            this._calendarPanel.append(this._createDateSetPanel());
            //创建日历正面的标题
            this._calendarPanel.append(this._createTitlePanel());
            //创建日期显示面板
            this._calendarPanel.append(this._createDatePanel());
            //创建控制面板
            this._calendarPanel.append(this._createCtrlPanel());
        },
        _createDateSetPanel: function () {
            this._setDatePanel = $("<div class='set-date-panel' />");

            var yearTitle = $("<div class='set-title font-highlight' style='height:24px;line-height:24px;' />");
            this._setDatePanel.append(yearTitle);
            var prev = $("<div class='prev'/>");
            prev.click({ calendar: this, value: -10 }, this.events.onYearChanged);
            yearTitle.append(prev);
            yearTitle.append("<div class='date-title'><span id='yearTitle'>" + this._language.year + "</span></div>");
            var next = $("<div class='next'/>");
            next.click({ calendar: this, value: 10 }, this.events.onYearChanged);
            yearTitle.append(next);
            yearTitle.append($("<br clear='left' />"));
            this._setDatePanel.append(this._createSetYearPanel());

            var monthTitle = $("<div class='set-title font-highlight' style='text-align:center;height:27px;line-height:27px;' />");
            var html = [];
            html.push("<fieldset class='title-fieldset border-highlight'>");
            html.push("<legend class='title-legend font-highlight'>", this._language.month, "</legend>");
            html.push("</fieldset>")
            monthTitle.html(html.join(""));
            this._setDatePanel.append(monthTitle);
            this._setDatePanel.append(this._createSetMonthPanel());

            this._setDatePanel.append(this._createOkCancel());
            return this._setDatePanel;
        },
        _createSetYearPanel: function () {
            var yearPanel = $("<div class='set-year-panel' />");

            this._yearsTable = $("<table cellpadding='0' cellspacing='0'/>");
            var tbody = $("<tbody />");
            tbody.click({ calendar: this }, this.events.onYearSelected);
            var tr = null;
            var td = null;
            for (var i = 0; i < 3; i++) {
                tr = $("<tr />");
                for (var j = 0; j < 5; j++) {
                    td = $("<td />");
                    tr.append(td);
                }
                tbody.append(tr);
            }

            this._yearsTable.append(tbody);
            yearPanel.append(this._yearsTable);
            return yearPanel;
        },
        _createSetMonthPanel: function () {
            var monthPanel = $("<div class='set-month-panel' />");

            this._monthsTable = $("<table cellpadding='0' cellspacing='0'/>");
            var tbody = $("<tbody />");
            tbody.click({ calendar: this }, this.events.onMonthSelected);
            var tr = null;
            var index = 0;
            for (var i = 0; i < 3; i++) {
                tr = $("<tr />");
                var td = null;
                for (var j = 0; j < 4; j++) {
                    td = $("<td />");
                    td.html(this._language.months[index]);
                        td.data("month", index++);
                    tr.append(td);
                }
                tbody.append(tr);
            }
            this._monthsTable.append(tbody);
            monthPanel.append(this._monthsTable);
            return monthPanel;
        },
        _createOkCancel: function () {
            var okCancel = $("<div class='ctrl-panel' />");

            okCancel.append(
                this._createButton(this.events.onSetYearMonthChanged, "ok-button", { "margin-right": "10px" }));
            okCancel.append(
                this._createButton(this.events.onYearMonthCancel, "cancel-button"));
            return okCancel;
        },
        _createTitlePanel: function () {
            var datePanel = $("<div class='cal-title-panel' />");

            datePanel.append(this._createPrevButton());
            datePanel.append(this._createOptionButton());
            datePanel.append(this._createNextButton());
            datePanel.append($("<br clear='left' />"));
            return datePanel;
        },
        _createPrevButton: function () {
            var preDiv = $("<div class='prev' />");
            var $calendar = this;
            preDiv.bind("click", function (e) {
                e.stopPropagation();
                var date = new Date($calendar._year, $calendar._month - 1, 1);
                $calendar._year = date.getFullYear();
                $calendar._month = date.getMonth();
                $calendar._fillDays();
            }
            );
            return preDiv;
        },
        _createOptionButton: function () {
            var opDiv = $("<div class='date-title' />");

            this._linkBtn = $("<a href='javascript:void(0)' />");
            this._linkBtn.addHighlight("option", "font");
            this._linkBtn.html(this.formatter.formatDateTitle(this._year, this._month));
            var that = this;
            this._linkBtn.click(function (e) {
                e.stopPropagation();

                that._fillYearAndMonth(that._year, true);
                that._setDatePanel.css({
                    "top": "-199px",
                    "display": "block"
                }).stop().animate({
                    "top": "0px"
                }, 300);
            });
            opDiv.append(this._linkBtn);
            return opDiv;
        },
        _createNextButton: function () {
            var nextDiv = $("<div class='next' />");
            var $calendar = this;
            nextDiv.bind("click", function (e) {
                var date = new Date($calendar._year, $calendar._month + 1, 1);
                $calendar._year = date.getFullYear();
                $calendar._month = date.getMonth();
                $calendar._fillDays();
                e.stopPropagation();
            }
            );
            return nextDiv;
        },
        _createDatePanel: function () {
            var datePanel = $("<div class='date-panel' />");
            datePanel.append(this._createWeekPanel());
            datePanel.append(this._createDaysPanel());
            return datePanel;
        },
        _createWeekPanel: function () {
            var weekPanel = $("<div class='week-panel'/>");

            var weekTable = $("<table cellpadding='0' cellspacing='0' />");
            var tbody = $("<tbody />");
            var tr = $("<tr />");
            var th = null;
            for (var i = 0; i < 7; i++) {
                th = $("<th />");
                th.text(this._language.weeks[i]);
                if (i == 0 || i == 6) {
                    th.addClass("weekend");
                }
                tr.append(th);
            }
            tbody.append(tr);
            weekTable.append(tbody);
            weekPanel.append(weekTable);
            return weekPanel;
        },
        _createDaysPanel: function () {
            var daysPanel = $("<div class='days-panel' />");
            daysPanel.addClass("days-panel");

            this._daysTable = $("<table cellpadding='0' cellspacing='0' />");
            var tbody = $("<tbody />");
            var tr, i;
            for (i = 0; i < 6; i++) {
                tr = $("<tr />");
                for (var j = 0; j < 7; j++) {
                    tr.append($("<td />"));
                }
                tbody.append(tr);
            }
            this._daysTable.append(tbody);
            daysPanel.append(this._daysTable);
            
            daysPanel.click($.proxy(this.events.onDaySelected, this));
            return daysPanel;
        },
        _createCtrlPanel: function () {
            var ctrlPanel = $("<div />"),
                temp,
                that = this;
            ctrlPanel.addClass("ctrl-panel");
            if(!this.isDateTime) {
                ctrlPanel.append(
                    this._createButton(this.events.onTodaySelected, "today-button"));
            } else {
                temp = this._now.getHours();
                temp = temp < 10 ? "0" + temp : temp;
                this.hourText = $("<input type='text' class='hour time-input font-highlight-hover' />");
                this.hourText.val(temp);
                ctrlPanel.append(this.hourText);
                ctrlPanel.append("<span style='margin-left:2px;margin-right:2px;'>:</span>");
                temp = this._now.getMinutes();
                temp = temp < 10 ? "0" + temp : temp;
                this.minuteText = $("<input type='text' class='minute time-input font-highlight-hover' />");
                this.minuteText.val(temp);
                ctrlPanel.append(this.minuteText);
                ctrlPanel.append("<span style='margin-left:2px;margin-right:2px;'>:</span>");
                temp = this._now.getDate();
                temp = temp < 10 ? "0" + temp : temp;
                this.secondText = $("<input type='text' class='second time-input font-highlight-hover' />");
                this.secondText.val(temp);
                ctrlPanel.append(this.secondText);
                
                ctrlPanel.mousewheel(function(e) {
                    var elem = $(e.target),
                        max = 60,
                        val,
                        h, m, s;
                    if(elem.nodeName() !== "INPUT") {
                        return;
                    }
                    if(elem.hasClass("hour")) {
                        max = 24;
                    }
                    val = elem.val();
                    val = parseFloat(val);
                    val += -e.delta;
                    if (val < 0)
                        val = max - 1;
                    else if (val >= max)
                        val = 0;
                    val = val < 10 ? "0" + val : val;
                    elem.val(val);
                    
                    h = parseInt(that.hourText.val(), 10);
                    m = parseInt(that.minuteText.val(), 10);
                    s = parseInt(that.secondText.val(), 10);
                    that.selectedDate(new Date(that._year, that._month, that._selDay, h, m, s));
                });
                temp = function(e) {
                    var elem = $(e.target),
                        h, m, s;
                    if(elem.val().length == 0) {
                        return;
                    }
                    h = parseInt(that.hourText.val(), 10);
                    if(isNaN(h) || h < 0 || h >= 24) {
                        h = that._now.getHours();
                        that.hourText.val(h < 10 ? "0" + h : h);
                        return;
                    }
                    m = parseInt(that.minuteText.val(), 10);
                    if(isNaN(m) ||m < 0 || m >= 60) {
                        m = that._now.getMinutes();
                        that.minuteText.val(m < 10 ? "0" + m : m);
                        return;
                    }
                    s = parseInt(that.secondText.val(), 10);
                    if(isNaN(s) || s < 0 || s >= 60) {
                        s = that._now.getSeconds();
                        that.secondText.val(s < 10 ? "0" + s : s);
                        return;
                    }
                    that.selectedDate(new Date(that._year, that._month, that._selDay, h, m, s));
                };
                this.hourText.textinput(temp);
                this.minuteText.textinput(temp);
                this.secondText.textinput(temp);
            }
            return ctrlPanel;
        },
        _createButton: function (eventFunc, className, css) {
            var btn = $("<a class='calendar-button' />");
            if (className)
                btn.addClass(className);
            if (typeof css === "object")
                btn.css(css);
            btn.click({ calendar: this }, eventFunc);
            return btn;
        },
        ///逻辑控制
        _initYearAndMonth: function (value) {
            this._year = this.formatter.findItem(formatYear, value, this.dateFormat);
            this._month = this.formatter.findItem(formatMonth, value, this.dateFormat);
            this._selDay = this.formatter.findItem(formatDay, value, this.dateFormat);

            if (isNaN(this._year) || this._year <= 1970 || this._year > 9999) {
                this._year = this._now.getFullYear();
            }
            this._month--;
            if (isNaN(this._month) || this._month < 0 || this._month > 11) {
                this._month = this._now.getMonth();
            }
            if (isNaN(this._selDay) || this._selDay <= 0 || this._selDay > 31) {
                this._selDay = this._now.getDate();
            }
        },
        _initTime: function(value) {
            if(!this.isDateTime) {
                return;
            }
            var h, m, s;
            h = this.formatter.findItem(formatHour, value, this.dateFormat);
            m = this.formatter.findItem(formatMinute, value, this.dateFormat);
            s = this.formatter.findItem(formatSecond, value, this.dateFormat);
            if(isNaN(h) || h < 0 || h >= 24) {
                h = this._now.getHours();
            }
            if(isNaN(m) || m < 0 || m >= 60) {
                m = this._now.getMinutes();
            }
            if(isNaN(s) || s < 0 || s >= 60) {
                s = this._now.getSeconds();
            }
            h = h < 10 ? "0" + h : h;
            m = m < 10 ? "0" + m : m;
            s = s < 10 ? "0" + s : s;
            this.hourText.val(h);
            this.minuteText.val(m);
            this.secondText.val(s);
        },
        _lTrimZero: function (value) {
            return value.replace(/(^0*)/g, "");
        },
        //填充日
        _fillDays: function () {
            var days = [];
            //获得上个月最后一天的日期对象
            var preMonth = new Date(this._year, this._month, 0);
            //获得这个第一天的日期对象
            var nowMonth = new Date(this._year, this._month, 1);
            //获取下一个月的日期对象
            var nextMonth = new Date(this._year, this._month + 1, 1);

            var firstWeek = nowMonth.getDay();
            var y = preMonth.getFullYear(),
                m = preMonth.getMonth(),
                d = preMonth.getDate();
            if (firstWeek > 0) {
                for (var i = d - (firstWeek - 1) ; i <= d; i++) {
                    days.push(this.formatter.createDay(y, m, i, true));
                }
            }

            //获得当前月最后一天
            var lastDay = new Date(this._year, this._month + 1, 0).getDate();
            for (i = 1; i <= lastDay; i++) {
                days.push(this.formatter.createDay(this._year, this._month, i, false));
            }

            y = nextMonth.getFullYear();
            m = nextMonth.getMonth();
            var count = 42 - days.length;
            for (i = 1; i <= count; i++) {
                days.push(this.formatter.createDay(y, m, i, true));
            }
            $(this._linkBtn).html(this.formatter.formatDateTitle(this._year, this._month));

            var cells = this._daysTable.find("td");
            var nowYear = this._now.getFullYear(),
                nowMonth = this._now.getMonth(),
                nowDay = this._now.getDate();
            var td;
            for (i = 0; i < cells.length; i++) {
                td = $(cells[i]);
                td.removeAttr("class");
                d = days.shift();
                td.html("<span>" + d.date + "</span>").data("date", d);

                if (this._month === d.month && d.date === this._selDay) {
                    this.selectedDay = td;
                    this.selectedDay.addHighlight("selected", "background");
                }
                //高亮显示今日
                if (d.year === nowYear && d.month === nowMonth && d.date === nowDay) {
                    td.addClass(fontColor);
                }

                if (d.isOtherMonth) {
                    td.addClass("other-month");
                }
            }
        },
        _fillYearAndMonth: function (year, isInitial) {
            var startYear = Math.floor(year / 15) * 15,
                selectedClass = "selected";
            this._yearsTable.data("year", year);
            var cells = this._yearsTable.find("td"),
                td = null;
            $("#yearTitle").text(startYear + "年 ~ " + (startYear + cells.length - 1) + "年");
            for (var i = 0; i < cells.length; i++) {
                var now = startYear++;
                td = $(cells[i]);
                td.removeHighlight(selectedClass, "background");
                td.html(now);
                if (now == year) {
                    td.addHighlight(selectedClass, "background");
                    this.currentYear = td;
                }
            }

            var trs, tr, tds;
            if(isInitial) {
                trs = this._monthsTable.find("tr");
                this._monthsTable.data("month", this._month);
                for (i = 0; i < trs.length; i++) {
                    tr = $(trs[i]);
                    tds = tr.find("td");
                    for (var j = 0; j < tds.length; j++) {
                        td = $(tds[j]);
                        td.removeHighlight(selectedClass, "background");
                        td.removeAttr("style");
                        if (td.data("month") == this._month) {
                            td.addHighlight(selectedClass, "background");
                            this.currentMonth = td;
                        }
                    }
                }
            }
        },
        _formatDateValue: function (date) {
            var dateValue = this.dateFormat;
            dateValue = dateValue.replace(formatYear, date.getFullYear());
            dateValue = this.formatter.formatItem(formatMonth, date.getMonth() + 1, dateValue);
            dateValue = this.formatter.formatItem(formatDay, date.getDate(), dateValue);
            if(this.isDateTime) {
                dateValue = this.formatter.formatItem(formatHour, date.getHours(), dateValue);
                dateValue = this.formatter.formatItem(formatMinute, date.getMinutes(), dateValue);
                dateValue = this.formatter.formatItem(formatSecond, date.getSeconds(), dateValue);
            }
            return dateValue;
        },
        ///Events
        events: {
            onDaySelected: function (e) {
                var el = $(e.target),
                    nodeName = el.nodeName();
                if(nodeName === "SPAN") {
                    el = el.parent();
                }
                if(el.nodeName() !== "TD") {
                    return;
                }
                var d = el.data("date"),
                    h = 0,
                    m = 0,
                    s = 0;
                if(this.isDateTime) {
                    h = parseInt(this.hourText.val(), 10);
                    m = parseInt(this.minuteText.val(), 10);
                    s = parseInt(this.secondText.val(), 10);
                }
                var date = new Date(d.year, d.month, d.date, h, m, s);
                if(this.selectedDay) {
                    this.selectedDay.removeHighlight("selected", "background");
                    this.selectedDay = null;
                }
                this.selectedDay = el;
                this.selectedDay.addHighlight("selected", "background");
                this.selectedDate(date);
            },
            onTodaySelected: function (e) {
                var now = new Date(),
                    that = e.data.calendar;
                that.selectedDate(now);
                that._fillDays();
            },
            onYearChanged: function (e) {
                e.data.calendar._fillYearAndMonth(
                    e.data.calendar._yearsTable.data("year") + e.data.value);
            },
            onYearSelected: function (e) {
                var selectCell = $(e.target),
                    selectedClass = "selected";
                if (selectCell.nodeName() !== "TD") {
                    return;
                }
                if (e.data.calendar.currentYear) {
                    e.data.calendar.currentYear.removeHighlight(selectedClass, "background");
                }
                selectCell.addHighlight(selectedClass, "background");
                e.data.calendar.currentYear = selectCell;

                e.data.calendar._yearsTable.data("year", parseInt(selectCell.text(), 10));
                e.stopPropagation();
            },
            onMonthSelected: function (e) {
                e.stopPropagation();
                var selectCell = $(e.target),
                    that = e.data.calendar,
                    selectedClass = "selected";
                if (selectCell.nodeName() !== "TD" || selectCell.hasClass("season-cell")) {
                    return;
                }
                if (that.currentMonth) {
                    that.currentMonth.removeHighlight(selectedClass, "background");
                }
                selectCell.addHighlight(selectedClass, "background");
                that.currentMonth = selectCell;

                that._monthsTable.data("month", selectCell.data("month"));
            },
            onSetYearMonthChanged: function (e) {
                e.stopPropagation();
                var that = e.data.calendar;
                that._year = parseInt(that._yearsTable.data("year"));
                that._month = parseInt(that._monthsTable.data("month"));
                that._fillDays();

                that._setDatePanel.stop().animate({
                    "top": "-199px"
                }, 300, function () {
                    that._setDatePanel.css("display", "none");
                });
            },
            onYearMonthCancel: function (e) {
                e.stopPropagation();
                var that = e.data.calendar;
                that._setDatePanel.stop().animate({
                    "top": "-199px"
                }, 300, function () {
                    that._setDatePanel.css("display", "none");
                });
            }
        },
        ///各种样式格式化
        formatter: {
            formatDateTitle: function (year, month) {
                var mon = month + 1;
                if (mon < 10) {
                    mon = "0" + mon;
                }
                return year + "-" + mon + "&nbsp;▼";
            },
            createDay: function (year, month, date, isOtherMonth) {
                return {
                    year: year,
                    month: month,
                    date: date,
                    isOtherMonth: isOtherMonth
                };
            },
            formatItem: function(r, value, format) {
                var result = r.exec(format);
                if(result != null) {
                    value = result[0].length > 1 && value < 10 ? "0" + value : value;
                }
                return format.replace(r, value);
            },
            findItem: function(r, value, format) {
                var result = r.exec(format);
                if(result != null) {
                    return parseInt(value.substring(result.index, result.index + result[0].length), 10);
                } else {
                    return NaN;
                }
            }
        },
        ///API
        selectedDate: function (date) {
            this._year = date.getFullYear();
            this._month = date.getMonth();
            this._selDay = date.getDate();
            var value = this._formatDateValue(date);
            
            var result = this.fire("selecting", this.element, value, date);
            if (result === false) {
                return;
            }
            
            this.fire("selected", this.element, value, date);
        },
        cancelSelection: function() {
            if(this.selectedDay) {
                this.selectedDay.removeHighlight("selected", "background");
            }
            this.fire("canceled");
        },
        show: function() {
            var that = this,
                superShow = this._super;
            if(!this.isShow()) {
                this.moveToElement(this.element, true);
                superShow.call(this);
            } else {
                this.hide(function() {
                    that.moveToElement(that.element, true);
                    superShow.call(that);
                });
            }
        }
    });

    var dc = null,
        dtc = null;
    var getText = function (elem) {
        return elem.text();
    };
    var getValue = function (elem) {
        return elem.val();
    };
    var createDateChooser = function(option, element) {
        var obj = ui.ctrls.DateChooser(option, element);
        obj.selecting(function(e, elem, value, date) {
            if($.isFunction(obj.selectingHandler)) {
                return obj.selectingHandler(elem, value, date);
            }
        });
        obj.selected(function(e, elem, value, date) {
            if($.isFunction(obj.selectedHandler)) {
                obj.selectedHandler(elem, value, date);
            } else {
                if (this.element.nodeName() === "INPUT") {
                    this.element.val(value);
                } else {
                    this.element.html(value);
                }
            }
        });
        obj.canceled(function(e) {
            if($.isFunction(obj.clearHandler)) {
                obj.clearHandler();
            } else {
                if(this.element.nodeName() === "INPUT") {
                    this.element.val("");
                } else {
                    this.element.html("");
                }
            }
        });
        return obj;
    };
    var onMousemoveHandler = function(e) {
        if(!this.isShow()) {
            this.element.css("cursor", "auto");
            this._clearable = false;
            return;
        }
        var eWidth = this.element.width(),
            offsetX = e.offsetX;
        if(!offsetX) {
            offsetX = e.clientX - this.element.offset().left;
        }
        if (eWidth - offsetX < 0) {
            this.element.css("cursor", "pointer");
            this._clearable = true;
        } else {
            this.element.css("cursor", "auto");
            this._clearable = false;
        }
    };
    var onMouseupHandler = function(e) {
        if(!this._clearable) {
            return;
        }
        var eWidth = this.element.width(),
            offsetX = e.offsetX;
        if(!offsetX) {
            offsetX = e.clientX - this.element.offset().left;
        }
        if (eWidth - offsetX < 0) {
            if ($.isFunction(this._clear)) {
                this._clear();
            }
        }
    };

    $.fn.dateChooser = function (option) {
        if (!this || this.length == 0) {
            return null;
        }
        if(this.hasClass("date-text")) {
            this.css("width", parseFloat(this.css("width"), 10) - 23 + "px");
        }
        var nodeName = this.nodeName();
        if(nodeName !== "INPUT" && nodeName !== "A" && nodeName !== "SELECT") {
            this.attr("tabindex", 0);
        }
        
        var valueFunc,
            currChooser;
        if (this.nodeName() === "INPUT") {
            valueFunc = getValue;
        } else {
            valueFunc = getText;
        }

        if(option && option.isDateTime) {
            if(!dtc) {
                dtc = createDateChooser({
                    isDateTime: true
                }, this);
            }
            currChooser = dtc;
        } else {
            if(!dc) {
                dc = createDateChooser(null, this);
            }
            currChooser = dc;
        }
        option = $.extend({}, currChooser.option, option);
        this.focus(function (e) {
            var target = $(e.target);
            if(currChooser.isShow() && currChooser.element && currChooser.element[0] === target[0]) {
                return;
            }
            
            if(currChooser.element) {
                currChooser.element.removeClass(currChooser._clearClass);
            }
            currChooser._now = new Date();
            currChooser.option = option;
            currChooser.setLayoutPanel(option.layoutPanel);
            currChooser.dateFormat = option.dateFormat;
            //修正事件引用
            currChooser.selectingHandler = option.selectingHandler;
            currChooser.selectedHandler = option.selectedHandler;
            currChooser.clearHandler = option.clearHandler;

            ui.hideAll(currChooser);
            //修正设置参数
            currChooser.element = target;
            if(currChooser.element.nodeName() === "INPUT") {
                currChooser.onMousemoveHandler = $.proxy(onMousemoveHandler, currChooser);
                currChooser.onMouseupHandler = $.proxy(onMouseupHandler, currChooser);
            } else {
                currChooser.onMousemoveHandler = ui.core.noop;
                currChooser.onMouseupHandler = ui.core.noop;
            }
            
            var val = valueFunc(currChooser.element);
            if(!val) {
                val = ui.str.empty;
            }
            currChooser._initYearAndMonth(val);
            if(currChooser.isDateTime) {
                currChooser._initTime(val);
            }
            currChooser._fillDays();
            currChooser.show();
        }).click(function (e) {
            e.stopPropagation();
        });
        return currChooser;
    };

    $.fn.putDateChooser = function(option) {
        if (!this || this.length == 0) {
            return null;
        }
        var nodeName = this.nodeName();
        if(nodeName  === "INPUT" || nodeName === "SPAN") {
            return null;
        }
        if(!option) {
            option = {};
        }
        option.calendarPanel = this;
        var chooser = ui.ctrls.DateChooser(option, null);
        chooser._calendarPanel.css("display", "block");
        chooser._fillDays();
        return chooser;
    };
})();