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
    submitLogin: Function,
    elements:Array<elementProps>,
    submitButtonLabel: string,
    completionMessage?: string,
    warningMessage?: string,
    errorMessage?: string,
}

export interface elementProps {
    value?:string,
    defaultValue?: string,
    hintText?:string,
    floatingLabelText:string,
    error?: string,
    type?: string,
    key:string,
    minLength?:number,
    maxLength?:number,
    required?:boolean,
}

interface TextFields {
    [index:string]: TextField,
}

export class BasicForm extends React.Component<BasicFormProps, any> {

    textFields: TextFields = {}

    submitLogin = (e) => {
        e.stopPropagation()
        e.preventDefault()
        this.props.submitLogin(this.textFields)
        return false
    }

    render() {
        let basicform = this
        let elements = basicform.props.elements
        // console.log('rendering',elements)
        let children = elements.map(attributes => {

            return <TextField {...attributes} />

        })

        return (
        <form onSubmit={basicform.submitLogin} >

            {basicform.props.completionMessage
                ? <p style={{ color: "green" }}>{basicform.props.completionMessage}</p>
                : null
            }

            {basicform.props.warningMessage
                ? <p style={{ color: "orange" }}>{basicform.props.warningMessage}</p>
                : null
            }

            {basicform.props.errorMessage
                ? <p style={{ color: "red" }}>{basicform.props.errorMessage}</p>
                : null
            }

            <CardText children = { children } />

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


