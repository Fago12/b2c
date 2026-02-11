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

  @Get()
  async getCart(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const sessionId = this.getSessionId(req, res);
    const cart = await this.cartService.getCart(sessionId);
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
    @Body() body: { productId: string; quantity?: number },
  ) {
    const sessionId = this.getSessionId(req, res);
    
    try {
      const cart = await this.cartService.addItem(
        sessionId,
        body.productId,
        body.quantity || 1,
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
    @Body() body: { quantity: number },
  ) {
    const sessionId = this.getSessionId(req, res);
    
    try {
      const cart = await this.cartService.updateQuantity(
        sessionId,
        productId,
        body.quantity,
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
    const cart = await this.cartService.removeItem(sessionId, productId);
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
    
    const cart = await this.cartService.mergeCart(guestSessionId, body.userSessionId);
    const totals = this.cartService.getCartTotal(cart);
    
    return {
      ...cart,
      ...totals,
    };
  }
}
