// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// approutes.tsx

'use strict'

import * as React from 'react'

import { Route } from 'react-router'

import About from './controllers/about'
import Timeline from './controllers/timeline'
import Deputations from './controllers/deputations'
import Explorer from './controllers/explorer'
import Communities from './controllers/communities'
import SocialMedia from './controllers/socialmedia'
import Newsletter from './controllers/newsletter'
import Resources from './controllers/resources'
import JoinUs from './controllers/joinus'
import Stories from './controllers/stories'
import Demos from './controllers/demos'
import Pathways from './controllers/pathways'

let routedata = [
    { path: "about", component: About },
    { path: "timeline", component: Timeline },
    { path: "deputations", component: Deputations },
    { path: "explorer", component: Explorer },
    { path: "communities", component: Communities },
    { path: "socialmedia", component: SocialMedia },
    { path: "newsletter", component: Newsletter },
    { path: "resources", component: Resources },
    { path: "joinus", component: JoinUs },
    { path: "stories", component: Stories },
    { path: "demos", component: Demos },
    { path: "pathways", component: Pathways },
]

const approutes = routedata.map((item, index) => (
   <Route key = {'approute'+index} path={item.path} component = {item.component} />
))

export default approutes