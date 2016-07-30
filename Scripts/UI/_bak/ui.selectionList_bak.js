; (function ($) {

    var borderColor = ui.theme.Classes.BorderHighlight,
        bgColor = ui.theme.Classes.BackgroundHighlight,
        fontColor = ui.theme.Classes.FontHighlight;

    var showClass = "sl-show",
        listUL = "sl-ul",
        listPanelClass = "list-panel",
        selectionClass = "selection-item";
    
    //event type
    var selecting = "selecting",
        selected = "selected",
        canceled = "canceled";
    
    var getValue = function(field) {
    	return this[field];
    };
    var getArrayValue = function(field) {
    	var result = [],
    		i = 0;
    	for(; i < field.length; i++) {
    		result.push(this[field[i]]);
    	}
    	return result.join("_");
    };

    var ctrl = ui.define("ctrls.SelectionTree", {
        _getCreateOption: function () {
            return {
                multiple: false,
                valueField: null,
                textField: null,
                data: null,
                width: 100,
                fillItemHandler: null
            };
        },
        _getEvents: function () {
            return [selecting, selected, canceled];
        },
        _create: function () {
            this.target = this.element;
            this.current = null;
            this.selectList = [];
            
            if($.isArray(this.option.valueField)) {
            	this._getValue = getArrayValue;
            } else if($.isFunction(this.option.valueField)) {
            	this._getValue = this.option.valueField;
            } else {
                this._getValue = getValue;
            }
            if($.isArray(this.option.textField)) {
            	this._getText = getArrayValue;
            } else if($.isFunction(this.option.textField)) {
                this._getText = this.option.textField;
            } else {
            	this._getText = getValue;
            }
        },
        _init: function () {
            this.listPanel = $("<div class=\"list-panel\" />").addClass(borderColor);
            this.listPanel.click($.proxy(this.onListSelection, this));
            $(document.body).append(this.listPanel);
            if ($.isNumeric(this.option.width)) {
                this.listPanel.css("width", this.option.width + "px");
            }
            if ($.isFunction(this.option.fillItemHandler)) {
                this.getText = this.option.fillItemHandler;
            }
            if ($.isArray(this.option.data)) {
                this._fill(this.option.data);
            }

            var that = this;
            this.element.focus(function (e) {
                ui.hideAll(that);

                that.show();
            }).click(function (e) {
                e.stopPropagation();
            });
        },
        _fill: function (data) {
            this.empty();
            var ul = $("<ul />").addClass(listUL);
            var li, i;
            if (data && data.length) {
                for (i = 0; i < data.length; i++) {
                    li = $("<li />");
                    if (this.option.multiple) {
                        li.append($("<input type='checkbox' />"));
                    }
                    li.append(this.getText(data[i], i));
                    li.data("index", i);
                    ul.append(li);
                }
            }
            this.listPanel.append(ul);
        },
        getText: function (item, index) {
            var text = "";
            if (typeof item === "string") {
                text = item;
            } else if (item) {
                text = this._getText.call(item, this.option.textField);
            }
            var content = $("<span />").text(text);
            return content;
        },
        setData: function (data) {
            if ($.isArray(data)) {
                this.option.data = data;
            } else if (typeof data === "string") {
                this.option.data = [data];
            } else {
                return;
            }
            this._fill(this.option.data);
        },
        getCurrentSelection: function () {
            var data = null;
            if (this.current) {
                data = this.option.data[this.current.data("index")];
            }
            return data;
        },
        setCurrentSelection: function (value) {
            this.cancelSelection();
            if (!value)
                return;
            var valueData = [value];
            this._setListValues(valueData);
        },
        getMultipleSelection: function () {
            var dataList = [];
            for (var i = 0; i < this.selectList.length; i++) {
                dataList[i] = this.selectList[i].data;
            }
            return dataList;
        },
        //设置多值时selected事件只会在最后被触发一次
        setMultipleSelection: function (values) {
            this.cancelSelection();
            if (!$.isArray(values))
                return;
            this._setListValues(values);
        },
        cancelSelection: function () {
            var elem = null;
            if (this.option.multiple === true) {
                for (var i = 0; i < this.selectList.length; i++) {
                    elem = this.selectList[i].elem;
                    elem.find("input[type='checkbox']").prop("checked", false);
                }
                this.selectList = [];
            } else {
                if (this.current) {
                    this.current.removeClass(selectionClass).removeClass(bgColor);
                    this.current = null;
                }
            }
            this.fire(canceled);
        },
        empty: function () {
            this.listPanel.html("");
            this.selectList = [];
            this.current = null;
            this.fire(canceled);
        },
        isShow: function() {
            return this.listPanel.hasClass(showClass);
        },
        show: function () {
            ui.addHideHandler(this, this.hide);
            if (!this.isShow()) {
                this.listPanel.addClass(showClass);
                var p = this.element.offset(),
                    h = this.listPanel.outerHeight(),
                    w = this.listPanel.outerWidth(),
                    docel = document.documentElement;
                var top = p.top + this.element.outerHeight(),
                    left = p.left;
                if ((top + h) > docel.clientHeight + docel.scrollTop)
                    top -= (top + h) - (docel.clientHeight + docel.scrollTop);
                if ((left + w) > docel.clientWidth + docel.scrollLeft)
                    left = left - (w - this.element.outerWidth());
                this.listPanel.css({
                    "top": top + "px",
                    "left": left + "px"
                }).fadeIn(200);
            }
        },
        hide: function () {
            if (this.isShow()) {
                this.listPanel.removeClass(showClass)
                this.listPanel.fadeOut(200);
            }
        },
        _setListValues: function (values) {
            var values = values.slice(0);
            var count = values.length;
            var item = null;
            var i, j, len;
            for (i = 0, len = this.option.data.length; i < len; i++) {
                item = this.option.data[i];
                for (j = 0; j < count; j++) {
                    if (this._equalValue(item, values[j])) {
                        this._setListValue(item, i, count);
                        count--;
                        values.splice(j, 1);
                        break;
                    }
                }
                if (count == 0)
                    break;
            }
        },
        _equalValue: function(item, value) {
            if(typeof item === "string") {
                return item === value + "";
            } else if (ui.core.type(item) === "object" && ui.core.type(value) !== "object") {
                return this._getValue.call(item, this.option.valueField) === value;
            } else {
                return this._getValue.call(item, this.option.valueField) === this._getValue.call(value, this.option.valueField)
            }
        },
        _setListValue: function (data, i, valuesCount) {
            var liList = this.listPanel.find("ul").children();
            var li = $(liList[i]);

            this._selectItem(li, data, false, true, !(valuesCount > 1));
        },
        ///events
        onListSelection: function (e) {
            if (this.option.multiple) {
                e.stopPropagation();
            }

            var elem = $(e.target);
            var nodeName = elem.nodeName();
            var isCheckbox = nodeName === "INPUT";
            while (nodeName !== "LI") {
                if (elem.hasClass(listPanelClass))
                    return;
                elem = elem.parent();
                nodeName = elem.nodeName();
            }
            var data = this.option.data[elem.data("index")];
            this._selectItem(elem, data, isCheckbox);
        },
        _selectItem: function (elem, data, isCheckbox, checkedValue, fireSelected) {
            var result = this.fire(selecting, elem, data);
            if (result === false) return;

            var cbx = null;
            var checked = null;

            if (this.option.multiple === true) {
                cbx = elem.find("input[type='checkbox']");
                if (!checkedValue) {
                    if (isCheckbox) {
                        checked = cbx.prop("checked");
                    } else {
                        checked = !cbx.prop("checked");
                    }
                } else {
                    checked = checkedValue;
                }
                cbx.prop("checked", checked);

                if (!checked) {
                    for (var i = 0; i < this.selectList.length; i++) {
                        if (this.selectList[i].elem[0] == elem[0]) {
                            this.selectList.splice(i, 1);
                            break;
                        }
                    }
                } else {
                    this.selectList.push({ elem: elem, data: data });
                }
            } else {
                if (this.current) {
                    if (this.current[0] == elem[0]) {
                        return;
                    }
                    this.current.removeClass(selectionClass).removeClass(bgColor);
                }
                this.current = elem;
                elem.addClass(selectionClass).addClass(bgColor);
            }

            if (fireSelected === false) {
                return;
            }
            this.fire(selected, elem, data);
        }
    });

    $.fn.setSelectList = function (option) {
        if (!this || this.length == 0) {
            return null;
        }
        return ctrl(option, this);
    };
})(jQuery);