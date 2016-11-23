/**
 * MorphedGenerator
 * Displays the morphed image hybrid image generator UI.
 */

import Canvas from './Canvas';
import * as Filter from './Filter';
import Generator from './Generator';
import MorphEditor from './MorphEditor';
import * as Operation from './Operation';
import Section from './Section';

export default class MorphedGenerator implements Generator {

    private ele:HTMLElement;
    private imgA:ImageData;
    private imgB:ImageData;
    private morphs:ImageData[];
    private morphSteps:number = 5;
    private secMorph:Section;
    private secMorphEditor:Section;
    private morphEditor:MorphEditor;
    private morpher:ImgWarper.Animator;

    /**
     * @param {Function} onChange Event handler for intermediary image changes.
     */
	constructor(private onChange:Function) {
        let ele = this.ele = document.createElement('div'),
            secMorphEditor:Section = this.secMorphEditor = new Section('Morphed Images Editor'),
            secMorph:Section = this.secMorph = new Section('Morphed Images', 'Add control points using the above editor, then press Update.'),
            morphEditor:MorphEditor = this.morphEditor = new MorphEditor();
        // Add low-pass radius input
		secMorph.addParameter('Steps', this.morphSteps, 1, 10, (val) => {
            this.morphSteps = val;
            this.updateMorph();
            this.updateResult();
		});
        secMorph.addButton('Update', this.updateMorph.bind(this));
        // Insert elements
        secMorphEditor.addItem(morphEditor.element);
        ele.appendChild(secMorphEditor.element);
        ele.appendChild(secMorph.element);
	}

    /**
     * Updates intermediary images from input images.
     * @param {ImageData} imgA First input image.
     * @param {ImageData} imgB Second input image.
     */
    update(imgA:ImageData, imgB:ImageData) {
        this.imgA = imgA,
        this.imgB = imgB;
        this.morphEditor.updateSources(imgA, imgB);
        this.updateMorph();
        this.updateResult();
    }

    /**
     * Updates intermediary morphed images.
     */
    updateMorph() {
        let steps:number = this.morphSteps,
            secMorph:Section = this.secMorph,
            morphs:ImageData[] = this.morphs = [],
            points:any = this.morphEditor.getPoints(),
            morpher:ImgWarper.Animator = this.morpher = new ImgWarper.Animator(
                {
                    imgData: this.imgA,
                    oriPoints: points.a
                },
                {
                    imgData: this.imgB,
                    oriPoints: points.b
                }
            );
        secMorph.clearItems();
        if (!points.a.length) {
            return;
        }
        morpher.generate(steps + 1);
        for (let i = 0; i < morpher.frames.length; i++) {
            let result:ImageData = morpher.frames[i],
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

    get element() {
        return this.ele;
    }
    
}
