import { Body, Controller, Get, Post, Req, UploadedFile, UseInterceptors } from "@nestjs/common";
import { CleanService } from './clean.service';
import { CleanDto } from "./dto/clean.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { DateTime } from "luxon";
import { extname } from "path";
import * as fs from "fs";

@Controller('clean')
export class CleanController {
  constructor(private readonly cleanService: CleanService) {}

  @Post('/input')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
        destination: function (req, file, cb) {
          if(!fs.existsSync('./uploads')) {
            fs.mkdirSync('./uploads', { recursive: true });
          }

          cb(null, './uploads')
        },
      filename: (req, file, cb) => {
        const randomName = Date.now();
        cb(null, `${randomName}${extname(file.originalname)}`)
      }
    })
  }))
  async cleanInput (@Body() body: CleanDto, @UploadedFile() file) {
    console.log('파일: ', file)

    return await this.cleanService.dataInput(body, file);
  }
}
