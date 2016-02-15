'use strict';
var React = require('react');
var FlipCard = require('react-flipcard');
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
        this.showBack = e => {
            e.stopPropagation();
            this.setState({
                isFlipped: true
            });
        };
        this.showFront = e => {
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
        this.expandFront = e => {
            e.stopPropagation();
            if (this.state.elements.frontface.style.overflow != 'auto') {
                this.state.elements.frontface.style.overflow = 'auto';
                this.scroll(this.state.elements.frontface, 0, 160);
                this.setState({ expandiconfront: 'expand_less' });
            }
            else {
                this.scroll(this.state.elements.frontface, this.state.elements.frontface.scrollTop, 0);
                this.state.elements.frontface.style.overflow = 'hidden';
                this.setState({ expandiconfront: 'expand_more' });
            }
        };
        this.expandBack = e => {
            e.stopPropagation();
            if (this.state.elements.backface.style.overflow != 'scroll') {
                this.state.elements.backface.style.overflow = 'scroll';
                this.scroll(this.state.elements.backface, 0, 160);
                this.setState({ expandiconback: 'expand_less' });
            }
            else {
                this.scroll(this.state.elements.backface, this.state.elements.backface.scrollTop, 0);
                this.state.elements.backface.style.overflow = 'hidden';
                this.setState({ expandiconback: 'expand_more' });
            }
        };
        this.scroll = (element, from, to) => {
            if (Math.abs(from - to) < 1)
                return;
            let top = from;
            let increment = (to > from) ? 1 : -1;
            let interval = setInterval(() => {
                top += increment;
                element.scrollTop = top;
                if (Math.abs(top - to) < 1) {
                    clearInterval(interval);
                }
            }, 4);
        };
        this.handleOnFlip = flipped => {
            if (this.props.system.ischrome) {
                if (flipped) {
                    this.state.elements.backface.style.display = 'block';
                    this.state.elements.frontface.style.display = 'none';
                }
                else {
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
        this.isOverflowedFront = () => {
            return this.state.isoverflowedfront;
        };
        this.isOverflowedBack = () => {
            return this.state.isoverflowedback;
        };
        this.isOverflowed = element => {
            return element.scrollHeight > element.clientHeight;
        };
        this.componentDidMount = () => {
            let _this = this;
            _this.forceUpdate();
            setTimeout(() => {
                let isfrontoverflowed = _this.isOverflowed(_this.state.elements.frontface);
                let isbackoverflowed = _this.isOverflowed(_this.state.elements.backface);
                _this.setState({
                    isoverflowedfront: isfrontoverflowed,
                    isoverflowedback: isbackoverflowed,
                });
            });
        };
        this.state = {
            isFlipped: false,
            elements: {},
            expandiconfront: 'expand_more',
            expandiconback: 'expand_more',
            isoverflowedfront: false,
            isoverflowedback: false,
        };
    }
    render() {
        let tile = this;
        let helpicon = React.createElement(IconButton, {"key": 'helpicon', "className": "flipcard-help-icon", "style": {
            backgroundColor: tile.props.tilecolors.front,
            padding: 0,
            height: "36px",
            width: "36px",
            position: "absolute",
        }, "onTouchTap": tile.showBack}, React.createElement(FontIcon, {"className": "material-icons", "color": tile.props.tilecolors.helpbutton}, "help"));
        let returnicon = React.createElement(IconButton, {"className": "flipcard-return-to-front-icon", "style": {
            backgroundColor: tile.props.tilecolors.back,
            padding: 0,
            height: "36px",
            width: "36px",
            position: "absolute",
        }, "onTouchTap": tile.showFront}, React.createElement(FontIcon, {"className": "material-icons", "color": tile.props.tilecolors.helpbutton}, "flip_to_front"));
        let frontexpandicon = React.createElement(IconButton, {"className": "flipcard-expand-icon", "style": {
            backgroundColor: tile.props.tilecolors.front,
            height: "36px",
            width: "36px",
            padding: "0",
            position: "absolute",
        }, "onTouchTap": tile.expandFront}, React.createElement(FontIcon, {"className": "material-icons", "color": tile.props.tilecolors.helpbutton}, tile.state.expandiconfront));
        let backexpandicon = React.createElement(IconButton, {"className": "flipcard-expand-icon", "style": {
            backgroundColor: tile.props.tilecolors.back,
            height: "36px",
            width: "36px",
            padding: "0",
            position: "absolute",
        }, "onTouchTap": tile.expandBack}, React.createElement(FontIcon, {"className": "material-icons", "color": tile.props.tilecolors.helpbutton}, tile.state.expandiconback));
        let frontflipcard = React.createElement("div", {"className": "flipcard-frame", "onTouchTap": tile.transitionTo, "style": { cursor: 'pointer' }}, tile.rawMarkup('help').__html ? helpicon : null, tile.isOverflowedFront() ? frontexpandicon : null, React.createElement("div", {"className": "flipcard-padding"}, React.createElement("div", {"className": "flipcard-border", "style": { backgroundColor: tile.props.tilecolors.front, }}, React.createElement("div", {"className": "flipcard-content", "ref": (node) => { tile.state.elements.frontface = node; }}, React.createElement("div", {"dangerouslySetInnerHTML": tile.rawMarkup('markup')})), tile.isOverflowedFront() ?
            React.createElement("div", {"className": "flipcard-gradient front"})
            : null)));
        let backflipcard = React.createElement("div", {"className": "flipcard-frame", "onTouchTap": tile.showFront, "style": { cursor: 'pointer' }}, returnicon, tile.isOverflowedBack() ? backexpandicon : null, React.createElement("div", {"className": "flipcard-padding"}, React.createElement("div", {"className": "flipcard-border", "style": { backgroundColor: tile.props.tilecolors.back, }}, React.createElement("div", {"className": "flipcard-content", "ref": (node) => { tile.state.elements.backface = node; }}, React.createElement("div", {"dangerouslySetInnerHTML": tile.rawMarkup('help')})), React.createElement("div", {"className": "flipcard-gradient back"}))));
        return (React.createElement(GridTile, null, React.createElement(FlipCard, {"disabled": true, "flipped": tile.state.isFlipped, "onFlip": tile.handleOnFlip, "onKeyDown": tile.handleKeyDown, "style": { border: "none" }}, frontflipcard, backflipcard)));
    }
}
exports.NavTile = NavTile;
