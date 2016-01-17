// initialstate.tsx

'use strict'

let mainElement = document.getElementById('main')

let spacewidth: number = mainElement.getBoundingClientRect().width
// console.log(spacewidth);
let columns: number;
if (spacewidth > 960) {
	columns = 4
} else if (spacewidth > 600) {
	columns = 3
} else {
	columns = 2
}

// test data, should come from database
let defaultStyle = {
	// border: '1px solid green', 
	width: ((spacewidth / columns) - 10) + 'px',
	height: '160px',
	margin: '10px 0 0 10px',
	// padding:'3px',
}
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
		<p></p>`,
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
		help: `<h3></h3>
		<p><em>[content pending]</em></p>`,
		index: 3,
	},
	{
		id: 8,
		style: defaultStyle,
		content: `<h3>Social Media Resources</h3>
		<p><em>[content pending]</em></p>`,
		help: `<p><em>[content pending]</em></p>`,
		index: 4,
	},
];

export var initialstate = { maintiles: tileData }
