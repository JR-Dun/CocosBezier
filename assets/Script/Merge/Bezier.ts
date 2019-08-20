import { BezierImpl } from "./BezierImpl";
import BezierPoint from "./BezierPoint";

export class Bezier {

    mIndex;
    p0;
    mSpeedRate;
    mLength;
    mMap:Array<any> = [];

    constructor(pointCount:number, ...pArray: BezierPoint[]) { 
        this.mIndex = 0;
        var bezierPoint = pArray[this.mIndex++];
        this.p0 = bezierPoint.getV2();
        this.mSpeedRate = bezierPoint.getSpeedRate();
        this.mLength = 0;
        this.mMap = [];

        for(var i = 3; i < pointCount; ++i)
        {
            var p1 = cc.v2((pArray[this.mIndex].getV2().x + pArray[this.mIndex + 1].getV2().x) / 2,(pArray[this.mIndex].getV2().y + pArray[this.mIndex + 1].getV2().y) / 2);
            var bezierImpl = new BezierImpl(this.p0, pArray[this.mIndex].getV2(), p1, this.mSpeedRate);
    
            this.mMap.push({first: this.mLength, second: bezierImpl});
            this.mLength += bezierImpl.getLength();
    
            this.p0 = p1;
            this.mSpeedRate = pArray[this.mIndex + 1].getSpeedRate();
            this.mIndex++;
        }

        var bezierImpl = new BezierImpl(this.p0, pArray[this.mIndex].getV2(), pArray[this.mIndex + 1].getV2(), this.mSpeedRate);
        this.mMap.push({first: this.mLength, second: bezierImpl});
        this.mLength += bezierImpl.getLength();
        this.mMap.sort(this.sortCmd);

        // this.mMap = mMap;
        // this.mLength = mLength;
    }

    private sortCmd(a, b): any {
        return a.first - b.first;
    }

    public getLength(): any {
        return this.mLength;
    }

    public getPoint(t): any {
        t *= this.mLength;
    
        var it = this.mMap[Math.max(0, this.upperBound(t) - 1)];
    
        t = (t - it.first) / it.second.getLength();
        return it.second.getPoint(t);
    }

    private upperBound(findKey): any {
        var index;
        for (index = 0; index < this.mMap.length; ++index) {
            if (this.mMap[index].first > findKey) {
                break;
            }
        }
        return index;
    }
 }