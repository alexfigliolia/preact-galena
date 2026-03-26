import type { State } from "@figliolia/galena";

export type SetDifference<A, B> = A extends B ? never : A;

export type SetComplement<A, A1 extends A> = SetDifference<A, A1>;

export type Subtract<T extends T1, T1 extends object> = Pick<
  T,
  SetComplement<keyof T, keyof T1>
>;

export type DerivedArguments<StateInstances extends State<any>[]> = {
  [I in keyof StateInstances]: ReturnType<StateInstances[I]["getSnapshot"]>;
} & { length: number };

export type DerivedSelector<StateInstances extends State<any>[]> = (
  state: DerivedArguments<StateInstances>,
  ownProps: any
) => Record<string, any>;
