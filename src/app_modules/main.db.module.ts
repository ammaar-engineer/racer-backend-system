import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Buckets, Files, Snippets } from '../db/entities';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: './db/app.db',
      synchronize: process.env.NODE_ENV === 'development' ? true : false,
      entities: [Buckets, Snippets, Files]
    })
  ],
  exports: [TypeOrmModule]
})
export class MainDBModule { }
