import { Vector } from './vector.js';

export class Node {
	public id: string;

	// The default values are designed to never change the AABB computation in case the node has no rendered content
	public left: number = Number.MAX_SAFE_INTEGER;
	public right: number = Number.MIN_SAFE_INTEGER;
	public top: number = Number.MAX_SAFE_INTEGER;
	public bottom: number = Number.MIN_SAFE_INTEGER;

	public get width(): number {
		return this.right - this.left;
	}

	public get height(): number {
		return this.bottom - this.top;
	}

	public get centerX(): number {
		return this.left + this.width / 2;
	}

	public get centerY(): number {
		return this.top + this.height / 2;
	}

	private shape: Element;

	constructor(nodeXML: Element) {
		this.id = nodeXML.getAttribute('id');
		const data = nodeXML.getElementsByTagName('data');
		if (data.length) {
			const shape = nodeXML.getElementsByTagName('y:ShapeNode');
			if (shape.length) {
				this.shape = shape[0];
				const geometry = shape[0].getElementsByTagName('y:Geometry');
				if (geometry.length) {
					this.left = parseFloat(geometry[0].getAttribute('x'));
					this.right = this.left + parseFloat(geometry[0].getAttribute('width'));
					this.top = parseFloat(geometry[0].getAttribute('y'));
					this.bottom = this.top + parseFloat(geometry[0].getAttribute('height'));
				}
			}
		}
	}

	public generateBoundingBox(): Vector[] {
		return [
			new Vector(this.left + this.width, this.top),
			new Vector(this.left + this.width, this.top + this.height),
			new Vector(this.left, this.top + this.height),
			new Vector(this.left, this.top)
		];
	}

	public render(svg: SVGSVGElement, offsetX: number, offsetY: number) {
		const shapeNode = this.shape.getElementsByTagName('y:Shape');
		if (shapeNode.length) {
			let node;
			const shapeType = shapeNode[0].getAttribute('type');
			switch (shapeType) {
				case 'roundrectangle':
					node = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
					node.setAttribute('rx', '5');
					this.setDimensions(node, offsetX, offsetY);
					break;
				case 'rectangle':
					node = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
					this.setDimensions(node, offsetX, offsetY);
					break;
				case 'ellipse':
					node = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
					node.setAttribute('rx', `${this.width / 2}`);
					node.setAttribute('ry', `${this.height / 2}`);
					node.setAttribute('cx', (this.left + offsetX + this.width / 2).toString());
					node.setAttribute('cy', (this.top + offsetY + this.height / 2).toString());
					break;
			}
			this.setFill(node);
			this.setBorder(node);
			svg.appendChild(node);
			this.handleLabel(svg, offsetX, offsetY);
		}
	}

	private handleLabel(svg: SVGSVGElement, offsetX: number, offsetY: number): void {
		const label = this.shape.getElementsByTagName('y:NodeLabel');
		if (label.length) {
			const node = document.createElementNS('http://www.w3.org/2000/svg', 'text');
			node.textContent = label[0].textContent;
			node.setAttribute('width', label[0].getAttribute('width'));
			node.setAttribute('height', label[0].getAttribute('height'));
			node.setAttribute('fill', label[0].getAttribute('textColor'));
			node.setAttribute('font-family', label[0].getAttribute('fontFamily'));
			node.setAttribute('font-size', label[0].getAttribute('fontSize'));
			if (this.shape.getElementsByTagName('y:Shape')[0].getAttribute('type') === 'ellipse') {
				node.setAttribute('dominant-baseline', 'middle');
			} else {
				node.setAttribute('dominant-baseline', 'ideographic');
			}
			node.setAttribute('x', `${this.left + offsetX + parseFloat(label[0].getAttribute('x'))}`);
			node.setAttribute('y', `${this.top + this.height / 2 + offsetY + parseFloat(label[0].getAttribute('y'))}`);
			svg.appendChild(node);
		}
	}

	private setDimensions(svgNode: SVGSVGElement | SVGTextElement, offsetX: number, offsetY: number): void {
		svgNode.setAttribute('width', this.width.toString());
		svgNode.setAttribute('height', this.height.toString());
		svgNode.setAttribute('x', (this.left + offsetX).toString());
		svgNode.setAttribute('y', (this.top + offsetY).toString());
	}

	private setFill(svgNode: SVGSVGElement): void {
		const fill = this.shape.getElementsByTagName('y:Fill');
		if (fill.length) {
			svgNode.setAttribute('fill', fill[0].getAttribute('color'));
		}
	}

	private setBorder(svgNode: SVGSVGElement): void {
		const border = this.shape.getElementsByTagName('y:BorderStyle');
		if (border.length) {
			svgNode.setAttribute('stroke', border[0].getAttribute('color'));
			svgNode.setAttribute('stroke-width', border[0].getAttribute('width'));
		}
	}
}
