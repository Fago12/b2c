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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomepageController = void 0;
const common_1 = require("@nestjs/common");
const homepage_service_1 = require("./homepage.service");
let HomepageController = class HomepageController {
    homepageService;
    constructor(homepageService) {
        this.homepageService = homepageService;
    }
    async getHomepage(req) {
        const regionCode = req.headers['x-region-code'] || 'US';
        return this.homepageService.getHomepageContent(regionCode);
    }
    async getAnnouncement() {
        return this.homepageService.getActiveAnnouncement();
    }
};
exports.HomepageController = HomepageController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HomepageController.prototype, "getHomepage", null);
__decorate([
    (0, common_1.Get)('announcement'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HomepageController.prototype, "getAnnouncement", null);
exports.HomepageController = HomepageController = __decorate([
    (0, common_1.Controller)('homepage'),
    __metadata("design:paramtypes", [homepage_service_1.HomepageService])
], HomepageController);
//# sourceMappingURL=homepage.controller.js.map