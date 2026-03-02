import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';

@Injectable()
export class BetterAuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    
    const authHeader = request.headers['authorization'];
    
    // Better Auth prefixes the session token name with the cookiePrefix + ".session_token"
    const adminSessionCookie = request.cookies['admin-auth.session_token'];
    const storefrontSessionCookie = request.cookies['storefront-auth.session_token'];
    const defaultSessionCookie = request.cookies['better-auth.session_token'];

    // Determine which token to use based on the route or headers
    // If it's an admin request (contains /admin in URL or custom header), ONLY use admin cookie
    const isAdminRequest = request.url.includes('/admin') || request.headers['x-admin-request'] === 'true';
    
    let token: string | undefined;

    if (isAdminRequest) {
      token = adminSessionCookie;
      if (!token && (storefrontSessionCookie || defaultSessionCookie)) {
        console.warn(`[DEBUG AUTH] Blocking admin request attempt with storefront session: ${request.url}`);
      }
    } else {
      token = storefrontSessionCookie || defaultSessionCookie;
    }

    // Fallback to Auth header ONLY if no specific cookie was found or if it's explicitly provided
    if (!token && authHeader) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      console.error(`[DEBUG AUTH] No valid token found for ${isAdminRequest ? 'ADMIN' : 'STORE'} request to ${request.url}`);
      throw new UnauthorizedException('No session token found for this area');
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
      throw new UnauthorizedException('Invalid session');
    }

    // For admin requests, ensure the user actually has admin rights in the session
    if (isAdminRequest && !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
       console.error(`[DEBUG AUTH] Non-admin user (${session.user.email}) tried to access admin endpoint`);
       throw new UnauthorizedException('Access denied: Admin role required');
    }

    if (session.expiresAt < new Date()) {
      console.error(`[DEBUG AUTH] Session expired for user: ${session.userId}`);
      throw new UnauthorizedException('Session expired');
    }

    // Attach user to request
    request['user'] = session.user;
    return true;
  }
}
