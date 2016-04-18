"use strict";
const React = require('react');
var { Component } = React;
const react_redux_1 = require('react-redux');
const Actions = require('../actions/actions');
const Card = require('material-ui/lib/card/card');
const CardText = require('material-ui/lib/card/card-text');
const CardTitle = require('material-ui/lib/card/card-title');
class RegisterConfirmClass extends Component {
    constructor(...args) {
        super(...args);
        this.componentDidMount = () => {
            this.props.dispatch(Actions.confirmUser());
        };
    }
    render() {
        let registerconfirmpage = this;
        let auth = registerconfirmpage.props.auth;
        let registerconfirm = registerconfirmpage.props.registerconfirm;
        let registerconfirmview = auth.isAuthenticated
            ?
                React.createElement("div", null, React.createElement("p", null, auth.profile.username, ", your registation has been confirmed, and you are logged in."))
            : registerconfirm.isConfirmed
                ?
                    React.createElement("div", null, React.createElement("p", null, "Thanks for confirming your registration, ", registerconfirm.user.username, "!"), React.createElement("p", null, "Automatic login did not occur, however. Please try logging in."))
                :
                    React.createElement("div", null, React.createElement("p", null, "The registration confirmation did not succeed, with the following error message:", React.createElement("span", {style: { fontStyle: "italic" }}, registerconfirm.errorMessage)));
        return React.createElement(Card, {style: { margin: "5px" }}, React.createElement(CardTitle, {title: "Registration Confirmation", style: { paddingBottom: 0 }}), React.createElement(CardText, null, registerconfirmview));
    }
}
function mapStateToProps(state) {
    let { auth, register, registerconfirm } = state;
    return {
        state: state,
        auth: auth,
        register: register,
        registerconfirm: registerconfirm,
    };
}
var RegisterConfirm = react_redux_1.connect(mapStateToProps)(RegisterConfirmClass);
exports.RegisterConfirm = RegisterConfirm;
