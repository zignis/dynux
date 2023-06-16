// Augmentation

import { ReducerManager } from "./dynux";

declare module "redux" {
  // noinspection JSUnusedGlobalSymbols
  export interface Store {
    reducerManager?: ReducerManager;
  }
}
