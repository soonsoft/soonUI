;(function () {
    pageLogic.widgetData = {
    	imgUrl: "/tabPanel.png",
        options: [
            { name: "tabPanelId", defaultValue: "空字符串", desc: "选项卡控制器对应页面元素的ID, 一般为UL的Id", isMust: "是" },
            { name: "bodyPanelId", defaultValue: "空字符串", desc: "内容项对应页面元素的ID", isMust: "是" },
            { name: "direction", defaultValue: "horizontal", desc: "滑动方向，水平“horizontal” ,垂直“vertical”。", isMust: "否" },
            { name: "duration", defaultValue: "800", desc: "切换时动画的时长,单位毫秒。", isMust: "否" }
        ],
        events: [
            {
                name: "changing(e, index)",
                desc: "切换事件，用鼠标点击选项卡的时候触发该事件。。",
                params: [
                    { name: "e", type: "对象", desc: "包含一个type属性值为\"changing\"。" },
                    { name: "index", type: "数值", desc: "当前切换的选项卡的索引。" }
                ],
                returnValue: null
            },
            {
                name: "changed(e, index)",
                desc: "切换完成事件，选项卡切换完成(动画完成之后)触发该事件。",
                params: [
                    { name: "e", type: "对象", desc: "包含一个type属性值为\"changed\"。" },
                    { name: "index", type: "数值", desc: "当前切换的选项卡的索引。" }
                ],
                returnValue: null
            }
        ],
        functionList: [
            {
                name: "setBodiesLocation(width, height)",
                desc: "设置内容项的大小。",
                params: [
                    { name: "width", type: "数组", desc: "宽度，代表像素，不需要加px。" },
                    { name: "height", type: "数组", desc: "高度，代表像素，不需要加px。" }

                ],
                returnValue: null
            },
            {
                name: "restore(animation)",
                desc: "恢复动画设置，在布局计算时必须调用，是调整tab窗口时的固定写法。",
                params: [{ name: "animation", type: "对象", desc: "动画" }],
                returnValue: null
            },
            {
                name: "setIndex(index, animation)",
                desc: "设置页面切换到传入索引对应的tab页。",
                params: [
                    { name: "index", type: "数值", desc: "选项卡的索引" },
                    { name: "animation", type: "布尔值", desc: "切换页面时是否需要动画"}
                ],
                returnValue: null
            },
            {
                name: "getSelectedIndex(curr)",
                desc: "获取当前选择的选项卡的索引。",
                params: [{ name: "curr", type: "对象", desc: "当前选择的选项卡对象。" }],
                returnValue: "当前选择的选项卡索引"
            },
            {
                name: "horizontalScroll(val)",
                desc: "水平滚动。",
                params: [{ name: "val", type: "数值", desc: "表示页面body部分的整个宽度。" }],
                returnValue: null
            },
            {
                name: "horizontalShow(index)",
                desc: "水平显示多个页面。",
                params: [{ name: "index", type: "数值", desc: "页面索引。" }],
                returnValue: "this.animator.start();初始化动画"
            },
            {
                name: "verticalScroll(val)",
                desc: "垂直滚动。",
                params: [{ name: "val", type: "数值", desc: "表示页面body部分的整个高度。" }],
                returnValue: null
            },
            {
                name: "verticalShow(index)",
                desc: "垂直显示多个页面。",
                params: [{ name: "index", type: "数值", desc: "页面索引。" }],
                returnValue: "this.animator.start();初始化动画"
            },
            {
                name: "bodySet(index)",
                desc: "设置页面宽度或者高度。",
                params: [{ name: "index", type: "数值", desc: "页面索引。" }],
                returnValue: "页面宽度或者高度"
            },
            {
                name: "setBodyHeight(height)",
                desc: "设置body页面高度。",
                params: [{ name: "height", type: "数组", desc: "高度，代表像素，不需要加px。" }],
                returnValue: null
            }
        ]

    };
})();