'use strict';
const React = require('react');
const GridTile = require('material-ui/lib/grid-list/grid-tile');
class AppTile extends React.Component {
    constructor(props) {
        super(props);
        this.transitionTo = (e) => {
            e.stopPropagation();
            e.preventDefault();
            var _this = this;
            _this.props.transitionTo(_this.props.route);
        };
    }
    render() {
        let tile = this;
        return (React.createElement(GridTile, {onTouchTap: tile.transitionTo, key: this.props.key, title: this.props.content.title, subtitle: this.props.content.subtitle}, React.createElement("img", {src: this.props.content.image})));
    }
}
exports.AppTile = AppTile;
