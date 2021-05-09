import { Vector } from './vector.js';
export class AbstractNode {
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
            new Vector(this.left + this.width, this.top),
            new Vector(this.left + this.width, this.top + this.height),
            new Vector(this.left, this.top + this.height),
            new Vector(this.left, this.top)
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
        svgNode.setAttribute('transform', `translate(${this.left + offsetX},${this.top + offsetY})`);
    }
}
//# sourceMappingURL=abstract_node.js.map