import { ConfigService } from '@nestjs/config';
export declare class AppleStrategy {
    private configService;
    private readonly logger;
    private readonly enabled;
    constructor(configService: ConfigService);
    authenticate(): void;
}
