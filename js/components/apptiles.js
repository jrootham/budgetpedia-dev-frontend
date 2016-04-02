'use strict';
const React = require('react');
var { Component } = React;
const GridList = require('material-ui/lib/grid-list/grid-list');
const apptile_1 = require("./apptile");
class AppTiles extends Component {
    render() {
        let { tiles, tilecols, padding, tilecolors, style, system, route, transitionTo, cellHeight } = this.props;
        let tiles_ = tiles.map(function (data) {
            return (React.createElement(apptile_1.AppTile, {key: data.id, content: data.content, tilecolors: tilecolors, system: system, route: data.route, transitionTo: transitionTo}));
        });
        return (React.createElement(GridList, {style: style, children: tiles_, cols: tilecols, padding: padding, cellHeight: cellHeight}));
    }
}
exports.AppTiles = AppTiles;
