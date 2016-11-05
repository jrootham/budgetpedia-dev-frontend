"use strict";
const React = require('react');
const react_dom_1 = require('react-dom');
const main_1 = require('./core/containers/main');
let globalmessage = null;
react_dom_1.render(React.createElement(main_1.default, {globalmessage: globalmessage, version: "DEVELOPMENT"}), document.getElementById('main'));
