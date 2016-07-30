;(function () {
    pageLogic.widgetData = {
		imgUrl: null,
		options: null,
		events: null,
		functionList: [
			{
				name: "core.type(obj)",
				desc: "获取给定对象的类型名称。",
				params: [
					{ name: "obj", type: "对象", desc: "需要获取类型名称的变量。" },
				],
				returnValue: "给定对象的类型名称。"
			},
			{
				name: "core.isPlainObject(obj)",
				desc: "判定是否是一个朴素的javascript对象（Object），不是DOM对象，不是BOM对象，不是自定义类的实例。",
				params: [
					{ name: "obj", type: "对象", desc: "需要判断的对象。" },
				],
				returnValue: "布尔值，true表示对象为朴素的javascript对象，false表示不是朴素的javascript对象。"
			},
			{
				name: "core.isEmptyObject(obj)",
				desc: "判断一个对象是否为空对象。",
				params: [
					{ name: "obj", type: "对象", desc: "需要判断的对象。" },
				],
				returnValue: "布尔值，true表示对象为空对象，false表示为非空对象。"
			},
			{
				name: "core.isDomObject(obj)",
				desc: "判断一个对象是否为Dom对象。",
				params: [
					{ name: "obj", type: "对象", desc: "需要判断的对象" }
				],
				returnValue: "布尔值，true表示对象为Dom对象，false表示不是Dom对象。"
			},
			{
				name: "core.isJQueryObject(obj)",
				desc: "判断一个对象是否为JQuery对象。",
				params: [
					{ name: "obj", type: "对象", desc: "需要判断的对象" }
				],
				returnValue: "布尔值，true表示对象为JQuery对象，false表示不是JQuery对象。"
			},
			{
				name: "core.addLink(src)",
				desc: "往HTML文档的head中添加link。",
				params: [
					{ name: "src", type: "字符串", desc: "要添加的link的href的属性值。" }
				],
				returnValue: null
			},
			{
				name: "core.addScript(src)",
				desc: "往HTML文档的body中添加script。",
				params: [
					{ name: "src", type: "字符串", desc: "要添加的script的src的属性值。" }
				],
				returnValue: null
			},
			{
				name: "ui.log(str, force)",
				desc: "日志输出。",
				params: [
					{ name: "src", type: "字符串", desc: "要输出的信息。" },
					{ name: "force", type: "布尔", desc: "是否在页面输出，如果为true则为在页面的body中输出，false为在控制台输出。" }
				],
				returnValue: null
			},
			{
				name: "$.fn.nodeName()",
				desc: "为jquery添加一个获取元素标签类型的方法。",
				params: [],
				returnValue: "jquery元素的标签类型。"
			},
			{
				name: "$.fn.zIndex(zIndex)",
				desc: "获取/设置对象的z-index值。如果有zIndex参数则表示设置z-index值，没有zIndex参数则表示获取z-index值。",
				params: [
					{ name: "zIndex", type: "数值", desc: "需要设置的z-index值。" }
				],
				returnValue: "如果有zIndex参数则返回当前对象的z-index值，没有参数则返回当前的JQuery对象。"
			},
			{
				name: "$.fn.bindOptions(arr, valueField, textField)",
				desc: "往HTML中的select标签绑定option。",
				params: [
					{ name: "arr", type: "数组", desc: "用来创建option的数组。" },
					{ name: "valueField", type: "字符串", desc: "arr中用来赋值给option的value的属性名。" },
					{ name: "textField", type: "字符串", desc: "arr中用来赋值给option的text的属性名。。" }
				],
				returnValue: "返回当前的JQuery对象。"
			},
			{
				name: "$.fn.selectOption()",
				desc: "获取一个select元素当前选中的value和text。",
				params: [],
				returnValue: "对象，对象中包括value和text。"
			},
			{
				name: "$.fn.setImage(src, displayWidth, displayHeight)",
				desc: "动态设置图片的src并自动调整图片的尺寸和位置。",
				params: [
					{ name: "src", type: "字符串", desc: "图片的地址。" },
					{ name: "displayWidth", type: "数值", desc: "图片显示区域的宽度。" },
					{ name: "displayHeight", type: "数值", desc: "图片显示区域的高度。" }
				],
				returnValue: null
			},
			{
				name: "$.fn.mousewheel(data, fn)",
				desc: "为jquery添加mousewheel事件。",
				params: [
					{ name: "data", type: "对象", desc: "需要传入fn中的参数。" },
					{ name: "fn", type: "方法", desc: "mousewheel事件触发时调用的方法。" }
				],
				returnValue: null
			},
			{
				name: "core.getJQueryElement(arg)",
				desc: "根据arg获取相应的JQuery对象。",
				params: [
					{ name: "arg", type: "字符串或对象", desc: "可以为要获取的JQuery对象的id或者Dom对象或者JQuery对象。" }
				],
				returnValue: "相应的JQuery对象"
			},
			{
				name: "core.setDown(target, panel)",
				desc: "把panel定位在target的底部。",
				params: [
					{ name: "target", type: "对象", desc: "Dom对象，panel需要定位在该对象底部。" },
					{ name: "panel", type: "对象", desc: "需要定位的Dom对象。" }
				],
				returnValue: null
			},
			{
				name: "core.setLeft(target, panel)",
				desc: "把panel定位在target的左侧。",
				params: [
					{ name: "target", type: "对象", desc: "Dom对象，panel需要定位在该对象左侧。" },
					{ name: "panel", type: "对象", desc: "需要定位的Dom对象。" }
				],
				returnValue: null
			},
			{
				name: "core.isMaskOpened()",
				desc: "判断页面的遮罩是否打开。",
				params: [],
				returnValue: "布尔值，true表示遮罩打开，false表示遮罩关闭。"
			},
			{
				name: "core.openMask(target, option)",
				desc: "打开遮罩。",
				params: [
					{ name: "target", type: "字符串或者对象", desc: "可以是JQuery或者Dom对象，为字符串时是对象的id值，表示需要出现遮罩的对象。" },
					{ name: "option", type: "对象", desc: "遮罩的样式。" }
				],
				returnValue: null
			},
			{
				name: "core.closeMask()",
				desc: "关闭遮罩。",
				params: [],
				returnValue: null
			},
			{
				name: "ui.theme.getTheme(themeId)",
				desc: "根据主题id获取主题的信息。",
				params: [
					{ name: "option", type: "对象", desc: "遮罩的样式。" }
				],
				returnValue: "主题信息，包括Color(#2078EF)，Id(Blue)，Name(蓝色)。"
			},
			{
				name: "ui.theme.getCurrentThemeId()",
				desc: "获取当前主题的Id。",
				params: [],
				returnValue: "当前主题的Id。"
			},
			{
				name: "ui.theme.getCurrentColor()",
				desc: "获取当前主题的颜色值。",
				params: [],
				returnValue: "当前主题的颜色值。"
			},
			{
				name: " ui.theme.overlay(color1, color2, alpha)",
				desc: "两种颜色混和得出新颜色。",
				params: [
					{ name: "color1", type: "字符串", desc: "第一种颜色值。" },
					{ name: "color2", type: "字符串", desc: "第二种颜色值。" },
					{ name: "alpha", type: "数值", desc: "第二种颜色的透明度，为0到1之间。" }
				],
				returnValue: "根据两种颜色混合出的新颜色值。"
			},
			{
				name: "ui.fixedNumber(number, precision)",
				desc: "根据小数点后的位数格式化数值，如果数值后小数点位数多余precision则四舍五入，否则不做改变。",
				params: [
					{ name: "number", type: "数值", desc: "需要格式化的数值。" },
					{ name: "precision", type: "数值", desc: "小数点后面保留的位数。" }
				],
				returnValue: "格式化后的数值。"
			},
			{
				name: "ui.random(min, max)",
				desc: "根据最大值最小值产生随机数。",
				params: [
					{ name: "min", type: "数值", desc: "最小值。" },
					{ name: "max", type: "数值", desc: "最大值。" }
				],
				returnValue: "根据最大值最小值产生的随机数，不包括最大值。"
			},
			{
				name: "ui.str.trim(str)",
				desc: "移除字符串两侧的空白字符。",
				params: [
					{ name: "str", type: "字符串", desc: "需要移除两侧空白字符的字符串。" }
				],
				returnValue: "移除两侧空白字符后的字符串。"
			},
			{
				name: "ui.str.lTrim(str)",
				desc: "移除字符串左侧的空白字符。",
				params: [
					{ name: "str", type: "字符串", desc: "需要移除左侧空白字符的字符串。" }
				],
				returnValue: "移除左侧空白字符后的字符串。"
			},
			{
				name: "ui.str.rTrim(str)",
				desc: "移除字符串右侧的空白字符。",
				params: [
					{ name: "str", type: "字符串", desc: "需要移除右侧空白字符的字符串。" }
				],
				returnValue: "移除右侧空白字符后的字符串。"
			},
			{
				name: "ui.str.stringFormat(str, params)",
				desc: "格式化字符串，stringFormat(\"He{0}{1}o\", \"l\", \"l\") 返回 Hello。既加入了类似于C#中的占位符用法。",
				params: [
					{ name: "str", type: "字符串", desc: "需要格式化的字符串。" },
					{ name: "params", type: "字符串", desc: "用于插入字符串相应位置的字符串。" }
				],
				returnValue: "格式化后的字符串。"
			},
			{
				name: "ui.str.dateFormat(date, format, weekFormat)",
				desc: "格式化日期: y|Y 年; M 月; d|D 日; H|h 小时; m 分; S|s 秒; ms|MS 毫秒; wk|WK 星期。",
				params: [
					{ name: "date", type: "日期对象", desc: "需要格式化的日期。" },
					{ name: "format", type: "字符串", desc: "用于日期格式化的字符串。" },
					{ name: "weekFormat", type: "方法", desc: "星期格式化方法。" }
				],
				returnValue: "格式化后的日期字符串。"
			},
			{
				name: "ui.str.convertDate(dateStr, format)",
				desc: "转换日期字符串的格式。",
				params: [
					{ name: "dateStr", type: "字符串", desc: "日期字符串。" },
					{ name: "format", type: "字符串", desc: "用于日期格式化的字符串。" }
				],
				returnValue: "转换后的日期字符串。"
			},
			{
				name: "ui.str.jsonToDate(jsonDate)",
				desc: "把json中的日期转换成日期字符串。",
				params: [
					{ name: "jsonDate", type: "字符串或者对象", desc: "json对象中的日期。" }
				],
				returnValue: "转换后的日期字符串。"
			},
			{
				name: "ui.str.base64Encode(input)",
				desc: "使用base64对字符串进行编码。",
				params: [
					{ name: "input", type: "字符串", desc: "需要编码的字符串。" }
				],
				returnValue: "编码后的字符串。"
			},
			{
				name: "ui.str.base64Decode(input)",
				desc: "使用base64对字符串进行解码。",
				params: [
					{ name: "input", type: "字符串", desc: "需要解码的字符串。" }
				],
				returnValue: "解码后的字符串。"
			},
			{
				name: "ui.str.htmlEncode(str)",
				desc: "编码Html文本。",
				params: [
					{ name: "str", type: "字符串", desc: "需要编码的Html文本。" }
				],
				returnValue: "编码后的Html文本。"
			},
			{
				name: "ui.str.htmlDecode(str)",
				desc: "解码Html文本。",
				params: [
					{ name: "str", type: "字符串", desc: "需要解码的Html文本。" }
				],
				returnValue: "解码后的Html文本。"
			},
			{
				name: "ui.str.numberFormatScale(num, zeroCount)",
				desc: "根据小数点后的位数格式化数值，如果数值后小数点位数多余precision则四舍五入，否则在末尾补0。",
				params: [
					{ name: "num", type: "数值", desc: "需要格式化的数值。" },
					{ name: "zeroCount", type: "数值", desc: "小数点后面保留的位数。" }
				],
				returnValue: "格式化后的数值。"
			},
			{
				name: "ui.str.integerFormat(num, count)",
				desc: "根据给定位数格式化整数，如果整数位数少于给定位数则在整数前补0，否则不做改变。",
				params: [
					{ name: "num", type: "数值", desc: "需要格式化的整数。" },
					{ name: "count", type: "数值", desc: "给定的整数位数。" }
				],
				returnValue: "格式化后的数值。"
			},
			{
				name: "ui.str.formatMoney(value, symbol)",
				desc: "格式化金钱。",
				params: [
					{ name: "value", type: "数值", desc: "需要格式化的金钱数值。" },
					{ name: "symbol", type: "字符串", desc: "金钱的符号，人名币￥，美元$。" }
				],
				returnValue: "格式化后的金钱。"
			},
			{
				name: "ui.obj.clone(result, source)",
				desc: "浅克隆对象。",
				params: [
					{ name: "result", type: "对象", desc: "克隆后的对象。" },
					{ name: "source", type: "对象", desc: "克隆的源对象。" }
				],
				returnValue: "克隆后的对象。"
			},
			{
				name: "ui.obj.deepClone(result, source)",
				desc: "深克隆对象。",
				params: [
					{ name: "result", type: "对象", desc: "克隆后的对象。" },
					{ name: "source", type: "对象", desc: "克隆的源对象。" }
				],
				returnValue: "克隆后的对象。"
			},
			{
				name: "ui.url.urlInfo(url)",
				desc: "获取url的各种信息。",
				params: [
					{ name: "url", type: "字符串", desc: "要获取信息的url。" }
				],
				returnValue: "包含url各种信息的对象。"
			},
			{
				name: "ui.url.getParam(url)",
				desc: "取得URL的参数。",
				params: [
					{ name: "url", type: "字符串", desc: "要获取参数的url。" }
				],
				returnValue: "包含参数信息的对象。"
			},
			{
				name: "ui.url.getLocationParam(name)",
				desc: "获取地址栏参数值。",
				params: [
					{ name: "name", type: "字符串", desc: "要获取值的参数的名称。" }
				],
				returnValue: "指定参数的值。"
			},
			{
				name: "ui.url.appendParams(url, data)",
				desc: "为url添加参数。",
				params: [
					{ name: "url", type: "字符串", desc: "需要添加参数的url。" },
					{ name: "data", type: "数组或者朴素对象", desc: "需要添加的参数。" }
				],
				returnValue: "添加参数后的url。"
			},
			{
				name: "ui.guid.newGuid()",
				desc: "获取一个新的Guid。",
				params: [ ],
				returnValue: "新的Guid。"
			},
			{
				name: "ui.data.listToTree(list, parentField, valueField, childrenField)",
				desc: "把数组转换成一个树形的数组。",
				params: [
					{ name: "list", type: "数组", desc: "需要转换的源数组。" },
					{ name: "parentField", type: "字符串", desc: "父值域的名称。" },
					{ name: "valueField", type: "字符串", desc: "值域的名称。" },
					{ name: "childrenField", type: "字符串", desc: "子值域的名称。" }
				],
				returnValue: "转换后的树形数组。"
			},
			{
				name: "ui.ajax.ajaxGet(url, args, complete, error, isAsync)",
				desc: "调用ajax的Get请求。",
				params: [
					{ name: "url", type: "字符串", desc: "请求的地址。" },
					{ name: "args", type: "对象", desc: "请求传入的参数。" },
					{ name: "complete", type: "方法", desc: "请求成功的回调函数。" },
					{ name: "error", type: "方法", desc: "请求失败的回调函数。" },
					{ name: "isAsync", type: "布尔", desc: "是否异步。" }
				],
				returnValue: null
			},
			{
				name: "ui.ajax.ajaxPost(url, args, complete, error, isAsync)",
				desc: "调用ajax的Post请求。",
				params: [
					{ name: "url", type: "字符串", desc: "请求的地址。" },
					{ name: "args", type: "对象", desc: "请求传入的参数。" },
					{ name: "complete", type: "方法", desc: "请求成功的回调函数。" },
					{ name: "error", type: "方法", desc: "请求失败的回调函数。" },
					{ name: "isAsync", type: "布尔", desc: "是否异步。" }
				],
				returnValue: null
			},
			{
				name: "ui.ajax.ajaxPostOnce(btn, url, args, complete, error, isAsync)",
				desc: "调用ajax的Post请求，并且ajax请求没有完成时，禁用调用该ajax的按钮。",
				params: [
					{ name: "btn", type: "字符串，或者对象", desc: "调用该ajax的按钮，或者该按钮的Id。" },
					{ name: "url", type: "字符串", desc: "请求的地址。" },
					{ name: "args", type: "对象", desc: "请求传入的参数。" },
					{ name: "complete", type: "方法", desc: "请求成功的回调函数。" },
					{ name: "error", type: "方法", desc: "请求失败的回调函数。" },
					{ name: "isAsync", type: "布尔", desc: "是否异步。" }
				],
				returnValue: null
			}
		]
	};
})();