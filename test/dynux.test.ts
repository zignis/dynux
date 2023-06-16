import { ReducerManager } from "../src";
import { Reducer, createStore } from "redux";
import { configureStore } from "@reduxjs/toolkit";

const someReducer: Reducer = (state = null) => state;
const otherReducer: Reducer = (state = null) => state;

const createStoreWithReducerManager = (
  initialReducers: ConstructorParameters<typeof ReducerManager>[0]
) => {
  const reducerManager = new ReducerManager(initialReducers);
  const store = createStore(reducerManager.reduce);
  reducerManager.bindStore(store);

  return { reducerManager, store };
};

describe("reducerManager", () => {
  it("initializes a store using `createStore`", () => {
    const { reducerManager, store } = createStoreWithReducerManager({
      someReducer,
    });

    // Check if the reducer actually exists on the store
    expect(store.getState()["someReducer"] === null).toBeTruthy();

    expect(reducerManager.hasReducer("someReducer")).toBeTruthy();
    expect(reducerManager.hasReducer("otherReducer")).toBeFalsy();
  });

  it("initializes a store using `configureStore` from @reduxjs/toolkit", () => {
    const reducerManager = new ReducerManager({ someReducer });
    const store = configureStore({ reducer: reducerManager.reduce });
    reducerManager.bindStore(store);

    // Check if the reducer actually exists on the store
    expect(store.getState()["someReducer"] === null).toBeTruthy();

    expect(reducerManager.hasReducer("someReducer")).toBeTruthy();
    expect(reducerManager.hasReducer("otherReducer")).toBeFalsy();
  });

  it("throws if a store is not binded to the manager", () => {
    const reducerManager = new ReducerManager({ someReducer });
    expect(() => reducerManager.remove("someReducer")).toThrowError();
  });

  it("returns `true` with `hasReducer` for an existent reducer", () => {
    const { reducerManager } = createStoreWithReducerManager({
      someReducer,
    });
    expect(reducerManager.hasReducer("someReducer")).toBeTruthy();
  });

  it("returns `false` with `hasReducer` for a non-existent reducer", () => {
    const { reducerManager } = createStoreWithReducerManager({
      someReducer,
    });
    expect(reducerManager.hasReducer("otherReducer")).toBeFalsy();
  });

  it("returns valid list of registered reducers", () => {
    const { reducerManager } = createStoreWithReducerManager({
      someReducer,
      otherReducer,
    });

    expect(JSON.stringify(reducerManager.getReducerMap())).toEqual(
      JSON.stringify({
        otherReducer: function otherReducer() {},
        someReducer: function someReducer() {},
      })
    );
  });

  it("asynchronously adds a reducer", () => {
    const { reducerManager, store } = createStoreWithReducerManager({
      someReducer,
    });

    expect(reducerManager.hasReducer("someReducer")).toBeTruthy();
    expect(reducerManager.hasReducer("otherReducer")).toBeFalsy();

    reducerManager.add("otherReducer", otherReducer);

    // Check against the real store
    expect(store.getState()["otherReducer"] === null).toBeTruthy();

    expect(reducerManager.hasReducer("someReducer")).toBeTruthy();
    expect(reducerManager.hasReducer("otherReducer")).toBeTruthy();
  });

  it("asynchronously removes a reducer", () => {
    const { reducerManager, store } = createStoreWithReducerManager({
      someReducer,
    });

    expect(reducerManager.hasReducer("otherReducer")).toBeFalsy();

    reducerManager.add("otherReducer", otherReducer);

    expect(reducerManager.hasReducer("otherReducer")).toBeTruthy();

    reducerManager.remove("otherReducer");

    // Check against the real store
    expect(store.getState()["otherReducer"] === null).toBeFalsy();
    expect(reducerManager.hasReducer("otherReducer")).toBeFalsy();
  });

  it("does not add a duplicate reducer", () => {
    const { reducerManager, store } = createStoreWithReducerManager({
      someReducer,
    });

    reducerManager.add("otherReducer", otherReducer);
    reducerManager.add("otherReducer", otherReducer);

    // Check against the real store
    expect(store.getState()["otherReducer"] === null).toBeTruthy();

    expect(JSON.stringify(reducerManager.getReducerMap())).toEqual(
      JSON.stringify({
        otherReducer: function otherReducer() {},
        someReducer: function someReducer() {},
      })
    );
  });

  it("does not throw on removing a non-existent reducer", () => {
    const { reducerManager } = createStoreWithReducerManager({
      someReducer,
    });

    reducerManager.remove("otherReducer");
  });

  it("binds to different store", () => {
    const { reducerManager } = createStoreWithReducerManager({
      someReducer,
      otherReducer,
    });

    const newStore = createStore(reducerManager.reduce);

    // Bind to a new store
    reducerManager.bindStore(newStore);

    // Check against the real store
    expect(newStore.getState()["someReducer"] === null).toBeTruthy();
    expect(newStore.getState()["otherReducer"] === null).toBeTruthy();
  });

  it("cleans up stale reducers before binding to a new store", () => {
    const { reducerManager } = createStoreWithReducerManager({
      someReducer,
      otherReducer,
    });

    reducerManager.remove("otherReducer");

    const newStore = createStore(reducerManager.reduce);

    // Bind to a new store
    reducerManager.bindStore(newStore);

    // Check against the real store
    expect(newStore.getState()["someReducer"] === null).toBeTruthy();
    expect(newStore.getState()["otherReducer"] === null).toBeFalsy();
  });
});
