/**
 * Canvas
 * Wrapper for canvas element.
 */

export default class Canvas {

	private ele:HTMLCanvasElement;
	private context:CanvasRenderingContext2D;
	private width:number;
	private height:number;

	/**
	 * @param {ImageData} img Image to display.
	 * @param {boolean} isSmall Display a smaller canvas.
	 */
	constructor(img?:ImageData, isSmall:boolean = false) {
		let ele = this.ele = document.createElement('canvas');
		this.context = ele.getContext('2d');
		ele.className = 'canvas' + ((isSmall) ? ' canvas--small' : '');
		if (img) {
			this.drawImage(img);
		}
	}

	/**
	 * Draws an image.
	 * @param {ImageData} img Image buffer.
	 */
	drawImage(img:ImageData) {
		let c:CanvasRenderingContext2D = this.context,
			width = this.element.width = img.width,
			height = this.element.height = img.height;
		c.putImageData(img, 0, 0);
	}

	/**
	 * Resets the canvas.
	 */
	reset() {
		this.context.clearRect(0, 0, this.width, this.height);
	}

	get element() {
		return this.ele;
	}
	
}