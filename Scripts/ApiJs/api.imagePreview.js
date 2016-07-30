;(function () {
    pageLogic.widgetData = {
		imgUrl: "",
		options: [
			{name: "chooserButtonSize", defaultValue: "16", desc: "选择按钮的大小", isMust: false},
			{name: "imageMargin", defaultValue: "10", desc: "图片外边距", isMust: false},
			{name: "direction", defaultValue: "horizontal", desc: "预览图片的排列方式", isMust: false}
		],
		events: null,
		functionList: [
			{
				name: "selectItem(index)",
				desc: "给选中的图片添加高亮属性，如果该图片已经被选中，则去掉高亮属性。",
				params: [
					{name: "index", type: "整数", desc: "图片索引"}
				],
				returnValue: null
			},
			{
				name: "empty()",
				desc: "清空所有预览图片",
				params: null,
				returnValue: null
			},
			{
				name: "setImages(images)",
				desc: "填充预览图片集",
				params: [
					{name: "images", type: "数组", desc: "图片地址集"}
				],
				returnValue: null
			},
			{
				name: "beforeItems()",
				desc: "移动前找到当前预览图片和将要移动到的图片",
				params: null,
				returnValue: null
			},
			{
				name: "afterItems()",
				desc: "移动之后找到当前预览图片的下一张图片地址",
				params: null,
				returnValue: null
			}
		]
	};
})();