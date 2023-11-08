// These must cascade from max to min as the first match returns the type
// e.g. 8 indices should include an 8-tuple of strings
export type Replacements<S extends string> = S extends `${string | undefined}${'%8$s'}${string}` ?
  [string, string, string, string, string, string, string, string] :
  S extends `${string}${'%7$s'}${string}` ?
    [string, string, string, string, string, string, string] :
  S extends `${string}${'%6$s'}${string}` ? [string, string, string, string, string, string] :
  S extends `${string}${'%5$s'}${string}` ? [string, string, string, string, string] :
  S extends `${string}${'%4$s'}${string}` ? [string, string, string, string] :
  S extends `${string}${'%3$s'}${string}` ? [string, string, string] :
  S extends `${string}${'%2$s'}${string}` ? [string, string] :
  S extends `${string}${'%1$s'}${string}` ? [string] :
  undefined;

// Replacements with numbers implicitly have 1-index provided as the count
// Apply the same logic but with a (n-1)-tuples.
export type NumberedReplacements<
  A extends string,
  B extends string,
> = A extends `${string}${'%4$s'}${string}` ? [string, string, string] :
  B extends `${string}${'%4$s'}${string}` ? [string, string, string] :
  A extends `${string}${'%3$s'}${string}` ? [string, string] :
  B extends `${string}${'%3$s'}${string}` ? [string, string] :
  A extends `${string}${'%2$s'}${string}` ? [string] :
  B extends `${string}${'%2$s'}${string}` ? [string] :
  undefined;

export interface ContextTranslation {
  <S extends string>(context: string, phrase: S, replacements?: Replacements<S>): string;
}

export interface NumberedContextTranslation {
  <SSingle extends string, SPlural extends string>(
    context: string,
    singular: SSingle,
    plural: SPlural,
    count: number,
    replacements?: NumberedReplacements<SSingle, SPlural>,
  ): string;
}
export interface NumberedTranslation {
  <SSingle extends string, SPlural extends string>(
    singular: SSingle,
    plural: SPlural,
    count: number,
    replacements?: NumberedReplacements<SSingle, SPlural>,
  ): string;
}

export interface SimpleTranslation {
  <S extends string>(phrase: S, replacements?: Replacements<S>): string;
}
