'use strict';
var React = require('react');
var FlipCard = require('react-flipcard');
var GridTile = require('material-ui/lib/grid-list/grid-tile');
class NavTile extends React.Component {
    constructor() {
        super();
        this.rawMarkup = (selector) => {
            return { __html: this.props[selector] };
        };
        this.showBack = () => {
            this.setState({
                isFlipped: true
            });
        };
        this.showFront = () => {
            this.setState({
                isFlipped: false
            });
        };
        this.handleOnFlip = (flipped) => {
            if (flipped) {
                var node = this.state.elements.backButton;
                node.focus();
            }
        };
        this.handleKeyDown = (e) => {
            if (this.state.isFlipped && e.keyCode === 27) {
                this.showFront();
            }
        };
        this.state = { isFlipped: false };
        this.state.elements = {};
    }
    render() {
        return (React.createElement(GridTile, null, React.createElement(FlipCard, {"style": this.props.style, "disabled": true, "flipped": this.state.isFlipped, "onFlip": this.handleOnFlip, "onKeyDown": this.handleKeyDown}, React.createElement("div", {"className": "TCFlipCard", "style": { border: '1px solid gray', backgroundColor: 'palegreen', padding: '3px' }}, React.createElement("div", {"dangerouslySetInnerHTML": this.rawMarkup('markup')}), React.createElement("button", {"type": "button", "onClick": this.showBack}, "Show back"), React.createElement("div", null, React.createElement("small", null, "(manual flip) "))), React.createElement("div", {"className": "TCFlipCard", "style": { border: '1px solid gray', backgroundColor: 'palegoldenrod', padding: '3px' }}, React.createElement("div", {"dangerouslySetInnerHTML": this.rawMarkup('help')}), React.createElement("button", {"type": "button", "ref": (node) => { this.state.elements.backButton = node; }, "onClick": this.showFront}, "Show front")))));
    }
}
exports.NavTile = NavTile;
