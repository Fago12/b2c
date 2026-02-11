import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants, JwtStrategy } from './jwt.strategy';
import { RefreshTokenStrategy } from './refresh-token.strategy';
// GoogleStrategy and AppleStrategy removed
import { BetterAuthGuard } from './better-auth.guard';
import { RolesGuard } from './roles.guard';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    OrdersModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60m' },
    }),
  ],
  providers: [AuthService, JwtStrategy, RefreshTokenStrategy, BetterAuthGuard, RolesGuard],
  controllers: [AuthController],
  exports: [AuthService, BetterAuthGuard, RolesGuard],
})
export class AuthModule {}

