import { useEffect, useMemo, useRef } from "preact/hooks";
import { useSyncExternalStore, type RefObject } from "preact/compat";
import type { NonFunction, State } from "@figliolia/galena";

export function useStableSelector<F extends (...args: any[]) => any>(
  selector: F
) {
  const stableSelector = useRef(selector);

  useEffect(() => {
    stableSelector.current = ((...args: Parameters<typeof selector>) =>
      selector(...args)) as F;
  }, [selector]);

  return stableSelector;
}

export function useStateHookAPI<T, U>(
  value: State<T>,
  selector: RefObject<(state: NonFunction<T>) => U>
) {
  const state = useSyncExternalStore(value.subscribe, value.getSnapshot);
  const selectedValue = useMemo(
    () => selector.current!(state),
    [state, selector]
  );
  return useMemo(
    () => [selectedValue, value.update] as const,
    [selectedValue, value]
  );
}
