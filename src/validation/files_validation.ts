import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Files } from '../db/entities';

@Injectable()
export class FilesValidation {
  async isFileExist(fileRepo: Repository<Files>): Promise<Files | null> {
    const fileExist = await fileRepo.findOne({});
    return fileExist;
  }
}
