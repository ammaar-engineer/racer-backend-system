import { static_output_types } from "src/types/static_output_types";

export function SuccessResponse(message: string, data?: any): static_output_types {
  return {
    message,
    statusCode: 200,
    data: data ?? null,
    errorCode: "",
    success: true
  }
}
