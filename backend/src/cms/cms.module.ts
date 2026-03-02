import { Module, Global } from '@nestjs/common';
import { CmsService } from './cms.service';
import { CmsController } from './cms.controller';

@Global()
@Module({
  providers: [CmsService],
  controllers: [CmsController],
  exports: [CmsService],
})
export class CmsModule {}
