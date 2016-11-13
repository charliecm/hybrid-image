/**
 * Canvas
 * Wrapper for canvas element.
 */

export default class Canvas {
	private ele:HTMLCanvasElement;
	private context:CanvasRenderingContext2D;
	constructor(img?:ImageData, parent?:HTMLElement) {
		let ele = this.ele = document.createElement('canvas');
		this.context = ele.getContext('2d');
		if (img) {
			this.drawImage(img);
		}
		if (parent) {
			parent.appendChild(ele);
		}
	}
	drawImage(img:ImageData) {
		let c:CanvasRenderingContext2D = this.context;
		this.element.width = img.width;
		this.element.height = img.height;
		c.putImageData(img, 0, 0);
	}
	get element() {
		return this.ele;
	}
}