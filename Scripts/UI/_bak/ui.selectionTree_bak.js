; (function ($) {

    var borderColor = ui.theme.Classes.BorderHighlight;
    var bgColor = ui.theme.Classes.BackgroundHighlight;
    var fontColor = ui.theme.Classes.FontHighlight;

    var showClass = "sl-show",
        listPanelClass = "tree-panel",
        flodClass = "fold-button",
        unflodClass = "unfold-button",
        selectionClass = "selection-item";

    var instanceCount = 0,
        parentNode = "__st$parentNode";

    var nodeMarginLeft = 12,
        flodButtonLeft = 3,
        flodButtonWidth = 12,
        flodButtonText = {};
    flodButtonText[flodClass] = "+";
    flodButtonText[unflodClass] = "-";
    
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
    var getParent = function () {
        return this[parentNode];
    };
    

    var ctrl = ui.define("ctrls.SelectionTree", {
        _getCreateOption: function () {
            return {
                multiple: false,
                valueField: null,
                textField: null,
                parentField: null,
                childField: null,
                data: null,
                canSelectNode: false,
                defaultOpen: false,
                width: 100,
                lazy: false
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
            if($.isArray(this.option.parentField)) {
            	this._getParent = getArrayValue;
            } else if($.isFunction(this.option.parentField)) {
                this._getParent = this.option.parentField; 
            } else {
            	this._getParent = getValue;
            }
            
            if(this.option.lazy) {
                if($.isFunction(this.option.lazy.hasChildren)) {
                    this._hasChildren = this.option.lazy.hasChildren;
                }
                if($.isFunction(this.option.lazy.loadChildren)) {
                    this._loadChildren = this.option.lazy.laodChildren;
                }
                
                this.onTreeNodeClick = this.onTreeNodeLazyClick;
                this.option.defaultOpen = false,
                this.option.lazy = true;
            } else {
                this.option.lazy = false;
            }

            instanceCount++;
            //id前缀
            this.treeIdPrefix = "st" + instanceCount + "_";
        },
        _init: function () {
            this.treePanel = $("<div class=\"tree-panel\" />").addClass(borderColor);
            this.treePanel.click($.proxy(this.onTreeSelection, this));
            $(document.body).append(this.treePanel);
            if ($.isNumeric(this.option.width)) {
                this.treePanel.css("width", this.option.width + "px");
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
            var dl = $("<dl />");
            if (this.option.parentField && this.option.parentField.length > 0) {
                this._listDataToTree(this.option.data, dl, 0);
            } else if (this.option.childField && this.option.childField.length > 0) {
                this._treeDataToTree(this.option.data, dl, 0);
            }
            this.treePanel.append(dl);
        },
        _listDataToTree: function (list, dl, level) {
            if (!$.isArray(list) || list.length == 0)
                return;
            var tempList = {}, temp, root,
                item, i, id, pid,
                childField = "children", flagField = "fromList";
            for (i = 0; i < list.length; i++) {
                item = list[i];
                pid = this._getParent.call(item, this.option.parentField) + "" || "__";
                if (tempList.hasOwnProperty(pid)) {
                    temp = tempList[pid];
                    temp[childField].push(item);
                } else {
                    temp = {};
                    temp[childField] = [];
                    temp[childField].push(item);
                    tempList[pid] = temp;
                }
                id = this._getValue.call(item, this.option.valueField) + "";
                if (tempList.hasOwnProperty(id)) {
                    temp = tempList[id];
                    tempList[id] = item;
                    item[childField] = temp[childField];
                    item[flagField] = true;
                } else {
                    item[childField] = [];
                    item[flagField] = true;
                    tempList[id] = item;
                }
            }
            for (var key in tempList) {
                temp = tempList[key];
                if (!temp.hasOwnProperty(flagField)) {
                    root = temp;
                    break;
                }
            }
            this.option.childField = childField;
            this.oldData = this.option.data;
            if (root) {
                this.option.data = root[childField];
                this._treeDataToTree(this.option.data, dl, level);
            }
        },
        _treeDataToTree: function (list, dl, level, idValue, parentData) {
            if (!$.isArray(list))
                return;
            var id, text, children;
            var item, i, tempMargin;
            var childDL, dt, dd, span, cbx = null;
            var path = idValue;
            for (i = 0; i < list.length; i++) {
                item = list[i];
                item[parentNode] = parentData || null;
                item.getParent = getParent;

                id = path ? (path + "_" + i) : ("" + i);
                text = this._getText.call(item, this.option.textField);
                if (!text)
                    text = "";
                dt = $("<dt />");
                if (this.option.multiple === true) {
                    cbx = $("<input type='checkbox' />");
                }
                span = $("<span />").text(text);
                dt.prop("id", this.treeIdPrefix + id);
                dl.append(dt);

                if (this._hasChildren(item)) {
                    children = this._getChildren(item);
                    dd = $("<dd />");
                    if (this.option.defaultOpen === true) {
                        dt.append(this._createNodeButton(level, 3, flodClass, unflodClass, flodClass, bgColor, borderColor));
                    } else {
                        dt.append(this._createNodeButton(level, 2, flodClass, bgColor, borderColor));
                        dd.css("display", "none");
                    }
                    if (this.option.canSelectNode === true && cbx) {
                        dt.append(cbx);
                    }

                    if (!this.option.lazy) {
                        childDL = $("<dl />");
                        this._treeDataToTree(children, childDL, level + 1, id, item);
                        dd.append(childDL);
                    }
                    dl.append(dd);
                } else {
                    tempMargin = ((level + 1) * (flodButtonWidth + flodButtonLeft) + flodButtonLeft) + "px";
                    if (cbx) {
                        cbx.css("margin-left", tempMargin);
                        dt.append(cbx);
                    } else {
                        span.css("margin-left", tempMargin);
                    }
                }
                dt.append(span);
            }
        },
        _createNodeButton: function (level, index) {
            var div = $("<div />");
            for (var i = 2, l = arguments.length; i < l; i++) {
                div.addClass(arguments[i]);
            }
            var btnClass = arguments[index];
            div.css("margin-left", (level * (flodButtonWidth + flodButtonLeft) + flodButtonLeft) + "px");
            var span = $("<span />");
            span.text(flodButtonText[btnClass]);
            div.append(span);
            div.click($.proxy(this.onTreeNodeClick, this));
            return div;
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
        _getChildren: function (treeNode) {
            return treeNode[this.option.childField];
        },
        _hasChildren: function(treeNode) {
            var children = treeNode[this.option.childField];
            return $.isArray(children) && children.length > 0;
        },
        _loadChildren: function(dt, dd, treeNode) {
            var children = this._getChildren(treeNode);
            this.appendChildren(dt, dd, treeNode, children);
            
        },
        appendChildren: function(dt, dd, treeNode, children) {
            var dl;
            if($.isArray(children) && children.length > 0) {
                dl = $("<dl />");
                this._treeDataToTree(
                    children, 
                    dl, 
                    this.getLevel(treeNode) + 1, 
                    ui.str.lTrim(dt.prop("id"), this.treeIdPrefix), 
                    treeNode);
                dd.append(dl);
            }
        },
        getCurrentSelection: function () {
            var data = null;
            var id, cf;
            if (this.current) {
                id = this.current.prop("id");
                id = id.substring(this.treeIdPrefix.length);
                arr = id.split("_");
                data = this.option.data[window.parseInt(arr[0], 10)];
                for (i = 1; i < arr.length; i++) {
                    data = this._getChildren(data)[window.parseInt(arr[i], 10)];
                }
            }
            return data;
        },
        setCurrentSelection: function (value) {
            this.cancelSelection();
            if (!value)
                return;
            var valueData = [value];
            this._setTreeValues(this.option.data, valueData, 0);
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
            var values = values.slice(0);
            this._setTreeValues(this.option.data, values, 0);
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
        getData: function (elem) {
            if (!elem) {
                return null;
            }
            var id = elem.prop("id");
            if (id.length == 0 || id.indexOf(this.treeIdPrefix) != 0) {
                return null;
            }
            id = id.substring(this.treeIdPrefix.length);
            arr = id.split("_");
            data = this.option.data[window.parseInt(arr[0], 10)];
            for (i = 1; i < arr.length; i++) {
                data = this._getChildren(data)[window.parseInt(arr[i], 10)];
            }
            return data;
        },
        getLevel: function(data) {
            var level = 0;
            while(data[parentNode]) {
                level++;
                data = data[parentNode];
            }
            return level;
        },
        selectChildNode: function (elem, checkValue) {
            var data = this.getData(elem);
            if (!data)
                return;
            var children = this._getChildren(data);
            if (this.option.canSelectNode !== true || this.option.multiple !== true) {
                throw new Error("option properties canSelectNode and multiple must be true!");
            }
            this._selectChildNode(children, elem.prop("id"), !!checkValue);
        },
        selectParentNode: function (elem, checkedValue) {
            var data = this.getData(elem);
            if (!data)
                return;
            this._selectParentNode(data[parentNode], elem.prop("id"), checkedValue);
        },
        empty: function () {
            this.treePanel.html("");
            this.selectList = [];
            this.current = null;

            this.fire(canceled);
        },
        isShow: function() {
            return this.treePanel.hasClass(showClass);
        },
        show: function () {
            ui.addHideHandler(this, this.hide);
            if (!this.isShow()) {
                this.treePanel.addClass(showClass);
                var p = this.element.offset(),
                    h = this.treePanel.outerHeight(),
                    w = this.treePanel.outerWidth(),
                    docel = document.documentElement;
                var top = p.top + this.element.outerHeight(),
                    left = p.left;
                if ((top + h) > docel.clientHeight + docel.scrollTop)
                    top -= (top + h) - (docel.clientHeight + docel.scrollTop);
                if ((left + w) > docel.clientWidth + docel.scrollLeft)
                    left = left - (w - this.element.outerWidth());
                this.treePanel.css({
                    "top": top + "px",
                    "left": left + "px"
                }).fadeIn(200);
            }
        },
        hide: function () {
            if (this.isShow()) {
                this.treePanel.removeClass(showClass);
                this.treePanel.fadeOut(200);
            }
        },
        _setTreeValues: function (data, values, level) {
            if (!$.isArray(data)) {
                return;
            }
            if (!$.isArray(values) || values.length == 0) {
                return;
            }

            var item = null;
            var i, j, len;
            var path = arguments[3];
            var id = null;
            for (i = 0, len = data.length; i < len; i++) {
                item = data[i];
                id = path ? (path + "_" + i) : ("" + i);
                for (j = 0; j < values.length; j++) {
                    if (this._equalValue(item, values[j])) {
                        this._setTreeValue(item, id, values.length);
                        values.splice(j, 1);
                        break;
                    }
                }
                this._setTreeValues(this._getChildren(item), values, level + 1, id);
                if (values.length == 0)
                    break;
            }
        },
        _equalValue: function (item, value) {
            if (ui.core.type(item) === "object" && ui.core.type(value) !== "object") {
                return this._getValue.call(item, this.option.valueField) === value;
            } else {
                return this._getValue.call(item, this.option.valueField) === this._getValue.call(value, this.option.valueField);
            }
        },
        _setTreeValue: function (data, path, valuesCount) {
            var dt, 
                tempId,
                needAppendElements,
                pathArray;
            var i,
                treeNodeDT,
                treeNodeDD;
            if (this.option.lazy) {
                needAppendElements = [];
                pathArray = path.split("_");

                tempId = "#" + this.treeIdPrefix + path;
                dt = $(tempId);
                while(dt.length == 0) {
                    needAppendElements.push(tempId);
                    pathArray.splice(pathArray.length - 1, 1);
                    if(pathArray.length == 0) {
                        break;
                    }
                    tempId = "#" + this.treeIdPrefix + pathArray.join("_")
                    dt = $(tempId);
                }
                if (dt.length == 0) {
                    return;
                }
                for (i = needAppendElements.length - 1; i >= 0; i--) {
                    treeNodeDT = dt;
                    treeNodeDD = treeNodeDT.next();
                    this._loadChildren(treeNodeDT, treeNodeDD, this.getData(treeNodeDT));
                    dt = $(needAppendElements[i]);
                }
            } else {
                dt = $("#" + this.treeIdPrefix + path);
            }
            var treeNodeDD = dt.parent().parent();
            while (treeNodeDD.nodeName() === "DD") {
                treeNodeDT = treeNodeDD.prev();
                if (treeNodeDD.css("display") === "none") {
                    this._openChildren(treeNodeDT, true);
                }
                treeNodeDD = treeNodeDT.parent().parent();
            }
            this._selectItem(dt, data, false, true, !(valuesCount > 1));
        },
        _selectChildNode: function (children, parentId, checkedValue) {
            if (!$.isArray(children) || children.length == 0) {
                return;
            }
            var itemId = null;
            var elem = null;
            var data;
            for (var i = 0; i < children.length; i++) {
                data = children[i];
                itemId = parentId + "_" + i;
                elem = $("#" + itemId);
                this._selectItem(elem, data, false, checkedValue, false);
                this._selectChildNode(this._getChildren(data), itemId, checkedValue);
            }
        },
        _selectParentNode: function (parentData, nodeId, checkedValue) {
            if (!parentData) {
                return;
            }
            var parentId = nodeId.substring(0, nodeId.lastIndexOf("_"));
            var elem = $("#" + parentId);
            var nextElem, dts, i;
            if (!checkedValue) {
                nextElem = elem.next();
                if (nextElem.nodeName() === "DD") {
                    dts = nextElem.find("dt");
                    for (i = 0; i < dts.length; i++) {
                        if ($(dts[i]).find("input[type='checkbox']").prop("checked")) {
                            return;
                        }
                    }
                }
            }
            this._selectItem(elem, parentData, false, checkedValue, false);
            this._selectParentNode(parentData[parentNode], parentId, checkedValue);
        },
        _openChildren: function(dt, isOpen, btn) {
            var dd = dt.next();
            if (!btn) {
                btn = dt.children("div.fold-button");
            }
            if (isOpen) {
                btn.children("span").text(flodButtonText[unflodClass]);
                btn.addClass(unflodClass);
                dd.css("display", "block");
            } else {
                btn.children("span").text(flodButtonText[flodClass]);
                btn.removeClass(unflodClass);
                dd.css("display", "none");
            }
        },
        ///events
        onTreeSelection: function (e) {
            if (this.option.multiple) {
                e.stopPropagation();
            }

            var elem = $(e.target);
            var id, arr, data, i;
            var nodeName = elem.nodeName();
            var isCheckbox = nodeName === "INPUT";
            while (nodeName !== "DT") {
                if (elem.hasClass(listPanelClass))
                    return;
                elem = elem.parent();
                nodeName = elem.nodeName();
            }

            data = this.getData(elem);
            if (this.option.canSelectNode === true || !this._hasChildren(data)) {
                this._selectItem(elem, data, isCheckbox);
            } else {
                e.stopPropagation();
            }
        },
        onTreeNodeClick: function (e) {
            e.stopPropagation();
            var elem = $(e.target);
            var dt = null;
            if (elem.nodeName() === "SPAN") {
                elem = elem.parent();
            }
            dt = elem.parent();
            if (elem.hasClass(unflodClass)) {
                this._openChildren(dt, false, elem);
            } else {
                this._openChildren(dt, true, elem);
            }
        },
        onTreeNodeLazyClick: function(e) {
            e.stopPropagation();
            var elem = $(e.target);
            var dd = null,
                dt = null;
            if (elem.nodeName() === "SPAN") {
                elem = elem.parent();
            }
            dt = elem.parent();
            dd = dt.next();
            if (elem.hasClass(unflodClass)) {
                this._openChildren(dt, false, elem);
            } else {
                this._openChildren(dt, true, elem);
                if(dd.children().length == 0) {
                    this._loadChildren(dt, dd, this.getData(dt));
                }
            }
        },
        _selectItem: function (elem, data, isCheckbox, checkedValue, fireSelected) {
            var treeData = {
                data: data,
                children: this._getChildren(data),
                parentData: data[parentNode],
                isRoot: !data[parentNode]
            };
            treeData.isNode = $.isArray(treeData.children) && treeData.children.length > 0;
            var result = this.fire(selecting, elem, treeData);
            if (result === false) return;

            var cbx = null;
            var checked = null;

            if (this.option.multiple === true) {
                cbx = elem.find("input[type='checkbox']");
                if (arguments.length == 3) {
                    if (isCheckbox) {
                        checked = cbx.prop("checked");
                    } else {
                        checked = !cbx.prop("checked");
                    }
                } else {
                    checked = checkedValue;
                    if (cbx.prop("checked") == checked) {
                        return;
                    }
                }
                cbx.prop("checked", checked);
                treeData.isSelected = checked;
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
                treeData.isSelected = true;
                elem.addClass(selectionClass).addClass(bgColor);
            }

            if (fireSelected === false) {
                return;
            }
            this.fire(selected, elem, treeData);
        }
    });

    $.fn.setSelectTree = function (option) {
        if (!this || this.length == 0) {
            return null;
        }
        return ctrl(option, this);
    };
})(jQuery);

(function(){
    var ctrl = ui.define("ctrls.TreeView", ui.ctrls.SelectionTree, {
        _init: function () {
            this.treePanel = this.element;
            var positionValue = this.treePanel.css("position");
            this.treePanel
                .addClass("tree-panel")
                .addClass("tree-view-panel")
                .css({
                    "position": positionValue
                });
            this.treePanel.click($.proxy(this.onTreeSelection, this));
            if ($.isArray(this.option.data)) {
                this._fill(this.option.data);
            }
        }
    });

    $.fn.setTreeView = function (option) {
        if (!this || this.length == 0) {
            return null;
        }
        return ctrl(option, this);
    };
})();