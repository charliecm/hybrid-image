/**
 * Filter
 * Image manipulation filters.
 */

import * as Helper from './Helper';

/**
 * Applies a filter to a source image.
 * https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/
 * @param {ImageData} src Source image buffer.
 * @param {Function} operation Filter operation to perform.
 * @param {arguments} params Parameters to pass into operation function.
 */
export function apply(src:ImageData, operation:Function, ...params):ImageData {
    let width:number = src.width,
        height:number = src.height,
        result = new ImageData(src.width, src.height),
        buf = new ArrayBuffer(width * height * 4),
        buf8:Uint8ClampedArray = new Uint8ClampedArray(buf),
        buf32:Uint32Array = new Uint32Array(buf);
    for (let x:number = 0; x < width; x++) {
        for (let y:number = 0; y < height; y++) {
            let {r, g, b} = operation.apply(this, [x, y, src, ...params]);
            r = Helper.clip(r);
            g = Helper.clip(g);
            b = Helper.clip(b);
            buf32[x + y * width] = (255 << 24) | (b << 16) | (g << 8) | r;
        }
    }
    result.data.set(buf8);
    return result;
}

/**
 * Performs a convolution filter.
 * TODO: Implement a faster convolution algorithm.
 * @param {ImageData} src Source image buffer.
 * @param {number[][]} matrix Matrix to apply.
 */
