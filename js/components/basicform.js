'use strict';
const React = require('react');
var { Component } = React;
const TextField = require('material-ui/lib/text-field');
const CardText = require('material-ui/lib/card/card-text');
const CardActions = require('material-ui/lib/card/card-actions');
const RaisedButton = require('material-ui/lib/raised-button');
class BasicForm extends React.Component {
    constructor(...args) {
        super(...args);
        this.textFields = {};
        this.submit = e => {
            e.stopPropagation();
            e.preventDefault();
            this.props.submit(this.textFields);
            return false;
        };
    }
    render() {
        let basicform = this;
        let elements = basicform.props.elements;
        let children = elements.map(element => {
            let attributes = {};
            for (var name in element) {
                if (['index'].indexOf(name) < 0)
                    attributes[name] = element[name];
            }
            let istextbox = (attributes['rows'] && (attributes['rows'] > 1));
            let display = istextbox
                ? 'block'
                : 'inline-block';
            if (istextbox)
                attributes['fullWidth'] = true;
            return (React.createElement("div", {className: "textfieldwrapper", style: {
                display: display,
                marginRight: "5px"
            }, key: element.index}, React.createElement(TextField, React.__spread({ref: node => { basicform.textFields[element.index] = node; }}, attributes))));
        });
        return (React.createElement("form", {onSubmit: basicform.submit, action: "javascript:void(0)"}, React.createElement(CardText, null, basicform.props.completionMessage
            ? React.createElement("p", {style: { color: "green" }}, basicform.props.completionMessage)
            : null, basicform.props.warningMessage
            ? React.createElement("p", {style: { color: "orange" }}, basicform.props.warningMessage)
            : null, basicform.props.errorMessage
            ? React.createElement("p", {style: { color: "red" }}, basicform.props.errorMessage)
            : null, children), React.createElement(CardActions, null, React.createElement(RaisedButton, {type: "submit", label: basicform.props.submitButtonLabel, className: "button-submit", primary: true}))));
    }
}
exports.BasicForm = BasicForm;
