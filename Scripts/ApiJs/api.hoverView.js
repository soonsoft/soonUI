;(function () {
    pageLogic.widgetData = {
		imgUrl: "",
		options: [
			{ name: "width", defaultValue: "160", desc: "宽度", isMust: false},
			{ name: "height", defaultValue: "160", desc: "高度", isMust: false}
		],
		events: [
			{
				name: "doDocumentMousemove(e)",
				desc: "当鼠标移出view或target，veiw的不透明度逐渐变小，距离越远不透明度越小，当小于0.2时view消失",
				params: [
					{name: "e", type: "DOM元素", desc: "事件"}
				],
				returnValue: null
			}
		],
		functionList: [
			{
				name: "empty()",
				desc: "清除节点所有内容",
				params: null,
				returnValue: "返回当前对象"
			},
			{
				name: "append(elem)",
				desc: "给当前节点添加子节点",
				params: [
					{name: "elem", type: "DOM元素", desc: "节点"}
				],
				returnValue: "返回当前对象"
			},
			{
				name: "addDocMousemove()",
				desc: "给窗口添加mousemove事件处理程序",
				params: null,
				returnValue: null
			},
			{
				name: "removeDocMousemove()",
				desc: "移除窗口的mousemove事件处理程序",
				params: null,
				returnValue: null
			},
			{
				name: "setLocation()",
				desc: "定位目标节点",
				params: null,
				returnValue: null
			},
			{
				name: "getLocation()",
				desc: "获取目标节点的左上角位置",
				params: null,
				returnValue: "返回目标节点的左上角坐标"
			},
			{
				name: "show(target)",
				desc: "弹出view显示目标节点的相关信息",
				params: [
					{name: "target", type: "DOM对象", desc: "目标节点"}
				],
				returnValue: null
			},
			{
				name: "hide(complete)",
				desc: "隐藏view",
				params: [
					{name: "complete", type: "", desc: "该参数未被使用"}
				],
				returnValue: null
			}
		]

	};
})();