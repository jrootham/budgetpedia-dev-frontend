// index.tsx
// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
/// <reference path="../typings/browser.d.ts" />
/// <reference path="../typings-custom/react-flipcard.d.ts" />
/// <reference path="../typings-custom/material-ui.d.ts" />
/// <reference path="../typings-custom/material-ui.modified.d.ts" />
/// <reference path="../typings-custom/redux-thunk.modified.d.ts" />

import * as React from 'react'
import { render } from 'react-dom'
import { Main } from './controllers/main'

render(
	<Main />,
	document.getElementById('main')
)
