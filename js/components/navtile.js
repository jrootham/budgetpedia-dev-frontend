'use strict';
const React = require('react');
const FlipCard = require('react-flipcard');
const GridTile = require('material-ui/lib/grid-list/grid-tile');
const FontIcon = require('material-ui/lib/font-icon');
const IconButton = require('material-ui/lib/icon-button');
class NavTile extends React.Component {
    constructor() {
        super();
        this.elements = {
            frontface: null,
            backface: null,
        };
        this.transitionTo = (e) => {
            e.stopPropagation();
            e.preventDefault();
            var _this = this;
            setTimeout(function () {
                _this.props.transitionTo(_this.props.route);
            }, 0);
        };
        this.rawMarkup = (selector) => {
            if (this.props[selector])
                return { __html: this.props[selector].body };
            else
                return { __html: '' };
        };
        this.showBack = e => {
            e.stopPropagation();
            e.preventDefault();
            this.setState({
                isFlipped: true
            });
        };
        this.showFront = e => {
            e.stopPropagation();
            e.preventDefault();
            let node = this.elements.backface;
            if (this.props.system.ischrome) {
                node.style.display = 'none';
            }
            this.setState({
                isFlipped: false
            });
        };
        this.expandFront = e => {
            e.stopPropagation();
            e.preventDefault();
            if (this.elements.frontface.style.overflow != 'auto') {
                this.elements.frontface.style.overflow = 'auto';
                this.scroll(this.elements.frontface, 0, 160);
                this.setState({ expandiconfront: 'expand_less' });
            }
            else {
                this.scroll(this.elements.frontface, this.elements.frontface.scrollTop, 0);
                this.elements.frontface.style.overflow = 'hidden';
                this.setState({ expandiconfront: 'expand_more' });
            }
        };
        this.expandBack = e => {
            e.stopPropagation();
            e.preventDefault();
            if (this.elements.backface.style.overflow != 'scroll') {
                this.elements.backface.style.overflow = 'scroll';
                this.scroll(this.elements.backface, 0, 160);
                this.setState({ expandiconback: 'expand_less' });
            }
            else {
                this.scroll(this.elements.backface, this.elements.backface.scrollTop, 0);
                this.elements.backface.style.overflow = 'hidden';
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
                    this.elements.backface.style.display = 'block';
                    this.elements.frontface.style.display = 'none';
                }
                else {
                    this.elements.frontface.style.display = 'block';
                    this.elements.backface.style.display = 'none';
                }
            }
        };
        this.handleKeyDown = e => {
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
        this.isHelpContent = () => {
            let help = this.props.help;
            if (!help)
                return false;
            return (help.title || help.body);
        };
        this.componentDidMount = () => {
            let component = this;
            component.forceUpdate();
            setTimeout(() => {
                let isfrontoverflowed = component.isOverflowed(component.elements.frontface);
                let isbackoverflowed = component.isOverflowed(component.elements.backface);
                component.setState({
                    isoverflowedfront: isfrontoverflowed,
                    isoverflowedback: isbackoverflowed,
                });
            });
        };
        this.state = {
            isFlipped: false,
            expandiconfront: 'expand_more',
            expandiconback: 'expand_more',
            isoverflowedfront: false,
            isoverflowedback: false,
        };
    }
    render() {
        let tile = this;
        let helpicon = React.createElement(IconButton, {key: 'helpicon', className: "flipcard-help-icon", style: {
            backgroundColor: tile.props.tilecolors.front,
            padding: 0,
            height: "36px",
            width: "36px",
            position: "absolute",
        }, onTouchTap: tile.showBack}, React.createElement(FontIcon, {className: "material-icons", color: tile.props.tilecolors.helpbutton}, "help_outline"));
        let returnicon = React.createElement(IconButton, {className: "flipcard-return-to-front-icon", style: {
            backgroundColor: tile.props.tilecolors.back,
            padding: 0,
            height: "36px",
            width: "36px",
            position: "absolute",
        }, onTouchTap: tile.showFront}, React.createElement(FontIcon, {className: "material-icons", color: tile.props.tilecolors.helpbutton}, "flip_to_front"));
        let frontexpandicon = React.createElement(IconButton, {className: "flipcard-expand-icon", style: {
            backgroundColor: tile.props.tilecolors.front,
            height: "36px",
            width: "36px",
            padding: "0",
            position: "absolute",
        }, onTouchTap: tile.expandFront}, React.createElement(FontIcon, {className: "material-icons", color: tile.props.tilecolors.helpbutton}, tile.state.expandiconfront));
        let backexpandicon = React.createElement(IconButton, {className: "flipcard-expand-icon", style: {
            backgroundColor: tile.props.tilecolors.back,
            height: "36px",
            width: "36px",
            padding: "0",
            position: "absolute",
        }, onTouchTap: tile.expandBack}, React.createElement(FontIcon, {className: "material-icons", color: tile.props.tilecolors.helpbutton}, tile.state.expandiconback));
        let frontflipcard = React.createElement("div", {className: "flipcard-frame"}, (tile.isHelpContent()) ? helpicon : null, tile.isOverflowedFront() ? frontexpandicon : null, React.createElement("div", {className: "flipcard-padding"}, React.createElement("div", {className: "flipcard-border", style: { backgroundColor: tile.props.tilecolors.front, }}, React.createElement("div", {className: "flipcard-content", ref: (node) => { tile.elements.frontface = node; }}, React.createElement("a", {style: {
            padding: "3px 0 0 3px",
            fontSize: "small",
            position: "absolute",
            top: 0,
            left: 0,
            fontStyle: "italic",
            color: tile.props.tilecolors.helpbutton,
        }, href: "javascript:void(0)", onTouchTap: tile.transitionTo}, "See more >>"), React.createElement("h3", {onTouchTap: tile.transitionTo, style: {
            marginBottom: 0,
            cursor: "pointer",
        }}, tile.props.markup.title), React.createElement("div", {dangerouslySetInnerHTML: tile.rawMarkup('markup')})), tile.isOverflowedFront() ?
            React.createElement("div", {className: "flipcard-gradient front"})
            : null)));
        let backflipcard = React.createElement("div", {className: "flipcard-frame"}, returnicon, tile.isOverflowedBack() ? backexpandicon : null, React.createElement("div", {className: "flipcard-padding"}, React.createElement("div", {className: "flipcard-border", style: { backgroundColor: tile.props.tilecolors.back, }}, React.createElement("div", {className: "flipcard-content", ref: (node) => { tile.elements.backface = node; }}, React.createElement("a", {style: {
            padding: "3px 0 0 3px",
            fontSize: "small",
            position: "absolute",
            top: 0,
            left: 0,
            fontStyle: "italic",
            color: tile.props.tilecolors.helpbutton,
        }, href: "javascript:void(0)", onTouchTap: tile.showFront}, "Return >>"), React.createElement("h3", {onTouchTap: tile.showFront, style: { marginBottom: 0, cursor: "pointer", }}, tile.isHelpContent() ? tile.props.help.title : null), React.createElement("div", {dangerouslySetInnerHTML: tile.rawMarkup('help')})), React.createElement("div", {className: "flipcard-gradient back"}))));
        return (React.createElement(GridTile, null, React.createElement(FlipCard, {disabled: true, flipped: tile.state.isFlipped, onFlip: tile.handleOnFlip, onKeyDown: tile.handleKeyDown, style: { border: "none" }}, frontflipcard, backflipcard)));
    }
}
exports.NavTile = NavTile;
