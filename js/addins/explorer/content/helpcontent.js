"use strict";
const React = require('react');
const Card_1 = require('material-ui/Card');
const SvgIcon_1 = require('material-ui/SvgIcon');
const FontIcon_1 = require('material-ui/FontIcon');
let content = React.createElement("div", null, React.createElement(Card_1.Card, null, React.createElement(Card_1.CardText, null, "The best way to become familiar with the explorer is to ", React.createElement("span", {style: { fontStyle: 'italic' }}, "play with it"), " (experiment)." + ' ' + "Once in a while, review the lists below. Click on any title below for details.")), React.createElement(Card_1.Card, null, React.createElement(Card_1.CardTitle, {actAsExpander: true, showExpandableButton: true}, "Dataset Options"), React.createElement(Card_1.CardText, {expandable: true, style: { paddingTop: "0px" }}, React.createElement("p", null, "There are several dataset options available for charts:"), React.createElement("dl", null, React.createElement("dt", null, React.createElement("strong", null, "Viewpoint")), React.createElement("dd", null, " broad approaches to budget (or actual) data, based on similar" + ' ' + "classification schemes (taxonomies), and data sources."), React.createElement("dt", null, React.createElement("strong", null, "Version")), React.createElement("dd", null, " alternate detailed datasets available for the selected Viewpoint"), React.createElement("dt", null, React.createElement("strong", null, "Aspect")), React.createElement("dd", null, " particular aspects of the dataset, such as Revenue, Expenses or Staffing"), React.createElement("dt", null, React.createElement("strong", null, "By Unit")), React.createElement("dd", null, " the beginnings of diagnostic analytics, using simple math to view the" + ' ' + "data compared with relevant related metrics, such as per person or per household"), React.createElement("dt", null, React.createElement("strong", null, "Inflation adjusted")), React.createElement("dd", null, " the datasets are updated annually to reflect the Bank of" + ' ' + "Canada's Inflation Calculator. This makes it possible to get historical perspectives that are" + ' ' + "meaningful in today's dollar terms.")), React.createElement("p", null, "Choices for the selections are interdependent. Toronto budgets have similar classifications for" + ' ' + "Revenue and Expenses for example, and therefore these can be viewed together (as offered by the", React.createElement("em", null, "paired"), " and ", React.createElement("em", null, "net"), " Aspects). Financial statements" + ' ' + "on the other hand do not have similar classifications for Revenue and Expenses."), React.createElement("hr", null), React.createElement("p", null, React.createElement("strong", null, React.createElement("em", null, "Viewpoint")), " choices include:"), React.createElement("dl", null, React.createElement("dt", null, React.createElement("strong", null, "Budget (by function)")), React.createElement("dd", null, "combines City of Toronto Agencies and Divisions into groups according to the nature of" + ' ' + "the services delivered (this is the default). The classification scheme above the" + ' ' + "Division/Agency level was developed by Budgetpedia project contributors."), React.createElement("dt", null, React.createElement("strong", null, "Budget (by structure)")), React.createElement("dd", null, "more traditional: separates Agencies from Divisions, and generally by organizational" + ' ' + "structures. Groupings are closer to those found in City annual Budget Summaries."), React.createElement("dt", null, React.createElement("strong", null, "Consolidated Statements")), React.createElement("dd", null, "This reporting structure is manadated by the province (and GAAP -- Generally Accepted" + ' ' + "Accounting Principles), is functional, and is comparable to other municipalities in the" + ' ' + "province. Summary groupings above the statment level are added by the Budgetpedia project" + ' ' + "for easier access."), React.createElement("dt", null, React.createElement("strong", null, "Expenses by Object")), React.createElement("dd", null, "Expenses by Object is a restatement of expenses by object of expenditure, such as materials," + ' ' + "or Wages & Salaries. These categories cross all Divisions and Agencies, and therefore provide a" + ' ' + "general picture of the ways that money is spent.")), React.createElement("hr", null), React.createElement("p", null, React.createElement("strong", null, React.createElement("em", null, "Version")), " choices depend on the Viewpoint that is chosen."), React.createElement("dl", null, React.createElement("dt", null, React.createElement("em", null, "For Viewpoint = Budget (both functional and structural), Versions"), " include:"), React.createElement("dd", null, React.createElement("dl", null, React.createElement("dt", null, React.createElement("strong", null, "Summary")), React.createElement("dt", null, React.createElement("strong", null, "Detail (PBF)")), React.createElement("dt", null, React.createElement("strong", null, "Variance Reports")))), React.createElement("dd", null, React.createElement("em", null, "PBF"), " stands for ", React.createElement("em", null, "Public Budget Formulation Tool"), " which is part of the City's new" + ' ' + "FPARS (Financial Planning Analysis and Reporting System) system"), React.createElement("dt", {style: { marginTop: "20px" }}, React.createElement("em", null, "For Viewpoint = Consolidated Statements, Versions"), " include:"), React.createElement("dd", null, React.createElement("dl", null, React.createElement("dt", null, React.createElement("strong", null, "Consolidated Statements")), React.createElement("dt", null, React.createElement("strong", null, "Financial Information Returns")))), React.createElement("dd", null, "FIR for MMAH = Financial Information Returns for the Ontario Ministry of Municipal Affairs" + ' ' + "and Housing.")), React.createElement("hr", null), React.createElement("p", null, React.createElement("strong", null, React.createElement("em", null, "Aspect")), " choices depend on the Viewpoint and Version that is chosen."), React.createElement("dl", null, React.createElement("dt", null, React.createElement("em", null, "For Viewpoint = Budget (both functional and structural), Version = Summary or Detailed," + ' ' + "Aspects"), " include:"), React.createElement("dd", null, React.createElement("dl", null, React.createElement("dt", null, React.createElement("strong", null, "Revenue")), React.createElement("dt", null, React.createElement("strong", null, "Expenses")), React.createElement("dt", null, React.createElement("strong", null, "Both, paired")), React.createElement("dt", null, React.createElement("strong", null, "Staffing")))), React.createElement("dd", null, " All of these are based on City documents which have similar line items across all aspects. This" + ' ' + "makes the figures from all sources comparable."), React.createElement("dt", {style: { marginTop: "20px" }}, React.createElement("em", null, "For Viewpoint = Consolidated Statements, any Version, Aspects"), " include:"), React.createElement("dd", null, React.createElement("dl", null, React.createElement("dt", null, React.createElement("strong", null, "Revenue (actual)")), React.createElement("dt", null, React.createElement("strong", null, "Revenue (budget)")), React.createElement("dt", null, React.createElement("strong", null, "Revenue (both actual & budget)")), React.createElement("dt", null, React.createElement("strong", null, "Expenses (actual)")), React.createElement("dt", null, React.createElement("strong", null, "Expenses (budget)")), React.createElement("dt", null, React.createElement("strong", null, "Expenses (both actual & budget)")))), React.createElement("dd", null, "The classification schemes for these are different for each, and therefore they cannot be" + ' ' + "combined."), React.createElement("dt", {style: { marginTop: "20px" }}, React.createElement("em", null, "For Viewpoint = Expenses by Object, Version =" + ' ' + "Consolidated Statements, Aspects"), " include:"), React.createElement("dd", null, React.createElement("dl", null, React.createElement("dt", null, React.createElement("strong", null, "Expenses")))), React.createElement("dd", null, "These come from notes to the audited financial statements."), React.createElement("dt", {style: { marginTop: "20px" }}, React.createElement("em", null, "For Viewpoint = Budget (both functional and structural), Version = Variance reports," + ' ' + "Aspects"), " include:"), React.createElement("dd", null, React.createElement("dl", null, React.createElement("dt", null, React.createElement("strong", null, "Revenue")), React.createElement("dd", null, React.createElement("dl", null, React.createElement("dt", null, React.createElement("strong", null, "Budget Revenue")), React.createElement("dt", null, React.createElement("strong", null, "Actual Revenue")), React.createElement("dt", null, React.createElement("strong", null, "Both Budget & Actual Revenues, paired")))), React.createElement("dt", null, React.createElement("strong", null, "Expenses")), React.createElement("dd", null, React.createElement("dl", null, React.createElement("dt", null, React.createElement("strong", null, "Budget Expenses")), React.createElement("dt", null, React.createElement("strong", null, "Actual Expenses")), React.createElement("dt", null, React.createElement("strong", null, "Both Budget & Actual Expenses, paired")))), React.createElement("dt", null, React.createElement("strong", null, "Both (Revenue & Expenses)")), React.createElement("dd", null, React.createElement("dl", null, React.createElement("dt", null, React.createElement("strong", null, "Budget Revenue & Expenses, paired")), React.createElement("dt", null, React.createElement("strong", null, "Actual Revenue & Expenses, paired")), React.createElement("dt", null, React.createElement("strong", null, "Both Budget Revenue & Expenses, paired, and Actual Revenue & Expenses, paired")))), React.createElement("dt", null, React.createElement("strong", null, "Staffing")), React.createElement("dd", null, React.createElement("dl", null, React.createElement("dt", null, React.createElement("strong", null, "Budget Staffing")), React.createElement("dt", null, React.createElement("strong", null, "Actual Staffing")), React.createElement("dt", null, React.createElement("strong", null, "Both Budget & Actual Staffing, paired")))))), React.createElement("dd", null, "When items are paired, net (revenue - expenses) and variance (actual - budget)" + ' ' + "amounts can be selected through ", React.createElement("em", null, "Chart Options"), " on each chart.")), React.createElement("hr", null), React.createElement("p", null, React.createElement("strong", null, React.createElement("em", null, "By Unit")), " choices are common for all other choices, and include:"), React.createElement("dl", null, React.createElement("dd", null, React.createElement("dl", null, React.createElement("dt", null, React.createElement("strong", null, "Per staffing position")), React.createElement("dt", null, React.createElement("strong", null, "Population: per person")), React.createElement("dt", null, React.createElement("strong", null, "Population: per 100,000 people")), React.createElement("dt", null, React.createElement("strong", null, "Per household"))))), React.createElement("hr", null), React.createElement("p", null, React.createElement("strong", null, React.createElement("em", null, "Inflation adjusted")), " is on by default, but can be turned off."), React.createElement("dl", null, React.createElement("dd", null, "This uses" + ' ' + "the Bank of Canada's Inflation Calculator to adjust historical figures in terms of recent" + ' ' + "currency valuations, for more meaningful trend analysis.")))), React.createElement(Card_1.Card, null, React.createElement(Card_1.CardTitle, {actAsExpander: true, showExpandableButton: true}, "Chart Options"), React.createElement(Card_1.CardText, {expandable: true, style: { paddingTop: "0px" }}, React.createElement("p", null, " Chart options vary according to the time options selected. The time options available are:"), React.createElement("dl", null, React.createElement("dt", null, React.createElement(SvgIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle"
}, viewBox: "0 0 36 36"}, React.createElement("rect", {x: "13", y: "13", width: "10", height: "10"})), " One year (default)"), React.createElement("dd", null, " Select a specific year to investigate."), React.createElement("dt", null, React.createElement(SvgIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle"
}, viewBox: "0 0 36 36"}, React.createElement("rect", {x: "4", y: "13", width: "10", height: "10"}), React.createElement("rect", {x: "22", y: "13", width: "10", height: "10"})), " Two years"), React.createElement("dd", null, " Allows data for two years to be presented side by side for comparison."), React.createElement("dt", null, React.createElement(SvgIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle"
}, viewBox: "0 0 36 36"}, React.createElement("ellipse", {cx: "6", cy: "18", rx: "4", ry: "4"}), React.createElement("ellipse", {cx: "18", cy: "18", rx: "4", ry: "4"}), React.createElement("ellipse", {cx: "30", cy: "18", rx: "4", ry: "4"})), " All years (all available years)"), React.createElement("dd", null, " Shows all available years to investigate trends.")), React.createElement("p", null, "Specific years can be selected in the selection dropdowns under the charts."), React.createElement("hr", null), React.createElement("dl", null, React.createElement("dt", null, React.createElement(SvgIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle"
}, viewBox: "0 0 36 36"}, React.createElement("rect", {x: "13", y: "13", width: "10", height: "10"})), " Chart options when one year is chosen include:"), React.createElement("dd", null, React.createElement("dl", null, React.createElement("dt", null, React.createElement(FontIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle",
    fontSize: "18px",
}, className: "material-icons"}, "insert_chart"), " Column Chart"), React.createElement("dd", null, " This shows the basics" + ' ' + "of the components of the chart. Float the mouse over the column to see the number," + ' ' + "or click on a column to drill down."), React.createElement("dt", null, React.createElement(FontIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle",
    fontSize: "18px",
}, className: "material-icons"}, "donut_small"), " Donut Chart"), React.createElement("dd", null, " This shows the percentages of each" + ' ' + "number in relation to the whole."), React.createElement("dt", null, React.createElement(FontIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle",
    fontSize: "18px",
}, className: "material-icons"}, "view_quilt"), " Context Chart "), React.createElement("dd", null, " This is a Tablemap chart," + ' ' + "which shows the current chart as a proportion of the overall top-level budget.")))), React.createElement("hr", null), React.createElement("dl", null, React.createElement("dt", null, React.createElement(SvgIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle"
}, viewBox: "0 0 36 36"}, React.createElement("rect", {x: "4", y: "13", width: "10", height: "10"}), React.createElement("rect", {x: "22", y: "13", width: "10", height: "10"})), " Chart options when two years is chosen include:"), React.createElement("dd", null, React.createElement("dl", null, React.createElement("dt", null, React.createElement(FontIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle",
    fontSize: "18px",
}, className: "material-icons"}, "insert_chart"), " Column Chart"), React.createElement("dd", null, " This is the only" + ' ' + "style of chart offered with the two year selection."), React.createElement("dt", null, React.createElement(FontIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle",
    fontSize: "18px",
}, className: "material-icons"}, "change_history"), " Year-over-year toggle"), React.createElement("dd", null, " This shows the differences" + ' ' + "between the two years chosen."), React.createElement("dt", null, React.createElement(FontIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle",
    fontSize: "18px",
}, className: "material-icons"}, "exposure"), " Net toggle"), React.createElement("dd", null, "When paired revenue and expenses is the" + ' ' + "Aspect chosen, this toggle combines the two into net figures."), React.createElement("dt", null, React.createElement(FontIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle",
    fontSize: "18px",
}, className: "material-icons"}, "exposure"), " Variance toggle"), React.createElement("dd", null, " When paired budget and actual is the" + ' ' + "Aspect chosen, this toggle combines the two into variance figures.")))), React.createElement("hr", null), React.createElement("dl", null, React.createElement("dt", null, React.createElement(SvgIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle"
}, viewBox: "0 0 36 36"}, React.createElement("rect", {x: "4", y: "13", width: "10", height: "10"}), React.createElement("rect", {x: "22", y: "13", width: "10", height: "10"})), " Chart options when all years is chosen include:"), React.createElement("dd", null, React.createElement("dl", null, React.createElement("dt", null, React.createElement(FontIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle",
    fontSize: "18px",
}, className: "material-icons"}, "timeline"), " Line Chart"), React.createElement("dd", null, " Basic time lines"), React.createElement("dt", null, React.createElement(SvgIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle"
}}, React.createElement("path", {d: "M20,6c0-0.587-0.257-1.167-0.75-1.562c-0.863-0.69-2.121-0.551-2.812,0.312l-2.789,3.486L11.2,6.4  c-0.864-0.648-2.087-0.493-2.762,0.351l-4,5C4.144,12.119,4,12.562,4,13v3h16V6z"}), React.createElement("path", {d: "M20,19H4c-0.552,0-1,0.447-1,1s0.448,1,1,1h16c0.552,0,1-0.447,1-1S20.552,19,20,19z"})), " Area Chart"), React.createElement("dd", null, " Same data as timelines, but stacked."), React.createElement("dt", null, React.createElement(FontIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle",
    fontSize: "18px",
}, className: "material-icons"}, "view_stream"), " Proportional Chart "), React.createElement("dd", null, " All lines add to 100%;" + ' ' + "individual amounts are shown in proportion to the whole."), React.createElement("dt", null, React.createElement(FontIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle",
    fontSize: "18px",
}, className: "material-icons"}, "change_history"), " Year-over-year toggle "), React.createElement("dd", null, " This shows the differences between adjacent years on a rolling basis."), React.createElement("dt", null, React.createElement(FontIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle",
    fontSize: "18px",
}, className: "material-icons"}, "exposure"), " Net toggle "), React.createElement("dd", null, " When paired revenue and expenses is the" + ' ' + "Aspect chosen, this toggle is set and net figures (revenue - expenses) are shown."), React.createElement("dt", null, React.createElement(FontIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle",
    fontSize: "18px",
}, className: "material-icons"}, "exposure"), " Variance toggle "), React.createElement("dd", null, " When paired budget and actual is the" + ' ' + "Aspect chosen, this toggle is set and variance figures (budget - actual) are shown.")))))), React.createElement(Card_1.Card, null, React.createElement(Card_1.CardTitle, {actAsExpander: true, showExpandableButton: true}, "Context Options"), React.createElement(Card_1.CardText, {expandable: true, style: { paddingTop: "0px" }}, React.createElement("p", null, " Context options are offered to provide contextual information for the data being viewed, and" + ' ' + "to afford the reader the opportunity to contribute to the process surrounding the budget. These" + ' ' + "are the options offered, found under each chart:"), React.createElement("dl", null, React.createElement("dt", null, React.createElement(FontIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle",
    fontSize: "18px",
}, className: "material-icons"}, "info_outline"), " The ", React.createElement("em", null, "information"), " icon"), React.createElement("dd", null, "invokes a dialog containing information related to the current" + ' ' + "data. This could be brief explanations, links to related information, or links to websites" + ' ' + "which specialize in the subject matter. The idea is to allow the reader to discover more context" + ' ' + "and detail about the subject matter at hand."), React.createElement("dt", null, React.createElement(FontIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle",
    fontSize: "18px",
}, className: "material-icons"}, "note"), " The ", React.createElement("em", null, "notes"), " icon"), React.createElement("dd", null, "invokes detailed technical information about the" + ' ' + "data presented, including source documents, exceptions, errors, and any relevant notes about the" + ' ' + "way the data was processed. If there are errors or exceptions in place, the note icon changes" + ' ' + "colour to red or orange, depending on severity."), React.createElement("dt", null, React.createElement(FontIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle",
    fontSize: "18px",
}, className: "material-icons"}, "share"), " The ", React.createElement("em", null, "share"), " icon "), React.createElement("dd", null, "provides access to relevant social media" + ' ' + "sites, to allow readers to read or contribute to discussion about the subject at hand."), React.createElement("dt", null, React.createElement(FontIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle",
    fontSize: "18px",
}, className: "material-icons"}, "announcement"), " The ", React.createElement("em", null, "announcement"), " icon"), React.createElement("dd", null, "provides the user with" + ' ' + "lists of calls to actions or meetings related to the subject matter, or to contribute their own" + ' ' + "call to action or meetings."), React.createElement("dt", null, React.createElement(FontIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle",
    fontSize: "18px",
}, className: "material-icons"}, "view_list"), " The ", React.createElement("em", null, "data"), " icon"), React.createElement("dd", null, "brings up the data underlying the currently viewed chart, with an option to download same."), React.createElement("dt", null, React.createElement(FontIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle",
    fontSize: "18px",
}, className: "material-icons"}, "swap_horiz"), " The ", React.createElement("em", null, "harmonize"), " icon"), React.createElement("dd", null, " allows the user to impose the" + ' ' + "settings made in the current chart onto the other charts in the row (", React.createElement("em", null, "Exhibit"), ").")))), React.createElement(Card_1.Card, null, React.createElement(Card_1.CardTitle, {actAsExpander: true, showExpandableButton: true}, "Cloning Features"), React.createElement(Card_1.CardText, {expandable: true, style: { paddingTop: "0px" }}, React.createElement("p", null, "The Budget Explorer organizes charts into horizontal drill-down sequences which we" + ' ' + "call ", React.createElement("em", null, "Exhibits"), ". We allow for cloning and re-ordering these exhibits to allow for comparison," + ' ' + "exploration, and publication. This clone contains all the option controls of the original. The" + ' ' + "clone is independent of the original."), React.createElement("dl", null, React.createElement("dt", null, React.createElement(FontIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle",
    fontSize: "18px",
}, className: "material-icons"}, "add_circle_outline"), " Add a clone of the current Exhibit"), React.createElement("dd", null, "This icon when invoked adds a clone of the current row of charts below the current row. ", React.createElement("em", null, "The plan is for the clone to reproduce all of the components and selections of the current" + ' ' + "row. However currently the cloning simply creates an initialized clone, containing only the" + ' ' + "highest level (left-most) chart, with default settings. Of course the original row's settings" + ' ' + "can be easily reproduced.")), React.createElement("dt", null, React.createElement(FontIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle",
    fontSize: "18px",
}, className: "material-icons"}, "remove_circle_outline"), " Remove the current Exhibit"), React.createElement("dd", null, "This icon when invoked removes the current row of charts (cannot currently be undone)."), React.createElement("dt", null, React.createElement(FontIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle",
    fontSize: "18px",
}, className: "material-icons"}, "arrow_upward"), " Move the current Exhibit up one position"), React.createElement("dd", null, "When mulitple rows (", React.createElement("em", null, "Exhibits"), ") exist, they can be re-ordered. The up arrow icon" + ' ' + "(to the upper right of the row title) moves the row up one position."), React.createElement("dt", null, React.createElement(FontIcon_1.default, {style: {
    height: "18px",
    width: "18px",
    padding: "0 3px",
    border: "1px solid silver",
    borderRadius: "5px",
    verticalAlign: "middle",
    fontSize: "18px",
}, className: "material-icons"}, "arrow_downward"), " Move the current Exhibit down one position"), React.createElement("dd", null, "When mulitple rows (", React.createElement("em", null, "Exhibits"), ") exist, they can be re-ordered. The down arrow icon" + ' ' + "(to the upper right of the row title) moves the row down one position.")))), React.createElement(Card_1.Card, null, React.createElement(Card_1.CardTitle, {actAsExpander: true, showExpandableButton: true}, "Actionable Features"), React.createElement(Card_1.CardText, {expandable: true, style: { paddingTop: "0px" }}, "actionable features content" + ' ' + "assembling and printing reports content" + ' ' + "Saving and sharing workspaces")));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = content;
