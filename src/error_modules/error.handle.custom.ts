export class ErrorExtender extends Error {
  statusCode: number;
  errorCode: string;
  success: boolean;
  constructor(
    message: string,
    statusCode: number,
    errorCode: string,
    success: boolean,
  ) {
    super(message);
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.success = success;

    Object.setPrototypeOf(this, ErrorExtender.prototype);
  }
}
