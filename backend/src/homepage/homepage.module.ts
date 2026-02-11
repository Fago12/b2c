import { Module } from '@nestjs/common';
import { HomepageController } from './homepage.controller';
import { AdminHomepageController } from './admin-homepage.controller';
import { HomepageService } from './homepage.service';
import { PrismaModule } from '../prisma/prisma.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, CloudinaryModule, AuthModule],
  controllers: [HomepageController, AdminHomepageController],
  providers: [HomepageService],
})
export class HomepageModule {}
