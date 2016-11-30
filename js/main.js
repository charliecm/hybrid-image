/**
 * Helper
 * A set of helper functions.
 */
define("Helper", ["require", "exports"], function (require, exports) {
    "use strict";
    /**
     * Clips a value to 8-bit color range.
     * @param {number} val Color value.
     */
    function clip(val) {
        return Math.min(Math.max(val, 0), 255);
    }
    exports.clip = clip;
    /**
     * Clamps a value within the specific number range.
     * @param {number} val Value.
     * @param {number} min Minimum value.
     * @param {number} max Maximum value.
     */
    function clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
    }
    exports.clamp = clamp;
    /**
     * Debounce
     * https://gist.github.com/steveosoule/8c98a41d20bb77ae62f7
     */
    function debounce(func, wait, immediate) {
        var timeout;
        return function () {
            var context = this, args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate)
                    func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow)
                func.apply(context, args);
        };
    }
    exports.debounce = debounce;
    /**
     * Returns a cloned ImageData instance.
     * @param {ImageData} src Original image data.
     * @return {ImageData} Cloned image data.
     */
    function cloneImageData(src) {
        var dest = new ImageData(src.width, src.height), copy = new Uint8ClampedArray(src.data);
        dest.data.set(copy);
        return dest;
    }
    exports.cloneImageData = cloneImageData;
    /**
     * Returns the image buffer from an image element.
     * @param {HTMLImageElement} img Image element.
     */
    function getImageData(img) {
        var canvas = document.createElement('canvas'), c = canvas.getContext('2d'), width = canvas.width = img.naturalWidth, height = canvas.height = img.naturalHeight;
        c.drawImage(img, 0, 0);
        return c.getImageData(0, 0, width, height);
    }
    exports.getImageData = getImageData;
});
/**
 * Canvas
 * Wrapper for canvas element.
 */
define("Canvas", ["require", "exports", "Helper"], function (require, exports, Helper) {
    "use strict";
    var Canvas = (function () {
        /**
         * @param {ImageData} img Image to display.
         * @param {boolean} isSmall Display a smaller canvas.
         */
        function Canvas(img, isPreview) {
            var _this = this;
            if (isPreview === void 0) { isPreview = false; }
            var ele = this.ele = document.createElement('canvas');
            this.context = ele.getContext('2d');
            ele.className = 'canvas' + (isPreview ? ' canvas--preview' : '');
            if (img) {
                this.drawImage(img);
            }
            if (isPreview) {
                // Add ability to drag and change its size
                var isDragging = false, startX_1, startWidth_1, onDrag_1 = function (event) {
                    var dx = event.x - startX_1;
                    ele.style.maxWidth = Helper.clamp(startWidth_1 + dx, 0, _this.width).toString() + 'px';
                }, onRelease_1 = function (event) {
                    window.removeEventListener('mousemove', onDrag_1);
                    window.removeEventListener('mouseup', onRelease_1);
                };
                ele.addEventListener('mousedown', function (event) {
                    startX_1 = event.x;
                    startWidth_1 = parseInt(window.getComputedStyle(ele).maxWidth);
                    window.addEventListener('mousemove', onDrag_1);
                    window.addEventListener('mouseup', onRelease_1);
                });
            }
        }
        /**
         * Draws an image.
         * @param {ImageData} img Image buffer.
         */
        Canvas.prototype.drawImage = function (img) {
            var c = this.context, width = this.width = this.ele.width = img.width, height = this.width = this.ele.height = img.height;
            c.putImageData(img, 0, 0);
        };
        /**
         * Resets the canvas.
         */
        Canvas.prototype.reset = function () {
            this.context.clearRect(0, 0, this.width, this.height);
        };
        Object.defineProperty(Canvas.prototype, "element", {
            get: function () {
                return this.ele;
            },
            enumerable: true,
            configurable: true
        });
        return Canvas;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Canvas;
});
/**
 * Filter
 * Image manipulation filters.
 */
define("Filter", ["require", "exports", "Helper"], function (require, exports, Helper) {
    "use strict";
    /**
     * Applies a filter to a source image.
     * https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/
     * @param {ImageData} src Source image buffer.
     * @param {Function} operation Filter operation to perform.
     * @param {arguments} params Parameters to pass into operation function.
     */
    function apply(src, operation) {
        var params = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            params[_i - 2] = arguments[_i];
        }
        var width = src.width, height = src.height, result = new ImageData(src.width, src.height), buf = new ArrayBuffer(width * height * 4), buf8 = new Uint8ClampedArray(buf), buf32 = new Uint32Array(buf);
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                var _a = operation.apply(this, [x, y, src].concat(params)), r = _a.r, g = _a.g, b = _a.b;
                r = Helper.clip(r);
                g = Helper.clip(g);
                b = Helper.clip(b);
                buf32[x + y * width] = (255 << 24) | (b << 16) | (g << 8) | r;
            }
        }
        result.data.set(buf8);
        return result;
    }
    exports.apply = apply;
    /**
     * Performs a convolution filter.
     * TODO: Implement a faster convolution algorithm.
     * @param {ImageData} src Source image buffer.
     * @param {number[][]} matrix Matrix to apply.
     */
    function applyConvolve(src, matrix) {
        var _this = this;
        var width = src.width, height = src.height, marginX = (matrix.length - 1) / 2, marginY = (matrix[0].length - 1) / 2, marginWidth = width + marginX * 2, marginHeight = height + marginY * 2, result = new ImageData(width, height), resultBuf = new ArrayBuffer(width * height * 4), resultBuf8 = new Uint8ClampedArray(resultBuf), resultBuf32 = new Uint32Array(resultBuf), margin = new ImageData(marginWidth, marginHeight), marginBuf = new ArrayBuffer(marginWidth * marginHeight * 4), marginBuf8 = new Uint8ClampedArray(marginBuf), marginBuf32 = new Uint32Array(marginBuf), setMarginRGB = function (srcX, srcY, destX, destY) {
            var _a = _this.getRGB(src, srcX, srcY), r = _a.r, g = _a.g, b = _a.b;
            marginBuf32[destX + destY * marginWidth] = (255 << 24) | (b << 16) | (g << 8) | r;
        };
        // Mirror corners
        for (var x = 0; x < marginX; x++) {
            for (var y = 0; y < marginY; y++) {
                setMarginRGB(marginY - y, marginX - x, x, y);
                setMarginRGB(width - marginY + y, x, x + marginWidth - marginX, y);
                setMarginRGB(width - 1 - y, height - 1 - x, x + marginWidth - marginX, y + marginHeight - marginY);
                setMarginRGB(y, height - 1 - marginY + x, x, y + marginHeight - marginY);
            }
        }
        // Mirror horizontal margins
        for (var x = marginX; x < (marginWidth - marginX); x++) {
            for (var y = 0; y < marginY; y++) {
                setMarginRGB(x - marginX, marginY - y, x, y);
                setMarginRGB(x - marginX, height - 1 - y, x, y + marginHeight - marginY);
            }
        }
        // Mirror vertical margins
        for (var x = 0; x < marginX; x++) {
            for (var y = marginY; y < (marginHeight - marginY); y++) {
                setMarginRGB(marginX - x, y - marginY, x, y);
                setMarginRGB(width - 1 - x, y - marginY, x + marginWidth - marginX, y);
            }
        }
        margin.data.set(marginBuf8);
        // Perform convolution
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                var r = 0, g = 0, b = 0;
                for (var relX = -marginX; relX <= marginX; relX++) {
                    for (var relY = -marginY; relY <= marginY; relY++) {
                        var xx = x + relX, yy = y + relY, isOutside = (xx < 0 || xx >= width || yy < 0 || yy >= height), _a = (isOutside) ? this.getRGB(margin, xx + marginX, yy + marginY) : this.getRGB(src, xx, yy), relR = _a.r, relG = _a.g, relB = _a.b, multiplier = matrix[relX + marginX][relY + marginY];
                        relR *= multiplier;
                        relG *= multiplier;
                        relB *= multiplier;
                        r += relR;
                        g += relG;
                        b += relB;
                    }
                }
                r = Helper.clip(r);
                g = Helper.clip(g);
                b = Helper.clip(b);
                resultBuf32[x + y * width] = (255 << 24) | (b << 16) | (g << 8) | r;
            }
        }
        result.data.set(resultBuf8);
        return result;
    }
    exports.applyConvolve = applyConvolve;
    /**
     * Returns a custom gaussian convoultion matrix.
     * From http://stackoverflow.com/questions/8204645/implementing-gaussian-blur-how-to-calculate-convolution-matrix-kernel.
     */
    function getGaussianMatrix(hsize, sigma) {
        if (hsize === void 0) { hsize = 3; }
        if (sigma === void 0) { sigma = 1; }
        var kernel = [], mean = hsize / 2, sum = 0, x, y;
        for (x = 0; x < hsize; x++) {
            kernel[x] = [];
            for (y = 0; y < hsize; y++) {
                kernel[x][y] = Math.exp(-0.5 * (Math.pow((x - mean) / sigma, 2.0) + Math.pow((y - mean) / sigma, 2.0)) / (2 * Math.PI * sigma * sigma));
                sum += kernel[x][y];
            }
        }
        // Normalize the kernel
        for (x = 0; x < hsize; ++x) {
            for (y = 0; y < hsize; ++y) {
                kernel[x][y] /= sum;
            }
        }
        return kernel;
    }
    exports.getGaussianMatrix = getGaussianMatrix;
    /**
     * Returns the RGBA data of a pixel.
     * @param {ImageData} src Source image.
     * @param {number} x Horizontal position in image.
     * @param {number} y Vertical position in image.
     */
    function getRGB(src, x, y) {
        var i = (x + y * src.width) * 4, data = src.data;
        return {
            r: data[i],
            g: data[++i],
            b: data[++i],
            a: data[++i]
        };
    }
    exports.getRGB = getRGB;
    /**
     * Brightens a pixel.
     * @param {number} intensity Multiplication intensity.
     */
    function brighten(x, y, src, intensity) {
        var _a = this.getRGB(src, x, y), r = _a.r, g = _a.g, b = _a.b;
        r *= intensity;
        g *= intensity;
        b *= intensity;
        return { r: r, g: g, b: b };
    }
    exports.brighten = brighten;
    /**
     * Darkens a pixel.
     * @param {number} intensity Division intensity.
     */
    function darken(x, y, src, intensity) {
        var _a = this.getRGB(src, x, y), r = _a.r, g = _a.g, b = _a.b;
        r /= intensity;
        g /= intensity;
        b /= intensity;
        return { r: r, g: g, b: b };
    }
    exports.darken = darken;
    /**
     * Converts pixel to grayscale.
     */
    function grayscale(x, y, src) {
        var _a = this.getRGB(src, x, y), r = _a.r, g = _a.g, b = _a.b;
        r = g = b = (r + g + b) / 3;
        return { r: r, g: g, b: b };
    }
    exports.grayscale = grayscale;
    /**
     * Inverts pixel value.
     */
    function invert(x, y, src) {
        var _a = this.getRGB(src, x, y), r = _a.r, g = _a.g, b = _a.b;
        r = 255 - r;
        g = 255 - g;
        b = 255 - b;
        return { r: r, g: g, b: b };
    }
    exports.invert = invert;
    /**
     * Adds a pixel value from two sources.
     * @param {number} shiftValue Shift value.
     */
    function add(x, y, srcA, srcB, shiftValue) {
        if (shiftValue === void 0) { shiftValue = 0; }
        var _a = this.getRGB(srcA, x, y), rA = _a.r, gA = _a.g, bA = _a.b, _b = this.getRGB(srcB, x, y), rB = _b.r, gB = _b.g, bB = _b.b, r = rA + rB - shiftValue, g = gA + gB - shiftValue, b = bA + bB - shiftValue;
        return { r: r, g: g, b: b };
    }
    exports.add = add;
    /**
     * Subtracts a pixel value symmetrically from two sources.
     * @param {boolean} isSymmetrical Perform symmetrical subtraction (absolute value).
     * @param {number} shiftValue Shift value.
     */
    function subtract(x, y, srcA, srcB, isSymmetrical, shiftValue) {
        if (isSymmetrical === void 0) { isSymmetrical = true; }
        if (shiftValue === void 0) { shiftValue = 0; }
        var _a = this.getRGB(srcA, x, y), rA = _a.r, gA = _a.g, bA = _a.b, _b = this.getRGB(srcB, x, y), rB = _b.r, gB = _b.g, bB = _b.b, r = ((isSymmetrical) ? Math.abs(rA - rB) : rA - rB) + shiftValue, g = ((isSymmetrical) ? Math.abs(gA - gB) : gA - gB) + shiftValue, b = ((isSymmetrical) ? Math.abs(bA - bB) : bA - bB) + shiftValue;
        return { r: r, g: g, b: b };
    }
    exports.subtract = subtract;
    /**
     * Multiplies a pixel value from two sources.
     */
    function multiply(x, y, srcA, srcB) {
        var _a = this.getRGB(srcA, x, y), rA = _a.r, gA = _a.g, bA = _a.b, _b = this.getRGB(srcB, x, y), rB = _b.r, gB = _b.g, bB = _b.b, max = 255, r = (rA * rB) / max, g = (gA * gB) / max, b = (bA * bB) / max;
        return { r: r, g: g, b: b };
    }
    exports.multiply = multiply;
    /**
     * Performs a screen filter on a pixel from two sources.
     */
    function screen(x, y, srcA, srcB) {
        var _a = this.getRGB(srcA, x, y), rA = _a.r, gA = _a.g, bA = _a.b, _b = this.getRGB(srcB, x, y), rB = _b.r, gB = _b.g, bB = _b.b, max = 255, r = max * (1 - ((1 - rA / max) * (1 - rB / max))), g = max * (1 - ((1 - gA / max) * (1 - gB / max))), b = max * (1 - ((1 - bA / max) * (1 - bB / max)));
        return { r: r, g: g, b: b };
    }
    exports.screen = screen;
    /**
     * Performs an overlay filter (screen/multiply) on a pixel from two sources.
     */
    function overlay(x, y, srcA, srcB) {
        var _a = this.getRGB(srcA, x, y), rA = _a.r, gA = _a.g, bA = _a.b, _b = this.getRGB(srcB, x, y), rB = _b.r, gB = _b.g, bB = _b.b, max = 255, r = (rA >= max / 2) ? (max * (1 - 2 * ((1 - rA / max) * (1 - rB / max)))) : 2 * ((rA * rB) / max), g = (gA >= max / 2) ? (max * (1 - 2 * ((1 - gA / max) * (1 - gB / max)))) : 2 * ((gA * gB) / max), b = (bA >= max / 2) ? (max * (1 - 2 * ((1 - bA / max) * (1 - bB / max)))) : 2 * ((bA * bB) / max);
        return { r: r, g: g, b: b };
    }
    exports.overlay = overlay;
    /**
     * Dissolves a pixel value from one source to another.
     */
    function dissolve(x, y, srcA, srcB, intensity) {
        var _a = this.getRGB(srcA, x, y), rA = _a.r, gA = _a.g, bA = _a.b, _b = this.getRGB(srcB, x, y), rB = _b.r, gB = _b.g, bB = _b.b, r = (rA * intensity) + ((1 - intensity) * rB), g = (gA * intensity) + ((1 - intensity) * gB), b = (bA * intensity) + ((1 - intensity) * bB);
        return { r: r, g: g, b: b };
    }
    exports.dissolve = dissolve;
    /**
     * Adds a pixel value from two sources.
     * @param {boolean} shiftValue Shifts value by subtracting 0.5.
     */
    function addDissolve(x, y, srcA, srcB, intensity) {
        if (intensity === void 0) { intensity = 1; }
        var _a = this.getRGB(srcA, x, y), rA = _a.r, gA = _a.g, bA = _a.b, _b = this.getRGB(srcB, x, y), rB = _b.r, gB = _b.g, bB = _b.b, r = (rA) + (intensity * (rB - 128)), g = (gA) + (intensity * (gB - 128)), b = (bA) + (intensity * (bB - 128));
        return { r: r, g: g, b: b };
    }
    exports.addDissolve = addDissolve;
});
/**
 * Generator
 */
