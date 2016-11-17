/**
 * Section
 * An accordion section.
 */

import * as Helper from './Helper'

export default class Section {

	protected ele:HTMLElement;
	protected eleHeading:HTMLElement;
	protected eleControlBar:HTMLElement;
	protected eleDesc:HTMLElement;
	protected eleBody:HTMLElement;
	protected controls = [];
	protected isExpanded:boolean = true;

	/**
	 * @param {string} title Title displayed in heading.
	 * @param {string} description Description to display below controls.
	 */
	constructor(title:string, description?:string, hasBody:boolean = true) {
		let ele = this.ele = document.createElement('section'),
			eleHeading = this.eleHeading = document.createElement('h2'),
			eleDesc = this.eleDesc = document.createElement('div'),
			eleBody = this.eleBody = document.createElement('div');
		// Container
		ele.className = 'section -expanded';
		// Heading
		eleHeading.textContent = title;
		eleHeading.className = 'section__heading';
		ele.appendChild(eleHeading);
		if (description) {
			// Description
			eleDesc.className = 'section__description';
			eleDesc.textContent = description;
			ele.appendChild(eleDesc);
		}
		if (hasBody) {
			// Body
			eleBody.className = 'section__body';
			ele.appendChild(eleBody);
			// Add accordion behaviour
			eleHeading.classList.add('section__heading--accordion');
			eleHeading.addEventListener('click', this.toggle.bind(this));
		}
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
	 * Adds a control to the control bar.
	 * @param {any} instance Control definition. Should have element as a field.
	 */
	private addControl(instance:any) {
		if (!this.eleControlBar) {
			let eleControlBar = this.eleControlBar = document.createElement('div');
			eleControlBar.className = 'section__controlbar';
			this.ele.insertBefore(eleControlBar, this.eleHeading.nextSibling);
		}
		this.controls.push(instance);
		this.eleControlBar.appendChild(instance.element);
	}

	/**
	 * Adds a button to the control bar.
	 * @param {string} label Label of the button.
	 * @param {EventListenerOrEventListenerObject} onClick Event handler for clicking the button.
	 */
	addButton(label:string, onClick:EventListenerOrEventListenerObject) {
		let ele:HTMLElement = document.createElement('div'),
			eleInput:HTMLInputElement = document.createElement('input'),
			destroy:Function = () => {
				eleInput.removeEventListener('click', onClick);
				ele.parentNode.removeChild(ele);
			},
			instance = {
				element: ele,
				label,
				destroy
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
		this.addControl(instance);
		return instance;
	}

	/**
	 * Adds a button to the control bar.
	 * @param {string} label Label of the button.
	 * @param {EventListenerOrEventListenerObject} onClick Event handler for clicking the button.
	 */
	addTabGroup(labels:string[], onClick:Function) {
		let ele:HTMLElement = document.createElement('div'),
			eleButtons:HTMLInputElement[] = [],
			activeItem:HTMLElement,
			select:Function = (eleButton:HTMLElement) => {
				if (activeItem) {
					activeItem.classList.remove('-active');
				}
				eleButton.classList.add('-active');
				activeItem = eleButton;
			},
			selectByName:Function = (name:string) => {
				let i:number = eleButtons.length;
				while (--i) {
					if (name === eleButtons[i].value) {
						select(eleButtons[i]);
						return;
					}
				}
			},
			onTabClick:EventListenerOrEventListenerObject = function() {
				select(this);
				onClick(this.value);
			},
			destroy:Function = () => {
				while (eleButtons.length) {
					let eleButton = eleButtons.shift();
					eleButton.removeEventListener('click', onTabClick);
				}
				ele.parentNode.removeChild(ele);
			},
			instance = {
				element: ele,
				select: selectByName,
				destroy
			};
		// Container
		ele.className = 'control';
		// Buttons
		for (let i = 0; i < labels.length; i++) {
			let eleButton = document.createElement('input');
			eleButton.value = labels[i];
			eleButton.type = 'button';
			eleButton.className = 'control__tab-button';
			eleButton.addEventListener('click', onTabClick);
			ele.appendChild(eleButton);
			eleButtons.push(eleButton);
		}
		select(eleButtons[0]);
		// Add to DOM and model
		this.addControl(instance);
		return instance;
	}

	/**
	 * Adds a parameter value input to the control bar.
	 * @param {string} label Label for the input.
	 * @param {number} initial Initial value.
	 * @param {number} max Maximum value.
	 * @param {Function} onChange Event handler for input value change.
	 */
	addParameter(label:string, initial:number, max:number, onChange:Function) {
		let ele:HTMLElement = document.createElement('div'),
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
			},
			instance = {
				element: ele,
				label,
				destroy
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
		this.addControl(instance);
		return instance;
	}

	/**
	 * Adds a file upload input to the control bar.
	 * @param {string} label Label for the input.
	 * @param {Function} onUpload Event handler for file upload.
	 */
	addUpload(label:string, onUpload:Function) {
		let ele:HTMLElement = document.createElement('div'),
			eleWrap:HTMLElement = document.createElement('div'),
			eleLabel:HTMLSpanElement = document.createElement('span'),
			eleInput:HTMLInputElement = document.createElement('input'),
			onChange:EventListenerOrEventListenerObject = function() {
				onUpload(this.files);
			},
			destroy:Function = () => {
				eleInput.removeEventListener('change', onChange);
				ele.parentNode.removeChild(ele);
			},
			instance = {
				element: ele,
				label,
				destroy
			};
		// Container
		ele.className = 'control';
		// Label
		eleLabel.textContent = label;
		// Input
		eleInput.className = 'control__upload';
		eleInput.type = 'file';
		eleInput.multiple = true;
		eleInput.addEventListener('change', onChange);
		// Wrap
		eleWrap.className = 'control__upload-wrap';
		eleWrap.appendChild(eleInput);
		eleWrap.appendChild(eleLabel);
		ele.appendChild(eleWrap);
		// Add to DOM and model
		this.addControl(instance);
		return instance;
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
