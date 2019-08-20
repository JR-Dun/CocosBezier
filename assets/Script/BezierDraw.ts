import BezierAction from "./BezierAction";
import BezierPoint from "./Merge/BezierPoint";
import { BezierActionComponent } from "./Merge/BezierActionComponent";

const {ccclass, property, executeInEditMode} = cc._decorator;

@ccclass
@executeInEditMode
export default class BezierDraw extends cc.Component {

    @property([BezierAction])
    bezierActions: Array<BezierAction> = [];

    @property(cc.Node)
    actionNode: cc.Node = null;

    @property(Number)
    duration: number = 2;

    @property(cc.Node)
    mergeHolder: cc.Node = null;

    @property(cc.Prefab)
    dotPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    controlPointPrefab: cc.Prefab = null;
    @property(cc.Prefab)
    keyPointPrefab: cc.Prefab = null;

    private graphics : cc.Graphics = null;
    private bezierParamsJson : string = "";
    private lastDotPosition : cc.Vec2 = null;
    private time : number = 0;

    
    start() {
        this.graphics = this.getComponent(cc.Graphics);
    }

    update(dt) {
        this.time += dt;
    }

    lateUpdate() {
        this.checkPosition();
        this._drawMergeLine();
    }
    
    _getBezierParams() {
        let params = [];
        this.bezierActions.forEach((bezierAction) => {
            if (!bezierAction) {
                return;
            }
            let param = [
                bezierAction.node.position,
                bezierAction.ctrls[0].position,
                bezierAction.ctrls[1].position,
                bezierAction.target.position,
            ];
            params.push(param);
        });
        return params;
    }
    
    _getMergeBezierPoints() {
        let params = [];
        this.bezierActions.forEach((bezierAction) => {
            if (!bezierAction) {
                return;
            }

            if(params.length <= 0 || !cc.pointEqualToPoint(params[params.length - 1], bezierAction.node.position)) {
                params.push(bezierAction.node.position);
            }
            params.push(bezierAction.ctrls[0].position);
            params.push(bezierAction.ctrls[1].position);
            params.push(bezierAction.target.position);
        });
        return params;
    }

    _onDrawBezierCurve() {
        let haveRun = this.bezierActions.find(bezierAction => {
            return bezierAction.node.getNumberOfRunningActions();
        });
        if (haveRun) {
            return;
        }
        this.graphics.clear();
        this.bezierActions.forEach((bezierAction) => {
            this._drawOneBezier(bezierAction);    
        });
    }

    _drawOneBezier(bezierAction) {
        this._drawLine(bezierAction.node,  bezierAction.ctrls[0],  cc.Color.RED);
        this._drawLine(bezierAction.target, bezierAction.ctrls[1], cc.Color.RED);
        this.graphics.strokeColor = cc.Color.BLUE;
        this.graphics.lineWidth = 4;
        this.graphics.moveTo(bezierAction.node.x, bezierAction.node.y);
        this.graphics.bezierCurveTo(
            bezierAction.ctrls[0].x, bezierAction.ctrls[0].y, 
            bezierAction.ctrls[1].x, bezierAction.ctrls[1].y, 
            bezierAction.target.x, bezierAction.target.y
        );
        this.graphics.stroke();
    }

    _drawLine(startNode, ctrlNode, color) {
        this.graphics.strokeColor = color;
        this.graphics.lineWidth = 2;
        this.graphics.moveTo(startNode.x, startNode.y);
        this.graphics.lineTo(ctrlNode.x, ctrlNode.y);
        this.graphics.stroke();
    }

    _drawMergeLine() {
        if(this.time > 0.1 && !cc.pointEqualToPoint(this.actionNode.position, this.lastDotPosition)) {
            this.time = 0;
            let element = cc.instantiate(this.dotPrefab);
            element.parent = this.mergeHolder;
            element.position = this.lastDotPosition = this.actionNode.position;
        }
    }

    checkPosition() {
        let params = this._getBezierParams();
        if(this.bezierParamsJson == JSON.stringify(params)) return;

        this.bezierParamsJson = JSON.stringify(params);
        console.log(this.bezierParamsJson);

        this._onDrawBezierCurve();
    }



    addPoint() {
        this.node.children.forEach(element => {
            console.log(element.name);
        });

        let controlP_1 = cc.instantiate(this.controlPointPrefab);
        let controlP_2 = cc.instantiate(this.controlPointPrefab);
        let keyP = cc.instantiate(this.keyPointPrefab);

        let lastKeyP = this.node.children[this.node.childrenCount - 2];
        let endP = this.node.children[this.node.childrenCount - 1];
        keyP.position = cc.pAdd(endP.position, new cc.Vec2(-30, -30));
        controlP_2.position = cc.pAdd(keyP.position, new cc.Vec2(0, 30));
        controlP_1.position = cc.pMidpoint(lastKeyP.position, keyP.position);

        keyP.getComponent(BezierAction).target = endP;
        keyP.getComponent(BezierAction).ctrls = [controlP_1, controlP_2];

        lastKeyP.getComponent(BezierAction).target = keyP;

        this.node.insertChild(controlP_1, this.node.childrenCount - 1);
        this.node.insertChild(controlP_2, this.node.childrenCount - 1);
        this.node.insertChild(keyP, this.node.childrenCount - 1);

        this.bezierActions.push(keyP.getComponent(BezierAction));
    }

    playBezierAction() {
        this.mergeHolder.removeAllChildren();
        
        let params = this._getBezierParams();
        this.actionNode.rotation = 0;
        this.actionNode.position = params[0][0];
        let actions = params.map(param => {
            return cc.bezierTo(this.duration, param.slice(1));
        });
        this.actionNode.runAction(cc.sequence(actions));
    }

    playMergeBezierAction() {
        this.mergeHolder.removeAllChildren();

        let params = this._getMergeBezierPoints();
        let route : BezierPoint[] = [];
        params.forEach(element => {
            route.push(BezierPoint.Create(element.x, element.y));
        });
        let action = this.actionNode.addComponent(BezierActionComponent);
        if(action) {
            action.swimming(200, route, false);
        }

        console.log("*********** megre ************");
        console.log(JSON.stringify(params));
        console.log("******************************");
    }
}
