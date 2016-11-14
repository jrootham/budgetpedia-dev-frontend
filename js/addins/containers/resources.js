"use strict";
const React = require('react');
var { Component } = React;
const Card_1 = require('material-ui/Card');
let moment = require('moment');
class Resources extends Component {
    constructor() {
        super(...arguments);
        this.state = {
            resources: null
        };
        this.resourcesintro = React.createElement("div", null, 
            React.createElement(Card_1.Card, null, 
                React.createElement(Card_1.CardTitle, {title: "Budget Resources", subtitle: "A starter kit of external links"})
            )
        );
    }
    componentDidMount() {
        fetch('./db/repositories/toronto/resources/resources.json').then(response => {
            if (response.ok) {
                return response.json();
            }
            else {
                console.log('response error', response);
            }
        }).then(json => {
            console.log('json', json);
            this.setState({
                resources: json
            });
        }).catch(error => {
            console.log('error', error);
        });
    }
    render() {
        return React.createElement("div", null, this.resourcesintro);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Resources;
