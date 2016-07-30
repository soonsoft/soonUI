;(function () {
    var data = pageLogic.widgetData = {
    	options: [
            { name: "multiple", defaultValue: false, desc: "是否可以多选。", isMust: "否" },
            { name: "valueField", defaultValue: null, desc: "下拉框的值在对应数据源中的字段名", isMust: "是" },
            { name: "textField", defaultValue: null, desc: "下拉框中文本在对应数据源中的字段名", isMust: "是" },
            { name: "parentField", defaultValue: null, desc: "下拉框中文本父节点在对应数据源中的字段名", isMust: "否" },
            { name: "childField", defaultValue: null, desc: "下拉框中文本子节点在对应数据源中的字段名", isMust: "否" },
            { name: "data", defaultValue: null, desc: "数据源，数据格式为数组，对应数据结构应该为树型结构", isMust: "否" },
            { name: "width", defaultValue: null, desc: "下拉树的宽度", isMust: "否" },
            { name: "canSelectNode", defaultValue: false, desc: "能否选择父节点", isMust: "否" },
            { name: "defaultOpen", defaultValue: false, desc: "默认打开方式 true为默认展开所有子节点，false为关闭", isMust: "否" },
            { name: "lazy", defaultValue: false, desc: "数据是否为延迟加载", isMust: "否" },
            { nanme:" layoutPanel", defaultValue:null, desc:"为下拉框添加布局", isMust:"否"}
        ],
        functionList: [
            {
                name: "setSelectTree(option)",
                desc: "创建树形列表",
                params:[
                    { name: "option", desc: "设置树形列表各个属性对象的值"}
                ],
                returnValue: null
            },
            {
                name: "setTreeView(option)",
                desc: "创建树形列表视图",
                params:[
                    { name: "option", desc: "设置树形列表视图各个属性对象的值"}
                ],
                returnValue: null
            },
            {
                name: "setAutoSelectTree(option)",
                desc: "创建自动完成树形列表",
                params:[
                    { name: "option", desc: "设置自动完成树形列表各个属性对象的值"}
                ],
                returnValue: null
            },
            {
                name: "setData(data)",
                desc: "为树形列表填充数据，重新为下拉树填充数据",
                params: [
                    { name: "data", type: "数组", desc: "数组里放的是对象（属性是option里面的valueField，textField，parentField，childField的值）" }
                ],
                returnValue: null
            },
            {
                name: "getData(elem)",
                desc: "获取元素的数据，以及它所有子元素的数据。",
                params: [
                    { name: "elem", type: "对象", desc: "下拉框中的元素。" }
                ],
                returnValue: "下拉框中相应元素的数据以及它所有子元素的数据。"
            },
            {
                name: "setCurrentSelection(value)",
                desc: "设置选中当前选中的对象",
                params: [
                    { name: "value", type: "数值或者对象", desc: "options中valueField属性的值或者是包含该值的对象" }
                ],
                returnValue: null
            },
            {
                name: "getCurrentSelection()",
                desc: "获取当前选中的对象，对象中包含数据",
                params: null,
                returnValue: "当前选中的对象对应的一条数据"
            },
            {
                name: "setCurrentSelection(values)",
                desc: "设置选中单个的对象",
                params: [
                    { name: "values", type: "数值数组或者对象数组", desc: "options中valueField属性的值组成的数组或者包含该值的对象组成的数组" }
                ],
                returnValue: null
            },
            {
                name: "getMultipleSelection()",
                desc: "获取选中状态的checkbox对应的对象",
                params: [],
                returnValue: "数组,(数组中包含所有选中的对象，对象中包括Text,Value,Children数组)"
            },

            {
                name: "cancelSelection()",
                desc: "取消当前选中的内容,如果是单选直接取消选中，如果是多选，对应的checkbox的勾选状态也会被更新",
                params: [],
                returnValue: null
            },

            {
                name: "getDataByPath(path)",
                desc: "获取指定数据路径的数据",
                params: [
                    { name: "path", type: "字符串", desc: "数据的路径" }
                ],
                returnValue: "相应路径下的数据以及它所有子元素的数据"
            },
            {
                name: "getLevel(data)",
                desc: "获取数据所在树形结构的级数",
                params: [
                    { name: "data", type: "对象", desc: "下拉框中的数据" }
                ],
                returnValue: "数据处于树形结构的级数"
            },
            {
                name: "selectChildNode(elem, checkValue)",
                desc: "选中elem元素的子节点",
                params: [
                    { name: "elem", type: "对象", desc: "下拉框中的元素" },
                    { name: "checkValue", type: "布尔", desc: "设置检查选中状态" }
                ],
                returnValue: null
            },
            {
                name: "selectParentNode(elem, checkValue)",
                desc: "选中elem元素的父节点",
                params: [
                    { name: "elem", type: "对象", desc: "下拉框中的元素" },
                    { name: "checkValue", type: "布尔", desc: "设置检查选中状态" }
                ],
                returnValue: null
            },
            {
                name: "empty()",
                desc: "清空树形列表中的数据，并且选中的内容也会被清空",
                params: [],
                returnValue: null
            },
            {
                name: "selecting",
                desc: "选择事件，如果在该事件中返回false则后面的对象无法被选中",
                params: [
                    { name: "event", type: "对象", desc: "type属性值为\"selecting\"" },
                    { name: "element", type: "对象", desc: "HTML对象和prevObject	数组" },
                    { name: "treeData", type: "对象", desc: "包含多个自定义属性和必要属性：isNode属性、isRoot属性、isSelected属性和一个Children数组，children数组包含多个对象" }
                ],
                returnValue: null
            },
            {
                name: "selected",
                desc: "选中事件，当一个元素被选中，触发该事件。当selecting事件返回false本事件失效",
                params: [
                    { name: "event", type: "对象", desc: "type属性值为\"selected\"" },
                    { name: "element", type: "对象", desc: "HTML对象和prevObject	数组" },
                    { name: "treeData", type: "对象", desc: "包含多个自定义属性和必要属性：isNode属性、isRoot属性、isSelected属性和一个Children数组，children数组包含多个对象" }
                ],
                returnValue: null
            },
            {
                name: "canceled",
                desc: "取消选中事件，当某个或多个元素被取消选择的时候，触发该事件",
                params: [
                    { name: "event", type: "对象", desc: "type属性值为\"canceled\"。" },
                    { name: "element", type: "对象", desc: "HTML对象和prevObject	数组。" },
                    { name: "treeData", type: "对象", desc: "包含多个自定义属性和必要属性：isNode属性、isRoot属性、isSelected属性和一个Children数组，children数组包含多个对象" }
                ],
                returnValue: null
            }
        ]
    };
})();   