"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomepageModule = void 0;
const common_1 = require("@nestjs/common");
const homepage_controller_1 = require("./homepage.controller");
const admin_homepage_controller_1 = require("./admin-homepage.controller");
const homepage_service_1 = require("./homepage.service");
const prisma_module_1 = require("../prisma/prisma.module");
const cloudinary_module_1 = require("../cloudinary/cloudinary.module");
const auth_module_1 = require("../auth/auth.module");
let HomepageModule = class HomepageModule {
};
exports.HomepageModule = HomepageModule;
exports.HomepageModule = HomepageModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, cloudinary_module_1.CloudinaryModule, auth_module_1.AuthModule],
        controllers: [homepage_controller_1.HomepageController, admin_homepage_controller_1.AdminHomepageController],
        providers: [homepage_service_1.HomepageService],
    })
], HomepageModule);
//# sourceMappingURL=homepage.module.js.map