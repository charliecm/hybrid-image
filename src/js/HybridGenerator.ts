/**
 * HybridGenerator
 * Displays the hybrid image generator UI.
 */

import Canvas from './Canvas';
import * as Operation from './Operation';
import Section from './Section';

export default class HybridGenerator {
    private element:HTMLElement;
	private imgA:HTMLImageElement;
	private imgB:HTMLImageElement;
	private secInputs:Section;
	private secFrequencies:Section;
	private secResult:Section;
    private count:number = 0;
    private readonly countTotal:number = 2;
	constructor() {
        let element:HTMLElement = this.element = document.createElement('article'),
            title:HTMLHeadingElement = document.createElement('h1'),
            secInput:Section = this.secInputs = new Section('Input images'),
            secFrequencies:Section = this.secFrequencies = new Section('Low/high frequency images'),
			secResult:Section = this.secResult = new Section('Result');
		secInput.addUpload('Select two images with same width and height', this.handleUpload.bind(this));
		secInput.addButton('Swap Images', this.swap.bind(this));
        secInput.addButton('Reset to Demo', this.showDemo.bind(this));
        title.textContent = 'Hybrid Image Generator';
        element.appendChild(title);
        element.appendChild(secInput.element);
		document.body.appendChild(element);
        this.showDemo();
	}
    private generateImage() {
        let imgA = this.imgA,
            imgB = this.imgB,
            secInput:Section = this.secInputs,
            secFrequencies:Section = this.secFrequencies,
			secResult:Section = this.secResult,
			lowPassInit:number = 6,
			highPassInit:number = 2,
			lowPass = Operation.lowPass(Operation.getImageData(imgA), lowPassInit),
			highPass = Operation.highPass(Operation.getImageData(imgB), highPassInit),
			hybrid = Operation.hybridImage(lowPass, highPass),
			canvasA:Canvas = new Canvas(lowPass, secFrequencies.body),
			canvasB:Canvas = new Canvas(highPass, secFrequencies.body),
			canvasC:Canvas = new Canvas(hybrid, secResult.body);
        // Add low-pass radius input
		secFrequencies.addParameter('Low-pass radius', lowPassInit, 30, (val) => {
			lowPass = Operation.lowPass(Operation.getImageData(imgA), val);
			hybrid = Operation.hybridImage(lowPass, highPass);
			canvasA.drawImage(lowPass);
			canvasC.drawImage(hybrid);
		});
        // Add high-pass radius input
		secFrequencies.addParameter('High-pass radius', highPassInit, 30, (val) => {
			highPass = Operation.highPass(Operation.getImageData(imgB), val);
			hybrid = Operation.hybridImage(lowPass, highPass);
			canvasB.drawImage(highPass);
			canvasC.drawImage(hybrid);
		});
        // Display sections
        secInput.addItem(imgA);
		secInput.addItem(imgB);
		document.body.appendChild(secFrequencies.element);
		document.body.appendChild(secResult.element);
	}
    private showError(message:string) {
        alert(message);
        this.reset();
    }
    private checkImages() {
        let imgA = this.imgA,
            imgB = this.imgB;
        if (++this.count < this.countTotal) {
			return;
		}
        if (imgA.naturalWidth !== imgB.naturalWidth || imgA.naturalHeight !== imgB.naturalHeight) {
            this.showError('Please upload images with the same width and height.');
            return;
        } 
        this.generateImage();
    }
    private handleUpload(files) {
        let imageExt:RegExp = /\.(jpe?g|png|gif)$/i;
        if (files.length === 0) {
            return;
        }
        if (files.length !== 2) {
            this.showError('Please upload two images.');
            return;
        }
        if (!imageExt.test(files[0].name) || !imageExt.test(files[1].name)) {
            this.showError('Please upload images (jpg, png or gif).');
            return;
        }
        this.count = 0;
        this.reset();
        let secInput = this.secInputs,
            readerA:FileReader = new FileReader(),
            readerB:FileReader = new FileReader(),
            imgA = this.imgA = document.createElement('img'),
            imgB = this.imgB = document.createElement('img');
        readerA.onerror = readerB.onerror = () => {
            this.showError('Error reading images. Please try again.')
        }
        // Load first image
        readerA.onload = () => {
            imgA.onload = this.checkImages.bind(this);
            imgA.src = readerA.result;
        };
        readerA.readAsDataURL(files[0]);
        // Load second image
        readerB.onload = () => {
            imgB.onload = this.checkImages.bind(this);
            imgB.src = readerB.result;
        };
        readerB.readAsDataURL(files[1]);
    }
    swap() {
        if (this.imgA === null || this.imgB === null) {
            return;
        }
        let tempA:HTMLImageElement = this.imgA,
            tempB:HTMLImageElement = this.imgB;
        this.reset();
        this.imgA = tempB;
        this.imgB = tempA;
        this.generateImage();
    }
	showDemo() {
        this.reset();
		let secInput = this.secInputs,
			imgA = this.imgA = document.createElement('img'),
			imgB = this.imgB = document.createElement('img');
        imgA.onload = this.checkImages.bind(this);
		imgA.src = 'images/daniel-radcliffe.png';
		imgB.onload = this.checkImages.bind(this);
		imgB.src = 'images/elijah-wood.png';
	}
    reset() {
        this.secInputs.clearItems();
        this.secFrequencies.destroy()
        this.secResult.destroy();
        this.imgA = this.imgB = null;
        this.count = 0;
	}
}
