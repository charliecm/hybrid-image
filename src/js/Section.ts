/**
 * Section
 * An accordion section.
 */

import * as Helper from './Helper'

export default class Section {

	private ele:HTMLElement;
	private eleHeading:HTMLElement;
	private eleBody:HTMLElement;
	private eleControlBar:HTMLElement;
	private controls = [];
	private isExpanded:boolean = true;

	/**
	 * @param {string} title Title displayed in heading.
	 */
	constructor(title:string) {
		let ele = this.ele = document.createElement('section'),
			eleHeading = this.eleHeading = document.createElement('h2'),
			eleControlBar = this.eleControlBar = document.createElement('div'),
			eleBody = this.eleBody = document.createElement('div');
		// Container
		ele.className = 'section -expanded';
		// Heading
		eleHeading.textContent = title;
		eleHeading.className = 'section__heading';
		eleHeading.addEventListener('click', this.toggle.bind(this));
		ele.appendChild(eleHeading);
		// Control bar
		eleControlBar.className = 'section__controlbar';
		ele.appendChild(eleControlBar);
		// Body
		eleBody.className = 'section__body';
		ele.appendChild(eleBody);
	}

	/**
	 * Expands the accordion.
	 */
	expand() {
		this.ele.classList.add('-expanded');
		this.isExpanded = true;
	}
	
	/**
	 * Collapses the accordion.
	 */
	collapse() {
		this.ele.classList.remove('-expanded');
		this.isExpanded = false;
	}

	/**
	 * Toggles the accordion.
	 */
	toggle() {
		(this.isExpanded) ? this.collapse() : this.expand();
	}

	/**
	 * Adds an element to the body.
	 */
	addItem(ele:HTMLElement) {
		this.eleBody.appendChild(ele);
	}

	/**
	 * Clear all elements in the body.
	 */
	clearItems() {
		let ele = this.eleBody;
		while (ele.firstChild) {
		    ele.removeChild(ele.firstChild);
		}
	}

	/**
	 * Adds a button to the control bar.
	 * @param {string} label Label of the button.
	 * @param {EventListenerOrEventListenerObject} onClick Event handler for clicking the button.
	 */
	addButton(label:string, onClick:EventListenerOrEventListenerObject) {
		let ele:HTMLFormElement = document.createElement('form'),
			eleInput:HTMLInputElement = document.createElement('input'),
			destroy:Function = () => {
				eleInput.removeEventListener('click', onClick);
				ele.parentNode.removeChild(ele);
			};
		// Container
		ele.className = 'control';
		// Input
		eleInput.className = 'control__button';
		eleInput.type = 'button';
		eleInput.value = label;
		eleInput.addEventListener('click', onClick);
		ele.appendChild(eleInput);
		// Add to DOM and model
		this.eleControlBar.appendChild(ele);
		this.controls.push({
			element: ele,
			label,
			destroy
		});
	}

	/**
	 * Adds a parameter value input to the control bar.
	 * @param {string} label Label for the input.
	 * @param {number} initial Initial value.
	 * @param {number} max Maximum value.
	 * @param {Function} onChange Event handler for input value change.
	 */
	addParameter(label:string, initial:number, max:number, onChange:Function) {
		let ele:HTMLFormElement = document.createElement('form'),
			eleLabel:HTMLLabelElement = document.createElement('label'),
			eleInput:HTMLInputElement = document.createElement('input'),
			startX:number = 0,
			startVal:number = 0,
			debounced:Function = Helper.debounce(onChange, 500),
			onDrag:EventListenerOrEventListenerObject = (event:MouseEvent) => {
				// Change value incrementally on drag
				let dx = event.x - startX;
				eleInput.value = Helper.clamp(startVal + Math.floor(dx / 10), 0, max).toString();
				debounced(parseInt(eleInput.value));
			},
			onRelease:EventListenerOrEventListenerObject = () => {
				window.removeEventListener('mousemove', onDrag);
				window.removeEventListener('mouseup', onRelease);
			},
			onMouseDown:EventListenerOrEventListenerObject = (event:MouseEvent) => {
				// Initiate drag
				startX = event.x;
				startVal = parseInt(eleInput.value);
				window.addEventListener('mousemove', onDrag);
				window.addEventListener('mouseup', onRelease);
			},
			onInput:EventListenerOrEventListenerObject = () => {
				debounced(parseInt(eleInput.value));
			},
			destroy:Function = () => {
				ele.removeEventListener('mousedown', onMouseDown);
				eleInput.removeEventListener('input', onInput);
				window.removeEventListener('mousemove', onDrag);
				window.removeEventListener('mouseup', onRelease);
				debounced = null;
				ele.parentNode.removeChild(ele);
			};
		// Container
		ele.className = 'control control--value';
		ele.addEventListener('mousedown', onMouseDown);
		// Label
		eleLabel.className = 'control__label';
		eleLabel.textContent = label;
		ele.appendChild(eleLabel);
		// Input
		eleInput.className = 'control__input';
		eleInput.type = 'number';
		eleInput.value = initial.toString();
		eleInput.max = max.toString();
		eleInput.addEventListener('input', onInput);
		ele.appendChild(eleInput);
		// Add to DOM and model
		this.eleControlBar.appendChild(ele);
		this.controls.push({
			element: ele,
			label,
			destroy
		});
	}

	/**
	 * Adds a file upload input to the control bar.
	 * @param {string} label Label for the input.
	 * @param {Function} onUpload Event handler for file upload.
	 */
	addUpload(label:string, onUpload:Function) {
		let ele:HTMLFormElement = document.createElement('form'),
			eleLabel:HTMLLabelElement = document.createElement('label'),
			eleInput:HTMLInputElement = document.createElement('input'),
			onChange:EventListenerOrEventListenerObject = function() {
				onUpload(this.files);
			},
			destroy:Function = () => {
				eleInput.removeEventListener('change', onChange);
				ele.parentNode.removeChild(ele);
			};
		// Container
		ele.className = 'control';
		// Label
		eleLabel.className = 'control__label';
		eleLabel.textContent = label;
		ele.appendChild(eleLabel);
		// Input
		eleInput.className = 'control__upload';
		eleInput.type = 'file';
		eleInput.multiple = true;
		eleInput.addEventListener('change', onChange);
		ele.appendChild(eleInput);
		// Add to DOM and model
		this.eleControlBar.appendChild(ele);
		this.controls.push({
			element: ele,
			label,
			destroy
		});
	}

	/**
	 * Cleans up and removes the section from document.
	 */
	destroy() {
		let ele = this.ele,
			inputs = this.controls;
		if (ele.parentNode) {
			ele.parentNode.removeChild(ele);
		}
		while (inputs.length) {
			inputs.pop().destroy();
		}
		this.clearItems();
	}

	get element() {
		return this.ele;
	}

	get body() {
		return this.eleBody;
	}

}
