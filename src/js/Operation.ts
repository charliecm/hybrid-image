/**
 * Operation
 * Image manipulation operations.
 */

import * as Filter from './Filter';
import * as StackBlur from './StackBlur';

export function getImageData(img:HTMLImageElement):ImageData {
    let canvas:HTMLCanvasElement = document.createElement('canvas'),
        c:CanvasRenderingContext2D = canvas.getContext('2d'),
        width:number = canvas.width = img.naturalWidth,
        height:number = canvas.height = img.naturalHeight;
    c.drawImage(img, 0, 0);
    return c.getImageData(0, 0, width, height);
}

export function lowPass(img:ImageData, intensity:number):ImageData {
    let monochrome = Filter.apply(img, Filter.grayscale),
        result = StackBlur.imageDataRGB(monochrome, 0, 0, img.width, img.height, intensity);
    return result;
}

export function highPass(img:ImageData, intensity:number):ImageData {
    // Laplacian of guassian (LoG) - http://fourier.eng.hmc.edu/e161/lectures/gradient/node8.html
    let matrix:number[][] = [
            [ 0, 0, 1, 0, 0 ],
            [ 0, 1, 2, 1, 0 ],
            [ 1, 2, -16, 2, 1 ],
            [ 0, 1, 2, 1, 0 ],
            [ 0, 0, 1, 0, 0 ]
        ],
        monochrome = Filter.apply(img, Filter.grayscale),
        blur = StackBlur.imageDataRGB(monochrome, 0, 0, img.width, img.height, intensity), 
        result = Filter.apply(blur, Filter.convolve, matrix, true);
    return result;
}

export function hybridImage(lowPass:ImageData, highPass:ImageData):ImageData {
    return Filter.apply(lowPass, Filter.overlay, highPass);
}
