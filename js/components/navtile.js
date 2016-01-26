'use strict';
var React = require('react');
var FlipCard = require('react-flipcard');
var GridTile = require('material-ui/lib/grid-list/grid-tile');
var FontIcon = require('material-ui/lib/font-icon');
var IconButton = require('material-ui/lib/icon-button');
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
            let node = this.state.elements.backface;
            if (this.props.system.ischrome)
                node.style.display = 'none';
            this.setState({
                isFlipped: false
            });
        };
        this.handleOnFlip = (flipped) => {
            if (this.props.system.ischrome) {
                if (flipped) {
                    this.state.elements.backface.style.overflow = 'auto';
                    this.state.elements.backface.style.display = 'block';
                    this.state.elements.frontface.style.display = 'none';
                }
                else {
                    this.state.elements.frontface.style.overflow = 'auto';
                    this.state.elements.frontface.style.display = 'block';
                    this.state.elements.backface.style.display = 'none';
                }
            }
        };
        this.handleKeyDown = (e) => {
            if (this.state.isFlipped && e.keyCode === 27) {
                this.showFront();
            }
        };
        this.state = {
            isFlipped: false,
            elements: {},
        };
    }
    render() {
        return (React.createElement(GridTile, null, React.createElement(FlipCard, {"disabled": true, "flipped": this.state.isFlipped, "onFlip": this.handleOnFlip, "onKeyDown": this.handleKeyDown, "style": { border: "none" }}, React.createElement("div", {"className": "flipcard-frame"}, this.rawMarkup('help').__html ?
            React.createElement(IconButton, {"style": {
                borderRadius: '12px',
                backgroundColor: this.props.tilecolors.front,
                padding: 0,
                height: "24px",
                width: "24px",
                position: "absolute",
                zIndex: 2,
                right: 0,
                top: 0
            }, "onTouchTap": this.showBack}, React.createElement(FontIcon, {"className": "material-icons", "color": this.props.tilecolors.helpbutton}, "help")) : null, React.createElement("div", {"className": "flipcard-padding"}, React.createElement("div", {"className": "flipcard-border", "style": { backgroundColor: this.props.tilecolors.front, }}, React.createElement("div", {"className": "flipcard-content", "ref": (node) => { this.state.elements.frontface = node; }}, React.createElement("div", {"dangerouslySetInnerHTML": this.rawMarkup('markup')}))))), React.createElement("div", {"className": "flipcard-frame", "onClick": this.showFront}, React.createElement(IconButton, {"style": { backgroundColor: this.props.tilecolors.back, padding: 0, height: "24px", width: "24px", position: "absolute", zIndex: 2, right: 0, top: 0 }, "onTouchTap": this.showFront}, React.createElement(FontIcon, {"className": "material-icons", "color": this.props.tilecolors.helpbutton}, "flip_to_front")), React.createElement("div", {"className": "flipcard-padding"}, React.createElement("div", {"className": "flipcard-border", "style": { backgroundColor: this.props.tilecolors.back, }}, React.createElement("div", {"className": "flipcard-content", "ref": (node) => { this.state.elements.backface = node; }}, React.createElement("div", {"dangerouslySetInnerHTML": this.rawMarkup('help')}))))))));
    }
}
exports.NavTile = NavTile;
