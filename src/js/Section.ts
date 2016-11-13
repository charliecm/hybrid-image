/**
 * Section
 * An accordion section.
 */

export default class Section {
	ele:HTMLElement;
	headingEle:HTMLElement;
	bodyEle:HTMLElement;
	isExpanded:boolean = true;
	constructor(title:string) {
		let ele = this.ele = document.createElement('section');
		ele.className = 'section -expanded';
		let headingEle = this.headingEle = document.createElement('h2');
		headingEle.textContent = title;
		headingEle.className = 'section__heading';
		headingEle.addEventListener('click', this.toggle.bind(this));
		let bodyEle = this.bodyEle = document.createElement('div');
		bodyEle.className = 'section__body';
		ele.appendChild(headingEle);
		ele.appendChild(bodyEle);
	}
	public expand() {
		this.ele.classList.add('-expanded');
		this.isExpanded = true;
	}
	public collapse() {
		this.ele.classList.remove('-expanded');
		this.isExpanded = false;
	}
	public toggle() {
		(this.isExpanded) ? this.collapse() : this.expand();
	}
	public append(ele:HTMLElement) {
		this.bodyEle.appendChild(ele);
	}
	public clear() {
		let ele = this.ele;
		while (ele.firstChild) {
		    ele.removeChild(ele.firstChild);
		}
	}
	public getElement() {
		return this.ele;
	}
}
