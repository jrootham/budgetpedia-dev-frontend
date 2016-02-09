'use strict';
var React = require('react');
var ReactFlipCard = require('react-flipcard');
var GridTile = require('material-ui/lib/grid-list/grid-tile');
var FontIcon = require('material-ui/lib/font-icon');
var IconButton = require('material-ui/lib/icon-button');
class NavTile extends React.Component {
    constructor() {
        super();
        this.transitionTo = (e) => {
            if (e.target.tagName == 'A')
                return;
            e.stopPropagation();
            e.preventDefault();
            var _this = this;
            window.setTimeout(function () {
                _this.props.transitionTo(_this.props.route);
            }, 0);
        };
        this.rawMarkup = (selector) => {
            return { __html: this.props[selector] };
        };
        this.showBack = (e) => {
            e.stopPropagation();
            this.setState({
                isFlipped: true
            });
        };
        this.showFront = (e) => {
            if (e.target.tagName == 'A')
                return;
            e.stopPropagation();
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
                this.showFront(e);
            }
        };
        this.state = {
            isFlipped: false,
            elements: {},
        };
    }
    render() {
        let tile = this;
        return (React.createElement(GridTile, null, React.createElement(ReactFlipCard, {"disabled": true, "flipped": tile.state.isFlipped, "onFlip": tile.handleOnFlip, "onKeyDown": tile.handleKeyDown, "style": { border: "none" }}, React.createElement("div", {"className": "flipcard-frame", "onTouchTap": tile.transitionTo, "style": { cursor: 'pointer' }}, tile.rawMarkup('help').__html ?
            React.createElement(IconButton, {"style": {
                borderRadius: '12px',
                backgroundColor: tile.props.tilecolors.front,
                padding: 0,
                height: "24px",
                width: "24px",
                position: "absolute",
                zIndex: 2,
                right: 0,
                top: 0
            }, "onTouchTap": tile.showBack}, React.createElement(FontIcon, {"className": "material-icons", "color": tile.props.tilecolors.helpbutton}, "help")) : null, React.createElement("div", {"className": "flipcard-padding"}, React.createElement("div", {"className": "flipcard-border", "style": {
            backgroundColor: tile.props.tilecolors.front,
        }}, React.createElement("div", {"className": "flipcard-content", "ref": (node) => { tile.state.elements.frontface = node; }}, React.createElement("div", {"dangerouslySetInnerHTML": tile.rawMarkup('markup')}))))), React.createElement("div", {"className": "flipcard-frame", "onTouchTap": tile.showFront, "style": { cursor: 'pointer' }}, React.createElement(IconButton, {"style": {
            backgroundColor: tile.props.tilecolors.back,
            padding: 0,
            height: "24px",
            width: "24px",
            position: "absolute",
            zIndex: 2,
            right: 0,
            top: 0
        }, "onTouchTap": tile.showFront}, React.createElement(FontIcon, {"className": "material-icons", "color": tile.props.tilecolors.helpbutton}, "flip_to_front")), React.createElement("div", {"className": "flipcard-padding"}, React.createElement("div", {"className": "flipcard-border", "style": { backgroundColor: tile.props.tilecolors.back, }}, React.createElement("div", {"className": "flipcard-content", "ref": (node) => { tile.state.elements.backface = node; }}, React.createElement("div", {"dangerouslySetInnerHTML": tile.rawMarkup('help')}))))))));
    }
}
exports.NavTile = NavTile;
