/**
 * Canvas
 * Wrapper for canvas element.
 */

import * as StackBlur from './StackBlur';
import * as Filter from './Filter';

export default class Canvas {
	element:HTMLCanvasElement;
	context:CanvasRenderingContext2D;
	constructor() {
		this.element = document.createElement('canvas');
		let c:CanvasRenderingContext2D = this.context = this.element.getContext('2d');
	}
	getImageData(img:HTMLImageElement):ImageData {
		let canvas:HTMLCanvasElement = document.createElement('canvas'),
			c:CanvasRenderingContext2D = canvas.getContext('2d'),
			width:number = canvas.width = img.naturalWidth,
			height:number = canvas.height = img.naturalHeight;
		c.drawImage(img, 0, 0);
		return c.getImageData(0, 0, width, height);
	}
	drawBlendedImage(imgA:HTMLImageElement, imgB:HTMLImageElement) {
		let c:CanvasRenderingContext2D = this.context,
			imgDataA:ImageData = this.getImageData(imgA),
			imgDataB:ImageData = this.getImageData(imgB),
			width:number = this.element.width = imgDataA.width,
			height:number = this.element.height = imgDataA.height,
			matrix:number[][] = [
				[ -1, -1, -1 ],
				[ -1, 8, -1 ],
				[ -1, -1, -1 ]
			],
			monochromeA = Filter.apply(imgDataA, Filter.grayscale),
			monochromeB = Filter.apply(imgDataB, Filter.grayscale),
			lowPass = StackBlur.imageDataRGB(monochromeA, 0, 0, width, height, 6),
			highPass = Filter.apply(monochromeB, Filter.convolve, matrix),
			overlay = Filter.apply(lowPass, Filter.overlay, highPass);
		c.putImageData(overlay, 0, 0);
	}
	drawImage(img:HTMLImageElement) {
		let c:CanvasRenderingContext2D = this.context,
			imgData = this.getImageData(img),
			width:number = this.element.width = imgData.width,
			height:number = this.element.height = imgData.height,
			matrix:number[][] = [
				[ -1, -1, -1 ],
				[ -1, 8, -1 ],
				[ -1, -1, -1 ]
			],
			monochrome = Filter.apply(imgData, Filter.grayscale),
			highPass = Filter.apply(monochrome, Filter.convolve, matrix);
		c.putImageData(highPass, 0, 0);
	}
	getElement() {
		return this.element;
	}
}