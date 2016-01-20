'use strict';
var React = require('react');
var { Component } = React;
var GridList = require('material-ui/lib/grid-list/grid-list');
var navtile_1 = require("./navtile");
class NavTiles extends Component {
    render() {
        var { tiles, tilecols } = this.props;
        var tiles_ = tiles.map(function (data) {
            return (React.createElement(navtile_1.NavTile, {"key": data.id, "style": data.style, "markup": data.content, "help": data.help}));
        });
        return (React.createElement(GridList, {"children": tiles_, "cols": tilecols}));
    }
}
exports.NavTiles = NavTiles;
