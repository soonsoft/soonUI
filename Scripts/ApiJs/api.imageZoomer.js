;(function () {
    pageLogic.widgetData = {
		imgUrl: "",
		options: [
			{ name: "parentContent", defaultValue: "$(document.body)", desc: "父级节点", isMust: false}
		],
		events: null,
		functionList: [
			{
				name: "show(target)",
				desc: "放大图片聚焦区域",
				params: [
					{name: "target", type: "自定义对象", desc: "图片需要放大部分的相关信息"}
				],
				returnValue: null
			},
			{
				name: "hide(complete)",
				desc: "隐藏当前放大的图片部分",
				params: [
					{name: "", type: "", desc: "该参数未被使用"}
				],
				returnValue: null
			},
			{
				name: "resizeZoomImage()",
				desc: "重置需要局部放大的图片部分的相关信息",
				params: null,
				returnValue: null
			}
		]
	};
})();