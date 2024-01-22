# Preact Galena
Preact Bindings for Galena! Using `galena` with Preact is simple thanks to a set of factories for generating HOC's and hooks from your application state.

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
import {
  createUseState,
  createUseMutation,
} from "@figliolia/preact-galena"

export const AppState = new Galena<{
  navigation: State<{
    route: string;
    userID: string;
    permittedRoutes: string;
  }>
}>();

export const NavigationState = AppState.composeState("navigation", {
  route: "/",
  userID: "123",
  permittedRoutes: "**/*"
});

// Next, let's create some hooks for our components!
export const useAppState = createUseState(AppState); // Returns a hook for selecting values from your global application state
export const useNavigation = createUseState(NavigationState); // Returns a hook for selecting values from your Navigation state
export const useAppStateMutation = createUseMutation(AppState); // Returns a hook for mutating your Galena State
export const useNavigationMutation = createUseMutation(Navigation); // Returns a hook for mutating your Navigation state
```

### createUseState()
`createUseState()` will accept any `Galena` instance or unit of `State` as a parameter and return a Preact Hook for selecting values from your state. Using the hook returned from `createUseState()`, you can read or compute from any value(s) in your application state and your component will re-render any time that value changes:

```tsx
// Navigation.tsx
import { useAppState, useNavigationState } from "./AppState";

const Navigation = () => {
  const currentRoute = useAppState(({ navigation }) => navigation.state.route);
  // Alternatively, you can use the hook generated from your 
  // Navigation unit directly
  const currentRoute = useNavigationState((state) => state.route);

  return (
    <nav>
      <div>{currentRoute}</div>
      <Link to="/" text="Home" />
      <Link to="/about" text="About" />
      <Link to="/contact" text="Contact" />
    </nav>
  );
}
```
If you happen to notice, we never placed a `Provider` of any kind in our Preact Tree when getting setup. 

This is because in Galena, this pattern doesn't exist. This library chooses to bypass certain Preact internals and re-implement them using a scheduling mechanism of its own. 

As a result, state updates can occur in O(1) time, while dispatching updates to your components occurs in a standard O(N), optimized using the priority level ***you*** specify when making mutations!

To read more about the varying mutation priority levels, please feel free to glance over the [State API](https://www.npmjs.com/package/@figliolia/galena#state).

### createUseMutation()
Similar to `createUseState()`, `createUseMutation()` will accept any `Galena` instance or unit of `State` and return a hook providing mutation methods for updating your state. The `Mutation` object returned by the hook, exposes three methods for updating your state:

```tsx
import { useAppStateMutation, useNavigationMutation } from "./AppState";

const Link = ({ route, text }) => {

  const { update, backgroundUpdate, priorityUpdate } = useAppStateMutation();
  // or using the Navigation Unit
  const { update, backgroundUpdate, priorityUpdate } = useNavigationMutation();

  const navigate = (e) => {
    // Using the AppState hook
    update("navigation", state => {
      state.route = e.target.href;
    });
    // or using the Navigation Hook
    update(state => {
      state.route = e.target.href;
    });
  }

  return (
    <a href={route} onClick={navigate}>{text}</a>
  );
}
```

To read more about `Galena`'s various mutation methods, please reference the [API Documentation](https://github.com/alexfigliolia/galena#api-reference).

### Connecting Components to State Using HOC's
This library also provides factories for generating `HOC's` from your `Galena` and `State` instances. Let's take a look at the example above, this time, using HOC's:

```typescript
// AppState.ts;
import { Galena, State } from "@figliolia/galena";
import { connect } from "@figliolia/preact-galena";

export const AppState = new Galena<{
  navigation: State<{
    route: string;
    userID: string;
    permittedRoutes: string;
  }>
}>();

export const NavigationState = AppState.composeState("navigation", {
  route: "/";
  userID: "123",
  permittedRoutes: "**/*"
});

// Next, let's create some HOC's!
export const connectAppState = connect(AppState); // An HOC for reading values from your global application state
export const connectNavigation = connect(NavigationState); // A HOC for reading values directly from your Navigation state
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

// Using your global applications tate
export default connectAppState({ navigation } => ({
  route: navigation.state.route,
  // any other properties
}))(Navigation);

// Or using your Navigation Unit
export default connectNavigation({ route } => ({
  route,
  // any other properties
}))(Navigation);
```

