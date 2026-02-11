import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  /**
   * Send a message to the chat bot
   */
  @Post('message')
  async sendMessage(
    @Body() body: { 
      message: string; 
      context?: { cartItems?: string[]; currentPage?: string } 
    }
  ) {
    const response = await this.chatService.processMessage(body.message, body.context);
    return response;
  }

  /**
   * Get chat widget configuration
   */
  @Get('config')
  getConfig() {
    return {
      welcomeMessage: "Hi there! 👋 How can I help you find the perfect item today?",
      placeholder: "Ask me about products...",
      suggestedQueries: [
        "Show me traditional attire",
        "What do you have under ₦15,000?",
        "I'm looking for a gift",
        "How does shipping work?",
      ],
    };
  }
}
