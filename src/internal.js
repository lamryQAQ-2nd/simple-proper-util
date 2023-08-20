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
  // Replace [ with .[ to handle array index notation.
  const str = property.replace(/([^\\])\[/g, "$1.[");

  // Extract property and index parts using the regular expression.
  const arr = str.match(PATH_PARTS_REGEXP);

  // Map each part to its respective type (named property or array index).
  return arr.map((value) => {
    // If it's a disallowed value, return an empty object.
    if (isDisallowedValue(value)) {
      return {};
    }

    // Check if the value matches array index notation.
    const mArr = INDEX_REGEXP.exec(value);
    // If so, return it as an index. Otherwise, return as a named property.
    return mArr
      ? { np: parseFloat(mArr[1]) } // np stands for number property
      : { sp: value.replace(/\\([.[\]])/g, "$1") }; // sp stands for string property
  });
}

// Get a nested property's value from the given object based on the provided property array.
export function getPropertyInternal(obj, pArr, depth = pArr.length) {
  // Iterate through the properties using reduce.
  return pArr.slice(0, depth).reduce((acc, target) => {
    // Navigate deeper into the object based on property type (named or index).
    return acc
      ? target.sp !== undefined
        ? acc[target.sp]
        : acc[target.np]
      : undefined;
  }, obj);
}

// Set a nested property's value in the given object based on the provided property array.
export function putPropertyInternal(obj, value, pArr) {
  // Use reduce to traverse and/or initialize the path in the object.
  return (pArr.slice(0, -1).reduce((acc, target, idx) => {
    // Determine current key (named property or array index).
    const key = target.sp !== undefined ? target.sp : target.np;

    // If the property doesn't exist yet, create it.
    if (!acc[key]) {
      const nextPart = pArr[idx + 1];
      // Decide if the next part should be an array or an object.
      acc[key] = nextPart && nextPart.np !== undefined ? [] : {};
    }
    // Continue traversing.
    return acc[key];
  }, obj)[pArr[pArr.length - 1].sp || pArr[pArr.length - 1].np] = value);
}

// Get detailed information about a nested property in the given object.
export function getProperDetail(obj, proper) {
  // Split the property string into parts.
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
