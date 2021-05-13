import { Vector } from './vector.js';
export class Edge {
    constructor(edgeXML) {
        // The default values are designed to never change the AABB computation in case the node has no rendered content
        this.left = Number.MAX_SAFE_INTEGER;
        this.right = Number.MIN_SAFE_INTEGER;
        this.top = Number.MAX_SAFE_INTEGER;
        this.bottom = Number.MIN_SAFE_INTEGER;
        this.id = edgeXML.getAttribute('id');
        this.source = edgeXML.getAttribute('source');
        this.target = edgeXML.getAttribute('target');
        this.root = edgeXML;
        const points = edgeXML.getElementsByTagName('y:Point');
        if (points.length) {
            for (const point of points) {
                const x = parseFloat(point.getAttribute('x'));
                const y = parseFloat(point.getAttribute('y'));
                if (x < this.left) {
                    this.left = x;
                }
                if (y < this.top) {
                    this.top = y;
                }
                if (x > this.right) {
                    this.right = x;
                }
                if (y > this.bottom) {
                    this.bottom = y;
                }
            }
        }
    }
    render(svg, source, target, offsetX, offsetY) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const points = [
            new Vector(source.centerX, source.centerY),
            ...Array.from(this.root.getElementsByTagName('y:Point')).map((n) => new Vector(parseFloat(n.getAttribute('x')), parseFloat(n.getAttribute('y')))),
            new Vector(target.centerX, target.centerY)
        ];
        const first = points[0];
        const second = points[1];
        const secondToLast = points[points.length - 2];
        const last = points[points.length - 1];
        const startVector = this.castRay(new Vector(first.x, first.y), new Vector(second.x, second.y), source.generateBoundingBox().map((obstacle) => new Vector(first.x, first.y).subVec(obstacle))) ?? new Vector(first.x, first.y);
        const lineVector = this.castRay(new Vector(secondToLast.x, secondToLast.y), new Vector(last.x, last.y), target.generateBoundingBox().map((obstacle) => obstacle.subVec(new Vector(secondToLast.x, secondToLast.y))));
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
        points.pop();
        points.shift();
        line.setAttribute('d', `M${startVector.x + source.centerX + offsetX} ${startVector.y + source.centerY + offsetY} ${points
            .map((s) => `L${s.x + offsetX},${s.y + offsetY}`)
            .join(' ')} L${lineVector.x + secondToLast.x + offsetX} ${lineVector.y + secondToLast.y + offsetY}`);
        this.handleLineStyle(line);
        this.handleArrow(line, startArrowId, endArrowId);
        g.appendChild(line);
        svg.appendChild(g);
    }
    hasStartArrow() {
        const src = this.root.getElementsByTagName('y:Arrows')[0]?.getAttribute('source');
        return !!src && src !== 'none';
    }
    hasEndArrow() {
        const src = this.root.getElementsByTagName('y:Arrows')[0]?.getAttribute('target');
        return !!src && src !== 'none';
    }
    handleArrow(line, startArrowId, endArrowId) {
        const arrows = this.root.getElementsByTagName('y:Arrows');
        if (arrows.length) {
            if (arrows[0].getAttribute('source') !== 'none') {
                line.setAttribute('marker-start', `url(#${startArrowId})`);
            }
            if (arrows[0].getAttribute('target') !== 'none') {
                line.setAttribute('marker-end', `url(#${endArrowId})`);
            }
        }
    }
    getEdgeColor() {
        const ls = this.root.getElementsByTagName('y:LineStyle');
        if (ls.length) {
            return ls[0].getAttribute('color');
        }
        return 'black';
    }
    handleLineStyle(line) {
        const ls = this.root.getElementsByTagName('y:LineStyle');
        if (ls.length) {
            line.setAttribute('fill', 'transparent');
            line.setAttribute('stroke', ls[0].getAttribute('color'));
            line.setAttribute('stroke-width', ls[0].getAttribute('width'));
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