; (function () {
    if (!window.ui) window.ui = {};

    function addZero (val) {
        return val < 10 ? "0" + val : "" + val;
    }
    function getMoney (symbol, content) {
        if (!symbol) {
            symbol = "";
        }
        if (!$.isNumeric(content))
            return null;
        return "<span>" + ui.str.formatMoney(content, symbol) + "</span>";
    }

    window.ui.ColumnStyle = {
        //column name function
        cnfn: {
            columnCheckboxAll: function (columnObj) {
                var checkbox = $("<input class='gridview-check-all' type='checkbox' />");
                checkbox.prop("name", columnObj.column + "_all");
                checkbox.on("change", $.proxy(this.onAllSelected, this));
                this.columnStateFunctions.checkboxAllCancel = function () {
                    checkbox.prop("checked", false);
                    this._checkedCount = 0;
                };
                return checkbox;
            },
            columnText: function (columnObj) {
                var span = $("<span />");
                var value = columnObj.text;
                if (value == undefined || value == null)
                    value = "";
                span.text(value);
                return span;
            },
            empty: function () {
                return null;
            }
        },
        //content function
        cfn: {
            defaultText: function (value, columnObj) {
                var t = value + "",
                    span = null;
                if (t === "undefined" || t === "null" || t === "NaN")
                    return null;
                span = $("<span />");
                span.text(value);
                return span;
            },
            empty: function (value, columnObj) {
                return null;
            },
            rowNumber: function (value, columnObj, i) {
                if(value === "no-count") {
                    return null;
                }
                var span = $("<span />");
                var num = (this.pageIndex - 1) * this.pageSize + (i + 1);
                span.text(num);
                return span;
            },
            createCheckbox: function (value, columnObj) {
                var checkbox = $("<input class='gridview-check' type='checkbox' />");
                checkbox.prop("name", columnObj.column + "");
                checkbox.val(value);
                this.prepareRowCheckboxChangeHandler();
                return checkbox;
            },
            formatParagraph: function (content, columnObj) {
                var p = $("<p />");
                p.text(content);
                return p;
            },
            formatDate: function (content, columnObj) {
                var date = content;
                if (!date) {
                    return null;
                }
                if (typeof date === "string") {
                    date = ui.str.jsonToDate(date);
                }
                var span = $("<span />");
                if (!isNaN(date)) {
                    span.text([date.getFullYear(), "-", 
                        addZero(date.getMonth() + 1), "-",
                        addZero(date.getDate())].join(""));
                } else {
                    span.text("无法转换");
                }
                return span;
            },
            formatDateTime: function (content, columnObj) {
                var date = content;
                if (!date) {
                    return null;
                }
                if (typeof date === "string") {
                    date = ui.str.jsonToDate(date);
                }
                var span = $("<span />");
                if (!isNaN(date)) {
                    span.text([date.getFullYear(), "-",
                        addZero(date.getMonth() + 1), "-",
                        addZero(date.getDate()), " ",
                        addZero(date.getHours()), ":",
                        addZero(date.getMinutes()), ":",
                        addZero(date.getSeconds())].join(""));
                } else {
                    span.text("无法转换");
                }
                return span;
            },
            formatTime: function (content, columnObj) {
                var date = content;
                if (!date) {
                    return null;
                }
                if (typeof date === "string") {
                    date = ui.str.jsonToDate(date);
                }
                var span = $("<span />");
                if (!isNaN(date)) {
                    span.text([addZero(date.getHours()), ":",
                        addZero(date.getMinutes()), ":",
                        addZero(date.getSeconds())].join(""));
                } else {
                    span.text("无法转换");
                }
                return span;
            },
            money: function (content, columnObj) {
                return getMoney("￥", content);
            },
            cellPhoneNumber: function (content, columnObj) {
                if (!content) {
                    return;
                }
                var span = $("<span />");
                if (content.length == 11) {
                    span.text(content.substring(0, 3) + "-" + content.substring(3, 7) + "-" + content.substring(7));
                } else {
                    span.text(content);
                }
                return span;
            },
            rowSpanSame: function (content, columnObj, rowIndex, td) {
                var ctx = null;
                if (rowIndex == 0) {
                    ctx = this["__temp$TdContext_" + columnObj.column] = {
                        rowSpan: 1,
                        content: content,
                        td: td
                    };
                } else {
                    ctx = this["__temp$TdContext_" + columnObj.column];
                    if (ctx.content != content) {
                        ctx.rowSpan = 1;
                        ctx.content = content;
                        ctx.td = td;
                    } else {
                        ctx.rowSpan++;
                        ctx.td.prop("rowSpan", ctx.rowSpan);
                        td.isAnnul = true;
                        return null;
                    }
                }
                var span = $("<span />").text(content);
                return span;
            }
        },
        // content function for parameters
        cfnp: {
            getFormatBoolean: function (trueText, falseText, nullText) {
                trueText += "";
                falseText += "";
                if (arguments.length == 2)
                    nullText = "";
                var width = 16;
                var trueWidth = width * trueText.length || width,
                    falseWidth = width * falseText.length || width;
                var formatBoolean = function (content, columnObj) {
                    var span = $("<span />");
                    if (content === true) {
                        span.addClass("state-text").addClass("state-true")
                            .css("width", trueWidth + "px");
                        span.text(trueText);
                    } else if (content === false) {
                        span.addClass("state-text").addClass("state-false")
                            .css("width", falseWidth + "px");
                        span.text(falseText);
                    } else {
                        span.text(nullText);
                    }
                    return span;
                };
                return formatBoolean;
            },
            getFormatNumber: function(count) {
                return function (content, columnObj) {
                    if (!$.isNumeric(content)) {
                        return null;
                    }
                    var span = $("<span />");
                    span.text(ui.str.numberFormatScale(content, count));
                    return span;
                }
            },
            getFormatMoney: function (symbol) {
                return function (content, columnObj) {
                    return getMoney(symbol, content);
                };
            },
            getProgressBar: function (progressWidth, totalValue) {
                if (!$.isNumeric(progressWidth) || progressWidth < 60) {
                    progressWidth = false;
                }
                var defaultWidth = 162;
                if (!$.isNumeric(totalValue)) {
                    totalValue = null;
                } else if (totalValue < 1) {
                    totalValue = null;
                }
                var error = new Error("column.len或width设置太小，无法绘制进度条！");
                var createProgress = function (content, columnObj, rowIndex) {
                    var div = $("<div class='progress-panel' />");

                    var progressdiv = $("<div class='progress-bar' />");
                    var width;
                    if (progressWidth) {
                        width = progressWidth;
                    } else if ($.isNumeric(columnObj.len)) {
                        width = columnObj.len - 12;
                    } else {
                        width = defaultWidth;
                    }
                    width -= 52;
                    if (width <= 0) {
                        throw error;
                    }
                    progressdiv.css("width", width + "px");

                    var value, total;
                    if ($.isNumeric(content[0])) {
                        value = content[0];
                        total = totalValue || content[1];
                    } else {
                        value = content;
                        total = totalValue;
                    }
                    if (!$.isNumeric(total)) {
                        total = value;
                    }
                    if (total == 0) {
                        total = 1;
                    }
                    if (!$.isNumeric(value)) {
                        value = 0;
                    }
                    var percent = (value / total);
                    width = percent * width;
                    var val = $("<div class='progress-value background-highlight' />");
                    val.css("width", width + "px");
                    progressdiv.append(val);
                    div.append(progressdiv);

                    var textVal = percent * 100 + "";
                    if (textVal === "NaN") {
                        textVal = "0";
                    }
                    var index = textVal.indexOf(".");
                    if (index == -1) {
                        textVal += ".0%";
                    } else {
                        var num = textVal.length - index - 1;
                        if (num == 0) {
                            textVal += "0%";
                        } else if (num > 1) {
                            textVal = textVal.substring(0, index + 2) + "%";
                        } else {
                            textVal += "%";
                        }
                    }

                    var sdiv = $("<div class='progress-text font-highlight'/>");
                    var span = $("<span>" + textVal + "</span>");
                    sdiv.append(span);
                    div.append(sdiv);

                    var cleardiv = $("<div style=\"clear:both;\" />");
                    div.append(cleardiv);

                    return div;
                };
                return createProgress;
            },
            getRowspanColumn: function (index, key, createFunc) {
                var columnKey = "__temp$TdContext_" + key;
                return function (content, columnObj, rowIndex, td) {
                    var ctx = null;
                    if (rowIndex == 0) {
                        ctx = this[columnKey] = {
                            rowSpan: 1,
                            content: content,
                            td: td
                        };
                    } else {
                        ctx = this[columnKey];
                        if (ctx.content[index] != content[index]) {
                            ctx.rowSpan = 1;
                            ctx.content = content;
                            ctx.td = td;
                        } else {
                            ctx.rowSpan++;
                            ctx.td.prop("rowSpan", ctx.rowSpan);
                            td.isAnnul = true;
                            return null;
                        }
                    }
                    return createFunc.apply(this, arguments);
                };
            },
            getImage: function(width, height, prefix, defaultSrc, fillMode) {
                if(ui.core.type(width) !== "number" || width <= 0) {
                    width = 120;
                }
                if(ui.core.type(height) !== "number" || width <= 0) {
                    height = 90;
                }
                if(!prefix) {
                    prefix = "";
                }
                prefix += "";
                
                if(!ui.images) {
                    throw new ReferenceError("require ui.images.js");
                }
                var imageZoomer = ui.images.createImageZoomer({
                    getNext: function(val) {
                        var img = this.target;
                        var cell = img.parent().parent();
                        var row = cell.parent();
                        var tableBody = row.parent();
                        var rowCount = tableBody[0].rows.length;
                        
                        var rowIndex = row[0].rowIndex + val;
                        var imgPanel = null;
                        do {
                            if(rowIndex < 0 || rowIndex >= rowCount) {
                                return false;
                            }
                            imgPanel = $(tableBody[0].rows[rowIndex].cells[cell[0].cellIndex]).children();
                            img = imgPanel.children("img");
                            rowIndex += val;
                        } while(imgPanel.hasClass("failed-image"));
                        return img;
                    },
                    onNext: function() {
                        return this.option.getNext.call(this, 1) || null;
                    },
                    onPrev: function() {
                        return this.option.getNext.call(this, -1) || null;
                    },
                    hasNext: function() {
                        return !!this.option.getNext.call(this, 1);
                    },
                    hasPrev: function() {
                        return !!this.option.getNext.call(this, -1);
                    }
                });
                return function(imageSrc, column, index, td) {
                    if(!imageSrc) {
                        return "<span>暂无图片</span>";
                    }
                    var imagePanel = $("<div class='grid-small-image' style='overflow:hidden;' />");
                    var image = $("<img style='cursor:crosshair;' />");
                    imagePanel.css({
                        "width": width + "px",
                        "height": height + "px"
                    });
                    imagePanel.append(image);
                    image.setImage(prefix + imageSrc, width, height, fillMode)
                        .then(
                            function(result) {
                                image.addImageZoomer(imageZoomer);
                            }, 
                            function(e) {
                                image.attr("alt", "请求图片失败");
                                if(defaultSrc) {
                                    image.prop("src", defaultSrc);
                                    image.addClass("default-image");
                                }
                                imagePanel.addClass("failed-image");
                            });
                    return imagePanel;
                };
            }
        }
    };
})();