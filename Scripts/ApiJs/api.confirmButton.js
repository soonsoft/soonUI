;(function () {
	pageLogic.widgetData = {
		imgUrl: "",
		options: [
			{name: "disabled", defaultValue: "false", desc: "是否可用", isMust: false},
			{name: "readonly", defaultValue: "false", desc: "是否只读", isMust: false},
			{name: "backTime", defaultValue: "5000", desc: "返回时间（单位：毫秒）", isMust: false},
			{name: "checkHandler", defaultValue: null, desc: "校验函数", isMust: false},
			{name: "handler", defaultValue: null, desc: "显示方式", isMust: false},
			{name: "color", defaultValue: null, desc: "字体颜色", isMust: false},
			{name: "backgroundColor", defaultValue: null, desc: "背景色", isMust: false}
		],
		events: [
			{
				name: "doClick(e)",
				desc: "点击时删除按钮和确定按钮相互切换,如果切换后是确定按钮并且返回时间内没有动作，则回退成删除按钮",
				params: [
					{name: "e", type: "DOM对象", desc: "该参数未被使用"}
				],
				returnValue: null
			}
		],
		functionList: [
			{
				name: "back()",
				desc: "显示删除按钮",
				params: null,
				returnValue: null
			},
			{
				name: "next(state)",
				desc: "删除按钮和确定按钮相互切换",
				params: [
					{name: "state", type: "整数", desc: "索引"}
				],
				returnValue: null
			},
			{
				name: "disabled()",
				desc: "返回控件的disabled 属性或禁用 input 元素",
				params: null,
				returnValue: "如果没有参数则返回该控件的disabled 属性"
			},
			{
				name: "readonly()",
				desc: "返回控件的readonly 属性或把输入字段设置为只读",
				params: null,
				returnValue: "如果没有参数则返回控件的readonly 属性"
			}
		]
	};
})();