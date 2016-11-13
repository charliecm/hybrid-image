/**
 * Main
 */

import Canvas from './Canvas';
import Section from './Section';

class Main {
	imgA:HTMLImageElement;
	imgB:HTMLImageElement;
	count:number = 0;
	constructor() {
		let imgA = this.imgA = document.createElement('img');
		imgA.src = 'images/daniel-radcliffe.png';
		let imgB = this.imgB = document.createElement('img');
		imgB.src = 'images/elijah-wood.png';
		let secInputs:Section = new Section('Input Images');
		secInputs.append(imgA);
		secInputs.append(imgB);
		document.body.appendChild(secInputs.getElement());
		imgA.onload = this.generateImage.bind(this);
		imgB.onload = this.generateImage.bind(this);
	}
	generateImage() {
		if (++this.count < 2) {
			return;
		}
		let secCanvas:Section = new Section('Canvas Images');
		let canvasA:Canvas = new Canvas();
		canvasA.drawImage(this.imgA);
		let canvasB:Canvas = new Canvas();
		canvasB.drawImage(this.imgB);
		let canvasC:Canvas = new Canvas();
		canvasC.drawBlendedImage(this.imgA, this.imgB);
		secCanvas.append(canvasA.getElement());
		secCanvas.append(canvasB.getElement());
		secCanvas.append(canvasC.getElement());
		document.body.appendChild(secCanvas.getElement());
	}
}
let main = new Main();