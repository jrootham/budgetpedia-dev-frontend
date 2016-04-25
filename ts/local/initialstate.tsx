// initialstate.tsx
/*
    TODO: purge system of navitiles - old wordy tiles = maintiles
*/

'use strict'

// https://design.google.com/icons/

/* ================= theme details: ==================== */

let budgetdata = require('../../explorerprototypedata/2015budget.json')

import theme = require('material-ui/lib/styles/raw-themes/light-raw-theme')

// fontFamily: "Roboto, sans-serif"
// palette: Object
// 	accent1Color: "#ff4081"
// 	accent2Color: "#f5f5f5"
// 	accent3Color: "#9e9e9e"
// 	alternateTextColor: "#ffffff"
// 	borderColor: "#e0e0e0"
// 	canvasColor: "#ffffff"
// 	clockCircleColor: "rgba(0,0,0,0.07)"
// 	disabledColor: "rgba(0,0,0,0.3)"
// 	pickerHeaderColor: "#00bcd4"
// 	primary1Color: "#00bcd4"
// 	primary2Color: "#0097a7"
// 	primary3Color: "#bdbdbd"
// 	textColor: "rgba(0, 0, 0, 0.87)"
// spacing: Object
// 	desktopDropDownMenuFontSize: 15
// 	desktopDropDownMenuItemHeight: 32
// 	desktopGutter: 24
// 	desktopGutterLess: 16
// 	desktopGutterMini: 8
// 	desktopGutterMore: 32
// 	desktopKeylineIncrement: 64
// 	desktopLeftNavMenuItemHeight: 48
// 	desktopSubheaderHeight: 48
// 	desktopToolbarHeight: 56
// 	iconSize: 24

/* ======================================== */

import colors = require('material-ui/lib/styles/colors')

let appnavbar = {
	title: 'Toronto Budget Commons',
	username: 'anonymous',
	accountoptions: [],
	menuoptions: [],
}

let toolsnavbar = {

}

// TODO: no longer needed with switch away from flipcards
// for more detail: https://www.npmjs.com/package/snifferjs
let system = {
	ischrome: /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
}

let maincols: number = 2 // default
let mainpadding: number = 0
let maintiles: [Object] = [
	{
		id: 6,
		content: {
            title:`About Budget Commons`,
            body: `<p><em>Budget Commons</em> (this website) is a new, evolving initiative coming out of Toronto's 
        		civil society sector, specifically <a target="_blank" href="http://civictech.ca">Civic Tech 
        		Toronto</a>, in collaboration with <a target="_blank" href="http://betterbudget.ca">Better 
        		Budget Toronto<a>, among others. The purpose is to <em>support informed debate about the 
        		Toronto Budget.</em></p>`,
        },
        help: {
            title: `Project Background`,
            body: `<p>The <a href="http://civictech.ca/projects/#torontobudgetproject" target="_blank">
        		Toronto Budget Project</a> started in July 2015. Deliberations and consultations
        		about scope and direction continued until August of that year, and building of foundation
        		elements of the website began in December.</p>`,
        },
		index: 0,
		route: 'about',
	},
	{
		id: 7,
        content: {
            title: `The Budget Roadmap`,
            body: `<p><em>Under development.</em></p>
        		<p>The budget roadmap is a compilation of annual budget events that lead to the adoption of the
        		City of Toronto Budget in February of each year. These events include:</p> 
        		<ul>
        		<li>public events, some of which include public deputations</li> 
        		<li>internal city events</li>
        		<li>councillor sponsored budget 'Town Halls'</li>
        		<li>a participatory budget process</li>
        		<li>events hosted by civil society organizations</li>
        		</ul>`,
        },
        help: {
            title: `About the Budget Roadmap`,
            body: `<p>In principle the budget roadmap could encompass regional councils, as well as city ridings,
        		internal executive and staff consultations, and public committee meetings.The information  we 
        		have is taken from a variety of sources, including interviews with City staff.</p>
                <p>This is the first feature we're implementing because being the simplest, it will give us
                a chance to build the website foundation that wil be used by all future features as well.</p>`,
        },
		index: 1,
		route:'timeline',
	},
	{
		id: 1,
        content: {
            title: `Deputation Helper`,
            body: `<p><em>In the planning stage.</em></p>
        		<p>The City of Toronto mandates receiving brief (typicallty 3-5 minute) deputations from city
                residents, usually late in the budget process. But there as so many more ways to make your voice
                heard! For this deputation helper, we're hoping to help with the problem of scheduling, such
                that people don't have to wait much of the day to give their brief presentations. But we'll also
                offer other assists to help people collaborate on voicing their opinions.</p>`,
        },
		index: 2,
		route:'deputations',
	},
    {
        id: 9,
        content: {
            title: `Budget Explorer`,
            body: `<p><em>To be developed after the deputation helper is underway.</em></p>
                <p>The key to influencing the budget is understanding the budget, but that's a challenge with
                such a large document. We're planning to apply interactive tools, better taxonomies (categories),
                and lessons learned from excellent attempts elsewhere, to create a more individualized experience
                to exploring the budget, and assembling information to support arguments.</p>`,
        },
        index: 3,
        route: 'explorer',
    },
    {
		id: 2,
        content: {
            title: `Community Resources`,
            body: `<p><em>[content pending]</em></p>`,
        },
        help: {
            title: `About Community Resources`,
        	body: `<p><em>[content pending]</em></p>`,
        },
		index: 4,
		route:'resources',
	},
	{
		id: 8,
        content: {
            title: `Social Media`,
            body: `<p><em>[content pending]</em></p>`,
        },
        help: {
            title: `About Social Media`,
            body: `<p><em>[content pending]</em></p>`,
        },
		index: 5,
		route:'socialmedia',
	},
    {
        id: 11,
        content: {
            title: `Newsletter`,
            body: `<p><em>[content pending]</em></p>`,
        },
        index: 6,
        route: 'newsletter',
    },
    {
        id: 10,
        content: {
            title: `Join Us!`,
            body: `<p><em>[content pending]</em></p>`,
        },
        index: 7,
        route: 'joinus',
    },
    {
        id: 12,
        content: {
            title: `Tell your story`,
            body: `<p><em>Under consideration</em></p>`,
        },
        index: 7,
        route: 'stories',
    },
]

