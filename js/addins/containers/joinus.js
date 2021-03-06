"use strict";
const React = require('react');
const Card_1 = require('material-ui/Card');
var { Component } = React;
class JoinUs extends Component {
    render() {
        return React.createElement("div", null, 
            React.createElement(Card_1.Card, null, 
                React.createElement(Card_1.CardTitle, {title: "Join Us! Help us Make Budgetpedia Better!"}), 
                React.createElement(Card_1.CardText, null, "Budgetpedia is a volunteer-driven project.  We've gotten where we are thanks" + ' ' + "to people with a wide variety of backgrounds and expertise.  If you're" + ' ' + "interested in democratizing information on municipal budgets in Ontario," + ' ' + "we'd love to have you join us."), 
                React.createElement(Card_1.CardTitle, {title: "Getting Involved"}), 
                React.createElement(Card_1.CardText, null, 
                    React.createElement("h3", null, "Where and when"), 
                    "We have regular meetings at Civic Tech Toronto Hacknights. We'll be there the first" + ' ' + "Tuesday of the month (and possibly other Tuesdays as well). Never hurts to check at ", 
                    React.createElement("a", {target: "_blank", href: "mailto:mail@budgetpedia.ca"}, "mail@budgetpedia.ca"), 
                    " though" + ' ' + "just to make sure. Check with Civic Tech TO ", 
                    React.createElement("a", {target: "_blank", href: "http://www.meetup.com/Civic-Tech-Toronto/"}, "meetup"), 
                    " for locations." + ' ' + "Or just email us your interests and we'll take it from there."), 
                React.createElement(Card_1.CardText, null, 
                    React.createElement("h3", null, "How"), 
                    React.createElement("p", null, "These are the main working groups we've set up. Feel free to get involved" + ' ' + "with one of them.  Or suggest something else you'd like to do.  We're" + ' ' + "pretty flexible."), 
                    React.createElement("ul", null, 
                        React.createElement("li", null, 
                            React.createElement("strong", null, "Research"), 
                            React.createElement("br", null), 
                            React.createElement("p", null, "Like data?  Interested in sifting through municipal budgets and" + ' ' + "open data sets?  This is a key area we can use help. "), 
                            React.createElement("p", null, "Specific things we could use help with:"), 
                            React.createElement("ul", {style: { marginBottom: "16px" }}, 
                                React.createElement("li", null, "Research planning"), 
                                React.createElement("li", null, "Identifying, sifting through, and preparing muncipal data sets"), 
                                React.createElement("li", null, "Validating and verifying the data (QA); eventually arranging for an audit"), 
                                React.createElement("li", null, "Helping explain municipal budget data"), 
                                React.createElement("li", null, "Visualization"))), 
                        React.createElement("li", null, 
                            React.createElement("strong", null, "Web Development"), 
                            React.createElement("p", null, 
                                "Budgetpedia is an open source project, and we welcome contributions." + ' ' + "The codebase is on ", 
                                React.createElement("a", {href: "https://github.com/CivicTechTO/budgetpedia-dev-frontend"}, "Github"), 
                                "." + ' ' + "The main areas of work are:"), 
                            React.createElement("ul", {style: { marginBottom: "16px" }}, 
                                React.createElement("li", null, "Developing and maintaining a software development plan."), 
                                React.createElement("li", null, "Enhancing the front-end (it really needs an admin interface for example)"), 
                                React.createElement("li", null, "Enhancing the backend, starting with migrating the data from source files to databases;" + ' ' + "supporting login, logout, and content management")), 
                            React.createElement("p", null, "Technical details are as follows:"), 
                            React.createElement("ul", {style: { marginBottom: "16px" }}, 
                                React.createElement("li", null, 
                                    "Main frontend components:", 
                                    React.createElement("ul", {style: { marginBottom: "8px" }}, 
                                        React.createElement("li", null, "typescript (language - es6 superset, strongly typed)"), 
                                        React.createElement("li", null, "reactjs (rendering)"), 
                                        React.createElement("li", null, "redux (model/state manager)"), 
                                        React.createElement("li", null, "fetch (ajax)"), 
                                        React.createElement("li", null, "material-ui for widgets, a Google Material Design implementation"))), 
                                React.createElement("li", null, 
                                    "Main backend components (for next phase):", 
                                    React.createElement("ul", {style: { marginBottom: "8px" }}, 
                                        React.createElement("li", null, "nodejs environment on server"), 
                                        React.createElement("li", null, "nginx for web server"), 
                                        React.createElement("li", null, "hapijs for api handler"), 
                                        React.createElement("li", null, "available databases: mariadb (relational), mongodb (aggregates), neo4j (graphs)"))))), 
                        React.createElement("li", null, 
                            React.createElement("strong", null, "Communications"), 
                            React.createElement("br", null), 
                            React.createElement("p", null, "Numbers are nice but it's the stories that matter to most people."), 
                            React.createElement("p", null, "Help us explain what's going on in the budget;" + ' ' + "Help spread the word about budgetpedia;" + ' ' + "Help us build partnerships with other people and organizations who care" + ' ' + "about municipal budgets."), 
                            React.createElement("p", null, "Some of the specific things we're working on include:"), 
                            React.createElement("ul", {style: { marginBottom: "16px" }}, 
                                React.createElement("li", null, "Social media communication and outreach"), 
                                React.createElement("li", null, "Developing budget literacy programs"), 
                                React.createElement("li", null, "Supporting collaboartion among users"), 
                                React.createElement("li", null, "Content generation: blogs, long-form prose, etc.  Pull apart" + ' ' + "the budget and show us the stories that are there.  Let your" + ' ' + "inner Nate Silver shine!"))), 
                        React.createElement("li", null, 
                            React.createElement("strong", null, "Management"), 
                            React.createElement("br", null), 
                            React.createElement("p", null, "This is the group tasked with looking after Budgetpedia's future."), 
                            React.createElement("ul", {style: { marginBottom: "16px" }}, 
                                React.createElement("li", null, "Developing a management plan"), 
                                React.createElement("li", null, "Organizational development"), 
                                React.createElement("li", null, "Government relations"), 
                                React.createElement("li", null, "Funding, including grants and possibly a service-for-fee plan"))), 
                        React.createElement("li", null, 
                            React.createElement("strong", null, "Advisory Board"), 
                            React.createElement("br", null), 
                            React.createElement("p", null, "We'd really like to develop an advisory board to help guide the project, and develop connections among user groups.")))), 
                React.createElement(Card_1.CardText, null, 
                    React.createElement("h3", null, "Who"), 
                    React.createElement("p", null, "These are just a few of the people involved in Budgetpedia.  If you've got" + ' ' + "questions, or want to know more, please reach out to one of us."), 
                    React.createElement("div", {style: { border: "1px solid silver", margin: "6px 3px", padding: "3px", borderRadius: "8px" }}, 
                        React.createElement("img", {src: "./public/avatars/HenrikHeadshotSquare.jpg", style: { borderRadius: "50%", float: "left", height: "40px", marginRight: "3px" }}), 
                        React.createElement("p", null, 
                            "Henrik Bechmann is the project lead and lead developer. ", 
                            React.createElement("a", {href: "mailto:henrik@budgetpedia.ca", target: "_blank"}, "henrik@budgetpedia.ca")), 
                        React.createElement("div", {style: { clear: "left" }}))))
        );
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = JoinUs;
