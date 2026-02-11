import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ResendService } from '../mail/resend.service';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private resendService: ResendService,
    private prisma: PrismaService,
    private ordersService: OrdersService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && (await bcrypt.compare(pass, user.password || ''))) {
      if (!user.isVerified) {
        throw new UnauthorizedException('Email not verified. Please verify your email.');
      }
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const tokens = await this.getTokens(user.id, user.email, user.role || 'user');
    await this.storeRefreshToken(user.id, tokens.refresh_token);
    return tokens;
  }

  async getTokens(userId: string, email: string, role: string) {
    const payload = { email, sub: userId, role };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      this.jwtService.signAsync(payload, { expiresIn: '7d' }),
    ]);
    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async storeRefreshToken(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: hash },
    });
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.hashedRefreshToken) throw new UnauthorizedException('Access Denied');
    const rtMatches = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
    if (!rtMatches) throw new UnauthorizedException('Access Denied');
    const tokens = await this.getTokens(user.id, user.email, user.role || 'user');
    await this.storeRefreshToken(user.id, tokens.refresh_token);
    return tokens;
  }

  async logout(userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { hashedRefreshToken: null } });
  }

  async register(user: any) {
    this.logger.log(`AuthService.register called for: ${user.email}`);
    try {
        const existingUser = await this.usersService.findOne(user.email);
        if (existingUser) {
            this.logger.warn('AuthService.register: User already exists');
            throw new ConflictException('User with this email already exists');
        }

        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        this.logger.log('AuthService.register: Creating user...');
        const newUser = await this.usersService.create({ ...user, verificationToken: token });
        
        this.logger.log('AuthService.register: Attaching guest orders...');
        await this.ordersService.attachGuestOrders(newUser.email, newUser.id);
        
        this.logger.log('AuthService.register: Sending verification email...');
        try {
            await this.resendService.sendVerificationEmail(newUser.email, token);
            this.logger.log('AuthService.register: Email sent');
        } catch (error) {
            this.logger.error(`Failed to send verification email: ${error}`);
        }
        return { message: 'Registration successful. Please check your email to verify your account.' };
    } catch (error) {
        if (error instanceof ConflictException) throw error;
        this.logger.error(`AuthService.register CRITICAL ERROR: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
        this.logger.error(`Stack Trace: ${error instanceof Error ? error.stack : ''}`);
        throw new Error(`Registration failed: ${error.message}`);
    }
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({ where: { verificationToken: token } });
    if (!user) {
      throw new UnauthorizedException('Invalid verification token');
    }
    await this.usersService.verifyUser(user.id);
    return { message: 'Email verified successfully. You can now login.' };
  }

  // Social auth methods (validateGoogleUser, validateAppleUser) removed as they referenced deleted fields
  // and are replaced by Better Auth.

  async forgotPassword(email: string) {
      const user = await this.usersService.findOne(email);
      if (!user) {
          // Don't reveal if user exists
          return { message: 'If this email exists, a reset link has been sent.' }; 
      }
      
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const expires = new Date();
      expires.setHours(expires.getHours() + 1); // 1 hour expiration

      await this.usersService.setResetToken(email, token, expires);
      const resetLink = `http://localhost:3000/auth/reset-password?token=${token}`;
      await this.resendService.sendPasswordReset(email, resetLink);
      
      return { message: 'If this email exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPass: string) {
      const user = await this.prisma.user.findFirst({
        where: {
            resetToken: token,
            resetTokenExpires: { gt: new Date() },
        }
      });

      if (!user) {
          throw new UnauthorizedException('Invalid or expired reset token');
      }

      await this.usersService.updatePassword(user.id, newPass);
      return { message: 'Password reset successfully. You can now login.' };
  }
}
