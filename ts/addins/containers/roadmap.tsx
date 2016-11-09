// tribes.tsx
// required by bundler
import * as React from 'react'
var { Component } = React
import {Card, CardTitle, CardText} from 'material-ui/Card'
let moment = require('moment')

interface Phase {
    index: number,
    events:any[],
    title:string,
    subtitle?:string,
}

interface BudgetEvent {
    budget_event:string,
    budget_event_code: string,
    budget_type: string,
    category: string,
    location: string,
    date:string,
    notes:string,
    phase:string,
    public: string,
}

interface Roadmap {
    events:any[],
    phases:Phase[],
}

interface State {
    roadmap:Roadmap
}

class Roadmap extends Component<any, State> {

    state = {
        roadmap:null
    }

    componentDidMount() {

        fetch('./db/repositories/toronto/roadmaps/government_events.json').then( response => {
            if (response.ok) {
                return response.json()
            } else {
                console.log('response error',response)
            }
        }).then( json => {
            this.setState({
                roadmap:json
            })
        }).catch( error => {
            console.log('error',error)
        })

    }

    // <h3>Rate supported budgets (waste, water, parking)</h3>
    // <ul>
    // <li>Budget Committee: <a 
    //     target = "_blank" href = "http://app.toronto.ca/tmmis/decisionBodyProfile.do?function=doPrepare&decisionBodyId=1022#Meeting-2016.BU25">November 4</a> <a
    //     target = "_blank" href="http://app.toronto.ca/tmmis/decisionBodyProfile.do?function=doPrepare&decisionBodyId=1022#Meeting-2016.BU26">November 18</a> [wrapup TBD] <a
    //     target = "_blank" href="http://app.toronto.ca/tmmis/decisionBodyProfile.do?function=doPrepare&decisionBodyId=1022#Meeting-2016.BU27">November 28</a> </li>
    // <li>Executive Committee: <a target = "_blank" href="http://app.toronto.ca/tmmis/decisionBodyProfile.do?function=doPrepare&decisionBodyId=966#Meeting-2016.EX20">December 1</a></li>
    // <li>City Council: <a target = "_blank" href="http://app.toronto.ca/tmmis/decisionBodyProfile.do?function=doPrepare&decisionBodyId=961#Meeting-2016.CC23">December 13 & 14</a></li>
    // </ul>
    // <h3>Tax supported budgets (eveything else)</h3>
    // <ul>
    // <li>Budget Committee: <a 
    //     target = "_blank" href="http://app.toronto.ca/tmmis/decisionBodyProfile.do?function=doPrepare&decisionBodyId=1022#Meeting-2016.BU28">December 2</a> <a
    //     target = "_blank" href="http://app.toronto.ca/tmmis/decisionBodyProfile.do?function=doPrepare&decisionBodyId=1022#Meeting-2016.BU29">December 16, 19 & 20, possibly 21</a> [wrapup TBD] <a
    //     target = "_blank" href="http://app.toronto.ca/tmmis/decisionBodyProfile.do?function=doPrepare&decisionBodyId=1022#Meeting-2017.BU30">January 5, 9 & 10</a> <a
    //     target = "_blank" href="http://app.toronto.ca/tmmis/decisionBodyProfile.do?function=doPrepare&decisionBodyId=1022#Meeting-2017.BU31">January 12</a> <a
    //     target = "_blank" href="http://app.toronto.ca/tmmis/decisionBodyProfile.do?function=doPrepare&decisionBodyId=1022#Meeting-2017.BU32">January 24</a> </li>
    // <li>Executive Committee: <a target = "_blank" href="http://app.toronto.ca/tmmis/decisionBodyProfile.do?function=doPrepare&decisionBodyId=966#Meeting-2017.EX22">February 7</a></li>
    // <li>City Council: <a target = "_blank" href="http://app.toronto.ca/tmmis/decisionBodyProfile.do?function=doPrepare&decisionBodyId=961#Meeting-2017.CC25">February 15, 16, possibly 17</a></li>
    // </ul>

    roadmapintro = <div>
        <Card> 
            <CardTitle 
                title = {"Budget Roadmap"}
                subtitle = {"Annual cycle of decision points"}
            /> 
            <CardTitle 
                title = "2017"
            /> 
        </Card>
        <Card>
            <CardTitle 
                actAsExpander={true}
                showExpandableButton={true}
                title = "Committee Meetings about the 2017 budget"
            />
            <CardText
            expandable = {true}
                style = {{
                    border:"1px solid silver",
                    margin:"0 3px 8px 3px",
                    borderRadius:"8px",
                }}
            > 
            <p>Toronto's 2017 public budget process schedule is published <a 
                target="_blank" href="http://bit.ly/2eKcrfK">here.</a></p>
            <p>Follow events in these committees using the City's <a target = "_blank" href="http://app.toronto.ca/tmmis/index.do">TMMIS</a> (Toronto Meeting Management Information System).
            Each committee's agendas, minutes, and background documents can be found through these links:</p>
            <h3>Rate supported budgets (waste, water, parking)</h3>
            <ul>
                <li><a target = "_blank" href="http://app.toronto.ca/tmmis/decisionBodyProfile.do?function=doPrepare&decisionBodyId=1022">Budget Committee</a>: November 4, November 18, [wrapup TBD], November 28</li>
                <li><a target = "_blank" href="http://app.toronto.ca/tmmis/decisionBodyProfile.do?function=doPrepare&decisionBodyId=966">Executive Committee</a>: December 1</li>
                <li><a target = "_blank" href="http://app.toronto.ca/tmmis/decisionBodyProfile.do?function=doPrepare&decisionBodyId=961">City Council</a>: December 13 & 14</li>
            </ul>
            <h3>Tax supported budgets (eveything else)</h3>
            <ul>
                <li><a target = "_blank" href="http://app.toronto.ca/tmmis/decisionBodyProfile.do?function=doPrepare&decisionBodyId=1022">Budget Committee</a>: December 2, December 16, 19 & 20, possibly 21, January 5, 9 & 10, January 12, January 24</li>
                <li><a target = "_blank" href="http://app.toronto.ca/tmmis/decisionBodyProfile.do?function=doPrepare&decisionBodyId=966">Executive Committee</a>: February 7</li>
                <li><a target = "_blank" href="http://app.toronto.ca/tmmis/decisionBodyProfile.do?function=doPrepare&decisionBodyId=961">City Council</a>: February 15, 16, possibly 17</li>
            </ul>
            </CardText>
        </Card>
        <Card>
            <CardTitle 
                title = "2016"
            /> 
            <CardText>
            <div>Below is a summary of the program-by-program decision making process used for the Toronto 2016 budget, to provide some insight into the annual cycle.</div>
            <div>(A program is a division or an agency)</div>
            <div>The data was gathered through a combination of public sources and interviews with city staff.</div>
            </CardText>
        </Card>
        </div>

