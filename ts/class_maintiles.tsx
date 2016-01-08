// class_maintiles.tsx
/// <reference path="../typings-custom/react-masonry-component.d.ts" />

// required by bundler
import * as React from 'react';

import MasonryClass = require('react-masonry-component');
var Masonry = MasonryClass(React);

import {MainTile} from "./class_maintile";

interface MainTilesData {
	id: number,
	style?: Object,
	content: string
}

interface MainTilesProps extends React.Props<MainTiles> {
	tiledata: Array<MainTilesData>
}

export class MainTiles extends React.Component<MainTilesProps, {}>{
	render() {
		var tiles = this.props.tiledata.map(function(data) {
			// key attribute is required by ReactJS
			var element = <MainTile key={data.id} style={data.style} markup={data.content}></MainTile>;
			return element;
		});

		return (
			<Masonry options={{columnWidth:100}} >
				{tiles}
			</Masonry>
		);
	}
}
