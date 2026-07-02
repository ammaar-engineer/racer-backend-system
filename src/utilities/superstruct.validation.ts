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
    console.log(err, 'Ini penyebab nya')
    throw ErrorTypeCall.badRequest(err?.message)
  }
}
