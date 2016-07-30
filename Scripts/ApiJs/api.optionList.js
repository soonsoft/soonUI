;(function () {
    pageLogic.widgetData = {
		imgUrl: "",
		options: [
			{ name: "data", defaultValue: null, desc: "表数据", isMust: true},
			{ name: "onCreateItemHandler", defaultValue: null, desc: "在Option创建时调用的方法", isMust: false},
			{ name: "hasRemoveButton", defaultValue: "true", desc: "是否有删除按钮", isMust: false}
		],
		events: null,
		functionList: [
			{
				name: "setData(data)",
				desc: "生成Option的数据集",
				params: [
					{name: "data", type: "数组", desc: "用于生成Option的数据集"}
				],
				returnValue: null
			},
			{
				name: "empty()",
				desc: "清空Option的数据集",
				params: null,
				returnValue: null
			},
			{
				name: "getCurrentData()",
				desc: "获取当前单元数据",
				params: null,
				returnValue: "返回当前单元数据"
			},
			{
				name: "getData(index)",
				desc: "通过索引获取单元数据",
				params: [
					{name: "index", type: "整数", desc: "索引"}
				],
				returnValue: "返回索引对应单元的数据"
			},
			{
				name: "getCurrentIndex()",
				desc: "获取当前数据单元的索引值",
				params: null,
				returnValue: "返回当前单元的索引值"
			},
			{
				name: "selectItemByIndex(index)",
				desc: "通过索引选中数据单元",
				params: [
					{name: "index", type: "整数", desc: "索引"}
				],
				returnValue: null
			},
			{
				name: "addItem(item)",
				desc: "向Option结尾追加数据单元",
				params: [
					{name: "item", type: "自定义数据", desc: "用于追加的单元数据"}
				],
				returnValue: null
			},
			{
				name: "insertItemByIndex(index, item)",
				desc: "根据索引向Option中定点添加数据单元，如果索引值<0或>=dataList.length，则向Option结尾追加数据单元",
				params: [
					{name: "index", type: "整数", desc: "索引"},
					{name: "item", type: "自定义数据", desc: "用于追加的单元数据"}
				],
				returnValue: null
			},
			{
				name: "updateItemByIndex(index, item)",
				desc: "更新索引对应的单元数据",
				params: [
					{name: "index", type: "整数", desc: "索引"},
					{name: "item", type: "自定义数据", desc: "用于更新的单元数据"}
				],
				returnValue: null
			},
			{
				name: "removeItemByIndex(index, animation)",
				desc: "删除索引对应的单元数据",
				params: [
					{name: "index", type: "整数", desc: "索引"},
					{name: "animation", type: "Boolean", desc: "是否重新调整样式"}
				],
				returnValue: null
			},
			{
				name: "cancelSelection()",
				desc: "取消选择",
				params: null,
				returnValue: null
			}
		]

	};
})();