// general.d.ts

declare module 'react-router/es6/index' {
    var withRouter: Function
    export { withRouter }
}

interface Window {
    nodeUpdateControl: {
        nodeuid: string,
        new: boolean,
    }
}

