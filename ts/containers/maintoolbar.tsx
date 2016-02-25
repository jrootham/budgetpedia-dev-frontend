// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// maintoolbar.tsx

/// <reference path="../../typings-custom/material-ui.d.ts" />
/// <reference path="../../typings/material-ui/material-ui.d.ts" />

// add scrolling prompt region above buttons, with:
// http://stackoverflow.com/questions/19466750/scrolling-element-without-scrollbar-with-css

import * as React from 'react';
import { connect as injectStore} from 'react-redux'
import * as Actions from '../actions/actions'

import IconButton = require('material-ui/lib/icon-button')
import FontIcon = require('material-ui/lib/font-icon')
import Toolbar = require('material-ui/lib/toolbar/toolbar')
import ToolbarGroup = require('material-ui/lib/toolbar/toolbar-group')

function mapStateToProps(state) {

    let { toolsnavbar, theme } = state

    return {

        toolsnavbar,
        theme,

    }

}

class MainToolbarClass extends React.Component<any, any> {

    transitionToHome = () => {
        this.props.dispatch(Actions.transitionTo('/'))
    }

    render() {
        let { appnavbar, theme } = this.props

        return (
            <Toolbar style={{ 
                position: "fixed", 
                bottom: 0, 
                display: "flex", 
                justifyContent: "center", 
                borderTop:"2px solid silver" 
            }}>
                <ToolbarGroup style={{ 
                    float: "none", 
                    width: "70%", 
                    display: "flex", 
                    justifyContent: "space-around" 
                }} >
                    <IconButton disabled><FontIcon className="material-icons">arrow_back</FontIcon></IconButton>
                    <IconButton onTouchTap = { this.transitionToHome }><FontIcon className="material-icons">radio_button_unchecked</FontIcon></IconButton>
                    <IconButton disabled><FontIcon className="material-icons">check_box_outline_blank</FontIcon></IconButton>
                    <IconButton disabled><FontIcon className="material-icons">help_outline</FontIcon></IconButton>
                    <IconButton disabled><FontIcon className="material-icons">arrow_forward</FontIcon></IconButton>
                </ToolbarGroup>
            </Toolbar>
        )
    } // render
}

var MainToolbar = injectStore(mapStateToProps)(MainToolbarClass)

export { MainToolbar }
