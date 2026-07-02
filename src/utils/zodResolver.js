/**
 * Minimal react-hook-form resolver for a zod schema. Avoids pulling in
 * @hookform/resolvers for the handful of flat auth forms we validate.
 */
export function zodResolver(schema) {
  return async (values) => {
    const result = schema.safeParse(values);

    if (result.success) {
      return { values: result.data, errors: {} };
    }

    const errors = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.');
      if (path && !errors[path]) {
        errors[path] = { type: issue.code, message: issue.message };
      }
    }

    return { values: {}, errors };
  };
}
