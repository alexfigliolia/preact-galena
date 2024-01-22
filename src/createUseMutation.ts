import type { Mutations, ReactiveInterface } from "./types";

/**
 * ### Create Use Mutation
 * A factory for generating State mutations in the form of Preact Hooks!
 *
 * ### Composing State and Mutation Hooks!
 *
 * ```typescript
 * // AppState.ts
 * import { Galena } from "@figliolia/galena";
 * import { createUseMutation } from "@figliolia/preact-galena";
 *
 * const AppState = new Galena();
 *
 * const NavigationState = AppState.composeState("navigation", {
 *   route: "/",
 *   permittedRoutes: "/**"
 * });
 *
 * export const useAppStateMutation = createUseMutation(AppState);
 * // or using the Navigation Unit
 * export const useNavigationMutation = createUseMutation(NavigationState);
 * ```
 *
 * ### Using Mutation Hooks in Preact
 * ```tsx
 * import { useAppStateMutation, useNavigationMutation } from "./AppState";
 *
 * const Link = ({ route, text }) => {
 *   const { update, backgroundUpdate, priorityUpdate } = useAppStateMutation();
 *   // or using the Navigation unit
 *   const { update, backgroundUpdate, priorityUpdate } = useNavigationMutation();
 *
 *   const navigate = (e) => {
 *     // using the App State hook
 *     update("navigation", state => {
 *       state.route = e.dataset.route
 *     });
 *     // or using the Navigation hook
 *     update(state => {
 *       state.route = e.dataset.route;
 *     });
 *   }
 *
 *   return (
 *     <a
 *      href={route}
 *      data-route={route}
 *      onClick={navigate}>{text}</a>
 *   );
 * }
 * ```
 *
 * To read more about `Galena`'s various mutation methods, please reference the
 * API docs:
 *
 * https://github.com/alexfigliolia/galena#api-reference
 */
export function createUseMutation<T extends ReactiveInterface>(state: T) {
  const mutations: Mutations<T> = {
    update: state.update.bind(state),
    backgroundUpdate: state.backgroundUpdate.bind(state),
    priorityUpdate: state.priorityUpdate.bind(state),
  };
  return function useGalenaMutation() {
    return mutations;
  };
}
