// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// menutile.tsx

'use strict'

// required by bundler
import * as React from 'react'

import MenuItem = require('material-ui/lib/menus/menu-item')

export class MenuTile extends React.Component<any, any> {
    constructor(props) {
        super(props);
    }

    transitionTo = (e) => {
        // if (e.target.tagName == 'A') return;
        // used exclusively for transition
        e.stopPropagation()
        e.preventDefault()
        this.props.transitionTo(this.props.route)
    }
    
    render() {

        let tile = this

        return (

            <MenuItem 

                onTouchTap={ tile.transitionTo }
                key = {this.props.key}
                primaryText = {this.props.primaryText}
                leftIcon = {<img src={this.props.image}/>}>
                
            </MenuItem>

        )
    }
}

