'use strict';
const React = require('react');
const GridList_1 = require('material-ui/GridList');
class AppTile extends React.Component {
    constructor(props) {
        super(props);
        this.transitionTo = (e) => {
            if (this.props.content.disabled) {
                return;
            }
            e.stopPropagation();
            e.preventDefault();
            var _this = this;
            _this.props.transitionTo(_this.props.route);
        };
    }
    render() {
        let tile = this;
        let wrapperstyle = null;
        if (this.props.content.disabled) {
            wrapperstyle = {
                opacity: 0.3,
                filter: "alpha(opacity = 30)",
                backgroundColor: "#000",
            };
        }
        else {
            wrapperstyle = {
                pointerEvens: "none"
            };
        }
        return (React.createElement(GridList_1.default, {style: { textAlign: "center" }, onTouchTap: tile.transitionTo, key: this.props.key, title: this.props.content.title, subtitle: this.props.content.subtitle}, React.createElement("div", {style: wrapperstyle}, React.createElement("div", {style: { position: "absolute", top: 0, left: 0, color: "silver", fontStyle: "italic", fontSize: "smaller" }}, this.props.content.category), React.createElement("img", {src: this.props.content.image, style: { height: "120px" }}), React.createElement("div", {style: { position: "abolute", height: "30px", bottom: 0, width: "100%" }}))));
    }
}
exports.AppTile = AppTile;