define("Generator", ["require", "exports"], function (require, exports) {
    "use strict";
});
/*
    StackBlur - a fast almost Gaussian Blur For Canvas

    Version:     0.5
    Author:        Mario Klingemann
    Contact:     mario@quasimondo.com
    Website:    http://www.quasimondo.com/StackBlurForCanvas
    Twitter:    @quasimondo

    In case you find this class useful - especially in commercial projects -
    I am not totally unhappy for a small donation to my PayPal account
    mario@quasimondo.de

    Or support me on flattr:
    https://flattr.com/thing/72791/StackBlur-a-fast-almost-Gaussian-Blur-Effect-for-CanvasJavascript

    Copyright (c) 2010 Mario Klingemann

    Permission is hereby granted, free of charge, to any person
    obtaining a copy of this software and associated documentation
    files (the "Software"), to deal in the Software without
    restriction, including without limitation the rights to use,
    copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the
    Software is furnished to do so, subject to the following
    conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
    OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
    NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
    HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
    WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
    FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
    OTHER DEALINGS IN THE SOFTWARE.
    */
define("StackBlur", ["require", "exports"], function (require, exports) {
    "use strict";
    var mul_table = [
        512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512,
        454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292, 273, 512,
        482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259, 496, 475, 456,
        437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292, 282, 273, 265, 512,
        497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373, 364, 354, 345, 337, 328,
        320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496, 485, 475, 465, 456,
        446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335,
        329, 323, 318, 312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512,
        505, 497, 489, 482, 475, 468, 461, 454, 447, 441, 435, 428, 422, 417, 411, 405,
        399, 394, 389, 383, 378, 373, 368, 364, 359, 354, 350, 345, 341, 337, 332, 328,
        324, 320, 316, 312, 309, 305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271,
        268, 265, 262, 259, 257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456,
        451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388,
        385, 381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335,
        332, 329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292,
        289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259];
    var shg_table = [
        9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17,
        17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19,
        19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20,
        20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21,
        21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21,
        21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22,
        22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,
        22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23,
        23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
        23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
        23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
        23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
        24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
        24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
        24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
        24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24];
    function processImage(img, canvas, radius, blurAlphaChannel) {
        if (typeof (img) == 'string') {
            var img = document.getElementById(img);
        }
        else if (typeof HTMLImageElement !== 'undefined' && !(img instanceof HTMLImageElement)) {
            return;
        }
        var w = img.naturalWidth;
        var h = img.naturalHeight;
        if (typeof (canvas) == 'string') {
            var canvas = document.getElementById(canvas);
        }
        else if (typeof HTMLCanvasElement !== 'undefined' && !(canvas instanceof HTMLCanvasElement)) {
            return;
        }
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        canvas.width = w;
        canvas.height = h;
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, w, h);
        context.drawImage(img, 0, 0);
        if (isNaN(radius) || radius < 1)
            return;
        if (blurAlphaChannel)
            processCanvasRGBA(canvas, 0, 0, w, h, radius);
        else
            processCanvasRGB(canvas, 0, 0, w, h, radius);
    }
    exports.image = processImage;
    function getImageDataFromCanvas(canvas, top_x, top_y, width, height) {
        if (typeof (canvas) == 'string')
            var canvas = document.getElementById(canvas);
        else if (typeof HTMLCanvasElement !== 'undefined' && !(canvas instanceof HTMLCanvasElement))
            return;
        var context = canvas.getContext('2d');
        var imageData;
        try {
            try {
                imageData = context.getImageData(top_x, top_y, width, height);
            }
            catch (e) {
                throw new Error("unable to access local image data: " + e);
            }
        }
        catch (e) {
            throw new Error("unable to access image data: " + e);
        }
        return imageData;
    }
    function processCanvasRGBA(canvas, top_x, top_y, width, height, radius) {
        if (isNaN(radius) || radius < 1)
            return;
        radius |= 0;
        var imageData = getImageDataFromCanvas(canvas, top_x, top_y, width, height);
        imageData = processImageDataRGBA(imageData, top_x, top_y, width, height, radius);
        canvas.getContext('2d').putImageData(imageData, top_x, top_y);
    }
    exports.canvasRGBA = processCanvasRGBA;
    function processImageDataRGBA(imageData, top_x, top_y, width, height, radius) {
        var pixels = imageData.data;
        var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, a_sum, r_out_sum, g_out_sum, b_out_sum, a_out_sum, r_in_sum, g_in_sum, b_in_sum, a_in_sum, pr, pg, pb, pa, rbs;
        var div = radius + radius + 1;
        var w4 = width << 2;
        var widthMinus1 = width - 1;
        var heightMinus1 = height - 1;
        var radiusPlus1 = radius + 1;
        var sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;
        var stackStart = new BlurStack();
        var stack = stackStart;
        for (i = 1; i < div; i++) {
            stack = stack.next = new BlurStack();
            if (i == radiusPlus1)
                var stackEnd = stack;
        }
        stack.next = stackStart;
        var stackIn = null;
        var stackOut = null;
        yw = yi = 0;
        var mul_sum = mul_table[radius];
        var shg_sum = shg_table[radius];
        for (y = 0; y < height; y++) {
            r_in_sum = g_in_sum = b_in_sum = a_in_sum = r_sum = g_sum = b_sum = a_sum = 0;
            r_out_sum = radiusPlus1 * (pr = pixels[yi]);
            g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
            b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
            a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);
            r_sum += sumFactor * pr;
            g_sum += sumFactor * pg;
            b_sum += sumFactor * pb;
            a_sum += sumFactor * pa;
            stack = stackStart;
            for (i = 0; i < radiusPlus1; i++) {
                stack.r = pr;
                stack.g = pg;
                stack.b = pb;
                stack.a = pa;
                stack = stack.next;
            }
            for (i = 1; i < radiusPlus1; i++) {
                p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
                r_sum += (stack.r = (pr = pixels[p])) * (rbs = radiusPlus1 - i);
                g_sum += (stack.g = (pg = pixels[p + 1])) * rbs;
                b_sum += (stack.b = (pb = pixels[p + 2])) * rbs;
                a_sum += (stack.a = (pa = pixels[p + 3])) * rbs;
                r_in_sum += pr;
                g_in_sum += pg;
                b_in_sum += pb;
                a_in_sum += pa;
                stack = stack.next;
            }
            stackIn = stackStart;
            stackOut = stackEnd;
            for (x = 0; x < width; x++) {
                pixels[yi + 3] = pa = (a_sum * mul_sum) >> shg_sum;
                if (pa != 0) {
                    pa = 255 / pa;
                    pixels[yi] = ((r_sum * mul_sum) >> shg_sum) * pa;
                    pixels[yi + 1] = ((g_sum * mul_sum) >> shg_sum) * pa;
                    pixels[yi + 2] = ((b_sum * mul_sum) >> shg_sum) * pa;
                }
                else {
                    pixels[yi] = pixels[yi + 1] = pixels[yi + 2] = 0;
                }
                r_sum -= r_out_sum;
                g_sum -= g_out_sum;
                b_sum -= b_out_sum;
                a_sum -= a_out_sum;
                r_out_sum -= stackIn.r;
                g_out_sum -= stackIn.g;
                b_out_sum -= stackIn.b;
                a_out_sum -= stackIn.a;
                p = (yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1)) << 2;
                r_in_sum += (stackIn.r = pixels[p]);
                g_in_sum += (stackIn.g = pixels[p + 1]);
                b_in_sum += (stackIn.b = pixels[p + 2]);
                a_in_sum += (stackIn.a = pixels[p + 3]);
                r_sum += r_in_sum;
                g_sum += g_in_sum;
                b_sum += b_in_sum;
                a_sum += a_in_sum;
                stackIn = stackIn.next;
                r_out_sum += (pr = stackOut.r);
                g_out_sum += (pg = stackOut.g);
                b_out_sum += (pb = stackOut.b);
                a_out_sum += (pa = stackOut.a);
                r_in_sum -= pr;
                g_in_sum -= pg;
                b_in_sum -= pb;
                a_in_sum -= pa;
                stackOut = stackOut.next;
                yi += 4;
            }
            yw += width;
        }
        for (x = 0; x < width; x++) {
            g_in_sum = b_in_sum = a_in_sum = r_in_sum = g_sum = b_sum = a_sum = r_sum = 0;
            yi = x << 2;
            r_out_sum = radiusPlus1 * (pr = pixels[yi]);
            g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
            b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
            a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);
            r_sum += sumFactor * pr;
            g_sum += sumFactor * pg;
            b_sum += sumFactor * pb;
            a_sum += sumFactor * pa;
            stack = stackStart;
            for (i = 0; i < radiusPlus1; i++) {
                stack.r = pr;
                stack.g = pg;
                stack.b = pb;
                stack.a = pa;
                stack = stack.next;
            }
            yp = width;
            for (i = 1; i <= radius; i++) {
                yi = (yp + x) << 2;
                r_sum += (stack.r = (pr = pixels[yi])) * (rbs = radiusPlus1 - i);
                g_sum += (stack.g = (pg = pixels[yi + 1])) * rbs;
                b_sum += (stack.b = (pb = pixels[yi + 2])) * rbs;
                a_sum += (stack.a = (pa = pixels[yi + 3])) * rbs;
                r_in_sum += pr;
                g_in_sum += pg;
                b_in_sum += pb;
                a_in_sum += pa;
                stack = stack.next;
                if (i < heightMinus1) {
                    yp += width;
                }
            }
            yi = x;
            stackIn = stackStart;
            stackOut = stackEnd;
            for (y = 0; y < height; y++) {
                p = yi << 2;
                pixels[p + 3] = pa = (a_sum * mul_sum) >> shg_sum;
                if (pa > 0) {
                    pa = 255 / pa;
                    pixels[p] = ((r_sum * mul_sum) >> shg_sum) * pa;
                    pixels[p + 1] = ((g_sum * mul_sum) >> shg_sum) * pa;
                    pixels[p + 2] = ((b_sum * mul_sum) >> shg_sum) * pa;
                }
                else {
                    pixels[p] = pixels[p + 1] = pixels[p + 2] = 0;
                }
                r_sum -= r_out_sum;
                g_sum -= g_out_sum;
                b_sum -= b_out_sum;
                a_sum -= a_out_sum;
                r_out_sum -= stackIn.r;
                g_out_sum -= stackIn.g;
                b_out_sum -= stackIn.b;
                a_out_sum -= stackIn.a;
                p = (x + (((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width)) << 2;
                r_sum += (r_in_sum += (stackIn.r = pixels[p]));
                g_sum += (g_in_sum += (stackIn.g = pixels[p + 1]));
                b_sum += (b_in_sum += (stackIn.b = pixels[p + 2]));
                a_sum += (a_in_sum += (stackIn.a = pixels[p + 3]));
                stackIn = stackIn.next;
                r_out_sum += (pr = stackOut.r);
                g_out_sum += (pg = stackOut.g);
                b_out_sum += (pb = stackOut.b);
                a_out_sum += (pa = stackOut.a);
                r_in_sum -= pr;
                g_in_sum -= pg;
                b_in_sum -= pb;
                a_in_sum -= pa;
                stackOut = stackOut.next;
                yi += width;
            }
        }
        return imageData;
    }
    exports.imageDataRGBA = processImageDataRGBA;
    function processCanvasRGB(canvas, top_x, top_y, width, height, radius) {
        if (isNaN(radius) || radius < 1)
            return;
        radius |= 0;
        var imageData = getImageDataFromCanvas(canvas, top_x, top_y, width, height);
        imageData = processImageDataRGB(imageData, top_x, top_y, width, height, radius);
        canvas.getContext('2d').putImageData(imageData, top_x, top_y);
    }
    exports.canvasRGB = processCanvasRGB;
    function processImageDataRGB(imageData, top_x, top_y, width, height, radius) {
        var pixels = imageData.data;
        var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, r_out_sum, g_out_sum, b_out_sum, r_in_sum, g_in_sum, b_in_sum, pr, pg, pb, rbs;
        var div = radius + radius + 1;
        var w4 = width << 2;
        var widthMinus1 = width - 1;
        var heightMinus1 = height - 1;
        var radiusPlus1 = radius + 1;
        var sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;
        var stackStart = new BlurStack();
        var stack = stackStart;
        for (i = 1; i < div; i++) {
            stack = stack.next = new BlurStack();
            if (i == radiusPlus1)
                var stackEnd = stack;
        }
        stack.next = stackStart;
        var stackIn = null;
        var stackOut = null;
        yw = yi = 0;
        var mul_sum = mul_table[radius];
        var shg_sum = shg_table[radius];
        for (y = 0; y < height; y++) {
            r_in_sum = g_in_sum = b_in_sum = r_sum = g_sum = b_sum = 0;
            r_out_sum = radiusPlus1 * (pr = pixels[yi]);
            g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
            b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
            r_sum += sumFactor * pr;
            g_sum += sumFactor * pg;
            b_sum += sumFactor * pb;
            stack = stackStart;
            for (i = 0; i < radiusPlus1; i++) {
                stack.r = pr;
                stack.g = pg;
                stack.b = pb;
                stack = stack.next;
            }
            for (i = 1; i < radiusPlus1; i++) {
                p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
                r_sum += (stack.r = (pr = pixels[p])) * (rbs = radiusPlus1 - i);
                g_sum += (stack.g = (pg = pixels[p + 1])) * rbs;
                b_sum += (stack.b = (pb = pixels[p + 2])) * rbs;
                r_in_sum += pr;
                g_in_sum += pg;
                b_in_sum += pb;
                stack = stack.next;
            }
            stackIn = stackStart;
            stackOut = stackEnd;
            for (x = 0; x < width; x++) {
                pixels[yi] = (r_sum * mul_sum) >> shg_sum;
                pixels[yi + 1] = (g_sum * mul_sum) >> shg_sum;
                pixels[yi + 2] = (b_sum * mul_sum) >> shg_sum;
                r_sum -= r_out_sum;
                g_sum -= g_out_sum;
                b_sum -= b_out_sum;
                r_out_sum -= stackIn.r;
                g_out_sum -= stackIn.g;
                b_out_sum -= stackIn.b;
                p = (yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1)) << 2;
                r_in_sum += (stackIn.r = pixels[p]);
                g_in_sum += (stackIn.g = pixels[p + 1]);
                b_in_sum += (stackIn.b = pixels[p + 2]);
                r_sum += r_in_sum;
                g_sum += g_in_sum;
                b_sum += b_in_sum;
                stackIn = stackIn.next;
                r_out_sum += (pr = stackOut.r);
                g_out_sum += (pg = stackOut.g);
                b_out_sum += (pb = stackOut.b);
                r_in_sum -= pr;
                g_in_sum -= pg;
                b_in_sum -= pb;
                stackOut = stackOut.next;
                yi += 4;
            }
            yw += width;
        }
        for (x = 0; x < width; x++) {
            g_in_sum = b_in_sum = r_in_sum = g_sum = b_sum = r_sum = 0;
            yi = x << 2;
            r_out_sum = radiusPlus1 * (pr = pixels[yi]);
            g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
            b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
            r_sum += sumFactor * pr;
            g_sum += sumFactor * pg;
            b_sum += sumFactor * pb;
            stack = stackStart;
            for (i = 0; i < radiusPlus1; i++) {
                stack.r = pr;
                stack.g = pg;
                stack.b = pb;
                stack = stack.next;
            }
            yp = width;
            for (i = 1; i <= radius; i++) {
                yi = (yp + x) << 2;
                r_sum += (stack.r = (pr = pixels[yi])) * (rbs = radiusPlus1 - i);
                g_sum += (stack.g = (pg = pixels[yi + 1])) * rbs;
                b_sum += (stack.b = (pb = pixels[yi + 2])) * rbs;
                r_in_sum += pr;
                g_in_sum += pg;
                b_in_sum += pb;
                stack = stack.next;
                if (i < heightMinus1) {
                    yp += width;
                }
            }
            yi = x;
            stackIn = stackStart;
            stackOut = stackEnd;
            for (y = 0; y < height; y++) {
                p = yi << 2;
                pixels[p] = (r_sum * mul_sum) >> shg_sum;
                pixels[p + 1] = (g_sum * mul_sum) >> shg_sum;
                pixels[p + 2] = (b_sum * mul_sum) >> shg_sum;
                r_sum -= r_out_sum;
                g_sum -= g_out_sum;
                b_sum -= b_out_sum;
                r_out_sum -= stackIn.r;
                g_out_sum -= stackIn.g;
                b_out_sum -= stackIn.b;
                p = (x + (((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width)) << 2;
                r_sum += (r_in_sum += (stackIn.r = pixels[p]));
                g_sum += (g_in_sum += (stackIn.g = pixels[p + 1]));
                b_sum += (b_in_sum += (stackIn.b = pixels[p + 2]));
                stackIn = stackIn.next;
                r_out_sum += (pr = stackOut.r);
                g_out_sum += (pg = stackOut.g);
                b_out_sum += (pb = stackOut.b);
                r_in_sum -= pr;
                g_in_sum -= pg;
                b_in_sum -= pb;
                stackOut = stackOut.next;
                yi += width;
            }
        }
        return imageData;
    }
    exports.imageDataRGB = processImageDataRGB;
    function BlurStack() {
        this.r = 0;
        this.g = 0;
        this.b = 0;
        this.a = 0;
        this.next = null;
    }
    // module.exports = {
    //     image: processImage,
    //     canvasRGBA: processCanvasRGBA,
    //     canvasRGB: processCanvasRGB,
    //     imageDataRGBA: processImageDataRGBA,
    //     imageDataRGB: processImageDataRGB
    // };
});
/**
 * Operation
 * Image manipulation operations.
 */
