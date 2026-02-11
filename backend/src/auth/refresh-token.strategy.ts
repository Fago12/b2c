import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
// Reusing the same secret for now as per plan, though in production you might want a separate secret
import { jwtConstants } from './jwt.strategy';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.refresh_token;
        },
      ]),
      secretOrKey: jwtConstants.secret,
      passReqToCallback: true, // We might need the refresh token itself to validate against DB hash
    });
  }

  validate(req: Request, payload: any) {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) throw new UnauthorizedException();
    
    // We return the payload and the refresh token so the service can hash and compare
    return { ...payload, refreshToken };
  }
}
