// general.d.ts

declare module 'react-router/es6/index' {
    var withRouter: Function
    export { withRouter }
}

// declare module 'react-alert' {
//     var AlertContainer: any
//     export default AlertContainer
// }

interface Window {
    nodeUpdateControl: {
        nodeuid: string,
        new: boolean,
    }
}

