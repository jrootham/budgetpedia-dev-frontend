"use strict";
const React = require('react');
var { Component } = React;
class Roadmap extends Component {
    constructor() {
        super(...arguments);
        this.state = {
            roadmap: null
        };
        this.phases = null;
        this.prepareRoadmap = () => {
            if (!this.state.roadmap)
                return;
            if (this.phases)
                return;
            let roadmap = this.state.roadmap;
            let phases = roadmap.phases;
            let rawevents = roadmap.events;
            let rawevent;
            for (rawevent of rawevents) {
                phases[rawevent.phase].events.push(rawevent);
            }
            let phaselist = [];
            for (let phasename in phases) {
                phaselist.push(phases[phasename]);
            }
            phaselist = phaselist.sort((a, b) => {
                return a.index - b.index;
            });
            this.phases = phaselist;
            console.log('prepared phases', phaselist);
        };
    }
    componentDidMount() {
        console.log('componentWillMount');
        fetch('./db/repositories/toronto/roadmaps/government_events.json').then(response => {
            if (response.ok) {
                console.log('response', response);
                return response.json();
            }
            else {
                console.log('response error', response);
            }
        }).then(json => {
            console.log('json', json);
            this.setState({
                roadmap: json
            });
        }).catch(error => {
            console.log('error', error);
        });
    }
    render() {
        this.prepareRoadmap();
        return React.createElement("div", null, "Roadmap Page");
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Roadmap;