export function applyConvolve(src:ImageData, matrix:number[][]):ImageData {
    let width:number = src.width,
        height:number = src.height,
        marginX:number = (matrix.length - 1) / 2,
        marginY:number = (matrix[0].length - 1) / 2,
        marginWidth:number = width + marginX * 2,
        marginHeight:number = height + marginY * 2,
        result:ImageData = new ImageData(width, height),
        resultBuf:ArrayBuffer = new ArrayBuffer(width * height * 4),
        resultBuf8:Uint8ClampedArray = new Uint8ClampedArray(resultBuf),
        resultBuf32:Uint32Array = new Uint32Array(resultBuf),
        margin:ImageData = new ImageData(marginWidth, marginHeight),
        marginBuf:ArrayBuffer = new ArrayBuffer(marginWidth * marginHeight * 4),
        marginBuf8:Uint8ClampedArray = new Uint8ClampedArray(marginBuf),
        marginBuf32:Uint32Array = new Uint32Array(marginBuf),
        setMarginRGB = (srcX:number, srcY:number, destX:number, destY:number) => {
            let {r, g, b} = this.getRGB(src, srcX, srcY);
            marginBuf32[destX + destY * marginWidth] = (255 << 24) | (b << 16) | (g << 8) | r;
        };
    // Mirror corners
    for (let x:number = 0; x < marginX; x++) {
        for (let y:number = 0; y < marginY; y++) {
            setMarginRGB(marginY - y, marginX - x, x, y);
            setMarginRGB(width - marginY + y, x, x + marginWidth - marginX, y);
            setMarginRGB(width - 1 - y, height - 1 - x, x + marginWidth - marginX, y + marginHeight - marginY);
            setMarginRGB(y, height - 1 - marginY + x, x, y + marginHeight - marginY);
        }
    }
    // Mirror horizontal margins
    for (let x:number = marginX; x < (marginWidth - marginX); x++) {
        for (let y:number = 0; y < marginY; y++) {
            setMarginRGB(x - marginX, marginY - y, x, y);
            setMarginRGB(x - marginX, height - 1 - y, x, y + marginHeight - marginY);
        }
    }
    // Mirror vertical margins
    for (let x:number = 0; x < marginX; x++) {
        for (let y:number = marginY; y < (marginHeight - marginY); y++) {
            setMarginRGB(marginX - x, y - marginY, x, y);
            setMarginRGB(width - 1 - x, y - marginY, x + marginWidth - marginX, y);
        }
    }
    margin.data.set(marginBuf8);
    // Perform convolution
    for (let x:number = 0; x < width; x++) {
        for (let y:number = 0; y < height; y++) {
            let r:number = 0,
                g:number = 0,
                b:number = 0;
            for (let relX:number = -marginX; relX <= marginX; relX++) {
                for (let relY:number = -marginY; relY <= marginY; relY++) {
                    let xx = x + relX,
                        yy = y + relY,
                        isOutside = (xx < 0 || xx >= width || yy < 0 || yy >= height),
                        {r:relR, g:relG, b:relB} = (isOutside) ? this.getRGB(margin, xx + marginX, yy + marginY) : this.getRGB(src, xx, yy),
                        multiplier = matrix[relX + marginX][relY + marginY];
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

/**
 * Returns a custom gaussian convoultion matrix.
 * From http://stackoverflow.com/questions/8204645/implementing-gaussian-blur-how-to-calculate-convolution-matrix-kernel.
 */
export function getGaussianMatrix(hsize:number = 3, sigma:number = 1):number[][] {
    let kernel:number[][] = [],
        mean:number = hsize / 2,
        sum:number = 0,
        x:number, y:number;
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

/**
 * Returns the RGBA data of a pixel.
 * @param {ImageData} src Source image.
 * @param {number} x Horizontal position in image.
 * @param {number} y Vertical position in image.
 */
export function getRGB(src:ImageData, x:number, y:number) {
    let i = (x + y * src.width) * 4,
        data = src.data;
    return {
        r: data[i],
        g: data[++i],
        b: data[++i],
        a: data[++i]
    };
}

/**
 * Brightens a pixel.
 * @param {number} intensity Multiplication intensity.
 */
export function brighten(x:number, y:number, src:ImageData, intensity:number) {
    let {r, g, b} = this.getRGB(src, x, y);
    r *= intensity;
    g *= intensity;
    b *= intensity;
    return {r, g, b};
}

/**
 * Darkens a pixel.
 * @param {number} intensity Division intensity.
 */
export function darken(x:number, y:number, src:ImageData, intensity:number) {
    let {r, g, b} = this.getRGB(src, x, y);
    r /= intensity;
    g /= intensity;
    b /= intensity;
    return {r, g, b};
}

/**
 * Converts pixel to grayscale.
 */
export function grayscale(x:number, y:number, src:ImageData) {
    let {r, g, b} = this.getRGB(src, x, y);
    r = g = b = (r + g + b) / 3;
    return {r, g, b};
}

/**
 * Inverts pixel value.
 */
export function invert(x:number, y:number, src:ImageData) {
    let {r, g, b} = this.getRGB(src, x, y);
    r = 255 - r;
    g = 255 - g;
    b = 255 - b;
    return {r, g, b};
}

/**
 * Adds a pixel value from two sources.
 * @param {number} shiftValue Shift value.
 */
export function add(x:number, y:number, srcA:ImageData, srcB:ImageData, shiftValue:number = 0) {
    let {r:rA, g:gA, b:bA} = this.getRGB(srcA, x, y),
        {r:rB, g:gB, b:bB} = this.getRGB(srcB, x, y),
        r:number = rA + rB - shiftValue,
        g:number = gA + gB - shiftValue,
        b:number = bA + bB - shiftValue;
    return {r, g, b};
}

/**
 * Subtracts a pixel value symmetrically from two sources.
 * @param {boolean} isSymmetrical Perform symmetrical subtraction (absolute value).
 * @param {number} shiftValue Shift value.
 */
export function subtract(x:number, y:number, srcA:ImageData, srcB:ImageData, isSymmetrical:boolean = true, shiftValue:number = 0) {
    let {r:rA, g:gA, b:bA} = this.getRGB(srcA, x, y),
        {r:rB, g:gB, b:bB} = this.getRGB(srcB, x, y),
        r:number = ((isSymmetrical) ? Math.abs(rA - rB) : rA - rB) + shiftValue,
        g:number = ((isSymmetrical) ? Math.abs(gA - gB) : gA - gB) + shiftValue,
        b:number = ((isSymmetrical) ? Math.abs(bA - bB) : bA - bB) + shiftValue;
    return {r, g, b};
}

/**
 * Multiplies a pixel value from two sources.
 */
export function multiply(x:number, y:number, srcA:ImageData, srcB:ImageData) {
    let {r:rA, g:gA, b:bA} = this.getRGB(srcA, x, y),
        {r:rB, g:gB, b:bB} = this.getRGB(srcB, x, y),
        max:number = 255,
        r:number = (rA * rB) / max,
        g:number = (gA * gB) / max,
        b:number = (bA * bB) / max;
    return {r, g, b};
}

/**
 * Performs a screen filter on a pixel from two sources.
 */
export function screen(x:number, y:number, srcA:ImageData, srcB:ImageData) {
    let {r:rA, g:gA, b:bA} = this.getRGB(srcA, x, y),
        {r:rB, g:gB, b:bB} = this.getRGB(srcB, x, y),
        max:number = 255,
        r:number = max * (1 - ((1 - rA/max) * (1 - rB/max))),
        g:number = max * (1 - ((1 - gA/max) * (1 - gB/max))),
        b:number = max * (1 - ((1 - bA/max) * (1 - bB/max)));
    return {r, g, b};
}

/**
 * Performs an overlay filter (screen/multiply) on a pixel from two sources.
 */
export function overlay(x:number, y:number, srcA:ImageData, srcB:ImageData) {
    let {r:rA, g:gA, b:bA} = this.getRGB(srcA, x, y),
        {r:rB, g:gB, b:bB} = this.getRGB(srcB, x, y),
        max:number = 255,
        r:number = (rA >= max/2) ? (max * (1 - 2 * ((1 - rA/max) * (1 - rB/max)))) : 2 * ((rA * rB) / max),
        g:number = (gA >= max/2) ? (max * (1 - 2 * ((1 - gA/max) * (1 - gB/max)))) : 2 * ((gA * gB) / max),
        b:number = (bA >= max/2) ? (max * (1 - 2 * ((1 - bA/max) * (1 - bB/max)))) : 2 * ((bA * bB) / max);
    return {r, g, b};
}

/**
 * Dissolves a pixel value from one source to another.
 */
export function dissolve(x:number, y:number, srcA:ImageData, srcB:ImageData, intensity:number) {
    let {r:rA, g:gA, b:bA} = this.getRGB(srcA, x, y),
        {r:rB, g:gB, b:bB} = this.getRGB(srcB, x, y),
        r:number = (rA * intensity) + ((1 - intensity) * rB),
        g:number = (gA * intensity) + ((1 - intensity) * gB),
        b:number = (bA * intensity) + ((1 - intensity) * bB);
    return {r, g, b};
}