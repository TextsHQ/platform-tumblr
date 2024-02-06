/**
 * Capitalizes the first letter of a string.
 */
function upperFirst(string: string) {
  return string[0].toUpperCase() + string.slice(1)
}

/**
 * Splits `string` into an array of its words.
 */
export function words(string: string) {
  const underlined = string
    // Remove non-word characters
    .replace(/\W/gu, '_')
    // Lowercase to uppercase boundaries
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    // Uppercase to lowercase boundaries
    .replace(/([A-Z])([a-z])/g, '_$1$2')
    // Alpha to number boundaries
    .replace(/([a-zA-Z])(\d)/g, '$1_$2')
    // Number to alpha boundaries
    .replace(/(\d)([a-zA-Z])/g, '$1_$2')

  // Separate and remove empty segments.
  return underlined.split('_').filter(w => w !== '')
}

/**
 * Converts a string to camelCase, removing non-alphanumerical characters.
 */
export function camelCase(string: string) {
  return words(string).reduce((result, word, index) => {
    const lowerWord = word.toLowerCase()
    return result + (index ? upperFirst(lowerWord) : lowerWord)
  }, '')
}

/**
 * Converts the object keys to camel case, recursively.
 */
export function camelCaseKeys(content: any): any {
  if (content instanceof Array) {
    return content.map(nextLevel => camelCaseKeys(nextLevel))
  }

  if (typeof content === 'object' && content !== null) {
    return Object.keys(content).reduce<Record<string, string>>((result, key) => {
      const convertedKey = camelCase(key)
      let value = content[key]

      if (typeof value === 'object') {
        value = camelCaseKeys(value)
      }

      result[convertedKey] = value

      return result
    }, {})
  }

  return content
}
