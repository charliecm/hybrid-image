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
 * @param {number} cutoff Cut-off frequency.
 */
export function lowPass(img:ImageData, cutoff:number):ImageData {
    return Filter.applyConvolve(img, Filter.getGaussianMatrix(cutoff * 4 + 1, cutoff));
}

/**
 * Returns an image buffer under a high-pass (sharpen) filter.
 * @param {ImageData} img Image buffer.
 * @param {number} cutoff Cut-off frequency.
 */
export function highPass(img:ImageData, cutoff?:number):ImageData {
    let lowPass = Filter.applyConvolve(img, Filter.getGaussianMatrix(cutoff * 4 + 1, cutoff));
    return Filter.apply(img, Filter.subtract, lowPass, false, true);
}

/**
 * Returns an hybrid image synthesized from a low-pass and a high-pass image.
 * @param {ImageData} lowPass Low-pass image.
 * @param {ImageData} highPass High-pass image.
 */
export function hybridImage(lowPass:ImageData, highPass:ImageData):ImageData {
    return Filter.apply(lowPass, Filter.add, highPass, true);
}
