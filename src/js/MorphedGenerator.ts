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
    private btnExport:any;

    /**
     * @param {Function} onChange Event handler for intermediary image changes.
     */
	constructor(private onChange:Function) {
        let ele = this.ele = document.createElement('div'),
            secMorphEditor:Section = this.secMorphEditor = new Section('Morphed Images Editor', 'Click to add a control point. Drag to move one. Press DEL to remove the selected point.'),
            secMorph:Section = this.secMorph = new Section('Morphed Images', 'Add control points using the above editor, then press Update.'),
            morphEditor:MorphEditor = this.morphEditor = new MorphEditor(this.updateDownloadData.bind(this));
        secMorphEditor.addButton('Clear', this.clearPoints.bind(this));
        secMorphEditor.addUpload('Import', this.importPoints.bind(this));
        this.btnExport = secMorphEditor.addDownload('Export', '', 'points.json');
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
     * Updates the control points export button data.
     */
    private updateDownloadData() {
        this.btnExport.setData(this.morphEditor.getPointsAsJSON());
    }

    /**
     * Handles upload completion of imported control points JSON.
     * @param {FileList} files List of uploaded files.
     */
    private importPoints(files:FileList) {
        // Input validation
        if (files.length === 0) {
            return;
        }
        // Begin read
        let reader:FileReader = new FileReader(),
            editor:MorphEditor = this.morphEditor;
        reader.onerror = () => {
            alert('Error reading the file. Please try again.');
            reader.onload = reader.onerror = null;
        }
        reader.onload = () => {
            try {
                let result = JSON.parse(reader.result);
                if (result.length) {
                    editor.clear();
                    for (let i = 0; i < result.length; i++) {
                        if (result[i].hasOwnProperty('xA') && result[i].hasOwnProperty('yA') && result[i].hasOwnProperty('xB') && result[i].hasOwnProperty('yB')) {
                            editor.addPoint(result[i].xA, result[i].yA, result[i].xB, result[i].yB);
                        }
                    }
                    editor.updateCanvas();
                } else {
                    alert('Invalid JSON format.');
                }
            } catch(e) {
                alert('Please upload a valid JSON.');
            }
            reader.onload = reader.onerror = null;
        };
        reader.readAsText(files[0]);
    }

    /**
     * Removes all control points.
     */
    private clearPoints() {
        this.morphEditor.clear();
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
