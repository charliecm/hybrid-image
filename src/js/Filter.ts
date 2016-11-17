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
 * Performs a convolution on a pixel.
 * @param {number[][]} matrix Matrix to apply.
 * @param {boolean} shiftValues Shifts output value to the middle.
 */
export function convolve(x:number, y:number, src:ImageData, matrix:number[][], shiftValues:boolean = false) {
    let r:number = 0,
        g:number = 0,
        b:number = 0,
        radiusX = Math.floor(matrix[0].length / 2),
        radiusY = Math.floor(matrix.length / 2);
    for (let relX:number = -radiusX; relX <= radiusX; relX++) {
        for (let relY:number = -radiusY; relY <= radiusY; relY++) {
            let xx = x + relX,
                yy = y + relY;
            if (xx < 0 || xx >= src.width || yy < 0 || yy >= src.height) {
                continue;
            }
            let multiplier = matrix[relX + radiusX][relY + radiusY],
                {r:relR, g:relG, b:relB} = this.getRGB(src, xx, yy);
            relR *= multiplier;
            relG *= multiplier;
            relB *= multiplier;
            r += relR;
            g += relG;
            b += relB;
        }
    }
    if (shiftValues) {
        r += 128;
        g += 128;
        b += 128;
    }
    return {r, g, b};
}

/**
 * Subtracts a pixel value symmetrically from two sources.
 */
export function subtract(x:number, y:number, srcA:ImageData, srcB:ImageData) {
    let {r:rA, g:gA, b:bA} = this.getRGB(srcA, x, y),
        {r:rB, g:gB, b:bB} = this.getRGB(srcB, x, y),
        r:number = Math.abs(rA - rB),
        g:number = Math.abs(gA - gB),
        b:number = Math.abs(bA - bB);
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
