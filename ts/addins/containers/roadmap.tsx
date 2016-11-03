// tribes.tsx
// required by bundler
import * as React from 'react'
var { Component } = React

interface Phase {
    index: number,
    events:any[],
    title:string,
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
        console.log('componentWillMount')
        fetch('./db/repositories/toronto/roadmaps/government_events.json').then(response => {
            if (response.ok) {
                console.log('response',response)
                return response.json()
            } else {
                console.log('response error',response)
            }
        }).then(json => {
            console.log('json',json)
            this.setState({
                roadmap:json
            })
        }).catch(error => {
            console.log('error',error)
        })
    }

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
        console.log('prepared phases',phaselist)
    }

    render() {
        this.prepareRoadmap()
        return <div>Roadmap Page</div>
    }
}

export default Roadmap