import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
  ) {}

  async getTeam() {
    return this.usersService.getTeamMembers();
  }

  async inviteAdmin(email: string, inviterName: string) {
    this.logger.log(`Inviting admin: ${email}`);

    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    
    if (existingUser) {
      // If the user has a resetToken, they never completed setup — re-invite them
      if (existingUser.resetToken) {
        this.logger.log(`Re-inviting pending admin: ${email}`);
        
        // Generate a fresh reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await this.prisma.user.update({
          where: { email },
          data: { resetToken, resetTokenExpires },
        });

        const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/setup?token=${resetToken}`;
        
        try {
          await this.mailService.sendAdminInvite(email, inviteLink, inviterName);
        } catch (e) {
          this.logger.error(`Failed to send invite email: ${e.message}`);
        }

        return { message: 'Invitation re-sent successfully' };
      }

      // User exists and has completed setup — truly a duplicate
      throw new ConflictException('User with this email already exists and is active');
    }

    // --- New invite flow (no existing user) ---
    const temporaryPassword = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: 'ADMIN',
        isVerified: true,
        emailVerified: true,
        resetToken,
        resetTokenExpires,
        name: 'Admin User',
      },
    });

    // Create Account for Better Auth (credential)
    await this.prisma.account.create({
        data: {
            userId: newUser.id,
            providerId: 'credential',
            accountId: email,
            password: hashedPassword,
        }
    });

    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/admin/setup?token=${resetToken}`;
    
    try {
        await this.mailService.sendAdminInvite(email, inviteLink, inviterName);
    } catch (e) {
        this.logger.error(`Failed to send invite email: ${e.message}`);
    }

    return { message: 'Invitation sent successfully' };
  }
}
