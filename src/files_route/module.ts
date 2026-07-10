import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Buckets, Files } from '../db/entities';
import { FileRouteServices } from './services';
import { FilesController } from './controller';
import { BucketsValidation } from '../validation/buckets_validation';

@Module({
  imports: [TypeOrmModule.forFeature([Buckets, Files])],
  controllers: [FilesController],
  providers: [FileRouteServices, BucketsValidation],
  exports: [FileRouteServices]
})
export class FilesRouteModule {}
