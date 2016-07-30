;(function () {
    pageLogic.widgetData = {
		imgUrl: "",
		options: [
			{ name: "hasSwitchButtom", defaultValue: "false", desc: "是否显示切换", isMust: false},
			{ name: "interval", defaultValue: "2000", desc: "自动切换时间（单位：毫秒）", isMust: false},
			{ name: "direction", defaultValue: "horizontal", desc: "图片列表的排列方式", isMust: false},
			{ name: "images", defaultValue: null, desc: "图片路径列表", isMust: true}
		],
		events: null,
		functionList: [
			{
				name: "setImages()",
				desc: "填充轮播图片集",
				params: null,
				returnValue: null
			},
			{
				name: "showImage(index)",
				desc: "隐藏当前展示图片，展示索引值对应的图片",
				params: [
					{name: "index", type: "整数", desc: "索引"}
				],
				returnValue: null
			},
			{
				name: "prev()",
				desc: "展示当前展示图片的前一张图片，如果没有则展示第一张图片",
				params: null,
				returnValue: null
			},
			{
				name: "next()",
				desc: "展示当前展示图片的后一张图片，如果没有则展示第一张图片",
				params: null,
				returnValue: null
			},
			{
				name: "empty()",
				desc: "清空所有轮播图片",
				params: null,
				returnValue: null
			}
		]
	};
})();