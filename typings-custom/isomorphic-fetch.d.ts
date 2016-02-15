// isomorphic-fetch.d.ts
declare module 'isomorphic-fetch' {
    var fetch: (a: any, b:any) => any;
    export = fetch;
}
declare module 'es6-promise' {
    var polyfill: () => any;
    export = polyfill;
}
