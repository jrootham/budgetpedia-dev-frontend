// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// register.tsx

import * as React from 'react' // required by bundler
var { Component, PropTypes } = React
import { connect as injectStore} from 'react-redux'
import * as Actions from '../actions/actions'

import { BasicForm, elementProps } from '../components/basicform'
import Card = require('material-ui/lib/card/card')
import CardTitle = require('material-ui/lib/card/card-title')

class RegisterClass extends Component<any, any> {
    // respond to login form; assume error correction
    submitRegistration = elements => {

        let profile = {}
        for (var index in elements) {
            profile[index] = elements[index].getValue()
        }
        console.log('profile', profile)

        this.props.dispatch(Actions.registerUser(profile))
    }
    render() {

        let registerpage = this

        let elements: Array<elementProps> = [
            {
                index: 'email',
                floatingLabelText: 'Email Address',
                hintText: "enter unique email (required)",
                // defaultValue: 'henrik@bechmann.ca',
                type: 'email',
                required: true,
            },
            {
                index: 'userhandle',
                floatingLabelText: 'User Handle',
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
        let registerform =
            <BasicForm
                submit = { registerpage.submitRegistration }
                elements = { elements }
                submitButtonLabel = 'Register'
                errorMessage = { registerpage.props.register.errorMessage }
                />

        return <Card style={{ margin: "5px" }} >

            <CardTitle title = "Register" style={{ paddingBottom: 0 }} />
            
            { registerform }

        </Card>
    }
}

function mapStateToProps(state) {

    let { theme, auth, register } = state

    return {

        state,
        auth,
        theme,
        register,
    }

}

var Register: typeof RegisterClass = injectStore(mapStateToProps)(RegisterClass)

export { Register }
