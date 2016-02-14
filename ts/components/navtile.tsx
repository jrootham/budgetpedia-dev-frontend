// navtile.tsx
/// <reference path="../../typings-custom/react-flipcard.d.ts" />

/*
    TODO: chrome shows shadow of front pane when there is overflow; ff and safari do not
    - try setting overflow to auto on focus; remove auto on blur
*/
'use strict'

// required by bundler
import * as React from 'react'
// import * as ReactDOM from 'react-dom';
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
            expandiconfront:'expand_more',
            expandiconback: 'expand_more',
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
    showBack = e => {
        e.stopPropagation()
        // let node = this.state.elements.frontface;
        // node.style.display = 'none'
        // node.style.overflow = 'hidden'
        this.setState({
            isFlipped: true
        });
    }

    showFront = e => {
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

    expandFront = e => {
        e.stopPropagation()
        if (this.state.elements.frontface.style.overflow != 'auto') {
            this.state.elements.frontface.style.overflow = 'auto'
            this.scroll(this.state.elements.frontface,0,160)
            // this.state.elements.frontface.scrollTop = 100
            this.setState({expandiconfront:'expand_less'})
        } else {
            this.scroll(this.state.elements.frontface, this.state.elements.frontface.scrollTop, 0)
            // this.state.elements.frontface.scrollTop = 0
            this.state.elements.frontface.style.overflow = 'hidden'
            this.setState({ expandiconfront: 'expand_more' })
        }
    }

    expandBack = e => {
        e.stopPropagation()
        if (this.state.elements.backface.style.overflow != 'scroll') {
            this.state.elements.backface.style.overflow = 'scroll'
            this.scroll(this.state.elements.backface, 0, 160)
            // this.state.elements.backface.scrollTop = 100
            this.setState({ expandiconback: 'expand_less' })
        } else {
            this.scroll(this.state.elements.backface, this.state.elements.backface.scrollTop, 0)
            // this.state.elements.backface.scrollTop = 0
            this.state.elements.backface.style.overflow = 'hidden'
            this.setState({ expandiconback: 'expand_more' })
        }
    }

    scroll = (element, from, to) => {
        if (from == to) return
        let top = from
        let increment = (to > from)? 1: -1
        let interval = setInterval(() => {
            top += increment
            element.scrollTop = top
            if (Math.abs(top - to) < 1) {
                clearInterval(interval)
                // console.log('interval cleared')
            }
        },5)
    }

    handleOnFlip = (flipped) => {
        if ( this.props.system.ischrome ) {
            if ( flipped ) { // view backface
                // this.state.elements.backface.style.overflow = 'auto'
                this.state.elements.backface.style.display = 'block'
                this.state.elements.frontface.style.display = 'none'
            } else {
                // this.state.elements.frontface.style.overflow = 'auto'
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
                            className = "flipcard-help-icon"
                            style={{
                                backgroundColor: tile.props.tilecolors.front, 
                                padding: 0, 
                                height: "36px", 
                                width: "36px", 
                                position: "absolute", 
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
                    <IconButton
                        className = "flipcard-expand-icon"
                        style={{
                            backgroundColor: tile.props.tilecolors.front,
                            height: "36px",
                            width: "36px",
                            padding: "0",
                            position:"absolute",
                        }}
                        onTouchTap={ tile.expandFront }>
                        <FontIcon
                            className="material-icons"
                            color={ tile.props.tilecolors.helpbutton }
                            ref={(node) => { tile.state.elements.expandiconfront = node } }
                            >
                            {this.state.expandiconfront}
                        </FontIcon>
                    </IconButton>
                    <div className = "flipcard-padding">
                    <div className = "flipcard-border" 
                        style={{ 
                            backgroundColor: tile.props.tilecolors.front, 
                        }}>
                    <div className = "flipcard-content"
                        ref={(node) => { tile.state.elements.frontface = node } }
                    >
                        <div dangerouslySetInnerHTML={ tile.rawMarkup('markup') }></div>
                    </div>
                     <div className="flipcard-gradient front">
                    </div>
                    </div></div>
                  </div>
                <div className="flipcard-frame"
                    onTouchTap={ tile.showFront }
                    style={{ cursor: 'pointer' }}>
                    <IconButton
                        className = "flipcard-return-to-front-icon"
                        style={{ 
                            backgroundColor: tile.props.tilecolors.back, 
                            padding: 0, 
                            height: "36px", 
                            width: "36px", 
                            position: "absolute", 
                        }}
                        onTouchTap={ tile.showFront }>
                        <FontIcon
                            className="material-icons"
                            color={ tile.props.tilecolors.helpbutton }
                            >
                            flip_to_front
                        </FontIcon>
                    </IconButton>
                    <IconButton
                        className = "flipcard-expand-icon"
                        style={{
                            backgroundColor: tile.props.tilecolors.back,
                            height: "36px",
                            width: "36px",
                            padding: "0",
                            position: "absolute",
                        }}
                        onTouchTap={ tile.expandBack }>
                        <FontIcon
                            className="material-icons"
                            color={ tile.props.tilecolors.helpbutton }
                            ref={(node) => { tile.state.elements.expandiconback = node } }
                            >
                            {this.state.expandiconback}
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
                    </div>
                     <div className="flipcard-gradient back">
                        </div>
                     </div></div>
                </div>
            </ReactFlipCard>
            </GridTile>
        )
    }
}

