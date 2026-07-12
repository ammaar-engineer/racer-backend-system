import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a bucket
 * Body validation for POST /create
 */
export class CreateBucketDto {
  @ApiProperty({
    description: 'Name of the bucket to create',
    example: 'my-bucket',
    minLength: 3,
    maxLength: 15,
  })
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
  @ApiProperty({
    description: 'Name of the bucket',
    example: 'my-bucket',
  })
  @IsString()
  @IsNotEmpty()
  bucketName: string;
}
