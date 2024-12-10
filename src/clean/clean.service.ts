import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { CleanEntity } from "./entity/clean.entity";
import { CleanDto } from "./dto/clean.dto";
import { DateTime } from "luxon";
import { InjectRepository } from "@nestjs/typeorm";
import * as fs from "fs";

@Injectable()
export class CleanService {

  constructor(
    @InjectRepository(CleanEntity)
    private readonly cleanRepo: Repository<CleanEntity>
  ) {
  }

  uploadFileURL(fileName): string {
    return `http://localhost:3125/${fileName}`;
  };

  async uploadFileDiskDestination(file: Express.Multer.File): Promise<string> {
    //유저별 폴더 생성

    const uploadFilePath = `uploads`;

    if (!fs.existsSync(uploadFilePath)) {
      // uploads 폴더가 존재하지 않을시, 생성합니다.
      fs.mkdirSync(uploadFilePath);
    }

    return this.uploadFileURL(uploadFilePath + '/'+ file.filename);
  }

  async dataInput(data: CleanDto, file: Express.Multer.File) {
    const { username, userrole, selectedValue } = data;

    const now = DateTime.now()
      .setZone("Asia/Seoul")
      .toMillis();


    const id = Number(selectedValue?.split(" : ")[0]);
    const locate = selectedValue?.split(" : ")[1];

    const task = this.cleanRepo.create({
      id: id,
      name: username,
      role: userrole,
      img: await this.uploadFileDiskDestination(file),
      location: locate,
      createdAt: now
    });

    return this.cleanRepo.save(task);
  }

  async findAll() {
    return this.cleanRepo.find();
  }
}
