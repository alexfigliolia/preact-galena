import type { NonFunction, State } from "@figliolia/galena";
import { useStableSelector, useStateHookAPI } from "./commonHooks";

/**
 * Create Use State
 *
 * A reuseable `State` consumer/creator for your preact components.
 * This hook can accept an exising instance of `State` and return
 * a hook for deriving reactive state and updaters fn's for your components
 *
 * ```typescript
 * import { State, createUseState } from "@figliolia/galena";
 *
 * const myState = new State("<some-value>");
 *
 * export const useMyState = createUseState(myState);
 *
 * // In your components
 * export const MyComponent = () => {
 *   const [state, setState] = useMyState(
 *     // optional selector function
 *   );
 *
 *   return (
 *     // your jsx
 *   );
 * }
 * ```
 *
 * `useState` can accept an optional selector function for deriving
 * new values from a unit of state
 *
 * ```typescript
 * import { State, createUseState } from "@figliolia/galena";
 *
 * const myState = new State({ deeply: { nested: data: 4 } });
 * const useMyState = createUseState(myState);
 *
 * const eight = useMyState(state => deeply.nested.data * 2);
 * ```
 */
export const createUseState = <T>(value: State<T>) => {
  return <U = T>(
    selector = ((value: NonFunction<T>) => value) as (
      value: NonFunction<T>
    ) => U
  ) => {
    const stableSelector = useStableSelector(selector);
    return useStateHookAPI(value, stableSelector);
  };
};
