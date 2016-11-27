/**
 * Canvas
 * Wrapper for canvas element.
 */

import * as Helper from './Helper';

export default class Canvas {

	private ele:HTMLCanvasElement;
	private context:CanvasRenderingContext2D;
	private width:number;
	private height:number;

	/**
	 * @param {ImageData} img Image to display.
	 * @param {boolean} isSmall Display a smaller canvas.
	 */
	constructor(img?:ImageData, isPreview:boolean = false) {
		let ele = this.ele = document.createElement('canvas');
		this.context = ele.getContext('2d');
		ele.className = 'canvas' + (isPreview ? ' canvas--preview': '');
		if (img) {
			this.drawImage(img);
		}
		if (isPreview) {
			// Add ability to drag and change its size
			let isDragging:boolean = false,
				startX:number, startWidth:number,
				onDrag = (event) => {
					let dx = event.x - startX;
					ele.style.maxWidth = Helper.clamp(startWidth + dx, 0, this.width).toString() + 'px';
				},
				onRelease = (event) => {
					window.removeEventListener('mousemove', onDrag);
					window.removeEventListener('mouseup', onRelease);
				};
			ele.addEventListener('mousedown', (event) => {
				startX = event.x;
				startWidth = parseInt(window.getComputedStyle(ele).maxWidth);
				window.addEventListener('mousemove', onDrag);
				window.addEventListener('mouseup', onRelease);
			});
		}
	}


	/**
	 * Draws an image.
	 * @param {ImageData} img Image buffer.
	 */
	drawImage(img:ImageData) {
		let c:CanvasRenderingContext2D = this.context,
			width = this.width = this.ele.width = img.width,
			height = this.width = this.ele.height = img.height;
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