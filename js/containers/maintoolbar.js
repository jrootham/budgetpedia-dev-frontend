var React = require('react');
var react_redux_1 = require('react-redux');
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
            width: "60%",
            display: "flex",
            justifyContent: "space-around"
        }}, React.createElement(IconButton, null, React.createElement(FontIcon, {"className": "material-icons"}, "arrow_back")), React.createElement(IconButton, null, React.createElement(FontIcon, {"className": "material-icons"}, "radio_button_unchecked")), React.createElement(IconButton, null, React.createElement(FontIcon, {"className": "material-icons"}, "check_box_outline_blank")))));
    }
}
var MainToolbar = react_redux_1.connect(mapStateToProps)(MainToolbarClass);
exports.MainToolbar = MainToolbar;
