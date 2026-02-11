import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class BetterAuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    const authHeader = request.headers['authorization'];
    const sessionCookie = request.cookies['better-auth.session_token'];
    const token = sessionCookie || authHeader?.split(' ')[1];

    if (!token) {
      console.error(`[DEBUG AUTH] No token found. Cookie: ${!!sessionCookie}, Header: ${!!authHeader}`);
      require('fs').appendFileSync('debug_auth.log', `[${new Date().toISOString()}] No token found. Cookies: ${JSON.stringify(request.cookies)}\n`);
      throw new UnauthorizedException('No session token found');
    }

    // specific logic for better-auth: verify session token in DB
    // Handle signed tokens (token.signature)
    const tokenParts = token.split('.');
    const sessionToken = tokenParts[0]; // The raw token is the first part

    const session = await this.prisma.session.findUnique({
      where: { token: sessionToken },
      include: { user: true },
    });

    if (!session) {
      console.error(`[DEBUG AUTH] Session not found for token prefix: ${sessionToken.substring(0, 10)}...`);
      require('fs').appendFileSync('debug_auth.log', `[${new Date().toISOString()}] Session NOT FOUND for token: ${sessionToken}\n`);
      throw new UnauthorizedException('Invalid session');
    }

    if (session.expiresAt < new Date()) {
      console.error(`[DEBUG AUTH] Session expired for user: ${session.userId}`);
      require('fs').appendFileSync('debug_auth.log', `[${new Date().toISOString()}] Session EXPIRED for user: ${session.userId}\n`);
      throw new UnauthorizedException('Session expired');
    }

    // Attach user to request
    request['user'] = session.user;
    return true;
  }
}
