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
    private secFrequencies:Section;
    private morphEditor:MorphEditor;
    private morpher:ImgWarper.Animator;
    private btnExport:any;
    private lowPassCutoff:number = 12;
    private cutoffPerPass:number = 6;

    /**
     * @param {Function} onChange Event handler for intermediary image changes.
     */
	constructor(private onChange:Function) {
        let ele = this.ele = document.createElement('div'),
            secMorphEditor:Section = this.secMorphEditor = new Section('Morph Editor', 'Click to add a control point. Drag to move one. Press DEL to remove the selected point.'),
            secMorph:Section = this.secMorph = new Section('Morphed Images', 'Add control points using the above editor, then press Update.'),
            secFrequencies = this.secFrequencies = new Section('Frequency Images'),
            morphEditor:MorphEditor = this.morphEditor = new MorphEditor(this.updateExportData.bind(this));
        // Morph editor section
        secMorphEditor.addButton('Clear', this.clearPoints.bind(this));
        secMorphEditor.addButton('Swap', this.swapPoints.bind(this));
        secMorphEditor.addUpload('Import', this.importPoints.bind(this));
        this.btnExport = secMorphEditor.addDownload('Export', '', 'points.json');
        // Morphed images section
        secMorph.addButton('Update', this.updateMorph.bind(this));
		secMorph.addParameter('Steps', this.morphSteps, 1, 10, (val) => {
            this.morphSteps = val;
            this.updateMorph();
            this.updateResult();
		});
        // Frequency images section
        secFrequencies.addParameter('Low frequency cutoff', this.lowPassCutoff, 0, 30, (val) => {
            this.lowPassCutoff = val;
            this.updateFrequencyImages();
		});
        secFrequencies.addParameter('Cutoff per step', this.cutoffPerPass, 0, 30, (val) => {
            this.cutoffPerPass = val;
            this.updateFrequencyImages();
		});
        // Insert elements
        secMorphEditor.addItem(morphEditor.element);
        ele.appendChild(secMorphEditor.element);
        ele.appendChild(secMorph.element);
        ele.appendChild(secFrequencies.element);
	}

    /**
     * Updates the control points export button data.
     */
    private updateExportData() {
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
                    alert('File has an invalid JSON format. Please try again.');
                }
            } catch(e) {
                alert('Please upload a valid JSON file.');
            }
        };
        reader.readAsText(files[0]);
    }

    /**
     * Swaps all control points.
     */
    private swapPoints() {
        this.morphEditor.swap();
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
     * @param {boolean} isSwapped Whether to swap control points or not.
     */
    update(imgA:ImageData, imgB:ImageData, isSwapped:boolean = false) {
        this.imgA = imgA,
        this.imgB = imgB;
        if (isSwapped) {
            this.morphEditor.swap();
        }
        this.morphEditor.updateSources(imgA, imgB);
        this.updateResult();
    }

    /**
     * Updates intermediary morphed images.
     * @return {boolean} Whether the morphed images were successfully created.
     */
    updateMorph():boolean {
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
            return false;
        }
        morpher.generate(steps + 1);
        for (let i = 0; i < morpher.frames.length; i++) {
            let result:ImageData = morpher.frames[i],
                canv:Canvas = new Canvas(result);
            secMorph.addItem(canv.element);
            morphs.push(result);
        }
        this.updateFrequencyImages();
        return true;
    }

    /**
     * Updates the high and low frequency images from morphed images.
     */
    updateFrequencyImages() {
        let morphs:ImageData[] = this.morphs.slice(0).reverse(),
            section:Section = this.secFrequencies,
            passRadius:number = this.cutoffPerPass,
            canv:Canvas,
            finalResult:ImageData,
            morph:ImageData,
            lowPass:ImageData,
            result:ImageData;
        section.clearItems();
        // Generate low-pass image
        morph = Filter.apply(morphs[morphs.length - 1], Filter.grayscale),
        result = Operation.lowPass(morph, this.lowPassCutoff);
        canv = new Canvas(result);
        section.addItem(canv.element);
        finalResult = result;
        for (let i = 0; i < (morphs.length - 1); i++) {
            // Generate high-pass image
            result = morph = Filter.apply(morphs[i], Filter.grayscale);
            for (let j = 0; j < (i + 1); j++) {
                lowPass = Operation.lowPass(morph, passRadius * (j + 1));
                result = Filter.apply(lowPass, Filter.subtract, morph, false, 128);
            }
            canv = new Canvas(result);
            section.addItem(canv.element);
            finalResult = Operation.hybridImage(finalResult, result);
        }
        this.onChange(finalResult);
        return finalResult
    }
    
    /**
     * Propogates result image to parent.
     */
    private updateResult() {
        if (!this.updateMorph()) {
            let result:ImageData = new ImageData(this.imgA.width, this.imgB.height);
            this.onChange(result);
        }
    }

    get element() {
        return this.ele;
    }
    
}
