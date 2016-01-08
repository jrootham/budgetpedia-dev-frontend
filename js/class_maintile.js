var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var FlipCard = require('react-flipcard');
var MainTile = (function (_super) {
    __extends(MainTile, _super);
    function MainTile() {
        var _this = this;
        _super.call(this);
        this.rawMarkup = function () {
            return { __html: _this.props.markup };
        };
        this.showBack = function () {
            _this.setState({
                isFlipped: true
            });
        };
        this.showFront = function () {
            _this.setState({
                isFlipped: false
            });
        };
        this.handleOnFlip = function (flipped) {
            if (flipped) {
                var node = _this.state.elements.backButton;
                node.focus();
            }
        };
        this.handleKeyDown = function (e) {
            if (_this.state.isFlipped && e.keyCode === 27) {
                _this.showFront();
            }
        };
        this.state = { isFlipped: false };
        this.state.elements = {};
    }
    MainTile.prototype.render = function () {
        var _this = this;
        return (React.createElement("div", {"style": this.props.style}, React.createElement(FlipCard, {"disabled": true, "flipped": this.state.isFlipped, "onFlip": this.handleOnFlip, "onKeyDown": this.handleKeyDown}, React.createElement("div", {"style": { width: '170px', border: '1px solid gray' }}, React.createElement("div", null, "Front"), React.createElement("button", {"type": "button", "onClick": this.showBack}, "Show back"), React.createElement("div", null, React.createElement("small", null, "(manual flip) "))), React.createElement("div", {"style": { width: '170px', border: '1px solid gray' }}, React.createElement("div", null, "Back"), React.createElement("button", {"type": "button", "ref": function (node) { _this.state.elements.backButton = node; }, "onClick": this.showFront}, "Show front")))));
    };
    return MainTile;
})(React.Component);
exports.MainTile = MainTile;
//# sourceMappingURL=class_maintile.js.map