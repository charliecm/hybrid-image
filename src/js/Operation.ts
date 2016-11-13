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

export function highPass(img:ImageData):ImageData {
    let matrix:number[][] = [
            [ -1, -1, -1 ],
            [ -1, 8, -1 ],
            [ -1, -1, -1 ]
        ],
        monochrome = Filter.apply(img, Filter.grayscale),
        result = Filter.apply(monochrome, Filter.convolve, matrix);
    return result;
}

export function hybridImage(lowPass:ImageData, highPass:ImageData):ImageData {
    return Filter.apply(lowPass, Filter.overlay, highPass);
}
