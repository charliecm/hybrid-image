/**
 * HybridGenerator
 * Displays the hybrid image generator UI.
 */

import Canvas from './Canvas';
import * as Filter from './Filter';
import Generator from './Generator';
import * as Operation from './Operation';
import Section from './Section';

export default class HybridGenerator implements Generator {

    private ele:HTMLElement;
    private imgA:ImageData;
    private imgB:ImageData;
    private lowPass:ImageData;
    private highPass:ImageData;
	private secFrequencies:Section;
    private canvLowPass:Canvas = new Canvas();
    private canvHighPass:Canvas = new Canvas();
    private lowPassFrequency:number = 4;
    private highPassFrequency:number = 2;

    /**
     * @param {Function} onChange Event handler for intermediary image changes.
     */
	constructor(private onChange:Function) {
        let ele = this.ele = document.createElement('div'),
            secFrequencies:Section = this.secFrequencies = new Section('Low/High Frequency Images');
        // Add low-pass frequency input
		secFrequencies.addParameter('Low-pass frequency', this.lowPassFrequency, 0, 30, (val) => {
            this.lowPassFrequency = val;
            this.updateLowPass();
            this.updateResult();
		});
        // Add high-pass frequency input
		secFrequencies.addParameter('High-pass frequency', this.highPassFrequency, 0, 30, (val) => {
            this.highPassFrequency = val;
			this.updateHighPass();
            this.updateResult();
		});
        secFrequencies.addItem(this.canvLowPass.element);
        secFrequencies.addItem(this.canvHighPass.element);
        ele.appendChild(secFrequencies.element);
	}

    /**
     * Updates intermediary images from input images.
     * @param {ImageData} imgA First input image.
     * @param {ImageData} imgB Second input image.
     */
    update(imgA:ImageData, imgB:ImageData) {
        this.imgA = Filter.apply(imgA, Filter.grayscale),
        this.imgB = Filter.apply(imgB, Filter.grayscale);
        this.updateLowPass();
        this.updateHighPass();
        this.updateResult();
    }

    /**
     * Updates low pass image.
     */
    private updateLowPass() {
        let lowPass = this.lowPass = Operation.lowPass(this.imgA, this.lowPassFrequency);
        this.canvLowPass.drawImage(lowPass);
    }

    /**
     * Updates high pass image.
     */
    private updateHighPass() {
        let highPass = this.highPass = Operation.highPass(this.imgB, this.highPassFrequency);
        this.canvHighPass.drawImage(highPass);
    }

    /**
     * Propogates result image to parent.
     */
    private updateResult() {
        let result:ImageData = Operation.hybridImage(this.lowPass, this.highPass);
        this.onChange(result);
    }

    get element() {
        return this.ele;
    }
    
}
