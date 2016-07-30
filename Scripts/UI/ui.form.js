; (function () {
    var bgColor = ui.theme.highlight.background,
        fontColor = ui.theme.highlight.font;

    /// form 表单元素
    var radioChecked = "input-radio-checked";

    var normalCheckboxLabel = "<label class='input-checkbox' />",
        checkedCheckboxLabel = "<label class='input-checkbox input-checkbox-checked' />",
        normalRadioLabel = "<label class='input-radio' />",
        checkedRadioLabel = "<label class='input-radio input-radio-checked' />";

    //checkbox
    var checkButton = function () {
    };
    checkButton.prototype = {
        warpCheckBox: function (cbx) {
            if (cbx.prop("checked")) {
                cbx.wrap(checkedCheckboxLabel);
            } else {
                cbx.wrap(normalCheckboxLabel);
            }

            cbx.change($.proxy(this.changeHandler, this));
        },
        changeHandler: function (e) {
            var checkbox = $(e.target);
            this.setCheckedChange(checkbox);
        },
        setCheckedChange: function (checkbox) {
            var label = checkbox.parent();
            if (checkbox.prop("checked")) {
                label.addClass("input-checkbox-checked");
            } else {
                label.removeClass("input-checkbox-checked");
            }
        }
    };

    //rediobutton
    var defaultRadioName = "undefined";
    var radioButton = function () {
        this.radios = {};
    };
    radioButton.prototype = {
        warpRadioButton: function (rdo) {
            var name = rdo.prop("name");
            if (!name || name.length == 0) {
                name = defaultRadioName;
            }
            var arr;
            if (this.radios.hasOwnProperty(name)) {
                arr = this.radios[name];
            } else {
                arr = [];
                this.radios[name] = arr;
            }
            if (rdo.prop("checked")) {
                rdo.wrap(checkedRadioLabel);
                this.currentRadio = rdo;
            } else {
                rdo.wrap(normalRadioLabel);
            }
            arr.push(rdo);
            rdo.change($.proxy(this.changeHandler, this));
        },
        changeHandler: function (e) {
            var rdo = $(e.target);
            this.setCheckedChange(rdo);
        },
        setCheckedChange: function (rdo) {
            var name = rdo.prop("name");
            var arr, label, i = 0;
            if (!name || name.length == 0) {
                name = defaultRadioName;
            }
            arr = this.radios[name];
            for (; i < arr.length; i++) {
                label = arr[i].parent();
                if (label.hasClass(radioChecked)) {
                    label.removeClass(radioChecked);
                    break;
                }
            }

            label = rdo.parent();
            if (rdo.prop("checked")) {
                label.addClass(radioChecked);
            } else {
                label.removeClass(radioChecked);
            }
        }
    };

    var cbxBtn = new checkButton();
    var rdoBtn = new radioButton();

    $.fn.metroCheckbox = function () {
        if (this.length == 0) {
            return;
        }
        if (this.length == 1) {
            cbxBtn.warpCheckBox(this);
        } else {
            var i = 0;
            for (; i < this.length; i++) {
                cbxBtn.warpCheckBox($(this[i]));
            }
        }
        return this;
    };

    $.fn.setMCChecked = function (checked) {
        var val = this.prop("checked");
        if (val != checked) {
            this.prop("checked", !val);
            cbxBtn.setCheckedChange(this);
        }
    };

    $.fn.metroRadio = function () {
        if (this.length == 0) {
            return;
        }
        if (this.length == 1) {
            rdoBtn.warpRadioButton(this);
        } else {
            var i = 0;
            for (; i < this.length; i++) {
                rdoBtn.warpRadioButton($(this[i]));
            }
        }
        return this;
    };

    $.fn.setMRChecked = function (checked) {
        var val = this.prop("checked");
        if (val != checked) {
            this.prop("checked", !val);
            rdoBtn.setCheckedChange(this);
        }
    };

    ///表单折叠
    $.fn.foldPanel = function () {
        var dl = this;
        if (dl.length == 0)
            return;
        var dtList = dl.find("dt"),
            dt = null,
            text = "", div = null;
        for (var i = 0, l = dtList.length; i < l; i++) {
            dt = $(dtList[i]);
            dt.addClass("fold-panel-title");
            text = dt.text();
            div = $("<div class='fold-close border-highlight' />");
            if (dt.next().css("display") === "none") {
                div.addClass(bgColor).text("+");
            } else {
                div.addClass(fontColor).text("-");
            }
            dt.html("");
            dt.append(div)
                .append($("<span />").text(text).addClass(fontColor));
            dt.click(foldTitleClick);
        }
    };

    var foldTitleClick = function (e) {
        var title = $(e.target);
        if (title.prop("tagName") === "DT")
            return;
        title = title.parent();
        var btn = $(title.find("div")[0]);
        var dd = title.next();
        if (dd.css("display") === "none") {
            btn.removeClass(bgColor).addClass(fontColor).text("-");
            dd.css("display", "block");
        } else {
            btn.removeClass(fontColor).addClass(bgColor).text("+");
            dd.css("display", "none");
        }
        e.stopPropagation();
    };

    ///form 表单编辑面板
    var contentTop = 40,
        buttonTop = 0,
        buttonPanelHeight = 0;

    var contentHeight = 0;

    var ctrlPanel = ui.define("ctrls.CtrlPanel", ui.ctrls.Sidebar, {
        _create: function () {
            this._super();
            if(!this.parent) {
                ui.error("parent is not exists");
            }
            this.contentPanel = null;
            this.top = 0;
            this.left = 0;
        },
        _init: function () {
            this.titlePanel = $("<section class='ctrl-title-panel' />");
            this.contentPanel = $("<section class='ctrl-content-panel' />");
            this._super();
            
            this.panel = this._panel;
            this.panel.removeClass("sidebar-panel");
            this.panel.addClass("form-ctrl-panel");
            this.panel.append(this.titlePanel);
            this.panel.append(this.contentPanel);

            this._contentAppend(this.element);
            
            this.opacityOption = {
                target: this.panel,
                ease: ui.AnimationStyle.easeFromTo,
                onChange: function(val, elem) {
                    elem.css({
                        "filter": "Alpha(opacity=" + val + ")",
                        "opacity": val / 100
                    });
                }
            };
            this.animator.duration = 240;
        },
        setSizeLocation: function (width) {
            this._super(width);
            
            var contentMaxheight = this.height - contentTop - buttonTop - buttonPanelHeight - buttonTop;
            this.contentPanel.css({
                "max-height": contentMaxheight + "px"
            });
            if (this.buttonPanel) {
                if (contentMaxheight < contentHeight) {
                    this.buttonPanel.css("width", this.width - ui.scrollbarWidth + "px");
                } else {
                    this.buttonPanel.css("width", "100%");
                }
            }
        },
        titleAppend: function(elem) {
            this.titlePanel.append(elem);
            return this;
        },
        _contentAppend: function (elem) {
            if (ui.core.isDomObject(elem)) {
                elem = $(elem);
            } else if (!ui.core.isJQueryObject(elem)) {
                return;
            }
            contentHeight += elem.height();
            this.contentPanel.append(elem);
        },
        buttonAppend: function (elem) {
            if (ui.core.type(elem) === "string") {
                elem = $("#" + elem);
            } else if (ui.core.isDomObject(elem)) {
                elem = $(elem);
            } else if (!ui.core.isJQueryObject(elem)) {
                return;
            }
            var ctrlForm = null;
            if (!this.buttonPanel) {
                this.buttonPanel = $("<section class='ctrl-button-panel' />");
                ctrlForm = $("<div class='ctrl-form' />");
                this.buttonPanel.append(ctrlForm);
                this.panel.append(this.buttonPanel);

                buttonTop = 30;
                buttonPanelHeight = 24;
                this.setSizeLocation();
            } else {
                ctrlForm = this.buttonPanel.find(".ctrl-form");
            }
            ctrlForm.append(elem);
            return this;
        },
        show: function () {
            this.opacityOption.begin = 0;
            this.opacityOption.end = 100;
            this._super(this.opacityOption);
        },
        hide: function () {
            this.opacityOption.begin = 100;
            this.opacityOption.end = 0;
            this._super(this.opacityOption);
        }
    });

    $.fn.toCtrlPanel = function (option) {
        if (!this || this.length == 0 || this.nodeName() !== "DIV") {
            return null;
        }
        var error = new Error("parent is null");
        if (!option.parent)
            throw error;
        if (ui.core.type(option.parent) === "string") {
            option.parent = $("#" + option.parent);
            if (option.parent.length == 0) {
                throw error;
            }
        }

        return ctrlPanel(option, this);
    };

})();