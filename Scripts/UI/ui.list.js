; (function () {

    var listPanelClass = "ui-list-panel",
        listUL = "sl-ul",
        selectionClass = "selection-item";
    
    //event type
    var selecting = "selecting",
        selected = "selected",
        deselected = "deselected",
        canceled = "canceled",
        removing = "removing",
        removed = "removed";

    var ctrl = ui.define("ctrls.List", {
        _getOption: function () {
            return {
                multiple: false,
                valueField: null,
                textField: null,
                data: null,
                displayCount: 10,
                formatText: false,
                showRemoveButton: true
            };
        },
        _getEvents: function () {
            return [selecting, selected, deselected, canceled, removing, removed];
        },
        _create: function () {
            this.listPanel = this.element;
            this.dataList = [];
            this.current = null;
            this.selectList = [];

            if (!$.isFunction(this.option.formatText)) {
                this.option.formatText = this.getText;
            }
            
            this.showRemoveButton = !!this.option.showRemoveButton;
        },
        _init: function () {
            this.listPanel.addClass(listPanelClass);
            this.listPanel.click($.proxy(this.onListSelection, this));
            var css = {};
            if ($.isNumeric(this.option.width)) {
                css.width = this.option.width + "px";
            }
            if ($.isNumeric(this.option.height)) {
                css.height = this.option.height + "px";
            }
            this.listPanel.css(css);
            this.list = $("<ul />").addClass(listUL);
            if (Array.isArray(this.option.data)) {
                this._fill(this.option.data);
            }
            this.listPanel.append(this.list);
        },
        _fill: function (data) {
            this.list.empty();
            var i;
            if (data && data.length > 0) {
                for (i = 0; i < data.length; i++) {
                    this.add(data[i]);
                }
            }
        },
        _createItem: function (item, index) {
            var li = $("<li />");
            li.append(
                this.option.formatText.apply(this, [item, index]));
            if(this.showRemoveButton) {
                li.append("<a href='javascript:void(0)' class='close-button'>×</a>");
            }
            li[0].listIndex = index;
            return li;
        },
        _getIndex: function (item) {
            var index = -1;
            for (var i = 0, len = this.dataList.length; i < len; i++) {
                if (item == this.dataList[i]) {
                    index = i;
                    break;
                }
            }
            return index;
        },
        setData: function(data) {
            if(Array.isArray(data)) {
                this._fill(data);
            }
        },
        add: function (item) {
            var li = this._createItem(item, this.dataList.length);
            this.list.append(li);
            this.dataList.push(item);
        },
        remove: function (item) {
            var index = this._getIndex(item);
            if (index >= 0) {
                this.removeAt(index);
            }
        },
        removeAt: function (index) {
            var li, children, i;
            if (index >= 0 && index < this.dataList.length) {
                children = this.list.children();
                li = $(children[index]);
                if (this.current && this.current[0] == li[0]) {
                    this.current = null;
                }
                li.remove();
                this.dataList.splice(index, 1);
                children = this.list.children();
                for (i = index; i < children.length; i++) {
                    children[i].listIndex--;
                }
            }
        },
        insert: function (item, index) {
            if (index < 0) {
                index = 0;
            }
            if (index >= this.dataList.length) {
                this.add(item);
                return;
            }
            var li = this._createItem(item, index);
            var items = this.list.children();
            var elem = $(items[index]);
            li.insertBefore(elem);
            elem[0].listIndex++;
            for (var i = index + 1; i < items.length; i++) {
                elem = $(items[i]);
                elem[0].listIndex++;
            }
            this.dataList.splice(index, 0, item);
        },
        clear: function () {
            this.list.html("");
            this.dataList = [];
            this.current = null;
            this.selectList = [];
        },
        moveUp: function (item) {
            var index;
            if ($.isNumeric(item)) {
                index = item;
            } else {
                index = this._getIndex(item);
            }
            if (index == -1 || index == 0)
                return;
            var items = this.list.children();
            var li = $(items[index]);
            var beforeLi = $(items[index - 1]);
            beforeLi.before(li);
            li[0].listIndex--;
            beforeLi[0].listIndex++;

            var temp = this.dataList[index];
            this.dataList[index] = this.dataList[index - 1];
            this.dataList[index - 1] = temp;
        },
        moveDown: function (item) {
            var index;
            if ($.isNumeric(item)) {
                index = item;
            } else {
                index = this._getIndex(item);
            }
            if (index == -1 || index >= (this.dataList.length - 1))
                return;
            var items = this.list.children();
            var li = $(items[index]);
            var afterLi = $(items[index + 1]);
            afterLi.after(li);
            li[0].listIndex++;
            afterLi[0].listIndex--;

            var temp = this.dataList[index];
            this.dataList[index] = this.dataList[index + 1];
            this.dataList[index + 1] = temp;
        },
        moveTo: function (item, index) {
            var itemIdx;
            if ($.isNumeric(item)) {
                itemIdx = item;
            } else {
                itemIdx = this._getIndex(item);
            }
            if (itemIdx == -1 || itemIdx == index) {
                return;
            }
            if (index < 0 || index > this.dataList.length - 1) {
                throw new Error("argument index out of range");
            }

            var children = this.list.children();
            var currentLi = $(children[itemIdx]);
            var toLi = $(children[index]);
            var i;
            if (itemIdx < index) {
                toLi.after(currentLi);
                currentLi[0].listIndex = index;
                children = this.list.children();
                for (i = index - 1; i >= itemIdx; i--) {
                    children[i].listIndex--;
                }
            } else {
                toLi.before(currentLi);
                currentLi[0].listIndex = index;
                children = this.list.children();
                for (i = index + 1; i <= itemIdx; i++) {
                    children[i].listIndex++;
                }
            }
            item = this.dataList[itemIdx];
            this.dataList.splice(itemIdx, 1);
            this.dataList.splice(index, 0, item);
        },
        get: function (index) {
            if (index >= 0 && index < this.dataList.length) {
                return this.dataList[index];
            }
            return null;
        },
        getAll: function () {
            var data = [];
            for (var i = 0, len = this.dataList.length; i < len; i++) {
                data[i] = this.dataList[i];
            }
            return data;
        },
        count: function () {
            return this.dataList.length;
        },
        sort: function (func) {
            var textField = this.option.textField;
            if (!$.isFunction(func)) {
                func = function (a, b) {
                    if (a[textField] < b[textField])
                        return -1;
                    else if (a[textField] > b[textField])
                        return 1;
                    else
                        return 0;
                };
            }
            var data = this.dataList;
            data.sort(func);
            this.clear();
            for (var i = 0, len = data.length; i < len; i++) {
                this.add(data[i]);
            }
        },
        reverse: function () {
            var data = this.dataList;
            data.reverse();
            this.clear();
            for (var i = 0, len = data.length; i < len; i++) {
                this.add(data[i]);
            }
        },
        getText: function (item, index) {
            var text = "";
            if (typeof item === "string") {
                text = item;
            } else {
                text = item[this.option.textField] + "";
            }
            var content = $("<span />").text(text);
            return content;
        },
        getSelection: function () {
            var data = null,
                item = null;
            if (this.option.multiple === true) {
                data = [];
                for (var i = 0; i < this.selectList.length; i++) {
                    item = {
                        index: this.selectList[i][0].listIndex
                    };
                    item.itemData = this.dataList[item.index];
                    data[i] = item;
                }
            } else {
                if (this.current) {
                    data = {
                        index: this.current[0].listIndex
                    };
                    data.itemData = this.dataList[data.index];
                }
            }
            return data;
        },
        setSelection: function (index) {
            this.cancelSelection();
            var isArray = Array.isArray(index);
            var values;
            if (this.option.multiple === true) {
                if (!isArray) {
                    values = [index];
                } else {
                    values = index;
                }
            } else {
                if (isArray) {
                    values = [index[0]];
                } else {
                    values = [index];
                }
            }
            this._setListValues(values);
        },
        cancelSelection: function () {
            var elem, i;
            if (this.option.multiple === true) {
                for (i = 0; i < this.selectList.length; i++) {
                    elem = this.selectList[i];
                    elem.removeHighlight(selectionClass, "background");
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
        _setListValues: function (values) {
            var children = this.list.children();
            var item = null, li = null;
            var i, j, len;
            values = values.slice(0);
            for (i = 0, len = values.length; i < len; i++) {
                item = this.dataList[values[i]];
                if (item) {
                    li = $(children[values[i]]);
                    this._selectItem(li, item, li[0].listIndex, true, !(i < len - 1));
                }
            }
        },
        ///events
        onListSelection: function (e) {
            var elem = contextElem = $(e.target);
            var nodeName = elem.nodeName();
            while (nodeName !== "LI") {
                if (elem.hasClass(listPanelClass))
                    return;
                elem = elem.parent();
                nodeName = elem.nodeName();
            }
            var index = elem[0].listIndex;
            var data = this.dataList[index];
            
            if(this.showRemoveButton && contextElem.hasClass("close-button")) {
                this._removeItem(elem, data, index);
            } else {
                this._selectItem(elem, data, index);
            }
        },
        _removeItem: function(elem, data, index) {
            var eventArgs = {
                itemData: data,
                index: index
            };
            var result = this.fire(removing, elem, eventArgs);
            if(result === false) {
                return;
            }
            this.removeAt(index);
            this.fire(removed, elem, eventArgs);
        },
        _selectItem: function (elem, data, index, checked, fireEvent) {
            var eventArgs = {
                itemData: data,
                index: index
            }, i;
            var result = this.fire(selecting, elem, eventArgs);
            if (result === false) return;

            if (arguments.length == 3) {
                checked = !elem.hasClass(selectionClass);
            } else {
                checked = !!checked;
            }

            if (this.option.multiple === true) {
                if (checked) {
                    this.selectList.push(elem);
                    elem.addHighlight(selectionClass, "background");
                } else {
                    for (i = 0; i < this.selectList.length; i++) {
                        if (this.selectList[i][0] == elem[0]) {
                            this.selectList.splice(i, 1);
                            break;
                        }
                    }
                    elem.removeHighlight(selectionClass, "background");
                }
            } else {
                if (checked) {
                    if (this.current) {
                        this.current.removeHighlight(selectionClass, "background");
                    }
                    this.current = elem;
                    elem.addHighlight(selectionClass, "background");
                } else {
                    elem.removeHighlight(selectionClass, "background");
                    this.current = null;
                }
            }

            if (fireEvent === false) {
                return;
            }
            if (checked) {
                this.fire(selected, elem, eventArgs);
            } else {
                this.fire(deselected, elem, eventArgs);
            }
        },
        setHeight: function (height) {
            if ($.isNumeric(height) && height > 0) {
                this.option.height = height;
                this.listPanel.css("height", height + "px");
            }
        }
    });

    $.fn.setList = function (option) {
        if (!this || this.length == 0) {
            return null;
        }
        return ctrl(option, this);
    };
})();
