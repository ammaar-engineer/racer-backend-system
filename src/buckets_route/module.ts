import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Buckets, Files } from '../db/entities';
import { BucketsService } from './services';
import { BucketsController } from './controller';
import { BucketsValidation } from '../validation/buckets_validation';
import { MinIOModule } from '../app_modules/minio.module';

@Module({
  imports: [TypeOrmModule.forFeature([Buckets, Files])],
  controllers: [BucketsController],
  providers: [BucketsService, BucketsValidation],
  exports: [BucketsService]
})
export class BucketsModule {}
