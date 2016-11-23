// Type definitions for image-morph-js
// Project: https://github.com/ppisljar/image-morph-js
// Definitions by: Charlie Chao <https://github.com/charliecm>

declare namespace ImgWarper {

    class Animator {
        frames:ImageData[];
        constructor(pointdefiner1:any, pointdefiner2:any);
        generate(steps:number);
    }

    class Point {
        constructor(x:number, y:number)
    }
    
}