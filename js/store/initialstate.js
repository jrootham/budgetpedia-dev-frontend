'use strict';
var theme = require('material-ui/lib/styles/raw-themes/light-raw-theme');
var colors = require('material-ui/lib/styles/colors');
let appnavbar = {
    title: 'Toronto Budget Commons',
    username: 'anonymous',
    accountoptions: [],
    menuoptions: [],
};
let toolsnavbar = {};
let system = {
    ischrome: /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
};
let maincols = 2;
let mainpadding = 0;
let maintiles = [
    {
        id: 6,
        content: `<h3>About Budget Commons</h3> 
		<p><em>[content pending]</em></p>`,
        help: `<h3>History of the app</h3>
		<p><em>[content pending]</em></p>`,
        index: 0,
    },
    {
        id: 7,
        content: `<h3>Budget Timeline</h3>
		<p><em>[content pending]</em></p>`,
        help: `<h3>About Budget Timeline</h3>
		<p><em>[content pending]</em></p>`,
        index: 1,
    },
    {
        id: 1,
        content: `<h3>Deputation Helper</h3>
		<p><em>[content pending]</em></p>`,
        help: `<h3>About Deputation Helper</h3>
		<p><em>[content pending]</em></p>`,
        index: 2,
    },
    {
        id: 2,
        content: `<h3>Budget Resources</h3>
		<p><em>[content pending]</em></p>`,
        help: `<h3>About Budget Resources</h3>
		<p><em>[content pending]</em></p>`,
        index: 3,
    },
    {
        id: 8,
        content: `<h3>Social Media Resources</h3>
		<p><em>[content pending]</em></p>`,
        help: `<h3>About Social Media Resources</h3>
		<p><em>[content pending]</em></p>`,
        index: 4,
    },
];
exports.initialstate = {
    maintiles,
    maincols,
    mainpadding,
    appnavbar,
    toolsnavbar,
    theme,
    colors,
    system,
};
