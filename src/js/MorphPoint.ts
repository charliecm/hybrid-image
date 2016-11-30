/**
 * MorphPoint
 */

export default class MorphPoint {

    public xA:number;
    public yA:number;
    public xB:number;
    public yB:number;
    private isSelected:boolean = false;
    private readonly radius:number = 3;
    private readonly radiusSelect:number = 10;

    /**
     * @param {number} x Initial x position.
     * @param {number} y Initial y position.
     */
    constructor(x:number, y:number) {
        this.xA = this.xB = x;
        this.yA = this.yB = y;
    }

    /**
     * Updates the position of a point.
     * @param {boolean} isA Draw point A, otherwise point B.
     * @param {number} x New x position.
     * @param {number} y New y position.
     */
    update(isA:boolean, x:number, y:number) {
        if (isA) {
            this.xA = x;
            this.yA = y;
        } else {
            this.xB = x;
            this.yB = y;
        }
    }

    /**
     * Swap control point coordinates.
     */
    swap() {
        let tempX = this.xA,
            tempY = this.yA;
        this.xA = this.xB;
        this.yA = this.yB;
        this.xB = tempX;
        this.yB = tempY;
    }

    /**
     * Draws the point on a canvas.
     * @param {boolean} isA Draw point A, otherwise point B.
     * @param {CanvasRenderingContext2D} c Canvas rendering context.
     */
    draw(isA:boolean, c:CanvasRenderingContext2D, scale:number = 1) {
        let xx:number = (isA) ? this.xA : this.xB,
            yy:number = (isA) ? this.yA : this.yB,
            r = this.radius * scale;
        c.beginPath();
        c.ellipse(xx, yy, r, r, 0, 0, 2 * Math.PI);
        c.strokeStyle = '';
        c.lineWidth = 0;
        if (this.isSelected) {
            c.strokeStyle = 'black';
            c.lineWidth = 6 * scale;
            c.stroke();
            c.strokeStyle = 'white';
            c.lineWidth = 3 * scale;
            c.stroke();
            c.fillStyle = '#19CD17';
            c.fill();
        } else {
            c.strokeStyle = 'black';
            c.lineWidth = 3 * scale;
            c.stroke();
            c.strokeStyle = 'white';
            c.lineWidth = 1 * scale;
            c.stroke();
            c.fillStyle = 'red';
            c.fill();
        }
        c.closePath();
    }

    /**
     * Selects the point.
     */
    select() {
        this.isSelected = true;
    }

    /**
     * Unselects the point.
     */
    unselect() {
        this.isSelected = false;
    }

    /**
     * Returns true if point boundary contains the specified position.
     * @param {boolean} isA Draw point A, otherwise point B.
     * @param {number} x Target x position.
     * @param {number} y Target y position.
     */
    contains(isA:boolean, x:number, y:number) {
        let xx:number = (isA) ? this.xA : this.xB,
            yy:number = (isA) ? this.yA : this.yB,
            r = this.radiusSelect;
        return (x > xx - r) && (x < xx + r) && (y > yy - r) && (y < yy + r);
    }
    
}