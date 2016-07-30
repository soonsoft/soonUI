///颜色计算器
(function () {
    // Adapted from http://www.easyrgb.com/math.html
    // hsv values = 0 - 1
    // rgb values 0 - 255
    
    /// 颜色计算
    ui.color = {
        hsv2rgb: function (h, s, v) {
            var r, g, b;
            if (s == 0) {
                r = v * 255;
                g = v * 255;
                b = v * 255;
            } else {
                // h must be < 1
                var var_h = h * 6;
                if (var_h == 6) {
                    var_h = 0;
                }
                //Or ... var_i = floor( var_h )
                var var_i = Math.floor(var_h);
                var var_1 = v * (1 - s);
                var var_2 = v * (1 - s * (var_h - var_i));
                var var_3 = v * (1 - s * (1 - (var_h - var_i)));
                var var_r, var_g, var_b;

                if (var_i == 0) {
                    var_r = v;
                    var_g = var_3;
                    var_b = var_1;
                } else if (var_i == 1) {
                    var_r = var_2;
                    var_g = v;
                    var_b = var_1;
                } else if (var_i == 2) {
                    var_r = var_1;
                    var_g = v;
                    var_b = var_3
                } else if (var_i == 3) {
                    var_r = var_1;
                    var_g = var_2;
                    var_b = v;
                } else if (var_i == 4) {
                    var_r = var_3;
                    var_g = var_1;
                    var_b = v;
                } else {
                    var_r = v;
                    var_g = var_1;
                    var_b = var_2
                }

                //rgb results = 0 ~ 255
                r = var_r * 255;
                g = var_g * 255;
                b = var_b * 255;
            }
            return [Math.round(r), Math.round(g), Math.round(b)];
        },
        rgb2hsv: function (r, g, b) {
            //RGB values = 0 ~ 255
            r = (r / 255);
            g = (g / 255);
            b = (b / 255);

            //Min. value of RGB
            var min = Math.min(r, g, b);
            //Max. value of RGB
            var max = Math.max(r, g, b);
            //Delta RGB value
            var deltaMax = max - min;

            var v = max;
            var s, h;
            var deltaRed, deltaGreen, deltaBlue;

            //This is a gray, no chroma...
            if (deltaMax == 0) {
                //HSV results = 0 ~ 1
                h = 0;
                s = 0;
            } else {
                //Chromatic data...
                s = deltaMax / max;

                deltaRed = (((max - r) / 6) + (deltaMax / 2)) / deltaMax;
                deltaGreen = (((max - g) / 6) + (deltaMax / 2)) / deltaMax;
                deltaBlue = (((max - b) / 6) + (deltaMax / 2)) / deltaMax;

                if (r == max)
                    h = deltaBlue - deltaGreen;
                else if (g == max)
                    h = (1 / 3) + deltaRed - deltaBlue;
                else if (b == max)
                    h = (2 / 3) + deltaGreen - deltaRed;

                if (h < 0)
                    h += 1;
                if (h > 1)
                    h -= 1;
            }

            return [h, s, v];
        },
        rgb2hex: function (r, g, b) {
            return this.toHex(r) + this.toHex(g) + this.toHex(b);
        },
        hexchars: "0123456789ABCDEF",
        toHex: function (n) {
            n = n || 0;
            n = parseInt(n, 10);
            if (isNaN(n))
                n = 0;
            n = Math.round(Math.min(Math.max(0, n), 255));
            return this.hexchars.charAt((n - n % 16) / 16) + this.hexchars.charAt(n % 16);
        },
        toDec: function (hexchar) {
            return this.hexchars.indexOf(hexchar.toUpperCase());
        },
        hex2rgb: function (str) {
            if (typeof str !== "string") {
                return null;
            }
            if (str.charAt(0) === "#") {
                str = str.substring(1);
            }
            var rgb = [];
            rgb[0] = (this.toDec(str.substr(0, 1)) * 16) +
                    this.toDec(str.substr(1, 1));
            rgb[1] = (this.toDec(str.substr(2, 1)) * 16) +
                    this.toDec(str.substr(3, 1));
            rgb[2] = (this.toDec(str.substr(4, 1)) * 16) +
                    this.toDec(str.substr(5, 1));
            return rgb;
        },
        isValidRGB: function (a) {
            if ((!a[0] && a[0] != 0) || isNaN(a[0]) || a[0] < 0 || a[0] > 255)
                return false;
            if ((!a[1] && a[1] != 0) || isNaN(a[1]) || a[1] < 0 || a[1] > 255)
                return false;
            if ((!a[2] && a[2] != 0) || isNaN(a[2]) || a[2] < 0 || a[2] > 255)
                return false;

            return true;
        },
        cssRGB: function (rgbStr) {
            if (typeof rgbStr !== "string")
                return null;
            if (rgbStr.length == 0)
                return null;
            var valArr = rgbStr.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            var color = [parseInt(valArr[1]), parseInt(valArr[2]), parseInt(valArr[3])];
            return color;
        },
        overlay: function (color1, color2, alpha) {
            if (isNaN(alpha))
                alpha = .5;
            if (typeof color1 === "string")
                color1 = this.hex2rgb(color1);
            if (typeof color2 === "string")
                color2 = this.hex2rgb(color2);

            var newColor = [];
            for (var i = 0, l = color1.length; i < l; i++) {
                newColor[i] = Math.floor((1 - alpha) * color1[i] + alpha * color2[i]);
            }
            return this.rgb2hex(newColor[0], newColor[1], newColor[2]);
        }
    };
        
})();