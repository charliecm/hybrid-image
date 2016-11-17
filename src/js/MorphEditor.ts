/**
 * MorphEditor
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

    constructor() {
        let ele:HTMLElement = this.ele = document.createElement('div'),
            canvA:HTMLCanvasElement = this.canvA = document.createElement('canvas'),
            canvB:HTMLCanvasElement = this.canvB = document.createElement('canvas');    
        canvA.className = canvB.className = 'canvas';
        this.contextA = canvA.getContext('2d'),
        this.contextB = canvB.getContext('2d');
        this.bindCanvasEvents(canvA, true);
        this.bindCanvasEvents(canvB, false);
        ele.appendChild(canvA);
        ele.appendChild(canvB);
    }

    bindCanvasEvents(canv:HTMLCanvasElement, isA:boolean) {
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
                points.push(new MorphPoint(x, y));
            }
            this.updateCanvas();
        };
        canv.onmousemove = (event) => {
            let scale = canv.width / canv.clientWidth,
                x:number = (event.pageX - canv.offsetLeft) * scale,
                y:number = (event.pageY - canv.offsetTop) * scale,
                selectedPoint = this.selectedPoint;
            if (selectedPoint) {
                selectedPoint.update(isA, x, y);
                this.updateCanvas();
            }
        }
        canv.onmouseup = (event) => {
            let selectedPoint = this.selectedPoint;
            if (selectedPoint) {
                selectedPoint.unselect();
                this.selectedPoint = null;
            }
        }
    }

    updateCanvas() {
        let cA:CanvasRenderingContext2D = this.contextA,
            cB:CanvasRenderingContext2D = this.contextB,
            points:MorphPoint[] = this.points;
        cA.putImageData(this.imgA, 0, 0);
        cB.putImageData(this.imgB, 0, 0);
        for (let i = 0; i < points.length; i++) {
            points[i].draw(true, cA);
            points[i].draw(false, cB);
        }
    }

    updateSources(imgA:ImageData, imgB:ImageData) {
        this.imgA = imgA;
        this.imgB = imgB;
        this.canvA.width = this.canvB.width = imgA.width;
        this.canvA.height = this.canvB.height = imgA.height;
        this.contextA.putImageData(imgA, 0, 0);
        this.contextB.putImageData(imgB, 0, 0);
    }

    get element() {
        return this.ele;
    }

}