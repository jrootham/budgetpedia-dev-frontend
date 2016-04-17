// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// register.tsx

/*
    TODO: autologin after successful registration

*/

import * as React from 'react' // required by bundler
var { Component } = React
import { connect as injectStore} from 'react-redux'
import * as Actions from '../actions/actions'

import Card = require('material-ui/lib/card/card')
import CardText = require('material-ui/lib/card/card-text')
import CardTitle = require('material-ui/lib/card/card-title')

class RegisterConfirmClass extends Component<any, any> {

    componentDidMount = () => {
        this.props.dispatch(Actions.confirmUser())
    }
    render() {

        let registerconfirmpage = this
        let auth = registerconfirmpage.props.auth
        let registerconfirm = registerconfirmpage.props.registerconfirm
        let registerconfirmview = 
            auth.isAuthenticated
            ? 
            <div>
                <p>
                    {auth.profile.username}, your registation has been confirmed, and you are logged in.
                </p>
            </div >
            : registerconfirm.isConfirmed
            ? 
            <div>
                <p>
                    Thanks for confirming your registration, {registerconfirm.user.username}!
                </p>
                <p>
                    Automatic login did not occur, however. Please try logging in.
                </p>
            </div>
            : 
            <div>
                <p>
                    The registration confirmation did not succeed, with the following error message: 
                    <span style={{fontStyle:"italic"}}>{registerconfirm.errorMessage}</span>
                </p>
            </div>
        return <Card style={{ margin: "5px" }} >

            <CardTitle title = "Registration Confirmation" style={{ paddingBottom: 0 }} />
            <CardText>

                { registerconfirmview }

            </CardText>
        </Card>
    }
}

function mapStateToProps(state) {

    let { auth, register, registerconfirm } = state

    return {

        state,
        auth,
        register,
        registerconfirm,
        
    }

}

var RegisterConfirm: typeof RegisterConfirmClass = injectStore(mapStateToProps)(RegisterConfirmClass)

export { RegisterConfirm }
