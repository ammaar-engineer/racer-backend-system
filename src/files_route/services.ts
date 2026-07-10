import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PassThrough } from 'stream';
import type { Request } from 'express';
import * as Minio from 'minio';
import { Buckets, Files } from '../db/entities';
import { BucketsValidation } from '../validation/buckets_validation';
import { ConflictException, NotFoundException, InternalServerErrorException } from '../CustomExceptionHandle';
import { SqliteHandle } from '../utilities/typeorm.handle';

@Injectable()
export class FileRouteServices {
  constructor(
    @InjectRepository(Files)
    private readonly fileRepo: Repository<Files>,
    @InjectRepository(Buckets)
    private readonly bucketRepo: Repository<Buckets>,
    @Inject('MINIO_CLIENT')
    private readonly minioClient: Minio.Client,
    private readonly bucketValidation: BucketsValidation,
  ) {}

  async uploadFile(
    req: Request,
    fileName: string,
    bucketName: string,
    contentType: string,
    fileSize: number,
  ) {
    const fileExists = await this.fileRepo.findOne({
      where: {
        name: fileName,
        bucket: { name: bucketName },
      },
      relations: {
        bucket: true,
      },
    });

    if (fileExists) {
      throw new ConflictException('File already exist');
    }

    const bucket = await this.bucketValidation.checkBucketExists(
      this.bucketRepo,
      bucketName,
    );

    const passThroughStream = new PassThrough();
    req.pipe(passThroughStream);

    try {
      await SqliteHandle(this.fileRepo, async (repo) => {
        const newFile = new Files();
        newFile.name = fileName;
        newFile.bucket = bucket.id as any;
        return await repo.save(newFile);
      });

      await this.minioClient.putObject(
        bucketName,
        fileName,
        passThroughStream,
        fileSize,
        {
          'Content-Type': contentType,
          'Content-Disposition': 'attachment',
        },
      );

      const downloadUrl = await this.minioClient.presignedGetObject(
        bucketName,
        fileName,
      );

      return {
        url: downloadUrl,
      };
    } catch (error) {
      try {
        await this.minioClient.removeObject(bucketName, fileName);
      } catch (cleanupError) {
        throw new InternalServerErrorException('Cleaning corrupted file Error');
      }
      throw error;
    }
  }

  async downloadFile(bucketName: string, fileName: string) {
    const bucket = await this.bucketValidation.checkBucketExists(
      this.bucketRepo,
      bucketName,
    );

    const fileExist = await this.fileRepo.findOne({
      where: {
        name: fileName,
        bucket: {
          id: bucket.id,
        },
      },
    });

    if (!fileExist) {
      throw new NotFoundException('File not found');
    }

    const url = await this.minioClient.presignedGetObject(
      bucketName,
      fileName,
      3600,
    );

    return {
      file: fileExist,
      bucket,
      url,
    };
  }

  async deleteFile(fileName: string, bucketName: string) {
    const bucket = await this.bucketValidation.checkBucketExists(
      this.bucketRepo,
      bucketName,
    );

    const file = await this.fileRepo.findOne({
      where: {
        name: fileName,
        bucket: { id: bucket.id },
      },
    });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    await this.minioClient.removeObject(bucketName, fileName);

    await SqliteHandle(this.fileRepo, async (repo) => {
      await repo.delete({ name: file.name });
    });
  }
}
