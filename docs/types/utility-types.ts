export type ReadonlyNonEmptyArray<T> = readonly [T, ...ReadonlyArray<T>];
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * Use for testing when creating type literals which contain values
 * for the optional fields. This allows reuse of fixture data without
 * performing additional type-checking.
 *
 * @example
 *     interface Issue {
 *       name: string;
 *       sponsor: string;
 *     }
 *
 *     interface Vote {
 *       choice: 'yes' | 'no';
 *       issue?: Issue;
 *     }
 *
 *     const a: Vote = {choice: 'yes', issue: {name: 'tabs-vs-semicolons', sponsor: 'Richard'}};
 *     a.issue.name; // type error! Object [issue] is possibly undefined
 *
 *     const b: WithOptionals<Vote, 'issue'> = a;
 *     b.issue.name; // no type error 👍
 */
export type WithOptionals<T, Fields extends keyof T> = T & Required<Pick<T, Fields>>;

/**
 * Utility type similar to Partial, but which recursively applies to all properties,
 * instead of just one level deep.
 */
export type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
  } :
  T;
