import { Test, TestingModule } from '@nestjs/testing';
import { CleanController } from './clean.controller';
import { CleanService } from './clean.service';

describe('CleanController', () => {
  let controller: CleanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CleanController],
      providers: [CleanService],
    }).compile();

    controller = module.get<CleanController>(CleanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
