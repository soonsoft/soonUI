;(function () {
    pageLogic.widgetData = {	imgUrl: "/groupList.png",
    	options: [
            { name: "groupField", defaultValue: "空字符串", desc: "对应列表项的组名在对应数据源中的字段名。", isMust: "否" },
            { name: "h1Field", defaultValue: "空字符串", desc: "对应列表项的一级标题在对应数据源中的字段名。", isMust: "否" },
            { name: "h2Field", defaultValue: "空字符串", desc: "对应列表项的二级标题在对应数据源中的字段名。", isMust: "否" },
            { name: "fillItem", defaultValue: false, desc: "格式化每一项的显示方法接口，可以自定义方法来表现每一项的显示方式。", isMust: "否" },
            { name: "data", defaultValue: null, desc: "数据源，数据格式应该为数组，数组包含对象。", isMust: "是" },
            { name: "multiple", defaultValue: false, desc: "是否需要多选功能。", isMust: "否" },
            { name: "pageIndex", defaultValue: null, desc: "起始的页号。", isMust: "否" },
            { name: "pageSize", defaultValue: null, desc: "每页数据的显示数目。", isMust: "否" },
            { name: "itemFormat", defaultValue: null, desc: "格式化文本方法接口，可以自定义方法来表现页面的文本。", isMust: "否" },
            { name: "titleFixed", defaultValue: false, desc: "当前分组分组的标题是否一直悬停在顶端。", isMust: "否" }
        ],
        events: [
            {
                name: "selecting(event, element, data)",
                desc: "选择事件。",
                params: [
                    { name: "event", type: "对象", desc: "包含一个type属性值为\"selecting\"。" },
                    { name: "element", type: "对象", desc: "为一个HTML对象，该对象是选中的对象。" },
                    { name: "data", type: "对象", desc: "包含一个index属性和一个itemData对象，itemData对象包含数据。" }
                ],
                returnValue: null
            },
            {
                name: "selected(event, element, data)",
                desc: "选中事件。",
                params: [
                    { name: "event", type: "对象", desc: "包含一个type属性值为\"selected\"。" },
                    { name: "element", type: "对象", desc: "为一个HTML对象，该对象是选中的对象。" },
                    { name: "data", type: "对象", desc: "包含一个index属性和一个itemData对象，itemData对象包含数据。" }
                ],
                returnValue: null
            },
            {
                name: "deselected(event, element, data)",
                desc: "取消选择事件。",
                params: [
                    { name: "event", type: "对象", desc: "包含一个type属性值为\"deselected\"。" },
                    { name: "element", type: "对象", desc: "为一个HTML对象，该对象是取消选中的对象。" },
                    { name: "data", type: "对象", desc: "包含一个index属性和一个itemData对象，itemData对象包含数据。" }
                ],
                returnValue: null
            },
            {
                name: "rebind(e)",
                desc: "重新绑定事件。",
                params: [{ name: "e", type: "对象", desc: "包含一个type属性值为\"rebind\"。" },],
                returnValue: null
            }
        ],
        functionList: [
            {
                name: "selectItem(li)",
                desc: "选择指定项。",
                params: [{ name: "li", type: "对象", desc: "选择的jquery对象。" }],
                returnValue: null
            },
            {
                name: "singleSelection(elem, data)",
                desc: "单项选择。",
                params: [
                    { name: "elem", type: "对象", desc: "选择的jquery对象。" },
                    { name: "data", type: "对象", desc: "选择的对象中的数据。" }
                ],
                returnValue: null
            },
            {
                name: "multipleSelection(elem, data)",
                desc: "多项选择。",
                params: [
                    { name: "elem", type: "对象", desc: "选择的jquery对象。" },
                    { name: "data", type: "对象", desc: "选择的对象中的数据。" }
                ],
                returnValue: null
            },
            {
                name: "getCurrentSelection()",
                desc: "获取当前选择项的数据，当groupList设置为单选才可以使用。",
                params: [],
                returnValue: "data;表示返回一个对象，该对象包含当前选中行的itemData对象（该行的所有数据）和index。"
            },
            {
                name: "getMultipleSelection()",
                desc: "获取当前多选项中的数据，当groupList设置为多选才可以使用。",
                params: [],
                returnValue: "data;表示数组，里面包含所有选中的对象。对象包含当前选中行的itemData对象（该行的所有数据）和index。"
            },
            {
                name: "cancelSelection()",
                desc: "取消当前的选中项。",
                params: [],
                returnValue: null
            },
            {
                name: "setHeight(height)",
                desc: "设置groupList内容显示区域的高度。常用于布局计算layout中设置groupList的高度。",
                params: [{ name: "height", type: "数值", desc: "高度，代表像素，不需要加px。" }],
                returnValue: null
            },
            {
                name: "groupData(data, groupField)",
                desc: "为某一组填充数据。",
                params: [
                    { name: "data", type: "数组", desc: "数组中填充数据，数据结构根据option中的定义。" },
                    { name: "groupField", type: "字符串", desc: "分组的对象名。" }
                ],
                returnValue: "groupData;表示列表的数组对象"
            },
            {
                name: "setData(data, rowCount)",
                desc: "为整个控件加载数据。",
                params: [
                    { name: "data", type: "数组", desc: "数组中填充数据，数据结构根据option中的定义。" },
                    { name: "rowCount", type: "数值", desc: "数据记录的数目。" }
                ],
                returnValue: null
            },
            {
                name: "empty()",
                desc: "清空所有数据，并更新分页按钮状态。",
                params: [],
                returnValue: null
            }
        ]
    };
})();