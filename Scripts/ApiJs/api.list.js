;(function () {
    pageLogic.widgetData = {
	   imgUrl: "/list.png",
    	options: [
            { name: "multiple", defaultValue: false, desc: "是否需要多选功能。", isMust: "否"},
            { name: "valueField", defaultValue: null, desc: "对应列表项的值在对应数据源中的字段名。", isMust: "是"},
            { name: "textField", defaultValue: null, desc: "列表中文本在对应数据源中的字段名。", isMust: "是"},
            { name: "width", defaultValue: null, desc: "列表的宽度。不设置时默认宽度为100px", isMust: "否"},
            {
                name: "data", defaultValue: null, desc: "数据源，数据格式应该为数组，数组可以包含对象，也可以单纯只是字符串，当数据源为字符串数组的时候，valueField和textField是无效的。", isMust: "否"
            },
            { name: "dispalyCount", defaultValue: null, desc: "显示数目。", isMust: "否"},
            { name: "formatText", defaultValue: null, desc: "格式化文本方法接口，可以自定义方法来表现页面的文本。", isMust: "否"}
        ],
        events: [
            {
                name: "selecting(event, element, data)",
                desc: "选择事件，类似于鼠标的click事件。",
                params: [
                    { name: "event", type: "对象", desc: "包含一个type属性值为\"selecting\"。"},
                    { name: "element", type: "对象", desc: "为一个HTML对象，该对象是鼠标点击的对象。"},
                    {
                        name: "data",
                        type: "对象",
                        desc: "包含一个index属性和一个itemData对象，itemData对象包含一些数据，数据结构是由数据源传递进来的数据决定。"
                    }
                ],
                returnValue: null
            },
            {
                name: "selected(event, element, data)",
                desc: "选中事件，在选中元素之后触发该事件。",
                params: [
                    { name: "event", type: "对象", desc: "包含一个type属性值为\"selected\"。"},
                    { name: "element", type: "对象", desc: "为一个HTML对象，该对象是选中的对象。"},
                    {
                        name: "data",
                        type: "对象",
                        desc: "包含一个index属性和一个itemData对象，itemData对象包含一些数据，数据结构是由数据源传递进来的数据决定。"
                    }
                ],
                returnValue: null
            },
            {
                name: "deselected(event, element, data)",
                desc: "取消选中事件，在取消选中之后触发该事件。",
                params: [
                    { name: "event", type: "对象", desc: "包含一个type属性值为\"deselected\"。"},
                    { name: "element", type: "对象", desc: "为一个HTML对象，该对象是取消选中的对象。"},
                    {
                        name: "data",
                        type: "对象",
                        desc: "包含一个index属性和一个itemData对象，itemData对象包含一些数据，数据结构是由数据源传递进来的数据决定。"
                    }
                ],
                returnValue: null
            },
            {
                name: "canceled(event)",
                desc: "取消选中事件，在调用setSelection和cancelSelection方法之后触发该事件。",
                params: [{name: "event", type: "对象", desc: "包含一个type属性值为\"canceled\"。"}],
                returnValue: null
            }
        ],
        functionList: [
            {
                name: "add(item)",
                desc: "在最后一行追加数据。",
                params: [{name: "item", type: "对象", desc: "为包括valueField和textField字段的对象。"}],
                returnValue: null
            },
            {
                name: "remove(item)",
                desc: "移除数据。通常先用getSelection方法获取选中的对象，然后得到itemData对应的数据，将itemData作为参数传递给remove方法。",
                params: [{name: "item", type: "对象", desc: "为包括valueField和textField字段的对象。"}],
                returnValue: null
            },
            {
                name: "removeAt(index)",
                desc: "根据索引移除数据。通常先用getSelection方法获取选中的对象，然后得到对应的index，将index作为参数传递给removeAt方法。",
                params: [{name: "index", type: "数值", desc: "数据的索引。"}],
                returnValue: null
            },
            {
                name: "insert(item, index)",
                desc: "将数据插入到指定的位置。",
                params: [
                    {name: "item", type: "对象", desc: "要插入的数据。"},
                    {name: "index", type: "数值", desc: "要插入的索引位置。"}
                ],
                returnValue: null
            },
            {
                name: "clear()",
                desc: "清空数据，包含：list.html,dataList,current,selectList。",
                params: [],
                returnValue: null
            },
            {
                name: "moveUp(item)",
                desc: "上移list里面的记录。通常用getSelection方法获取选中的对象，然后获取itemData或者index，将其传入moveUp方法。",
                params: [{ name: "item", type: "数值或者对象", desc: "可以是索引，也可以是数据对象。"}],
                returnValue: null
            },
            {
                name: "moveDown(item)",
                desc: "下移list里面的记录。通常用getSelection方法获取选中的对象，然后获取itemData或者index，将其传入moveDown方法。",
                params: [{ name: "item", type: "数值或者对象", desc: "可以是索引，也可以是数据对象。"}],
                returnValue: null
            },
            {
                name: "moveTo(item, index)",
                desc: "将记录移动到指定索引的位置。通常用getSelection方法获取选中的对象，然后获取itemData或者index，将其传入moveTo方法。",
                params: [
                    { name: "item", type: "数值或者对象", desc: "可以是索引，也可以是数据对象。"},
                    { name: "index", type: "数值", desc: "要移动到的索引。"}
                ],
                returnValue: null
            },
            {
                name: "get(index)",
                desc: "获取对应索引的数据。通常用getSelection方法获取选中的对象，然后获取index，将其传入get方法。",
                params: [{ name: "index", type: "数值", desc: "索引。"}],
                returnValue: "对应索引的数据"
            },
            {
                name: "getAll()",
                desc: "获取list中所有的数据。",
                params: [],
                returnValue: "data;表示list中所有数据组成的数组"
            },
            {
                name: "count()",
                desc: "获取所有数据的条数。",
                params: [],
                returnValue: "this.dataList.length;表示所有数据的条数"
            },
            {
                name: "sort(func)",
                desc: "获取对应索引的数据将其排序。",
                params: [{ name: "func", type: "方法", desc: "是对sort方法的重写，也可以不穿参数，将调用默认的排序，为文本排序。"}],
                returnValue: null
            },
            {
                name: "reverse()",
                desc: "颠倒当前数据的顺序。",
                params: [],
                returnValue: null
            },
            {
                name: "getText(item, index)",
                desc: "默认的文本样式。formatText默认调用该方法，重写此方法可以对文本样式就行修改。",
                params: [
                    { name: "item", type: "对象", desc: "包含数据。"},
                    { name: "index", type: "数值", desc: "索引。"}
                ],
                returnValue: "content, 表示span的Jquery对象"
            },
            {
                name: "getSelection(index)",
                desc: "获取选中的对象",
                params: [],
                returnValue: "data, 当前选中的对象"
            },
            {
                name: "setSelection(index)",
                desc: "设置选中对象, 会触发canceled事件。",
                params: [{ name: "index", type: "数值", desc: "索引。"}],
                returnValue: null
            },
            {
                name: "cancelSelection()",
                desc: "取消选中的对象, 会触发canceled事件。",
                params: [],
                returnValue: null
            },
            {
                name: "setHeight(height)",
                desc: "设置list的高度。",
                params: [{ name: "height", type: "数值", desc: "要设置的高度。"}],
                returnValue: null
            }
        ]
    };
})();