// copyright (c) 2016 Henrik Bechmann, Toronto, MIT Licence
// getnodedatasets.tsx

let getBudgetNode = (node, path) => {

    let components = node.Components

    for (let index of path) {

        node = components[index]

        if (!node) { // can happen legitimately switching from one facet to another

            return null

        }

        components = node.Components
    }

    return node
}

export { getBudgetNode }