define("Operation", ["require", "exports", "Filter", "Helper", "StackBlur"], function (require, exports, Filter, Helper, StackBlur) {
    "use strict";
    /**
     * Returns an image buffer under a low-pass (blur) filter.
     * @param {ImageData} img Image buffer.
     * @param {number} cutoff Cut-off frequency.
     */
    function lowPass(img, cutoff) {
        var copy = Helper.cloneImageData(img);
        return StackBlur.imageDataRGB(copy, 0, 0, img.width, img.height, cutoff);
    }
    exports.lowPass = lowPass;
    /**
     * Returns an image buffer under a high-pass (sharpen) filter.
     * @param {ImageData} img Image buffer.
     * @param {number} cutoff Cut-off frequency.
     */
    function highPass(img, cutoff) {
        var copy = Helper.cloneImageData(img), lowPass = StackBlur.imageDataRGB(copy, 0, 0, img.width, img.height, cutoff);
        return Filter.apply(img, Filter.subtract, lowPass, false, 128);
    }
    exports.highPass = highPass;
    /**
     * Returns an hybrid image synthesized from a low-pass and a high-pass image.
     * @param {ImageData} lowPass Low-pass image.
     * @param {ImageData} highPass High-pass image.
     */
    function hybridImage(lowPass, highPass) {
        return Filter.apply(lowPass, Filter.overlay, highPass);
    }
    exports.hybridImage = hybridImage;
    /**
     * Returns an hybrid image synthesized from a low-pass and a high-pass image.
     * @param {ImageData} lowPass Low-pass image.
     * @param {ImageData} highPass High-pass image.
     */
    function hybridImage2(lowPass, highPass, intensity) {
        return Filter.apply(lowPass, Filter.overlay, highPass); //, intensity);
    }
    exports.hybridImage2 = hybridImage2;
});
/**
 * Section
 * An accordion section.
 */
