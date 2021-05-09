import { AbstractNode } from './abstract_node.js';

export class GenericNode extends AbstractNode {
	protected shape: Element;

	constructor(nodeXML: Element) {
		super(nodeXML);
		const shape = nodeXML.getElementsByTagName('y:GenericNode')[0];
		this.shape = shape;
	}

	public render(svg: SVGSVGElement, offsetX: number, offsetY: number) {
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

	protected setFill(svgNode: SVGSVGElement | SVGGElement | SVGRectElement): void {
		const fill = this.shape.getElementsByTagName('y:Fill');
		if (fill.length) {
			svgNode.setAttribute('fill', fill[0].getAttribute('color'));
		}
	}

	protected setBorder(svgNode: SVGSVGElement | SVGGElement | SVGRectElement): void {
		const border = this.shape.getElementsByTagName('y:BorderStyle');
		if (border.length) {
			svgNode.setAttribute('stroke', border[0].getAttribute('color'));
			svgNode.setAttribute('stroke-width', border[0].getAttribute('width'));
		}
	}
}
