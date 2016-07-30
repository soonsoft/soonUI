;(function () {
    pageLogic.widgetData = {
		imgUrl: "",
		options: [
			{ name: "readonly", defaultValue: "false", desc: "是否只读", isMust: false},
			{ name: "style", defaultValue: null, desc: "控件样式", isMust: false}
		],
		events: [
			{
				name: "onChange()",
				desc: "切换开关",
				params: null,
				returnValue: null
			}
		],
		functionList: [
			{
				name: "readonly()",
				desc: "返回控件的readonly 属性或把输入字段设置为只读",
				params: null,
				returnValue: "如果没有参数，返回控件的readonly 属性"
			},
			{
				name: "val()",
				desc: "返回对象值或者给对象赋值",
				params: null,
				returnValue: "如果没有参数，返回对象值"
			},
			{
				name: "checked()",
				desc: "返回是否为预选中或者设置按钮的预选中属性并触发onChange函数",
				params: null,
				returnValue: "如果没有参数，返回是否为预选中"
			}
		]
	};
})();