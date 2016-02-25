// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// inputform.tsx
// a simple generic input form
'use strict'

// required by bundler
import * as React from 'react'
var { Component } = React

import Checkbox = require('material-ui/lib/checkbox')
import TextField = require('material-ui/lib/text-field')
import CardText = require('material-ui/lib/card/card-text')
import CardActions = require('material-ui/lib/card/card-actions')
import RaisedButton = require('material-ui/lib/raised-button')

interface BasicFormProps extends React.Props<BasicForm> {
    submit: Function,
    elements:Array<elementProps>,
    submitButtonLabel: string,
    completionMessage?: string,
    warningMessage?: string,
    errorMessage?: string,
}

export interface elementProps {
    defaultValue?: string,
    hintText?:string,
    floatingLabelText:string,
    error?: string,
    type?: string,
    // key:string,
    index:string,
    multiLine?: boolean,
    rows?: number,

    minLength?:number,
    maxLength?:number,
    required?:boolean,
    disabled?:boolean,
}

interface TextFields {
    [index:string]: TextField,
}

export class BasicForm extends React.Component<BasicFormProps, any> {

    textFields: TextFields = {}

    submit= (e) => {
        e.stopPropagation()
        e.preventDefault()

        this.props.submit(this.textFields)
        return false
    }

    render() {
        let basicform = this
        let elements = basicform.props.elements
        // if rows > 1, make display = block
        // filter out allocated attributes before applying to TextField
        let children = elements.map(element => {

            let attributes:{[index:string]:any} = {}
            for (var name in element) {
                if (['index'].indexOf(name) < 0)
                    attributes[name]=element[name]
            }

            let istextbox:boolean = (attributes['rows'] && (attributes['rows'] > 1))
            let display = istextbox
                ? 'block'
                : 'inline-block'
            if (istextbox)
                attributes['fullWidth'] = true

            return (
                <div className = "textfieldwrapper"
                    style={{
                        display:display,
                        marginRight:"5px"
                    }} 
                    key={element.index} >
                    <TextField 
                        ref = { node => {basicform.textFields[element.index]=node} } 
                        { ...attributes } 
                    />

                </div>
            )
        })

        return (
        <form onSubmit = { basicform.submit } >

            <CardText>
                { basicform.props.completionMessage
                    ? <p style={{ color: "green" }}>{ basicform.props.completionMessage }</p>
                    : null
                }

                { basicform.props.warningMessage
                    ? <p style={{ color: "orange" }}>{ basicform.props.warningMessage }</p>
                    : null
                }

                { basicform.props.errorMessage
                    ? <p style={{ color: "red" }}>{ basicform.props.errorMessage }</p>
                    : null
                }

                { children }
                
            </CardText>

            <CardActions>

                <RaisedButton
                    type="submit"
                    label={basicform.props.submitButtonLabel}
                    className="button-submit"
                    primary={true} />

            </CardActions>

        </form>)
    }
}


