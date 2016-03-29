"use strict";
const React = require('react');
var { Component } = React;
const react_redux_1 = require('react-redux');
const Card = require('material-ui/lib/card/card');
const CardText = require('material-ui/lib/card/card-text');
const CardTitle = require('material-ui/lib/card/card-title');
class RegisterPendingClass extends Component {
    render() {
        let registerpendingpage = this;
        let auth = registerpendingpage.props.auth;
        let register = registerpendingpage.props.register;
        let registerpending = auth.isAuthenticated
            ?
                React.createElement("div", null, React.createElement("p", null, auth.user.username, ", you're already registered."))
            : register.isRegistered
                ?
                    React.createElement("div", null, React.createElement("p", null, "Thanks for registering, ", register.user.username, "!"), React.createElement("p", null, "An email has been sent to" + ' ' + "the address you used to register. Please follow the instructions in this email" + ' ' + "to authenticate and complete your registration."))
                :
                    React.createElement("div", null, React.createElement("p", null, "No registration data is available."));
        return React.createElement(Card, {style: { margin: "5px" }}, React.createElement(CardTitle, {title: "Registration Pending", style: { paddingBottom: 0 }}), React.createElement(CardText, null, registerpending));
    }
}
function mapStateToProps(state) {
    let { auth, register } = state;
    return {
        state: state,
        auth: auth,
        register: register,
    };
}
var RegisterPending = react_redux_1.connect(mapStateToProps)(RegisterPendingClass);
exports.RegisterPending = RegisterPending;
