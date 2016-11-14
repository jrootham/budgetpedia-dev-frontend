// resources.tsx
// required by bundler
import * as React from 'react'
var { Component } = React
import {Card, CardTitle, CardText} from 'material-ui/Card'
let moment = require('moment')

class Resources extends Component<any, any> {
    state = {
        resources:null
    }

    componentDidMount() {

        fetch('./db/repositories/toronto/resources/resources.json').then( response => {
            if (response.ok) {
                return response.json()
            } else {
                console.log('response error',response)
            }
        }).then( json => {
            console.log('json',json)
            this.setState({
                resources:json
            })
        }).catch( error => {
            console.log('error',error)
        })

    }

    resourcesintro = <div>
        <Card> 
            <CardTitle 
                title = {"Budget Resources"}
                subtitle = {"A starter kit of external links"}
            /> 
        </Card>
        </div>

    lists = null

    prepareLists = () => {

        if (!this.state.resources) return
        if (this.lists) return
        let resources = this.state.resources
        let sections = resources.Sections
        let rawlinks = resources.Data as Object[]
        let rawlink:any

        for (rawlink of rawlinks) {
            sections[rawlink.section].links.push(rawlink)
        }

        let sectionlist = []
        for (let sectionname in sections) {
            sectionlist.push(sections[sectionname])
        }

        sectionlist = sectionlist.sort((a,b) => {
            return a.index - b.index
        })

        this.lists = sectionlist

    }

    render() {

        this.prepareLists()
        console.log('lists',this.lists)

        return <div>
            {this.resourcesintro}
        </div>
    }
}

export default Resources