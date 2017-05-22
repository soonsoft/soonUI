; (function () {

    var borderColor = ui.theme.highlight.border,
        fontColor = ui.theme.highlight.font,
        bgColor = ui.theme.highlight.background;

    var listPanelClass = "tree-panel",
        flodClass = "fold-button",
        unflodClass = "unfold-button",
        selectionClass = "selection-item";

    var instanceCount = 0,
        parentNode = "__st$parentNode";

    var flodButtonLeft = 3,
        flodButtonWidth = 14;

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


    var ctrl = ui.define("ctrls.SelectionTree", ui.ctrls.DropDownPanel, {
        _getOption: function () {
            return {
                multiple: false,
                valueField: null,
                textField: null,
                parentField: null,
                childField: null,
                data: null,
                canSelectNode: false,
                //默认展开的层级，false(0)：显示第一层级，true：显示所有层级，数字：显示的层级值(0表示根级别，数值从1开始)
                defaultOpen: false,
                lazy: false
            };
        },
        _getEvents: function () {
            return [selecting, selected, canceled];
        },
        _create: function () {
            this._super();

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
            if(Array.isArray(this.option.parentField)) {
                this._getParent = getArrayValue;
            } else if($.isFunction(this.option.parentField)) {
                this._getParent = this.option.parentField;
            } else {
                this._getParent = getValue;
            }

            if(this.option.defaultOpen === false) {
                this.openLevel = 0;
            } else {
                if(ui.core.type(this.option.defaultOpen) === "number") {
                    this.openLevel = this.option.defaultOpen <= 0 ? 0 : this.option.defaultOpen;
                } else {
                    this.openLevel = 1000;
                }
            }

            if(this.option.lazy) {
                if($.isFunction(this.option.lazy.hasChildren)) {
                    this._hasChildren = this.option.lazy.hasChildren;
                }
                if($.isFunction(this.option.lazy.loadChildren)) {
                    this._loadChildren = this.option.lazy.loadChildren;
                    //当数据延迟加载是只能默认加载根节点
                    this.openLevel = 0;
                }

                this.onTreeNodeClick = this.onTreeNodeLazyClick;
                this.option.lazy = true;
            } else {
                this.option.lazy = false;
            }

            instanceCount++;
            //id前缀
            this.treeIdPrefix = "st" + instanceCount + "_";
        },
        _init: function () {
            this.treePanel = $("<div class='tree-panel border-highlight' />");
            this.treePanel.click($.proxy(this.onTreeSelection, this));
            this.wrapElement(this.element, this.treePanel);

            this._selectTextClass = "select-text";
            this._showClass = "st-show";
            this._clearClass = "st-clear";
            this._clear = function () {
                this.cancelSelection();
            };

            this.initPanelWidth(this.option.width);
            if (Array.isArray(this.option.data)) {
                this._fill(this.option.data);
            }

            this._super();
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
            if (!Array.isArray(list) || list.length == 0)
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
                if(tempList.hasOwnProperty(key)) {
                    temp = tempList[key];
                    if (!temp.hasOwnProperty(flagField)) {
                        root = temp;
                        break;
                    }
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
            if (!Array.isArray(list))
                return;
            var id, text, children;
            var item, i, tempMargin;
            var childDL, dt, dd, cbx = null;
            var path = idValue;
            for (i = 0; i < list.length; i++) {
                tempMargin = 0;
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
                dt.prop("id", this.treeIdPrefix + id);
                dl.append(dt);

                if (this._hasChildren(item)) {
                    children = this._getChildren(item);
                    dd = $("<dd />");

                    if (level + 1 <= this.openLevel) {
                        dt.append(this._createNodeButton(level, unflodClass, "fa-angle-down"));
                    } else {
                        dt.append(this._createNodeButton(level, "fa-angle-right"));
                        dd.css("display", "none");
                    }
                    if (this.option.canSelectNode === true && cbx) {
                        dt.append(cbx);
                    }

                    if (this.option.lazy) {
                        if(level + 1 <= this.openLevel) {
                            this._loadChildren(dt, dd, item);
                        }
                    } else {
                        childDL = $("<dl />");
                        this._treeDataToTree(children, childDL, level + 1, id, item);
                        dd.append(childDL);
                    }
                    dl.append(dd);
                } else {
                    tempMargin = (level + 1) * (flodButtonWidth + flodButtonLeft) + flodButtonLeft;
                    if (cbx) {
                        cbx.css("margin-left", tempMargin + flodButtonLeft + "px");
                        tempMargin = 0;
                        dt.append(cbx);
                    }
                }
                dt.append(this.getTreeNodeText(text, tempMargin, item, dt));
            }
        },
        _createNodeButton: function (level) {
            var btn = $("<i class='fold-button font-highlight-hover fa' />");
            for (var i = 1, l = arguments.length; i < l; i++) {
                btn.addClass(arguments[i]);
            }
            btn.css("margin-left", (level * (flodButtonWidth + flodButtonLeft) + flodButtonLeft) + "px");
            return btn;
        },
        getTreeNodeText: function(text, marginLeft, item) {
            var span = $("<span />").text(text);
            if(marginLeft > 0) {
                span.css("margin-left", marginLeft);
            }
            return span;
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
        _getChildren: function (treeNode) {
            return treeNode[this.option.childField];
        },
        _hasChildren: function(treeNode) {
            var children = treeNode[this.option.childField];
            return Array.isArray(children) && children.length > 0;
        },
        _loadChildren: function(dt, dd, treeNode) {
            var children = this._getChildren(treeNode);
            this.appendChildren(dt, dd, treeNode, children);
        },
        appendChildren: function(dt, dd, treeNode, children) {
            var dl;
            if(Array.isArray(children) && children.length > 0) {
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
            var id, arr, i;
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
            var valueData = [value],
                outArgument = { dt: null };
            this._setTreeValues(this.option.data, valueData, 0, null, outArgument);
            if(outArgument.dt) {
                this.fire(selected,
                    outArgument.dt, this._wrapTreeData(this.getNodeData(outArgument.dt)));
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
            values = values.slice(0);
            var outArgument = { dt: null };
            this._setTreeValues(this.option.data, values, 0, null, outArgument);
            if(outArgument.dt) {
                this.fire(selected,
                    outArgument.dt, this._wrapTreeData(this.getNodeData(outArgument.dt)));
            }
        },
        cancelSelection: function (fireEvent) {
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
            if(fireEvent !== false) {
                this.fire(canceled);
            }
        },
        getNodeData: function (elem) {
            if (!elem) {
                return null;
            }
            var id = elem.prop("id");
            if (id.length == 0 || id.indexOf(this.treeIdPrefix) != 0) {
                return null;
            }
            id = id.substring(this.treeIdPrefix.length);
            return this.getDataByPath(id);
        },
        getDataByPath: function(path) {
            if(!path) {
                return null;
            }
            var arr = path.split("_");
            var data = this.option.data[window.parseInt(arr[0], 10)],
                i;
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
            var data = this.getNodeData(elem);
            if (!data) return;
            if (this.option.canSelectNode !== true || this.option.multiple !== true) {
                throw new Error("option properties canSelectNode and multiple must be true!");
            }
            this._selectChildNode(data, elem, !!checkValue);
        },
        selectParentNode: function (elem, checkedValue) {
            var data = this.getNodeData(elem);
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
        _setTreeValues: function (data, values, level, path, outArgument) {
            if (!Array.isArray(data)) {
                return;
            }
            if (!Array.isArray(values) || values.length == 0) {
                return;
            }

            var item = null;
            var i, j, len;
            var id = null;
            for (i = 0, len = data.length; i < len; i++) {
                item = data[i];
                id = path ? (path + "_" + i) : ("" + i);
                for (j = 0; j < values.length; j++) {
                    if (this._equalValue(item, values[j])) {
                        outArgument.dt = this._setTreeValue(item, id);
                        values.splice(j, 1);
                        break;
                    }
                }
                this._setTreeValues(this._getChildren(item), values, level + 1, id, outArgument);
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
        _setTreeValue: function (data, path) {
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
                    this._loadChildren(treeNodeDT, treeNodeDD, this.getNodeData(treeNodeDT));
                    dt = $(needAppendElements[i]);
                }
            } else {
                dt = $("#" + this.treeIdPrefix + path);
            }
            treeNodeDD = dt.parent().parent();
            while (treeNodeDD.nodeName() === "DD") {
                treeNodeDT = treeNodeDD.prev();
                if (treeNodeDD.css("display") === "none") {
                    this._openChildren(treeNodeDT, true);
                }
                treeNodeDD = treeNodeDT.parent().parent();
            }
            this._selectItem(dt, data, false, true, false);
            return dt;
        },
        _selectChildNode: function (data, dt, checkedValue) {
            var children = this._getChildren(data);
            if (!Array.isArray(children) || children.length == 0) {
                return;
            }
            var parentId = dt.prop("id"),
                dd = dt.next();
            var i = 0;

            if (this.option.lazy && dd.children().length == 0) {
                this._loadChildren(dt, dd, data);
            }
            for (; i < children.length; i++) {
                data = children[i];
                dt = $("#" + parentId + "_" + i);
                this._selectItem(dt, data, false, checkedValue, false);
                this._selectChildNode(data, dt, checkedValue);
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
                btn = dt.children(".fold-button");
            }
            if (isOpen) {
                btn.addClass(unflodClass)
                    .removeClass("fa-angle-right")
                    .addClass("fa-angle-down");
                dd.css("display", "block");
            } else {
                btn.removeClass(unflodClass)
                    .removeClass("fa-angle-down")
                    .addClass("fa-angle-right");
                dd.css("display", "none");
            }
        },
        ///events
        onTreeSelection: function (e) {
            if (this.option.multiple) {
                e.stopPropagation();
            }

            var elem = $(e.target);
            var data;
            var nodeName = elem.nodeName();
            var isCheckbox;
            if(nodeName === "I" && elem.hasClass(flodClass)) {
                this.onTreeNodeClick(e);
                return;
            }

            isCheckbox = nodeName === "INPUT";
            while (nodeName !== "DT") {
                if (elem.hasClass(listPanelClass))
                    return;
                elem = elem.parent();
                nodeName = elem.nodeName();
            }

            data = this.getNodeData(elem);
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
            dt = elem.parent();
            dd = dt.next();
            if (elem.hasClass(unflodClass)) {
                this._openChildren(dt, false, elem);
            } else {
                this._openChildren(dt, true, elem);
                if(dd.children().length == 0) {
                    this._loadChildren(dt, dd, this.getNodeData(dt));
                }
            }
        },
        _wrapTreeData: function(data) {
            return {
                data: data,
                children: this._getChildren(data),
                parentData: data[parentNode],
                isRoot: !data[parentNode]
            };
        },
        _selectItem: function (elem, data, isCheckbox, checkedValue, fireSelectedEvent) {
            var treeData = this._wrapTreeData(data);
            treeData.isNode = Array.isArray(treeData.children) && treeData.children.length > 0;
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
                    this.current.removeHighlight(selectionClass, "background");
                }
                this.current = elem;
                treeData.isSelected = true;
                elem.addHighlight(selectionClass, "background");
            }

            if (fireSelectedEvent === false) {
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
})();

///TreeView
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
            if (Array.isArray(this.option.data)) {
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

///AutoComplete-Tree
(function(){
    var completerSelected = "completer-selected";
    var ctrl = ui.define("ctrls.AutoCompleteTree", ui.ctrls.SelectionTree, {
        _create: function() {
            this._super();
            if(!$.isNumeric(this.option.limit)) {
                this.option.limit = 10;
            } else {
                if(this.option.limit <= 0) {
                    this.option.limit = 10;
                } else if(this.option.limit > 100) {
                    this.option.limit = 100;
                }
            }
        },
        _init: function() {
            if(!this.element) {
                return;
            }
            if (this.option.multiple) {
                // TODO: 考虑让auto complete tree能支持多选
                throw new Error("autoCompleterTree can not support multiple!");
            }
            this._super();
            var that = this;
            this.element.off("focus")
                .on("focus", function(e) {
                    ui.hideAll(that);
                    that.resetTreeList();
                    that.show();
                })
                .on("keyup", function(e) {
                    that.onCompleterKeyup(e);
                });
            if(ui.core.ieVersion < 9) {
                this.__oldFire__ = this.fire;
                this.fire = function() {
                    this._callAndCancelPropertyChange(this.__oldFire__, arguments);
                };
            }
            this.element.textinput(function(e) {
                var elem = $(e.target),
                    value = elem.val(),
                    oldValue = elem.data("autocomplete.value");
                if(that.cancelAutoComplete) {
                    return;
                }
                if(value.length == 0) {
                    that.resetTreeList();
                    that.cancelSelection();
                    return;
                }
                if(that.autoCompleteListIsShow() && oldValue === value) {
                    return;
                }
                elem.data("autocomplete.value", value);
                if(!that.isShow()) {
                    that.show();
                }
                that.onLaunch(value);
            });
            this._clear = function() {
                this.cancelSelection(true, this.autoCompleteListIsShow());
            };
        },
        onLaunch: function(searchText) {
            var data = this.option.data;
            if(!data || data.length == 0) {
                return;
            }
            this.cancelSelection(false, false);
            var response = this.search(searchText, data, this.option.limit);
            this.showSearchInfo(response, searchText);
        },
        search: function(searchText, data, limit) {
            var beginArr = [],
                containArr = [];
            searchText = searchText.toLowerCase();
            this._doSearch(beginArr, containArr, searchText, data, limit);
            var result = beginArr.concat(containArr);
            return result.slice(0, limit);
        },
        _doSearch: function(beginArr, containArr, searchText, data, limit, path) {
            var i = 0,
                len = data.length;
            var item,
                id;
            for(; i < len; i++) {
                if(beginArr.length > limit) {
                    return;
                }
                id = path ? (path + "_" + i) : ("" + i);
                item = data[i];
                if(this._hasChildren(item)) {
                    if(this.option.canSelectNode === true) {
                        this._doQuery(beginArr, containArr, searchText, item, id);
                    }
                    this._doSearch(beginArr, containArr, searchText, this._getChildren(item), limit, id);
                } else {
                    this._doQuery(beginArr, containArr, searchText, item, id);
                }
            }
        },
        _doQuery: function(beginArr, containArr, searchText, item, path) {
            var index = this._getText.call(item, this.option.textField)
                .toLowerCase().search(searchText);
            if (index === 0) {
                beginArr.push({ item: item, path: path });
            } else if(index > 0) {
                containArr.push({ item: item, path: path });
            }
        },
        showSearchInfo: function(info, searchText) {
            var dl = this.autoCompleteList,
                that;
            if(!dl) {
                dl = this.autoCompleteList = $("<dl class='autocomplete-dl' />");
                dl.hide();
                that = this;
                dl.click(function(e) {
                    e.stopPropagation();
                    that.onCompleterSelection(e);
                }).mouseover(function(e) {
                    that.onCompleterMouseover(e);
                });
                this.treePanel.append(dl);
            } else {
                dl.empty();
            }
            var i = 0,
                html = [];
            var textHtml,
                re = new RegExp(searchText, "gi"),
                hintHtml = "<span class='query-text font-highlight'>" + searchText + "</span>";
            for(; i < info.length; i++) {
                html.push("<dt data-path='" + info[i].path + "'>");
                html.push("<span>");
                textHtml = this._getText.call(info[i].item, this.option.textField);
                textHtml = textHtml.replace(re, hintHtml);
                html.push(textHtml);
                html.push("</span></dt>");
            }
            $(this.treePanel.children()[0]).hide();
            dl.append(html.join(""));
            dl.show();
            this.moveSelection(1);
        },
        autoCompleteListIsShow: function() {
            if(this.autoCompleteList) {
                return this.autoCompleteList.css("display") === "block";
            } else {
                return false;
            }
        },
        resetTreeList: function() {
            var children = this.treePanel.children();
            $(children[1]).hide();
            $(children[0]).show();
        },
        onCompleterSelection: function(e) {
            this.completerSelection();
        },
        onCompleterKeyup: function(e) {
            if(e.which == ui.keyCode.DOWN) {
                this.moveSelection(1);
            } else if(e.which == ui.keyCode.UP) {
                this.moveSelection(-1);
            } else if(e.which == ui.keyCode.ENTER) {
                this.completerSelection();
            }
        },
        onCompleterMouseover: function(e) {
            var elem = $(e.target),
                nodeName;
            while((nodeName = elem.nodeName()) !== "DT") {
                if(nodeName === "DL") {
                    return;
                }
                elem = elem.parent();
            }
            if(this.currentCompleterElement) {
                this.currentCompleterElement.removeClass(completerSelected);
            }
            this.currentCompleterElement = elem;
            this.currentCompleterElement.addClass(completerSelected);
        },
        moveSelection: function(index) {
            var list = $(this.treePanel.children()[1]).children(),
                elem;
            if(!this.currentCompleterElement) {
                this.currentCompleterElement = $(list[0]);
            } else {
                this.currentCompleterElement.removeClass(completerSelected);
            }
            if(index == 0) {
                this.currentCompleterElement = $(list[0]);
            } else if(index == 1) {
                elem = this.currentCompleterElement.next();
                if(elem.length == 0) {
                    elem = $(list[0]);
                }
                this.currentCompleterElement = elem;
            } else if(index == -1) {
                elem = this.currentCompleterElement.prev();
                if(elem.length == 0) {
                    elem = $(list[list.length - 1]);
                }
                this.currentCompleterElement = elem;
            }
            this.currentCompleterElement.addClass(completerSelected);
        },
        completerSelection: function() {
            var path, data, dt;
            if(this.currentCompleterElement) {
                path = this.currentCompleterElement.attr("data-path");
                data = this.getDataByPath(path);
                if (data) {
                    dt = this._setTreeValue(data, path);
                    //触发选择事件
                    this.fire("selected", dt, this._wrapTreeData(this.getNodeData(dt)));
                }
                ui.hideAll();
            }
        },
        _selectItem: function() {
            this._callAndCancelPropertyChange(this._super, arguments);
        },
        _callAndCancelPropertyChange: function(fn, args) {
            //修复IE8下propertyChange事件由于用户赋值而被意外触发
            this.cancelAutoComplete = true;
            fn.apply(this, args);
            this.cancelAutoComplete = false;
        },
        cancelSelection: function(fireEvent, justAutoCompleteListCancel) {
            if(justAutoCompleteListCancel) {
                this._callAndCancelPropertyChange(function() {
                    this.element.val("");
                });
                this.resetTreeList();
            } else {
                this._super(fireEvent);
            }
        }
    });

    $.fn.setAutoSelectTree = function (option) {
        if (!this || this.length == 0) {
            return null;
        }
        return ctrl(option, this);
    };
})();
