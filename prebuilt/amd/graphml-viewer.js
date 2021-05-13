define("vector", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Vector = void 0;
    class Vector {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
        static fromPolarCoordinates(length, angle) {
            return new Vector(length * Math.cos(angle), length * Math.sin(angle));
        }
        add(x, y) {
            this.x += x;
            this.y += y;
            return this;
        }
        subVec(vector) {
            this.x -= vector.x;
            this.y -= vector.y;
            return this;
        }
        clone() {
            return new Vector(this.x, this.y);
        }
        length() {
            return (this.x ** 2 + this.y ** 2) ** 0.5;
        }
        angle() {
            return Math.atan2(this.y, this.x);
        }
        moveForward(distance) {
            this.add(distance * Math.cos(this.angle()), distance * Math.sin(this.angle()));
        }
        isEqual(vector) {
            return this.x === vector.x && this.y === vector.y;
        }
        intersectionPoint(lineOrigin, lineTarget) {
            if ((this.x === 0 && this.y === 0) || lineOrigin.isEqual(lineTarget)) {
                return undefined;
            }
            let ua;
            let ub;
            let denominator = (lineTarget.y - lineOrigin.y) * this.x - (lineTarget.x - lineOrigin.x) * this.y;
            if (denominator === 0) {
                return undefined;
            }
            ua = ((lineTarget.x - lineOrigin.x) * -lineOrigin.y - (lineTarget.y - lineOrigin.y) * -lineOrigin.x) / denominator;
            ub = (this.x * -lineOrigin.y - this.y * -lineOrigin.x) / denominator;
            if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
                return undefined;
            }
            return new Vector(ua * this.x, ua * this.y);
        }
    }
    exports.Vector = Vector;
});
define("abstract_node", ["require", "exports", "vector"], function (require, exports, vector_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AbstractNode = void 0;
    class AbstractNode {
        constructor(nodeXML) {
            //Outer refers to the edge of the rendered content including labels and edges
            // The default values are designed to never change the AABB computation in case the node has no rendered content
            this.outerLeft = Number.MAX_SAFE_INTEGER;
            this.outerRight = Number.MIN_SAFE_INTEGER;
            this.outerTop = Number.MAX_SAFE_INTEGER;
            this.outerBottom = Number.MIN_SAFE_INTEGER;
            //Inner refers to just the node itself
            this.innerLeft = Number.MAX_SAFE_INTEGER;
            this.innerRight = Number.MIN_SAFE_INTEGER;
            this.innerTop = Number.MAX_SAFE_INTEGER;
            this.innerBottom = Number.MIN_SAFE_INTEGER;
            this.id = nodeXML.getAttribute('id');
            this.root = nodeXML;
            const geometry = nodeXML.getElementsByTagName('y:Geometry');
            if (geometry.length) {
                this.innerLeft = this.outerLeft = parseFloat(geometry[0].getAttribute('x'));
                this.innerRight = this.outerRight = this.innerLeft + parseFloat(geometry[0].getAttribute('width'));
                this.innerTop = this.outerTop = parseFloat(geometry[0].getAttribute('y'));
                this.innerBottom = this.outerBottom = this.innerTop + parseFloat(geometry[0].getAttribute('height'));
            }
            const labels = this.root.getElementsByTagName('y:NodeLabel');
            if (labels.length) {
                for (const label of labels) {
                    const x = parseFloat(label.getAttribute('x')) + this.innerLeft;
                    const y = parseFloat(label.getAttribute('y')) + this.innerTop;
                    const w = parseFloat(label.getAttribute('width'));
                    const h = parseFloat(label.getAttribute('height'));
                    if (x < this.outerLeft) {
                        this.outerLeft = x;
                    }
                    if (y < this.outerTop) {
                        this.outerTop = y;
                    }
                    if (x + w > this.outerRight) {
                        this.outerRight = x + w;
                    }
                    if (y + h > this.outerBottom) {
                        this.outerBottom = y + h;
                    }
                }
            }
        }
        get width() {
            return this.innerRight - this.innerLeft;
        }
        get height() {
            return this.innerBottom - this.innerTop;
        }
        get centerX() {
            return this.innerLeft + this.width / 2;
        }
        get centerY() {
            return this.innerTop + this.height / 2;
        }
        generateBoundingBox() {
            return [
                new vector_js_1.Vector(this.innerLeft + this.width, this.innerTop),
                new vector_js_1.Vector(this.innerLeft + this.width, this.innerTop + this.height),
                new vector_js_1.Vector(this.innerLeft, this.innerTop + this.height),
                new vector_js_1.Vector(this.innerLeft, this.innerTop)
            ];
        }
        handleLabel(svg) {
            const labels = this.root.getElementsByTagName('y:NodeLabel');
            if (labels.length) {
                for (const label of labels) {
                    const lines = label.textContent.split('\n');
                    for (let i = 0; i < lines.length; i++) {
                        if (!lines[i].trim()) {
                            continue;
                        }
                        const node = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                        node.textContent = lines[i];
                        node.setAttribute('width', label.getAttribute('width'));
                        node.setAttribute('height', label.getAttribute('height'));
                        node.setAttribute('fill', label.getAttribute('textColor'));
                        node.setAttribute('font-family', label.getAttribute('fontFamily'));
                        node.setAttribute('font-size', label.getAttribute('fontSize'));
                        node.setAttribute('dominant-baseline', 'middle');
                        node.setAttribute('text-anchor', 'middle');
                        node.setAttribute('x', `${parseFloat(label.getAttribute('x')) + parseFloat(label.getAttribute('width')) / 2}`);
                        node.setAttribute('y', `${parseFloat(label.getAttribute('y')) + parseFloat(label.getAttribute('height')) / 2 + i * parseFloat(label.getAttribute('fontSize'))}`);
                        svg.appendChild(node);
                    }
                }
            }
        }
        setDimensions(svgNode) {
            svgNode.setAttribute('width', this.width.toString());
            svgNode.setAttribute('height', this.height.toString());
        }
        setPosition(svgNode, offsetX, offsetY) {
            svgNode.setAttribute('transform', `translate(${this.innerLeft + offsetX},${this.innerTop + offsetY})`);
        }
    }
    exports.AbstractNode = AbstractNode;
});
define("edge", ["require", "exports", "vector"], function (require, exports, vector_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Edge = void 0;
    class Edge {
        constructor(edgeXML) {
            // The default values are designed to never change the AABB computation in case the node has no rendered content
            this.left = Number.MAX_SAFE_INTEGER;
            this.right = Number.MIN_SAFE_INTEGER;
            this.top = Number.MAX_SAFE_INTEGER;
            this.bottom = Number.MIN_SAFE_INTEGER;
            this.id = edgeXML.getAttribute('id');
            this.source = edgeXML.getAttribute('source');
            this.target = edgeXML.getAttribute('target');
            this.root = edgeXML;
            const points = edgeXML.getElementsByTagName('y:Point');
            if (points.length) {
                for (const point of points) {
                    const x = parseFloat(point.getAttribute('x'));
                    const y = parseFloat(point.getAttribute('y'));
                    if (x < this.left) {
                        this.left = x;
                    }
                    if (y < this.top) {
                        this.top = y;
                    }
                    if (x > this.right) {
                        this.right = x;
                    }
                    if (y > this.bottom) {
                        this.bottom = y;
                    }
                }
            }
        }
        render(svg, source, target, offsetX, offsetY) {
            var _a;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            const points = [
                new vector_js_2.Vector(source.centerX, source.centerY),
                ...Array.from(this.root.getElementsByTagName('y:Point')).map((n) => new vector_js_2.Vector(parseFloat(n.getAttribute('x')), parseFloat(n.getAttribute('y')))),
                new vector_js_2.Vector(target.centerX, target.centerY)
            ];
            const first = points[0];
            const second = points[1];
            const secondToLast = points[points.length - 2];
            const last = points[points.length - 1];
            const startVector = (_a = this.castRay(new vector_js_2.Vector(first.x, first.y), new vector_js_2.Vector(second.x, second.y), source.generateBoundingBox().map((obstacle) => new vector_js_2.Vector(first.x, first.y).subVec(obstacle)))) !== null && _a !== void 0 ? _a : new vector_js_2.Vector(first.x, first.y);
            const lineVector = this.castRay(new vector_js_2.Vector(secondToLast.x, secondToLast.y), new vector_js_2.Vector(last.x, last.y), target.generateBoundingBox().map((obstacle) => obstacle.subVec(new vector_js_2.Vector(secondToLast.x, secondToLast.y))));
            let startArrowId = Math.random().toString(16).substring(2);
            let endArrowId = Math.random().toString(16).substring(2);
            if (this.hasStartArrow()) {
                const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
                marker.setAttribute('id', startArrowId);
                marker.setAttribute('markerWidth', '10');
                marker.setAttribute('markerHeight', '7');
                marker.setAttribute('refX', '10');
                marker.setAttribute('refY', '3.5');
                marker.setAttribute('orient', 'auto');
                const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                polygon.setAttribute('points', '10 0, 10 7, 0 3.5');
                polygon.setAttribute('fill', this.getEdgeColor());
                marker.appendChild(polygon);
                g.appendChild(marker);
                startVector.moveForward(10);
            }
            if (this.hasEndArrow()) {
                const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
                marker.setAttribute('id', endArrowId);
                marker.setAttribute('markerWidth', '10');
                marker.setAttribute('markerHeight', '7');
                marker.setAttribute('refX', '0');
                marker.setAttribute('refY', '3.5');
                marker.setAttribute('orient', 'auto');
                const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
                polygon.setAttribute('fill', this.getEdgeColor());
                marker.appendChild(polygon);
                g.appendChild(marker);
                lineVector.moveForward(-10);
            }
            points.pop();
            points.shift();
            line.setAttribute('d', `M${startVector.x + source.centerX + offsetX} ${startVector.y + source.centerY + offsetY} ${points
                .map((s) => `L${s.x + offsetX},${s.y + offsetY}`)
                .join(' ')} L${lineVector.x + secondToLast.x + offsetX} ${lineVector.y + secondToLast.y + offsetY}`);
            this.handleLineStyle(line);
            this.handleArrow(line, startArrowId, endArrowId);
            g.appendChild(line);
            svg.appendChild(g);
        }
        hasStartArrow() {
            var _a;
            const src = (_a = this.root.getElementsByTagName('y:Arrows')[0]) === null || _a === void 0 ? void 0 : _a.getAttribute('source');
            return !!src && src !== 'none';
        }
        hasEndArrow() {
            var _a;
            const src = (_a = this.root.getElementsByTagName('y:Arrows')[0]) === null || _a === void 0 ? void 0 : _a.getAttribute('target');
            return !!src && src !== 'none';
        }
        handleArrow(line, startArrowId, endArrowId) {
            const arrows = this.root.getElementsByTagName('y:Arrows');
            if (arrows.length) {
                if (arrows[0].getAttribute('source') !== 'none') {
                    line.setAttribute('marker-start', `url(#${startArrowId})`);
                }
                if (arrows[0].getAttribute('target') !== 'none') {
                    line.setAttribute('marker-end', `url(#${endArrowId})`);
                }
            }
        }
        getEdgeColor() {
            const ls = this.root.getElementsByTagName('y:LineStyle');
            if (ls.length) {
                return ls[0].getAttribute('color');
            }
            return 'black';
        }
        handleLineStyle(line) {
            const ls = this.root.getElementsByTagName('y:LineStyle');
            if (ls.length) {
                line.setAttribute('fill', 'transparent');
                line.setAttribute('stroke', ls[0].getAttribute('color'));
                line.setAttribute('stroke-width', ls[0].getAttribute('width'));
            }
        }
        castRay(startLocation, target, obstacles) {
            const ray = target.clone().subVec(startLocation);
            const collisions = [];
            for (let i = 0; i < obstacles.length; i++) {
                const collision = ray.intersectionPoint(obstacles[i], obstacles[(i + 1) % obstacles.length]);
                if (collision) {
                    collisions.push(collision);
                }
            }
            return collisions.sort((a, b) => a.length() - b.length())[0];
        }
    }
    exports.Edge = Edge;
});
define("generic_node", ["require", "exports", "abstract_node"], function (require, exports, abstract_node_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GenericNode = void 0;
    class GenericNode extends abstract_node_js_1.AbstractNode {
        constructor(nodeXML) {
            super(nodeXML);
            const shape = nodeXML.getElementsByTagName('y:GenericNode')[0];
            this.shape = shape;
        }
        render(svg, offsetX, offsetY) {
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            const node = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            this.setDimensions(node);
            this.setPosition(g, offsetX, offsetY);
            this.setFill(node);
            this.setBorder(node);
            g.appendChild(node);
            svg.appendChild(g);
            this.handleLabel(g);
        }
        setFill(svgNode) {
            const fill = this.shape.getElementsByTagName('y:Fill');
            if (fill.length) {
                svgNode.setAttribute('fill', fill[0].getAttribute('color'));
            }
        }
        setBorder(svgNode) {
            const border = this.shape.getElementsByTagName('y:BorderStyle');
            if (border.length) {
                svgNode.setAttribute('stroke', border[0].getAttribute('color'));
                svgNode.setAttribute('stroke-width', border[0].getAttribute('width'));
            }
        }
    }
    exports.GenericNode = GenericNode;
});
define("shape_node", ["require", "exports", "generic_node", "vector"], function (require, exports, generic_node_js_1, vector_js_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ShapeNode = void 0;
    class ShapeNode extends generic_node_js_1.GenericNode {
        constructor(nodeXML) {
            super(nodeXML);
            const shape = nodeXML.getElementsByTagName('y:ShapeNode')[0];
            this.shape = shape;
        }
        generateBoundingBox() {
            if (this.isEllipse()) {
                return this.generateRegularPolygonVector(20, this.width / 2, this.height / 2, this.centerX, this.centerY, Math.PI / 2);
            }
            else {
                return super.generateBoundingBox();
            }
        }
        isEllipse() {
            const shapeNode = this.shape.getElementsByTagName('y:Shape');
            return shapeNode[0].getAttribute('type') === 'ellipse';
        }
        render(svg, offsetX, offsetY) {
            const shapeNode = this.shape.getElementsByTagName('y:Shape');
            if (shapeNode.length) {
                let node;
                const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                const shapeType = shapeNode[0].getAttribute('type');
                switch (shapeType) {
                    case 'roundrectangle':
                        node = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                        node.setAttribute('rx', '5');
                        this.setDimensions(node);
                        this.setPosition(g, offsetX, offsetY);
                        break;
                    case 'rectangle3d':
                    case 'rectangle':
                        node = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                        this.setDimensions(node);
                        this.setPosition(g, offsetX, offsetY);
                        break;
                    case 'hexagon':
                        node = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                        this.setPosition(g, offsetX, offsetY);
                        node.setAttribute('points', this.generateRegularPolygon(6, this.width / 2, this.height / 2, this.width / 2, this.height / 2, Math.PI / 2));
                        break;
                    case 'triangle':
                        node = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                        this.setPosition(g, offsetX, offsetY);
                        node.setAttribute('points', this.generateRegularPolygon(3, this.width / 2, this.height / 2, this.width / 2, this.height / 2, Math.PI));
                        this.setDimensions(node);
                        break;
                    case 'diamond':
                        node = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                        this.setPosition(g, offsetX, offsetY);
                        node.setAttribute('points', this.generateRegularPolygon(4, this.width / 2, this.height / 2, this.width / 2, this.height / 2, Math.PI));
                        this.setDimensions(node);
                        break;
                    case 'octagon':
                        node = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                        this.setPosition(g, offsetX, offsetY);
                        node.setAttribute('points', this.generateRegularPolygon(8, this.width / 2, this.height / 2, this.width / 2, this.height / 2, Math.PI / 8));
                        this.setDimensions(node);
                        break;
                    case 'trapezoid':
                        node = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                        this.setPosition(g, offsetX, offsetY);
                        node.setAttribute('points', `${0.15 * this.width},${0} ${this.width * 0.85},${0} ${this.width},${this.height} ${0},${this.height}`);
                        this.setDimensions(node);
                        break;
                    case 'trapezoid2':
                        node = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                        this.setPosition(g, offsetX, offsetY);
                        node.setAttribute('points', `${0},${0} ${this.width},${0} ${0.85 * this.width},${this.height} ${0.15 * this.width},${this.height}`);
                        this.setDimensions(node);
                        break;
                    case 'parallelogram':
                        node = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                        this.setPosition(g, offsetX, offsetY);
                        node.setAttribute('points', `${0.1 * this.width},${0} ${this.width},${0} ${0.9 * this.width},${this.height} ${0},${this.height}`);
                        this.setDimensions(node);
                        break;
                    case 'ellipse':
                        node = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
                        this.setPosition(g, offsetX, offsetY);
                        node.setAttribute('rx', `${this.width / 2}`);
                        node.setAttribute('ry', `${this.height / 2}`);
                        node.setAttribute('cx', (this.width / 2).toString());
                        node.setAttribute('cy', (this.height / 2).toString());
                        break;
                }
                this.setFill(node);
                this.setBorder(node);
                g.appendChild(node);
                svg.appendChild(g);
                this.handleLabel(g);
            }
        }
        generateRegularPolygon(sides, rx, ry, offsetX, offsetY, startAngle) {
            let step = (Math.PI * 2) / sides;
            const points = [];
            for (let i = 0; i < sides; i++) {
                points.push(`${offsetX + rx * Math.sin(startAngle)},${offsetY + ry * Math.cos(startAngle)}`);
                startAngle += step;
            }
            return points.join(' ');
        }
        generateRegularPolygonVector(sides, rx, ry, offsetX, offsetY, startAngle) {
            let step = (Math.PI * 2) / sides;
            const points = [];
            for (let i = 0; i < sides; i++) {
                points.push(new vector_js_3.Vector(offsetX + rx * Math.sin(startAngle), offsetY + ry * Math.cos(startAngle)));
                startAngle += step;
            }
            return points;
        }
    }
    exports.ShapeNode = ShapeNode;
});
define("svg_node", ["require", "exports", "abstract_node"], function (require, exports, abstract_node_js_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SVGNode = void 0;
    class SVGNode extends abstract_node_js_2.AbstractNode {
        constructor(nodeXML, resources) {
            super(nodeXML);
            this.resources = resources;
            const shape = nodeXML.getElementsByTagName('y:SVGNode')[0];
            this.shape = shape;
        }
        render(svg, offsetX, offsetY) {
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            const container = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            this.setPosition(g, offsetX, offsetY);
            this.setDimensions(g);
            const id = this.shape.getElementsByTagName('y:SVGContent')[0].getAttribute('refid');
            let content = this.resources.get(id);
            //Hacky solution against ID collision
            const reg = new RegExp(/id="(.*?)"/g);
            let result;
            while ((result = reg.exec(content)) !== null) {
                let re = new RegExp(result[1], 'g');
                content = content.replace(re, id + '_' + result[1]);
            }
            container.innerHTML = new DOMParser().parseFromString(content, 'text/html').documentElement.textContent;
            const innerSvg = container.getElementsByTagName('svg')[0];
            container.setAttribute('transform', `scale(${this.width / innerSvg.width.baseVal.value},${this.height / innerSvg.height.baseVal.value})`);
            this.setFill(g);
            g.append(container);
            svg.appendChild(g);
            this.handleLabel(g);
        }
        setFill(svgNode) {
            const fill = this.shape.getElementsByTagName('y:Fill');
            if (fill.length) {
                svgNode.setAttribute('fill', fill[0].getAttribute('color'));
            }
        }
        setBorder(svgNode) {
            const border = this.shape.getElementsByTagName('y:BorderStyle');
            if (border.length) {
                svgNode.setAttribute('stroke', border[0].getAttribute('color'));
                svgNode.setAttribute('stroke-width', border[0].getAttribute('width'));
            }
        }
    }
    exports.SVGNode = SVGNode;
});
define("graphml-viewer", ["require", "exports", "edge", "generic_node", "shape_node", "svg_node"], function (require, exports, edge_js_1, generic_node_js_2, shape_node_js_1, svg_node_js_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class GraphmlViewer extends HTMLElement {
        constructor() {
            super();
            const root = this.attachShadow({ mode: 'open' });
            const style = document.createElement('style');
            style.innerHTML = `
		:host {
		  display: block;
		}`;
            this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            root.appendChild(style);
            root.appendChild(this.svg);
        }
        static get observedAttributes() {
            return ['src'];
        }
        connectedCallback() {
            const src = this.getAttribute('src');
            if (src) {
                fetch(src).then(async (response) => {
                    if (response.ok) {
                        const content = await response.text();
                        try {
                            const xmlDocument = new DOMParser().parseFromString(content, 'application/xml');
                            if (this.render(xmlDocument)) {
                                this.dispatchEvent(new Event('load', {
                                    bubbles: false
                                }));
                            }
                        }
                        catch (e) {
                            console.warn(e);
                            this.throwSyntaxError();
                        }
                    }
                    else {
                        this.dispatchEvent(new Event('error', {
                            bubbles: false
                        }));
                    }
                }, () => {
                    this.dispatchEvent(new Event('error', {
                        bubbles: false
                    }));
                });
            }
        }
        throwSyntaxError() {
            this.dispatchEvent(new Event('syntax-error', {
                bubbles: false
            }));
        }
        render(xmlDocument) {
            while (this.svg.childNodes.length) {
                this.svg.removeChild(this.svg.firstChild);
            }
            const graphNodes = Array.from(xmlDocument.childNodes[0].childNodes).filter((c) => c.nodeName === 'graph');
            // Graphml needs one and only one graph node to be valid
            if (graphNodes.length !== 1) {
                this.throwSyntaxError();
                return false;
            }
            // coordinates in graphml are virtualized in an endless scene. Which means the content can be far off the viewport. For this reason
            // we need to calculate the "Axis-aligned bounding box" (AABB) of the graph to normalize the coordinates so that the content is guaranteed
            // to start where the SVG root node starts
            let minX = Number.MAX_SAFE_INTEGER;
            let minY = Number.MAX_SAFE_INTEGER;
            let maxX = Number.MIN_SAFE_INTEGER;
            let maxY = Number.MIN_SAFE_INTEGER;
            const nodeWrappers = new Map();
            const edgeWrappers = new Map();
            const resources = new Map();
            const resourceNodes = xmlDocument.getElementsByTagName('y:Resource');
            for (const resource of resourceNodes) {
                if (!resource.hasAttribute('id')) {
                    this.throwSyntaxError();
                    return false;
                }
                resources.set(resource.getAttribute('id'), resource.innerHTML);
            }
            const nodeNodes = graphNodes[0].getElementsByTagName('node');
            for (const node of nodeNodes) {
                if (!node.hasAttribute('id')) {
                    this.throwSyntaxError();
                    return false;
                }
                let nodeWrapper;
                if (node.getElementsByTagName('y:ShapeNode')[0]) {
                    nodeWrapper = new shape_node_js_1.ShapeNode(node);
                }
                else if (node.getElementsByTagName('y:GenericNode')[0]) {
                    nodeWrapper = new generic_node_js_2.GenericNode(node);
                }
                else if (node.getElementsByTagName('y:SVGNode')[0]) {
                    nodeWrapper = new svg_node_js_1.SVGNode(node, resources);
                }
                else {
                    continue;
                }
                nodeWrappers.set(node.getAttribute('id'), nodeWrapper);
                if (nodeWrapper.outerLeft < minX) {
                    minX = nodeWrapper.outerLeft;
                }
                if (nodeWrapper.outerTop < minY) {
                    minY = nodeWrapper.outerTop;
                }
                if (nodeWrapper.outerRight > maxX) {
                    maxX = nodeWrapper.outerRight;
                }
                if (nodeWrapper.outerBottom > maxY) {
                    maxY = nodeWrapper.outerBottom;
                }
            }
            const edgeNodes = graphNodes[0].getElementsByTagName('edge');
            for (const edge of edgeNodes) {
                if (!edge.hasAttribute('id') || !edge.hasAttribute('source') || !edge.hasAttribute('target')) {
                    this.throwSyntaxError();
                    return false;
                }
                const edgeWrapper = new edge_js_1.Edge(edge);
                edgeWrappers.set(edge.getAttribute('id'), edgeWrapper);
                if (edgeWrapper.left < minX) {
                    minX = edgeWrapper.left;
                }
                if (edgeWrapper.top < minY) {
                    minY = edgeWrapper.top;
                }
                if (edgeWrapper.right > maxX) {
                    maxX = edgeWrapper.right;
                }
                if (edgeWrapper.bottom > maxY) {
                    maxY = edgeWrapper.bottom;
                }
            }
            this.svg.setAttribute('viewBox', `-4 -4 ${maxX - minX + 8} ${maxY - minY + 8}`);
            this.svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            for (const node of nodeWrappers.values()) {
                node.render(this.svg, -minX, -minY);
            }
            for (const edge of edgeWrappers.values()) {
                edge.render(this.svg, nodeWrappers.get(edge.source), nodeWrappers.get(edge.target), -minX, -minY);
            }
            return true;
        }
    }
    customElements.define('graphml-viewer', GraphmlViewer);
});
//# sourceMappingURL=graphml-viewer.js.map