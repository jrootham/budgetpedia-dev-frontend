'use strict';
var React = require('react');
var react_redux_1 = require('react-redux');
var AppBar = require('material-ui/lib/app-bar');
var IconButton = require('material-ui/lib/icon-button');
var FontIcon = require('material-ui/lib/font-icon');
var NavigationMenu = require('material-ui/lib/svg-icons/navigation/menu');
function mapStateToProps(state) {
    let { appnavbar, theme } = state;
    return {
        appnavbar,
        theme,
    };
}
class MainBarClass extends React.Component {
    render() {
        let { appnavbar, theme } = this.props;
        return (React.createElement(AppBar, {"style": { position: "fixed" }, "title": React.createElement("span", null, appnavbar.title), "iconElementLeft": React.createElement(IconButton, {"onTouchTap": () => { alert('menu list goes here'); }}, React.createElement(NavigationMenu, null)), "iconElementRight": React.createElement(IconButton, {"onTouchTap": () => { alert('account options go here'); }}, React.createElement(FontIcon, {"className": "material-icons"}, "account_circle"))}, React.createElement("div", {"style": { position: "absolute",
            bottom: 0,
            right: 0,
            fontSize: "small",
            padding: "3px",
            color: theme.palette.alternateTextColor,
        }}, appnavbar.username)));
    }
}
var MainBar = react_redux_1.connect(mapStateToProps)(MainBarClass);
exports.MainBar = MainBar;
