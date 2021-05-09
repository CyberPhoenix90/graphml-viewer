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

	protected handleLabel(svg: SVGGElement): void {
		const label = this.shape.getElementsByTagName('y:NodeLabel');
		if (label.length) {
			const node = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			node.textContent = label[0].textContent;
			node.setAttribute('width', label[0].getAttribute('width'));
			node.setAttribute('height', label[0].getAttribute('height'));
			node.setAttribute('fill', label[0].getAttribute('textColor'));
			node.setAttribute('font-family', label[0].getAttribute('fontFamily'));
			node.setAttribute('font-size', label[0].getAttribute('fontSize'));
			node.setAttribute('dominant-baseline', 'middle');
			node.setAttribute('text-anchor', 'middle');
			node.setAttribute('x', `${parseFloat(label[0].getAttribute('x')) + parseFloat(label[0].getAttribute('width')) / 2}`);
			node.setAttribute('y', `${parseFloat(label[0].getAttribute('y')) + parseFloat(label[0].getAttribute('height')) / 2}`);
			svg.appendChild(node);
		}
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
