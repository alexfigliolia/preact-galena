import { useMemo } from "preact/hooks";
import { type NonFunction, State } from "@figliolia/galena";
import { useStableSelector, useStateHookAPI } from "./commonHooks";

/**
 * Use State
 *
 * A `State` consumer/creator for your react components.
 * This hook can accept an exising instance of `State` or
 * a stateful value and return reactive state and updaters
 * for your components
 *
 * ```typescript
 * import { State, useState } from "@figliolia/galena";
 *
 * const myState = new State("<some-value>");
 *
 * export const MyComponent = () => {
 *   const [state, setState] = useState(myState);
 *   // or useState can be used a standalone replacement for React's useState
 *   const [state, setState] = useState("<some-value>");
 *
 *   return (
 *     // your jsx
 *   );
 * }
 * ```
 *
 * `useState` can also accept an optional selector function for deriving
 * values from a unit of state
 *
 * ```typescript
 * import { State, useState } from "@figliolia/galena";
 *
 * const myState = new State({ deeply: { nested: data: 4 } });
 *
 * const eight = useState(myState, state => deeply.nested.data * 2);
 * ```
 */
export const useState = <T, U = T>(
  value: NonFunction<T> | State<T>,
  selector = ((value: NonFunction<T>) => value) as (value: NonFunction<T>) => U
) => {
  const stableSelector = useStableSelector(selector);
  const readable = useMemo(
    () => (value instanceof State ? value : new State(value)),
    [value]
  );
  return useStateHookAPI(readable, stableSelector);
};
