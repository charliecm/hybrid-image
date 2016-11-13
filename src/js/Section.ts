/**
 * Section
 * An accordion section.
 */

export default class Section {
	private ele:HTMLElement;
	private headingEle:HTMLElement;
	private bodyEle:HTMLElement;
	private isExpanded:boolean = true;
	constructor(title:string) {
		let ele = this.ele = document.createElement('section'),
			headingEle = this.headingEle = document.createElement('h2'),
			bodyEle = this.bodyEle = document.createElement('div');
		ele.className = 'section -expanded';
		headingEle.textContent = title;
		headingEle.className = 'section__heading';
		headingEle.addEventListener('click', this.toggle.bind(this));
		bodyEle.className = 'section__body';
		ele.appendChild(headingEle);
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
	append(ele:HTMLElement) {
		this.bodyEle.appendChild(ele);
	}
	clear() {
		let ele = this.ele;
		while (ele.firstChild) {
		    ele.removeChild(ele.firstChild);
		}
	}
	get element() {
		return this.ele;
	}
	get body() {
		return this.bodyEle;
	}
}
