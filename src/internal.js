// Regular expression to match path parts, including escaped dots and other parts.
const PATH_PARTS_REGEXP = /(\\\.|[^.]+?)+/g;

// Regular expression to match array index notation.
const INDEX_REGEXP = /^\[(\d+)\]$/;

// Helper function to check if the provided value is one of the disallowed property names.
function isDisallowedValue(value) {
  return ["constructor", "__proto__", "prototype"].includes(value);
}

// Split the given property string into an array of property names and array indices.
function splitPropers(property) {
  const str = property.replace(/([^\\])\[/g, "$1.[");
  const arr = str.match(PATH_PARTS_REGEXP);

  // Map each part to its respective type (named property or array index).
  return arr.map((value) => {
    if (isDisallowedValue(value)) {
      return {};
    }
    const mArr = INDEX_REGEXP.exec(value);
    return mArr
      ? { np: parseFloat(mArr[1]) } // np stands for number property
      : { sp: value.replace(/\\([.[\]])/g, "$1") }; // sp stands for string property
  });
}

// Get a nested property's value from the given object based on the provided property array.
export function getPropertyInternal(obj, pArr, depth = pArr.length) {
  return pArr.slice(0, depth).reduce((acc, target) => {
    return acc
      ? target.sp !== undefined
        ? acc[target.sp]
        : acc[target.np]
      : undefined;
  }, obj);
}

// Set a nested property's value in the given object based on the provided property array.
export function putPropertyInternal(obj, value, pArr) {
  return (pArr.slice(0, -1).reduce((acc, target, idx) => {
    // Determine current key (named property or array index).
    const key = target.sp !== undefined ? target.sp : target.np;

    if (!acc[key]) {
      const nextPart = pArr[idx + 1];
      acc[key] = nextPart && nextPart.np !== undefined ? [] : {};
    }
    // Continue traversing.
    return acc[key];
  }, obj)[pArr[pArr.length - 1].sp || pArr[pArr.length - 1].np] = value);
}

// Get detailed information about a nested property in the given object.
export function getProperDetail(obj, proper) {
  const pArr = splitPropers(proper);
  const last = pArr[pArr.length - 1];
  const name = last.sp || last.np;

  // Get parent object or array of the target property.
  const parent =
    pArr.length > 1 ? getPropertyInternal(obj, pArr, pArr.length - 1) : obj;

  // Get the target property's value.
  const value = getPropertyInternal(obj, pArr);

  // Return a summary.
  return {
    parent, // Parent object or array
    name, // Property name or array index
    value, // Property value
    exists: parent && name in Object(parent), // Boolean indicating if the property exists
  };
}

/**
 * Retrieves all property paths of an object, including nested properties.
 */
export function getAllProperPaths(obj, currentPath = []) {
  let paths = [];

  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }
    if (isDisallowedValue(key)) {
      continue;
    }

    // Construct the new path for this property
    const newPath = [...currentPath, key];
    paths.push(newPath.join('.'));

    // If the property value is an object, recursively find its property paths
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      const subPaths = getAllProperPaths(obj[key], newPath);
      paths = paths.concat(subPaths);
    }
  }

  return paths;
}
