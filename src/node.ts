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
		if (this.isEllipse()) {
			return this.generateRegularPolygonVector(20, this.width / 2, this.height / 2, this.centerX, this.centerY, Math.PI / 2);
		} else {
			return [
				new Vector(this.left + this.width, this.top),
				new Vector(this.left + this.width, this.top + this.height),
				new Vector(this.left, this.top + this.height),
				new Vector(this.left, this.top)
			];
		}
	}

	private isEllipse(): boolean {
		const shapeNode = this.shape.getElementsByTagName('y:Shape');
		return shapeNode[0].getAttribute('type') === 'ellipse';
	}

	public render(svg: SVGSVGElement, offsetX: number, offsetY: number) {
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

	private generateRegularPolygon(sides: number, rx: number, ry: number, offsetX: number, offsetY: number, startAngle: number): string {
		let step = (Math.PI * 2) / sides;
		const points = [];
		for (let i = 0; i < sides; i++) {
			points.push(`${offsetX + rx * Math.sin(startAngle)},${offsetY + ry * Math.cos(startAngle)}`);
			startAngle += step;
		}
		return points.join(' ');
	}

	private generateRegularPolygonVector(sides: number, rx: number, ry: number, offsetX: number, offsetY: number, startAngle: number): Vector[] {
		let step = (Math.PI * 2) / sides;
		const points: Vector[] = [];
		for (let i = 0; i < sides; i++) {
			points.push(new Vector(offsetX + rx * Math.sin(startAngle), offsetY + ry * Math.cos(startAngle)));
			startAngle += step;
		}
		return points;
	}

	private handleLabel(svg: SVGGElement): void {
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

	private setDimensions(svgNode: SVGSVGElement | SVGTextElement): void {
		svgNode.setAttribute('width', this.width.toString());
		svgNode.setAttribute('height', this.height.toString());
	}

	private setPosition(svgNode: SVGSVGElement | SVGTextElement | SVGGElement, offsetX: number, offsetY: number) {
		svgNode.setAttribute('transform', `translate(${this.left + offsetX},${this.top + offsetY})`);
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
