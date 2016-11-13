/**
 * Canvas
 * Wrapper for canvas element.
 */

import * as Helper from './Helper';

export default class Canvas {
	element:HTMLCanvasElement;
	context:CanvasRenderingContext2D;
	width:number = 300;
	height:number = 200;
	constructor() {
		this.element = document.createElement('canvas');
		let c:CanvasRenderingContext2D = this.context = this.element.getContext('2d');
		c.fillStyle = 'blue';
		c.fillRect(10, 10, 100, 100);
	}
	drawImage(img:HTMLImageElement) {
		let c:CanvasRenderingContext2D = this.context,
			width:number = img.naturalWidth,
			height:number = img.naturalHeight;
		this.width = this.element.width = width;
		this.height = this.element.height = height;
		c.drawImage(img, 0, 0);
		let imgData:ImageData = c.getImageData(0, 0, width, height);
		c.putImageData(this.filter(imgData, this.darken, 2), 0, 0);
	}
	filter(imgData:ImageData, operation:Function, ...params):ImageData {
		// https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/
		let width:number = imgData.width;
		let height:number = imgData.height;
		let data:Uint8ClampedArray = imgData.data;
		let buf = new ArrayBuffer(data.length);
		let buf8:Uint8ClampedArray = new Uint8ClampedArray(buf);
		let buf32:Uint32Array = new Uint32Array(buf);
		for (let x:number = 0; x < width; x++) {
			for (let y:number = 0; y < height; y++) {
				let i:number = (x + y * width),
					j:number = i * 4,
					r:number = data[j],
					g:number = data[j + 1],
					b:number = data[j + 2];
				({r, g, b} = operation.apply(this, [r, g, b, ...params]));
				r = Helper.clip(r);
				g = Helper.clip(g);
				b = Helper.clip(b);
				buf32[i] = (255 << 24) | (b << 16) | (g << 8) | r;
			}
		}
		imgData.data.set(buf8);
		return imgData;
	}
	brighten(r:number, g:number, b:number, intensity:number):Object {
		return {
			r: r * intensity,
			g: g * intensity,
			b: b
		}
	}
	darken(r:number, g:number, b:number, intensity:number):Object {
		return {
			r: r / intensity,
			g: g / intensity,
			b: b
		}
	}
	getElement() {
		return this.element;
	}
}