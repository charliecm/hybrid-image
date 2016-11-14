/**
 * HybridGenerator
 * Displays the hybrid image generator UI.
 */

import Canvas from './Canvas';
import * as Operation from './Operation';
import Section from './Section';

export default class HybridGenerator {
    
    private ele:HTMLElement;
    private eleBody:HTMLElement
	private imgA:HTMLImageElement;
	private imgB:HTMLImageElement;
	private secInputs:Section;
	private secFrequencies:Section;
	private secResult:Section;
    private count:number = 0;
    private readonly countTotal:number = 2;

	constructor() {
        let ele:HTMLElement = this.ele = document.createElement('article'),
            eleTitle:HTMLHeadingElement = document.createElement('h1'),
            eleBody:HTMLElement = this.eleBody = document.createElement('div'),
            secInput:Section = this.secInputs = new Section('Input images'),
            secFrequencies:Section = this.secFrequencies = new Section('Low/high frequency images'),
			secResult:Section = this.secResult = new Section('Result');
        eleTitle.textContent = 'Hybrid Image Generator';
        eleBody.className = 'sections';
        secInput.addUpload('Choose 2 images with same width and height', this.handleUpload.bind(this));
		secInput.addButton('Swap Images', this.swap.bind(this));
        secInput.addButton('Reset to Demo', this.showDemo.bind(this));
        eleBody.appendChild(secInput.element);
        ele.appendChild(eleTitle);
        ele.appendChild(eleBody);
		document.body.appendChild(ele);
        this.showDemo();
	}

    /**
     * Generates the hybrid image and creates the UI for controlling the output.
     */
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
			canvLowPass:Canvas = new Canvas(lowPass),
			canvHighPass:Canvas = new Canvas(highPass),
			canvResult:Canvas = new Canvas(hybrid),
            canvResultSmall:Canvas = new Canvas(hybrid, true);
        // Add low-pass radius input
		secFrequencies.addParameter('Low-pass radius', lowPassInit, 30, (val) => {
			lowPass = Operation.lowPass(Operation.getImageData(imgA), val);
			hybrid = Operation.hybridImage(lowPass, highPass);
			canvLowPass.drawImage(lowPass);
			canvResult.drawImage(hybrid);
            canvResultSmall.drawImage(hybrid);
		});
        // Add high-pass radius input
		secFrequencies.addParameter('High-pass radius', highPassInit, 30, (val) => {
			highPass = Operation.highPass(Operation.getImageData(imgB), val);
			hybrid = Operation.hybridImage(lowPass, highPass);
			canvHighPass.drawImage(highPass);
			canvResult.drawImage(hybrid);
            canvResultSmall.drawImage(hybrid);
		});
        // Add save image  button
        secResult.addButton('Save Image', () => {
            let url = canvResult.element.toDataURL("image/png").replace("image/png", "image/octet-stream");
            window.location.href = url;
        });
        // Display sections
        imgA.className = imgB.className = 'canvas';
        secInput.addItem(imgA);
		secInput.addItem(imgB);
        secFrequencies.addItem(canvLowPass.element);
        secFrequencies.addItem(canvHighPass.element);
        secResult.addItem(canvResult.element);
        secResult.addItem(canvResultSmall.element);
		this.eleBody.appendChild(secFrequencies.element);
		this.eleBody.appendChild(secResult.element);
	}

    /**
     * Display an error and resets the UI.
     * @param {string} msg Message to display.
     */
    private showError(msg:string) {
        alert(msg);
        this.reset();
    }

    /**
     * Checks if both input images are loaded.
     */
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

    /**
     * Handles upload completion of input images.
     * @param {FileList} files List of uploaded files.
     */
    private handleUpload(files:FileList) {
        // Input validation
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
        // Begin read
        this.count = 0;
        this.reset();
        let secInput = this.secInputs,
            readerA:FileReader = new FileReader(),
            readerB:FileReader = new FileReader(),
            imgA:HTMLImageElement = this.imgA = document.createElement('img'),
            imgB:HTMLImageElement = this.imgB = document.createElement('img');
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

    /**
     * Shows the output of demo input images.
     */
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

    /**
     * Resets the UI.
     */
    reset() {
        this.secInputs.clearItems();
        this.secFrequencies.destroy()
        this.secResult.destroy();
        this.imgA = this.imgB = null;
        this.count = 0;
	}
    
}
