import { createContext } from "preact";
import type { Galena } from "@figliolia/galena";
import { useContext } from "preact/hooks";
import type { PropsWithChildren } from "preact/compat";

/**
 * Create Galena Provider
 *
 * For dependency injection with Galena, you can use this
 * function to produce a Context provider and a corresponding
 * `useGalena` hook
 *
 * ```typescript
 * import { Galena, createGalenaProvider } from "@figliolia/galena";
 *
 * const galena = new Galena({
 *   // state tree
 * }, ...middleware);
 *
 * const { GalenaProvider, useGalena } = createGalenaProvider(galena);
 * ```
 *
 * By wrapping your application in the `GalenaProvider` returned, you
 * can access your instance anywhere in your react code by calling
 * `useGalena()`
 */
export function createGalenaProvider<T extends Galena<any>>(galena: T) {
  const GalenaContext = createContext<T>(galena);
  /**
   * Galena Provider
   *
   * A context provider for your `Galena` instance to work with
   * React dependency injection
   */
  function GalenaProvider({ children }: PropsWithChildren) {
    return (
      <GalenaContext.Provider value={galena}>{children}</GalenaContext.Provider>
    );
  }
  /**
   * Use Galena
   *
   * Returns the instance of Galena provided by the `GalenaProvider`
   */
  function useGalena() {
    return useContext(GalenaContext);
  }
  return { GalenaProvider, useGalena };
}
