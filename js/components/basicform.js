'use strict';
var React = require('react');
var { Component } = React;
var TextField = require('material-ui/lib/text-field');
var CardText = require('material-ui/lib/card/card-text');
var CardActions = require('material-ui/lib/card/card-actions');
var RaisedButton = require('material-ui/lib/raised-button');
class BasicForm extends React.Component {
    constructor(...args) {
        super(...args);
        this.textFields = {};
        this.submitLogin = (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.props.submitLogin(this.textFields);
            return false;
        };
    }
    render() {
        let basicform = this;
        let elements = basicform.props.elements;
        let children = elements.map(attributes => {
            return React.createElement(TextField, React.__spread({}, attributes));
        });
        return (React.createElement("form", {"onSubmit": basicform.submitLogin}, basicform.props.completionMessage
            ? React.createElement("p", {"style": { color: "green" }}, basicform.props.completionMessage)
            : null, basicform.props.warningMessage
            ? React.createElement("p", {"style": { color: "orange" }}, basicform.props.warningMessage)
            : null, basicform.props.errorMessage
            ? React.createElement("p", {"style": { color: "red" }}, basicform.props.errorMessage)
            : null, React.createElement(CardText, {"children": children}), React.createElement(CardActions, null, React.createElement(RaisedButton, {"type": "submit", "label": basicform.props.submitButtonLabel, "className": "button-submit", "primary": true}))));
    }
}
exports.BasicForm = BasicForm;
