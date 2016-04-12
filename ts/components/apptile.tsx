// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// navtile.tsx

'use strict'

// required by bundler
import * as React from 'react'

import GridTile = require('material-ui/lib/grid-list/grid-tile')

export class AppTile extends React.Component<any, any> {
    constructor(props) {
        super(props);
    }

    transitionTo = (e) => {
        // if (e.target.tagName == 'A') return;
        // used exclusively for transition
        e.stopPropagation()
        e.preventDefault()
        var _this = this;
        _this.props.transitionTo(_this.props.route)
    }
    
    render() {

        let tile = this

        return (

            <GridTile 

                style = {{textAlign: "center" }}
                onTouchTap={ tile.transitionTo }
                key = {this.props.key}
                title = {this.props.content.title}
                subtitle = {this.props.content.subtitle}>
                <div style={{position:"absolute",top:0,left:0,color:"silver",fontStyle:"italic",fontSize:"smaller"}} >
                {this.props.content.category}</div>
                <img src={this.props.content.image} style={{height:"120px"}}/>
                <div style={{ position: "abolute", height: "30px", bottom: 0, width: "100%" }}></div>
                
            </GridTile>

        )
    }
}

