import { Component, type ComponentType } from "preact";
import type { State } from "@figliolia/galena";
import type { DerivedArguments, DerivedSelector, Subtract } from "./types";

export const connectMulti = <StateInstances extends State<any>[]>(
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
        override state: any;
        listeners: (() => void)[] = [];
        constructor(props: OwnProps) {
          super(props);
          this.state = this.computeSelector();
        }

        static displayName = `GalenaMultiComponent(${
          WrappedComponent.displayName ?? WrappedComponent.name ?? "Component"
        })`;

        public override componentDidMount() {
          this.listeners = this.bindListeners();
        }

        public override componentWillReceiveProps(nextProps: OwnProps) {
          if (nextProps !== this.props) {
            this.setState(this.computeSelector(nextProps));
          }
        }

        public override shouldComponentUpdate(
          nextProps: OwnProps,
          nextState: ReturnType<Selector>
        ) {
          return nextState !== this.state || nextProps !== this.props;
        }

        public override componentWillUnmount() {
          while (this.listeners.length) {
            this.listeners.pop()?.();
          }
        }

        private bindListeners() {
          return states.map((state) => {
            return state.subscribe(() => this.setState(this.computeSelector()));
          });
        }

        private computeSelector(props: OwnProps = this.props) {
          return selector(
            states.map((s) =>
              s.getSnapshot()
            ) as DerivedArguments<StateInstances>,
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

export type ReactiveStates<T extends ReturnType<typeof connectMulti>> =
  Parameters<Parameters<T>[0]>[0];
