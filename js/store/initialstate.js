'use strict';
let mainElement = document.getElementById('main');
let spacewidth = mainElement.getBoundingClientRect().width;
let columns;
columns = 2;
let defaultStyle = {
    width: ((spacewidth / columns) - 10) + 'px',
    height: '160px',
    margin: '10px 0 0 10px',
};
let tileData = [
    {
        id: 6,
        style: defaultStyle,
        content: `<h3>About Budget Commons</h3> 
		<p><em>[content pending]</em></p>`,
        help: `<h3>History of the app</h3>
		<p><em>[content pending]</em></p>`,
        index: 0,
    },
    {
        id: 7,
        style: defaultStyle,
        content: `<h3>Budget Timeline</h3>
		<p><em>[content pending]</em></p>`,
        help: `<h3>About Budget Timeline</h3>
		<p><em>[content pending]</em></p>`,
        index: 1,
    },
    {
        id: 1,
        style: defaultStyle,
        content: `<h3>Deputation Helper</h3>
		<p><em>[content pending]</em></p>`,
        help: `<h3>About Deputation Helper</h3>
		<p><em>[content pending]</em></p>`,
        index: 2,
    },
    {
        id: 2,
        style: defaultStyle,
        content: `<h3>Budget Resources</h3>
		<p><em>[content pending]</em></p>`,
        help: `<h3>About Budget Resources</h3>
		<p><em>[content pending]</em></p>`,
        index: 3,
    },
    {
        id: 8,
        style: defaultStyle,
        content: `<h3>Social Media Resources</h3>
		<p><em>[content pending]</em></p>`,
        help: `<h3>About Social Media Resources</h3>
		<p><em>[content pending]</em></p>`,
        index: 4,
    },
];
exports.initialstate = {
    maintiles: tileData,
    tilecols: columns,
};
