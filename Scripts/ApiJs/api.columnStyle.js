;(function () {
    pageLogic.widgetData = {
    	imgUrl:"",

    	options: [
    	],
               
        functionList: [
            {
                name:"formatDateTime(content, columnObj)",
                desc: "格式化时间，格式为yyyy-MM-dd hh:mm:ss",
                params: [
                    { name: "content", type: "对象", desc: "从gridview控件传过来的文本" },
                    { name: "columnObj", type: "对象", desc: "列对象" }
                ],
                returnValue: "没有数据返回null，否则返回span对象"
            },
            {
                name: "formatTime(content, columnObj)",
                desc: "格式化时间，格式为hh:MM:dd",
                params: [
                    { name: "content", type: "对象", desc: "从gridview控件传过来的文本" },
                    { name: "columnObj", type: "对象", desc: "列对象" }
                ],
                returnValue: "没有数据返回null，否则返回span"
            },
	        {
	            name: "formatDate(content, columnObj)",
	            desc: "格式化日期，格式为yyyy-MM-dd",
	            params: [
	               { name: "content", type: "对象", desc: "从gridview控件传过来的文本" },
	               { name: "columnObj", type: "对象", desc: "列对象" }
	            ],
	            returnValue: "没有数据返回null，否则返回span对象"
	        },
            {
                name: "columnCheckboxAll(columnObj)",
                desc: "选中该列所有的Checkbox",
                params: [
                    { name: "columnObj", type: "对象", desc: "该列的Checkbox" }
                ],
                returnValue: "checkbox对象"
            },
            {
                name: "columnText(columnObj)",
                desc: "列头的文本",
                params: [
                    { name: "columnObj", type: "对象", desc: "该列的Checkbox" }
                ],
                returnValue: "span对象"
            },
            {
                name: "defaultText(value, columnObj)",
                desc: "默认文本",
                params: [
                    { name: "value", type: "数值", desc: "初始化的文本" },
                    { name: "columnObj", type: "对象", desc: "一列" }
                ],
                returnValue: "span对象"
            },
            {
                name: "empty(value, columnObj)",
                desc: "空白列",
                params: [
                    { name: "value", type: "数值", desc: "列里面的数值" },
                    { name: "columnObj", type: "对象", desc: "一列" }
                ],
                returnValue: null
            },
            {
                name: "rowNumber(value, columnObj, i)",
                desc: "在表格的内容中填充当前行的行号。（注意：这个行号是gridview对应的行号）",
                params: [
                    { name: "value", type: "数值", desc: "" },
                    { name: "columnObj", type: "对象", desc: "一列" },
                    { name: "i", type: "对象", desc: "行号" }
                ],
                returnValue: "返回记录的行号"
            },
            {
                name: "createCheckbox(value, columnObj)",
                desc: "在指定的单元格创建一个Checkbox",
                params: [
                    { name: "value", type: "数值", desc: "单元格文本" },
                    { name: "columnObj", type: "对象", desc: "单元格" }
                ],
                returnValue: "新创建的checkbox"
            },
            {
                name: "formatParagraph(content, columnObj)",
                desc: "格式化段落给你的文本加上<p> content </p>标签",
                params: [
                    { name: "content", type: "对象", desc: "从gridview控件传过来的文本" },
                    { name: "columnObj", type: "对象", desc: "列对象" }
                ],
                returnValue: "p标签"
            },
            {
                name: "money(content, columnObj)",
                desc: "格式化金钱(￥)，按照金融行业标准例如：￥1,000.11",
                params: [
                    { name: "content", type: "对象", desc: "从gridview控件传过来的文本" },
                    { name: "columnObj", type: "对象", desc: "列对象" }
                ],
                returnValue: 'getMoney("￥", content)'
            },
            {
                name: "cellPhoneNumber(content, columnObj)",
                desc: "单元格中的电话号码",
                params: [
                    { name: "content", type: "对象", desc: "从gridview控件传过来的文本" },
                    { name: "columnObj", type: "对象", desc: "列对象" }
                ],
                returnValue: "没有数据返回null，否则返回span"
            },
            {
                name: "rowSpanSame(content, columnObj, rowIndex, td)",
                desc: "",
                params: [
                    { name: "content", type: "对象", desc: "其他控件传过来的文本" },
                    { name: "columnObj", type: "对象", desc: "列对象" },
                    { name: "rowIndex", type: "对象", desc: "行索引" },
                    { name: "td", type: "对象", desc: "表格中的列标签" }
                ],
                returnValue: "合并单元格，合并相邻行数据一致的单元格，如数据不同则不合并"
            },
            {
                name: "getFormatBoolean(trueText, falseText, nullText)",
                desc: "获取红绿底色的字符串",
                params: [
                    { name: "tryeText", type: "对象", desc: "绿底文本" },
                    { name: "falseText", type: "对象", desc: "红底文本" },
                    { name: "nullText", type: "对象", desc: "空文本" }
                ],
                returnValue: "红绿底色的字符串"
            },
            {
                name: "getFormatNumber(count)",
                desc: "获取小数格式化的数字",
                params: [
                    { name: "count", type: "数值", desc: "小数部分的位数" }
                ],
                returnValue: "被小数被格式化的数字"
            },
            {
                name: "getFormatMoney(symbol)",
                desc: "获取被格式化的金钱",
                params: [
                    { name: "symbol", type: "对象", desc: "货币符号" }
                ],
                returnValue: "被格式化的金钱"
            },
            {
                name: "getSwitchButton(valueIndex, checkedIndex, changeFunc, css)",
                desc: "获取交互按钮",
                params: [
                    { name: "valueIndex", type: "数值", desc: "content[]数组的数值索引号" },
                    { name: "checkedIndex", type: "数值", desc: "content[]数组的复选框索引号" },
                    { name: "changeFunc", type: "方法", desc: "改变数据的方法" },
                    { name: "css", type: "样式", desc: "css样式" },
                ],
                returnValue: "randerSwitchButton"
            },
            {
                name: "getRowspanColumn(index, key, createFunc)",
                desc: "获取自定义合并单元格",
                params: [
                    { name: "index", type: "数值", desc: "index为column[]的索引号。假设index为0，对应的就是对应数据1的内容" },
                    { name: "key", type: "数值", desc: "key是一个缓存值，参数应为字符串" },
                    { name: "createFunc", type: "方法", desc: "数据显示的方法，你可以在这里加入自定义的方法" }
                ],
                returnValue: "被合并的单元格"
            }
        ]	
    };
})();