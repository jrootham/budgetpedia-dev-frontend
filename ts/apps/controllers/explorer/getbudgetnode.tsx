// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// getnodedatasets.tsx

let getBudgetNode = (viewpointindex, path, budgetdata) => {

    let node = budgetdata.Viewpoints[viewpointindex]

    let components = node.Components

    for (let index of path) {

        node = components[index]

        if (!node) { // can happen legitimately switching from one facet to another

            // console.log('component node not found', components, viewpointindex, path)
            return null

        }

        components = node.Components
    }

    return node
}

export { getBudgetNode }
