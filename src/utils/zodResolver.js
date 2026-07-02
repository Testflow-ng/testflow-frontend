/**
 * Minimal react-hook-form resolver for a zod schema. Avoids pulling in
 * @hookform/resolvers for the handful of auth forms we validate. Builds nested
 * error objects (RHF locates errors by path, e.g. errors.address.city), keeping
 * the first message per field.
 */
function setNested(target, path, value) {
  let node = target;
  for (let i = 0; i < path.length - 1; i += 1) {
    const key = path[i];
    if (typeof node[key] !== 'object' || node[key] === null) {
      node[key] = {};
    }
    node = node[key];
  }
  node[path[path.length - 1]] = value;
}

export function zodResolver(schema) {
  return async (values) => {
    const result = schema.safeParse(values);

    if (result.success) {
      return { values: result.data, errors: {} };
    }

    const errors = {};
    const seen = new Set();
    for (const issue of result.error.issues) {
      if (issue.path.length === 0) continue;
      const key = issue.path.join('.');
      if (seen.has(key)) continue;
      seen.add(key);
      setNested(errors, issue.path, { type: issue.code, message: issue.message });
    }

    return { values: {}, errors };
  };
}
