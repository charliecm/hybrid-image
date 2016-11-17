/**
 * HybridGenerator
 * Displays the hybrid image generator UI.
 */

import Canvas from './Canvas';
import Generator from './Generator';
import * as Operation from './Operation';
import Section from './Section';

export default class HybridGenerator implements Generator {

    private imgA:ImageData;
    private imgB:ImageData;
    private lowPass:ImageData;
    private highPass:ImageData;
	private secFrequencies:Section;
    private canvLowPass:Canvas = new Canvas();
    private canvHighPass:Canvas = new Canvas();
    private lowPassRadius:number = 6;
    private highPassRadius:number = 2;

    /**
     * @param {HTMLElement} parent Parent element to add sections to.
     * @param {Function} onChange Event handler for intermediary image changes.
     */
	constructor(private parent:HTMLElement, private onChange:Function) {
        let secFrequencies:Section = this.secFrequencies = new Section('Low/high frequency images');
        // Add low-pass radius input
		secFrequencies.addParameter('Low-pass radius', this.lowPassRadius, 30, (val) => {
            this.lowPassRadius = val;
            this.updateLowPass();
            this.updateResult();
		});
        // Add high-pass radius input
		secFrequencies.addParameter('High-pass radius', this.highPassRadius, 30, (val) => {
            this.highPassRadius = val;
			this.updateHighPass();
            this.updateResult();
		});
        secFrequencies.addItem(this.canvLowPass.element);
        secFrequencies.addItem(this.canvHighPass.element);
        parent.appendChild(secFrequencies.element);
	}

    /**
     * Updates intermediary images from input images.
     * @param {ImageData} imgA First input image.
     * @param {ImageData} imgB Second input image.
     */
    update(imgA:ImageData, imgB:ImageData) {
        this.imgA = imgA,
        this.imgB = imgB;
        this.updateLowPass();
        this.updateHighPass();
        this.updateResult();
    }

    /**
     * Updates low pass image.
     */
    private updateLowPass() {
        let lowPass = this.lowPass = Operation.lowPass(this.imgA, this.lowPassRadius);
        this.canvLowPass.drawImage(lowPass);
    }

    /**
     * Updates high pass image.
     */
    private updateHighPass() {
        let highPass:ImageData = this.highPass = Operation.highPass(this.imgB, this.highPassRadius);
        this.canvHighPass.drawImage(highPass);
    }

    /**
     * Propogates result image to parent.
     */
    private updateResult() {
        let result:ImageData = Operation.hybridImage(this.lowPass, this.highPass);
        this.onChange(result);
    }
    
}
