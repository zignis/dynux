/* eslint-disable @typescript-eslint/no-explicit-any */
// noinspection JSUnusedGlobalSymbols

import {
  Action,
  CombinedState,
  combineReducers,
  Reducer,
  ReducersMapObject,
  Store,
} from "redux";

/**
 * The reducer manager class
 * @see https://redux.js.org/usage/code-splitting#using-a-reducer-manager
 */
export class ReducerManager {
  // An object which maps keys to reducers
  private readonly _reducers: ReducersMapObject;
  // The store binded to the manager
  private _store?: Store;
  // An array which is used to delete state keys when reducers are removed
  private _keysToRemove: (string | number)[];
  // The combined reducers
  private _combinedReducer: Reducer;

  /**
   * Ctor
   * @param initialReducers Initial static reducers that are always present
   */
  constructor(initialReducers: ReducersMapObject) {
    this._reducers = { ...initialReducers };
    this._keysToRemove = [];
    this._combinedReducer = combineReducers(this._reducers);

    this.bindStore = this.bindStore.bind(this);
    this.getReducerMap = this.getReducerMap.bind(this);
    this.hasReducer = this.hasReducer.bind(this);
    this.reduce = this.reduce.bind(this);
    this.add = this.add.bind(this);
    this.remove = this.remove.bind(this);
    this.replaceReducers = this.replaceReducers.bind(this);
  }

  /**
   * Bind a store to the manager
   */
  public bindStore(store: Store): void {
    const prevStore = this._store;
    this._store = store;

    if (typeof prevStore === "undefined") {
      this.replaceReducers();
    }
  }

  /**
   * Get current registered reducers
   */
  public getReducerMap(): ReducersMapObject {
    return this._reducers;
  }

  /**
   * Predicate function for checking whether a reducer is registered
   * @param key Key of the reducer to check against
   */
  public hasReducer(key: string): boolean {
    return key in this._reducers;
  }

  /**
   * Root reducer function passed to the store
   * @param state App state
   * @param action Any action
   */
  public reduce(
    state: CombinedState<{ [p: string]: any }> | undefined,
    action: Action
  ): CombinedState<{ [p: string]: any }> {
    // If any reducers have been removed, clean up their state first
    if (this._keysToRemove.length > 0) {
      state = { ...state };

      for (const key of this._keysToRemove) {
        delete state[key];
      }

      this._keysToRemove = [];
    }

    // Delegate to the combined reducer
    return this._combinedReducer(state, action);
  }

  /**
   * Adds a new reducer with the specified key. The string key
   * needs to be explicitly specified to prevent unwanted behaviour
   * during production, if the source gets minified or mangled
   * @param key Reducer key
   * @param reducer Reducer to add
   */
  public add(key: string, reducer: Reducer): void {
    // Return early if the reducer is already registered
    if (!key || key in this._reducers) {
      return;
    }

    // Add the reducer to the reducer mapping
    this._reducers[key] = reducer;
    this.replaceReducers();
  }

  /**
   * Removes a reducer with the specified key
   * @param key Key of the reducer to remove
   */
  public remove(key: string): void {
    // Return early if the reducer is not registered
    if (!key || !(key in this._reducers)) {
      return;
    }

    // Remove it from the reducer mapping
    delete this._reducers[key as string | number];

    // Add the key to the list of keys to clean up
    this._keysToRemove.push(key as string | number);
    this.replaceReducers();
  }

  /**
   * Generate a new combined reducer and replace
   * the old reducers with new reducers in the store
   * @private
   */
  private replaceReducers(): void {
    this._combinedReducer = combineReducers(this._reducers);

    if (typeof this._store === "undefined") {
      throw new Error("Cannot find a binded store");
    }

    this._store.replaceReducer(this._combinedReducer);
  }
}
