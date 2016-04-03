'use strict';
const React = require('react');
const MenuItem = require('material-ui/lib/menus/menu-item');
class MenuTile extends React.Component {
    constructor(props) {
        super(props);
        this.transitionTo = (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.props.transitionTo(this.props.route);
        };
    }
    render() {
        let tile = this;
        return (React.createElement(MenuItem, {onTouchTap: tile.transitionTo, key: this.props.key, primaryText: this.props.primaryText, leftIcon: React.createElement("img", {src: this.props.image})}));
    }
}
exports.MenuTile = MenuTile;