define("Section", ["require", "exports", "Helper"], function (require, exports, Helper) {
    "use strict";
    var Section = (function () {
        /**
         * @param {string} title Title displayed in heading.
         * @param {string} description Description to display below controls.
         */
        function Section(title, description, hasBody) {
            if (hasBody === void 0) { hasBody = true; }
            this.controls = [];
            this.isExpanded = true;
            this.updateDelay = 800;
            var ele = this.ele = document.createElement('section'), eleHeading = this.eleHeading = document.createElement('h2'), eleDesc = this.eleDesc = document.createElement('div'), eleBody = this.eleBody = document.createElement('div');
            // Container
            ele.className = 'section -expanded';
            // Heading
            eleHeading.textContent = title;
            eleHeading.className = 'section__heading';
            ele.appendChild(eleHeading);
            if (description) {
                // Description
                eleDesc.className = 'section__description';
                eleDesc.textContent = description;
                ele.appendChild(eleDesc);
            }
            if (hasBody) {
                // Body
                eleBody.className = 'section__body';
                ele.appendChild(eleBody);
                // Add accordion behaviour
                eleHeading.classList.add('section__heading--accordion');
                eleHeading.addEventListener('click', this.toggle.bind(this));
            }
        }
        /**
         * Expands the accordion.
         */
        Section.prototype.expand = function () {
            this.ele.classList.add('-expanded');
            this.isExpanded = true;
        };
        /**
         * Collapses the accordion.
         */
        Section.prototype.collapse = function () {
            this.ele.classList.remove('-expanded');
            this.isExpanded = false;
        };
        /**
         * Toggles the accordion.
         */
        Section.prototype.toggle = function () {
            (this.isExpanded) ? this.collapse() : this.expand();
        };
        /**
         * Adds an element to the body.
         */
        Section.prototype.addItem = function (ele) {
            this.eleBody.appendChild(ele);
        };
        /**
         * Clear all elements in the body.
         */
        Section.prototype.clearItems = function () {
            var ele = this.eleBody;
            while (ele.firstChild) {
                ele.removeChild(ele.firstChild);
            }
        };
        /**
         * Adds a control to the control bar.
         * @param {any} instance Control definition. Should have element as a field.
         */
        Section.prototype.addControl = function (instance) {
            if (!this.eleControlBar) {
                var eleControlBar = this.eleControlBar = document.createElement('div');
                eleControlBar.className = 'section__controlbar';
                this.ele.insertBefore(eleControlBar, this.eleHeading.nextSibling);
            }
            this.controls.push(instance);
            this.eleControlBar.appendChild(instance.element);
        };
        /**
         * Adds a button to the control bar.
         * @param {string} label Label of the button.
         * @param {EventListenerOrEventListenerObject} onClick Event handler for clicking the button.
         */
        Section.prototype.addButton = function (label, onClick) {
            var ele = document.createElement('div'), eleInput = document.createElement('input'), destroy = function () {
                eleInput.removeEventListener('click', onClick);
                ele.parentNode.removeChild(ele);
            }, instance = {
                element: ele,
                label: label,
                destroy: destroy
            };
            // Container
            ele.className = 'control';
            // Input
            eleInput.className = 'control__button';
            eleInput.type = 'button';
            eleInput.value = label;
            eleInput.addEventListener('click', onClick);
            ele.appendChild(eleInput);
            // Add to DOM and model
            this.addControl(instance);
            return instance;
        };
        /**
         * Adds a download button to the control bar.
         * @param {string} label Label of the button.
         * @param {string} data Data URI of the file to download.
         * @param {string} filename File name.
         * @param {EventListenerOrEventListenerObject} onClick Event handler for clicking the button.
         */
        Section.prototype.addDownload = function (label, data, filename) {
            var ele = document.createElement('div'), eleInput = document.createElement('a'), setData = function (data) {
                eleInput.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(data);
            }, setFilename = function (filename) {
                eleInput.download = filename;
            }, destroy = function () {
                ele.parentNode.removeChild(ele);
            }, instance = {
                element: ele,
                label: label,
                setData: setData,
                setFilename: setFilename,
                destroy: destroy
            };
            // Container
            ele.className = 'control';
            // Input
            eleInput.className = 'control__button';
            eleInput.textContent = label;
            eleInput.download = filename;
            setData(data);
            ele.appendChild(eleInput);
            // Add to DOM and model
            this.addControl(instance);
            return instance;
        };
        /**
         * Adds a button to the control bar.
         * @param {string} label Label of the button.
         * @param {EventListenerOrEventListenerObject} onClick Event handler for clicking the button.
         */
        Section.prototype.addTabGroup = function (labels, onClick) {
            var ele = document.createElement('div'), eleButtons = [], activeItem, select = function (eleButton) {
                if (activeItem) {
                    activeItem.classList.remove('-active');
                }
                eleButton.classList.add('-active');
                activeItem = eleButton;
            }, selectByName = function (name) {
                var i = eleButtons.length;
                while (--i) {
                    if (name === eleButtons[i].value) {
                        select(eleButtons[i]);
                        return;
                    }
                }
            }, onTabClick = function () {
                select(this);
                onClick(this.value);
            }, destroy = function () {
                while (eleButtons.length) {
                    var eleButton = eleButtons.shift();
                    eleButton.removeEventListener('click', onTabClick);
                }
                ele.parentNode.removeChild(ele);
            }, instance = {
                element: ele,
                select: selectByName,
                destroy: destroy
            };
            // Container
            ele.className = 'control';
            // Buttons
            for (var i = 0; i < labels.length; i++) {
                var eleButton = document.createElement('input');
                eleButton.value = labels[i];
                eleButton.type = 'button';
                eleButton.className = 'control__tab-button';
                eleButton.addEventListener('click', onTabClick);
                ele.appendChild(eleButton);
                eleButtons.push(eleButton);
            }
            select(eleButtons[0]);
            // Add to DOM and model
            this.addControl(instance);
            return instance;
        };
        /**
         * Adds a parameter value input to the control bar.
         * @param {string} label Label for the input.
         * @param {number} initial Initial value.
         * @param {number} max Maximum value.
         * @param {Function} onChange Event handler for input value change.
         */
        Section.prototype.addParameter = function (label, initial, min, max, onChange) {
            var ele = document.createElement('div'), eleLabel = document.createElement('label'), eleInput = document.createElement('input'), startX = 0, startVal = 0, debounced = Helper.debounce(onChange, this.updateDelay), onDrag = function (event) {
                // Change value incrementally on drag
                var dx = event.x - startX;
                eleInput.value = Helper.clamp(startVal + Math.floor(dx / 10), min, max).toString();
                debounced(parseInt(eleInput.value));
            }, onRelease = function () {
                window.removeEventListener('mousemove', onDrag);
                window.removeEventListener('mouseup', onRelease);
            }, onMouseDown = function (event) {
                // Initiate drag
                startX = event.x;
                startVal = parseInt(eleInput.value);
                window.addEventListener('mousemove', onDrag);
                window.addEventListener('mouseup', onRelease);
            }, onInput = function () {
                debounced(parseInt(eleInput.value));
            }, destroy = function () {
                ele.removeEventListener('mousedown', onMouseDown);
                eleInput.removeEventListener('input', onInput);
                window.removeEventListener('mousemove', onDrag);
                window.removeEventListener('mouseup', onRelease);
                debounced = null;
                ele.parentNode.removeChild(ele);
            }, instance = {
                element: ele,
                label: label,
                destroy: destroy
            };
            // Container
            ele.className = 'control control--value';
            ele.addEventListener('mousedown', onMouseDown);
            // Label
            eleLabel.className = 'control__label';
            eleLabel.textContent = label;
            ele.appendChild(eleLabel);
            // Input
            eleInput.className = 'control__input';
            eleInput.type = 'number';
            eleInput.value = initial.toString();
            eleInput.max = max.toString();
            eleInput.addEventListener('input', onInput);
            ele.appendChild(eleInput);
            // Add to DOM and model
            this.addControl(instance);
            return instance;
        };
        /**
         * Adds a file upload input to the control bar.
         * @param {string} label Label for the input.
         * @param {Function} onUpload Event handler for file upload.
         */
        Section.prototype.addUpload = function (label, onUpload, isMultiple) {
            if (isMultiple === void 0) { isMultiple = false; }
            var ele = document.createElement('div'), eleWrap = document.createElement('div'), eleLabel = document.createElement('span'), eleInput = document.createElement('input'), onChange = function () {
                onUpload(this.files);
            }, destroy = function () {
                eleInput.removeEventListener('change', onChange);
                ele.parentNode.removeChild(ele);
            }, instance = {
                element: ele,
                label: label,
                destroy: destroy
            };
            // Container
            ele.className = 'control';
            // Label
            eleLabel.textContent = label;
            // Input
            eleInput.className = 'control__upload';
            eleInput.type = 'file';
            eleInput.multiple = isMultiple;
            eleInput.addEventListener('change', onChange);
            // Wrap
            eleWrap.className = 'control__upload-wrap';
            eleWrap.appendChild(eleInput);
            eleWrap.appendChild(eleLabel);
            ele.appendChild(eleWrap);
            // Add to DOM and model
            this.addControl(instance);
            return instance;
        };
        /**
         * Adds a checkbox button to the control bar.
         * @param {string} label Label of the checkbox.
         * @param {EventListenerOrEventListenerObject} onChange Event handler for toggle.
         * @param {boolean} isChecked Whether checkbox is checked by default.
         */
        Section.prototype.addCheckbox = function (label, onChange, isChecked) {
            if (isChecked === void 0) { isChecked = false; }
            var ele = document.createElement('label'), eleInput = document.createElement('input'), eleLabel = document.createElement('span'), destroy = function () {
                eleInput.removeEventListener('change', onChange);
                ele.parentNode.removeChild(ele);
            }, instance = {
                element: ele,
                label: label,
                destroy: destroy
            };
            // Container
            ele.className = 'control';
            // Input
            eleInput.className = 'control__checkbox';
            eleInput.type = 'checkbox';
            eleInput.checked = isChecked;
            eleInput.addEventListener('change', onChange);
            ele.appendChild(eleInput);
            // Label
            eleLabel.textContent = label;
            eleLabel.className = 'control__label';
            ele.appendChild(eleLabel);
            // Add to DOM and model
            this.addControl(instance);
            return instance;
        };
        /**
         * Cleans up and removes the section from document.
         */
        Section.prototype.destroy = function () {
            var ele = this.ele, inputs = this.controls;
            if (ele.parentNode) {
                ele.parentNode.removeChild(ele);
            }
            while (inputs.length) {
                inputs.pop().destroy();
            }
            this.clearItems();
        };
        Object.defineProperty(Section.prototype, "element", {
            get: function () {
                return this.ele;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Section.prototype, "body", {
            get: function () {
                return this.eleBody;
            },
            enumerable: true,
            configurable: true
        });
        return Section;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Section;
});
/**
 * HybridGenerator
 * Displays the hybrid image generator UI.
 */
define("HybridGenerator", ["require", "exports", "Canvas", "Operation", "Section"], function (require, exports, Canvas_1, Operation, Section_1) {
    "use strict";
    var HybridGenerator = (function () {
        /**
         * @param {Function} onChange Event handler for intermediary image changes.
         */
        function HybridGenerator(onChange) {
            var _this = this;
            this.onChange = onChange;
            this.canvLowPass = new Canvas_1.default();
            this.canvHighPass = new Canvas_1.default();
            this.lowPassFrequency = 8;
            this.highPassFrequency = 5;
            var ele = this.ele = document.createElement('div'), secFrequencies = this.secFrequencies = new Section_1.default('Low/High Frequency Images');
            // Add low-pass frequency input
            secFrequencies.addParameter('Low-pass frequency', this.lowPassFrequency, 0, 30, function (val) {
                _this.lowPassFrequency = val;
                _this.updateLowPass();
                _this.updateResult();
            });
            // Add high-pass frequency input
            secFrequencies.addParameter('High-pass frequency', this.highPassFrequency, 0, 30, function (val) {
                _this.highPassFrequency = val;
                _this.updateHighPass();
                _this.updateResult();
            });
            secFrequencies.addItem(this.canvLowPass.element);
            secFrequencies.addItem(this.canvHighPass.element);
            ele.appendChild(secFrequencies.element);
        }
        /**
         * Updates intermediary images from input images.
         * @param {ImageData} imgA First input image.
         * @param {ImageData} imgB Second input image.
         */
        HybridGenerator.prototype.update = function (imgA, imgB) {
            this.imgA = imgA,
                this.imgB = imgB;
            this.updateLowPass();
            this.updateHighPass();
            this.updateResult();
        };
        /**
         * Updates low pass image.
         */
        HybridGenerator.prototype.updateLowPass = function () {
            var lowPass = this.lowPass = Operation.lowPass(this.imgA, this.lowPassFrequency);
            this.canvLowPass.drawImage(lowPass);
        };
        /**
         * Updates high pass image.
         */
        HybridGenerator.prototype.updateHighPass = function () {
            var highPass = this.highPass = Operation.highPass(this.imgB, this.highPassFrequency);
            this.canvHighPass.drawImage(highPass);
        };
        /**
         * Propogates result image to parent.
         */
        HybridGenerator.prototype.updateResult = function () {
            var result = Operation.hybridImage(this.lowPass, this.highPass);
            this.onChange(result);
        };
        Object.defineProperty(HybridGenerator.prototype, "element", {
            get: function () {
                return this.ele;
            },
            enumerable: true,
            configurable: true
        });
        return HybridGenerator;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = HybridGenerator;
});
/**
 * MorphPoint
 */
define("MorphPoint", ["require", "exports"], function (require, exports) {
    "use strict";
    var MorphPoint = (function () {
        /**
         * @param {number} x Initial x position.
         * @param {number} y Initial y position.
         */
        function MorphPoint(x, y) {
            this.isSelected = false;
            this.radius = 3;
            this.radiusSelect = 10;
            this.xA = this.xB = x;
            this.yA = this.yB = y;
        }
        /**
         * Updates the position of a point.
         * @param {boolean} isA Draw point A, otherwise point B.
         * @param {number} x New x position.
         * @param {number} y New y position.
         */
        MorphPoint.prototype.update = function (isA, x, y) {
            if (isA) {
                this.xA = x;
                this.yA = y;
            }
            else {
                this.xB = x;
                this.yB = y;
            }
        };
        /**
         * Draws the point on a canvas.
         * @param {boolean} isA Draw point A, otherwise point B.
         * @param {CanvasRenderingContext2D} c Canvas rendering context.
         */
        MorphPoint.prototype.draw = function (isA, c, scale) {
            if (scale === void 0) { scale = 1; }
            var xx = (isA) ? this.xA : this.xB, yy = (isA) ? this.yA : this.yB, r = this.radius * scale;
            c.beginPath();
            c.ellipse(xx, yy, r, r, 0, 0, 2 * Math.PI);
            c.strokeStyle = '';
            c.lineWidth = 0;
            if (this.isSelected) {
                c.strokeStyle = 'black';
                c.lineWidth = 6 * scale;
                c.stroke();
                c.strokeStyle = 'white';
                c.lineWidth = 3 * scale;
                c.stroke();
                c.fillStyle = '#19CD17';
                c.fill();
            }
            else {
                c.strokeStyle = 'black';
                c.lineWidth = 3 * scale;
                c.stroke();
                c.strokeStyle = 'white';
                c.lineWidth = 1 * scale;
                c.stroke();
                c.fillStyle = 'red';
                c.fill();
            }
            c.closePath();
        };
        /**
         * Selects the point.
         */
        MorphPoint.prototype.select = function () {
            this.isSelected = true;
        };
        /**
         * Unselects the point.
         */
        MorphPoint.prototype.unselect = function () {
            this.isSelected = false;
        };
        /**
         * Returns true if point boundary contains the specified position.
         * @param {boolean} isA Draw point A, otherwise point B.
         * @param {number} x Target x position.
         * @param {number} y Target y position.
         */
        MorphPoint.prototype.contains = function (isA, x, y) {
            var xx = (isA) ? this.xA : this.xB, yy = (isA) ? this.yA : this.yB, r = this.radiusSelect;
            return (x > xx - r) && (x < xx + r) && (y > yy - r) && (y < yy + r);
        };
        return MorphPoint;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = MorphPoint;
});
/**
 * MorphEditor
 * Displays two canvases that enable addition and  manipulation of control points for image morph.
 */
define("MorphEditor", ["require", "exports", "MorphPoint"], function (require, exports, MorphPoint_1) {
    "use strict";
    var MorphEditor = (function () {
        /**
         * @param {Function} onChange Event handler for control point changes.
         */
        function MorphEditor(onChange) {
            this.points = [];
            var ele = this.ele = document.createElement('div'), canvA = this.canvA = document.createElement('canvas'), canvB = this.canvB = document.createElement('canvas');
            this.onChange = onChange;
            canvA.className = canvB.className = 'canvas';
            this.contextA = canvA.getContext('2d'),
                this.contextB = canvB.getContext('2d');
            this.bindCanvasEvents(canvA, true);
            this.bindCanvasEvents(canvB, false);
            window.addEventListener('keyup', this.handleRemovePointKey.bind(this));
            ele.appendChild(canvA);
            ele.appendChild(canvB);
        }
        /**
         * Removes a point and refresh the canvas.
         */
        MorphEditor.prototype.handleRemovePointKey = function (event) {
            var point = this.selectedPoint, points = this.points;
            if (event.keyCode !== 8) {
                return;
            }
            if (!point) {
                return;
            }
            points.splice(points.indexOf(point), 1);
            this.updateCanvas();
        };
        /**
         * Binds the canvas interaction events.
         * @param {HTMLCanvasElement} canvas Target canvas element.
         * @param {boolean} isA Is manipulating source A points.
         */
        MorphEditor.prototype.bindCanvasEvents = function (canv, isA) {
            var _this = this;
            var isMouseDown = false;
            canv.onmousedown = function (event) {
                var scale = canv.width / canv.clientWidth, x = (event.pageX - canv.offsetLeft) * scale, y = (event.pageY - canv.offsetTop) * scale, points = _this.points, hasSelect = false, selectedPoint = _this.selectedPoint;
                if (selectedPoint) {
                    selectedPoint.unselect();
                }
                for (var i = 0; i < points.length; i++) {
                    var point = points[i];
                    if (point.contains(isA, x, y)) {
                        point.select();
                        _this.selectedPoint = point;
                        hasSelect = true;
                        break;
                    }
                }
                if (!hasSelect) {
                    _this.addPoint(x, y);
                }
                isMouseDown = true;
                _this.updateCanvas();
            };
            canv.onmousemove = function (event) {
                var scale = canv.width / canv.clientWidth, x = (event.pageX - canv.offsetLeft) * scale, y = (event.pageY - canv.offsetTop) * scale, selectedPoint = _this.selectedPoint;
                if (isMouseDown && selectedPoint) {
                    selectedPoint.update(isA, x, y);
                    _this.updateCanvas();
                }
            };
            canv.onmouseup = function () {
                isMouseDown = false;
            };
            canv.onmouseout = function () {
                isMouseDown = false;
            };
        };
        /**
         * Adds a new control point.
         */
        MorphEditor.prototype.addPoint = function (xA, yA, xB, yB) {
            var point = new MorphPoint_1.default(xA, yA);
            if (xB !== undefined && yB !== undefined) {
                point.update(false, xB, yB);
            }
            this.points.push(point);
        };
        /**
         * Updates the canvas.
         */
        MorphEditor.prototype.updateCanvas = function () {
            var canv = this.canvA, scale = canv.width / canv.clientWidth, cA = this.contextA, cB = this.contextB, points = this.points;
            cA.putImageData(this.imgA, 0, 0);
            cB.putImageData(this.imgB, 0, 0);
            for (var i = 0; i < points.length; i++) {
                points[i].draw(true, cA, scale);
                points[i].draw(false, cB, scale);
            }
            this.onChange();
        };
        /**
         * Updates the source images.
         * @param {ImageData} imgA First source image.
         * @param {ImageData} imgB Second source image.
         */
        MorphEditor.prototype.updateSources = function (imgA, imgB) {
            this.imgA = imgA;
            this.imgB = imgB;
            this.canvA.width = this.canvB.width = imgA.width;
            this.canvA.height = this.canvB.height = imgA.height;
            this.updateCanvas();
        };
        /**
         * Removes all the points.
         */
        MorphEditor.prototype.clear = function () {
            this.points = [];
            this.selectedPoint = null;
            this.updateCanvas();
        };
        /**
         * Returns the control points in a format usable by ImgWarper.
         * @return {any} Object containing the arrays a and b, of ImgWarp.Point.
         */
        MorphEditor.prototype.getPoints = function () {
            var points = this.points, output = {
                a: [],
                b: []
            };
            for (var i = 0; i < points.length; i++) {
                output.a.push(new ImgWarper.Point(points[i].xA, points[i].yA));
                output.b.push(new ImgWarper.Point(points[i].xB, points[i].yB));
            }
            return output;
        };
        /**
         * Returns the control points as an exportable JSON.
         * @return {string} JSON string.
         */
        MorphEditor.prototype.getPointsAsJSON = function () {
            var points = this.points, output = [];
            for (var i = 0; i < points.length; i++) {
                output.push({
                    xA: points[i].xA,
                    yA: points[i].yA,
                    xB: points[i].xB,
                    yB: points[i].yB
                });
            }
            return JSON.stringify(output);
        };
        Object.defineProperty(MorphEditor.prototype, "element", {
            // TODO: destroy()
            get: function () {
                return this.ele;
            },
            enumerable: true,
            configurable: true
        });
        return MorphEditor;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = MorphEditor;
});
/**
 * MorphedGenerator
 * Displays the morphed image hybrid image generator UI.
 */
define("MorphedGenerator", ["require", "exports", "Canvas", "Filter", "MorphEditor", "Operation", "Section"], function (require, exports, Canvas_2, Filter, MorphEditor_1, Operation, Section_2) {
    "use strict";
    var MorphedGenerator = (function () {
        /**
         * @param {Function} onChange Event handler for intermediary image changes.
         */
        function MorphedGenerator(onChange) {
            var _this = this;
            this.onChange = onChange;
            this.morphSteps = 5;
            this.lowPassCutoff = 12;
            this.cutoffPerPass = 6;
            var ele = this.ele = document.createElement('div'), secMorphEditor = this.secMorphEditor = new Section_2.default('Morph Editor', 'Click to add a control point. Drag to move one. Press DEL to remove the selected point.'), secMorph = this.secMorph = new Section_2.default('Morphed Images', 'Add control points using the above editor, then press Update.'), secFrequencies = this.secFrequencies = new Section_2.default('Frequency Images'), morphEditor = this.morphEditor = new MorphEditor_1.default(this.updateExportData.bind(this));
            // Morph editor section
            secMorphEditor.addButton('Clear', this.clearPoints.bind(this));
            secMorphEditor.addUpload('Import', this.importPoints.bind(this));
            this.btnExport = secMorphEditor.addDownload('Export', '', 'points.json');
            // Morphed images section
            secMorph.addParameter('Steps', this.morphSteps, 1, 10, function (val) {
                _this.morphSteps = val;
                _this.updateMorph();
                _this.updateResult();
            });
            secMorph.addButton('Update', this.updateMorph.bind(this));
            // Frequency images section
            secFrequencies.addParameter('Low frequency cutoff', this.lowPassCutoff, 0, 30, function (val) {
                _this.lowPassCutoff = val;
                _this.updateFrequencyImages();
            });
            secFrequencies.addParameter('Cutoff per step', this.cutoffPerPass, 0, 30, function (val) {
                _this.cutoffPerPass = val;
                _this.updateFrequencyImages();
            });
            // Insert elements
            secMorphEditor.addItem(morphEditor.element);
            ele.appendChild(secMorphEditor.element);
            ele.appendChild(secMorph.element);
            ele.appendChild(secFrequencies.element);
        }
        /**
         * Updates the control points export button data.
         */
        MorphedGenerator.prototype.updateExportData = function () {
            this.btnExport.setData(this.morphEditor.getPointsAsJSON());
        };
        /**
         * Handles upload completion of imported control points JSON.
         * @param {FileList} files List of uploaded files.
         */
        MorphedGenerator.prototype.importPoints = function (files) {
            // Input validation
            if (files.length === 0) {
                return;
            }
            // Begin read
            var reader = new FileReader(), editor = this.morphEditor;
            reader.onerror = function () {
                alert('Error reading the file. Please try again.');
            };
            reader.onload = function () {
                try {
                    var result = JSON.parse(reader.result);
                    if (result.length) {
                        editor.clear();
                        for (var i = 0; i < result.length; i++) {
                            if (result[i].hasOwnProperty('xA') && result[i].hasOwnProperty('yA') && result[i].hasOwnProperty('xB') && result[i].hasOwnProperty('yB')) {
                                editor.addPoint(result[i].xA, result[i].yA, result[i].xB, result[i].yB);
                            }
                        }
                        editor.updateCanvas();
                    }
                    else {
                        alert('File has an invalid JSON format. Please try again.');
                    }
                }
                catch (e) {
                    alert('Please upload a valid JSON file.');
                }
            };
            reader.readAsText(files[0]);
        };
        /**
         * Removes all control points.
         */
        MorphedGenerator.prototype.clearPoints = function () {
            this.morphEditor.clear();
        };
        /**
         * Updates intermediary images from input images.
         * @param {ImageData} imgA First input image.
         * @param {ImageData} imgB Second input image.
         */
        MorphedGenerator.prototype.update = function (imgA, imgB) {
            this.imgA = imgA,
                this.imgB = imgB;
            this.morphEditor.updateSources(imgA, imgB);
            this.updateMorph();
            this.updateResult();
        };
        /**
         * Updates intermediary morphed images.
         */
        MorphedGenerator.prototype.updateMorph = function () {
            var steps = this.morphSteps, secMorph = this.secMorph, morphs = this.morphs = [], points = this.morphEditor.getPoints(), morpher = this.morpher = new ImgWarper.Animator({
                imgData: this.imgA,
                oriPoints: points.a
            }, {
                imgData: this.imgB,
                oriPoints: points.b
            });
            secMorph.clearItems();
            if (!points.a.length) {
                return;
            }
            morpher.generate(steps + 1);
            for (var i = 0; i < morpher.frames.length; i++) {
                var result = morpher.frames[i], canv = new Canvas_2.default(result);
                secMorph.addItem(canv.element);
                morphs.push(result);
            }
            this.updateFrequencyImages();
        };
        /**
         * Updates the high and low frequency images from morphed images.
         */
        MorphedGenerator.prototype.updateFrequencyImages = function () {
            var morphs = this.morphs.slice(0).reverse(), section = this.secFrequencies, passRadius = this.cutoffPerPass, canv, finalResult, morph, lowPass, result;
            section.clearItems();
            // Generate low-pass image
            morph = Filter.apply(morphs[morphs.length - 1], Filter.grayscale),
                result = Operation.lowPass(morph, this.lowPassCutoff);
            canv = new Canvas_2.default(result);
            section.addItem(canv.element);
            finalResult = result;
            for (var i = 0; i < (morphs.length - 1); i++) {
                // Generate high-pass image
                result = morph = Filter.apply(morphs[i], Filter.grayscale);
                for (var j = 0; j < (i + 1); j++) {
                    lowPass = Operation.lowPass(morph, passRadius * (j + 1));
                    result = Filter.apply(lowPass, Filter.subtract, morph, false, 128);
                }
                canv = new Canvas_2.default(result);
                section.addItem(canv.element);
                finalResult = Operation.hybridImage2(finalResult, result, i * (1 / morphs.length));
            }
            this.onChange(finalResult);
        };
        /**
         * Propogates result image to parent.
         */
        MorphedGenerator.prototype.updateResult = function () {
            // let result:ImageData = Operation.hybridImage(this.imgA, this.imgB);
            // this.onChange(result);
        };
        Object.defineProperty(MorphedGenerator.prototype, "element", {
            get: function () {
                return this.ele;
            },
            enumerable: true,
            configurable: true
        });
        return MorphedGenerator;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = MorphedGenerator;
});
/**
 * HybridGenerator
 * Displays the hybrid image generator UI.
 */
define("App", ["require", "exports", "Canvas", "Filter", "Helper", "HybridGenerator", "MorphedGenerator", "Section"], function (require, exports, Canvas_3, Filter, Helper, HybridGenerator_1, MorphedGenerator_1, Section_3) {
    "use strict";
    var App = (function () {
        function App(parent) {
            this.count = 0;
            this.isMonochrome = true;
            this.countTotal = 2;
            this.tabOriginal = 'Original';
            this.tabMorphed = 'Morphed Image';
            this.demoAimgA = 'images/daniel-radcliffe.png';
            this.demoAimgB = 'images/elijah-wood.png';
            this.demoBimgA = 'images/einstein.jpg';
            this.demoBimgB = 'images/monroe.jpg';
            var ele = this.ele = document.createElement('article'), eleBody = this.eleBody = document.createElement('div'), imgA = this.imgA = document.createElement('img'), imgB = this.imgB = document.createElement('img'), canvResult = this.canvResult = new Canvas_3.default(), canvResultSmall = this.canvResultSmall = new Canvas_3.default(null, true), secInput = this.secInputs = new Section_3.default('Input Images', 'Please select two images with the same width and height.'), secMethod = this.secMethod = new Section_3.default('Method', 'Choose which method to generate a hybrid image with.', false), secResult = this.secResult = new Section_3.default('Result', 'Drag image to resize.'), genHybrid = this.genHybrid = new HybridGenerator_1.default(this.updateResult.bind(this)), genMorphed = this.genMorphed = new MorphedGenerator_1.default(this.updateResult.bind(this)), eleHybridTab = this.eleHybridTab = genHybrid.element, eleMorphedTab = this.eleMorphedTab = genMorphed.element;
            // Sections wrap
            ele.className = 'sections';
            // Input section
            secInput.addUpload('Upload', this.handleUpload.bind(this), true);
            secInput.addButton('Swap Images', this.swap.bind(this));
            secInput.addButton('Show Demo A', this.showDemo.bind(this, this.demoAimgA, this.demoAimgB));
            secInput.addButton('Show Demo B', this.showDemo.bind(this, this.demoBimgA, this.demoBimgB));
            secInput.addCheckbox('Monochrome', this.toggleMonochrome.bind(this), this.isMonochrome);
            imgA.className = imgB.className = 'canvas';
            secInput.addItem(imgA);
            secInput.addItem(imgB);
            // Method section
            this.tabsMethod = secMethod.addTabGroup([this.tabOriginal, this.tabMorphed], this.showTab.bind(this));
            // Result section
            canvResultSmall.element.style.maxWidth = '48px';
            secResult.addItem(canvResult.element);
            secResult.addItem(canvResultSmall.element);
            this.btnSaveImage = secResult.addDownload('Save Image', '', 'result.png');
            // Add elements
            eleHybridTab.className = eleMorphedTab.className = 'tab-section';
            eleBody.appendChild(eleHybridTab);
            eleBody.appendChild(eleMorphedTab);
            ele.appendChild(secInput.element);
            ele.appendChild(secMethod.element);
            ele.appendChild(eleBody);
            ele.appendChild(secResult.element);
            parent.appendChild(ele);
            this.showDemo(this.demoAimgA, this.demoAimgB);
        }
        /**
         * Shows the specified method tab.
         * @param {string} name Method tab name.
         */
        App.prototype.showTab = function (name) {
            this.tabsMethod.select(name);
            if (name === this.tabOriginal) {
                this.eleHybridTab.classList.add('-active');
                this.eleMorphedTab.classList.remove('-active');
                this.activeGenerator = this.genHybrid;
            }
            else {
                this.eleHybridTab.classList.remove('-active');
                this.eleMorphedTab.classList.add('-active');
                this.activeGenerator = this.genMorphed;
            }
            this.resetResult();
            this.update();
        };
        /**
         * Updates the UI.
         */
        App.prototype.update = function () {
            var imgA = Helper.getImageData(this.imgA), imgB = Helper.getImageData(this.imgB), dataA = (this.isMonochrome) ? Filter.apply(imgA, Filter.grayscale) : imgA, dataB = (this.isMonochrome) ? Filter.apply(imgB, Filter.grayscale) : imgB;
            this.activeGenerator.update(dataA, dataB);
        };
        /**
         * Updates the result image.
         * @param {ImageData} result Result image buffer.
         */
        App.prototype.updateResult = function (result) {
            var canvResult = this.canvResult;
            canvResult.drawImage(result);
            this.canvResultSmall.drawImage(result);
            this.btnSaveImage.setData(canvResult.element.toDataURL('image/png').replace('image/png', 'image/octet-stream'));
        };
        /**
         * Display an error and resets the UI.
         * @param {string} msg Message to display.
         */
        App.prototype.showError = function (msg) {
            alert(msg);
            this.reset();
        };
        /**
         * Checks if both input images are loaded.
         */
        App.prototype.checkImages = function () {
            var imgA = this.imgA, imgB = this.imgB;
            if (++this.count < this.countTotal) {
                return;
            }
            imgA.onload = imgB.onload = null;
            if (imgA.naturalWidth !== imgB.naturalWidth || imgA.naturalHeight !== imgB.naturalHeight) {
                this.showError('Please upload images with the same width and height.');
                return;
            }
            if (this.activeGenerator) {
                this.update();
            }
            else {
                this.showTab(this.tabOriginal);
            }
        };
        /**
         * Handles upload completion of input images.
         * @param {FileList} files List of uploaded files.
         */
        App.prototype.handleUpload = function (files) {
            var _this = this;
            // Input validation
            var imageExt = /\.(jpe?g|png|gif)$/i;
            if (files.length === 0) {
                return;
            }
            if (files.length !== 2) {
                this.showError('Please upload two images.');
                return;
            }
            if (!imageExt.test(files[0].name) || !imageExt.test(files[1].name)) {
                this.showError('Please upload images (jpg, png or gif).');
                return;
            }
            // Begin read
            this.reset();
            var secInput = this.secInputs, readerA = new FileReader(), readerB = new FileReader(), imgA = this.imgA, imgB = this.imgB;
            readerA.onerror = readerB.onerror = function () {
                _this.showError('Error reading images. Please try again.');
            };
            // Load first image
            readerA.onload = function () {
                imgA.onload = _this.checkImages.bind(_this);
                imgA.src = readerA.result;
            };
            readerA.readAsDataURL(files[0]);
            // Load second image
            readerB.onload = function () {
                imgB.onload = _this.checkImages.bind(_this);
                imgB.src = readerB.result;
            };
            readerB.readAsDataURL(files[1]);
        };
        /**
         * Swaps the input images.
         */
        App.prototype.swap = function () {
            if (this.imgA.src === '' || this.imgB.src === '') {
                return;
            }
            var tempA = this.imgA.src, tempB = this.imgB.src;
            this.imgA.src = tempB;
            this.imgB.src = tempA;
            this.update();
        };
        /**
         * Shows the output of demo input images.
         */
        App.prototype.showDemo = function (srcA, srcB) {
            this.reset();
            var secInput = this.secInputs, imgA = this.imgA, imgB = this.imgB;
            imgA.onload = this.checkImages.bind(this);
            imgA.src = srcA;
            imgB.onload = this.checkImages.bind(this);
            imgB.src = srcB;
        };
        /**
         * Toggles whether the input images should be monochrome.
         */
        App.prototype.toggleMonochrome = function (event) {
            this.isMonochrome = event.target.checked;
            this.update();
        };
        /**
         * Resets the result images.
         */
        App.prototype.resetResult = function () {
            this.canvResult.reset();
            this.canvResultSmall.reset();
        };
        /**
         * Resets the UI.
         */
        App.prototype.reset = function () {
            this.resetResult();
            this.imgA.src = this.imgB.src = '';
            this.count = 0;
        };
        return App;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = App;
});
/**
 * Main
 */
define("main", ["require", "exports", "App"], function (require, exports, App_1) {
    "use strict";
    var container = document.getElementById('#app'), app = new App_1.default(container);
});
//# sourceMappingURL=main.js.map