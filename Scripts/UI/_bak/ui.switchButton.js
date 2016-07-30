; (function ($) {
    var borderColor = ui.theme.Classes.BorderHighlight,
        bgColor = ui.theme.Classes.BackgroundHighlight,
        fontColor = ui.theme.Classes.FontHighlight;
    //switchbutton
    var switchButtonClass = "switch-button",
        switchBorderClass = "switch-border",
        switchThumbClass = "switch-thumb",
        switchThumbOnClass = "switch-thumb-on",
        switchInnerClass = "switch-inner",
        switchInnerOnClass = "switch-inner-on",
        switchCheckboxClass = "switch-checkbox";

    var optionKey = "option";

    var switchButton = {
        createSwitchButton: function (option) {
            var button = $("<div class='" + switchButtonClass + "' />");
            if (option.id)
                button.prop("id", option.id);
            var cbx = $("<input type='checkbox' class='" + switchCheckboxClass + "' >");
            if (option.value && option.value.length > 0)
                cbx.prop("value", option.value);
            option.checked = !!option.checked;
            cbx.prop("checked", option.checked);

            button.append(cbx);
            return this._buttonInit(button, cbx, option);
        },
        initSwitchButton: function (cbx, option) {
            var button = $("<div class='" + switchButtonClass + "' />");
            var id = cbx.prop("id");
            if (!option)
                option = {};
            if (id.length > 0) {
                button.prop("id", "switch_" + id);
                option.id = id;
            }
            if (!cbx.hasClass(switchCheckboxClass)) {
                cbx.addClass(switchCheckboxClass);
            }
            cbx.wrap(button);
            button = cbx.parent();
            option.checked = cbx.prop("checked");
            option.value = cbx.val();
            this._buttonInit(button, cbx, option);
        },
        _buttonInit: function (button, cbx, option) {
            var border = $("<div class='" + switchBorderClass + "' />");
            var inner = $("<div class='" + switchInnerClass + "' />");
            var thumb = $("<div class='" + switchThumbClass + "'>");

            if (option.checked) {
                inner.addClass(switchInnerOnClass).addClass(bgColor);
                thumb.addClass(switchThumbOnClass);
            }

            border.append(inner);
            button.append(border);
            button.append(thumb);

            button.data(optionKey, option);
            button.click($.proxy(this.onClick, this));
            cbx.change($.proxy(this.onChange, this));
            cbx.click($.proxy(this.onCheckboxClick, this));

            return button;
        },
        setChecked: function (elem, checked) {
            if (!elem)
                return;
            checked = !!checked;
            if (elem.nodeName() === "INPUT")
                elem = elem.parent();
            var cbx = elem.find("input");

            cbx.prop("checked", checked);
            this.onChanged(elem, checked, cbx.val());
        },
        getChecked: function (elem) {
            if (!elem)
                return null;
            if (elem.nodeName() === "INPUT")
                return elem.prop("checked");
            var cbx = elem.find("input");
            if (cbx.length == 0)
                return null;
            return cbx.prop("checked");
        },
        onClick: function (e) {
            e.stopPropagation();

            var elem = $(e.target);
            var btn, cbx;
            while (!elem.hasClass(switchButtonClass)) {
                if (elem.nodeName() === "BODY") {
                    return;
                }
                elem = elem.parent();
            }

            cbx = elem.find("input");
            var checked = !cbx.prop("checked");
            cbx.prop("checked", checked);

            this.onChanged(elem, checked, cbx.val());
        },
        onChange: function (e) {
            var cbx = $(e.target);
            var btn = cbx.parent();

            this.onChanged(btn, cbx.prop("checked"), cbx.val());
        },
        onCheckboxClick: function (e) {
            e.stopPropagation();
        },
        onChanged: function (elem, checked, value) {
            var inner, thumb;
            inner = elem.find("." + switchInnerClass);
            thumb = elem.find("." + switchThumbClass);

            option = elem.data(optionKey);
            if (!checked) {
                thumb.removeClass(switchThumbOnClass);
                inner.removeClass(switchInnerOnClass).removeClass(bgColor);
            } else {
                thumb.addClass(switchThumbOnClass);
                inner.addClass(switchInnerOnClass).addClass(bgColor);
            }
            if (option && $.isFunction(option.changeHandler)) {
                option.changeHandler(elem, checked, value);
            }
        }
    };
    ui.SwitchButton = {
        rander: function (option) {
            return switchButton.createSwitchButton(option);
        },
        setChecked: function (elem, checked) {
            if (ui.core.type(elem) === "string") {
                elem = $("#" + elem);
            }
            switchButton.setChecked(elem, checked);
        },
        getChecked: function (elem) {
            if (ui.core.type(elem) === "string") {
                elem = $("#" + elem);
            }
            return switchButton.getChecked(elem);
        }
    };
    //option: id, value, checked, changeHandler: function(elem, checked)
    $.fn.switchButton = function (option) {
        if (!this || this.length == 0) {
            return this;
        }
        return this.each(function () {
            switchButton.initSwitchButton($(this), option);
        });
    };
})(jQuery);