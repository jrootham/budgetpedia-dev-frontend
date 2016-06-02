// Generated by typings
// Source: https://raw.githubusercontent.com/andrew-w-ross/typings-history/master/history.d.ts
declare module '~react-router-redux~history/history' {
module otherHistory {
	type Action = 'PUSH' | 'REPLACE' | 'POP';

	type BeforeUnloadHook = () => string | void;

	type CreateLocation = (path: string, locationObj: Object) => Location;

	type CreateHistoryDefault = CreateHistory<HistoryOptions, History>;

	type CreateHistory<TOptions extends HistoryOptions, TResult extends History> = (options?: TOptions) => TResult;

	type Hash = string;

	interface History {
		listenBefore(hook: TransitionHook): Function;
		listen(listener: LocationListener): Function;
		transitionTo(location: Location): void;
		push(location: LocationDescriptor): void;
		replace(location: LocationDescriptor): void;
		go(n: number): void;
		goBack(): void;
		goForward(): void;
		createKey(): LocationKey;
		createLocation: CreateLocation;
		createPath(location: LocationDescriptor): Path;
		createHref(location: LocationDescriptor): Href;
	}

	interface HistoryOptions {
		getUserConfirmation?(message: string, callback: (confirmed: boolean) => void): void;
		queryKey?: boolean | string;
	}

	interface BeforeUnload {
		listenBeforeUnload?(callBack: () => string | boolean | void): void;
	}

	interface QueryOptions {
		parseQueryString?(queryString: string): any;
		stringifyQuery?(query: Object): string;
	}

	interface BasenameOptions {
		basename?: string;
	}

	type Href = string;

	interface Location {
		pathname?: Pathname;
		search?: Search;
		query?: Query;
		state?: LocationState;
		action?: Action;
		key?: LocationKey;
	}

	interface LocationDescriptorObject {
		pathname?: Pathname;
		search?: Search;
		query?: Query;
		state?: LocationState;
	}

	type LocationDescriptor = LocationDescriptorObject | Path;

	type LocationKey = string;

	type LocationListener = (location: Location) => void;

	type LocationState = Object;

	type Path = string;

	type Pathname = string;

	type Query = Object;

	type Search = string;

	type TransitionHook = (location: Location, callback?: Function) => any;

	export const createLocation: CreateLocation;

	export const createHistory: CreateHistoryDefault;

	export const createHashHistory: CreateHistoryDefault;

	export const createMemoryHistory: CreateHistoryDefault;

	export function useBeforeUnload<TArguments, TResult extends History>(createHistory: CreateHistory<TArguments, TResult>): CreateHistory<TArguments, TResult & BeforeUnload>;

	export function useQueries<TArguments, TResult extends History>(createHistory: CreateHistory<TArguments, TResult>): CreateHistory<TArguments & QueryOptions, TResult>;

	export function useBasename<TArguments, TResult extends History>(createHistory: CreateHistory<TArguments, TResult>): CreateHistory<TArguments & BasenameOptions, TResult>;
}

export = otherHistory;
}
declare module '~react-router-redux~history' {
import alias = require('~react-router-redux~history/history');
export = alias;
}

// Generated by typings
// Source: https://raw.githubusercontent.com/andrew-w-ross/typings-redux/e16683b6d921624478ff926c9b50151aa4a5d22d/redux.d.ts
declare module '~react-router-redux~redux/redux' {
module redux {
	//This should be extended
	export interface IAction {
		type: string | number | Symbol;
	}

	export interface IActionGeneric<TPayload> extends IAction {
		payload?: TPayload;
		error?: Error;
		meta?: any;
	}

	export interface IReducer<TState> {
		(state: TState, action: IAction): TState;
	}

	export interface IReducerMap {
		[key: string]: IReducerMap | IReducer<any>
	}

	export interface IDispatch {
		(action: IAction): IAction;
	}

	export interface IMiddlewareStore<TState> {
		getState(): TState;

		dispatch: IDispatch;
	}

	export interface IStore<TState> extends IMiddlewareStore<TState> {
		subscribe(listener: (state: TState) => any): () => void;

		replaceReducer(nextReducer: IReducer<TState>): void;
	}

	export interface IMiddleware<State> {
		(middlewareStore: IMiddlewareStore<State>): (next: IDispatch) => IDispatch;
	}

	export interface ICreateStoreGeneric<TState> {
		(reducer: IReducer<TState>, initialState?: TState): IStore<TState>;
	}

