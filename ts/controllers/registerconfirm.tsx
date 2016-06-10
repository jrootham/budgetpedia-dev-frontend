// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// register.tsx

/*
    TODO: autologin after successful registration

*/

import * as React from 'react' // required by bundler
var { Component } = React
import { connect as injectStore} from 'react-redux'
import * as Actions from '../actions/actions'

import { Card, CardText, CardTitle} from 'material-ui/Card'

class RegisterConfirmClass extends Component<any, any> {

    componentWillMount = () => {
        this.props.dispatch(Actions.confirmUser())
    }
    render() {

        let registerconfirmpage = this
        let auth = registerconfirmpage.props.auth
        let registerconfirm = registerconfirmpage.props.registerconfirm
        let registerconfirmview = 
            <div>
                {(registerconfirm.isFetching || registerconfirm.isConfirmed)
                ? 
                <div>
                    <p>
                        Confirming registration...
                    </p>
                </div>
                :''} 
                { registerconfirm.isConfirmed
                    ? <div><p>
                        Registration succeeded {registerconfirm.user.username}!
                    </p></div>
                    :''
                }
                { registerconfirm.errorMessage
                    ?
                <div>
                    <p>
                        The registration confirmation returned the following error message: 
                        <span style={{fontStyle:"italic"}}>{registerconfirm.errorMessage}</span>
                    </p>
                </div>:''
                }
                {(registerconfirm.isConfirmed && auth.isAuthenticated)
                ?
                <div>
                    <p>
                        {auth.profile.username}, you have been automatically logged in.
                    </p>
                </div >
                : ''
                }
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
        registerconfirm,
        
    }

}

var RegisterConfirm: typeof RegisterConfirmClass = injectStore(mapStateToProps)(RegisterConfirmClass)

export default RegisterConfirm
