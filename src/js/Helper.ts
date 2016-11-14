/**
 * Help Functions
 */

export function clip(val:number):number {
    return Math.min(Math.max(val, 0), 255);
}

export function clamp(val:number, min:number, max:number):number {
    return Math.min(Math.max(val, min), max);
}

// https://gist.github.com/steveosoule/8c98a41d20bb77ae62f7
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