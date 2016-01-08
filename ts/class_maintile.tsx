// class_maintile.tsx
/// <reference path="../typings-custom/react-flipcard.d.ts" />

// required by bundler
import * as React from 'react';
// import * as ReactDom from 'react-dom';
import FlipCard = require('react-flipcard');

interface MainTileProps extends React.Props<MainTile> {
	markup: string;
	style?: Object;
}

interface MainTileState {
	isFlipped:Boolean
}

export class MainTile extends React.Component<any, any> {
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
			  <div style={{ width: '170px', border: '1px solid gray' }}>
	            <div>Front</div>
	            <button type="button" onClick={this.showBack}>Show back</button>
	            <div><small>(manual flip) </small></div>
			  </div>
			  <div style={{ width: '170px',border:'1px solid gray' }}>
	            <div>Back</div>
				<button type="button" ref={(node)=>{this.state.elements.backButton = node}} onClick={this.showFront}>Show front</button>
			  </div>
			</FlipCard>
			</div>
		)
	}
}

