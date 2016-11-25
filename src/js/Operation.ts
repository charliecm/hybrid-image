/**
 * Operation
 * Image manipulation operations.
 */

import * as Filter from './Filter';
import * as StackBlur from './StackBlur';

/**
 * Returns the image buffer from an image element.
 * @param {HTMLImageElement} img Image element.
 */
export function getImageData(img:HTMLImageElement):ImageData {
    let canvas:HTMLCanvasElement = document.createElement('canvas'),
        c:CanvasRenderingContext2D = canvas.getContext('2d'),
        width:number = canvas.width = img.naturalWidth,
        height:number = canvas.height = img.naturalHeight;
    c.drawImage(img, 0, 0);
    return c.getImageData(0, 0, width, height);
}

/**
 * Returns an image buffer under a low-pass (blur) filter.
 * @param {ImageData} img Image buffer.
 * @param {number} radius Blur radius.
 */
export function lowPass(img:ImageData, radius:number):ImageData {
    let monochrome:ImageData = Filter.apply(img, Filter.grayscale),
        result:ImageData = StackBlur.imageDataRGB(monochrome, 0, 0, img.width, img.height, radius);
    return result;
}

/**
 * Returns an image buffer under a high-pass (sharpen) filter.
 * @param {ImageData} img Image buffer.
 * @param {number} radius Blur radius before convolution.
 */
export function highPass(img:ImageData, radius?:number):ImageData {
    // Laplacian of guassian (LoG) - http://fourier.eng.hmc.edu/e161/lectures/gradient/node8.html
    let matrix:number[][] = [
            [ 0, 0, 1, 0, 0 ],
            [ 0, 1, 2, 1, 0 ],
            [ 1, 2, -16, 2, 1 ],
            [ 0, 1, 2, 1, 0 ],
            [ 0, 0, 1, 0, 0 ]
        ],
        monochrome = Filter.apply(img, Filter.grayscale),
        blur:ImageData = monochrome, 
        result:ImageData;
    if (radius !== undefined) {
        blur = StackBlur.imageDataRGB(monochrome, 0, 0, img.width, img.height, radius); 
    }
    result = Filter.apply(blur, Filter.convolve, matrix, true)
    return result;
}

/**
 * Returns an hybrid image synthesized from a low-pass and a high-pass image.
 * @param {ImageData} lowPass Low-pass image.
 * @param {ImageData} highPass High-pass image.
 */
export function hybridImage(lowPass:ImageData, highPass:ImageData):ImageData {
    return Filter.apply(lowPass, Filter.overlay, highPass);
}
