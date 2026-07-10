import { IsNotEmpty, IsString, Length } from 'class-validator';

/**
 * DTO for creating a bucket
 * Body validation for POST /create
 */
export class CreateBucketDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 15, { message: 'bucketName must be between 3 and 15 characters' })
  bucketName: string;
}

/**
 * DTO for bucket name query parameter
 * Query validation for DELETE /delete, DELETE /clear, GET /peek
 */
export class BucketNameQueryDto {
  @IsString()
  @IsNotEmpty()
  bucketName: string;
}
