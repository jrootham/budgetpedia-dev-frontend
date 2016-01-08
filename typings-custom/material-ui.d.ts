// typings-custom/material-ui.d.ts
// follows pattern established in ../typings/material-ui/material-us.d.ts

///<reference path='../typings/react/react.d.ts' />

// the following not needed here, apparently repetative
// declare module "material-ui" {
// }

declare namespace __MaterialUI {
    import React = __React;
    export namespace Icons {
        export import NavigationClose = __MaterialUI.NavigationClose;
        export import MoreVertIcon = __MaterialUI.MoreVertIcon;
	}
    interface NavigationCloseProps extends React.Props<NavigationClose> {
    }
    export class NavigationClose extends React.Component<NavigationCloseProps, {}> {
    }
    interface MoreVertIconProps extends React.Props<MoreVertIcon> {
    }
    export class MoreVertIcon extends React.Component<MoreVertIconProps, {}> {
    }
}
declare module 'material-ui/lib/svg-icons/navigation/close' {
    import NavigationClose = __MaterialUI.NavigationClose;
    export = NavigationClose;
}
declare module 'material-ui/lib/svg-icons/navigation/more-vert' {
    import MoreVertIcon = __MaterialUI.MoreVertIcon;
    export = MoreVertIcon;
}
