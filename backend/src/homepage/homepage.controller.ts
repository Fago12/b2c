import { Controller, Get, Req } from '@nestjs/common';
import { HomepageService } from './homepage.service';

@Controller('homepage')
export class HomepageController {
  constructor(private readonly homepageService: HomepageService) {}

  @Get()
  async getHomepage(@Req() req: any) {
    const regionCode = req.headers['x-region-code'] || 'US';
    return this.homepageService.getHomepageContent(regionCode);
  }
  @Get('announcement')
  async getAnnouncement() {
    return this.homepageService.getActiveAnnouncement();
  }
}
