import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * AppleStrategy - Currently a placeholder since Apple Sign-In requires
 * developer account credentials to be configured.
 * 
 * To enable Apple Sign-In:
 * 1. Set up Apple Developer account
 * 2. Configure Sign in with Apple service
 * 3. Add credentials to .env:
 *    - APPLE_CLIENT_ID
 *    - APPLE_TEAM_ID  
 *    - APPLE_KEY_ID
 *    - APPLE_PRIVATE_KEY
 *    - APPLE_CALLBACK_URL
 */
@Injectable()
export class AppleStrategy {
  private readonly logger = new Logger(AppleStrategy.name);
  private readonly enabled: boolean = false;

  constructor(private configService: ConfigService) {
    const clientID = this.configService.get<string>('APPLE_CLIENT_ID');
    
    if (clientID) {
      this.logger.log('Apple Sign-In credentials detected');
      // Full implementation would be enabled here
    } else {
      this.logger.warn('Apple Sign-In disabled - APPLE_CLIENT_ID not configured');
    }
  }

  // This will be called by the auth guard but won't actually authenticate
  authenticate() {
    throw new Error('Apple Sign-In not configured. Please set APPLE_CLIENT_ID and related environment variables.');
  }
}


