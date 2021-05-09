import { Node } from './node.js';
import { Edge } from './edge.js';

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

		const graphNodes = xmlDocument.getElementsByTagName('graph');

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

		const nodeWrappers = new Map<string, Node>();
		const edgeWrappers = new Map<string, Edge>();

		const nodeNodes = graphNodes[0].getElementsByTagName('node');

		for (const node of nodeNodes) {
			if (!node.hasAttribute('id')) {
				this.throwSyntaxError();
				return false;
			}

			const nodeWrapper = new Node(node);
			nodeWrappers.set(node.getAttribute('id'), nodeWrapper);

			if (nodeWrapper.left < minX) {
				minX = nodeWrapper.left;
			}
			if (nodeWrapper.top < minY) {
				minY = nodeWrapper.top;
			}
			if (nodeWrapper.right > maxX) {
				maxX = nodeWrapper.right;
			}
			if (nodeWrapper.bottom > maxY) {
				maxY = nodeWrapper.bottom;
			}
		}

		const edgeNodes = graphNodes[0].getElementsByTagName('edge');

		for (const edge of edgeNodes) {
			if (!edge.hasAttribute('id') || !edge.hasAttribute('source') || !edge.hasAttribute('target')) {
				this.throwSyntaxError();
				return false;
			}

			edgeWrappers.set(edge.getAttribute('id'), new Edge(edge));
		}

		this.svg.setAttribute('viewBox', `-4 -4 ${maxX - minX + 8} ${maxY - minY + 8}`);
		this.svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
		for (const node of nodeWrappers.values()) {
			node.render(this.svg, -minX, -minY);
		}

		return true;
	}
}

customElements.define('graphml-viewer', GraphmlViewer);
