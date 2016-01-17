// class_maintile.tsx
/// <reference path="../../typings-custom/react-flipcard.d.ts" />
'use strict'

// required by bundler
import * as React from 'react';
// import * as ReactDom from 'react-dom';
import FlipCard = require('react-flipcard');

interface MainTileProps extends React.Props<NavTile> {
	markup: string;
	style?: Object;
}

interface NavTileState {
	isFlipped:Boolean
}

export class NavTile extends React.Component<any, any> {
	constructor() {
		super();
		this.state={ isFlipped: false };
		this.state.elements = {}; 
	}
	
	rawMarkup = () =>  {
		return { __html: this.props.markup };
	}

	showBack = () => {
		this.setState({
			isFlipped: true
		});
	}

	showFront = () => {
		this.setState({
			isFlipped: false
		});
	}

	handleOnFlip = (flipped) => {
		if (flipped) {
			// backButton assigned to state to avoid type error
			var node = this.state.elements.backButton;
			node.focus();
			// the following used for ref="backButton", seems to be out of favour
			// var node = ReactDom.findDOMNode<HTMLElement>(this.refs['backButton']);
		}
	}

	handleKeyDown = (e) => {
		if (this.state.isFlipped && e.keyCode === 27) {
			this.showFront();
		}
	}

	render() {
		return (
			<div style={this.props.style}>
			<FlipCard
				disabled={true}
				flipped={this.state.isFlipped}
				onFlip={this.handleOnFlip}
				onKeyDown={this.handleKeyDown}
				>
			  <div className="TCFlipCard" style={{ border: '1px solid gray', backgroundColor:'palegreen',padding: '3px' }}>
				<div dangerouslySetInnerHTML={ this.rawMarkup() }></div>
	            <button type="button" onClick={this.showBack}>Show back</button>
	            <div><small>(manual flip) </small></div>
			  </div>
			  <div className="TCFlipCard" style={{ border: '1px solid gray', backgroundColor: 'palegoldenrod', padding: '3px' }}>
				<div dangerouslySetInnerHTML={ this.rawMarkup() }></div>
				<button type="button" ref={(node)=>{this.state.elements.backButton = node}} onClick={this.showFront}>Show front</button>
			  </div>
			</FlipCard>
			</div>
		)
	}
}

