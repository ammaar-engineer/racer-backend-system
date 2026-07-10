import { Controller, Post, Get, Delete, Headers, Query, Req } from '@nestjs/common';
import type { Request } from 'express';
import { FileRouteServices } from './services';
import { UploadFileHeadersDto, DownloadFileQueryDto, DeleteFileQueryDto } from './dto';
import { SuccessResponse } from '../utilities/Success.Response';

@Controller('file')
export class FilesController {
  constructor(
    private readonly fileService: FileRouteServices,
  ) {}

  @Post('upload')
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
  async deleteFile(@Query() query: DeleteFileQueryDto) {
    await this.fileService.deleteFile(query.fileName, query.bucketName);

    return SuccessResponse('File deleted');
  }
}
