import { Module } from "@nestjs/common";
import { CleanService } from "./clean.service";
import { CleanController } from "./clean.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CleanEntity } from "./entity/clean.entity";
import * as fs from "fs";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CleanEntity
    ]),
    AuthModule,
  ],
  controllers: [CleanController],
  providers: [CleanService]
})
export class CleanModule {
}
