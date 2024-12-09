import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { DutyEntity } from './entity/duty.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class DutyService {
  constructor(
    @InjectRepository(DutyEntity) private readonly dutyRepo: Repository<DutyEntity>) {
  }
  
  async findAll() {
    return await this.dutyRepo.find();
  }
}