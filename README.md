# Hybrid Image Generator

By [@charliecm](https://twitter.com/charliecm)

An [hybrid image](https://en.wikipedia.org/wiki/Hybrid_image) creation tool created for an academic course ([IAT455](https://www.sfu.ca/students/calendar/2016/fall/courses/iat/455.html)). It is based on the methods described in the following papers:

- [Hybrid Images](http://cvcl.mit.edu/hybrid/OlivaTorralb_Hybrid_Siggraph06.pdf)
- [Hybrid image using image morphing](http://dl.acm.org/citation.cfm?id=2811547)

## Development

Run `npm run watch` to watch files and start a local server at `http://localhost:8080`.

Run `npm run build` to build the project.

You can import `points.json` for the demo image morph control points.

## Further Works

Here are some ideas for extending this tool:

- Include a crop tool when uploading input images
- Use async approach to update images
- Use proxy images for previewing intermediary images
- Add ability to adjust preview image sizes
- Address any other edge-cases with custom input images
- [Implement feature-based morphing](https://www.cs.princeton.edu/courses/archive/fall00/cs426/papers/beier92.pdf)

## Thanks

This project uses [StackBlur](https://github.com/flozz/StackBlur) by [flozz](https://github.com/flozz), and [image-morph-js](https://github.com/ppisljar/image-morph-js) by [ppisljar](https://github.com/ppisljar).