'use strict';
const lightBaseTheme_1 = require('material-ui/styles/baseThemes/lightBaseTheme');
const colors = require('material-ui/styles/colors');
let appnavbar = {
    title: 'Budgetpedia v0.1',
    username: 'anonymous',
    accountoptions: [],
    menuoptions: [],
};
let system = {
    ischrome: /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor)
};
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
let branchDefaults = {
    repository: "Toronto",
    viewpoint: "FUNCTIONAL",
    version: 'SUMMARY',
    aspect: "Expenses",
    branchDataGeneration: 0,
    defaultVersions: {
        'FUNCTIONAL': 'SUMMARY',
        'STRUCTURAL': 'SUMMARY',
    },
    defaultAspects: {
        'SUMMARY': 'Expenses',
        'PBFT': 'Expenses',
    },
    inflationAdjusted: true,
    nodeList: [],
    showOptions: false,
};
let explorer = {
    defaults: {
        branch: branchDefaults,
        node: {
            cellIndex: 0,
            cellList: null,
            yearSelections: { leftYear: 2003, rightYear: 2016 },
        },
        cell: {
            chartConfigs: {
                'OneYear': {
                    explorerChartCode: "ColumnChart",
                },
                'TwoYears': {
                    explorerChartCode: "DiffColumnChart",
                },
                'AllYears': {
                    explorerChartCode: "TimeLine",
                },
            },
            chartSelection: null,
            yearScope: "OneYear",
        }
    }
};
var initialstate = {
    hometiles: hometiles,
    homecols: homecols,
    homepadding: homepadding,
    appnavbar: appnavbar,
    theme: lightBaseTheme_1.default,
    colors: colors,
    system: system,
    explorer: explorer,
    workingmessagestate: workingmessagestate,
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = initialstate;
