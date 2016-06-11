// index.tsx
// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
/// <reference path="../typings/browser.d.ts" />
// <reference path="../typings/index.d.ts" />
/// <reference path="../typings-custom/react-flipcard.d.ts" />
/// <reference path="../typings-custom/material-ui.extended1.d.ts" />
// <reference path="../typings-custom/material-ui.modified.d.ts" />
/// <reference path="../typings-custom/redux-thunk.modified.d.ts" />
// <reference path="../typings-custom/format-number.d.ts" />

import * as React from 'react'
import { render } from 'react-dom'
import { Main } from './controllers/main'
// install fetch as global function for browsers (eg Safari) that don't have it
require('isomorphic-fetch')

let globalmessage =  (
    <div>FOR TESTING, YOU'RE IN THE WRONG SPOT! GO TO <a href="http://staging.budgetpedia.ca">staging.budgetpedia.ca</a> INSTEAD. THIS IS THE DEVELOPER'S VERSION OF THIS SITE (FOR PROTOTYPING), 
        AND MAY CHANGE OR BREAK AT ANY TIME. ALSO, THE DATA MAY BE FAKE.
    </div>
)

render(
	<Main globalmessage = {globalmessage} version="DEVELOPMENT"/>,
	document.getElementById('main')
)
