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
		let secFrequencies:Section = new Section('Low/high Frequency Images'),
			secResult:Section = new Section('Result'),
			lowPass = Operation.lowPass(Operation.getImageData(this.imgA), 6),
			highPass = Operation.highPass(Operation.getImageData(this.imgB), 2),
			hybrid = Operation.hybridImage(lowPass, highPass),
			canvasA:Canvas = new Canvas(lowPass, secFrequencies.body),
			canvasB:Canvas = new Canvas(highPass, secFrequencies.body),
			canvasC:Canvas = new Canvas(hybrid, secResult.body);
		document.body.appendChild(secFrequencies.element);
		document.body.appendChild(secResult.element);
	}
}
let main = new Main();