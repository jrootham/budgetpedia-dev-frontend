"use strict";
const React = require('react');
const react_redux_1 = require('react-redux');
const Actions = require('../actions/actions');
const IconButton = require('material-ui/lib/icon-button');
const FontIcon = require('material-ui/lib/font-icon');
const Toolbar = require('material-ui/lib/toolbar/toolbar');
const ToolbarGroup = require('material-ui/lib/toolbar/toolbar-group');
function mapStateToProps(state) {
    let { toolsnavbar, theme } = state;
    return {
        toolsnavbar: toolsnavbar,
        theme: theme,
    };
}
class MainToolbarClass extends React.Component {
    constructor(...args) {
        super(...args);
        this.transitionToHome = () => {
            this.props.dispatch(Actions.transitionTo('/'));
        };
    }
    render() {
        let { appnavbar, theme } = this.props;
        return (React.createElement(Toolbar, {style: {
            position: "fixed",
            bottom: 0,
            display: "flex",
            justifyContent: "center",
            borderTop: "2px solid silver"
        }}, React.createElement(ToolbarGroup, {style: {
            float: "none",
            width: "70%",
            display: "flex",
            justifyContent: "space-around"
        }}, React.createElement(IconButton, {disabled: true}, React.createElement(FontIcon, {className: "material-icons"}, "arrow_back")), React.createElement(IconButton, {onTouchTap: this.transitionToHome}, React.createElement(FontIcon, {className: "material-icons"}, "radio_button_unchecked")), React.createElement(IconButton, {disabled: true}, React.createElement(FontIcon, {className: "material-icons"}, "check_box_outline_blank")), React.createElement(IconButton, {disabled: true}, React.createElement(FontIcon, {className: "material-icons"}, "help_outline")), React.createElement(IconButton, {disabled: true}, React.createElement(FontIcon, {className: "material-icons"}, "arrow_forward")))));
    }
}
var MainToolbar = react_redux_1.connect(mapStateToProps)(MainToolbarClass);
exports.MainToolbar = MainToolbar;
