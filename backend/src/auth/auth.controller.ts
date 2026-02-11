import { Controller, Request, Post, UseGuards, Body, Get, Query, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private usersService: UsersService) {}

  @Post('login')
  async login(@Body() body: any, @Res({ passthrough: true }) res) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      return { message: 'Invalid credentials' };
    }
    const tokens = await this.authService.login(user);
    
    // Set both tokens as HttpOnly cookies
    res.cookie('access_token', tokens.access_token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', 
      maxAge: 15 * 60 * 1000 // 15 minutes
    });
    
    res.cookie('refresh_token', tokens.refresh_token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', 
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return { message: 'Login successful', user };
  }

  @Get('verify')
  async verify(@Query('token') token: string) {
    return this.authService.verifyEmail(token);
  }

  // Google endpoints removed (replaced by Better Auth)

  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: any) {
    return this.authService.resetPassword(body.token, body.password);
  }

  @Post('refresh')
  @UseGuards(AuthGuard('jwt-refresh'))
  async refresh(@Request() req, @Res({ passthrough: true }) res) {
    const user = req.user; // Strategy returns { ...payload, refreshToken }
    // The payload usually has 'sub' (userId) and 'email'
    // authService.refreshTokens needs userId and the old refreshToken
    
    const tokens = await this.authService.refreshTokens(user.sub, user.refreshToken);
    res.cookie('refresh_token', tokens.refresh_token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', 
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });
    
    res.cookie('access_token', tokens.access_token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', 
      maxAge: 15 * 60 * 1000 
    });

    return { access_token: tokens.access_token };
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.userId);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Request() req, @Res({ passthrough: true }) res) {
    await this.authService.logout(req.user.sub);
    res.clearCookie('refresh_token');
    res.clearCookie('access_token');
    return { message: 'Logged out successfully' };
  }

  // Apple endpoints removed (replaced by Better Auth)
}

