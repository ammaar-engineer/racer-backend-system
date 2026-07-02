import { ErrorExtender } from "./error.handle.custom.js";
import type { error_structure } from "./types.js";

function sendError({
  message,
  statusCode,
  errorCode,
  success,
}: error_structure) {
  throw new ErrorExtender(message, statusCode, errorCode, success);
}

export class ErrorType {
  // --- CLIENT ERRORS (4xx) ---

  // 400 Bad Request - Input tidak valid secara umum
  badRequest = (message: string = "Request tidak valid.") => {
    sendError({
      message,
      statusCode: 400,
      errorCode: "BAD_REQUEST",
      success: false,
      data: null,
    });
  };

  // 400 Bad Request - Khusus gagal validasi skema/form
  validationFailed = (message: string = "Validasi input gagal.") => {
    sendError({
      message,
      statusCode: 400,
      errorCode: "VALIDATION_FAILED",
      success: false,
      data: null,
    });
  };

  // 401 Unauthorized - Belum login / Token hangus
  unauthorized = (message: string = "Autentikasi diperlukan.") => {
    sendError({
      message,
      statusCode: 401,
      errorCode: "UNAUTHORIZED",
      success: false,
      data: null,
    });
  };

  // 403 Forbidden - Sudah login, tapi tidak punya hak akses (Role tidak sesuai)
  forbidden = (
    message: string = "Anda tidak memiliki akses ke resource ini.",
  ) => {
    sendError({
      message,
      statusCode: 403,
      errorCode: "FORBIDDEN",
      success: false,
      data: null,
    });
  };

  // 404 Not Found - Data / Route tidak ditemukan
  notFound = (message: string = "Resource tidak ditemukan.") => {
    sendError({
      message,
      statusCode: 404,
      errorCode: "NOT_FOUND",
      success: false,
      data: null,
    });
  };

  // 409 Conflict - Data duplikat (misal: email sudah terdaftar)
  conflict = (message: string = "Resource sudah ada atau konflik terjadi.") => {
    sendError({
      message,
      statusCode: 409,
      errorCode: "CONFLICT",
      success: false,
      data: null,
    });
  };

  // 429 Too Many Requests - Rate limiting
  tooManyRequests = (
    message: string = "Terlalu banyak permintaan. Silakan coba lagi nanti.",
  ) => {
    sendError({
      message,
      statusCode: 429,
      errorCode: "TOO_MANY_REQUESTS",
      success: false,
      data: null,
    });
  };

  // --- SERVER ERRORS (5xx) ---

  // 500 Internal Server Error - Crash tidak terduga atau error database
  internalServerError = (
    message: string = "Terjadi kesalahan internal pada server.",
  ) => {
    sendError({
      message,
      statusCode: 500,
      errorCode: "INTERNAL_SERVER_ERROR",
      success: false,
      data: null,
    });
  };

  // 503 Service Unavailable - Server overload atau sedang maintenance
  serviceUnavailable = (message: string = "Layanan sedang tidak tersedia.") => {
    sendError({
      message,
      statusCode: 503,
      errorCode: "SERVICE_UNAVAILABLE",
      success: false,
      data: null,
    });
  };
}

export const ErrorTypeCall = new ErrorType();
