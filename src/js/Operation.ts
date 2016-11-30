/**
 * Operation
 * Image manipulation operations.
 */

import * as Filter from './Filter';
import * as Helper from './Helper'; 
import * as StackBlur from './StackBlur';

/**
 * Returns an image buffer under a low-pass (blur) filter.
 * @param {ImageData} img Image buffer.
 * @param {number} cutoff Cut-off frequency.
 */
export function lowPass(img:ImageData, cutoff:number):ImageData {
    let copy = Helper.cloneImageData(img);
    return StackBlur.imageDataRGB(copy, 0, 0, img.width, img.height, cutoff);
}

/**
 * Returns an image buffer under a high-pass (sharpen) filter.
 * @param {ImageData} img Image buffer.
 * @param {number} cutoff Cut-off frequency.
 */
export function highPass(img:ImageData, cutoff?:number):ImageData {
    let copy = Helper.cloneImageData(img),
        lowPass = StackBlur.imageDataRGB(copy, 0, 0, img.width, img.height, cutoff);
    return Filter.apply(img, Filter.subtract, lowPass, false, 128);
}

/**
 * Returns an hybrid image synthesized from a low-pass and a high-pass image.
 * @param {ImageData} lowPass Low-pass image.
 * @param {ImageData} highPass High-pass image.
 */
export function hybridImage(lowPass:ImageData, highPass:ImageData):ImageData {
    return Filter.apply(lowPass, Filter.overlay, highPass);
}

/**
 * Returns an hybrid image synthesized from a low-pass and a high-pass image.
 * @param {ImageData} lowPass Low-pass image.
 * @param {ImageData} highPass High-pass image.
 */
export function hybridImage2(lowPass:ImageData, highPass:ImageData, intensity:number):ImageData {
    return Filter.apply(lowPass, Filter.overlay, highPass); //, intensity);
}