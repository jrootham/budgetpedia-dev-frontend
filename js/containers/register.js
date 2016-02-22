var React = require('react');
var { Component, PropTypes } = React;
var react_redux_1 = require('react-redux');
var basicform_1 = require('../components/basicform');
class RegisterClass extends Component {
    constructor(...args) {
        super(...args);
        this.submitRegistration = (elements) => {
            let creds = {};
            for (var index in elements) {
                creds[index] = elements[index].getValue();
            }
            console.log('creds', creds);
        };
    }
    render() {
        let registerpage = this;
        let elements = [
            {
                index: 'userid',
                floatingLabelText: 'Email Address',
                hintText: "enter unique email (required)",
                type: 'email',
                required: true,
            },
            {
                index: 'username',
                floatingLabelText: 'User Name',
                hintText: "the name other members will see",
                type: 'text',
                required: true,
            },
            {
                index: 'firstname',
                floatingLabelText: 'First Name',
                hintText: "actual first or given name",
                type: 'text',
                required: true,
            },
            {
                index: 'lastname',
                floatingLabelText: 'Last Name',
                hintText: "actual last or family name",
                type: 'text',
                required: true,
            },
            {
                index: 'participation',
                floatingLabelText: 'Participation',
                defaultValue: 'General: Member',
                type: 'text',
                disabled: true,
            },
            {
                index: 'intro',
                floatingLabelText: 'Introduction',
                hintText: "something about yourself for other members (optional)",
                multiLine: true,
                rows: 4,
            },
        ];
        let registerform = React.createElement(basicform_1.BasicForm, {"submit": registerpage.submitRegistration, "elements": elements, "submitButtonLabel": 'Register', "errorMessage": registerpage.props.auth.errorMessage});
        return React.createElement("div", null, React.createElement("h1", null, "Register"), registerform);
    }
}
function mapStateToProps(state) {
    let { theme, auth } = state;
    return {
        state,
        auth,
        theme,
    };
}
var Register = react_redux_1.connect(mapStateToProps)(RegisterClass);
exports.Register = Register;
