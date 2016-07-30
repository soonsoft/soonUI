;(function () {
    var data = pageLogic.widgetData = {
    	options: [
            { name: "title", defaultValue: "空字符串", desc: "弹出窗的标题。", isMust: "否" },
            { name: "show", defaultValue: "up", desc: "弹出窗出现时滑动的方向。", isMust: "否" },
            { name: "hide", defaultValue: "down", desc: "弹出窗点击关闭时滑动的方向。", isMust: "否" },
            { name: "done", defaultValue: "up", desc: "弹出窗点击提交时滑动的方向。", isMust: "否" },
            { name: "src", defaultValue: null, desc: "Url弹出窗口的url", isMust: "否" },
            { name: "width", defaultValue: "640", desc: "弹出窗的宽度。", isMust: "否" },
            { name: "height", defaultValue: "480", desc: "弹出窗的高度。", isMust: "否" },
            { name: "hasMask", defaultValue: "true", desc: "弹出窗显示时,主窗口是否有遮罩。", isMust: "否" },
            { name: "windowStyle", defaultValue: null, desc: "弹出窗的样式。", isMust: "否" },
            { name: "titleHeight", defaultValue: "48", desc: "弹出窗中的标题面板距离弹出窗口主题内容的高度。", isMust: "否" },
            { name: "ctrlHeight", defaultValue: "48", desc: "弹出窗中底部控制层面板距离弹出窗口主题内容的高度。", isMust: "否" },
            { name: "isRespond", defaultValue: "true", desc: "是否为响应式。", isMust: "否" },
            { name: "resizeable", defaultValue: "false", desc: "是否可以调整窗体大小。", isMust: "否" },
            { name: "draggable", defaultValue: "false", desc: "是否可以拖拽。", isMust: "否" },
            { name: "closeButtonStyle", defaultValue: "close-button font-highlight-hover", desc: "弹出窗关闭按钮的样式。", isMust: "否" }
        ],
        functionList: [
            {
                name:"putWindow(option)",
                desc: "创建普通弹出窗口。",
                params: [
                    { name: "option", type: "对象", desc:"设置普通弹出窗口各个属性对象的值"}
                ],
                returnValue: null
            },
            {
                name: "ui.win.createUrlWindow(option)",
                    desc: "创建Url弹出窗。",
                params: [
                    { name: "option", type: "对象", desc: "设置url弹出窗口各个属性对象的值。" }
                ],
                returnValue: null
            },
            {
                name: "ui.win.setShowStyle(name, func)",
                desc: "设置弹出窗口显示时的样式。",
                params: [
                    { name: "name", type: "字符串", desc: "显示样式名。" },
                    { name: "func", type: "方法", desc: "显示时调用的方法。" }
                ],
                returnValue: null
            },
            {
                name: "ui.win.setHideStyle",
                desc: "设置弹出窗口隐藏时的样式。",
                params: [
                    { name: "name", type: "字符串", desc: "关闭样式名。" },
                    { name: "func", type: "方法", desc: "关闭时调用的方法。" }
                ],
                returnValue: null
            },

            {
                name: "buttonAppend(elem)",
                desc: "为弹出窗口底部添加控制按钮。",
                params: [
                    { name: "elem", type: "字符串或者对象", desc: "按钮的id值或者按钮对象。" }
                ],
                returnValue: "窗口对象"
            },
            {
                name: "setTitle(title, hasHr, style)",
                desc: "设置弹出窗的标题。",
                params: [
                    { name: "title", type: "字符串或者对象", desc: "标题的内容，可以是字符串或者DOM对象或者JQuery对象。" },
                    { name: "hasHr", type: "布尔", desc: "判断标题下方是否需要一个水平线来与内容区域分隔。" },
                    { name: "style", type: "数组或者css对象", desc: "标题的样式，可以是CSS类名的数组或者CSS对象。" }
                ],
                returnValue: null
            },
            {
                name: "setSizeLocation(newWidth, newHeight, parentWidth, parentHeight)",
                desc: "设置弹出窗的大小与位置。",
                params: [
                    { name: "newWidth", type: "数值", desc: "弹出窗的宽度。" },
                    { name: "newHeight", type: "数值", desc: "弹出窗的高度。" },
                    { name: "parentWidth", type: "数值", desc: "弹出窗父容器的宽度。" },
                    { name: "parentHeight", type: "数值", desc: "弹出窗父容器的高度。" }
                ],
                returnValue: null
            },
            {
                name: "show()",
                desc: "显示弹出窗。",
                params: [],
                returnValue: null
            },
            {
                name: "hide()",
                desc: "隐藏弹出窗。",
                params: [],
                returnValue: null
            },
            {
                name: "done()",
                desc: "窗口操作完成后的隐藏窗口",
                params: [],
                returnValue: null
            },
            {
                name: "getCurrentLocation()",
                desc: "获取弹出窗口在当前视口的相对偏移",
                params: [],
                returnValue: "一个位置对象，该对象包括弹出窗口left属性和top属性."
            },
            {
                name: "openMask()",
                desc: "打开弹出窗的遮罩。",
                params: [],
                returnValue: null
            },
            {
                name: "closeMask()",
                desc: "关闭弹出窗的遮罩。",
                params: [],
                returnValue: null
            }
        ]
    };
})();