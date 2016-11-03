"use strict";
const React = require('react');
var { Component } = React;
const Card_1 = require('material-ui/Card');
class Roadmap extends Component {
    constructor() {
        super(...arguments);
        this.state = {
            roadmap: null
        };
        this.roadmapintro = React.createElement(Card_1.Card, null, 
            React.createElement(Card_1.CardTitle, {title: "Budget Roadmap", subtitle: "Annual cycle of decision points"}), 
            React.createElement(Card_1.CardText, null, "This is a summary of the decision making process used for the 2016 budget."));
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
        this.getEventClusterElement = (eventcode, lookups, eventslist, phasetitle) => {
            return React.createElement(Card_1.CardText, {expandable: true, style: {
                border: "1px solid silver",
                margin: "0 3px 8px 3px",
                borderRadius: "8px",
            }, key: eventcode}, 
                React.createElement("div", {style: {
                    fontStyle: 'italic',
                    marginBottom: "8px"
                }}, phasetitle + ' phase: ' + lookups[eventcode]), 
                eventslist);
        };
        this.getEventElement = (event, eventindex) => {
            return React.createElement("div", {key: eventindex, style: {
                border: "1px dashed silver",
                margin: "0 3px 8px 3px",
                padding: "3px",
                borderRadius: "8px",
            }}, 
                React.createElement("div", null, 
                    React.createElement("em", null, "Budget type:"), 
                    " ", 
                    event.budget_type, 
                    " "), 
                React.createElement("div", null, 
                    React.createElement("em", null, "Description:"), 
                    " ", 
                    event.budget_event, 
                    " "), 
                event.date ? React.createElement("div", null, 
                    React.createElement("em", null, "Date:"), 
                    " ", 
                    event.date) : null, 
                event.location ? React.createElement("div", null, 
                    React.createElement("em", null, "Location:"), 
                    " ", 
                    event.location, 
                    " ") : null, 
                event.notes ? React.createElement("div", null, 
                    React.createElement("em", null, "Notes:"), 
                    " ", 
                    event.notes, 
                    " ") : null, 
                React.createElement("div", null, 
                    React.createElement("em", null, "Public:"), 
                    " ", 
                    event.public, 
                    " "));
        };
        this.getPhaseContent = (events, phasetitle) => {
            let lookups = this.state.roadmap.lookups;
            let eventcode = null;
            let eventClusterElements = [];
            let eventClusterElement = null;
            let eventslist;
            let event = null;
            for (let eventindex in events) {
                event = events[eventindex];
                if (event.budget_event_code !== eventcode) {
                    if (eventcode) {
                        eventClusterElement = this.getEventClusterElement(eventcode, lookups, eventslist, phasetitle);
                        eventClusterElements.push(eventClusterElement);
                    }
                    eventcode = event.budget_event_code;
                    eventslist = [];
                }
                let eventElement = this.getEventElement(event, eventindex);
                eventslist.push(eventElement);
            }
            if (eventcode) {
                eventClusterElement = this.getEventClusterElement(eventcode, lookups, eventslist, phasetitle);
                eventClusterElements.push(eventClusterElement);
            }
            return eventClusterElements;
        };
        this.getRoadmap = () => {
            if (!this.phases)
                return null;
            let phasesinput = this.phases;
            let phases = phasesinput.map((phase, index) => {
                let phasecontent = this.getPhaseContent(phase.events, phase.title);
                let phaseElement = React.createElement(Card_1.Card, {key: phase.index}, 
                    React.createElement(Card_1.CardTitle, {actAsExpander: true, showExpandableButton: true, title: phase.title, subtitle: phase.subtitle ? phase.subtitle : null}), 
                    phasecontent);
                return phaseElement;
            });
            return phases;
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
        let roadmap = this.getRoadmap();
        return React.createElement("div", null, 
            this.roadmapintro, 
            roadmap);
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Roadmap;
