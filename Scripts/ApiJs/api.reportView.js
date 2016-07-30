;(function () {
    pageLogic.widgetData = {
    	imgUrl:"",

    	options: [
            { name: "fixedGroupColumns", defaultValue: "null", desc: "表格中的固定列头。形如[{ text: \"Col\", rowspan: 3 }, { text: \"Option\", colspan: 2, rowspan: 3 }],其中text为单元格填充的内容文本，rowspan合并行的数目，colspan合并列的数目。", isMust: "是" },
            { name: "dataGroupColumns", defaultValue: "null", desc: "表格中的数据列头。形如[{ text: \"ColumnName\", colspan: 10 }]，其中text为单元格填充的内容文本，rowspan合并行的数目，colspan合并列的数目。", isMust: "是" },
            { name: "fixedColumns", defaultValue: "空数组", desc: "表格中的固定列的数据。形如{ text: \"列名\"|function, column: \"columnName\"|Array, len: 100, align: \"center|left|right\", handler: function, sort: true|false|function }。其中text为列头显示的文本或者方法，column为需要绑定的数据或者数组，len为单元格的长度，align：单元格内容的对齐方式（居中，左对齐，右对齐），handler为调用方法，一般为ui.ColumnStyle里面的方法，如格式化时间，sort为是否排序，true为可以排序，false为不可排序，同样的也可以自定义方法。", isMust: "是" },
            { name: "dataColumns", defaultValue: "空数组", desc: "表格中的数据列的数据。形如{ text: \"列名\"|function, column: \"columnName\"|Array, len: 100, align: \"center|left|right\", handler: function, sort: true|false|function }。其中text为列头显示的文本或者方法，column为需要绑定的数据或者数组，len为单元格的长度，align：单元格内容的对齐方式（居中，左对齐，右对齐），handler为调用方法，一般为ui.ColumnStyle里面的方法，如格式化时间，sort为是否排序，true为可以排序，false为不可排序，同样的也可以自定义方法。", isMust: "是" },
            { name: "dataTable", defaultValue: "null", desc: "reportView的数据源。", isMust: "否" },
            { name: "promptText", defaultValue: "\"没有数据\"", desc: "没有数据时所显示的文本。", isMust: "是" },
            { name: "reportId", defaultValue: "null", desc: "reportView父容器的Id。", isMust: "否" },
            { name: "height", defaultValue: "false", desc: "reportView的高度。", isMust: "否" },
            { name: "width", defaultValue: "false", desc: "reportView的宽度。", isMust: "否" },
            { name: "pager", defaultValue: "pageIndex:1, pageSize:100, pageButtonCount:5, displayDataInfo: true", desc: "设置分页，其中pageIndex为起始的页号；pageSize为每页的记录数目；pageButtonCount为显示分页按钮的数目；displayDataInfo为是否显示分页信息。", isMust: "否" },
            { name: "selection", defaultValue: "type:\"row\", exclude:false, multiple:false", desc: "设置选择方式，其中type设置按照单元格选择，按照行选择，不能选择；exclude为排除标签类型，如input[type='checkbox'], a；multiple设置是否可以多选。", isMust: "否" }
        ],

        events:[
            {
                name: "pageTurning(function (target, pageIndex, pageSize){})",
                desc: "翻页事件，当点击reportView下方的页码时触发此事件。",
                params: [
                    { name: "target", type: "对象", desc: "包含一个type属性值为\"pageTurning\"。" },
                    { name: "pageIndex", type: "数值", desc: "当前需要跳转到的页号。" },
                    { name: "pageSize", type: "数值", desc: "每页的记录数目" }
                ],
                returnValue: null
            },
            {
                name: "selecting(event, element, data)",
                desc: "鼠标选择事件，类似于click事件。当在selecting事件中返回false时，将不能用鼠标选中任何行和单元格。",
                params: [
                    { name: "event", type: "对象", desc: "包含一个type属性值为\"selecting\"。" },
                    { name: "element", type: "对象", desc: "为一个HTML对象，该对象是选中的对象。" },
                    { name: "data", type: "对象", desc: "包含一个rowIndex属性和一个rowData对象，rowData对象包含option中columns:[]中的对应数据。" }
                ],
                returnValue: null
            },
            {
                name: "selected(event, element, data)",
                desc: "选中事件，当鼠标或者键盘成功选中某一项之后触发事件。当在selecting事件中返回false时，将不能用鼠标选中任何行和单元格。",
                params: [
                    { name: "event", type: "对象", desc: "包含一个type属性值为\"selected\"。" },
                    { name: "element", type: "对象", desc: "为一个HTML对象，该对象是选中的对象。" },
                    { name: "data", type: "对象", desc: "包含一个rowIndex属性和一个rowData对象，rowData对象包含option中columns:[]中的对应数据。" }
                ],
                returnValue: null
            },
            {
                name: "deselected(event, element, data)",
                desc: "取消选中事件，当鼠标取消选择某个已经处于选中状态的元素后触发事件。",
                params: [
                    { name: "event", type: "对象", desc: "包含一个type属性值为\"deselected\"。" },
                    { name: "element", type: "对象", desc: "为一个HTML对象，该对象是取消选中的对象。" },
                    { name: "data", type: "对象", desc: "包含一个rowIndex属性和一个rowData对象，rowData对象包含option中columns:[]中的对应数据。" }
                ],
                returnValue: null
            },
            {
                name: "rebind(e)",
                desc: "当reportView中的数据被重新绑定时候触发事件。",
                params: [
                    { name: "e", type: "对象", desc: "包含一个type属性值为\"rebind\"。" },
                ],
                returnValue: null
            }
        ],

        functionList: [            
            {
                name: "createReportHead(fixedColumns, dataColumns, fixedGroupColumns, dataGroupColumns)",
                desc: "创建reportView的表头。",
                params: [
                    { name: "fixedColumns", type: "对象", desc: "既options中的fixedColumns。" },
                    { name: "dataColumns", type: "对象", desc: "既options中的dataColumns。" },
                    { name: "fixedGroupColumns", type: "数组", desc: "既options中的fixedGroupColumns。" },
                    { name: "dataGroupColumns", type: "数组", desc: "既options中的dataGroupColumns。" }
                ],
                returnValue: null
            },
            {
                name: "createReportBody(dataTable, rowCount)",
                desc: "根据传入的数据创建表体。",
                params: [
                    { name: "dataTable", type: "数组", desc: "用来创建表体的数据。" },
                    { name: "rowCount", type: "数值", desc: "每页数据的数目。" }
                ],
                returnValue: null
            },
            {
                name: "prepareValue(rowData, c)",
                desc: "根据columns中的每个对象的column属性在每条数据中找到对应的值。",
                params: [
                    { name: "rowData", type: "对象", desc: "dataTable中的一行数据。" },
                    { name: "c", type: "对象", desc: "reportView中一列的属性对象。" }
                ],
                returnValue: "每条数据中column属性对应的值。"
            },
            {
                name: "createCol(column)",
                desc: "根据给与的列属性创建col标签。",
                params: [
                    { name: "column", type: "对象", desc: "columns中的一个对象。" }
                ],
                returnValue: "col对象。"
            },
            {
                name: "createCell(tagName, column)",
                desc: "创建单元格。",
                params: [
                    { name: "tagName", type: "字符串", desc: "要创建的单元格容器类型名称。" },
                    { name: "column", type: "对象", desc: "columns中的一个对象。" }
                ],
                returnValue: "单元格对象"
            },
            {
                name: "empty()",
                desc: "清空reportView中的数据。",
                params: [],
                returnValue: null
            },
            {
                name: "emptyFixed()",
                desc: "清空reportView中左侧固定列的数据。",
                params: [],
                returnValue: null
            },
            {
                name: "emptyData()",
                desc: "清空reportView中右侧数据列的数据。",
                params: [],
                returnValue: null
            },
            {
                name: "isSelectable()",
                desc: "判断reportView是否为可选。",
                params: [],
                returnValue: "布尔值，true为可选，false为不可选。"
            },
            {
                name: "isMultipleSelectable()",
                desc: "判断reportView是否可多选。",
                params: [],
                returnValue: "布尔值，true为可多选，false为不可多选。"
            },
            {
                name: "getSelectedValue()",
                desc: "获取当前选择的所有checkbox的value。",
                params: [],
                returnValue: "当前选择的checkbox的value组成的数组"
            },
            {
                name: "getCurrentSelection()",
                desc: "获取当前选择项的数据，当reportView设置为单选才可以使用。",
                params: [],
                returnValue: "当reportView设置为行选中时，返回一个对象，该对象包含当前选中行的rowData对象（该行的所有数据）和rowIndex。"
                    + "当reportView设置为单元格选中时，返回一个对象，"
                    + "该对象包含当前选中行的rowData对象（该行的所有数据）和rowIndex（行索引），还包含cellIndex（列索引）和columns（单元格中的数据）。"
            },
            {
                name: "getMultipleSelection()",
                desc: "获取当前多选项中的数据，当reportView设置为可多选才可以使用。",
                params: [],
                returnValue: "数组，里面包含所有选中的对象。当reportView设置为行选中时，对象包含当前选中行的rowData对象和rowIndex。"
                    + "当reportView设置为单元格选中时，对象包含当前选中行的rowData对象（该行的所有数据）和rowIndex（行索引），还包含cellIndex（列索引）和columns（单元格中的数据）。"
            },
            {
                name: "cancelSelection()",
                desc: "取消选择。",
                params: [],
                returnValue: null
            },
            {
                name: "cancelColumnState()",
                desc: "取消列头的所有状态。",
                params: [],
                returnValue: null
            },
            {
                name: "count()",
                desc: "获取当前页面上显示的记录数目。",
                params: [],
                returnValue: "当前页面上显示的记录数目"
            },
            {
                name: "removeRow(row)",
                desc: "移除行。不能和合并单元格一起使用。",
                params: [
                    { name: "row", type: "对象", desc: "可以是dom对象，也可以是jquery对象，但是在传递的时候要保证传递进去的是行对象，如果传递进去的是cell对象，就会出现异常。注意：当{type: cell}的时候，要特别当心，很有可能获得的对象是cell。不过可以通过cellObject.parent()将其转换成rowObject。" }
                ],
                returnValue: null
            },
            {
                name: "removeRowByIndex(rowIndex)",
                desc: "通过行索引移除行。不能和合并单元格一起使用。",
                params: [
                    { name: "rowIndex", type: "数值", desc: "行索引。" }
                ],
                returnValue: null
            },
            {
                name: "updateRow(row, updateData)",
                desc: "更新行。注意：不能和合并单元格一起使用。",
                params: [
                    { name: "row", type: "对象", desc: "可以是dom对象，也可以是jquery对象，但是在传递的时候要保证传递进去的是行对象，如果传递进去的是cell对象，就会出现异常。注意：当{type: cell}的时候，要特别当心，很有可能获得的对象是cell。不过可以通过cellObject.parent()将其转换成rowObject。" },
                    { name: "updateData", type: "对象", desc: "更新的数据。" }
                ],
                returnValue: null
            },
            {
                name: "updateRowByIndex(rowIndex, updateData)",
                desc: "根据行索引更新行。注意：不能和合并单元格一起使用。",
                params: [
                    { name: "rowIndex", type: "数值", desc: "要更新行的行索引。" },
                    { name: "updateData", type: "数值", desc: "更新的数据。" }
                ],
                returnValue: null
            },
            {
                name: "appendRow(data)",
                desc: "在数据的最后一行追加数据。",
                params: [
                    { name: "data", type: "对象", desc: "该对象包含行数据，行数据要满足数据表的格式，否则会出现异常。" }
                ],
                returnValue: null
            },
            {
                name: "insertRow(rowIndex, data)",
                desc: "在指定索引位置插入一行。不能和合并单元格一起使用。。",
                params: [
                    { name: "rowIndex", type: "数值", desc: "行索引。" },
                    { name: "data", type: "对象", desc: "该对象包含行数据，行数据要满足数据表的格式，否则会出现异常。" }
                ],
                returnValue: null
            },
            {
                name: "refreshRowNumber(startRowIndex, endRowIndex)",
                desc: "刷新行号。",
                params: [
                    { name: "startRowIndex", type: "数值", desc: "开始行号。" },
                    { name: "endRowIndex", type: "数值", desc: "结束行号。" }
                ],
                returnValue: null
            },
            {
                name: "currentUp()",
                desc: "当前选择的行上移。在reportView为多选时不可用。",
                params: [],
                returnValue: null
            },
            {
                name: "currentDown()",
                desc: "当前选择的行下移。在reportView为多选时不可用。",
                params: [],
                returnValue: null
            },
            {
                name: "moveRow(rowIndex, destIndex)",
                desc: "根据索引将某一行移动到另一行的位置。",
                params: [
                    { name: "rowIndex", type: "数值", desc: "需要移动的行的索引。" },
                    { name: "destIndex", type: "数值", desc: "移动到的位置的索引。" }
                ],
                returnValue: null
            },
            {
                name: "getRowData(rowIndex)",
                desc: "获取行数据。",
                params: [
                    { name: "rowIndex", type: "数值", desc: "行索引。" }
                ],
                returnValue: "RowData对象，包含行的信息。"
            },
            {
                name: "getLastRowData()",
                desc: "获取最后一行数据。",
                params: [],
                returnValue: "返回一个RowData对象，包含行的信息。"
            },
            {
                name: "getFirstRowData()",
                desc: "获取第一行数据。",
                params: [],
                returnValue: "返回一个RowData对象，包含行的信息。"
            },
            {
                name: "setSize(width, height)",
                desc: "设置表格的大小。常用于布局计算layout中设置reportView的宽和高。",
                params: [
                    { name: "height", type: "数值", desc: "高度，代表像素，不需要加px。" },
                    { name: "width", type: "数值", desc: "宽度，代表像素，不需要加px。" }
                ],
                returnValue: null
            },
            {
                name: "showDataPrompt()",
                desc: "显示没有数据时的文本。",
                params: [],
                returnValue: null
            },
            {
                name: "hideDataPrompt()",
                desc: "隐藏没有数据时的文本。",
                params: [],
                returnValue: null
            },
            {
                name: "promptIsShow()",
                desc: "是否显示了没有数据时的文本。",
                params: [],
                returnValue: "true为显示了，false为没有显示"
            }
        ]
    };
})();