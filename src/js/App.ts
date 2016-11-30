/**
 * HybridGenerator
 * Displays the hybrid image generator UI.
 */

import Canvas from './Canvas';
import * as Filter from './Filter';
import Generator from './Generator';
import * as Helper from './Helper';
import HybridGenerator from './HybridGenerator';
import MorphedGenerator from './MorphedGenerator';
import * as Operation from './Operation';
import Section from './Section';

export default class App {
    
    private ele:HTMLElement;
    private eleBody:HTMLElement
    private eleHybridTab:HTMLElement;
    private eleMorphedTab:HTMLElement;
	private imgA:HTMLImageElement;
	private imgB:HTMLImageElement;
    private canvResult:Canvas;
    private canvResultSmall:Canvas;
	private secInputs:Section;
    private secMethod:Section;
	private secResult:Section;
    private tabsMethod:any;
    private btnSaveImage:any;
    private genHybrid:HybridGenerator;
    private genMorphed:MorphedGenerator;
    private activeGenerator:Generator;
    private count:number = 0;
    private isMonochrome:boolean = true;
    private readonly countTotal:number = 2;
    private readonly tabOriginal:string = 'Original';
    private readonly tabMorphed:string = 'Morphed Image';
    private readonly demoAimgA = 'images/daniel-radcliffe.png';
    private readonly demoAimgB = 'images/elijah-wood.png';
    private readonly demoBimgA = 'images/einstein.jpg';
    private readonly demoBimgB = 'images/monroe.jpg';

	constructor(parent:HTMLElement) {
        let ele:HTMLElement = this.ele = document.createElement('article'),
            eleBody:HTMLElement = this.eleBody = document.createElement('div'),
            imgA = this.imgA = document.createElement('img'),
            imgB = this.imgB = document.createElement('img'),
            canvResult = this.canvResult = new Canvas(),
            canvResultSmall = this.canvResultSmall = new Canvas(null, true),
            secInput:Section = this.secInputs = new Section('Input Images', 'Please select two images with the same width and height.'),
            secMethod:Section = this.secMethod = new Section('Method', 'Choose which method to generate a hybrid image with.', false),
			secResult:Section = this.secResult = new Section('Result', 'Drag image to resize.'),
            genHybrid = this.genHybrid = new HybridGenerator(this.updateResult.bind(this)),
            genMorphed = this.genMorphed = new MorphedGenerator(this.updateResult.bind(this)),
            eleHybridTab = this.eleHybridTab = genHybrid.element,
            eleMorphedTab = this.eleMorphedTab = genMorphed.element;
        // Sections wrap
        ele.className = 'sections';
        // Input section
        secInput.addUpload('Upload', this.handleUpload.bind(this), true);
		secInput.addButton('Swap Images', this.swap.bind(this));
        secInput.addButton('Show Demo A', this.showDemo.bind(this, this.demoAimgA, this.demoAimgB));
        secInput.addButton('Show Demo B', this.showDemo.bind(this, this.demoBimgA, this.demoBimgB));
        secInput.addCheckbox('Monochrome', this.toggleMonochrome.bind(this), this.isMonochrome);
        imgA.className = imgB.className = 'canvas';
        secInput.addItem(imgA);
        secInput.addItem(imgB);
        // Method section
        this.tabsMethod = secMethod.addTabGroup([ this.tabOriginal, this.tabMorphed ], this.showTab.bind(this));
        // Result section
        canvResultSmall.element.style.maxWidth = '48px';
        secResult.addItem(canvResult.element);
        secResult.addItem(canvResultSmall.element);
        this.btnSaveImage = secResult.addDownload('Save Image', '', 'result.png');
        // Add elements
        eleHybridTab.className = eleMorphedTab.className = 'tab-section';
        eleBody.appendChild(eleHybridTab);
        eleBody.appendChild(eleMorphedTab);
        ele.appendChild(secInput.element);
        ele.appendChild(secMethod.element);
        ele.appendChild(eleBody);
        ele.appendChild(secResult.element);
		parent.appendChild(ele);
        this.showDemo(this.demoAimgA, this.demoAimgB);
	}

    /**
     * Shows the specified method tab.
     * @param {string} name Method tab name.
     */
    private showTab(name:string) {
        this.tabsMethod.select(name);
        if (name === this.tabOriginal) {
            this.eleHybridTab.classList.add('-active');
            this.eleMorphedTab.classList.remove('-active');
            this.activeGenerator = this.genHybrid;
        } else {
            this.eleHybridTab.classList.remove('-active');
            this.eleMorphedTab.classList.add('-active');
            this.activeGenerator = this.genMorphed;
        }
        this.resetResult();
        this.update();
    }

    /**
     * Updates the UI.
     * @param {boolean} isSwap Signal whether the images have been swapped.
     */
    private update(isSwap:boolean = false) {
        let imgA = Helper.getImageData(this.imgA),
            imgB = Helper.getImageData(this.imgB),
            dataA = (this.isMonochrome) ? Filter.apply(imgA, Filter.grayscale) : imgA,
            dataB = (this.isMonochrome) ? Filter.apply(imgB, Filter.grayscale) : imgB;
        this.activeGenerator.update(dataA, dataB, isSwap);
    }

    /**
     * Updates the result image.
     * @param {ImageData} result Result image buffer.
     */
    private updateResult(result:ImageData) {
        let canvResult:Canvas = this.canvResult;
        canvResult.drawImage(result);
        this.canvResultSmall.drawImage(result);
        this.btnSaveImage.setData(canvResult.element.toDataURL('image/png').replace('image/png', 'image/octet-stream'));
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
        imgA.onload = imgB.onload = null;
        if (imgA.naturalWidth !== imgB.naturalWidth || imgA.naturalHeight !== imgB.naturalHeight) {
            this.showError('Please upload images with the same width and height.');
            return;
        }
        if (this.activeGenerator) {
            this.update();
        } else {
            this.showTab(this.tabMorphed);
        }
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
        this.reset();
        let secInput = this.secInputs,
            readerA:FileReader = new FileReader(),
            readerB:FileReader = new FileReader(),
            imgA:HTMLImageElement = this.imgA,
            imgB:HTMLImageElement = this.imgB;
        readerA.onerror = readerB.onerror = () => {
            this.showError('Error reading images. Please try again.');
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

    /**
     * Swaps the input images.
     */
    swap() {
        if (this.imgA.src === '' || this.imgB.src === '') {
            return;
        }
        let tempA:string = this.imgA.src,
            tempB:string = this.imgB.src;
        this.imgA.src = tempB;
        this.imgB.src = tempA;
        this.update(true);
    }

    /**
     * Shows the output of demo input images.
     */
	showDemo(srcA:string, srcB:string) {
        this.reset();
		let secInput = this.secInputs,
			imgA = this.imgA,
			imgB = this.imgB;
        imgA.onload = this.checkImages.bind(this);
		imgA.src = srcA;
		imgB.onload = this.checkImages.bind(this);
		imgB.src = srcB;
	}

    /**
     * Toggles whether the input images should be monochrome.
     */
    toggleMonochrome(event:Event) {
        this.isMonochrome = (<(HTMLInputElement)>event.target).checked;
        this.update();
    }

    /**
     * Resets the result images.
     */
    resetResult() {
        this.canvResult.reset();
        this.canvResultSmall.reset();
    }

    /**
     * Resets the UI.
     */
    reset() {
        this.resetResult();
        this.imgA.src = this.imgB.src = '';
        this.count = 0;
	}
    
}
