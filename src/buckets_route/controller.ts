import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { BucketsService } from './services';
import { CreateBucketDto, BucketNameQueryDto } from './dto';
import { SuccessResponse } from '../utilities/Success.Response';

@ApiTags('bucket')
@Controller('bucket')
export class BucketsController {
  constructor(
    private bucketsService: BucketsService
  ) { }

  @Post('create')
  @ApiOperation({ summary: 'Create a new MinIO bucket' })
  @ApiBody({ type: CreateBucketDto })
  @ApiResponse({ status: 200, description: 'Bucket created successfully' })
  async createBucket(@Body() createBucketDto: CreateBucketDto) {
    const result = await this.bucketsService.createBucket(createBucketDto.bucketName);
    return SuccessResponse('Bucket created successfully', result);
  }

  @Delete('delete')
  @ApiOperation({ summary: 'Delete a MinIO bucket' })
  @ApiQuery({ name: 'bucketName', description: 'Name of the bucket to delete', required: true })
  @ApiResponse({ status: 200, description: 'Bucket deleted successfully' })
  async deleteBucket(@Query() query: BucketNameQueryDto) {
    const result = await this.bucketsService.deleteBucket(query.bucketName);
    return SuccessResponse(`Bucket ${query.bucketName} deleted successfully`, result);
  }

  @Delete('clear')
  @ApiOperation({ summary: 'Clear all files from a MinIO bucket' })
  @ApiQuery({ name: 'bucketName', description: 'Name of the bucket to clear', required: true })
  @ApiResponse({ status: 200, description: 'Bucket cleared successfully' })
  async clearBucket(@Query() query: BucketNameQueryDto) {
    const result = await this.bucketsService.clearBucket(query.bucketName);
    return SuccessResponse(`Bucket ${query.bucketName} cleared successfully`, result);
  }

  @Get('list')
  @ApiOperation({ summary: 'List all MinIO buckets' })
  @ApiResponse({ status: 200, description: 'Buckets retrieved successfully' })
  async listBuckets() {
    const buckets = await this.bucketsService.bucketList();
    return SuccessResponse('Success', buckets);
  }

  @Get('peek')
  @ApiOperation({ summary: 'List all files in a MinIO bucket' })
  @ApiQuery({ name: 'bucketName', description: 'Name of the bucket to peek', required: true })
  @ApiResponse({ status: 200, description: 'Files retrieved successfully' })
  async peekBucket(@Query() query: BucketNameQueryDto) {
    const data = await this.bucketsService.peekBucket(query.bucketName);
    return SuccessResponse('Files retrieved successfully', data.files);
  }
}
