
export class BezierImpl {
    p0: cc.Vec2;
    p1: cc.Vec2;
    p2: cc.Vec2;

    ax;
    ay;
    bx;
    by;

    A;
    B;
    C;

    t0;
    t1;

    m0;
    m1;
    m2;
    m3;

    ttt;

    f0;
    f1;
    f2;
    f3;

    temp1;

    mLength: number;
    mSpeedRate

    constructor(point0:cc.Vec2, point1:cc.Vec2, point2:cc.Vec2, speedRate:number) {
        this.p0 = point0;
        this.p1 = point1;
        this.p2 = point2;
        this.mSpeedRate = speedRate;

        this.ax = this.p0.x - 2 * this.p1.x + this.p2.x;
        this.ay = this.p0.y - 2 * this.p1.y + this.p2.y;
        this.bx = 2 * (this.p1.x - this.p0.x);
        this.by = 2 * (this.p1.y - this.p0.y);

        this.A = 4 * (this.ax * this.ax + this.ay * this.ay);
        this.B = 4 * (this.ax * this.bx + this.ay * this.by);
        this.C = this.bx * this.bx + this.by * this.by;

	    this.t0 = Math.sqrt(this.C);
        this.t1 = 8 * Math.pow(this.A, 1.5);
        
	    this.m0 = (this.B * this.B - 4 * this.A * this.C) / this.t1;
	    this.m1 = 2 * Math.sqrt(this.A);
	    this.m2 = this.m1 / this.t1;
	    this.ttt = (this.B + this.m1 * this.t0);
        this.m3 = this.m0 * Math.log(this.ttt <= 0 ? 0.0000001 : this.ttt) - this.B * this.m2 * this.t0;
        
	    this.f0 = this.A + this.B;
	    this.f1 = this.A + this.f0;
	    this.temp1 = this.C + this.f0;
	    this.f2 = Math.sqrt(this.temp1 < 0 ? 0 : this.temp1);
	    this.temp1 = this.f1 + this.m1 * this.f2;
        this.f3 = Math.log(this.temp1 <= 0 ? 0.0000001 : this.temp1);
        
        this.mLength = (this.m3 - this.m0 * this.f3 + this.m2 * this.f1 * this.f2) * (1 / speedRate);
        
        this.A = this.A;
        this.B = this.B;
        this.C = this.C;
        this.m0 = this.m0;
        this.m1 = this.m1;
        this.m2 = this.m2;
        this.m3 = this.m3;
        this.p0 = this.p0;
        this.p1 = this.p1;
        this.p2 = this.p2;	
    }

    public getLength(): number {
        return this.mLength;
    }

    public getPoint(dt): cc.Vec2 {
        var ll = this.m3 - dt * this.mLength * this.mSpeedRate;
        for (var i = 0; i < 7; ++i) {
    
            var f0 = this.A * dt;
            var f1 = this.B + f0;
            var f2 = f1 + f0;
            var temp1 = this.C + dt * f1;
            var f3 = Math.sqrt(temp1 < 0 ? 0 : temp1);
            temp1 = f2 + this.m1 * f3;
            var f4 = Math.log(temp1 <= 0 ? 0.0000001 : temp1);
            var f = (ll - this.m0 * f4) / f3 + this.m2 * f2;
            dt -= f;
            if (Math.abs(f) < 0.01) {
                break;
            }
        }
    
        var c = dt * dt;
        var b = dt + dt;
        var a = 1 - b + c;
        b -= c + c;
                
        return cc.v2((a * this.p0.x + b * this.p1.x + c * this.p2.x), (a * this.p0.y + b * this.p1.y + c * this.p2.y));
    }
}