/**
 * Section
 * An accordion section.
 */

import * as Helper from './Helper'

export default class Section {
	private ele:HTMLElement;
	private headingEle:HTMLElement;
	private bodyEle:HTMLElement;
	private controlBar:HTMLElement;
	private controls = [];
	private isExpanded:boolean = true;
	constructor(title:string) {
		let ele = this.ele = document.createElement('section'),
			headingEle = this.headingEle = document.createElement('h2'),
			controlBar = this.controlBar = document.createElement('div'),
			bodyEle = this.bodyEle = document.createElement('div');
		// Container
		ele.className = 'section -expanded';
		// Heading
		headingEle.textContent = title;
		headingEle.className = 'section__heading';
		headingEle.addEventListener('click', this.toggle.bind(this));
		ele.appendChild(headingEle);
		// Control bar
		controlBar.className = 'section__controlbar';
		ele.appendChild(controlBar);
		// Body
		bodyEle.className = 'section__body';
		ele.appendChild(bodyEle);
	}
	expand() {
		this.ele.classList.add('-expanded');
		this.isExpanded = true;
	}
	collapse() {
		this.ele.classList.remove('-expanded');
		this.isExpanded = false;
	}
	toggle() {
		(this.isExpanded) ? this.collapse() : this.expand();
	}
	addItem(ele:HTMLElement) {
		this.bodyEle.appendChild(ele);
	}
	clearItems() {
		let ele = this.bodyEle;
		while (ele.firstChild) {
		    ele.removeChild(ele.firstChild);
		}
	}
	addButton(name:string, onClick:EventListenerOrEventListenerObject) {
		let element:HTMLFormElement = document.createElement('form'),
			input:HTMLInputElement = document.createElement('input'),
			destroy:Function = () => {
				input.removeEventListener('click', onClick);
				element.parentNode.removeChild(element);
			};
		// Container
		element.className = 'control';
		// Input
		input.className = 'control__button';
		input.type = 'button';
		input.value = name;
		input.addEventListener('click', onClick);
		element.appendChild(input);
		// Add to DOM and model
		this.controlBar.appendChild(element);
		this.controls.push({
			name,
			element,
			destroy
		});
	}
	addParameter(name:string, initial:number, max:number, onChange:Function) {
		let element:HTMLFormElement = document.createElement('form'),
			label:HTMLLabelElement = document.createElement('label'),
			input:HTMLInputElement = document.createElement('input'),
			startX:number = 0,
			startVal:number = 0,
			debounced:Function = Helper.debounce(onChange, 500),
			onDrag:EventListenerOrEventListenerObject = (event:MouseEvent) => {
				// Change value incrementally on drag
				let dx = event.x - startX;
				input.value = Helper.clamp(startVal + Math.floor(dx / 10), 0, max).toString();
				debounced(parseInt(input.value));
			},
			onRelease:EventListenerOrEventListenerObject = () => {
				window.removeEventListener('mousemove', onDrag);
				window.removeEventListener('mouseup', onRelease);
			},
			onMouseDown:EventListenerOrEventListenerObject = (event:MouseEvent) => {
				// Initiate drag
				startX = event.x;
				startVal = parseInt(input.value);
				window.addEventListener('mousemove', onDrag);
				window.addEventListener('mouseup', onRelease);
			},
			onInput:EventListenerOrEventListenerObject = () => {
				debounced(parseInt(input.value));
			},
			destroy:Function = () => {
				element.removeEventListener('mousedown', onMouseDown);
				input.removeEventListener('input', onInput);
				window.removeEventListener('mousemove', onDrag);
				window.removeEventListener('mouseup', onRelease);
				debounced = null;
				element.parentNode.removeChild(element);
			};
		// Container
		element.className = 'control control--value';
		element.addEventListener('mousedown', onMouseDown);
		// Label
		label.className = 'control__label';
		label.textContent = name;
		element.appendChild(label);
		// Input
		input.className = 'control__input';
		input.type = 'number';
		input.value = initial.toString();
		input.max = max.toString();
		input.addEventListener('input', onInput);
		element.appendChild(input);
		// Add to DOM and model
		this.controlBar.appendChild(element);
		this.controls.push({
			name,
			element,
			destroy
		});
	}
	addUpload(name:string, onUpload:Function) {
		let element:HTMLFormElement = document.createElement('form'),
			label:HTMLLabelElement = document.createElement('label'),
			input:HTMLInputElement = document.createElement('input'),
			onChange:EventListenerOrEventListenerObject = function() {
				onUpload(this.files);
			},
			destroy:Function = () => {
				input.removeEventListener('change', onChange);
				element.parentNode.removeChild(element);
			};
		// Container
		element.className = 'control';
		// Label
		label.className = 'control__label';
		label.textContent = name;
		element.appendChild(label);
		// Input
		input.className = 'control__upload';
		input.type = 'file';
		input.multiple = true;
		input.addEventListener('change', onChange);
		element.appendChild(input);
		// Add to DOM and model
		this.controlBar.appendChild(element);
		this.controls.push({
			name,
			element,
			destroy
		});
	}
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
		return this.bodyEle;
	}
}
