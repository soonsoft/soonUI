; (function ($) {

    var borderColor = ui.theme.Classes.BorderHighlight,
        bgColor = ui.theme.Classes.BackgroundHighlight,
        fontColor = ui.theme.Classes.FontHighlight;

    var showClass = "sl-show",
        listUL = "sl-ul",
        itemClass = "item",
        titleClass = "title",
        itemRadioClass = "item-radio",
        selectedItemRadio = "selected-item-radio";

    var ctrl = ui.define("ctrls.OptionList", {
        _getCreateOption: function () {
            return {
                data: [],
                valueField: null,
                textField: null,
                width: 100,
                height: 80
            };
        },
        _create: function () {
            this.width = this.option.width;
            this.height = this.option.height;
            this.isShow = false;
            if (isNaN(this.width))
                this.width = 160;
            if (isNaN(this.height))
                this.height = 240;

            this.animator = ui.animator({
                ease: ui.AnimationStyle.easeTo,
                onChange: function (val, elem) {
                    elem.css("height", parseInt(val, 10) + "px");
                }
            });
            this.animator.addTarget({
                ease: ui.AnimationStyle.easeTo,
                onChange: function (val, elem) {
                    elem.css("top", parseInt(val, 10) + "px");
                }
            });
            this.animator.duration = 500;
        },
        _init: function () {
            this.optionPanel = $("<div class=\"option-list\" />").addClass(borderColor);
            $(document.body).append(this.optionPanel);
            this.optionPanel.css({
                "width": this.width + "px",
                "height": "0px",
                "display": "none"
            });

            this.listPanel = $("<div class='option-inner' />");
            this.listPanel.css("top", -this.height + "px");
            this.listPanel.click(jQuery.proxy(this.onClick, this));
            this.optionPanel.append(this.listPanel);

            var that = this;
            this.element.click(function (e) {
                e.stopPropagation();
                that.show();
            });
            ui.docClick(function (e) {
                that.hide();
            });

            this.animator[0].target = this.optionPanel;
            this.animator[1].target = this.listPanel;
        },
        addLine: function () {
            var line = $("<hr />");
            line.css("width", this.width - 30 + "px");
            this.listPanel.append(line);
        },
        addGroup: function (groupObj) {
            var items;
            var li, i;
            var isRadio = false;
            var ul = $("<ul />").addClass(listUL);
            if (typeof groupObj === "string") {
                items = ui.core.slice.call(arguments, 0);
            } else if (arguments.length > 1) {
                if (!groupObj) {
                    groupObj = {};
                }
                ul.data("source", groupObj);
                if (groupObj.title) {
                    li = $("<li />").addClass(titleClass)
                            .append(this.getItem(groupObj.title));
                    ul.append(li);
                }
                if (groupObj.type === "radio") {
                    isRadio = true;
                }
                items = ui.core.slice.call(arguments, 1);
            } else {
                return;
            }

            if (items && items.length) {
                for (i = 0; i < items.length; i++) {
                    li = $("<li />").addClass(itemClass)
                        .append(this.getItem(items[i]));
                    if (isRadio) {
                        //li.addClass(itemRadioClass);
                    }
                    li.data("index", i);
                    ul.append(li);
                }
            }
            this.listPanel.append(ul);
        },
        appendElement: function (element) {
            var elem = false;
            if (ui.core.isJQueryObject(element))
                elem = element;
            else if (ui.core.isDomObject(element))
                elem = $(element);

            if (elem) {
                this.listPanel.append(elem);
            }
        },
        appendHtml: function () {
        },
        getItem: function (item, index) {
            var content = null;
            if (typeof item === "string") {
                content = $("<span>" + item + "</span>");
            } else if (ui.core.isPlainObject(item)) {
                var node = item.node;
                var text = item.text;
                delete item.node;
                delete item.text;
                if (!node) {
                    node = "span";
                }
                if (!text) {
                    text = "";
                }
                node = node.toLowerCase();
                content = this["create_" + node](text, item);
            } else if (jQuery.isFunction(item)) {
                content = item(index);
            }
            return content;
        },
        create_span: function (text) {
            return $("<span>" + text + "</span>");
        },
        create_a: function (text, properties) {
            var a = $("<a />");
            this._addProperties(a, properties);
            var span = $("<span />").text(text).addClass(fontColor);
            return [a[0], span[0]];
        },
        _addProperties: function (elem, properties) {
            if (!properties) {
                return;
            }
            for (var key in properties) {
                elem.prop(key, properties[key] + "");
            }
        },
        setData: function (data) {
            if ($.isArray(data)) {
                this.option.data = data;
            } else if (typeof data === "string") {
                this.option.data = [data];
            } else {
                return;
            }
            this.listPanel.html("");
            this._createList(this.option.data);
        },
        setLocation: function () {
            var location = ui.core.getDownLocation(this.element, this.width + 4, this.height + 4);
            this.optionPanel.css({
                "top": location.top + "px",
                "left": location.left + "px"
            })
        },
        show: function () {
            if (this.isShow) {
                return;
            }

            this.setLocation();

            this.animator.stop();
            this.optionPanel.css("display", "block");
            var option = this.animator[0];
            option.begin = this.optionPanel.height();
            option.end = this.height;

            var beginVal = option.end - option.begin;
            option = this.animator[1];
            option.target.css("top", -beginVal + "px");
            option.begin = -beginVal;
            option.end = 0;

            this.animator.onEnd = null;

            this.isShow = true;
            this.animator.start();
        },
        hide: function () {
            if (!this.isShow) {
                return;
            }
            this.animator.stop();

            var option = this.animator[0];
            option.begin = this.optionPanel.height();
            option.end = 0;

            option = this.animator[1];
            option.begin = parseFloat(option.target.css("top"), 10);
            option.end = -this.height;

            var that = this;
            this.animator.onEnd = function () {
                that.optionPanel.css("display", "none");
            };

            this.isShow = false;
            this.animator.start();
        },
        bindData: function (d) {
            this.option.data = d;
            this._createList(d);
        },
        //events
        onClick: function (e) {
            var elem = $(e.target);
            var li = elem;
            var firstItem;
            var source;
            var nodeName = li.nodeName();
            if (nodeName === "A") {
                return;
            }
            while (nodeName !== "LI") {
                if (nodeName === "DIV" && li.hasClass("option-list")) {
                    e.stopPropagation();
                    return;
                }
                li = li.parent();
                nodeName = li.nodeName();
            }
            source = li.data("source");
            firstItem = li.children();
            if (firstItem == 0)
                return;
            firstItem = $(firstItem[0]);
            nodeName = firstItem.nodeName();
            var func = source ? source.handler : null;
            if (!$.isFunction(func)) {
                func = ui.core.noop;
            }
            var arg = {
                target: elem,
                item: li,
                source: source
            };
            if (nodeName === "A") {
                e.stopPropagation();
                return;
            } else {
                if (source.type === "radio") {
                    if (source.current) {
                        source.current.removeClass(selectedItemRadio);
                    }
                    li.addClass(selectedItemRadio);
                    source.current = li;
                }
                func.apply(this, [arg]);
            }
        }
    });

    $.fn.createOptionList = function (option) {
        if (!this || this.length == 0) {
            return null;
        }
        return ctrl(option, this);
    };
})(jQuery);