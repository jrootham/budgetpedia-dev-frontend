// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// navtile.tsx

/*
    TODO: 
    - scroll amount on expand should be parameterized
    - define NavTileProps
    - BUG: rapid flipcard leads to both front and back being hidden -- tile becomes lost
*/
'use strict'

// required by bundler
import * as React from 'react'
// import * as ReactDOM from 'react-dom';
import FlipCard = require('react-flipcard')
import GridTile = require('material-ui/lib/grid-list/grid-tile')
import FontIcon = require('material-ui/lib/font-icon')
import IconButton = require('material-ui/lib/icon-button')
import Paper = require('material-ui/lib/paper')

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
        // wait for current js queue to clear
        // setTimeout(function(){ // prevent timing issues with FlipCard rendering
            _this.props.transitionTo(_this.props.route)
        // },0)
    }
    
    // ---------------------------------------------- //

    render() {
        let tile = this

        // create tile components:
        

        // mainline
        return (

            <GridTile 
                style = {{textAlign: "center" }}
                onTouchTap={ tile.transitionTo }
                key = {this.props.key}
                title = {this.props.content.title}
                subtitle = {this.props.content.subtitle}>
                <img src={this.props.content.image} style={{height:"120px"}}/>
                <div style={{ position: "abolute", height: "30px", bottom: 0, width: "100%" }}></div>
                
            </GridTile>
        )
    }
}

