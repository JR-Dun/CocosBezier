import { Bezier } from "./Bezier";
import BezierPoint from "./BezierPoint";

const {ccclass, property} = cc._decorator;

@ccclass
export class BezierActionComponent extends cc.Component {

    _speed;
	_startPosition;
    _endPosition;
    _repeatForever: boolean = false;
    _lastDuration: number = 0;
    _duration: number = 0;
    _time: number = 0;

	_bezier:Bezier;
    lastPosition:cc.Vec2;

    accuracy: number = 1000000;
    
    _canMove: boolean = false;
    _lockVertical: boolean = false;
    _lockHorizontal: boolean = false;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    update (dt) {
        if(!this._canMove) return;
        if(!this._repeatForever)
        {
            if(this._time > this._duration) return;
        }

        this._time += dt;

        // console.log("time = ", this._time);
        // console.log("duration = ", this._duration);
        let duration = this.getDuration(this._time);
        if(duration < this._lastDuration && !this._repeatForever) return;
        this._lastDuration = duration;
        var currentPosition = this._bezier.getPoint(duration);
        this.node.setPosition(currentPosition);

        this.updateRotation(currentPosition);
    }

    private updateRotation(currentPosition) {
        if(this.lastPosition)
        {
            if(this._lockVertical && this._lockHorizontal) {
                this.node.rotation = 0;
            }
            else if(this._lockVertical) {
                if(Math.abs(this.lastPosition.x - currentPosition.x) < 1) return;
                this.node.rotationY = (this.lastPosition.x <= currentPosition.x) ? 0 : 180;
            }
            else {
                this.node.rotation = this.getRotation(currentPosition);
            }
        }

        this.lastPosition = currentPosition;
    }

    public lockVertical() {
        this._lockVertical = true;
    }

    public lockHorizontal() {
        this._lockHorizontal = true;
    }

    public getLockPosition(add): cc.Vec2 {
        let duration = this.getDuration(this._time + add);

        if(duration < this._lastDuration && !this._repeatForever) 
            return new cc.Vec2(0, 0);

        return this._bezier.getPoint(duration);
    }

    public swimming(speed, positions:BezierPoint[], repeatForever: boolean = true) {
        this._speed = speed;
        this._repeatForever = repeatForever;
		this._startPosition = positions[0].getV2();
		this._endPosition = positions[positions.length - 1].getV2();
		this._bezier = new Bezier(positions.length, ...positions);
		
		this.setDuration(this.getLength() / speed);
        this._canMove = true;

        if(!this._repeatForever)
        {
            //
        }
    }

    public isStop() {
        return (this._canMove == false && this._time == 0);
    }

    public restart() {
        this._time = 0;
        this._canMove = true;
    }

    public stop() {
        this._canMove = false;
        this._time = 0;
    }

    public isPause() {
        return (this._canMove == false && this._time > 0);
    }

    public pause() {
        this._canMove = false;
    }

    public resume() {
        this._canMove = true;
    }

    public totalDuration() {
        return this._duration;
    }

    private setDuration(duration)
    {
        this._duration = duration;
    }

    private getDuration(nowTime)
    {
        let result = ~~(nowTime * this.accuracy) % ~~(this._duration * this.accuracy);
        return result / ~~(this._duration * this.accuracy);
    }

    private getLength() {
        return this._bezier.getLength();
    }
    
	private getRotation(currentPosition) {
		if(currentPosition == this.lastPosition) return;

		// 计算角度
		let degree;
		if (currentPosition.x - this.lastPosition.x == 0) {
			// 垂直
			if (currentPosition.y - this.lastPosition.y > 0) {
				degree = 0;
			} else {
				degree = 180;
			}
		} else {
			degree = - Math.atan((currentPosition.y - this.lastPosition.y) / (currentPosition.x - this.lastPosition.x)) * 180 / 3.14;

			if(currentPosition.x - this.lastPosition.x > 0)
			{
				degree += 90;
			}
			else
			{
				degree -= 90;
			}
        }
        
        degree = this.horizontalRotation(degree);

		return degree;
    }

    //上下翻转后的角度
    private horizontalRotation(degree: number): number {
        let result = degree;
        if(this._lockHorizontal) {
            if(degree >= 0) {
                if(degree > 180) {
                    result = degree - 180;
                    this.node.scaleY = -Math.abs(this.node.scaleY);
                }
                else {
                    this.node.scaleY = Math.abs(this.node.scaleY);
                }
            }
            else {
                if(degree > -180) {
                    result = 180 - Math.abs(degree);
                    this.node.scaleY = -Math.abs(this.node.scaleY);
                }
                else {
                    this.node.scaleY = Math.abs(this.node.scaleY);
                }
            }
        }

        return result;
    }
}
