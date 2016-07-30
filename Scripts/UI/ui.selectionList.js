; (function () {
    var listUL = "sl-ul",
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

    var ctrl = ui.define("ctrls.SelectionList", ui.ctrls.DropDownPanel, {
        _getOption: function () {
            return {
                multiple: false,
                valueField: null,
                textField: null,
                data: null,
                fillItemHandler: null
            };
        },
        _getEvents: function () {
            return [selecting, selected, canceled];
        },
        _create: function () {
            this._super();
            
            this.target = this.element;
            this.current = null;
            this.selectList = [];
            
            if(Array.isArray(this.option.valueField)) {
            	this._getValue = getArrayValue;
            } else if($.isFunction(this.option.valueField)) {
            	this._getValue = this.option.valueField;
            } else {
                this._getValue = getValue;
            }
            if(Array.isArray(this.option.textField)) {
            	this._getText = getArrayValue;
            } else if($.isFunction(this.option.textField)) {
                this._getText = this.option.textField;
            } else {
            	this._getText = getValue;
            }
        },
        _init: function () {
            this.listPanel = $("<div class='list-panel border-highlight' />");
            this.listPanel.click($.proxy(this.onListSelection, this));
            this.wrapElement(this.element, this.listPanel);
            
            this._showClass = "sl-show";
            this._clearClass = "sl-clear";
            this._clear = function () {
                this.cancelSelection();
            };
            this._selectTextClass = "select-text";
            
            this.initPanelWidth(this.option.width);
            if ($.isFunction(this.option.fillItemHandler)) {
                this.getText = this.option.fillItemHandler;
            }
            if (Array.isArray(this.option.data)) {
                this._fill(this.option.data);
            }
            this._super();
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
            if (Array.isArray(data)) {
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
            var valueData = [value],
                outArgument = { li: null };
            this._setListValues(valueData, outArgument);
            if(outArgument.li) {
                this.fire(selected, 
                    outArgument.li, this._wrapListData(this.option.data[outArgument.li.data("index")]));
            }
        },
        getMultipleSelection: function () {
            var dataList = [];
            for (var i = 0; i < this.selectList.length; i++) {
                dataList[i] = this.selectList[i].data;
            }
            return dataList;
        },
        //设置多值时selected事件只会在最后被触发一次，如果有所的值都不匹配则不会触发selected事件
        setMultipleSelection: function (values) {
            this.cancelSelection();
            if (!Array.isArray(values))
                return;
            var outArgument = { li: null };
            this._setListValues(values, outArgument);
            if(outArgument.li) {
                this.fire(selected, 
                    outArgument.li, this._wrapListData(this.option.data[outArgument.li.data("index")]));
            }
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
                    this.current.removeHighlight(selectionClass, "background");
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
        _setListValues: function (values, outArgument) {
            var count = values.length;
            var item = null;
            var i, j, len;
            values = values.slice(0);
            for (i = 0, len = this.option.data.length; i < len; i++) {
                item = this.option.data[i];
                for (j = 0; j < count; j++) {
                    if (this._equalValue(item, values[j])) {
                        outArgument.li = this._setListValue(item, i);
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
        _setListValue: function (data, i) {
            var liList = this.listPanel.find("ul").children();
            var li = $(liList[i]);

            this._selectItem(li, data, false, true, false);
            return li;
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
        _wrapListData: function(data) {
            return {
                data: data
            }
        },
        _selectItem: function (elem, data, isCheckbox, checkedValue, fireSelectedEvent) {
            var listData = this._wrapListData(data);
            var result = this.fire(selecting, elem, listData);
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
                listData.isSelected = checked;

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
                    this.current.removeHighlight(selectionClass, "background");
                }
                this.current = elem;
                listData.isSelected = true;
                elem.addHighlight(selectionClass, "background");
            }

            if (fireSelectedEvent === false) {
                return;
            }
            this.fire(selected, elem, listData);
        }
    });

    $.fn.setSelectList = function (option) {
        if (!this || this.length == 0) {
            return null;
        }
        return ctrl(option, this);
    };
})();

///ListView
(function(){
    var ctrl = ui.define("ctrls.ListView", ui.ctrls.SelectionList, {
        _init: function () {
            this.listPanel = this.element;
            var positionValue = this.listPanel.css("position");
            this.listPanel
                .addClass("list-panel")
                .addClass("list-view-panel")
                .css({
                    "position": positionValue
                });
                
            this.listPanel.click($.proxy(this.onListSelection, this));
            if ($.isFunction(this.option.fillItemHandler)) {
                this.getText = this.option.fillItemHandler;
            }
            if (Array.isArray(this.option.data)) {
                this._fill(this.option.data);
            }
        }
    });

    $.fn.setListView = function (option) {
        if (!this || this.length == 0) {
            return null;
        }
        return ctrl(option, this);
    };
})();