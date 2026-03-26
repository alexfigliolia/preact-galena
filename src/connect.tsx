import { Component, type ComponentType } from "preact";
import type { State } from "@figliolia/galena";
import type { Subtract } from "./types";

export const connect = <StateInstance extends State<any>>(
  state: StateInstance
) => {
  type ScopedState = ReturnType<StateInstance["getSnapshot"]>;
  return <
    SelectorFunction extends (
      state: ScopedState,
      ownProps: any
    ) => Record<string, any>
  >(
    selection: SelectorFunction
  ) => {
    type Selection = ReturnType<SelectorFunction>;
    return <ComponentProps extends Selection>(
      WrappedComponent: ComponentType<ComponentProps>
    ): ComponentType<Subtract<ComponentProps, Selection>> => {
      type OwnProps = Subtract<ComponentProps, Selection>;
      return class GalenaComponent extends Component<OwnProps, Selection> {
        override state: any;
        private listener: (() => void) | null = null;
        constructor(props: OwnProps) {
          super(props);
          this.update = this.update.bind(this);
          this.state = selection(state.getSnapshot(), this.props);
        }

        static displayName = `GalenaComponent(${
          (WrappedComponent.displayName ?? WrappedComponent.name) || "Component"
        })`;

        public override componentDidMount() {
          this.listener = state.subscribe((state) => this.update(state));
        }

        public override componentWillReceiveProps(nextProps: OwnProps) {
          if (nextProps !== this.props) {
            this.update(state.getSnapshot(), nextProps);
          }
        }

        public override shouldComponentUpdate(
          nextProps: OwnProps,
          nextState: Selection
        ) {
          return nextState !== this.state || nextProps !== this.props;
        }

        public override componentWillUnmount() {
          if (this.listener) {
            this.listener();
            this.listener = null;
          }
        }

        private update(nextState: ScopedState, ownProps = this.props) {
          this.setState(selection(nextState, ownProps));
        }

        public override render() {
          return <WrappedComponent {...this.props} {...this.state} />;
        }
      };
    };
  };
};
