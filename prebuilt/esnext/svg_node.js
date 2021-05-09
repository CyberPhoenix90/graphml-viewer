import { AbstractNode } from './abstract_node.js';
export class SVGNode extends AbstractNode {
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
//# sourceMappingURL=svg_node.js.map