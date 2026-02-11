import { Controller, Get } from '@nestjs/common';
import { HomepageService } from './homepage.service';

@Controller('homepage')
export class HomepageController {
  constructor(private readonly homepageService: HomepageService) {}

  @Get()
  async getHomepage() {
    return this.homepageService.getHomepageContent();
  }
}
