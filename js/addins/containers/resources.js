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
        this.lists = null;
        this.prepareLists = () => {
            if (!this.state.resources)
                return;
            if (this.lists)
                return;
            let resources = this.state.resources;
            let sections = resources.Sections;
            let rawlinks = resources.Data;
            let rawlink;
            for (rawlink of rawlinks) {
                sections[rawlink.section].links.push(rawlink);
            }
            let sectionlist = [];
            for (let sectionname in sections) {
                sectionlist.push(sections[sectionname]);
            }
            sectionlist = sectionlist.sort((a, b) => {
                return a.index - b.index;
            });
            this.lists = sectionlist;
        };
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
        this.prepareLists();
        console.log('lists', this.lists);
        return React.createElement("div", null, this.resourcesintro);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Resources;
