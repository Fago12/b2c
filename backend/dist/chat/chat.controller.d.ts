import { ChatService } from './chat.service';
export declare class ChatController {
    private chatService;
    constructor(chatService: ChatService);
    sendMessage(body: {
        message: string;
        context?: {
            cartItems?: string[];
            currentPage?: string;
        };
    }): Promise<import("./chat.service").ChatResponse>;
    getConfig(): {
        welcomeMessage: string;
        placeholder: string;
        suggestedQueries: string[];
    };
}
