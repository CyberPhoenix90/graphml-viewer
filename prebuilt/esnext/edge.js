import { Vector } from './vector.js';
export class Edge {
    constructor(edgeXML) {
        this.id = edgeXML.getAttribute('id');
        this.source = edgeXML.getAttribute('source');
        this.target = edgeXML.getAttribute('target');
        this.polylineEdge = edgeXML.getElementsByTagName('y:PolyLineEdge')[0];
    }
    render(svg, source, target, offsetX, offsetY) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const startVector = this.castRay(new Vector(source.centerX, source.centerY), new Vector(target.centerX, target.centerY), source.generateBoundingBox().map((obstacle) => new Vector(source.centerX, source.centerY).subVec(obstacle))) ?? new Vector(source.centerX, source.centerY);
        const lineVector = this.castRay(new Vector(source.centerX, source.centerY), new Vector(target.centerX, target.centerY), target.generateBoundingBox().map((obstacle) => obstacle.subVec(new Vector(source.centerX, source.centerY))));
        let startArrowId = Math.random().toString(16).substring(2);
        let endArrowId = Math.random().toString(16).substring(2);
        if (this.hasStartArrow()) {
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
            marker.setAttribute('id', startArrowId);
            marker.setAttribute('markerWidth', '10');
            marker.setAttribute('markerHeight', '7');
            marker.setAttribute('refX', '10');
            marker.setAttribute('refY', '3.5');
            marker.setAttribute('orient', 'auto');
            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            polygon.setAttribute('points', '10 0, 10 7, 0 3.5');
            polygon.setAttribute('fill', this.getEdgeColor());
            marker.appendChild(polygon);
            g.appendChild(marker);
            startVector.moveForward(10);
        }
        if (this.hasEndArrow()) {
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
            marker.setAttribute('id', endArrowId);
            marker.setAttribute('markerWidth', '10');
            marker.setAttribute('markerHeight', '7');
            marker.setAttribute('refX', '0');
            marker.setAttribute('refY', '3.5');
            marker.setAttribute('orient', 'auto');
            const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
            polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
            polygon.setAttribute('fill', this.getEdgeColor());
            marker.appendChild(polygon);
            g.appendChild(marker);
            lineVector.moveForward(-10);
        }
        line.setAttribute('d', `M${startVector.x + source.centerX + offsetX} ${startVector.y + source.centerY + offsetY} L${lineVector.x + source.centerX + offsetX} ${lineVector.y + source.centerY + offsetY}`);
        this.handleLineStyle(line);
        this.handleArrow(line, startArrowId, endArrowId);
        g.appendChild(line);
        svg.appendChild(g);
    }
    hasStartArrow() {
        const src = this.polylineEdge && this.polylineEdge.getElementsByTagName('y:Arrows')[0]?.getAttribute('source');
        return !!src && src !== 'none';
    }
    hasEndArrow() {
        const src = this.polylineEdge && this.polylineEdge.getElementsByTagName('y:Arrows')[0]?.getAttribute('target');
        return !!src && src !== 'none';
    }
    handleArrow(line, startArrowId, endArrowId) {
        if (this.polylineEdge) {
            const arrows = this.polylineEdge.getElementsByTagName('y:Arrows');
            if (arrows.length) {
                if (arrows[0].getAttribute('source') !== 'none') {
                    line.setAttribute('marker-start', `url(#${startArrowId})`);
                }
                if (arrows[0].getAttribute('target') !== 'none') {
                    line.setAttribute('marker-end', `url(#${endArrowId})`);
                }
            }
        }
    }
    getEdgeColor() {
        if (this.polylineEdge) {
            const ls = this.polylineEdge.getElementsByTagName('y:LineStyle');
            if (ls.length) {
                return ls[0].getAttribute('color');
            }
        }
        return 'black';
    }
    handleLineStyle(line) {
        if (this.polylineEdge) {
            const ls = this.polylineEdge.getElementsByTagName('y:LineStyle');
            if (ls.length) {
                line.setAttribute('stroke', ls[0].getAttribute('color'));
                line.setAttribute('stroke-width', ls[0].getAttribute('width'));
            }
        }
    }
    castRay(startLocation, target, obstacles) {
        const ray = target.clone().subVec(startLocation);
        const collisions = [];
        for (let i = 0; i < obstacles.length; i++) {
            const collision = ray.intersectionPoint(obstacles[i], obstacles[(i + 1) % obstacles.length]);
            if (collision) {
                collisions.push(collision);
            }
        }
        return collisions.sort((a, b) => a.length() - b.length())[0];
    }
}
//# sourceMappingURL=edge.js.map