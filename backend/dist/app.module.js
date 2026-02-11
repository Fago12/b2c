"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const bullmq_1 = require("@nestjs/bullmq");
const throttler_1 = require("@nestjs/throttler");
const ioredis_1 = __importDefault(require("ioredis"));
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const products_module_1 = require("./products/products.module");
const categories_module_1 = require("./categories/categories.module");
const orders_module_1 = require("./orders/orders.module");
const coupons_module_1 = require("./coupons/coupons.module");
const reviews_module_1 = require("./reviews/reviews.module");
const mail_module_1 = require("./mail/mail.module");
const prisma_module_1 = require("./prisma/prisma.module");
const redis_module_1 = require("./redis/redis.module");
const common_module_1 = require("./common/common.module");
const cart_module_1 = require("./cart/cart.module");
const queue_module_1 = require("./queues/queue.module");
const media_module_1 = require("./media/media.module");
const chat_module_1 = require("./chat/chat.module");
const payments_module_1 = require("./payments/payments.module");
const admin_module_1 = require("./admin/admin.module");
const analytics_module_1 = require("./analytics/analytics.module");
const settings_module_1 = require("./settings/settings.module");
const cloudinary_module_1 = require("./cloudinary/cloudinary.module");
const homepage_module_1 = require("./homepage/homepage.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            redis_module_1.RedisModule,
            common_module_1.CommonModule,
            throttler_1.ThrottlerModule.forRoot([
                {
                    name: 'short',
                    ttl: 1000,
                    limit: 10,
                },
                {
                    name: 'medium',
                    ttl: 60000,
                    limit: 100,
                },
                {
                    name: 'long',
                    ttl: 3600000,
                    limit: 1000,
                },
            ]),
            bullmq_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const redisUrl = configService.get('REDIS_URL');
                    console.log('[BullMQ] REDIS_URL:', redisUrl ? `${redisUrl.substring(0, 30)}...` : 'not set');
                    if (redisUrl) {
                        const connection = new ioredis_1.default(redisUrl, { maxRetriesPerRequest: null });
                        return { connection };
                    }
                    return {
                        connection: {
                            host: configService.get('REDIS_HOST') || 'localhost',
                            port: parseInt(configService.get('REDIS_PORT') || '6379'),
                            password: configService.get('REDIS_PASSWORD'),
                            maxRetriesPerRequest: null,
                        },
                    };
                },
            }),
            queue_module_1.QueueModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            products_module_1.ProductsModule,
            categories_module_1.CategoriesModule,
            orders_module_1.OrdersModule,
            coupons_module_1.CouponsModule,
            reviews_module_1.ReviewsModule,
            mail_module_1.MailModule,
            cart_module_1.CartModule,
            media_module_1.MediaModule,
            chat_module_1.ChatModule,
            payments_module_1.PaymentsModule,
            admin_module_1.AdminModule,
            analytics_module_1.AnalyticsModule,
            settings_module_1.SettingsModule,
            cloudinary_module_1.CloudinaryModule,
            homepage_module_1.HomepageModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map