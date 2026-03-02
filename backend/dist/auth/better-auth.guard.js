"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetterAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BetterAuthGuard = class BetterAuthGuard {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers['authorization'];
        const adminSessionCookie = request.cookies['admin-auth.session_token'];
        const storefrontSessionCookie = request.cookies['storefront-auth.session_token'];
        const defaultSessionCookie = request.cookies['better-auth.session_token'];
        const isAdminRequest = request.url.includes('/admin') || request.headers['x-admin-request'] === 'true';
        let token;
        if (isAdminRequest) {
            token = adminSessionCookie;
            if (!token && (storefrontSessionCookie || defaultSessionCookie)) {
                console.warn(`[DEBUG AUTH] Blocking admin request attempt with storefront session: ${request.url}`);
            }
        }
        else {
            token = storefrontSessionCookie || defaultSessionCookie;
        }
        if (!token && authHeader) {
            token = authHeader.split(' ')[1];
        }
        if (!token) {
            console.error(`[DEBUG AUTH] No valid token found for ${isAdminRequest ? 'ADMIN' : 'STORE'} request to ${request.url}`);
            throw new common_1.UnauthorizedException('No session token found for this area');
        }
        const tokenParts = token.split('.');
        const sessionToken = tokenParts[0];
        const session = await this.prisma.session.findUnique({
            where: { token: sessionToken },
            include: { user: true },
        });
        if (!session) {
            console.error(`[DEBUG AUTH] Session not found for token prefix: ${sessionToken.substring(0, 10)}...`);
            throw new common_1.UnauthorizedException('Invalid session');
        }
        if (isAdminRequest && !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
            console.error(`[DEBUG AUTH] Non-admin user (${session.user.email}) tried to access admin endpoint`);
            throw new common_1.UnauthorizedException('Access denied: Admin role required');
        }
        if (session.expiresAt < new Date()) {
            console.error(`[DEBUG AUTH] Session expired for user: ${session.userId}`);
            throw new common_1.UnauthorizedException('Session expired');
        }
        request['user'] = session.user;
        return true;
    }
};
exports.BetterAuthGuard = BetterAuthGuard;
exports.BetterAuthGuard = BetterAuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BetterAuthGuard);
//# sourceMappingURL=better-auth.guard.js.map