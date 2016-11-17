/**
 * MorphPoint
 */

export default class MorphPoint {

    public xA:number;
    public yA:number;
    public xB:number;
    public yB:number;
    private isSelected:boolean = false;
    private readonly radius:number = 5;
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
     * Draws the point on a canvas.
     * @param {boolean} isA Draw point A, otherwise point B.
     * @param {CanvasRenderingContext2D} c Canvas rendering context.
     */
    draw(isA:boolean, c:CanvasRenderingContext2D) {
        let xx:number = (isA) ? this.xA : this.xB,
            yy:number = (isA) ? this.yA : this.yB,
            r = this.radius;
        c.beginPath();
        if (this.isSelected) {
            c.fillStyle = 'yellow';
            c.strokeStyle = 'white';
        } else {
            c.fillStyle = 'red';
            c.strokeStyle = '';
        }
        c.ellipse(xx, yy, r, r, 0, 0, 2 * Math.PI);
        c.fill();
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