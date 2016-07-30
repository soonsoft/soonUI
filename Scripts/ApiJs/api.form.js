;(function () {
    pageLogic.widgetData = {
    	imgUrl:"",

    	options: [
            { name: "parent", defaultValue: "null", desc: "要侧滑的父对象。", isMust: "是" },
            { name: "width", defaultValue: "null", desc: "表单编辑面板的宽度。", isMust: "是" },
        ],
        
        functionList: [
            {
                name: "showed(e)",
                desc: "显示边栏之前触发该事件。",
                params: [
                    { name: "e", type: "对象", desc: "包含一个type属性值为\"showing\"。" },
                ],
                returnValue: null
            }, {
                name: "showed(e)",
                desc: "边栏显示动画完成之后，触发该事件。",
                params: [
                    { name: "e", type: "对象", desc: "包含一个type属性值为\"showed\"。" },
                ],
                returnValue: null
            }, {
                name: "hiding(e)",
                desc: "隐藏边栏之前触发该事件。",
                params: [
                    { name: "e", type: "对象", desc: "包含一个type属性值为\"hiding\"。" },
                ],
                returnValue: null
            }, {
                name: "hided(e)",
                desc: "隐藏动画完成之后触发该事件。",
                params: [
                    { name: "e", type: "对象", desc: "包含一个type属性值为\"hided\"。" },
                ],
                returnValue: null
            },
            {
                name: "buttonAppend(elem)",
                desc: "往表单编辑面板中添加一个按钮。",
                params: [
                    { name: "elem", type: "对象", desc: "为页面元素，可以是dom对象也可以是jquery对象" }
                ],
                returnValue: null
            },
            {
                name: "append(elem)",
                desc: "往表单编辑面板中添加一个元素。",
                params: [
                    { name: "elem", type: "对象", desc: "为页面元素，可以是dom对象也可以是jquery对象" }
                ],
                returnValue: null
            },
            {
                name: "show()",
                desc: "显示边栏内容。",
                params: [],
                returnValue: null
            },
            {
                name: "hide()",
                desc: "隐藏边栏内容。",
                params: [],
                returnValue: null
            }
        ]
    };
})();