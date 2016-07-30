//time
; (function(){
    var timer = window.timer = function(tickFunc, interval) {
        return (this instanceof timer) ? this._init(tickFunc, interval) : new timer(tickFunc, interval);
    };

    timer.prototype = {
        _init: function(tickFunc, interval) {
            this._tick = null;
            this._isStart = false;
            this._keep = true;
            this._interval = 1000;
            if(typeof tickFunc === "function") {
                this._tick = tickFunc;
            }
            var val = parseInt(interval);
            if(typeof val === "number") {
                this._interval = val;
            }
            return this;
        },

        start: function() {
            if(this._isStart === true)
                return;
            if(typeof this._tick === "function") {
                var $timer = this;
                $timer._keep = true;
                $timer._isStart = true;
                window.setTimeout(function(){
                    if(typeof $timer._tick === "function") {
                        $timer._tick(this);
                    }
                    if($timer._keep === true) {
                        window.setTimeout(arguments.callee, $timer._interval);
                    } else {
                        $timer._isStart = false;
                    }
                }, $timer._interval);
            }
        },

        stop: function() {
            this._keep = false;
        }
    };
})();
