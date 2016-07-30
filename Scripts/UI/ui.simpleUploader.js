; (function () {
    //事件
    var uploading = "uploading",
        uploaded = "uploaded",
        progressing = "progressing",
        error = "error";

    var id = 0;

    var ajaxUpload = function () {
        var that = this;
        var upload = null;
        var completed = function (xhr, context) {
            var errorMsg = null,
                fileInfo;
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    fileInfo = $.parseJSON(xhr.responseText);
                    if (context.isEnd) {
                        that.percent = 100;
                        that.fire(progressing, that.percent);
                        that.fire(uploaded, fileInfo);
                    } else {
                        upload(context.fileName, context.end, context.file, context.total, fileInfo.FileId);
                    }
                } else {
                    try {
                        errorMsg = $.parseJSON(xhr.responseText);
                        errorMsg = errorMsg.ErrorMessage || errorMsg.errorMessage || errorMsg.message;
                        if(!errorMsg) 
                            errorMsg = "服务器没有返回错误信息。";
                    } catch(e) {
                        errorMsg = "服务器返回的错误信息不是JSON格式，无法解析。";
                    }
                    if (xhr.status == 404) {
                        errorMsg = "请求地址不存在，" + errorMsg;
                    } else if (xhr.status == 401) {
                        errorMsg = "没有登录，" + errorMsg;
                    } else if (xhr.status == 403) {
                        errorMsg = "没有上传权限，" + errorMsg;
                    } else {
                        errorMsg = "上传错误，" + errorMsg;
                    }
                    that.fire(error, errorMsg);
                }
            }
        };

        upload = function (fileName, index, file, total, fileId) {
            that.percent = Math.floor(index / total * 1000) / 10;
            that.fire(progressing, that.percent);

            var isEnd = false,
                end = index + that.chunkSize,
                chunk = null;
            if (end >= total) {
                end = total;
                isEnd = true;
            }

            if ("mozSlice" in file) {
                chunk = file.mozSlice(index, end);
            } else if ("webkitSlice" in file) {
                chunk = file.webkitSlice(index, end);
            } else {
                chunk = file.slice(index, end);
            }

            var xhr = new XMLHttpRequest();
            var context = {
                isEnd: isEnd,
                fileName: fileName,
                index: index,
                end: end,
                file: file,
                total: total
            };
            xhr.onload = function() {
                completed.call(arguments.callee.caller, xhr, context);
            };
            xhr.open("POST", that.option.url, true);
            xhr.setRequestHeader("X-Request-With", "XMLHttpRequest");
            xhr.setRequestHeader("X-File-Index", index);
            xhr.setRequestHeader("X-File-End", end);
            xhr.setRequestHeader("X-File-Total", total);
            xhr.setRequestHeader("X-File-IsEnd", isEnd + ui.str.empty);
            xhr.setRequestHeader("X-File-Name", encodeURIComponent(fileName));
            if (fileId) {
                xhr.setRequestHeader("X-File-Id", fileId);
            }
            xhr.setRequestHeader("Content-Type", "application/octet-stream");
            xhr.send(chunk);
        };

        this.doUpload = function () {
            var files = this.inputFile[0].files,
                file = files[0];
            if (!files || files.length == 0) {
                return;
            }
            var fileName = file.fileName || file.name,
                index = 0,
                total = file.size;
            upload(fileName, index, file, total);
        };
    };
    var formUpload = function () {
        var div = $("<div class='simple-uploader-panel' />"),
            iframeId = "uploadFrameId_" + this._id;
        this.iframe = $("<iframe />");

        this.form = $("<form />");
        this.form.attr("method", "post");
        this.form.attr("action", this.option.url);
        this.form.attr("enctype", "multipart/form-data");
        this.form.attr("target", iframeId);

        this.iframe.prop("id", iframeId);
        this.iframe.prop("name", iframeId);

        this.inputText = $("<input type='text' value='' style='position:absolute;left:-9999px;top:-9999px' />");
        (document.body || document.documentElement).insertBefore(this.inputText[0], null);

        div.append(this.iframe);
        div.append(this.form);
        $(document.body).append(div);

        this.iframe.load($.proxy(function () {
            this.percent = 100.0;
            this.fire(progressing, this.percent);

            var contentWindow = this.iframe.get(0).contentWindow;
            var fileInfo = contentWindow.fileInfo,
                errorMsg = contentWindow.error;
            if (!fileInfo && !errorMsg) {
                return;
            }
            if (errorMsg) {
                this.fire(error, errorMsg);
                return;
            }
            this.fire(uploaded, fileInfo);
        }, this));
        this.doUpload = function () {
            this.form.append(this.inputFile);

            this.percent = 0.0;
            this.fire(progressing, this.percent);

            this.form.submit();
            this.uploadPanel.append(this.inputFile);
            this.inputText.focus();
        };
    };

    var ctrl = ui.define("ctrls.SimpleUploader", {
        _getOption: function () {
            return {
                url: null,
                filter: "*.*"
            };
        },
        _getEvents: function () {
            return [uploading, uploaded, error, progressing];
        },
        _create: function () {
            this.form = null;
            this.inputFile = null;
            this.filePath = null;
            this.extension = null;
            this.fileName = null;
            this.percent = 0.0;

            var xhr = null;
            try {
                xhr = new XMLHttpRequest();
                this.initUpload = ajaxUpload;
                xhr = null;
                //upload file size
                this.chunkSize = 512 * 1024;
            } catch (e) {
                this.initUpload = formUpload;
            }

            this._id = ++id;
        },
        _init: function () {
            var inputFileId = "inputFile_" + this._id;

            this.inputFile = $("<input type='file' class='simple-input-file' value='' />");
            this.inputFile.prop("id", inputFileId);
            this.inputFile
                .attr("name", inputFileId)
                .attr("title", "选择上传文件");
            if (!this.inputFile[0].files) {
                this.initUpload = formUpload;
            }

            var upBtn = this.element;
            var currentCss = {
                "float": upBtn.css("float"),
                "display": upBtn.css("display"),
                "position": upBtn.css("position"),
                "margin-left": upBtn.css("margin-left"),
                "margin-right": upBtn.css("margin-right"),
                "margin-top": upBtn.css("margin-top"),
                "margin-bottom": upBtn.css("margin-bottom"),
                "left": upBtn.css("left"),
                "right": upBtn.css("right"),
                "top": upBtn.css("top"),
                "bottom": upBtn.css("bottom"),
                "vertical-align": upBtn.css("vertical-align"),
                "width": upBtn.outerWidth() + "px",
                "height": upBtn.outerHeight() + "px",
                "overflow": "hidden"
            };
            var position = currentCss.position;
            if (position !== "absolute" && position !== "relative" && position !== "fixed") {
                currentCss.position = "relative";
            }
            var wrap = $("<div />").css(currentCss);
            wrap = upBtn.css({
                "margin": "0px",
                "top": "0px",
                "left": "0px",
                "right": "auto",
                "bottom": "auto"
            }).wrap(wrap).parent();

            this.uploadPanel = $("<div class='simple-uploader-file' />");
            this.uploadPanel.append(this.inputFile);
            wrap.append(this.uploadPanel);

            this.inputFile.change($.proxy(this.onInputFileChange, this));

            this.initUpload();
        },
        onInputFileChange: function (e) {
            var path = this.inputFile.val();

            if (path.length === 0) {
                return false;
            }
            if (!this.checkFile(path)) {
                ui.msgshow("文件格式不符合要求，请重新选择");
                this.inputFile.val("");
                return false;
            }
            this.fire(uploading, path);

            this.doUpload();
            this.inputFile.val("");
        },
        checkFile: function (path) {
            var index = path.lastIndexOf(".");
            if (index === -1) {
                return false;
            }
            this.fileName = path.substring(path.lastIndexOf("\\") + 1, index),
            this.extension = path.substring(index).toLowerCase();

            if (this.option.filter == "*.*") {
                return true;
            }
            
            return this.option.filter.indexOf(this.extension) !== -1;
        }
    });

    $.fn.setSimpleUploader = function (option) {
        if (!this || this.length == 0) {
            return null;
        }
        return ctrl(option, this);
    };
})();