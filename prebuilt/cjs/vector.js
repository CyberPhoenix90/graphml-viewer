"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Vector = void 0;
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    static fromPolarCoordinates(length, angle) {
        return new Vector(length * Math.cos(angle), length * Math.sin(angle));
    }
    add(x, y) {
        this.x += x;
        this.y += y;
        return this;
    }
    subVec(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    }
    clone() {
        return new Vector(this.x, this.y);
    }
    length() {
        return (this.x ** 2 + this.y ** 2) ** 0.5;
    }
    angle() {
        return Math.atan2(this.y, this.x);
    }
    moveForward(distance) {
        this.add(distance * Math.cos(this.angle()), distance * Math.sin(this.angle()));
    }
    isEqual(vector) {
        return this.x === vector.x && this.y === vector.y;
    }
    intersectionPoint(lineOrigin, lineTarget) {
        if ((this.x === 0 && this.y === 0) || lineOrigin.isEqual(lineTarget)) {
            return undefined;
        }
        let ua;
        let ub;
        let denominator = (lineTarget.y - lineOrigin.y) * this.x - (lineTarget.x - lineOrigin.x) * this.y;
        if (denominator === 0) {
            return undefined;
        }
        ua = ((lineTarget.x - lineOrigin.x) * -lineOrigin.y - (lineTarget.y - lineOrigin.y) * -lineOrigin.x) / denominator;
        ub = (this.x * -lineOrigin.y - this.y * -lineOrigin.x) / denominator;
        if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
            return undefined;
        }
        return new Vector(ua * this.x, ua * this.y);
    }
}
exports.Vector = Vector;
//# sourceMappingURL=vector.js.map