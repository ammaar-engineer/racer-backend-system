import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'
import { SnippetsRouteModule } from './snippets_route/module';
import { MainDBModule } from './app_modules/main.db.module';
import { MinIOModule } from './app_modules/minio.module';
import { BucketsModule } from './buckets_route/module';
import { FilesRouteModule } from './files_route/module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MainDBModule,
    MinIOModule,
    SnippetsRouteModule,
    BucketsModule,
    FilesRouteModule
  ],
  providers: [],
})
export class AppModule { }
