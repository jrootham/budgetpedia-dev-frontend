// about.tsx
// required by bundler
import * as React from 'react'
import {Card, CardTitle, CardText} from 'material-ui/Card'
var { Component } = React

class Demos extends Component<any, any> {
    render() { return <div>

    <Card>
    <CardTitle>Get a Demo</CardTitle>

    <CardText>
        <ul style={{marginTop:"0", marginBottom:"0"}} >
            <li>Interested in learning more about Budgetpedia?</li>
            <li>Want to get a better understanding of how the budget process
                works in Toronto?</li>
            <li>Have a group that would like a hands-on demonstration of how you can
                use budgetpedia to better understand Toronto's city finances?</li>
        </ul>
    </CardText>

    <CardText>
        Get Henrik (the project lead) to demo the site for you.
    </CardText>
     <CardText>
   If you've got a group of 10 or more people anywhere in the City of Toronto,
        we're happy to come out and provide a brief overview of what Budgetpedia
        is and how you can use it to better understand the city budget and budget-
        making process.
    </CardText>
     <CardText>
    We can provide a brief (10-30 minute) overview of the website and tools,
        as well as a chance for your group to explore the tools available on the
        site
     </CardText>
     <CardText>
    In addition to gaining a better understanding of the city budget, you'll
        also learn how you can get involved in making a difference in the
        development of the newest city budget.
     </CardText>
     <CardText>
    <strong>PLUS!</strong> Learn how you can get involved in making Budgetpedia even
        better.  Give us your input on what tools you'd like and how the site
        coulcd better help your organization.  We're still in the early stages and
        are actively looking for input.
    </CardText>

    <CardText>
<h4><b>Contact</b></h4>
<ul>
    <li><b>Email:</b> <a href="mailto:mail@budgetpeida.ca">mail@budgetpedia.ca</a></li>
</ul>
    </CardText>


</Card>
    </div>
    }
}
export default Demos

