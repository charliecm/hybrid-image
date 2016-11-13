/**
 * Main
 */

import Canvas from './Canvas';
import * as Operation from './Operation';
import Section from './Section';

class Main {
	imgA:HTMLImageElement;
	imgB:HTMLImageElement;
	count:number = 0;
	constructor() {
		let imgA = this.imgA = document.createElement('img'),
			imgB = this.imgB = document.createElement('img'),
			section:Section = new Section('Input Images');
		imgA.onload = this.generateImage.bind(this);
		imgA.src = 'images/daniel-radcliffe.png';
		imgB.onload = this.generateImage.bind(this);
		imgB.src = 'images/elijah-wood.png';
		section.append(imgA);
		section.append(imgB);
		document.body.appendChild(section.element);
	}
	generateImage() {
		if (++this.count < 2) {
			return;
		}
		let section:Section = new Section('Canvas Images'),
			sectionBody = section.body,
			lowPass = Operation.lowPass(Operation.getImageData(this.imgA), 6),
			highPass = Operation.highPass(Operation.getImageData(this.imgA)),
			hybrid = Operation.hybridImage(lowPass, highPass),
			canvasA:Canvas = new Canvas(lowPass, sectionBody),
			canvasB:Canvas = new Canvas(highPass, sectionBody),
			canvasC:Canvas = new Canvas(hybrid, sectionBody);
		document.body.appendChild(section.element);
	}
}
let main = new Main();