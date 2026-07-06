import type {
  ErrorRequestHandler,
  Request,
  Response,
  NextFunction,
} from "express";
import type { error_structure } from "../error_modules/types.js";
import { EnvVariable } from "../utilities/envStatus.js";

export function ErrorMiddleware() {
  return (
    err: ErrorRequestHandler,
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    // Apa kita perlu menambahkan field error? biasa nya field ini berisi pesan list error dalam bentuk array
    const { statusCode, errorCode, success, message, data } =
      err as unknown as error_structure;

    // EnvVariable('NODE_ENV') == 'development' ? console.log(err) : console.log()
    
    res.status(statusCode || 500).json({
      statusCode: statusCode || 500,
      errorCode: errorCode || "INTERNAL_SERVER_ERROR",
      success: success || false,
      message: message || "Internal server error",
      data: null,
    });
  };
}