    phases:Phase[] = null

    prepareRoadmap = () => {

        if (!this.state.roadmap) return
        if (this.phases) return
        let roadmap = this.state.roadmap
        let phases = roadmap.phases
        let rawevents = roadmap.events as Object[]
        let rawevent:any

        for (rawevent of rawevents) {
            phases[rawevent.phase].events.push(rawevent)
        }

        let phaselist:Phase[] = []
        for (let phasename in phases) {
            phaselist.push(phases[phasename])
        }

        phaselist = phaselist.sort((a,b) => {
            return a.index - b.index
        })

        this.phases = phaselist

    }

    getEventClusterElement = (
        eventcode, 
        lookups, 
        eventslist, 
        phasetitle) => {

        return <CardText
            expandable = {true}
            style = {{
                border:"1px solid silver",
                margin:"0 3px 8px 3px",
                borderRadius:"8px",
            }}
            key = {eventcode}
        > 
            <div style={
                {
                    fontStyle:'italic',
                    marginBottom:"8px"
                }
            }>

                { 'Part of ' + phasetitle + ' phase: ' + lookups[eventcode] }

            </div>

            { eventslist }

        </CardText>
    }

    getEventElement = (event:BudgetEvent,eventindex) => {

        return <div
            key = {eventindex}
            style = {{
                border:"1px dashed silver",
                margin:"0 3px 8px 3px",
                padding:"3px",
                borderRadius:"8px",
            }}
        >

            <div><em>Budget type:</em> { event.budget_type } </div>
            <div><em>Description:</em> { event.budget_event } </div>
            {event.date?<div><em>Date:</em> { moment(event.date,'YYYY-M-D').format('MMMM D, YYYY') }</div>:null }
            {event.location?<div><em>Location:</em> { event.location } </div>:null}
            {event.notes?<div><em>Notes:</em> { event.notes } </div>:null}
            <div><em>Public:</em> { event.public } </div>

        </div>

    }

    getPhaseContent = (events, phasetitle) => {

        let lookups = this.state.roadmap.lookups
        let eventcode = null
        let eventClusterElements = []
        let eventClusterElement = null
        let eventslist
        let event:BudgetEvent = null

        for (let eventindex in events) {

            event = events[eventindex]
            if (event.budget_event_code !== eventcode) {
                if (eventcode) {
                    eventClusterElement = this.getEventClusterElement(
                        eventcode,lookups,eventslist,phasetitle)
                    eventClusterElements.push(eventClusterElement)
                }
                eventcode = event.budget_event_code
                eventslist = []
            }
            let eventElement = this.getEventElement(event, eventindex)
            eventslist.push(eventElement)

        }

        // tail settlement
        if (eventcode) {

            eventClusterElement = this.getEventClusterElement(
                eventcode,lookups,eventslist,phasetitle)
            eventClusterElements.push(eventClusterElement)

        }

        return eventClusterElements

    }

    getRoadmap = () => {

        if (!this.phases) return null

        let phasesinput = this.phases
        let phases = phasesinput.map((phase,index) => {

            let phasecontent = this.getPhaseContent(phase.events, phase.title)
            let [startdate, enddate] = this.getDateRange(phase.events)
            let phaseElement = <Card
                    key = {phase.index}
                >
                <CardTitle 
                    actAsExpander={true}
                    showExpandableButton={true}
                    title = { phase.title }
                    subtitle = {phase.subtitle + ' from ' + 
                        moment(startdate,'YYYY-MM-DD').format('MMMM D, YYYY') + ' to ' + 
                        moment(enddate,'YYYY-MM-DD').format('MMMM D, YYYY')
                    }
                />

                { phasecontent }

            </Card>

            return phaseElement

        })

        return phases

    }

    getDateRange = (events) => {

        let startdate = null
        let enddate = null
        for (let event of events) {

            let eventdate = moment(event.date,'YYYY-M-D').format('YYYY-MM-DD')

            if (!startdate || startdate > eventdate) {
                startdate = eventdate
            }

            if (!enddate || enddate < eventdate) {
                enddate = eventdate
            }

        }

        return [startdate,enddate]

    }

    render() {

        this.prepareRoadmap()
        let roadmap = this.getRoadmap()

        return <div>

            { this.roadmapintro }

            { roadmap }

        </div>

    }
}

export default Roadmap