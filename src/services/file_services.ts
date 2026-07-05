import { Buckets, Files } from "../entity.js";
import { main_db, MinIOClient } from "../main.js";
import { ErrorTypeCall } from "../error_modules/error.class.js";
import { BucketsValidationCheck } from "../validation/bucket.js";
import { SqliteHandle } from "../utilities/typeorm.handle.js";
import { PassThrough } from "stream";
import type { Request } from "express";

export class FileRouteServices {
  private BucketValidation = BucketsValidationCheck;

  async uploadFile(
    req: Request,
    fileName: string,
    bucketName: string,
    contentType: string,
    fileSize: number
  ) {
    const bucketRepo = main_db.getRepository(Buckets);
    const fileRepo = main_db.getRepository(Files);

    const fileExists = await fileRepo.findOne({
      where: {
        name: fileName,
        bucket: { name: bucketName }
      },
      relations: {
        bucket: true
      }
    })

    if (fileExists) ErrorTypeCall.conflict('File already exist')
    
    const bucket = await this.BucketValidation.checkBucketExists(bucketRepo, bucketName)
    // Sebenernya kita bisa langsung alirin stream req nya. Namun pake ini aja buat tambahan
    const passThroughStream = new PassThrough();
    req.pipe(passThroughStream);
    // Debug stream
    // passThroughStream.on('data', (chunk) => {
    //   console.log(chunk.toString())
    // })

    try {

      await SqliteHandle(fileRepo, async (repo) => {
        const newFile = new Files();
        newFile.name = fileName;
        newFile.bucket = bucket?.id as any;
        return await repo.save(newFile);
      });

      await MinIOClient.putObject(
        bucketName,
        fileName,
        passThroughStream,
        fileSize,
        {
          "Content-Type": contentType,
          'Content-Disposition': 'attachment'
        }
      );

      const downloadUrl = await MinIOClient.presignedGetObject(
        bucketName,
        fileName,
      );
      
      return {
        url: downloadUrl,
      };
    } catch (error) {
      try {
        await MinIOClient.removeObject(bucketName, fileName);
      } catch (cleanupError) {
        ErrorTypeCall.internalServerError('Cleaning corrupted file Error');
      }
      throw error;
    }
  }

  async downloadFile(bucketName: string, fileName: string) {
    const bucketRepo = main_db.getRepository(Buckets)
    const fileRepo = main_db.getRepository(Files)

    const bucket = await this.BucketValidation.checkBucketExists(bucketRepo, bucketName)
    
    const fileExist = await fileRepo.findOne({
      where: {
        name: fileName,
        bucket: {
          id: bucket?.id || 0
        }
      }
    })

    if (!fileExist) ErrorTypeCall.notFound("File not found")

    const url = await MinIOClient.presignedGetObject(bucketName, fileName, 3600)
    
    return {
      file: fileExist,
      bucket,
      url
    }
  }

  async deleteFile(fileName: string, bucketName: string) {
    console.log("Jalan")
    const bucketRepo = main_db.getRepository(Buckets);
    const fileRepo = main_db.getRepository(Files);
    
    const bucket = await this.BucketValidation.checkBucketExists(bucketRepo, bucketName);

    const file = await fileRepo.findOne({
      where: {
        name: fileName,
        bucket: { id: bucket?.id || 0 }
      }
    });

    console.log(file)

    if (!file) {
      ErrorTypeCall.notFound('File not found');
    }

    await MinIOClient.removeObject(bucketName, fileName);
    
    await SqliteHandle(fileRepo, async (repo) => {
      await repo.delete({name: file?.name});
    });
  }
}