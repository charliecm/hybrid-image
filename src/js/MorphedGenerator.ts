/**
 * MorphedGenerator
 * Displays the morphed image hybrid image generator UI.
 */

import Canvas from './Canvas';
import * as Filter from './Filter';
import Generator from './Generator';
import * as Operation from './Operation';
import Section from './Section';

export default class MorphedGenerator implements Generator {

    private imgA:ImageData;
    private imgB:ImageData;
    private morphs:ImageData[];
    private morphSteps:number = 5;
    private secMorph:Section;

    /**
     * @param {HTMLElement} parent Parent element to add sections to.
     * @param {Function} onChange Event handler for intermediary image changes.
     */
	constructor(private parent:HTMLElement, private onChange:Function) {
        let secMorph:Section = this.secMorph = new Section('Morphed Images');
        // Add low-pass radius input
		secMorph.addParameter('Steps', this.morphSteps, 1, 10, (val) => {
            this.morphSteps = val;
            this.updateMorph();
            this.updateResult();
		});
        parent.appendChild(secMorph.element);
	}

    /**
     * Updates intermediary images from input images.
     * @param {ImageData} imgA First input image.
     * @param {ImageData} imgB Second input image.
     */
    update(imgA:ImageData, imgB:ImageData) {
        this.imgA = imgA,
        this.imgB = imgB;
        this.updateMorph();
        this.updateResult();
    }

    /**
     * Updates intermediary morphed images.
     */
    updateMorph() {
        let steps = this.morphSteps,
            secMorph:Section = this.secMorph,
            morphs:ImageData[] = this.morphs = [];
        secMorph.clearItems();
        for (let i = 0; i < steps; i++) {
            let intensity:number = (1/steps) * i,
                result:ImageData = Filter.apply(this.imgA, Filter.dissolve, this.imgB, intensity),
                canv:Canvas = new Canvas(result);
            secMorph.addItem(canv.element);
            morphs.push(result);
        }
    }
    
    /**
     * Propogates result image to parent.
     */
    private updateResult() {
        let result:ImageData = Filter.apply(this.imgA, Filter.overlay, this.imgB);
        this.onChange(result);
    }
    
}
