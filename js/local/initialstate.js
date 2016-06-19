'use strict';
let budgetdata = require('../../explorerprototypedata/2015budgetA.json');
const lightBaseTheme_1 = require('material-ui/styles/baseThemes/lightBaseTheme');
const colors = require('material-ui/styles/colors');
let appnavbar = {
    title: 'Toronto Budgetpedia',
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
let homecols = 2;
let homepadding = 20;
let hometiles = [
    {
        id: 6,
        content: {
            title: `About this Site`,
            subtitle: `History and people`,
            image: '../../public/icons/ic_info_48px.svg',
            category: 'information',
            disabled: false,
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
            disabled: true,
        },
        index: 1,
        route: 'timeline',
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
            disabled: true,
        },
        index: 4,
        route: 'pathways',
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
        id: 10,
        content: {
            title: `Join Us!`,
            subtitle: `Join our team`,
            image: '../../public/icons/ic_group_48px.svg',
            category: 'get involved',
            disabled: true,
        },
        index: 9,
        route: 'joinus',
    },
    {
        id: 13,
        content: {
            title: `Get a demo`,
            subtitle: `Resources & training`,
            image: '../../public/icons/ic_record_voice_over_48px.svg',
            category: 'get involved',
            disabled: true,
        },
        index: 11,
        route: 'demos',
    },
];
let workingmessagestate = false;
exports.initialstate = {
    maincols: maincols,
    mainpadding: mainpadding,
    hometiles: hometiles,
    homecols: homecols,
    homepadding: homepadding,
    appnavbar: appnavbar,
    toolsnavbar: toolsnavbar,
    theme: lightBaseTheme_1.default,
    colors: colors,
    system: system,
    budgetdata: budgetdata,
    workingmessagestate: workingmessagestate,
};
