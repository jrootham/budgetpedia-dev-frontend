// navtile.tsx
///<reference path="../../typings-custom/react-flipcard.d.ts" />

/*
    TODO: 
    scroll amount on expand should be parameterized
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
            isoverflowedfront:false,
            isoverflowedback:false,
        }
    }

    transitionTo = (e) => {
        if (e.target.tagName == 'A') return;
        // used exclusively for transition
        e.stopPropagation()
        e.preventDefault()
        var _this = this;
        // wait for current js queue to clear
        window.setTimeout(function(){ // prevent timing issues with FlipCard rendering
            _this.props.transitionTo(_this.props.route)
        },0)
    }
    
    rawMarkup = ( selector ) => {
        return { __html: this.props[selector] };
    }

    showBack = e => {
        e.stopPropagation()
        this.setState({
            isFlipped: true
        });
    }

    showFront = e => {
        if (e.target.tagName == 'A') return;

        e.stopPropagation()
        let node = this.state.elements.backface

        if ( this.props.system.ischrome )
            node.style.display = 'none'

        this.setState({
            isFlipped: false
        });
    }

    // toggle
    expandFront = e => {
        e.stopPropagation()

        if (this.state.elements.frontface.style.overflow != 'auto') {

            this.state.elements.frontface.style.overflow = 'auto'
            this.scroll(this.state.elements.frontface,0,160)
            this.setState({expandiconfront:'expand_less'})

        } else {

            this.scroll(this.state.elements.frontface, this.state.elements.frontface.scrollTop, 0)
            this.state.elements.frontface.style.overflow = 'hidden'
            this.setState({ expandiconfront: 'expand_more' })

        }
    }

    // toggle
    expandBack = e => {
        e.stopPropagation()
        if (this.state.elements.backface.style.overflow != 'scroll') {

            this.state.elements.backface.style.overflow = 'scroll'
            this.scroll(this.state.elements.backface, 0, 160)
            this.setState({ expandiconback: 'expand_less' })

        } else {

            this.scroll(this.state.elements.backface, this.state.elements.backface.scrollTop, 0)
            this.state.elements.backface.style.overflow = 'hidden'
            this.setState({ expandiconback: 'expand_more' })

        }
    }

    // animation
    scroll = (element, from, to) => {
     if (Math.abs(from - to) < 1) return
        let top = from
        let increment = (to > from)? 1: -1

        let interval = setInterval(() => {
            top += increment
            element.scrollTop = top
            if (Math.abs(top - to) < 1) {
                clearInterval(interval)
            }
        },4)

    }

    // handle chrome bug
    handleOnFlip = flipped => {
        // chrome doesn't respect backface-visibility in presence of overflow:auot
        if ( this.props.system.ischrome ) {

            if ( flipped ) { // view backface

                this.state.elements.backface.style.display = 'block'
                this.state.elements.frontface.style.display = 'none'

            } else {

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

    isOverflowedFront = () => {
        return this.state.isoverflowedfront
    }

    isOverflowedBack = () => {
        return this.state.isoverflowedback
    }

    // utility
    isOverflowed = element => {
        return element.scrollHeight > element.clientHeight // || element.scrollWidth > element.clientWidth;
    }

    // wait for component to mount before measuring overflow state
    componentDidMount = () => {
        let _this = this
        setTimeout( () => {
            let isfrontoverflowed: boolean = _this.isOverflowed(_this.state.elements.frontface)
            let isbackoverflowed: boolean = _this.isOverflowed(_this.state.elements.backface)
            // set state, redrawing tile
            _this.setState({
                isoverflowedfront:isfrontoverflowed,
                isoverflowedback:isbackoverflowed,
            })
        })
    }

    render() {
        let tile = this
        // create tile components:
        let helpicon = 
            <IconButton
                key='helpicon'
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
                    color = { tile.props.tilecolors.helpbutton }>

                    help

                </FontIcon>

            </IconButton>

        let returnicon = 
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
                    color={ tile.props.tilecolors.helpbutton }>

                    flip_to_front

                </FontIcon>

            </IconButton>

        let frontexpandicon = 
            <IconButton
                className = "flipcard-expand-icon"
                style={{
                    backgroundColor: tile.props.tilecolors.front,
                    height: "36px",
                    width: "36px",
                    padding: "0",
                    position: "absolute",
                }}
                onTouchTap={ tile.expandFront }>

                <FontIcon
                    className="material-icons"
                    color={ tile.props.tilecolors.helpbutton }>

                    {this.state.expandiconfront}

                </FontIcon>

            </IconButton>

        let backexpandicon = 
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
                    color={ tile.props.tilecolors.helpbutton }>

                    {this.state.expandiconback}

                </FontIcon>

            </IconButton>

        let frontflipcard = 
            <div className="flipcard-frame"
                onTouchTap={ tile.transitionTo }
                style={{ cursor: 'pointer' }}>

                { tile.rawMarkup('help').__html ? helpicon : null }
                { this.isOverflowedFront() ? frontexpandicon : null } 

                <div className = "flipcard-padding">
                    <div className = "flipcard-border"
                        style={{ backgroundColor: tile.props.tilecolors.front, }}>

                        <div className = "flipcard-content"
                            ref={(node) => { tile.state.elements.frontface = node } }>

                            <div dangerouslySetInnerHTML={ tile.rawMarkup('markup') }></div>

                        </div>
                        { this.isOverflowedFront() ?
                            <div className="flipcard-gradient front"></div>
                            : null 
                        }
                    </div>
                </div>
            </div>

        let backflipcard = 
            <div className="flipcard-frame"
                onTouchTap={ tile.showFront }
                style={{ cursor: 'pointer' }}>

                { returnicon }
                { this.isOverflowedBack() ? backexpandicon : null }

                <div className = "flipcard-padding">
                    <div className = "flipcard-border"
                        style={{ backgroundColor: tile.props.tilecolors.back, }}>

                        <div className = "flipcard-content"
                            ref={(node) => { tile.state.elements.backface = node } }>
                            <div dangerouslySetInnerHTML={ tile.rawMarkup('help') }></div>
                        </div>
                        <div className="flipcard-gradient back"></div>

                    </div>
                </div>
            </div>

        return (

            <GridTile>
                <FlipCard
                    disabled = { true }
                    flipped = { tile.state.isFlipped }
                    onFlip = { tile.handleOnFlip }
                    onKeyDown = { tile.handleKeyDown }
                    style = {{ border:"none" }}>

                    { frontflipcard }
                    { backflipcard }

                </FlipCard>
            </GridTile>
        )
    }
}

