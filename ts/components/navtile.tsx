// navtile.tsx
/// <reference path="../../typings-custom/react-flipcard.d.ts" />

/*
    TODO: chrome shows shadow of front pane when there is overflow; ff and safari do not
    - try setting overflow to auto on focus; remove auto on blur
*/
'use strict'

// required by bundler
import * as React from 'react'
// import * as ReactDom from 'react-dom';
import ReactFlipCard = require('react-flipcard')
import GridTile = require('material-ui/lib/grid-list/grid-tile')
import FontIcon = require('material-ui/lib/font-icon')
import IconButton = require('material-ui/lib/icon-button')
import Paper = require('material-ui/lib/paper')

interface MainTileProps extends React.Props<NavTile> {
    markup: string
}

export class NavTile extends React.Component<any, any> {
    constructor() {
        super();
        this.state = { 
            isFlipped: false,
            elements: {},
        }
    }

    transitionTo = (e) => {
        if (e.target.tagName == 'A') return;
        // used exclusively for transition
        e.stopPropagation()
        e.preventDefault()
        var _this = this;
        // wait for current js queue to clear
        window.setTimeout(function(){ // prevent timing issues with ReactFlipCard rendering
            _this.props.transitionTo(_this.props.route)
        },0)
    }
    
    rawMarkup = ( selector ) => {
        return { __html: this.props[selector] };
    }
    showBack = (e) => {
        e.stopPropagation()
        // let node = this.state.elements.frontface;
        // node.style.display = 'none'
        // node.style.overflow = 'hidden'
        this.setState({
            isFlipped: true
        });
    }

    showFront = (e) => {
        if (e.target.tagName == 'A') return;
        e.stopPropagation()
        let node = this.state.elements.backface
        // backface visibility directive ignored in chrome with overflow set to auto
        // https://code.google.com/p/chromium/issues/detail?id=363609
        if ( this.props.system.ischrome )
            node.style.display = 'none'
        // node.style.overflow = 'hidden'
        this.setState({
            isFlipped: false
        });
    }

    handleOnFlip = (flipped) => {
        if ( this.props.system.ischrome ) {
            if ( flipped ) { // view backface
                this.state.elements.backface.style.overflow = 'auto'
                this.state.elements.backface.style.display = 'block'
                this.state.elements.frontface.style.display = 'none'
            } else {
                this.state.elements.frontface.style.overflow = 'auto'
                this.state.elements.frontface.style.display = 'block'
                this.state.elements.backface.style.display = 'none'
            }
        }
    }

    handleKeyDown = ( e ) => {
        if (this.state.isFlipped && e.keyCode === 27) {
            this.showFront(e);
        }
    }

    render() {
        let tile = this
        return (
            <GridTile>
            <ReactFlipCard
                disabled = { true }
                flipped = { tile.state.isFlipped }
                onFlip = { tile.handleOnFlip }
                onKeyDown = { tile.handleKeyDown }
                style = {{ border:"none" }}
                >
                  <div className="flipcard-frame"
                        onTouchTap={ tile.transitionTo }
                        style={{cursor:'pointer'}}>
                        { tile.rawMarkup('help').__html? 
                        <IconButton
                            style={{
                                borderRadius: '12px', 
                                backgroundColor: tile.props.tilecolors.front, 
                                padding: 0, 
                                height: "36px", 
                                width: "36px", 
                                position: "absolute", 
                                zIndex: 2, 
                                right: 0, 
                                top: 0 
                            }}
                        onTouchTap={tile.showBack}>
                        <FontIcon
                            className="material-icons"
                            color = { tile.props.tilecolors.helpbutton }
                            >
                            help
                        </FontIcon>
                        </IconButton>:null
                    }
                    <div className = "flipcard-padding">
                    <div className = "flipcard-border" 
                        style={{ 
                            backgroundColor: tile.props.tilecolors.front, 
                        }}>
                    <div className = "flipcard-content"
                        ref={(node) => { tile.state.elements.frontface = node } }
                    >
                        <div dangerouslySetInnerHTML={ tile.rawMarkup('markup') }></div>
                    </div></div></div>
                  </div>
                <div className="flipcard-frame"
                    onTouchTap={ tile.showFront }
                    style={{ cursor: 'pointer' }}>
                    <IconButton
                        style={{ 
                            backgroundColor: tile.props.tilecolors.back, 
                            padding: 0, 
                            height: "36px", 
                            width: "36px", 
                            position: "absolute", 
                            zIndex: 2, 
                            right: 0, 
                            top: 0 
                        }}
                        onTouchTap={ tile.showFront }>
                        <FontIcon
                            className="material-icons"
                            color={ tile.props.tilecolors.helpbutton }
                            >
                            flip_to_front
                            </FontIcon>
                        </IconButton>
                    <div className = "flipcard-padding">
                    <div className = "flipcard-border" 
                        style={{ backgroundColor: tile.props.tilecolors.back, }}>
                    <div className = "flipcard-content"
                       ref={(node) => { tile.state.elements.backface = node } }
                      >
                        <div dangerouslySetInnerHTML={ tile.rawMarkup('help') }
                        ></div>
                    </div></div></div>
                </div>
            </ReactFlipCard>
            </GridTile>
        )
    }
}

