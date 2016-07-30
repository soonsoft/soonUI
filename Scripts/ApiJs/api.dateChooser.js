;(function () {
    pageLogic.widgetData = {
		imgUrl: "/dateChooser.png",
		options: [
			{ name: "dateFormat", defaultValue: "yyyy-MM-dd", desc: "日期时间显示的格式。", isMust: false },
			{ name: "language", defaultValue: "zh-CN", desc: "显示的语言。zh-CN为简体中文，en-US为英文", isMust: false },
			{ name: "calendarPanel", defaultValue: null, desc: "日历选择面板。", isMust: false },
			{ name: "isDateTime", defaultValue: false, desc: "是否可以选择时间。", isMust: false }
		],
		events: null,
		functionList: [
			{
				name: "selectedDate(date)",
				desc: "设置选中的日期。",
				params: [
					{ name: "date", type: "对象", desc: "日期对象。" }
				],
				returnValue: null
			},
			{
				name: "cancelSelection()",
				desc: "取消当前选中的日期。",
				params: [],
				returnValue: null
			},
			{
				name: "show()",
				desc: "显示日历选择面板。",
				params: [],
				returnValue: null
			}
		]
	};
})();