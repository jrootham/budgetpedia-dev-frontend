var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var MasonryClass = require('react-masonry-component');
var Masonry = MasonryClass(React);
var class_maintile_1 = require("./class_maintile");
var MainTiles = (function (_super) {
    __extends(MainTiles, _super);
    function MainTiles() {
        _super.apply(this, arguments);
    }
    MainTiles.prototype.render = function () {
        var tiles = this.props.tiledata.map(function (data) {
            var element = React.createElement(class_maintile_1.MainTile, {"key": data.id, "style": data.style, "markup": data.content});
            return element;
        });
        return (React.createElement(Masonry, {"options": { columnWidth: 100 }}, tiles));
    };
    return MainTiles;
})(React.Component);
exports.MainTiles = MainTiles;
//# sourceMappingURL=class_maintiles.js.map