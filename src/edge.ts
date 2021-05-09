export class Edge {
	public id: string;
	public source: string;
	public target: string;

	constructor(edgeXML: Element) {
		this.id = edgeXML.getAttribute('id');
		this.source = edgeXML.getAttribute('source');
		this.target = edgeXML.getAttribute('target');
	}
}
