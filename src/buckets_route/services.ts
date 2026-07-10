import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { Buckets, Files } from '../db/entities';
import { BucketsValidation } from '../validation/buckets_validation';
import { ConflictException } from '../CustomExceptionHandle';
import * as Minio from 'minio';

@Injectable()
export class BucketsService {
  constructor(
    @InjectRepository(Buckets)
    private readonly bucketRepo: Repository<Buckets>,
    @InjectRepository(Files)
    private readonly fileRepo: Repository<Files>,
    private readonly bucketValidation: BucketsValidation,
    @Inject('MINIO_CLIENT')
    private readonly minioClient: Minio.Client
  ) { }

  /**
   * Peek bucket and return list of files
   */
  async peekBucket(bucketName: string) {
    await this.bucketValidation.checkBucketExists(
      this.bucketRepo,
      bucketName,
      { relations: { files: true } }
    );

    const filesRaw = await this.fileRepo.find({
      where: {
        bucket: { name: bucketName }
      },
      relations: {
        bucket: true
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        bucket: {
          name: true
        }
      }
    });

    const files = filesRaw.map(({ name }) => name);

    return {
      bucketName,
      files
    };
  }

  /**
   * Create a new bucket
   */
  async createBucket(bucketName: string) {
    await this.bucketValidation.checkBucketNotExists(this.bucketRepo, bucketName);

    // Create bucket in MinIO
    await this.minioClient.makeBucket(bucketName, 'us-east-1');

    // Set public read policy
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "PublicRead",
          Effect: "Allow",
          Principal: {
            AWS: ["*"]
          },
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${bucketName}/*`]
        }
      ]
    };

    await this.minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));

    // Save to database
    try {
      const newBucket = this.bucketRepo.create({ name: bucketName });
      const savedBucket = await this.bucketRepo.save(newBucket);

      return {
        createdAt: savedBucket.createdAt,
        name: savedBucket.name
      };
    } catch (err: any) {
      if (err instanceof QueryFailedError && err.driverError?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new ConflictException('Data already exist');
      }
      throw err;
    }
  }

  /**
   * Delete a bucket
   */
  async deleteBucket(bucketName: string) {
    const bucket = await this.bucketValidation.checkBucketExists(
      this.bucketRepo,
      bucketName,
      { relations: { files: true } }
    );
    this.bucketValidation.checkBucketEmpty(bucket);

    // Remove from MinIO
    await this.minioClient.removeBucket(bucketName);

    // Remove from database
    try {
      await this.bucketRepo.remove(bucket);

      return {
        bucketName
      };
    } catch (err: any) {
      if (err instanceof QueryFailedError && err.driverError?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new ConflictException('Data already exist');
      }
      throw err;
    }
  }

  /**
   * Clear all files from a bucket
   */
  async clearBucket(bucketName: string) {
    await this.bucketValidation.checkBucketExists(
      this.bucketRepo,
      bucketName,
      { relations: { files: true } }
    );

    // Delete all objects from MinIO
    const objectsList = this.minioClient.listObjects(bucketName, '', true);
    const objectsToDelete: string[] = [];

    for await (const obj of objectsList) {
      if (obj.name) {
        objectsToDelete.push(obj.name);
      }
    }

    if (objectsToDelete.length > 0) {
      await this.minioClient.removeObjects(bucketName, objectsToDelete);
    }

    // Remove files from database
    try {
      const bucket = await this.bucketRepo.findOne({
        where: { name: bucketName },
        relations: { files: true }
      });

      if (bucket?.files) {
        await this.fileRepo.remove(bucket.files);
      }

      return {
        bucketName,
        deletedFiles: objectsToDelete
      };
    } catch (err: any) {
      if (err instanceof QueryFailedError && err.driverError?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new ConflictException('Data already exist');
      }
      throw err;
    }
  }

  /**
   * List all buckets
   */
  async bucketList() {
    try {
      const buckets = await this.bucketRepo.find();
      return buckets.map((data) => data.name);
    } catch (err: any) {
      if (err instanceof QueryFailedError && err.driverError?.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new ConflictException('Data already exist');
      }
      throw err;
    }
  }
}
