/**
 * Structure that is resilient to JSON serialization and parsing.
 *
 * This has known limitations and is not intended to be a faithful representation of the behavior
 * of JSON stringify and/or parse. It will help detect common problems such as attempted
 * serialization of functions.
 *
 * @see https://github.com/microsoft/TypeScript/issues/1897#issuecomment-72546389
 */
export type JSONSerializable =
  | boolean
  | null
  | number
  | string
  | JSONSerializable[]
  | { [key: string]: JSONSerializable };
