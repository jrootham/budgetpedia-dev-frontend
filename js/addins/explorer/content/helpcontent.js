"use strict";
const React = require('react');
const Card_1 = require('material-ui/Card');
const SvgIcon_1 = require('material-ui/SvgIcon');
const FontIcon_1 = require('material-ui/FontIcon');
let content = React.createElement("div", null, React.createElement(Card_1.Card, null, React.createElement(Card_1.CardText, null, "The best way to become familiar with the explorer is to ", React.createElement("span", {style: { fontStyle: 'italic' }}, "play with it"), " (experiment)." + ' ' + "Once in a while, review the lists below. Click on any title below for details.")), React.createElement(Card_1.Card, null, React.createElement(Card_1.CardTitle, {actAsExpander: true, showExpandableButton: true}, "Dataset Options"), React.createElement(Card_1.CardText, {expandable: true, style: { paddingTop: "0px" }}, React.createElement("p", null, "There are several dataset options available for charts:"), React.createElement("ul", null, React.createElement("li", null, React.createElement("strong", null, "Viewpoint:"), " broad approaches to budget (or actual) data, based on similar" + ' ' + "classification schemes (taxonomies), and data sources."), React.createElement("li", null, React.createElement("strong", null, "Version:"), " alternate detailed datasets available for the selected Viewpoint"), React.createElement("li", null, React.createElement("strong", null, "Aspect:"), " particular aspects of the dataset, such as Revenue, Expenses or Staffing"), React.createElement("li", null, React.createElement("strong", null, "By Unit:"), " the beginnings of diagnostic analytics, using simple math to view the" + ' ' + "data compared with relevant related metrics, such as per person or per household"), React.createElement("li", null, React.createElement("strong", null, "Inflation adjusted:"), " the datasets are updated annually to reflect the Bank of" + ' ' + "Canada's Inflation Calculator. This makes it possible to get historical perspectives that are" + ' ' + "meaningful in today's dollar terms.")), React.createElement("p", null, "Choices for the selections are interdependent. Toronto budgets have similar classifications for" + ' ' + "Revenue and Expenses for example, and therefore these can be viewed together (as offered by the", React.createElement("em", null, "paired"), " and ", React.createElement("em", null, "net"), " Aspects). Financial statements" + ' ' + "on the other hand do not have similar classifications for Revenue and Expenses."), React.createElement("hr", null), React.createElement("p", null, React.createElement("strong", null, React.createElement("em", null, "Viewpoint")), " choices include:"), React.createElement("dl", null, React.createElement("dt", null, React.createElement("strong", null, "Budget (by function)")), React.createElement("dd", null, "combines City of Toronto Agencies and Divisions into groups according to the nature of" + ' ' + "the services delivered (this is the default). The classification scheme above the" + ' ' + "Division/Agency level was developed by Budgetpedia project contributors."), React.createElement("dt", null, React.createElement("strong", null, "Budget (by structure)")), React.createElement("dd", null, "more traditional: separates Agencies from Divisions, and generally by organizational" + ' ' + "structures. Groupings are closer to those found in City annual Budget Summaries."), React.createElement("dt", null, React.createElement("strong", null, "Consolidated Statements")), React.createElement("dd", null, "This reporting structure is manadated by the province (and GAAP -- Generally Accepted" + ' ' + "Accounting Principles), is functional, and is comparable to other municipalities in the" + ' ' + "province. Summary groupings above the statment level are added by the Budgetpedia project" + ' ' + "for easier access."), React.createElement("dt", null, React.createElement("strong", null, "Expenses by Object")), React.createElement("dd", null, "Expenses by Object is a restatement of expenses by object of expenditure, such as materials," + ' ' + "or Wages & Salaries. These categories cross all Divisions and Agencies, and therefore provide a" + ' ' + "general picture of the ways that money is spent.")), React.createElement("hr", null), React.createElement("p", null, React.createElement("strong", null, React.createElement("em", null, "Version")), " choices depend on the Viewpoint that is chosen."), React.createElement("p", null, React.createElement("em", null, "For Viewpoint = Budget (both functional and structural), Versions"), " include:"), React.createElement("blockquote", null, React.createElement("ul", null, React.createElement("li", null, "Summary"), React.createElement("li", null, "Detail (PBF)"), React.createElement("li", null, "Variance Reports")), React.createElement("p", null, React.createElement("em", null, "PBF"), " stands for ", React.createElement("em", null, "Public Budget Formulation Tool"), " which is part of the City's new" + ' ' + "FPARS (Financial Planning Analysis and Reporting System) system")), React.createElement("p", null, React.createElement("em", null, "For Viewpoint = Consolidated Statements, Versions"), " include:"), React.createElement("blockquote", null, React.createElement("ul", null, React.createElement("li", null, "Consolidated Statements"), React.createElement("li", null, "Financial Information Returns")), React.createElement("p", null, "FIR for MMAH = Financial Information Returns for the Ontario Ministry of Municipal Affairs" + ' ' + "and Housing.")), React.createElement("hr", null), React.createElement("p", null, React.createElement("strong", null, React.createElement("em", null, "Aspect")), " choices depend on the Viewpoint and Version that is chosen."), React.createElement("p", null, React.createElement("em", null, "For Viewpoint = Budget (both functional and structural), Version = Summary or Detailed," + ' ' + "Aspects"), " include:"), React.createElement("blockquote", null, React.createElement("ul", null, React.createElement("li", null, "Revenue"), React.createElement("li", null, "Expenses"), React.createElement("li", null, "Both, paired"), React.createElement("li", null, "Net"), React.createElement("li", null, "Staffing")), React.createElement("p", null, " All of these are based on City documents which have similar line items across all aspects. This" + ' ' + "makes the figures from all sources comparable.")), React.createElement("p", null, React.createElement("em", null, "For Viewpoint = Consolidated Statements, any Version, Aspects"), " include:"), React.createElement("blockquote", null, React.createElement("ul", null, React.createElement("li", null, "Revenue (actual)"), React.createElement("li", null, "Revenue (budget)"), React.createElement("li", null, "Revenue (both actual & budget)"), React.createElement("li", null, "Expenses (actual)"), React.createElement("li", null, "Expenses (budget)"), React.createElement("li", null, "Expenses (both actual & budget)")), React.createElement("p", null, "The classification schemes for these are different for each, and therefore they cannot be" + ' ' + "combined.")), React.createElement("p", null, React.createElement("em", null, "For Viewpoint = Expenses by Object, Version = Consolidated Statements, Aspects"), " include:"), React.createElement("blockquote", null, React.createElement("ul", null, React.createElement("li", null, "Expenses")), React.createElement("p", null, "These come from notes to the audited financial statements.")), React.createElement("p", null, React.createElement("em", null, "For Viewpoint = Budget (both functional and structural), Version = Variance reports," + ' ' + "Aspects"), " include:"), React.createElement("blockquote", null, React.createElement("ul", null, React.createElement("li", null, "Revenue", React.createElement("ul", null, React.createElement("li", null, "Budget Revenue"), React.createElement("li", null, "Actual Revenue"), React.createElement("li", null, "Both Budget & Actual Revenues, paired"))), React.createElement("li", null, "Expenses", React.createElement("ul", null, React.createElement("li", null, "Budget Expenses"), React.createElement("li", null, "Actual Expenses"), React.createElement("li", null, "Both Budget & Actual Expenses, paired"))), React.createElement("li", null, "Both (Revenue & Expenses)", React.createElement("ul", null, React.createElement("li", null, "Budget Revenue & Expenses, paired"), React.createElement("li", null, "Actual Revenue & Expenses, paired"), React.createElement("li", null, "Both Budget Revenue & Expenses, paired, and Actual Revenue & Expenses, paired"))), React.createElement("li", null, "Staffing", React.createElement("ul", null, React.createElement("li", null, "Budget Staffing"), React.createElement("li", null, "Actual Staffing"), React.createElement("li", null, "Both Budget & Actual Staffing, paired")))), React.createElement("p", null, "When items are paired, net (revenue - expenses) and variance (actual - budget) amounts can be selected for each chart.")), React.createElement("hr", null), React.createElement("p", null, React.createElement("strong", null, React.createElement("em", null, "By Unit")), " choices are common for all other choices, and include:"), React.createElement("blockquote", null, React.createElement("ul", null, React.createElement("li", null, "Per staffing position"), React.createElement("li", null, "Population: per person"), React.createElement("li", null, "Population: per 100,000 people"), React.createElement("li", null, "Per household"))), React.createElement("hr", null), React.createElement("p", null, React.createElement("strong", null, React.createElement("em", null, "Inflation adjusted")), " is on by default, but can be turned off. This uses" + ' ' + "the Bank of Canada's Inflation Calculator to adjust historical figures in terms of recent" + ' ' + "currency valuations, for more meaningful trend analysis."))), React.createElement(Card_1.Card, null, React.createElement(Card_1.CardTitle, {actAsExpander: true, showExpandableButton: true}, "Chart Options"), React.createElement(Card_1.CardText, {expandable: true, style: { paddingTop: "0px" }}, React.createElement("p", null, " Chart options vary according to the time options selected. The time options available are:"), React.createElement("ul", null, React.createElement("li", null, React.createElement(SvgIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle"
}, viewBox: "0 0 36 36"}, React.createElement("rect", {x: "13", y: "13", width: "10", height: "10"})), " One year (default). Select a specific year to investigate."), React.createElement("li", null, React.createElement(SvgIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle"
}, viewBox: "0 0 36 36"}, React.createElement("rect", {x: "4", y: "13", width: "10", height: "10"}), React.createElement("rect", {x: "22", y: "13", width: "10", height: "10"})), " Two years. Allows data for two years to be presented side by side for comparison."), React.createElement("li", null, React.createElement(SvgIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle"
}, viewBox: "0 0 36 36"}, React.createElement("ellipse", {cx: "6", cy: "18", rx: "4", ry: "4"}), React.createElement("ellipse", {cx: "18", cy: "18", rx: "4", ry: "4"}), React.createElement("ellipse", {cx: "30", cy: "18", rx: "4", ry: "4"})), " All years (all available years). Shows all available years to investigate trends.")), React.createElement("p", null, "Specific years can be selected in the selection boxes under the charts."), React.createElement("hr", null), React.createElement("p", null, React.createElement(SvgIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle"
}, viewBox: "0 0 36 36"}, React.createElement("rect", {x: "13", y: "13", width: "10", height: "10"})), " Chart options when one year is chose include:"), React.createElement("ul", null, React.createElement("li", null, React.createElement(FontIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle",
    fontSize: "18px",
}, className: "material-icons"}, "insert_chart"), " Column Chart. This shows the basics" + ' ' + "of the components of the chart. Float the mouse over the column to see the number," + ' ' + "or click on a column to drill down."), React.createElement("li", null, React.createElement(FontIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle",
    fontSize: "18px",
}, className: "material-icons"}, "donut_small"), " Donut Chart. This shows the percentages of each" + ' ' + "number in relation to the whole."), React.createElement("li", null, React.createElement(FontIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle",
    fontSize: "18px",
}, className: "material-icons"}, "view_quilt"), " Context Chart. This is a Tablemap chart," + ' ' + "which shows the current chart as a proportion of the overall top-level budget.")), React.createElement("hr", null), React.createElement("p", null, React.createElement(SvgIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle"
}, viewBox: "0 0 36 36"}, React.createElement("rect", {x: "4", y: "13", width: "10", height: "10"}), React.createElement("rect", {x: "22", y: "13", width: "10", height: "10"})), " Chart options when two years is chose include:"), React.createElement("ul", null, React.createElement("li", null, React.createElement(FontIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle",
    fontSize: "18px",
}, className: "material-icons"}, "insert_chart"), " Column Chart. This is the only" + ' ' + "style of chart offered with the two year selection."), React.createElement("li", null, React.createElement(FontIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle",
    fontSize: "18px",
}, className: "material-icons"}, "change_history"), " Year-over-year toggle. This shows the differences" + ' ' + "between the two years chosen."), React.createElement("li", null, React.createElement(FontIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle",
    fontSize: "18px",
}, className: "material-icons"}, "exposure"), " Net toggle. When paired revenue and expenses is the" + ' ' + "Aspect chosen, this toggle combines the two into net figures."), React.createElement("li", null, React.createElement(FontIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle",
    fontSize: "18px",
}, className: "material-icons"}, "exposure"), " Variance toggle. When paired budget and actual is the" + ' ' + "Aspect chosen, this toggle combines the two into variance figures.")), React.createElement("hr", null), React.createElement("p", null, React.createElement(SvgIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle"
}, viewBox: "0 0 36 36"}, React.createElement("rect", {x: "4", y: "13", width: "10", height: "10"}), React.createElement("rect", {x: "22", y: "13", width: "10", height: "10"})), " Chart options when all years is chose include:"), React.createElement("ul", null, React.createElement("li", null, React.createElement(FontIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle",
    fontSize: "18px",
}, className: "material-icons"}, "timeline"), " Line Chart. Basic time lines"), React.createElement("li", null, React.createElement(SvgIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle"
}}, React.createElement("path", {d: "M20,6c0-0.587-0.257-1.167-0.75-1.562c-0.863-0.69-2.121-0.551-2.812,0.312l-2.789,3.486L11.2,6.4  c-0.864-0.648-2.087-0.493-2.762,0.351l-4,5C4.144,12.119,4,12.562,4,13v3h16V6z"}), React.createElement("path", {d: "M20,19H4c-0.552,0-1,0.447-1,1s0.448,1,1,1h16c0.552,0,1-0.447,1-1S20.552,19,20,19z"})), " Area Chart. Same data as timelines, but stacked."), React.createElement("li", null, React.createElement(FontIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle",
    fontSize: "18px",
}, className: "material-icons"}, "view_stream"), " Proportional Chart. All lines add to 100%;" + ' ' + "individual amounts are shown in proportion to the whole."), React.createElement("li", null, React.createElement(FontIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle",
    fontSize: "18px",
}, className: "material-icons"}, "change_history"), " Year-over-year toggle. This shows the differences" + ' ' + "between adjacent years on a rolling basis."), React.createElement("li", null, React.createElement(FontIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle",
    fontSize: "18px",
}, className: "material-icons"}, "exposure"), " Net toggle. When paired revenue and expenses is the" + ' ' + "Aspect chosen, this toggle is set and net figures (revenue - expenses) are shown."), React.createElement("li", null, React.createElement(FontIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle",
    fontSize: "18px",
}, className: "material-icons"}, "exposure"), " Variance toggle. When paired budget and actual is the" + ' ' + "Aspect chosen, this toggle is set and variance figures (budget - actual) are shown.")))), React.createElement(Card_1.Card, null, React.createElement(Card_1.CardTitle, {actAsExpander: true, showExpandableButton: true}, "Context Options"), React.createElement(Card_1.CardText, {expandable: true, style: { paddingTop: "0px" }}, "context options content")), React.createElement(Card_1.Card, null, React.createElement(Card_1.CardTitle, {actAsExpander: true, showExpandableButton: true}, "Cloning Features"), React.createElement(Card_1.CardText, {expandable: true, style: { paddingTop: "0px" }}, "cloning features content")), React.createElement(Card_1.Card, null, React.createElement(Card_1.CardTitle, {actAsExpander: true, showExpandableButton: true}, "Actionable Features"), React.createElement(Card_1.CardText, {expandable: true, style: { paddingTop: "0px" }}, "actionable features content")), React.createElement(Card_1.Card, null, React.createElement(Card_1.CardTitle, {actAsExpander: true, showExpandableButton: true}, "Assembling and printing reports"), React.createElement(Card_1.CardText, {expandable: true, style: { paddingTop: "0px" }}, "assembling and printing reports content")), React.createElement(Card_1.Card, null, React.createElement(Card_1.CardTitle, {actAsExpander: true, showExpandableButton: true}, "Saving and sharing workspaces"), React.createElement(Card_1.CardText, {expandable: true, style: { paddingTop: "0px" }}, "saving and sharing workspaces content")));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = content;
