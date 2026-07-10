import { Injectable } from '@nestjs/common';
import { Repository, FindOptionsRelations } from 'typeorm';
import { Buckets } from '../db/entities';
import { NotFoundException, ConflictException } from '../CustomExceptionHandle';

@Injectable()
export class BucketsValidation {

  async checkBucketExists(
    bucketRepo: Repository<Buckets>,
    bucketName: string,
    options?: { relations?: FindOptionsRelations<Buckets> }
  ): Promise<Buckets> {

    const bucket = await bucketRepo.findOne({
      where: { name: bucketName },
      relations: options?.relations,
    });

    if (!bucket) {
      throw new NotFoundException('Bucket not found');
    }

    return bucket;
  }

  async checkBucketNotExists(
    bucketRepo: Repository<Buckets>,
    bucketName: string
  ): Promise<null> {
    const existingBucket = await bucketRepo.findOne({
      where: { name: bucketName }
    });

    if (existingBucket) {
      throw new ConflictException('Bucket already exists');
    }

    return null;
  }

  checkBucketEmpty(bucket: Buckets): void {
    if (bucket?.files && bucket.files.length > 0) {
      throw new ConflictException('Cannot delete bucket with existing files');
    }
  }
}
