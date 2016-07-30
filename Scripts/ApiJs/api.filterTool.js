;(function () {
    pageLogic.widgetData = {
		imgUrl: "",
		options: [
			{name: "data", defaultValue: null, desc: "过滤值集合，数据格式：{ text: '', value: ''}", isMust: true},
			{name: "defaultIndex", defaultValue: "0", desc: "默认开始索引", isMust: false},
			{name: "filterCss", defaultValue: null, desc: "选择器样式", isMust: false}
		],
		events: [
			{
				name: "selected(e, item)",
				desc: "项目选中事件",
				params: [
					{name: "e", desc: "事件对象"},
                    {name: "item", desc: "选中的项目对应的数据对象"}
				],
				returnValue: null
			},
            {
				name: "deselected(e, item)",
				desc: "取消项目选择事件",
				params: [
					{name: "e", desc: "事件对象"},
                    {name: "item", desc: "选中的项目对应的数据对象"}
				],
				returnValue: null
			}
		],
		functionList: [
			{
				name: "selectFilterItem(label)",
				desc: "当前有高亮属性的label节点不是被选中节点，取消高亮属性，给被选中label节点添加高亮并弹出相关的信息",
				params: [
					{name: "label", type: "DOM元素", desc: "被选中节点"}
				],
				returnValue: null
			},
			{
				name: "setIndex(index)",
				desc: "通过索引选中节点并触发selectFilterItem函数",
				params: [
					{name: "index", type: "整数", desc: "索引"}
				],
				returnValue: null
			},
			{
				name: "setValue(value)",
				desc: "通过内容选中节点并触发selectFilterItem函数",
				params: [
					{name: "value", type: "DOM元素", desc: "label节点"}
				],
				returnValue: null
			},
			{
				name: "getCurrent()",
				desc: "获取当前有高亮属性的节点",
				params: null,
				returnValue: null
			}
		]
	};
})();