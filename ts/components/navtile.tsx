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
// import FlipCard = require('react-flipcard')
import GridTile from 'material-ui/GridList'
import FontIcon from 'material-ui/FontIcon'
import IconButton from 'material-ui/IconButton'
import Paper = require('material-ui/lib/paper')

export class NavTile extends React.Component<any, any> {
    constructor() {
        super();
        this.state = { 
            isFlipped: false,
            expandiconfront:'expand_more',
            expandiconback: 'expand_more',
            isoverflowedfront:false,
            isoverflowedback:false,
        }
    }

    elements = {
        frontface:null,
        backface:null,
    }

    transitionTo = (e) => {
        // if (e.target.tagName == 'A') return;
        // used exclusively for transition
        e.stopPropagation()
        e.preventDefault()
        var _this = this;
        // wait for current js queue to clear
        setTimeout(function(){ // prevent timing issues with FlipCard rendering
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
        e.stopPropagation()
        e.preventDefault()
        let node = this.elements.backface
        if ( this.props.system.ischrome ) {
            node.style.display = 'none'
        }

        this.setState({
            isFlipped: false
        });
    }

    // toggle
    expandFront = e => {
        e.stopPropagation()
        e.preventDefault()

        if (this.elements.frontface.style.overflow != 'auto') {

            this.elements.frontface.style.overflow = 'auto'
            this.scroll(this.elements.frontface,0,160)
            this.setState({expandiconfront:'expand_less'})

        } else {

            this.scroll(this.elements.frontface, this.elements.frontface.scrollTop, 0)
            this.elements.frontface.style.overflow = 'hidden'
            this.setState({ expandiconfront: 'expand_more' })

        }
    }

    // toggle
    expandBack = e => {
        e.stopPropagation()
        e.preventDefault()
        if (this.elements.backface.style.overflow != 'scroll') {

            this.elements.backface.style.overflow = 'scroll'
            this.scroll(this.elements.backface, 0, 160)
            this.setState({ expandiconback: 'expand_less' })

        } else {

            this.scroll(this.elements.backface, this.elements.backface.scrollTop, 0)
            this.elements.backface.style.overflow = 'hidden'
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
        // chrome doesn't respect backface-visibility in presence of overflow:auto
        if ( this.props.system.ischrome ) {

            if ( flipped ) { // view backface

                this.elements.backface.style.display = 'block'
                this.elements.frontface.style.display = 'none'

            } else {

                this.elements.frontface.style.display = 'block'
                this.elements.backface.style.display = 'none'

            }
        }
    }

    handleKeyDown = e => {
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
        let component = this

        component.forceUpdate() // in some circumstances this is required to draw backface expand icons
        // ... when home route is chosen after route from tile to target page

        setTimeout(() => {
            let isfrontoverflowed: boolean = component.isOverflowed(component.elements.frontface)
            let isbackoverflowed: boolean = component.isOverflowed(component.elements.backface)
            // set state, redrawing tile
            component.setState({
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
                            ref={(node) => { tile.elements.frontface = node} } >
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
                            ref={(node) => { tile.elements.backface = node} } >
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

