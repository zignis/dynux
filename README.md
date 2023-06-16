# dynux

![npm](https://img.shields.io/npm/v/dynux?style=for-the-badge)
![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/zignis/dynux/test.yml?style=for-the-badge)
![npm](https://img.shields.io/npm/dw/dynux?style=for-the-badge)
![NPM](https://img.shields.io/npm/l/dynux?style=for-the-badge)

**Dyn**amic red**ux** reducer injection. Allows you to reduce the 
size of your bundle by dynamically loading and registering reducers 
on your Redux store. It is compatible with Redux Toolkit.

## Test coverage

| Statements                  | Branches                | Functions                 | Lines             |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-100%25-brightgreen.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-100%25-brightgreen.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-100%25-brightgreen.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-100%25-brightgreen.svg?style=flat) |

## Configuration

### With Redux

```typescript
import { ReducerManager } from "dynux";
import { createStore, Reducer } from "redux";

const someReducer: Reducer = (state = null) => state;
const initialReducers = {
  someReducer,
};

const configureStore = () => {
  // Optionally initialize with static reducers
  const reducerManager = new ReducerManager(initialReducers);

  // Create a store with the root reducer
  const store = createStore(reducerManager.reduce);

  // Bind the store to the manager
  reducerManager.bindStore(store);

  // Optionally put the reducer manager on the store so it is easily accessible
  store.reducerManager = reducerManager;
};
```

### With Redux Toolkit

```typescript
import { ReducerManager } from "dynux";
import { Reducer } from "redux";
import { configureStore } from "@reduxjs/toolkit";

const someReducer: Reducer = (state = null) => state;
const initialReducers = {
  someReducer,
};

const configureStore = () => {
  // Optionally initialize with static reducers
  const reducerManager = new ReducerManager(initialReducers);

  // Create a store with the root reducer
  const store = configureStore({ reducer: reducerManager.reduce });

  // Bind the store to the manager
  reducerManager.bindStore(store);

  // Optionally put the reducer manager on the store so it is easily accessible
  store.reducerManager = reducerManager;
};
```

## Attaching the manager to store

The `ReducerManager` instance can be bound to your Redux store
for easy access. If you are using TypeScript, include the 
`dynux/augmentation` file, which extends the store object with 
a reducerManager property.

```typescript
import {} from "dynux/augmentation";
import { ReducerManager } from "dynux";
import { setupStore } from "redux";

const reducerManager = new ReducerManager();
const store = setupStore(reducerManager.reduce);
reducerManager.bindStore(store);

// ts should not complain about this
store.reducerManager = reducerManager;
```

## Usage

The exported `ReducerManager` class optionally accepts static reducers 
as a constructor argument. These reducers are always present on your store.

### `bindStore`

Binds a Redux store to a `ReducerManager` instance.

```typescript
const manager = new ReducerManager();

manager.bindStore(createStore(manager.reduce));
```

A different store can be rebound at any time, and
all active reducers will be registered on the new store.

```typescript
const newStore = createStore(manager.reduce);

manager.bindStore(newStore);
```

### `getReducerMap`

Returns the reducers that are currently registered on the store.

### `hasReducer`

Checks if a reducer is registered on the store.

```typescript
manager.hasReducer("reducerKey");
```

### `reduce`

Returns the combined reducers. Pass this to `configureStore` or `setupStore`.

### `add`

Asynchronously adds a new reducer to the store. The reducer is identified 
by a unique key, which helps avoid duplicate reducers and provides a unique 
identification for each reducer.

```typescript
manager.add("reducerKey", reducerImpl);
```

### `remove`

Asynchronously removes a reducer from the store. You would rarely 
need to use this method unless you have a very large number of 
dynamic reducers.

```typescript
manager.remove("reducerKey");
```
