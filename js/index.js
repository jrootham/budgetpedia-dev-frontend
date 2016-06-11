"use strict";
const React = require('react');
const react_dom_1 = require('react-dom');
const main_1 = require('./controllers/main');
let globalmessage = (React.createElement("div", null, "FOR TESTING, YOU'RE IN THE WRONG SPOT! GO TO ", React.createElement("a", {href: "http://staging.budgetpedia.ca"}, "staging.budgetpedia.ca"), " INSTEAD. THIS IS THE DEVELOPER'S VERSION OF THIS SITE (FOR PROTOTYPING)," + ' ' + "AND MAY CHANGE OR BREAK AT ANY TIME. ALSO, THE DATA MAY BE FAKE."));
react_dom_1.render(React.createElement(main_1.default, {globalmessage: globalmessage, version: "DEVELOPMENT"}), document.getElementById('main'));
