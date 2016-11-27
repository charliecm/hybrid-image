/**
 * Helper
 * A set of helper functions.
 */

/**
 * Clips a value to 8-bit color range.
 * @param {number} val Color value.
 */
export function clip(val:number):number {
    return Math.min(Math.max(val, 0), 255);
}

/**
 * Clamps a value within the specific number range.
 * @param {number} val Value.
 * @param {number} min Minimum value.
 * @param {number} max Maximum value.
 */
export function clamp(val:number, min:number, max:number):number {
    return Math.min(Math.max(val, min), max);
}

/**
 * Debounce
 * https://gist.github.com/steveosoule/8c98a41d20bb77ae62f7
 */
export function debounce(func:Function, wait:number, immediate?:boolean):Function {
	let timeout;
	return function() {
		let context = this, args = arguments;
		let later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		let callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}

/**
 * Returns a cloned ImageData instance.
 * @param {ImageData} src Original image data.
 * @return {ImageData} Cloned image data.
 */
export function cloneImageData(src:ImageData):ImageData {
	let dest = new ImageData(src.width, src.height),
		copy = new Uint8ClampedArray(src.data);
	dest.data.set(copy);
	return dest;
}

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