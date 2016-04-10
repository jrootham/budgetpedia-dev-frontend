// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// register.tsx

import * as React from 'react' // required by bundler
var { Component, PropTypes } = React
import { connect as injectStore} from 'react-redux'
import * as Actions from '../actions/actions'

import { BasicForm, elementProps } from '../components/basicform'
import Card = require('material-ui/lib/card/card')
import CardTitle = require('material-ui/lib/card/card-title')
import { DEFAULT_PARTICIPATION } from '../common/constants'

class RegisterClass extends Component<any, any> {
    // respond to login form; assume error correction
    submitRegistration = elements => {

        let profile = {}
        for (var index in elements) {
            profile[index] = elements[index].getValue()
        }
        // console.log('profile', profile)

        this.props.dispatch(Actions.registerUser(profile))
    }
    render() {

        let registerpage = this
        let fieldMessages = registerpage.props.register.fieldMessages || {}
        // console.log('fieldMessages = ',fieldMessages)

        let elements: Array<elementProps> = [
            {
                index: 'email',
                floatingLabelText: 'Email Address',
                hintText: "enter unique email (required)",
                // defaultValue: 'henrik@bechmann.ca',
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
                defaultValue: DEFAULT_PARTICIPATION,
                type: 'text',
                disabled: true,
            },
            {
                index: 'password',
                floatingLabelText: 'Password',
                hintText: "between 6 and 12 characters",
                type: 'password',
                required: true,
                errorText: fieldMessages['password'],
            },
            {
                index: 'password2',
                floatingLabelText: 'Password (Again)',
                hintText: "between 6 and 12 characters",
                type: 'password',
                required: true,
                errorText: fieldMessages['password2'],
            },
            {
                index: 'intro',
                floatingLabelText: 'Introduction',
                hintText: "something about yourself for other members (optional)",
                multiLine: true,
                rows: 4,
                errorText: fieldMessages['intro'],
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