let homecols: number = 2 // default
let homepadding: number = 20

let hometiles: [Object] = [
    {
        id: 6,
        content: {
            title: `About this Site`,
            subtitle: `History and people`,
            image: '../../public/icons/ic_info_48px.svg',
            category: 'information',
        },
        index: 0,
        route: 'about',
    },
    {
        id: 7,
        content: {
            title: `Budget Roadmap`,
            subtitle: `About budget decisions`,
            image: '../../public/icons/ic_map_48px.svg',
            category: 'tools',
        },
        index: 1,
        route: 'timeline',
    },
    {
        id: 1,
        content: {
            title: `Deputation Helper`,
            subtitle: `Have your say`,
            image: '../../public/icons/ic_insert_emoticon_48px.svg',
            category: 'tools',
        },
        index: 2,
        route: 'deputations',
    },
    {
        id: 9,
        content: {
            title: `Budget Explorer`,
            subtitle: `Interactive tools`,
            image: '../../public/icons/ic_explore_48px.svg',
            category: 'tools',
        },
        index: 3,
        route: 'explorer',
    },
    {
        id: 14,
        content: {
            title: `Activist Pathways`,
            subtitle: `How to make change`,
            image: '../../public/icons/ic_directions_walk_48px.svg',
            category: 'tools',
        },
        index: 4,
        route: 'pathways',
    },
    {
        id: 2,
        content: {
            title: `Communities`,
            subtitle: `Find birds of a feather`,
            image: '../../public/icons/ic_local_library_48px.svg',
            category: 'support',
        },
        index: 5,
        route: 'communities',
    },
    {
        id: 8,
        content: {
            title: `Social Media`,
            subtitle: `Public forums`,
            image: '../../public/icons/ic_thumb_up_48px.svg',
            category: 'support',
        },
        index: 6,
        route: 'socialmedia',
    },
    {
        id: 11,
        content: {
            title: `Newsletter`,
            subtitle: `News and notices`,
            image: '../../public/icons/ic_markunread_mailbox_48px.svg',
            category: 'support',
        },
        index: 7,
        route: 'newsletter',
    },
    {
        id: 15,
        content: {
            title: `Resources`,
            subtitle: `External websites`,
            image: '../../public/icons/ic_library_books_48px.svg',
            category: 'support',
        },
        index: 8,
        route: 'resources',
    },
    {
        id: 10,
        content: {
            title: `Join Us!`,
            subtitle: `Join our team`,
            image: '../../public/icons/ic_group_48px.svg',
            category: 'get involved',
        },
        index: 9,
        route: 'joinus',
    },
    {
        id: 12,
        content: {
            title: `Tell your story`,
            subtitle: `Write for us`,
            image: '../../public/icons/ic_keyboard_48px.svg',
            category: 'get involved',
        },
        index: 10,
        route: 'stories',
    },
    {
        id: 13,
        content: {
            title: `Get a demo`,
            subtitle: `Resources & training`,
            image: '../../public/icons/ic_record_voice_over_48px.svg',
            category: 'get involved',
        },
        index: 11,
        route: 'demos',
    },
]

export var initialstate = {
	maintiles,
	maincols,
	mainpadding,
    hometiles,
    homecols,
    homepadding,
    appnavbar,
	toolsnavbar,
	theme,
	colors,
	system,
    budgetdata,
}
