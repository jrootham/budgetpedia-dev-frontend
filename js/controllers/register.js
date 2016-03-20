"use strict";
const React = require('react');
var { Component, PropTypes } = React;
const react_redux_1 = require('react-redux');
const Actions = require('../actions/actions');
const basicform_1 = require('../components/basicform');
const Card = require('material-ui/lib/card/card');
const CardTitle = require('material-ui/lib/card/card-title');
const constants_1 = require('../constants/constants');
class RegisterClass extends Component {
    constructor(...args) {
        super(...args);
        this.submitRegistration = elements => {
            let profile = {};
            for (var index in elements) {
                profile[index] = elements[index].getValue();
            }
            console.log('profile', profile);
            this.props.dispatch(Actions.registerUser(profile));
        };
    }
    render() {
        let registerpage = this;
        let fieldMessages = registerpage.props.register.fieldMessages || {};
        console.log('fieldMessages = ', fieldMessages);
        let elements = [
            {
                index: 'email',
                floatingLabelText: 'Email Address',
                hintText: "enter unique email (required)",
                type: 'email',
                required: true,
                errorText: fieldMessages['email'],
            },
            {
                index: 'userhandle',
                floatingLabelText: 'User Handle',
                hintText: "the name other members will see",
                type: 'text',
                required: true,
                errorText: fieldMessages['userhandle'],
            },
            {
                index: 'username',
                floatingLabelText: 'User Name',
                hintText: "actual name",
                type: 'text',
                required: true,
                errorText: fieldMessages['username'],
            },
            {
                index: 'participation',
                floatingLabelText: 'Participation',
                defaultValue: constants_1.DEFAULT_PARTICIPATION,
                type: 'text',
                disabled: true,
            },
            {
                index: 'intro',
                floatingLabelText: 'Introduction',
                hintText: "something about yourself for other members (optional)",
                multiLine: true,
                rows: 4,
                errorText: fieldMessages['intro'],
            },
        ];
        let registerform = React.createElement(basicform_1.BasicForm, {submit: registerpage.submitRegistration, elements: elements, submitButtonLabel: 'Register', errorMessage: registerpage.props.register.errorMessage});
        return React.createElement(Card, {style: { margin: "5px" }}, React.createElement(CardTitle, {title: "Register", style: { paddingBottom: 0 }}), registerform);
    }
}
function mapStateToProps(state) {
    let { theme, auth, register } = state;
    return {
        state: state,
        auth: auth,
        theme: theme,
        register: register,
    };
}
var Register = react_redux_1.connect(mapStateToProps)(RegisterClass);
exports.Register = Register;
