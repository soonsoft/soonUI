; (function (mp) {
    var NotifyCenter = ui.define("ctrls.NotifyCenter", {
        _getCreateOption: function() {
            return {
                active: null
            };
        },
        _create: function() {
            this.openNotify = ui.getJQueryElement(this.option.openNotify);
            this.closeNotify = ui.getJQueryElement(this.option.closeNotify);
            this.notifyPanel = null;
        },
        _init: function() {
            var that = this;
            this.notifyPanel = $("<section class='notify-panel' />");
            $(document.body).append(this. notifyPanel);
            
            this.extender = this.openNotify.parent().children(".extender");
            this.extender.addClass("title-color");
            
            this.openNotify.click(function(e) {
                that.open();
            });
            this.closeNotify.click(function(e) {
                that.close();
            });
        },
        addNotice: function() {
        },
        isOpen: function() {
            return this.notifyPanel.css("display") === "block";
        },
        open: function() {
            this.notifyPanel.css({
                "height": mp.contentBodyHeight + "px",
                "display": "block"
            });
            this.extender.addClass("extender-show");
            
            if(!ui.isMaskOpened()) {
                ui.openMask("body");
            }
        },
        close: function() {
            this.notifyPanel.css("display", "none");
            this.extender.removeClass("extender-show");
            ui.closeMask();
        }
    });
    
    mp.headerCtrlInitial("notify", function() {
        mp.notifyCenter = NotifyCenter({
            openNotify: "openNotify",
            closeNotify: "closeNotify"
        });
    });
})(masterpage);