import { AbstractNode } from './abstract_node.js';
import { Edge } from './edge.js';
import { GenericNode } from './generic_node.js';
import { ShapeNode } from './shape_node.js';
import { SVGNode } from './svg_node.js';

class GraphmlViewer extends HTMLElement {
	static get observedAttributes() {
		return ['src'];
	}

	private svg: SVGSVGElement;

	constructor() {
		super();

		const root = this.attachShadow({ mode: 'open' });
		const style = document.createElement('style');
		style.innerHTML = `
		:host {
		  display: block;
		}`;
		this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

		root.appendChild(style);
		root.appendChild(this.svg);
	}

	connectedCallback() {
		const src = this.getAttribute('src');
		if (src) {
			fetch(src).then(
				async (response) => {
					if (response.ok) {
						const content = await response.text();
						try {
							const xmlDocument = new DOMParser().parseFromString(content, 'application/xml');
							if (this.render(xmlDocument)) {
								this.dispatchEvent(
									new Event('load', {
										bubbles: false
									})
								);
							}
						} catch (e) {
							console.warn(e);
							this.throwSyntaxError();
						}
					} else {
						this.dispatchEvent(
							new Event('error', {
								bubbles: false
							})
						);
					}
				},
				() => {
					this.dispatchEvent(
						new Event('error', {
							bubbles: false
						})
					);
				}
			);
		}
	}

	private throwSyntaxError() {
		this.dispatchEvent(
			new Event('syntax-error', {
				bubbles: false
			})
		);
	}

	private render(xmlDocument: Document): boolean {
		while (this.svg.childNodes.length) {
			this.svg.removeChild(this.svg.firstChild);
		}

		const graphNodes = Array.from(xmlDocument.childNodes[0].childNodes).filter((c) => c.nodeName === 'graph') as Element[];

		// Graphml needs one and only one graph node to be valid
		if (graphNodes.length !== 1) {
			this.throwSyntaxError();
			return false;
		}

		// coordinates in graphml are virtualized in an endless scene. Which means the content can be far off the viewport. For this reason
		// we need to calculate the "Axis-aligned bounding box" (AABB) of the graph to normalize the coordinates so that the content is guaranteed
		// to start where the SVG root node starts
		let minX = Number.MAX_SAFE_INTEGER;
		let minY = Number.MAX_SAFE_INTEGER;
		let maxX = Number.MIN_SAFE_INTEGER;
		let maxY = Number.MIN_SAFE_INTEGER;

		const nodeWrappers = new Map<string, AbstractNode>();
		const edgeWrappers = new Map<string, Edge>();
		const resources = new Map<string, string>();

		const resourceNodes = xmlDocument.getElementsByTagName('y:Resource');
		for (const resource of resourceNodes) {
			if (!resource.hasAttribute('id')) {
				this.throwSyntaxError();
				return false;
			}
			resources.set(resource.getAttribute('id'), resource.innerHTML);
		}
		const nodeNodes = graphNodes[0].getElementsByTagName('node');

		for (const node of nodeNodes) {
			if (!node.hasAttribute('id')) {
				this.throwSyntaxError();
				return false;
			}

			let nodeWrapper: AbstractNode;
			if (node.getElementsByTagName('y:ShapeNode')[0]) {
				nodeWrapper = new ShapeNode(node);
			} else if (node.getElementsByTagName('y:GenericNode')[0]) {
				nodeWrapper = new GenericNode(node);
			} else if (node.getElementsByTagName('y:SVGNode')[0]) {
				nodeWrapper = new SVGNode(node, resources);
			} else {
				continue;
			}

			nodeWrappers.set(node.getAttribute('id'), nodeWrapper);
			if (nodeWrapper.outerLeft < minX) {
				minX = nodeWrapper.outerLeft;
			}
			if (nodeWrapper.outerTop < minY) {
				minY = nodeWrapper.outerTop;
			}
			if (nodeWrapper.outerRight > maxX) {
				maxX = nodeWrapper.outerRight;
			}
			if (nodeWrapper.outerBottom > maxY) {
				maxY = nodeWrapper.outerBottom;
			}
		}

		const edgeNodes = graphNodes[0].getElementsByTagName('edge');

		for (const edge of edgeNodes) {
			if (!edge.hasAttribute('id') || !edge.hasAttribute('source') || !edge.hasAttribute('target')) {
				this.throwSyntaxError();
				return false;
			}

			const edgeWrapper = new Edge(edge);
			edgeWrappers.set(edge.getAttribute('id'), edgeWrapper);
			if (edgeWrapper.left < minX) {
				minX = edgeWrapper.left;
			}
			if (edgeWrapper.top < minY) {
				minY = edgeWrapper.top;
			}
			if (edgeWrapper.right > maxX) {
				maxX = edgeWrapper.right;
			}
			if (edgeWrapper.bottom > maxY) {
				maxY = edgeWrapper.bottom;
			}
		}

		this.svg.setAttribute('viewBox', `-4 -4 ${maxX - minX + 8} ${maxY - minY + 8}`);
		this.svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
		for (const node of nodeWrappers.values()) {
			node.render(this.svg, -minX, -minY);
		}

		for (const edge of edgeWrappers.values()) {
			edge.render(this.svg, nodeWrappers.get(edge.source), nodeWrappers.get(edge.target), -minX, -minY);
		}

		return true;
	}
}

customElements.define('graphml-viewer', GraphmlViewer);
