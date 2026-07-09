import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm';
import { Buckets, Files, Snippets } from './db/entities';
import { SnippetsRouteModule } from './snippets_route/module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: './db/app.db',
      synchronize: process.env.NODE_ENV === 'development' ? true : false,
      entities: [Buckets, Snippets, Files]
    }),
    SnippetsRouteModule
  ],
  providers: [],
})
export class AppModule { }
