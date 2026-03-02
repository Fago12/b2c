import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Req,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { CartService } from './cart.service';
import { v4 as uuidv4 } from 'uuid';

@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  private getSessionId(req: Request, res: Response): string {
    let sessionId = req.cookies?.['guest_session_id'];
    
    if (!sessionId) {
      sessionId = uuidv4();
      res.cookie('guest_session_id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
    }
    
    return sessionId;
  }

  private getRegionCode(req: Request): string {
    // Priority: Header > Cookie > Default (US)
    return (req.headers['x-region-code'] as string) || req.cookies?.['region_code'] || 'US';
  }

  @Get()
  async getCart(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const sessionId = this.getSessionId(req, res);
    const regionCode = this.getRegionCode(req);
    console.log(`[CartController.getCart] Session: ${sessionId}, Region: ${regionCode}`);
    
    const cart = await this.cartService.getCart(sessionId, regionCode);
    
    // If cart region doesn't match requested region, force a recalculate
    if (cart.regionCode !== regionCode && cart.items.length > 0) {
      console.log(`[CartController.getCart] Region mismatch (${cart.regionCode} -> ${regionCode}). Recalculating...`);
      cart.regionCode = regionCode;
      await this.cartService.recalculateCart(sessionId, cart);
    }

    const totals = this.cartService.getCartTotal(cart);
    
    return {
      ...cart,
      ...totals,
      sessionId,
    };
  }

  @Post('items')
  async addItem(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: { productId: string; quantity?: number; customization?: any; variantId?: string },
  ) {
    const sessionId = this.getSessionId(req, res);
    const regionCode = this.getRegionCode(req);
    console.log(`[CartController.addItem] Session: ${sessionId}, Region: ${regionCode}, Product: ${body.productId}`);
    
    try {
      const cart = await this.cartService.addItem(
        sessionId,
        body.productId,
        body.quantity || 1,
        body.customization,
        regionCode,
        body.variantId,
      );
      const totals = this.cartService.getCartTotal(cart);
      
      return {
        ...cart,
        ...totals,
      };
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch('items/:productId')
  async updateItem(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Param('productId') productId: string,
    @Body() body: { quantity: number; variantId?: string },
  ) {
    const sessionId = this.getSessionId(req, res);
    
    try {
      const regionCode = this.getRegionCode(req);
      const cart = await this.cartService.updateQuantity(
        sessionId,
        productId,
        body.quantity,
        regionCode,
        body.variantId,
      );
      const totals = this.cartService.getCartTotal(cart);
      
      return {
        ...cart,
        ...totals,
      };
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete('items/:productId')
  async removeItem(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Param('productId') productId: string,
  ) {
    const sessionId = this.getSessionId(req, res);
    const regionCode = this.getRegionCode(req);
    const variantId = req.query.variantId as string;
    
    const cart = await this.cartService.removeItem(sessionId, productId, regionCode, variantId);
    const totals = this.cartService.getCartTotal(cart);
    
    return {
      ...cart,
      ...totals,
    };
  }

  @Delete()
  async clearCart(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const sessionId = this.getSessionId(req, res);
    await this.cartService.clearCart(sessionId);
    
    return {
      items: [],
      subtotal: 0,
      itemCount: 0,
      shippingCost: 0,
      total: 0,
      updatedAt: new Date(),
    };
  }

  @Post('merge')
  async mergeCart(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: { userSessionId: string },
  ) {
    const guestSessionId = req.cookies?.['guest_session_id'];
    
    if (!guestSessionId) {
      throw new HttpException('No guest cart found', HttpStatus.BAD_REQUEST);
    }
    
    const regionCode = this.getRegionCode(req);
    const cart = await this.cartService.mergeCart(guestSessionId, body.userSessionId, regionCode);
    const totals = this.cartService.getCartTotal(cart);
    
    return {
      ...cart,
      ...totals,
    };
  }

  @Post('region')
  async updateRegion(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @Body() body: { regionCode: string },
  ) {
    const sessionId = this.getSessionId(req, res);
    const cart = await this.cartService.setRegion(sessionId, body.regionCode);
    
    // Update region cookie for persistence across storefront
    res.cookie('region_code', body.regionCode, {
      httpOnly: false, // Allow client-side access if needed
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    const totals = this.cartService.getCartTotal(cart);
    
    return {
      ...cart,
      ...totals,
    };
  }
}
