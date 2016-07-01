// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// root.tsx
import * as React from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'

// import { render } from 'react-dom'
import { Provider } from 'react-redux'
// custom...
import MainBar from '../containers/mainbar'
// import { MainToolbar } from './maintoolbar'
import routes from '../common/routes'

const Root = ({store, globalmessage}) => (
    <MuiThemeProvider muiTheme = {getMuiTheme()}>
        <Provider store={ store }>
            <div >
                <MainBar />
                <div style={{ height: "64px" }} > {/* space for top fixed appbar */}
                </div>

                {globalmessage}

                { routes }
                
            </div>
        </Provider>
    </MuiThemeProvider>
)

export default Root
