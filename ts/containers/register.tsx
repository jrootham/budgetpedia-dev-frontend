// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// register.tsx

import * as React from 'react' // required by bundler
var { Component, PropTypes } = React
import { connect as injectStore} from 'react-redux'
import * as Actions from '../actions/actions'

import { BasicForm, elementProps } from '../components/basicform'

class RegisterClass extends Component<any, any> {
    // respond to login form; assume error correction
    submitRegistration = (elements) => {

        let creds = {}
        for (var index in elements) {
            creds[index] = elements[index].getValue()
        }
        console.log('creds', creds)

        // this.props.dispatch(Actions.registerUser(creds))
    }
    render() {

        let registerpage = this

        let elements: Array<elementProps> = [
            {
                index: 'userid',
                floatingLabelText: 'Email Address',
                hintText: "enter unique email (required)",
                // defaultValue: 'henrik@bechmann.ca',
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
        ]
        // TODO: change source of errormessage to props.register
        let registerform =
            <BasicForm
                submit = { registerpage.submitRegistration }
                elements = { elements }
                submitButtonLabel = 'Register'
                errorMessage = { registerpage.props.auth.errorMessage }
                />

        return <div>
            <h1>Register</h1>

            { registerform }

        </div>
    }
}

function mapStateToProps(state) {

    let { theme, auth } = state

    return {

        state,
        auth,
        theme,
    }

}

var Register: typeof RegisterClass = injectStore(mapStateToProps)(RegisterClass)

export { Register }
