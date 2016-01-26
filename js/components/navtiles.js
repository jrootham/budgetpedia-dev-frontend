'use strict';
var React = require('react');
var { Component } = React;
var GridList = require('material-ui/lib/grid-list/grid-list');
var navtile_1 = require("./navtile");
class NavTiles extends Component {
    render() {
        let { tiles, tilecols, padding, tilecolors, style, system } = this.props;
        let tiles_ = tiles.map(function (data) {
            return (React.createElement(navtile_1.NavTile, {"key": data.id, "markup": data.content, "help": data.help, "tilecolors": tilecolors, "system": system}));
        });
        return (React.createElement(GridList, {"style": style, "children": tiles_, "cols": tilecols, "padding": padding}));
    }
}
exports.NavTiles = NavTiles;
