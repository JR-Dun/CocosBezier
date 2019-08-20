
const {ccclass, property} = cc._decorator;

@ccclass
export default class BezierAction extends cc.Component {

    @property(cc.Node)
    target: cc.Node = null;

    @property([cc.Node])
    ctrls: Array<cc.Node> = [];

    @property(Number)
    duration: number = 2;

    private oldPosition: cc.Vec2;

    start() {
        this.oldPosition = this.node.position;
    }

    play() {
        let array = [];
        this.ctrls.forEach(element => {
            array.push(element.position);
        });
        array.push(this.target.position);
        this.node.runAction(cc.bezierTo(this.duration, array));
    }

    reset() {
        this.node.position = this.oldPosition;
    }
}
