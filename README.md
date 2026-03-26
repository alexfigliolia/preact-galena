# Preact Galena

Preact Bindings for Galena! Using `galena` with preact is simple thanks to a set of factories for generating HOC's and hooks from your application state.

## Installation

```bash
npm i -S @figliolia/galena @figliolia/preact-galena
# or
yarn add @figliolia/galena @figliolia/preact-galena
```

## Getting Started

There are two primary API's developers can use for reading and mutating Galena State from Preact Components - hooks and HOC's! To get started, let's initialize some state and generate some hooks for accessing it in Preact:

### Connecting Components to State Using Preact Hooks

The first part of this example, you're likely already familiar with. Let's set up a basic `Galena` instance at a attach a unit of `State` to it.

```typescript
// AppState.ts;
import { Galena, State } from "@figliolia/galena";
import { createUseState, createUseMutation } from "@figliolia/preact-galena";

export const AppState = new Galena({
  navigation: new State({
    route: "/",
    userID: "123",
    permittedRoutes: "**/*",
  })
});

// Next, let's create some hooks for our components!

// Returns a hook for selecting values and updating values from your Navigation state
export const useNavigation = createUseState(AppState.get("navigation"));
```

### createUseState()

`createUseState()` will accept any unit of `State` as a parameter and return a Preact Hook for selecting/mutating values from your state. Using the hook returned from `createUseState()`, you can read or compute from any value(s) in your application state and your component will re-render any time that value changes:

```tsx
// Navigation.tsx
import { useNavigationState } from "./AppState";

const Navigation = () => {
  // Alternatively, you can use the hook generated from your
  // Navigation unit directly
  const [currentRoute, update] = useNavigationState(state => state.route);

  return (
    <nav>
      <div>{currentRoute}</div>
      <Link to="/" text="Home" />
      <Link to="/about" text="About" />
      <Link to="/contact" text="Contact" />
    </nav>
  );
};
```

### Connecting Components to State Using HOC's

This library also provides factories for generating `HOC's` from your `Galena` and `State` instances. Let's take a look at the example above, this time, using HOC's:

```typescript
// AppState.ts;
import { Galena, State } from "@figliolia/galena";
import { connect } from "@figliolia/preact-galena";

export const AppState = new Galena({
  navigation: new State({
    route: "/",
    userID: "123",
    permittedRoutes: "**/*",
  }),
  user: new State({
    userID: "<id>",
    friends: ["<id-1>", "<id-2>"]
  })
});

// Next, let's create some HOC's!

export const connectNavigation = connect(AppState.get("navigation")); 
// An HOC for reading values directly from your Navigation state

export const connectUser = connect(AppState.get("user")); 
// An HOC for reading values directly from your User state
```

### Using Your Generated HOC's

```tsx
// Navigation.ts
import { connectAppState, connectNavigation } from "./AppState";

const Navigation = ({ route }: { route: string }) => {
  return (
    <nav>
      <div>{route}</div>
      <Link to="/" />
      <Link to="/about" />
      <Link to="/contact" />
    </nav>
  );
}

// Using your Navigation HOC
export default connectNavigation({ route } => ({
  route,
  // ...any other properties you wish to return
}))(Navigation);
```

### Advanced Connections

The HOC pattern can be cumbersome when binding multiple pieces of state to a Preact component. `Galena` solves this with the `connectMulti()` HOC generator.

```typescript
import { State } from "@figliolia/galena";
import { connectMulti, type ReactiveStates } from "@figliolia/preact-galena";

// Let's create some basic state instances to start
const ListItems = new State([1, 2, 3, 4]);
const UserData = new State({ id: 1, name: "Bob Smith" });

// Instead of creating an HOC for each unit, we can use our `connectMulti()` factory to generate a single HOC that'll respond to both units of state
const ListAndUserConnection = connectMulti(ListItems, UserData);
// The ReactiveStates will generate typed selector parameters
// for your selector functions
export type ConnectionArgs = ReactiveStates<
  typeof ListAndUserConnection
>;
```

The `ListAndUserConnection` HOC can wrap any component you wish using the following pattern

```tsx
// Let's grab the ListAndUserConnection from the code above
import {
  type ConnectionArgs,
  ListAndUserConnection,
} from "./ListAndUserConnection";

class MyComponent extends Component<{ list: number[]; name: string }> {
  override render() {
    const { name, list } = this.props;
    return (
      <div>
        <div>User Name: {name}</div>
        <ol>
          {list.map(el => (
            <li key={el}>{el}</li>
          ))}
        </ol>
      </div>
    );
  }
}

// Export your connected component!
export default ListAndUserConnection((
  [list, user]: ConnectionArgs, 
  ownProps: any
) => ({
  list,
  name: userData.name
}))(MyComponent);
```

As a result, we have a single wrapping HOC for `MyComponent` instead of multiple!

### Stateful Actions that can be used inside and outside of Preact!

For maximum code-reuse, you may choose to compose generic actions for your state instances. This architectural pattern can create a more Redux-like development experience - but without requiring you to manage any reducers.

```typescript
// NavigationMutations.ts
import { NavigationState } from "./NavigationState";

export const transitionRoute = (nextRoute: string) => {
  NavigationState.update(state => ({
    ...state,
    route: nextRoute,
  }));
};

export const updateRoutePermissions = (permissions: string) => {
  NavigationState.update(state => ({
    ...state,
    permittedRoutes: permissions
  }));
};
```

Using this pattern, you can simply create your state mutations then import them for use in your Preact Components and business logic:

```tsx
import { transitionRoute } from "./NavigationMutations";

const Link = (
  { route, text }: { route: string; text: string }
) => {
  const navigate = e => {
    transitionRoute(e.target.href);
  };

  return (
    <a href={route} onClick={navigate}>
      {text}
    </a>
  );
};
```

In addition to creating redux-like actions, you can also create a more redux-like event emission pattern through Galena. For example, if you don't wish to interact with your state instances directly, you can try out something like this:

```typescript
import { EventEmitter } from "@figliolia/event-emitter";
import { State } from "@figliolia/galena";

const MyStateStream = new EventEmitter<PayLoadTypes>();

// Extend the Default Galena State Instance to bind to actions
// you can name yourself!
export class MyState extends State<{ listItems: number[] }> {
  constructor() {
    super("My State", { listItems: [1, 2, 3, 4] });
    this.bindEvents();
  }

  private bindEvents() {
    MyStateStream.on("UPDATE_LIST", payload => {
      super.update(state => ({
        ...state,
        listItems: payload,
      }));
    });
    MyStateStream.on("REMOVE_LAST_ITEM", () => {
      super.update(state => ({
        ...state,
        listItems: listItems.slice(0, -1)
      }));
    });
  }
}

// Next, you can create some redux-like actions to dispatch
// updates to your state
export const updateList = (list: number[]) => {
  MyStateStream.emit("UPDATE_LIST", list);
};

export const removeLastItem = () => {
  MyStateStream.emit("REMOVE_LAST_ITEM", undefined);
};
```