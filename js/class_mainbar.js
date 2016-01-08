var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var AppBar = require('material-ui/lib/app-bar');
var IconButton = require('material-ui/lib/icon-button');
var IconMenu = require('material-ui/lib/menus/icon-menu');
var MenuItem = require('material-ui/lib/menus/menu-item');
var NavigationClose = require('material-ui/lib/svg-icons/navigation/close');
var MoreVertIcon = require('material-ui/lib/svg-icons/navigation/more-vert');
var MainBar = (function (_super) {
    __extends(MainBar, _super);
    function MainBar() {
        _super.apply(this, arguments);
    }
    MainBar.prototype.render = function () {
        return React.createElement(AppBar, {"title": React.createElement("span", null, "Title"), "iconElementLeft": React.createElement(IconButton, null, " ", React.createElement(NavigationClose, null)), "iconElementRight": React.createElement(IconMenu, {"iconButtonElement": React.createElement(IconButton, null, " ", React.createElement(MoreVertIcon, null))}, React.createElement(MenuItem, {"primaryText": "Refresh"}), React.createElement(MenuItem, {"primaryText": "Help"}), React.createElement(MenuItem, {"primaryText": "Sign out"}))});
    };
    return MainBar;
})(React.Component);
exports.MainBar = MainBar;
//# sourceMappingURL=class_mainbar.js.map