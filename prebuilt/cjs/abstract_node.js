"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AbstractNode = void 0;
const vector_js_1 = require("./vector.js");
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
//# sourceMappingURL=abstract_node.js.map