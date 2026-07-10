import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Buckets, Files } from '../db/entities';
import { BucketsValidation } from '../validation/buckets_validation';
import { SqliteHandle } from '../utilities/typeorm.handle';
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
    const savedBucket = await SqliteHandle(this.bucketRepo, async (repo) => {
      const newBucket = repo.create({ name: bucketName });
      return await repo.save(newBucket);
    });

    return {
      createdAt: savedBucket.createdAt,
      name: savedBucket.name
    };
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
    await SqliteHandle(this.bucketRepo, async (repo) => {
      await repo.remove(bucket);
    });

    return {
      bucketName
    };
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
    
    objectsList.on('data', (file) => {
      objectsToDelete.push(file.name as string)
    })
    
    // for await (const obj of objectsList) {
    //   if (obj.name) {
    //     objectsToDelete.push(obj.name);
    //   }
    // }

    if (objectsToDelete.length > 0) {
      await this.minioClient.removeObjects(bucketName, objectsToDelete);
    }

    // Remove files from database
    await SqliteHandle(this.fileRepo, async (repo) => {
      const bucket = await this.bucketRepo.findOne({
        where: { name: bucketName },
        relations: { files: true }
      });

      if (bucket?.files) {
        await repo.remove(bucket.files);
      }
    });

    return {
      bucketName,
      deletedFiles: objectsToDelete
    };
  }

  /**
   * List all buckets
   */
  async bucketList() {
    const buckets = await SqliteHandle(this.bucketRepo, async (repo) => {
      return await repo.find();
    });
    return buckets.map((data) => data.name);
  }
}
