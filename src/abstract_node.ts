import { Vector } from './vector.js';

export abstract class AbstractNode {
	public id: string;

	//Outer refers to the edge of the rendered content including labels and edges
	// The default values are designed to never change the AABB computation in case the node has no rendered content
	public outerLeft: number = Number.MAX_SAFE_INTEGER;
	public outerRight: number = Number.MIN_SAFE_INTEGER;
	public outerTop: number = Number.MAX_SAFE_INTEGER;
	public outerBottom: number = Number.MIN_SAFE_INTEGER;

	//Inner refers to just the node itself
	public innerLeft: number = Number.MAX_SAFE_INTEGER;
	public innerRight: number = Number.MIN_SAFE_INTEGER;
	public innerTop: number = Number.MAX_SAFE_INTEGER;
	public innerBottom: number = Number.MIN_SAFE_INTEGER;

	public get width(): number {
		return this.innerRight - this.innerLeft;
	}

	public get height(): number {
		return this.innerBottom - this.innerTop;
	}

	public get centerX(): number {
		return this.innerLeft + this.width / 2;
	}

	public get centerY(): number {
		return this.innerTop + this.height / 2;
	}

	protected root: Element;

	constructor(nodeXML: Element) {
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

	public generateBoundingBox(): Vector[] {
		return [
			new Vector(this.innerLeft + this.width, this.innerTop),
			new Vector(this.innerLeft + this.width, this.innerTop + this.height),
			new Vector(this.innerLeft, this.innerTop + this.height),
			new Vector(this.innerLeft, this.innerTop)
		];
	}

	public abstract render(svg: SVGSVGElement, offsetX: number, offsetY: number);

	protected handleLabel(svg: SVGGElement): void {
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
					node.setAttribute(
						'y',
						`${parseFloat(label.getAttribute('y')) + parseFloat(label.getAttribute('height')) / 2 + i * parseFloat(label.getAttribute('fontSize'))}`
					);
					svg.appendChild(node);
				}
			}
		}
	}
	public setDimensions(svgNode: SVGGElement | SVGSVGElement | SVGTextElement | SVGRectElement): void {
		svgNode.setAttribute('width', this.width.toString());
		svgNode.setAttribute('height', this.height.toString());
	}

	public setPosition(svgNode: SVGSVGElement | SVGTextElement | SVGGElement, offsetX: number, offsetY: number) {
		svgNode.setAttribute('transform', `translate(${this.innerLeft + offsetX},${this.innerTop + offsetY})`);
	}
}
