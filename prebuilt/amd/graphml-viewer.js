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
            // The default values are designed to never change the AABB computation in case the node has no rendered content
            this.left = Number.MAX_SAFE_INTEGER;
            this.right = Number.MIN_SAFE_INTEGER;
            this.top = Number.MAX_SAFE_INTEGER;
            this.bottom = Number.MIN_SAFE_INTEGER;
            this.id = nodeXML.getAttribute('id');
            this.root = nodeXML;
            const geometry = nodeXML.getElementsByTagName('y:Geometry');
            if (geometry.length) {
                this.left = parseFloat(geometry[0].getAttribute('x'));
                this.right = this.left + parseFloat(geometry[0].getAttribute('width'));
                this.top = parseFloat(geometry[0].getAttribute('y'));
                this.bottom = this.top + parseFloat(geometry[0].getAttribute('height'));
            }
        }
        get width() {
            return this.right - this.left;
        }
        get height() {
            return this.bottom - this.top;
        }
        get centerX() {
            return this.left + this.width / 2;
        }
        get centerY() {
            return this.top + this.height / 2;
        }
        generateBoundingBox() {
            return [
                new vector_js_1.Vector(this.left + this.width, this.top),
                new vector_js_1.Vector(this.left + this.width, this.top + this.height),
                new vector_js_1.Vector(this.left, this.top + this.height),
                new vector_js_1.Vector(this.left, this.top)
            ];
        }
        handleLabel(svg) {
            const labels = this.root.getElementsByTagName('y:NodeLabel');
            if (labels.length) {
                for (const label of labels) {
                    const lines = label.textContent.split('\n');
                    for (let i = 0; i < lines.length; i++) {
                        if (!lines[i]) {
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
            svgNode.setAttribute('transform', `translate(${this.left + offsetX},${this.top + offsetY})`);
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
            this.id = edgeXML.getAttribute('id');
            this.source = edgeXML.getAttribute('source');
            this.target = edgeXML.getAttribute('target');
            this.polylineEdge = edgeXML.getElementsByTagName('y:PolyLineEdge')[0];
        }
        render(svg, source, target, offsetX, offsetY) {
            var _a;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            const startVector = (_a = this.castRay(new vector_js_2.Vector(source.centerX, source.centerY), new vector_js_2.Vector(target.centerX, target.centerY), source.generateBoundingBox().map((obstacle) => new vector_js_2.Vector(source.centerX, source.centerY).subVec(obstacle)))) !== null && _a !== void 0 ? _a : new vector_js_2.Vector(source.centerX, source.centerY);
            const lineVector = this.castRay(new vector_js_2.Vector(source.centerX, source.centerY), new vector_js_2.Vector(target.centerX, target.centerY), target.generateBoundingBox().map((obstacle) => obstacle.subVec(new vector_js_2.Vector(source.centerX, source.centerY))));
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
            line.setAttribute('d', `M${startVector.x + source.centerX + offsetX} ${startVector.y + source.centerY + offsetY} L${lineVector.x + source.centerX + offsetX} ${lineVector.y + source.centerY + offsetY}`);
            this.handleLineStyle(line);
            this.handleArrow(line, startArrowId, endArrowId);
            g.appendChild(line);
            svg.appendChild(g);
        }
        hasStartArrow() {
            var _a;
            const src = this.polylineEdge && ((_a = this.polylineEdge.getElementsByTagName('y:Arrows')[0]) === null || _a === void 0 ? void 0 : _a.getAttribute('source'));
            return !!src && src !== 'none';
        }
        hasEndArrow() {
            var _a;
            const src = this.polylineEdge && ((_a = this.polylineEdge.getElementsByTagName('y:Arrows')[0]) === null || _a === void 0 ? void 0 : _a.getAttribute('target'));
            return !!src && src !== 'none';
        }
        handleArrow(line, startArrowId, endArrowId) {
            if (this.polylineEdge) {
                const arrows = this.polylineEdge.getElementsByTagName('y:Arrows');
                if (arrows.length) {
                    if (arrows[0].getAttribute('source') !== 'none') {
                        line.setAttribute('marker-start', `url(#${startArrowId})`);
                    }
                    if (arrows[0].getAttribute('target') !== 'none') {
                        line.setAttribute('marker-end', `url(#${endArrowId})`);
                    }
                }
            }
        }
        getEdgeColor() {
            if (this.polylineEdge) {
                const ls = this.polylineEdge.getElementsByTagName('y:LineStyle');
                if (ls.length) {
                    return ls[0].getAttribute('color');
                }
            }
            return 'black';
        }
        handleLineStyle(line) {
            if (this.polylineEdge) {
                const ls = this.polylineEdge.getElementsByTagName('y:LineStyle');
                if (ls.length) {
                    line.setAttribute('stroke', ls[0].getAttribute('color'));
                    line.setAttribute('stroke-width', ls[0].getAttribute('width'));
                }
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
                if (nodeWrapper.left < minX) {
                    minX = nodeWrapper.left;
                }
                if (nodeWrapper.top < minY) {
                    minY = nodeWrapper.top;
                }
                if (nodeWrapper.right > maxX) {
                    maxX = nodeWrapper.right;
                }
                if (nodeWrapper.bottom > maxY) {
                    maxY = nodeWrapper.bottom;
                }
            }
            const edgeNodes = graphNodes[0].getElementsByTagName('edge');
            for (const edge of edgeNodes) {
                if (!edge.hasAttribute('id') || !edge.hasAttribute('source') || !edge.hasAttribute('target')) {
                    this.throwSyntaxError();
                    return false;
                }
                edgeWrappers.set(edge.getAttribute('id'), new edge_js_1.Edge(edge));
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