# GraphML Viewer

GraphML Viewer is a simple library to render graphml files (for example from yed or draw.io) in your browser using SVG!

## Work in progress

GraphML Viewer is a work in progress project and so far only a small subset of the graphml specification is supported. More accurate rendering and more broad support is coming. Feel free to report an issue if the feature you need isn't working yet.

## How to use

Install with npm:

> npm i graphml-viewer

To use just import the script and create a graphml-viewer node with the src attribute pointing to the graphml file. That's all!

```html
<html>
	<head>
		<script type="module" src="node_modules/prebuilt/esnext/graphml-viewer.js"></script>
	</head>
	<body>
		<graphml-viewer style="width:600px;" src="./testdata/test.graphml"></graphml-viewer>
	</body>
</html>
```

In case you are using webpack simply add

```javascript
import 'graphml-viewer';
```

inside the entry point file.

## Browser Support

This project only supports modern browsers such as Edge, Chrome, Firefox and Safari. IE support may be achievable with the right polyfills but the codebase will not target IE

## Security Notice

GraphML documents can load external content when opened. Only open GraphML documents you trust. In the future content policy features will be added to allow sandboxing the rendering process
