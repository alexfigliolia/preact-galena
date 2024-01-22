import { useEffect, useRef, useState } from "preact/hooks";
import type { ReactiveInterface } from "./types";
import { subscribe, unsubscribe } from "./extractAPI";

/**
 * ### Create Use State
 *
 * A factory for generating selectors from `Galena` instances and
 * units of `State`
 *
 * ### Composing State and Selector Hooks!
 *
 * ```typescript
 * // AppState.ts
 * import { Galena } from "@figliolia/galena";
 * import { createUseState } from "@figliolia/preact-galena";
 *
 * const AppState = new Galena();
 *
 * const NavigationState = AppState.composeState("navigation", {
 *   route: "/",
 *   permittedRoutes: "/**"
 * });
 *
 * export const useAppState = createUseState(AppState);
 * // or using the Navigation Unit
 * export const useNavigationState = createUseState(NavigationState);
 * ```
 *
 * ### Using Selector Hooks in Preact
 * ```tsx
 * import { useAppState, useNavigationState } from "./AppState";
 *
 * const Navigation = ({ route, text }) => {
 *   const currentRoute = useAppState(({ navigation }) => navigation.state.route);
 *   // or using the Navigation unit
 *   const currentRoute = useNavigationState((state) => state.route);
 *
 *   return (
 *     <nav>
 *       <div>{currentRoute}</div>
 *       <Link to="/" text="Home" />
 *       <Link to="/about" text="About" />
 *       <Link to="/contact" text="Contact" />
 *      </nav>
 *   );
 * }
 * ```
 *
 * ### Computing Arbitrary Values from State
 * In addition to reading values from state, you may also compute
 * arbitrary values using your state. Your component will re-render
 * any time your computed value changes:
 * ```tsx
 * import { useNavigationState } from "./AppState";
 *
 * const Link = ({ route, text }) => {
 *   const isActive = useNavigationState((state) => state.route === route);
 *
 *   return (
 *     <a href={route} className={isActive ? "active" : ""}>{text}</a>
 *   );
 * }
 * ```
 */
export const createUseState = <StateInstance extends ReactiveInterface>(
  state: StateInstance
) => {
  return function useGalenaState<
    SelectorFunction extends (state: StateInstance["state"]) => any
  >(selection: SelectorFunction) {
    const instanceRef = useRef(state);

    const [props, setProps] = useState<ReturnType<SelectorFunction>>(
      selection(instanceRef.current.state)
    );

    useEffect(() => {
      const state = instanceRef.current;
      const ID = subscribe(state)((nextState) =>
        setProps(selection(nextState))
      );
      return () => unsubscribe(state)(ID);
    }, [selection]);

    return props;
  };
};
