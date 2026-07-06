import { assert, Struct, type Infer } from "superstruct";
import { ErrorTypeCall } from "../error_modules/error.class.js";

export function superStructValidation<S extends Struct<any, any>>(
  structscheme: S,
  value: any,
): Infer<S> {
  try {
    assert(value, structscheme);
    return value as Infer<S>;
  } catch (err: any) {
    // Extract detailed validation errors from superstruct
    const failures = err.failures ? err.failures() : [];
    const errorMessages = failures.map((f: any) => 
      `${f.path.join('.')}: ${f.message}`
    ).join(', ');
    
    const message = errorMessages || err?.message || 'Validation failed';
    throw ErrorTypeCall.badRequest(message);
  }
}
