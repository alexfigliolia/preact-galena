import type { ReactiveInterface } from "./types";

export const subscribe = (state: ReactiveInterface) => {
  if ("subscribeAll" in state) {
    return state.subscribeAll.bind(state);
  }
  return state.subscribe.bind(state);
};

export const unsubscribe = (state: ReactiveInterface) => {
  if ("unsubscribeAll" in state) {
    return state.unsubscribeAll.bind(state);
  }
  return state.unsubscribe.bind(state);
};
