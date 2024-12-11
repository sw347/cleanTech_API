import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DutyEntity } from './entity/duty.entity';
import { DutyController } from './duty.controller';
import { DutyService } from './duty.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([
      DutyEntity,
    ]),
  ],
  controllers: [DutyController],
  providers: [DutyService],
})
export class DutyModule {}