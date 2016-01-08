var React = require('react');
var ReactDom = require('react-dom');
var class_mainbar_1 = require('./class_mainbar');
var class_maintiles_1 = require('./class_maintiles');
var injectTapEventPlugin = require('react-tap-event-plugin');
injectTapEventPlugin();
var defaultStyle = {
    border: '2px solid green',
    'width': '180px',
    height: '100px',
    marginTop: '10px',
    padding: '3px'
};
var tileData = [
    {
        id: 1,
        style: defaultStyle,
        content: "<em>First something saasdfasdf asdfasdfasd</em>"
    },
    {
        id: 2,
        style: defaultStyle,
        content: "Second"
    },
    {
        id: 3,
        style: defaultStyle,
        content: "Third"
    },
    {
        id: 4,
        style: defaultStyle,
        content: "Fourth"
    },
    {
        id: 5,
        style: defaultStyle,
        content: "Fifth"
    },
    {
        id: 6,
        style: defaultStyle,
        content: "Sixth"
    },
];
ReactDom.render(React.createElement(class_mainbar_1.MainBar, null), document.getElementById('container'));
ReactDom.render(React.createElement(class_maintiles_1.MainTiles, {"tiledata": tileData}), document.getElementById('tiles'));
//# sourceMappingURL=homepage.js.map