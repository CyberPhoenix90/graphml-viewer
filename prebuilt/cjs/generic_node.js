"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenericNode = void 0;
const abstract_node_js_1 = require("./abstract_node.js");
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
//# sourceMappingURL=generic_node.js.map