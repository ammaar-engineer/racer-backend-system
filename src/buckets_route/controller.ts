import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { BucketsService } from './services';
import { CreateBucketDto, BucketNameQueryDto } from './dto';
import { SuccessResponse } from '../utilities/Success.Response';

@Controller('bucket')
export class BucketsController {
  constructor(
    private bucketsService: BucketsService
  ) { }

  @Post('create')
  async createBucket(@Body() createBucketDto: CreateBucketDto) {
    const result = await this.bucketsService.createBucket(createBucketDto.bucketName);
    return SuccessResponse('Bucket created successfully', result);
  }

  @Delete('delete')
  async deleteBucket(@Query() query: BucketNameQueryDto) {
    const result = await this.bucketsService.deleteBucket(query.bucketName);
    return SuccessResponse(`Bucket ${query.bucketName} deleted successfully`, result);
  }

  @Delete('clear')
  async clearBucket(@Query() query: BucketNameQueryDto) {
    const result = await this.bucketsService.clearBucket(query.bucketName);
    return SuccessResponse(`Bucket ${query.bucketName} cleared successfully`, result);
  }

  @Get('list')
  async listBuckets() {
    const buckets = await this.bucketsService.bucketList();
    return SuccessResponse('Success', buckets);
  }

  @Get('peek')
  async peekBucket(@Query() query: BucketNameQueryDto) {
    const data = await this.bucketsService.peekBucket(query.bucketName);
    return SuccessResponse('Files retrieved successfully', data.files);
  }
}
