import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for file upload headers validation
 * Corresponds to POST /upload endpoint
 */
export class UploadFileHeadersDto {
  @ApiProperty({
    description: 'Name of the file to upload',
    example: 'document.pdf',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  'x-file-name': string;

  @ApiProperty({
    description: 'Name of the MinIO bucket',
    example: 'my-bucket',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  'x-bucket-name': string;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'application/pdf',
  })
  @IsString()
  @IsNotEmpty()
  'content-type': string;

  @ApiProperty({
    description: 'Size of the file in bytes',
    example: '1024',
  })
  @IsString()
  @IsNotEmpty()
  'content-length': string;
}

/**
 * DTO for file download query validation
 * Corresponds to GET /download endpoint
 */
export class DownloadFileQueryDto {
  @ApiProperty({
    description: 'Name of the MinIO bucket',
    example: 'my-bucket',
  })
  @IsString()
  @IsNotEmpty()
  bucketName: string;

  @ApiProperty({
    description: 'Name of the file to download',
    example: 'document.pdf',
  })
  @IsString()
  @IsNotEmpty()
  fileName: string;
}

/**
 * DTO for file delete query validation
 * Corresponds to DELETE /delete endpoint
 */
export class DeleteFileQueryDto {
  @ApiProperty({
    description: 'Name of the file to delete',
    example: 'document.pdf',
  })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({
    description: 'Name of the MinIO bucket',
    example: 'my-bucket',
  })
  @IsString()
  @IsNotEmpty()
  bucketName: string;
}
