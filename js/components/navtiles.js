'use strict';
const React = require('react');
var { Component } = React;
const GridList_1 = require('material-ui/GridList');
const navtile_1 = require("./navtile");
class NavTiles extends Component {
    render() {
        let { tiles, tilecols, padding, tilecolors, style, system, route, transitionTo, cellHeight } = this.props;
        let tiles_ = tiles.map(function (data) {
            return (React.createElement(navtile_1.NavTile, {key: data.id, markup: data.content, help: data.help, tilecolors: tilecolors, system: system, route: data.route, transitionTo: transitionTo}));
        });
        return (React.createElement(GridList_1.GridList, {style: style, children: tiles_, cols: tilecols, padding: padding, cellHeight: cellHeight}));
    }
}
exports.NavTiles = NavTiles;
