import { Buckets, Files } from "../entity.js";
import { main_db, MinIOClient } from "../main.js";
import { BucketsValidationCheck} from "../validation/bucket.js";
import { SqliteHandle } from "../utilities/typeorm.handle.js";

export class BucketRouteServices {
  private BucketValidation = BucketsValidationCheck;
  
  constructor() {}

  async peekBucket(bucketName: string) {
    const bucketRepo = main_db.getRepository(Buckets);
    const fileRepo = main_db.getRepository(Files)
    await this.BucketValidation.checkBucketExists(bucketRepo, bucketName, { relations: ['files'] });

    const filesRaw = await fileRepo.find({
      where: {
        bucket: {name: bucketName} 
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
    })

    const files = filesRaw.map(({name}) => name)

    return {
      bucketName,
      files
    };
  }

  async createBucket(bucketName: string) {
    const bucketRepo = main_db.getRepository(Buckets);
    await this.BucketValidation.checkBucketNotExists(bucketRepo, bucketName);
    
    await MinIOClient.makeBucket(bucketName, 'us-east-1');
    
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

    await MinIOClient.setBucketPolicy(bucketName, JSON.stringify(policy));
    
    
    const {createdAt, files, name} = await SqliteHandle(bucketRepo, async (repo) => {
      const newBucket = new Buckets();
      newBucket.name = bucketName;
      return await repo.save(newBucket);
    })

    return {createdAt, name};
  }

  async deleteBucket(bucketName: string) {
    const bucketRepo = main_db.getRepository(Buckets);
    const bucket = await this.BucketValidation.checkBucketExists(bucketRepo, bucketName, { relations: ['files'] });
    this.BucketValidation.checkBucketEmpty(bucket as Buckets);
    
    await MinIOClient.removeBucket(bucketName);

    return await SqliteHandle(bucketRepo, async (repo) => {
      await repo.remove(bucket as any);
      
      return {
        bucketName
      };
    });
  }

  async clearBucket(bucketName: string) {
    const bucketRepo = main_db.getRepository(Buckets);
    const fileRepo = main_db.getRepository(Files);
    
    await this.BucketValidation.checkBucketExists(bucketRepo, bucketName, { relations: ['files'] });
    
    // Delete all objects from MinIO
    const objectsList = MinIOClient.listObjects(bucketName, '', true);
    const objectsToDelete: string[] = [];
    
    for await (const obj of objectsList) {
      if (obj.name) {
        objectsToDelete.push(obj.name);
      }
    }
    
    if (objectsToDelete.length > 0) {
      await MinIOClient.removeObjects(bucketName, objectsToDelete);
    }
    
    await SqliteHandle(bucketRepo, async (bcrepo) => {
      const bucket = await bcrepo.findOne({
        where: {name: bucketName},
        relations: {files: true}
      })
      await SqliteHandle(fileRepo, async (frepo) => {
        await frepo.remove(bucket?.files)
      })
    })

    return {bucketName, deletedFiles: objectsToDelete}

    // Delete all file records from database
  }
}
