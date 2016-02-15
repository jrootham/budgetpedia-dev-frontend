var React = require('react');
var react_redux_1 = require('react-redux');
var Actions = require('../actions/actions');
var IconButton = require('material-ui/lib/icon-button');
var FontIcon = require('material-ui/lib/font-icon');
var Toolbar = require('material-ui/lib/toolbar/toolbar');
var ToolbarGroup = require('material-ui/lib/toolbar/toolbar-group');
function mapStateToProps(state) {
    let { toolsnavbar, theme } = state;
    return {
        toolsnavbar,
        theme,
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
        return (React.createElement(Toolbar, {"style": {
            position: "fixed",
            bottom: 0,
            display: "flex",
            justifyContent: "center",
            borderTop: "2px solid silver"
        }}, React.createElement(ToolbarGroup, {"style": {
            float: "none",
            width: "70%",
            display: "flex",
            justifyContent: "space-around"
        }}, React.createElement(IconButton, {"disabled": true}, React.createElement(FontIcon, {"className": "material-icons"}, "arrow_back")), React.createElement(IconButton, {"onTouchTap": this.transitionToHome}, React.createElement(FontIcon, {"className": "material-icons"}, "radio_button_unchecked")), React.createElement(IconButton, {"disabled": true}, React.createElement(FontIcon, {"className": "material-icons"}, "check_box_outline_blank")), React.createElement(IconButton, {"disabled": true}, React.createElement(FontIcon, {"className": "material-icons"}, "arrow_forward")), React.createElement(IconButton, {"disabled": true}, React.createElement(FontIcon, {"className": "material-icons"}, "help_outline")))));
    }
}
var MainToolbar = react_redux_1.connect(mapStateToProps)(MainToolbarClass);
exports.MainToolbar = MainToolbar;
