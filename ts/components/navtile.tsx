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
import FlipCard = require('react-flipcard')
import GridTile = require('material-ui/lib/grid-list/grid-tile')
import FontIcon = require('material-ui/lib/font-icon')
import IconButton = require('material-ui/lib/icon-button')
import Paper = require('material-ui/lib/paper')

interface MainTileProps extends React.Props<NavTile> {
	markup: string;
}

export class NavTile extends React.Component<any, any> {
	constructor() {
		super();
		this.state={ 
			isFlipped: false,
			elements: {},
		}
	}
	
	rawMarkup = (selector) => {
		return { __html: this.props[selector] };
	}
	showBack = () => {
		// let node = this.state.elements.frontface;
		// node.style.display = 'none'
		// node.style.overflow = 'hidden'
		this.setState({
			isFlipped: true
		});
	}

	showFront = () => {
		let node = this.state.elements.backface
		// backface visibility directive ignored in chrome with overflow set to auto
		// https://code.google.com/p/chromium/issues/detail?id=363609
		if (this.props.system.ischrome)
			node.style.display = 'none'
		// node.style.overflow = 'hidden'
		this.setState({
			isFlipped: false
		});
	}

	handleOnFlip = (flipped) => {
		if (this.props.system.ischrome) {
			if (flipped) { // view backface
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

	handleKeyDown = (e) => {
		if (this.state.isFlipped && e.keyCode === 27) {
			this.showFront();
		}
	}

	render() {
		return (
			<GridTile>
			<FlipCard
				disabled={true}
				flipped={this.state.isFlipped}
				onFlip={this.handleOnFlip}
				onKeyDown={this.handleKeyDown}
				style={{border:"none"}}
				>
				  <div className="flipcard-frame">
					{ this.rawMarkup('help').__html? 
						<IconButton
							style={{
								borderRadius: '12px', 
								backgroundColor: this.props.tilecolors.front, 
								padding: 0, 
								height: "24px", 
								width: "24px", 
								position: "absolute", 
								zIndex: 2, 
								right: 0, 
								top: 0 
							}}
						onTouchTap={this.showBack}>
						<FontIcon
							className="material-icons"
							color={this.props.tilecolors.helpbutton}
							>
							help
						</FontIcon>
						</IconButton>:null
					}
					<div className = "flipcard-padding">
					<div className = "flipcard-border" style={{ backgroundColor: this.props.tilecolors.front, }}>
					<div className = "flipcard-content"
						ref={(node) => { this.state.elements.frontface = node } }
					>
						<div dangerouslySetInnerHTML={ this.rawMarkup('markup') }></div>
			        </div></div></div>
				  </div>
				<div className="flipcard-frame"
					onClick={ this.showFront }
					>
					<IconButton
						style={{ backgroundColor: this.props.tilecolors.back, padding: 0, height: "24px", width: "24px", position: "absolute", zIndex: 2, right: 0, top: 0 }}
						onTouchTap={ this.showFront }>
						<FontIcon
							className="material-icons"
							color={this.props.tilecolors.helpbutton}
							>
							flip_to_front
							</FontIcon>
						</IconButton>
					<div className = "flipcard-padding">
					<div className = "flipcard-border" style={{ backgroundColor: this.props.tilecolors.back, }}>
					<div className = "flipcard-content"
						ref={(node) => { this.state.elements.backface = node } }
					>
						<div dangerouslySetInnerHTML={ this.rawMarkup('help') }></div>
					</div></div></div>
				</div>
			</FlipCard>
			</GridTile>
		)
	}
}

