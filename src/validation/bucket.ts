import { Repository } from "typeorm";
import { Buckets } from "../entity.js";
import { ErrorTypeCall } from "../error_modules/error.class.js";

export class BucketsValidationCheck {

  static async checkBucketExists(
    bucketRepo: Repository<Buckets>,
    bucketName: string,
    options?: { relations?: string[] }
  ) {
    const bucket = await bucketRepo.findOne({
      where: { name: bucketName },
    });

    if (!bucket) {
      ErrorTypeCall.notFound('Bucket not found');
    }

    return bucket;
  }

  static async checkBucketNotExists(
    bucketRepo: Repository<Buckets>,
    bucketName: string
  ) {
    const existingBucket = await bucketRepo.findOne({ where: { name: bucketName } });

    if (existingBucket) {
      ErrorTypeCall.conflict('Bucket already exists');
    }
    return existingBucket
  }

  static checkBucketEmpty(bucket: Buckets) {
    if (bucket?.files && bucket.files.length > 0) {
      ErrorTypeCall.conflict('Cannot delete bucket with existing files');
    }
  }

}
