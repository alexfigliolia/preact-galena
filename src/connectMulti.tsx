import { Component, type ComponentType } from "preact";
import type {
  Subtract,
  DerivedSelector,
  DerivedArguments,
  ReactiveInterface,
} from "./types";
import { subscribe, unsubscribe } from "./extractAPI";

/**
 * ### Connect Multi
 *
 * A HOC factory for generating Higher Order Components from multiple
 * `Galena` instances and/or units of `State`. `connectMulti()`
 * provides an API for Preact Components to select state values
 * and receive them as props. It's design is to prevent several layers
 * of state-connected HOC's from feeding a single component at a time.
 * `connectMulti()` adds only a single wrapper to your components
 * regardless of the number of state instances you pass it. Think of
 * it as the merging of what *would* be several HOC's!
 *
 * ### Composing State and HOC's
 *
 * ```typescript
 * // AppState.ts
 * import { State } from "@figliolia/galena";
 * import { connectMulti } from "@figliolia/preact-galena";
 *
 * const NavigationState = new State("navigation", {
 *   route: "/",
 *   permittedRoutes: "/**"
 * });
 *
 * const SettingsState = new State("settings", {
 *   darkMode: true,
 *   backgroundMusic: false,
 * });
 *
 * export const connectAll = connectMulti(NavigationState, SettingsState);
 * ```
 *
 * ### Using Your Connected HOC's
 * ```tsx
 * import type { ReactiveStates } from "@figliolia/preact-galena";
 * import { connectAll } from "./AppState";
 *
 * const MyComponent = ({ route, backgroundMusic }) => {
 *   return (
 *     <div>The current route is {route}</div>
 *     <div>Background music is{backgroundMusic ? " " : " not"} playing</div>
 *   );
 * }
 *
 * const selector = (
 *   [navigation, settings]: ReactiveStates<typeof connectAll>
 * ) => ({
 *   route: navigation.route,
 *   backgroundMusic: settings.backgroundMusic
 * });
 *
 * export default connectAll(selector)(MyComponent);
 * ```
 */
export const connectMulti = <StateInstances extends ReactiveInterface[]>(
  ...states: StateInstances
) => {
  return <Selector extends DerivedSelector<StateInstances>>(
    selector: Selector
  ) => {
    return <ComponentProps extends ReturnType<Selector>>(
      WrappedComponent: ComponentType<ComponentProps>
    ): ComponentType<Subtract<ComponentProps, ReturnType<Selector>>> => {
      type OwnProps = Subtract<ComponentProps, ReturnType<Selector>>;
      return class GalenaMultiComponent extends Component<
        OwnProps,
        ReturnType<Selector>
      > {
        state: any;
        listeners: string[] = [];
        constructor(props: OwnProps) {
          super(props);
          this.state = this.computeSelector();
        }

        static displayName = `GalenaMultiComponent(${
          WrappedComponent.displayName || WrappedComponent.name || "Component"
        })`;

        public override componentDidMount() {
          this.listeners = this.bindListeners();
        }

        public override componentWillReceiveProps(nextProps: OwnProps) {
          if (nextProps !== this.props) {
            this.setState(this.computeSelector(nextProps));
          }
        }

        public override shouldComponentUpdate(_: OwnProps, nextState: any) {
          return nextState !== this.state;
        }

        public override componentWillUnmount() {
          states.forEach((state, i) => {
            unsubscribe(state)(this.listeners[i]);
          });
          this.listeners = [];
        }

        private bindListeners() {
          return states.map((state) => {
            return subscribe(state)(() => {
              this.setState(this.computeSelector());
            });
          });
        }

        private computeSelector(props: OwnProps = this.props) {
          return selector(
            states.map((s) => s.getState()) as DerivedArguments<StateInstances>,
            props
          );
        }

        public override render() {
          return <WrappedComponent {...this.props} {...this.state} />;
        }
      };
    };
  };
};

/**
 * ### ReactiveStates
 *
 * A parameter type extractor for `connectMulti` selectors
 *
 * ```typescript
 * import { connectMulti, type ReactiveStates } from "@figliolia/preact-galena";
 *
 * const connection = connectMulti(State1, State2, ...rest);
 *
 * type SelectorParams = ReactiveStates<typeof Connection>
 * // [typeof State1["state"], typeof State2["state"], ...rest]
 * ```
 */
export type ReactiveStates<T extends ReturnType<typeof connectMulti>> =
  Parameters<Parameters<T>[0]>[0];
