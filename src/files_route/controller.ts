import { Controller, Post, Get, Delete, Headers, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { ApiTags, ApiOperation, ApiHeaders, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { FileRouteServices } from './services';
import { UploadFileHeadersDto, DownloadFileQueryDto, DeleteFileQueryDto } from './dto';
import { SuccessResponse } from '../utilities/Success.Response';

@ApiTags('file')
@Controller('file')
export class FilesController {
  constructor(
    private readonly fileService: FileRouteServices,
  ) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file to MinIO bucket' })
  @ApiHeaders([
    { name: 'x-file-name', description: 'Name of the file to upload', required: true },
    { name: 'x-bucket-name', description: 'Name of the MinIO bucket', required: true },
    { name: 'content-type', description: 'MIME type of the file', required: true },
    { name: 'content-length', description: 'Size of the file in bytes', required: true },
  ])
  @ApiResponse({ status: 200, description: 'File uploaded successfully' })
  async uploadFile(
    @Req() req: Request,
    @Headers() headers: UploadFileHeadersDto,
  ) {
    const fileName = headers['x-file-name'];
    const bucketName = headers['x-bucket-name'];
    const contentType = headers['content-type'];
    const fileSize = parseInt(headers['content-length'], 10);

    const { url } = await this.fileService.uploadFile(
      req,
      fileName,
      bucketName,
      contentType,
      fileSize,
    );

    return SuccessResponse('File uploaded successfully', { url });
  }

  @Get('download')
  @ApiOperation({ summary: 'Download a file from MinIO bucket' })
  @ApiQuery({ name: 'bucketName', description: 'Name of the S3 bucket', required: true })
  @ApiQuery({ name: 'fileName', description: 'Name of the file to download', required: true })
  @ApiResponse({ status: 200, description: 'File download URL retrieved successfully' })
  async downloadFile(@Query() query: DownloadFileQueryDto) {
    const { url: rawUrl } = await this.fileService.downloadFile(
      query.bucketName,
      query.fileName,
    );

    // Note: Replace 'localhost:9000' with your VPS IP if needed
    // const url = rawUrl.replace('localhost:9000', 'your-vps-ip');

    return SuccessResponse('File downloaded', { url: rawUrl });
  }

  @Delete('delete')
  @ApiOperation({ summary: 'Delete a file from MinIO bucket' })
  @ApiQuery({ name: 'fileName', description: 'Name of the file to delete', required: true })
  @ApiQuery({ name: 'bucketName', description: 'Name of the S3 bucket', required: true })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  async deleteFile(@Query() query: DeleteFileQueryDto) {
    await this.fileService.deleteFile(query.fileName, query.bucketName);

    return SuccessResponse('File deleted');
  }
}
