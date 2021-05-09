import { GenericNode } from './generic_node.js';
import { Vector } from './vector.js';

export class ShapeNode extends GenericNode {
	constructor(nodeXML: Element) {
		super(nodeXML);
		const shape = nodeXML.getElementsByTagName('y:ShapeNode')[0];
		this.shape = shape;
	}

	public generateBoundingBox(): Vector[] {
		if (this.isEllipse()) {
			return this.generateRegularPolygonVector(20, this.width / 2, this.height / 2, this.centerX, this.centerY, Math.PI / 2);
		} else {
			return super.generateBoundingBox();
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
}
