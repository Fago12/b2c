import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

export interface ProductSearchResult {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  message: string;
  products?: ProductSearchResult[];
  intent: 'search' | 'info' | 'greeting' | 'unknown';
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  /**
   * Process a chat message and return a response with optional product recommendations
   */
  async processMessage(userMessage: string, context?: { cartItems?: string[]; currentPage?: string }): Promise<ChatResponse> {
    const intent = this.detectIntent(userMessage);
    
    switch (intent) {
      case 'greeting':
        return {
          message: "Hello! 👋 Welcome to our store. I'm here to help you find the perfect products. What are you looking for today?",
          intent: 'greeting',
        };
        
      case 'search':
        const products = await this.searchProducts(userMessage);
        if (products.length === 0) {
          return {
            message: "I couldn't find any products matching your search. Could you try describing what you're looking for in a different way?",
            intent: 'search',
            products: [],
          };
        }
        return {
          message: `I found ${products.length} product${products.length > 1 ? 's' : ''} that might interest you:`,
          products,
          intent: 'search',
        };
        
      case 'info':
        return {
          message: await this.getInfoResponse(userMessage),
          intent: 'info',
        };
        
      default:
        return {
          message: "I'm here to help you find products! Try asking me something like 'Show me traditional attire' or 'I'm looking for a gift under ₦20,000'.",
          intent: 'unknown',
        };
    }
  }

  /**
   * Detect the intent of the user's message
   */
  private detectIntent(message: string): 'search' | 'info' | 'greeting' | 'unknown' {
    const lowerMessage = message.toLowerCase().trim();
    
    // Greeting patterns
    const greetingPatterns = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'howdy'];
    if (greetingPatterns.some(p => lowerMessage.startsWith(p) || lowerMessage === p)) {
      return 'greeting';
    }
    
    // Search patterns
    const searchPatterns = [
      'show me', 'looking for', 'find', 'search', 'want', 'need', 'buy',
      'recommend', 'suggest', 'do you have', 'any', 'where', 'product', 'price'
    ];
    if (searchPatterns.some(p => lowerMessage.includes(p))) {
      return 'search';
    }
    
    // Info patterns
    const infoPatterns = ['shipping', 'delivery', 'return', 'refund', 'contact', 'hours', 'help', 'how'];
    if (infoPatterns.some(p => lowerMessage.includes(p))) {
      return 'info';
    }
    
    // Default to search for any other query
    if (lowerMessage.length > 3) {
      return 'search';
    }
    
    return 'unknown';
  }

  /**
   * Search products based on natural language query
   */
  private async searchProducts(query: string): Promise<ProductSearchResult[]> {
    const lowerQuery = query.toLowerCase();
    
    // Extract price range if mentioned
    const priceMatch = lowerQuery.match(/under\s+(?:₦|ngn|naira)?\s*(\d+(?:,\d{3})*)/i);
    const maxPrice = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : undefined;
    
    const minPriceMatch = lowerQuery.match(/over\s+(?:₦|ngn|naira)?\s*(\d+(?:,\d{3})*)/i);
    const minPrice = minPriceMatch ? parseInt(minPriceMatch[1].replace(/,/g, '')) : undefined;
    
    // Extract keywords (remove common words and price mentions)
    const stopWords = ['show', 'me', 'find', 'looking', 'for', 'i', 'want', 'need', 'buy', 'a', 'an', 'the', 'some', 'any', 'do', 'you', 'have', 'under', 'over', 'price', 'ngn', 'naira'];
    const keywords = lowerQuery
      .replace(/[₦,]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word) && !/^\d+$/.test(word));
    
    // Build search query
    const products = await this.prisma.product.findMany({
      where: {
        AND: [
          // Price filters
          ...(maxPrice ? [{ price: { lte: maxPrice } }] : []),
          ...(minPrice ? [{ price: { gte: minPrice } }] : []),
          // Keyword search
          ...(keywords.length > 0 ? [
            {
              OR: keywords.flatMap(keyword => [
                { name: { contains: keyword, mode: 'insensitive' as const } },
                { description: { contains: keyword, mode: 'insensitive' as const } },
              ]),
            },
          ] : []),
        ],
      },
      include: {
        category: true,
      },
      take: 5,
    });
    
    return products.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      images: p.images,
      category: p.category?.name || 'Uncategorized',
    }));
  }

  /**
   * Get info response for common questions
   */
  private async getInfoResponse(query: string): Promise<string> {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('shipping') || lowerQuery.includes('delivery')) {
      return "📦 We offer nationwide delivery! Standard shipping takes 3-5 business days. Express delivery (1-2 days) is available in Lagos. Free shipping on orders over ₦50,000!";
    }
    
    if (lowerQuery.includes('return') || lowerQuery.includes('refund')) {
      return "↩️ We have a 14-day return policy. Items must be unworn and in original packaging. Refunds are processed within 5-7 business days after we receive the return.";
    }
    
    if (lowerQuery.includes('contact') || lowerQuery.includes('support')) {
      return "📞 You can reach us at support@wovenkulture.com or call +234 XXX XXX XXXX. Our customer service hours are Monday-Friday, 9am-6pm WAT.";
    }
    
    if (lowerQuery.includes('payment')) {
      return "💳 We accept all major credit/debit cards, bank transfers, and Paystack payments. All transactions are securely processed.";
    }
    
    return "I'd be happy to help! For specific questions about orders, returns, or shipping, please contact our customer service team.";
  }
}
