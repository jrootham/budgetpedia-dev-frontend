// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// register.tsx

import * as React from 'react' // required by bundler
var { Component } = React
import { connect as injectStore} from 'react-redux'
import * as Actions from '../actions/actions'

import Card = require('material-ui/lib/card/card')
import CardText = require('material-ui/lib/card/card-text')
import CardTitle = require('material-ui/lib/card/card-title')

class RegisterPendingClass extends Component<any, any> {
    // respond to login form; assume error correction
    render() {

        let registerpendingpage = this
        let auth = registerpendingpage.props.auth
        let register = registerpendingpage.props.register
        let registerpending = 
            auth.isAuthenticated
            ? 
            <div>
                <p>
                    {auth.user.username}, you're already registered.
                </p>
            </div >
            : register.isRegistered
            ? 
            <div>
                <p>
                    Thanks for registering, {register.user.username}!
                </p>
                <p>
                    An email has been sent to
                    the address you used to register. Please follow the instructions in this email
                    to authenticate and complete your registration.
                </p>
            </div>
            : 
            <div>
                <p>
                    No registration data is available.
                </p>
            </div>
        return <Card style={{ margin: "5px" }} >

            <CardTitle title = "Registration Pending" style={{ paddingBottom: 0 }} />
            <CardText>

                { registerpending }

            </CardText>
        </Card>
    }
}

function mapStateToProps(state) {

    let { auth, register } = state

    return {

        state,
        auth,
        register,
    }

}

var RegisterPending: typeof RegisterPendingClass = injectStore(mapStateToProps)(RegisterPendingClass)

export { RegisterPending }