	export interface IStoreEnhancerGeneric<TState> {
		(createStore: ICreateStoreGeneric<TState>): ICreateStoreGeneric<TState>;
	}

	export function createStore<TState>(reducer: IReducer<TState>, initialState?: TState): IStore<TState>;

	export function combineReducers(reducers: IReducerMap): IReducer<any>;
	export function combineReducers<TState>(reducers: IReducerMap): IReducer<TState>;

	export function applyMiddleware<TState>(...middlewares: IMiddleware<TState>[]): IStoreEnhancerGeneric<TState>;

	export function bindActionCreators<TActionCreator extends Function | { [key: string]: Function }>(actionCreators: TActionCreator, dispatch: IDispatch): TActionCreator;

	export function compose<TArg>(...functions: { (arg: TArg): TArg }[]): (arg: TArg) => TArg;
	export function compose(...functions: { (arg: any): any }[]): (arg: any) => any;
}

export = redux;
}
declare module '~react-router-redux~redux' {
import alias = require('~react-router-redux~redux/redux');
export = alias;
}

// Generated by typings
// Source: https://raw.githubusercontent.com/andrew-w-ross/typings-react-router-redux/7fece514b8d3de4a86f65104e0f7636a0f48046e/react-router-redux.d.ts
declare module '~react-router-redux/react-router-redux' {

import {History, Location, LocationDescriptor} from '~react-router-redux~history';
import {IMiddleware, IStore, IAction, IReducer} from '~react-router-redux~redux';

module reactRouterRedux {
	export interface IRouterReduxMiddleware<TState> extends IMiddleware<TState> {
		/**
		 * By default, the syncing logic will not respond to replaying of actions, which means it won't work with projects like redux-devtools. Call this function on the middleware object returned from syncHistory and give it the store to listen to, and it will properly work with action replays.
		 * Obviously, you would do that after you have created the store and everything else has been set up.
		 * Supply an optional function selectLocationState to customize where to find the location state on your app state. It defaults to state => state.routing.location, so you would install the reducer under the name "routing". Feel free to change this to whatever you like.
		 * 
		 * @param {IStore<TState>} store (description)
		 * @param {(state:TState) => Location} selectLocationState (description)
		 */
		listenForReplays(store: IStore<TState>, selectLocationState?: (state: TState) => Location);

		/**
		 * Call this on the middleware returned from syncHistory to stop the syncing process set up by listenForReplays.
		 */
		unsubscribe();
	}

	/**
	 * Call this to create a middleware that can be applied with Redux's applyMiddleware to allow actions to call history methods. The middleware will look for route actions created by push, replace, etc. and applies them to the history.
	 * 
	 * @export
	 * @template TState
	 * @param {History} history (description)
	 * @returns {IRouterReduxMiddleware<TState>} (description)
	 */
	export function syncHistory<TState>(history: History): IRouterReduxMiddleware<TState>;

	/**
	 * A reducer function that keeps track of the router state. You must add this reducer to your app reducers when creating the store. 
	 * It will return a location property in state. If you use combineReducers, it will be nested under wherever property you add it to (state.routing in the example above).
	 * Warning: It is a bad pattern to use react-redux's connect decorator to map the state from this reducer to props on your Route components. This can lead to infinite loops and performance problems. react-router already provides this for you via this.props.location.
	 * 
	 * @export
	 * @param {Location} state (description)
	 * @param {IAction} action (description)
	 * @returns {Location} (description)
	 */
	export function routeReducer(state: Location, action: IAction): Location;

	export interface IRouteActions {
		push(nextLocation: LocationDescriptor): IAction;
		replace(nextLocation: LocationDescriptor): IAction;
		go(n: number): IAction;
		goForward(): IAction;
		goBack(): IAction;
	}

	/**
	 * An object that contains all the actions creators you can use to manipulate history:
	 * 
	 * @export
	 */
	export const routeActions: IRouteActions;

	/**
	 * Action type for when the location is updated
	 * @export
	 */
	export const UPDATE_LOCATION: string;

	export const TRANSITION: string;
}

export = reactRouterRedux;
}
declare module 'react-router-redux/react-router-redux' {
import alias = require('~react-router-redux/react-router-redux');
export = alias;
}
declare module 'react-router-redux' {
import alias = require('~react-router-redux/react-router-redux');
export = alias;
}
