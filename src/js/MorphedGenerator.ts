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
    private secMorph:Section;
    private canvA:Canvas = new Canvas()
    private canvB:Canvas = new Canvas()

    /**
     * @param {HTMLElement} parent Parent element to add sections to.
     * @param {Function} onChange Event handler for intermediary image changes.
     */
	constructor(private parent:HTMLElement, private onChange:Function) {
        let secMorph:Section = this.secMorph = new Section('Morphed Images');
        secMorph.addItem(this.canvA.element);
        secMorph.addItem(this.canvB.element);
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
        this.canvA.drawImage(imgA);
        this.canvB.drawImage(imgB);
        this.updateResult();
    }
    
    /**
     * Propogates result image to parent.
     */
    private updateResult() {
        let result:ImageData = Filter.apply(this.imgA, Filter.overlay, this.imgB);
        this.onChange(result);
    }
    
}
