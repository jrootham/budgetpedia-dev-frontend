var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var AppBar = require('material-ui/lib/app-bar');
var MainBar = (function (_super) {
    __extends(MainBar, _super);
    function MainBar() {
        _super.apply(this, arguments);
    }
    MainBar.prototype.render = function () {
        return React.createElement(AppBar, {"title": React.createElement("span", null, "Title")});
    };
    return MainBar;
})(React.Component);
exports.MainBar = MainBar;
//# sourceMappingURL=class_mainbar.js.map