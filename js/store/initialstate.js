'use strict';
const theme = require('material-ui/lib/styles/raw-themes/light-raw-theme');
const colors = require('material-ui/lib/styles/colors');
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
        content: {
            title: `About Budget Commons`,
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
        route: 'timeline',
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
        route: 'deputations',
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
        route: 'resources',
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
        route: 'socialmedia',
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
];
exports.initialstate = {
    maintiles: maintiles,
    maincols: maincols,
    mainpadding: mainpadding,
    appnavbar: appnavbar,
    toolsnavbar: toolsnavbar,
    theme: theme,
    colors: colors,
    system: system,
};
