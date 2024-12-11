import { Controller, Get } from '@nestjs/common';
import { DutyService } from './duty.service';


@Controller('duty')
export class DutyController {
  constructor(private readonly dutyService: DutyService) {
  }
  
  @Get()
  async findAll() {
    return await this.dutyService.findAll();
  }
}