import { IsString, IsNotEmpty, MinLength } from 'class-validator';

/**
 * DTO for file upload headers validation
 * Corresponds to POST /upload endpoint
 */
export class UploadFileHeadersDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  'x-file-name': string;

  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  'x-bucket-name': string;

  @IsString()
  @IsNotEmpty()
  'content-type': string;

  @IsString()
  @IsNotEmpty()
  'content-length': string;
}

/**
 * DTO for file download query validation
 * Corresponds to GET /download endpoint
 */
export class DownloadFileQueryDto {
  @IsString()
  @IsNotEmpty()
  bucketName: string;

  @IsString()
  @IsNotEmpty()
  fileName: string;
}

/**
 * DTO for file delete query validation
 * Corresponds to DELETE /delete endpoint
 */
export class DeleteFileQueryDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  bucketName: string;
}
