export class Vector {
	public x: number;
	public y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}

	public static fromPolarCoordinates(length: number, angle: number): Vector {
		return new Vector(length * Math.cos(angle), length * Math.sin(angle));
	}

	public add(x: number, y: number): this {
		this.x += x;
		this.y += y;

		return this;
	}

	public subVec(vector: Vector): this {
		this.x -= vector.x;
		this.y -= vector.y;

		return this;
	}

	public clone(): Vector {
		return new Vector(this.x, this.y);
	}

	public length(): number {
		return (this.x ** 2 + this.y ** 2) ** 0.5;
	}

	public angle(): number {
		return Math.atan2(this.y, this.x);
	}

	public moveForward(distance: number): void {
		this.add(distance * Math.cos(this.angle()), distance * Math.sin(this.angle()));
	}

	public isEqual(vector: Vector): boolean {
		return this.x === vector.x && this.y === vector.y;
	}

	public intersectionPoint(lineOrigin: Vector, lineTarget: Vector): Vector {
		if ((this.x === 0 && this.y === 0) || lineOrigin.isEqual(lineTarget)) {
			return undefined;
		}

		let ua: number;
		let ub: number;
		let denominator: number = (lineTarget.y - lineOrigin.y) * this.x - (lineTarget.x - lineOrigin.x) * this.y;

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
