import { Controller, Get } from '@nestjs/common';
import { RegionService } from './region.service';

@Controller('regions')
export class RegionController {
  constructor(private readonly regionService: RegionService) {}

  @Get()
  async getRegions() {
    return this.regionService.getAllActiveRegions();
  }
}
