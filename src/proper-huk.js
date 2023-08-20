import * as internal from './internal';

/**
 * Check if a given property (by name) exists in the object, either directly or inherited.
 *
 * @param {Object} obj - The object to inspect.
 * @param {String|Symbol} name - The name of the property to check for.
 * @returns {Boolean} - Returns true if the property exists, otherwise false.
 *
 * @example
 * const obj = { key: 'value' };
 * console.log(testProperExists(obj, 'key'));  // Outputs: true
 * console.log(testProperExists(obj, 'unknown'));  // Outputs: false
 */
export function testProperExists(obj, name) {
    return obj != null && name in Object(obj);
}

/**
 * Retrieves the value of a property in an object using a string path.
 *
 * @param {Object} obj - The object to fetch the value from.
 * @param {String} path - The string path to the desired property (e.g. "a.b.c").
 * @returns {*} - The value of the property, or undefined if the path doesn't exist.
 *
 * @example
 * const obj = { a: { b: { c: 'Hello' } } };
 * console.log(getProper(obj, 'a.b.c'));  // Outputs: Hello
 * console.log(getProper(obj, 'a.b.unknown'));  // Outputs: undefined
 */
export function getProper(obj, path) {
  const info = internal.getProperDetail(obj, path);
  return info.value;
}

/**
 * Sets (or updates) the value of a property in an object using a string path.
 *
 * @param {Object} obj - The object to modify.
 * @param {String} path - The string path to the property you want to set (e.g. "a.b.c").
 * @param {*} val - The value you want to set for the property.
 * @returns {Object} - The original object with the modified property.
 *
 * @example
 * const obj = { a: { b: { } } };
 * putProper(obj, 'a.b.c', 'Hello');
 * console.log(obj);  // Outputs: { a: { b: { c: 'Hello' } } }
 */
export function putProper(obj, path, val) {
  const parsed = internal.splitPropers(path);
  internal.putPropertyInternal(obj, val, parsed);
  return obj;
}
