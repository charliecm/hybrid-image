/**
 * MorphEditor
 * Displays two canvases that enable addition and  manipulation of control points for image morph.
 */

import MorphPoint from './MorphPoint';

export default class MorphEditor {

    private ele:HTMLElement;
    private imgA:ImageData;
    private imgB:ImageData;
    private canvA:HTMLCanvasElement;
    private contextA:CanvasRenderingContext2D;
    private canvB:HTMLCanvasElement;
    private contextB:CanvasRenderingContext2D;
    private points:MorphPoint[] = [];
    private selectedPoint:MorphPoint;
    private onChange:Function;

    /**
     * @param {Function} onChange Event handler for control point changes.
     */
    constructor(onChange:Function) {
        let ele:HTMLElement = this.ele = document.createElement('div'),
            canvA:HTMLCanvasElement = this.canvA = document.createElement('canvas'),
            canvB:HTMLCanvasElement = this.canvB = document.createElement('canvas');    
        this.onChange = onChange;
        canvA.className = canvB.className = 'canvas';
        this.contextA = canvA.getContext('2d'),
        this.contextB = canvB.getContext('2d');
        this.bindCanvasEvents(canvA, true);
        this.bindCanvasEvents(canvB, false);
        window.addEventListener('keyup', this.handleRemovePointKey.bind(this));
        ele.appendChild(canvA);
        ele.appendChild(canvB);
    }

    /**
     * Removes a point and refresh the canvas.
     */
    handleRemovePointKey(event:KeyboardEvent) {
        let point = this.selectedPoint,
            points = this.points;
        if (event.keyCode !== 8) {
            return;
        }
        if (!point) {
            return;
        }
        points.splice(points.indexOf(point), 1);
        this.updateCanvas();
    }

    /**
     * Binds the canvas interaction events.
     * @param {HTMLCanvasElement} canvas Target canvas element.
     * @param {boolean} isA Is manipulating source A points.
     */
    bindCanvasEvents(canv:HTMLCanvasElement, isA:boolean) {
        let isMouseDown:boolean = false;
        canv.onmousedown = (event) => {
            let scale = canv.width / canv.clientWidth,
                x:number = (event.pageX - canv.offsetLeft) * scale,
                y:number = (event.pageY - canv.offsetTop) * scale,
                points:MorphPoint[] = this.points,
                hasSelect:boolean = false,
                selectedPoint:MorphPoint = this.selectedPoint;
            if (selectedPoint) {
                selectedPoint.unselect();
            }
            for (let i = 0; i < points.length; i++) {
                let point = points[i]; 
                if (point.contains(isA, x, y)) {
                    point.select();
                    this.selectedPoint = point;
                    hasSelect = true;
                    break;
                }
            }
            if (!hasSelect) {
                this.addPoint(x, y);
            }
            isMouseDown = true;
            this.updateCanvas();
        };
        canv.onmousemove = (event) => {
            let scale = canv.width / canv.clientWidth,
                x:number = (event.pageX - canv.offsetLeft) * scale,
                y:number = (event.pageY - canv.offsetTop) * scale,
                selectedPoint = this.selectedPoint;
            if (isMouseDown && selectedPoint) {
                selectedPoint.update(isA, x, y);
                this.updateCanvas();
            }
        }
        canv.onmouseup = () => {
            isMouseDown = false;
        }
        canv.onmouseout = () => {
            isMouseDown = false;
        }
    }

    /**
     * Adds a new control point.
     */
    addPoint(xA:number, yA:number, xB?:number, yB?:number) {
        let point = new MorphPoint(xA, yA);
        if (xB !== undefined && yB !== undefined) {
            point.update(false, xB, yB);
        }
        this.points.push(point);
    }

    /**
     * Updates the canvas.
     */
    updateCanvas() {
        let canv = this.canvA,
            scale = canv.width / canv.clientWidth,
            cA:CanvasRenderingContext2D = this.contextA,
            cB:CanvasRenderingContext2D = this.contextB,
            points:MorphPoint[] = this.points;
        cA.putImageData(this.imgA, 0, 0);
        cB.putImageData(this.imgB, 0, 0);
        for (let i = 0; i < points.length; i++) {
            points[i].draw(true, cA, scale);
            points[i].draw(false, cB, scale);
        }
        this.onChange();
    }

    /**
     * Updates the source images.
     * @param {ImageData} imgA First source image.
     * @param {ImageData} imgB Second source image.
     */
    updateSources(imgA:ImageData, imgB:ImageData) {
        this.imgA = imgA;
        this.imgB = imgB;
        this.canvA.width = this.canvB.width = imgA.width;
        this.canvA.height = this.canvB.height = imgA.height;
        this.updateCanvas();
    }

    /**
     * Removes all the points.
     */
    clear() {
        this.points = [];
        this.selectedPoint = null;
        this.updateCanvas();
    }

    /**
     * Returns the control points in a format usable by ImgWarper.
     * @return {any} Object containing the arrays a and b, of ImgWarp.Point.
     */
    getPoints():any {
        let points:MorphPoint[] = this.points,
            output = {
                a: [],
                b: []
            }
        for (let i = 0; i < points.length; i++) {
            output.a.push(new ImgWarper.Point(points[i].xA, points[i].yA));
            output.b.push(new ImgWarper.Point(points[i].xB, points[i].yB));
        }
        return output;
    }

    /**
     * Returns the control points as an exportable JSON.
     * @return {string} JSON string.
     */
    getPointsAsJSON():any {
        let points:MorphPoint[] = this.points,
            output = [];
        for (let i = 0; i < points.length; i++) {
            output.push({
                xA: points[i].xA,
                yA: points[i].yA,
                xB: points[i].xB,
                yB: points[i].yB
            });
        }
        return JSON.stringify(output);
    }

    // TODO: destroy()

    get element() {
        return this.ele;
    }

}