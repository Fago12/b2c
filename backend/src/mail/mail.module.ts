import { Module, Global } from '@nestjs/common';
import { MailService } from './mail.service';
import { ResendService } from './resend.service';

@Global()
@Module({
  providers: [MailService, ResendService],
  exports: [MailService, ResendService],
})
export class MailModule {}

