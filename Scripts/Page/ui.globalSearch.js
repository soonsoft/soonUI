; (function (mp) {
    var GlobalSearch = ui.define("ctrls.GlobalSearch", {
        _getCreateOption: function() {
            return {
                active: null,
                search: null,
                cancel: null,
                searchWords: null
            };
        },
        _create: function() {
            this.activeButton = ui.getJQueryElement(this.option.active);
            this.searchButton = ui.getJQueryElement(this.option.search);
            this.cancelButton = ui.getJQueryElement(this.option.cancel);
            this.searchWordsText = ui.getJQueryElement(this.option.searchWords);
        },
        _init: function() {
            var that = this;
            if(!this.activeButton) {
                ui.error("没有在headerCtrls节点下放置全局搜索按钮");
            }
            this.extender = this.activeButton.parent().children(".extender");
            this.extender.addClass("title-color");
            
            this.activeButton.click(function(e) {
                that.searchPanelShow();
            });
            this.searchButton.click(function(e) {
                that.doSearch();
            });
            this.cancelButton.click(function(e) {
                that.searchPanelHide();
            });
        },
        searchPanelShow: function() {
            this.extender.addClass("extender-show");
            this.searchWordsText.focus();
        },
        searchPanelHide: function() {
            this.extender.removeClass("extender-show");
            this.searchWordsText.val("");
        },
        doSearch: function() {
            var text = this.searchWordsText.val();
            if(text.length > 0) {
                ui.msgshow(text);
            }
        }
    });
    
    mp.headerCtrlInitial("search", function() {
        mp.globalSearch = GlobalSearch({
            active: "search",
            search: "doSearch",
            cancel: "searchCancel",
            searchWords: "searchWords"
        });
    });
})(masterpage);