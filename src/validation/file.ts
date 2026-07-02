import type { Repository } from "typeorm";
import type { Files } from "../entity.js";

export class FileValidationCheck {
    async isFileExist(fileRepo: Repository<Files>) {
        const fileExist = fileRepo.findOne({})
    }
}