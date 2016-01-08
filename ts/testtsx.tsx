/// <reference path="../typings/react/react.d.ts" />
/// <reference path="../typings/react/react-dom.d.ts" />
// import * as React from 'react';
import * as ReactDom from 'react-dom';
import * as React from 'react';

class DemoProps {
	public name: string;
	public age: number;
}

class Demo extends React.Component<DemoProps, any> {
	private foo: number;
	constructor(props: DemoProps) {
		super(props);
		this.foo = 42;
	}
	render() {
		return <div>Hello world!! {this.props.name}</div>
	}
}

ReactDom.render(<Demo age={65} name="March"/>, document.getElementById('testcontainer'));