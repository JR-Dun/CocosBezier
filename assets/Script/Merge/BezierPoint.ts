
export default class BezierPoint {	
    _x: number;		
    _y: number;		
    _speedRate: number = 1;

    constructor(x, y, speedRate?) {
        this._x = x;
        this._y = y;

        if(speedRate)
        {
            this._speedRate = speedRate;
        }
    }

    public getV2(): cc.Vec2 {
        return cc.v2(this._x, this._y);
    }

    public getSpeedRate(): number {
        return this._speedRate;
    }

    public static Create(x, y, speedRate?): BezierPoint {
        return new BezierPoint(x, y, speedRate);
    }
}
