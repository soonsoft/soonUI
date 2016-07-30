;(function () {
    pageLogic.widgetData = {
		imgUrl: "/selectionList.png",
		options: [
			{ name: "multiple", defaultValue: false, desc: "能否多选。", isMust: false },
			{ name: "valueField", defaultValue: null, desc: "对应下拉项的值在对应数据源中的字段名。", isMust: true },
			{ name: "textField", defaultValue: null, desc: "下拉框中文本在对应数据源中的字段名。", isMust: true },
			{ name: "width", defaultValue: null, desc: "下拉框的宽度。", isMust: false },
			{ name: "data", defaultValue: null, desc: "数据源，数据格式应该为数组。", isMust: false },
			{ name: "fillItemHandler", defaultValue: null, desc: "对填充数据进行格式化，这里可以传递方法。如果填null就调用默认的getText方法。", isMust: false }
		],
		events: [
			{
				name: "selecting(event, element, data)",
				desc: "选择事件，如果在该事件中返回false则后面的对象无法被选中。",
				params: [
					{ name: "event", type: "对象", desc: "包含一个type属性值为\"selecting\"。" },
					{ name: "element", type: "对象", desc: "为一个HTML对象，该对象是鼠标点击的对象。" },
					{ name: "data", type: "对象", desc: "包含一个index属性和一个itemData对象，itemData对象包含一些数据。" }
				],
				returnValue: null
			},
			{
				name: "selected(event, element, data)",
				desc: "选中事件，当一个元素被选中，触发该事件。当selecting事件返回false本事件失效。",
				params: [
					{ name: "event", type: "对象", desc: "包含一个type属性值为\"selected\"。" },
					{ name: "element", type: "对象", desc: "为一个HTML对象，该对象是选中的对象。" },
					{ name: "data", type: "对象", desc: "包含一个index属性和一个itemData对象，itemData对象包含一些数据。" }
				],
				returnValue: null
			},
			{
				name: "canceled(event, element, data)",
				desc: "取消选中事件，当某个或多个元素被取消选择的时候，触发该事件。",
				params: [
					{ name: "event", type: "对象", desc: "包含一个type属性值为\"canceled\"。" },
					{ name: "element", type: "对象", desc: "为一个HTML对象，该对象是取消选中的对象。" },
					{ name: "data", type: "对象", desc: "包含一个index属性和一个itemData对象，itemData对象包含一些数据。" }
				],
				returnValue: null
			}
		],
		functionList: [
			{
				name: "setData(data)",
				desc: "为下拉列表填充数据/文本。",
				params: [
					{ name: "data", type: "数组", desc: "数组里面可以放字符串，也可以放对象。注意：当data数组里面放的是字符串的时候，option里面的valueField和textField将失效。" }
				],
				returnValue: null
			},
			{
				name: "getCurrentSelection()",
				desc: "获取当前选中的对象，对象中包含数据。",
				params: [],
				returnValue: "当前选中的对象，包含valueField中和textField中的值。"
			},
			{
				name: "setCurrentSelection(value)",
				desc: "设置选中当前选中的对象。",
				params: [
					{ name: "value", type: "数值或者对象", desc: "可以是值(option中valueField绑定的数据源中对应的字段。)，也可以是包含该值的对象。" }
				],
				returnValue: null
			},
			{
				name: "getMultipleSelection()",
				desc: "获取选中状态的checkbox对应的对象。",
				params: [],
				returnValue: "数组。数组中包含所有选中的对象，每个对象中包含valueField和textField中的值。"
			},
			{
				name: "setMultipleSelection(values)",
				desc: "设置选中一系列的对象。",
				params: [
					{ name: "values", type: "数值数组或者对象数组", desc: "可以是值(option中valueField绑定的数据源中对应的字段。)组成的数组，也可以是包含该值的对象组成的数组。" }
				],
				returnValue: null
			},
			{
				name: "cancelSelection()",
				desc: "取消当前选中的内容。如果是单选直接取消选中，如果是多选，对应的checkbox的勾选状态也会被更新。",
				params: [],
				returnValue: null
			},
			{
				name: "empty()",
				desc: "清空下拉列表中的数据，并且选中的内容也会被清空。",
				params: [],
				returnValue: null
			}
		]
	};
})();	