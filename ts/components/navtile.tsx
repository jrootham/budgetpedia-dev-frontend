// copyright (c) 2015 Henrik Bechmann, Toronto, MIT Licence
// navtile.tsx
///<reference path="../../typings-custom/react-flipcard.d.ts" />

/*
    TODO: 
    - scroll amount on expand should be parameterized
    - define NavTileProps
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

// interface NavTileProps extends React.Props<NavTile> {
//     markup: string
// }

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
        // if (e.target.tagName == 'A') return;
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
        if (this.props[selector])
            return { __html: this.props[selector].body }
        else
            return {__html: ''}
    }

    showBack = e => {
        e.stopPropagation()
        e.preventDefault()
        this.setState({
            isFlipped: true
        });
    }

    showFront = e => {
        // if (e.target.tagName == 'A') return;

        e.stopPropagation()
        e.preventDefault()
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
        e.preventDefault()

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
        e.preventDefault()
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

    isHelpContent = () => {
        let help = this.props.help
        if (!help) return false
        return (help.title || help.body)
    }

    // wait for component to mount before measuring overflow state
    componentDidMount = () => {
        let _this = this

        _this.forceUpdate() // in some circumstances this is required to draw backface expand icons
        // ... when home route is chosen after route from tile to target page

        setTimeout(() => {
            let isfrontoverflowed: boolean = _this.isOverflowed(_this.state.elements.frontface)
            let isbackoverflowed: boolean = _this.isOverflowed(_this.state.elements.backface)
            // set state, redrawing tile
            _this.setState({
                isoverflowedfront: isfrontoverflowed,
                isoverflowedback: isbackoverflowed,
            })
        })
    }

    // ---------------------------------------------- //

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
                onTouchTap={tile.showBack} >

                <FontIcon
                    className="material-icons"
                    color = { tile.props.tilecolors.helpbutton } >

                    help_outline

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
                onTouchTap={ tile.showFront } >

                <FontIcon
                    className="material-icons"
                    color={ tile.props.tilecolors.helpbutton } >

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
                onTouchTap={ tile.expandFront } >

                <FontIcon
                    className="material-icons"
                    color={ tile.props.tilecolors.helpbutton } >

                    {tile.state.expandiconfront}

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
                onTouchTap={ tile.expandBack } >

                <FontIcon
                    className="material-icons"
                    color={ tile.props.tilecolors.helpbutton } >

                    {tile.state.expandiconback}

                </FontIcon>

            </IconButton>

        let frontflipcard = 
            <div className="flipcard-frame">

                { (tile.isHelpContent()) ? helpicon : null }

                { tile.isOverflowedFront() ? frontexpandicon : null } 

                <div className = "flipcard-padding">
                    <div className = "flipcard-border"
                        style={{ backgroundColor: tile.props.tilecolors.front, }} >

                        <div className = "flipcard-content"
                            ref={(node) => { tile.state.elements.frontface = node } } >
                            <a style={{ 
                                    padding:"3px 0 0 3px",
                                    fontSize: "small", 
                                    position:"absolute", 
                                    top:0,
                                    left:0,
                                    fontStyle:"italic",
                                    color: tile.props.tilecolors.helpbutton,
                            }} 
                                href="javascript:void(0)" 
                                onTouchTap={ tile.transitionTo } >

                                See more >>

                            </a>
                            <h3 onTouchTap={ tile.transitionTo }
                                style={{ 
                                    marginBottom: 0, 
                                    cursor:"pointer", 
                                }} >

                                {tile.props.markup.title}
                                
                            </h3>

                            <div dangerouslySetInnerHTML={ tile.rawMarkup('markup') }></div>

                        </div>
                        { tile.isOverflowedFront() ?
                            <div className="flipcard-gradient front"></div>
                            : null 
                        }
                    </div>
                </div>
            </div>

        let backflipcard = 
            <div className="flipcard-frame" >

                { returnicon }

                { tile.isOverflowedBack() ? backexpandicon : null }

                <div className = "flipcard-padding">
                    <div className = "flipcard-border"
                        style={{ backgroundColor: tile.props.tilecolors.back, }} >

                        <div className = "flipcard-content"
                            ref={(node) => { tile.state.elements.backface = node } } >
                            <a style={{
                                padding: "3px 0 0 3px",
                                fontSize: "small",
                                position: "absolute",
                                top: 0,
                                left: 0,
                                fontStyle: "italic",
                                color: tile.props.tilecolors.helpbutton,
                            }}
                                href="javascript:void(0)"
                                onTouchTap={ tile.showFront } >

                                Return >>

                            </a>

                            <h3 onTouchTap={ tile.showFront }
                                style={{ marginBottom: 0, cursor:"pointer", }} >

                                {tile.isHelpContent() ? tile.props.help.title:null }

                            </h3>

                            <div dangerouslySetInnerHTML={ tile.rawMarkup('help') }></div>

                        </div>
                        <div className="flipcard-gradient back"></div>

                    </div>
                </div>
            </div>

        // mainline
        return (

            <GridTile>
                <FlipCard
                    disabled = { true }
                    flipped = { tile.state.isFlipped }
                    onFlip = { tile.handleOnFlip }
                    onKeyDown = { tile.handleKeyDown }
                    style = {{ border:"none" }} >

                    { frontflipcard }

                    { backflipcard }

                </FlipCard>
            </GridTile>
        )
    }
}

