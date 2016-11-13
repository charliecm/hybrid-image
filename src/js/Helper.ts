/**
 * Help Functions
 */


export function clip(val:number):number {
    return Math.min(Math.max(val, 0), 255);
}
