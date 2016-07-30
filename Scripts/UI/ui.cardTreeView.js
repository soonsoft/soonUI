; (function () {
    var selectedClass = "view-item-selected";

    //event type
    var pageTurning = "pageTurning",
        selecting = "selecting",
        selected = "selected",
        deselected = "deselected",
        rebind = "rebind";

    var ctrl = ui.define("ctrls.CardTreeView", {
        _getOption: function() {
            return {
                data: null,
                promptText: "没有数据",
                width: false,
                height: false,
                itemWidth: 200,
                itemHeight: 200,
                renderItem: null,
                pager: {
                    pageIndex: 1,
                    pageSize: 30,
                    pageButtonCount: 5,
                    displayDataInfo: true
                },
                selection: {
                    multiple: false
                }
            };
        },
        _getEvents: function() {
            return [pageTurning, selecting, selected, deselected, rebind];
        },
        _create: function() {
            
        },
        _init: function() {
            if (!this.element) {
                return;
            }
        }
    });

    $.fn.setFlowView = function (option) {
        if (this.length == 0) {
            return null;
        }
        return ctrl(option, this);
    };
})();