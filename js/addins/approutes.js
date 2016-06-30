'use strict';
const React = require('react');
const react_router_1 = require('react-router');
const about_1 = require('./controllers/about');
const timeline_1 = require('./controllers/timeline');
const deputations_1 = require('./controllers/deputations');
const explorer_1 = require('./controllers/explorer');
const communities_1 = require('./controllers/communities');
const socialmedia_1 = require('./controllers/socialmedia');
const newsletter_1 = require('./controllers/newsletter');
const resources_1 = require('./controllers/resources');
const joinus_1 = require('./controllers/joinus');
const stories_1 = require('./controllers/stories');
const demos_1 = require('./controllers/demos');
const pathways_1 = require('./controllers/pathways');
let routedata = [
    { path: "about", component: about_1.default },
    { path: "timeline", component: timeline_1.default },
    { path: "deputations", component: deputations_1.default },
    { path: "explorer", component: explorer_1.default },
    { path: "communities", component: communities_1.default },
    { path: "socialmedia", component: socialmedia_1.default },
    { path: "newsletter", component: newsletter_1.default },
    { path: "resources", component: resources_1.default },
    { path: "joinus", component: joinus_1.default },
    { path: "stories", component: stories_1.default },
    { path: "demos", component: demos_1.default },
    { path: "pathways", component: pathways_1.default },
];
const approutes = routedata.map((item, index) => (React.createElement(react_router_1.Route, {key: 'approute' + index, path: item.path, component: item.component})));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = approutes;
