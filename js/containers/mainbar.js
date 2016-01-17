'use strict';
var React = require('react');
var AppBar = require('material-ui/lib/app-bar');
var IconButton = require('material-ui/lib/icon-button');
var NavigationMenu = require('material-ui/lib/svg-icons/navigation/menu');
class MainBar extends React.Component {
    render() {
        return React.createElement(AppBar, {"style": { position: "fixed" }, "title": React.createElement("span", null, "Budget Commons"), "iconElementLeft": React.createElement(IconButton, null, React.createElement(NavigationMenu, null)), "iconElementRight": React.createElement(IconButton, {"onTouchTap": () => { alert('account options go here'); }, "iconStyle": { marginTop: "-6px", fontSize: "36px" }}, React.createElement("span", {"className": "material-icons"}, "account_circle"))});
    }
}
exports.MainBar = MainBar;
