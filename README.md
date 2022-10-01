# GraphML Viewer

GraphML Viewer is a simple library to render graphml files (for example from yed or draw.io) in your browser using SVG!

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

This project only supports modern browsers such as Edge, Chrome, Firefox and Safari.

## Dependencies

This project is dependency free!

## Security Notice

GraphML documents can load external content when opened. Only open GraphML documents you trust.

## Preview

You can view this library in action here:
https://cyberphoenix90.github.io/graphml-viewer/
