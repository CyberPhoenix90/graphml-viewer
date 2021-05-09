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
					this.left = parseInt(geometry[0].getAttribute('x'));
					this.right = this.left + parseInt(geometry[0].getAttribute('width'));
					this.top = parseInt(geometry[0].getAttribute('y'));
					this.bottom = this.top + parseInt(geometry[0].getAttribute('height'));
				}
			}
		}
	}

	public render(svg: SVGSVGElement, offsetX: number, offsetY: number) {
		const shapeNode = this.shape.getElementsByTagName('y:Shape');
		if (shapeNode.length) {
			let node;
			const shapeType = shapeNode[0].getAttribute('type');
			switch (shapeType) {
				case 'roundrectangle':
					node = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
					node.setAttribute('rx', '6');
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
		}
	}

	private setDimensions(svgNode: SVGRectElement, offsetX: number, offsetY: number) {
		svgNode.setAttribute('width', this.width.toString());
		svgNode.setAttribute('height', this.height.toString());
		svgNode.setAttribute('x', (this.left + offsetX).toString());
		svgNode.setAttribute('y', (this.top + offsetY).toString());
	}

	private setFill(svgNode: SVGRectElement) {
		const fill = this.shape.getElementsByTagName('y:Fill');
		if (fill.length) {
			svgNode.setAttribute('fill', fill[0].getAttribute('color'));
		}
	}

	private setBorder(svgNode: SVGRectElement) {
		const border = this.shape.getElementsByTagName('y:BorderStyle');
		if (border.length) {
			svgNode.setAttribute('stroke', border[0].getAttribute('color'));
			svgNode.setAttribute('stroke-width', border[0].getAttribute('width'));
		}
	}
}