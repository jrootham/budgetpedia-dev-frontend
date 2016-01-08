var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ReactDom = require('react-dom');
var React = require('react');
var DemoProps = (function () {
    function DemoProps() {
    }
    return DemoProps;
})();
var Demo = (function (_super) {
    __extends(Demo, _super);
    function Demo(props) {
        _super.call(this, props);
        this.foo = 42;
    }
    Demo.prototype.render = function () {
        return React.createElement("div", null, "Hello world!! ", this.props.name);
    };
    return Demo;
})(React.Component);
ReactDom.render(React.createElement(Demo, {"age": 65, "name": "March"}), document.getElementById('testcontainer'));
//# sourceMappingURL=testtsx.js.map