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
	filter(src:ImageData, operation:Function, ...params):ImageData {
		// https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/
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
	getRGB(x:number, y:number, src:ImageData) {
		let i = (x + y * src.width) * 4,
			data = src.data;
		return {
			r: data[i],
			g: data[++i],
			b: data[++i],
			a: data[++i]
		};
	}
	brighten(x:number, y:number, src:ImageData, intensity:number) {
		let {r, g, b} = this.getRGB(x, y, src);
		r *= intensity;
		g *= intensity;
		b *= intensity;
		return {r, g, b};
	}
	darken(x:number, y:number, src:ImageData, intensity:number) {
		let {r, g, b} = this.getRGB(x, y, src);
		r /= intensity;
		g /= intensity;
		b /= intensity;
		return {r, g, b};
	}
	getElement() {
		return this.element;
	}
}