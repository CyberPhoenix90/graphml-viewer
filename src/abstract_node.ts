import { Vector } from './vector.js';

export abstract class AbstractNode {
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

	protected root: Element;

	constructor(nodeXML: Element) {
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

	public generateBoundingBox(): Vector[] {
		return [
			new Vector(this.left + this.width, this.top),
			new Vector(this.left + this.width, this.top + this.height),
			new Vector(this.left, this.top + this.height),
			new Vector(this.left, this.top)
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
		svgNode.setAttribute('transform', `translate(${this.left + offsetX},${this.top + offsetY})`);
	}
}
