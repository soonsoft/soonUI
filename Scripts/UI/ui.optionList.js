; (function () {

    var bgColor = ui.theme.highlight.background;
    
    var selecting = "selecting",
        selected = "selected",
        deselected = "deselected",
        removed = "removed";
        

    var selectionClass = "selection-item";

    var ctrl = ui.define("ctrls.OptionList", {
        _getOption: function () {
            return {
                data: null,
                onCreateItemHandler: null,
                hasRemoveButton: true
            };
        },
        _getEvents: function () {
            return [selecting, selected, deselected, removed];
        },
        _create: function () {
            this.current = null;
            if(!$.isFunction(this.option.onCreateItemHandler)) {
                this.option.onCreateItemHandler = function() { };
            }
        },
        _init: function () {
            var that = this;
            this.listPanel = $("<ul />");
            if(Array.isArray(this.option.data)) {
                this._createItems(this.option.data);
            } else {
                this.option.data = [];
            }
            if(this.option.hasRemoveButton) {
                this._onRemoveButtonClick = $.proxy(function(e) {
                    e.stopPropagation();
                    var elem = $(e.target);
                    this._removeItem(elem.parent());
                }, this);
            }
            this.listPanel.click(function(e) {
                var elem = $(e.target),
                    nodeName;
                while((nodeName = elem.nodeName()) !== "LI") {
                    if(nodeName === "UL") {
                        return;
                    }
                    elem = elem.parent();
                }
                that._itemSelection(elem);
            });
            this.element.addClass("option-list");
            this.element.append(this.listPanel);
        },
        _createItems: function(data) {
            var i = 0,
                len = data.length,
                item;
            this.listPanel.empty();
            for(; i < len; i++) {
                item = data[i];
                this.listPanel.append(this._createItem(item, i));
            }
        },
        _createItem: function(item, index) {
            var li = $("<li />"),
                inner,
                content,
                removeButton;
            li.attr("data-index", index);
            li.append("<b />");
            content = $("<div class='item-content-panel' />");
            li.append(content);
            if(this.option.hasRemoveButton) {
                removeButton = $("<a href='javascript:void(0)' class='remove-button font-highlight-hover'>×</a>");
                removeButton.click(this._onRemoveButtonClick);
                li.append(removeButton);
            }
            inner = this.option.onCreateItemHandler.call(this, item);
            content.append(inner);
            return li;
        },
        _itemSelection: function(elem) {
            var eventData = {};
            eventData.index = parseInt(elem.attr("data-index"), 10);
            eventData.data = this.option.data[eventData.index];
            
            var result = this.fire(selecting, elem, eventData);
            if(result === false) {
                return;
            }
            
            if(this.current) {
                this.current.removeHighlight(selectionClass, "font");
                this.current.children("b").removeClass(bgColor);
                
                if(this.current[0] === elem[0]) {
                    this.current = null;
                    this.fire(deselected, this.current, eventData);
                    return;
                }
                this.current = null;
            }
            
            this.current = elem;
            this.current.addHighlight(selectionClass, "font");
            this.current.children("b").addClass(bgColor);
            
            this.fire(selected, this.current, eventData);
        },
        _removeItem: function(li, animation) {
            if(!li || li.length == 0) {
                return;
            }
            var that = this,
                doRemove = function() {
                    var index = parseInt(li.attr("data-index"), 10),
                        nextLi = li.next();
                    var item = that.option.data.splice(index, 1)[0];
                    while(nextLi.length > 0) {
                        nextLi.attr("data-index", index++);
                        nextLi = nextLi.next();
                    }
                    that.fire("removed", item);
                    li.remove();
                };
            if(animation === false) {
                doRemove();
                return;
            }
            li.animationStart({
                ease: ui.AnimationStyle.easeFromTo,
                begin: 0,
                end: -(li.width()),
                onChange: function (val, elem) {
                    elem.css("margin-left", val + "px");
                },
                duration: 300
            }).done(function () {
                return li.animationStart({
                    ease: ui.AnimationStyle.easeFromTo,
                    begin: li.height(),
                    end: 0,
                    onChange: function (val, elem) {
                        elem.css("height", val + "px");
                    },
                    duration: 300
                });
            }).done(doRemove);
        },
        setData: function (data) {
            if (Array.isArray(data)) {
                this.option.data = data;
            } else if (typeof data === "string") {
                this.option.data = [data];
            } else {
                return;
            }
            this._createItems(this.option.data);
        },
        empty: function() {
            this.listPanel.empty();
            this.option.data = [];
            this.current = null;
        },
        getCurrentData: function() {
            return this.getData(this.getCurrentIndex());
        },
        getData: function(index) {
            if(ui.core.type(index) !== "number") {
                return null;
            }
            if(index >= 0 && index < this.option.data.length) {
                return this.option.data[index];
            }
            return null;
        },
        getCurrentIndex: function() {
            if(!this.current) {
                return null;
            }
            return parseInt(this.current.attr("data-index"), 10);
        },
        selectItemByIndex: function(index) {
            if(ui.core.type(index) !== "number") {
                return;
            }
            if(index >= 0 && index < this.option.data.length) {
                this._itemSelection($(this.listPanel.children()[index]));
            }
        },
        addItem: function(item) {
            var dataList = this.option.data,
                index;
            if(!dataList) {
                this.setData([item]);
                return;
            }
            index = dataList.length;
            dataList.push(item);
            this.listPanel.append(this._createItem(item, index));
        },
        insertItemByIndex: function(index, item) {
            var dataList = this.option.data,
                li;
            if(!dataList) {
                this.addItem(item);
                return;
            }
            if(index >= 0 && index < dataList.length) {
                li = $(this.dataList.children()[index]);
                dataList.splice(index, 0, item);
                li.before(this._createItem(item. index));
                while(li.length > 0) {
                    index++;
                    li.attr("data-index", index++);
                    li = li.next();
                }
            } else {
                this.addItem(item);
            }
        },
        updateItemByIndex: function(index, item) {
            var dataList = this.option.data,
                li,
                nextLi;
            if(!dataList) {
                return;
            }
            if(index < 0 || index >= dataList.length) {
                return;
            }
            dataList[index] = item;
            if(index === dataList.length - 1) {
                li = $(this.listPanel.children()[index]);
                li.remove();
                this.listPanel.append(this._createItem(item, index));
            } else {
                li = $(this.listPanel.children()[index]);
                li.remove();
                nextLi = $(this.listPanel.children()[index]);
                li = this._createItem(item, index);
                nextLi.before(li);
            }
        },
        removeItemByIndex: function(index, animation) {
            var dataList = this.option.data;
            if(!dataList) {
                return;
            }
            if(index >= 0 && index < dataList.length) {
                this._removeItem($(this.listPanel.children()[index]), animation);
            }
        },
        cancelSelection: function() {
            var eventData;
            if(this.current) {
                eventData = {};
                eventData.index = parseInt(this.current.attr("data-index"), 10);
                eventData.data = this.option.data[eventData.index];
                this.current.removeHighlight(selectionClass, "font");
                this.current.children("b").removeClass(bgColor);
                this.fire(deselected, this.current, eventData);
                this.current = null;
            }
        },
        _getOperateItem: function() {
            var elem = null;
            if(arguments.length == 0) {
                elem = this.getCurrentIndex();
            } else {
                elem = arguments[0];
                if($.isFunction(elem)) {
                    elem = this.getCurrentIndex();
                }
            }
            if(ui.core.type(elem) === "number") {
                elem = $(this.listPanel.children()[elem]);
            } else {
                elem = $(elem);
            }
            if(elem.length == 0) {
                return null;
            }
            return elem;
        },
        moveUp: function() {
            var elem = this._getOperateItem.apply(this, arguments),
                func = null;
            if(!elem) {
                return;
            }
            if($.isFunction(arguments[0])) {
                func = arguments[0];
            } else {
                func = arguments[1];
            }
            var index = parseInt(elem.attr("data-index"), 10),
                items = this.listPanel.children();
            var item = null,
                beforeItem = null;
            if(index === 0) {
                return;
            }
            item = elem;
            beforeItem = $(items[index - 1]);
            beforeItem.before(item);
            item.attr("data-index", index - 1);
            beforeItem.attr("data-index", index);
            
            item = this.option.data[index];
            this.option.data[index] = this.option.data[index - 1];
            this.option.data[index - 1] = item;
            
            if($.isFunction(func)) {
                func.call(this, elem, index - 1, beforeItem, index);
            }
        },
        moveDown: function() {
            var elem = this._getOperateItem.apply(this, arguments),
                func = null;
            if(!elem) {
                return;
            }
            if($.isFunction(arguments[0])) {
                func = arguments[0];
            } else {
                func = arguments[1];
            }
            var index = parseInt(elem.attr("data-index"), 10),
                items = this.listPanel.children();
            var item = null,
                afterItem = null;
            if(index === items.length - 1) {
                return;
            }
            item = elem;
            afterItem = $(items[index + 1]);
            afterItem.after(item);
            item.attr("data-index", index + 1);
            afterItem.attr("data-index", index);
            
            item = this.option.data[index];
            this.option.data[index] = this.option.data[index + 1];
            this.option.data[index + 1] = item;
            
            if($.isFunction(func)) {
                func.call(this, elem, index + 1, afterItem, index);
            }
        }
    });

    $.fn.setOptionList = function (option) {
        if (!this || this.length == 0) {
            return null;
        }
        return ctrl(option, this);
    };
})();
