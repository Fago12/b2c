"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryModule = exports.CloudinaryProvider = void 0;
const common_1 = require("@nestjs/common");
const cloudinary_1 = require("cloudinary");
const cloudinary_service_1 = require("./cloudinary.service");
const config_1 = require("@nestjs/config");
exports.CloudinaryProvider = {
    provide: 'CLOUDINARY',
    inject: [config_1.ConfigService],
    useFactory: (configService) => {
        return cloudinary_1.v2.config({
            cloud_name: configService.get('CLOUDINARY_CLOUD_NAME'),
            api_key: configService.get('CLOUDINARY_API_KEY'),
            api_secret: configService.get('CLOUDINARY_API_SECRET'),
        });
    },
};
let CloudinaryModule = class CloudinaryModule {
};
exports.CloudinaryModule = CloudinaryModule;
exports.CloudinaryModule = CloudinaryModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [config_1.ConfigModule],
        providers: [exports.CloudinaryProvider, cloudinary_service_1.CloudinaryService],
        exports: [exports.CloudinaryProvider, cloudinary_service_1.CloudinaryService],
    })
], CloudinaryModule);
//# sourceMappingURL=cloudinary.module.js.map