### Advanced Connections
The HOC pattern is commonly faulted with the linear space problem. The more HOC's that wrap a given component, the more component wrappers are left in your Preact tree. While this is not a problem for most applications, it is a problem that `Galena` can solve! Similar to never requiring a `Provider` or hierarchical data flow of any kind, Galena provides a `connectMulti()` factory that'll merge all of your HOC's into a single wrapper!

```typescript
import { State } from "@figliolia/galena";
import { connectMulti, type ReactiveStates } from "@figliolia/preact-galena";

// Let's create some basic state instances to start
const ListItems = new State("List Items", [1, 2, 3, 4]);
const UserData = new State("Current User", { id: 1, name: "Bob Smith" });

// Instead of creating an HOC for each unit, we can use our `connectMulti()` factory to generate a single HOC that'll respond to both units of state
const ListAndUserConnection = connectMulti(ListItems, UserData);
// The ReactiveStates will generate typed selector parameters
// for your selector functions
export type ConnectionArgs = ReactiveStates<typeof ListAndUserConnection>;

```
The `ListAndUserConnection` HOC can wrap any component you wish using the following pattern

```tsx
// Let's grab the ListAndUserConnection from the code above
import { 
  type ConnectionArgs,
  ListAndUserConnection 
} from "./ListAndUserConnection";

class MyComponent extends Component<{ list: number[], name: string }> {
  override render() {
    const { name, list } = this.props;
    return (
      <div>
        <div>User Name: {name}</div>
        <ol>
          {
            list.map(el => <li key={el}>{el}</li>)
          }
        </ol>
      </div>
    );
  }
}

const mySelector = (
  [list, userData]: ConnectionArgs, 
  ownProps: any
) => {
  return { list, name: userData.name };
}

// Export your connected component!
export default ListAndUserConnection(mySelector)(MyComponent);
```

As a result, we have a single wrapping layer for `MyComponent` instead of two! 

It should be noted that it is possible to achieve this pattern by simply connecting these units of state to a `Galena` instance and calling `connect(GalenaInstance)`. 

However, as your Galena instances grow in size, using `connectMulti()` to fragment portions of state that often work together can result in better performance and less wasted reconciliations.

### Mutating State without createUseMutation()
When composing your State using `galena`, it's possible to mutate your units of state in your Preact Components without Hooks or HOC's. If you'd like to opt into hook-free state mutations, you may simply import the objects returned from `new Galena()`, `new Galena().composeState()`, and `new State()`. These objects are agnostic to framework, client and server!

```tsx
import { NavigationState } from "./AppState";

const Link = ({ route, text }) => {

  const navigate = (e) => {
    NavigationState.update(state => {
      state.route = e.target.href;
    });
  }

  return (
    <a href={route} onClick={navigate}>{text}</a>
  );
}
```

### Stateful Actions that can be used inside and outside of Preact!
For maximum code-reuse, you may choose to compose generic actions for your state instances. This architectural pattern can create a more Redux-like development experience - but without requiring you to manage any reducers.

```typescript
// NavigationMutations.ts
import { NavigationState } from "./AppState";

export const transitionRoute = (nextRoute: string) => {
  NavigationState.update(state => {
    state.route = nextRoute;
  });
}

export const updateRoutePermissions = (permissions: string) => {
  NavigationState.update(state => {
    state.permittedRoutes = permissions;
  });
}
```

Using this pattern, you can simply create your state mutations then import them for use in your Preact Components and business logic:

```tsx
import { transitionRoute } from "./NavigationMutations";

const Link = ({ route, text }: { route: string, text: string }) => {

  const navigate = (e) => {
    transitionRoute(e.target.href);
  }

  return (
    <a href={route} onClick={navigate}>{text}</a>
  );
}
```

In addition to creating redux-like actions, you can also create a more redux-like event emission pattern through Galena. For example, if you don't wish to interact with your state instances directly, you can try out something like this:

```typescript
import { EventEmitter } from "@figliolia/event-emitter"
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
      super.update(state => {
        state.listItems = payload
      })
    });
  }
}

// Next, you can create some redux-like actions to dispatch
// updates to your state
export const updateList = (list: number[]) => {
  MyStateStream.emit("UPDATE_LIST", list);
}
```
