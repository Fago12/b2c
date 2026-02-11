'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatMessage, Message } from './ChatMessage';
import styles from './ChatWidget.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ChatConfig {
    welcomeMessage: string;
    placeholder: string;
    suggestedQueries: string[];
}

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [config, setConfig] = useState<ChatConfig | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load config on mount
    useEffect(() => {
        fetch(`${API_URL}/chat/config`)
            .then(res => res.json())
            .then(data => {
                setConfig(data);
                setMessages([{
                    role: 'assistant',
                    content: data.welcomeMessage,
                    timestamp: new Date(),
                }]);
            })
            .catch(console.error);
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (messageText?: string) => {
        const text = messageText || input.trim();
        if (!text || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: text,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/chat/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text }),
            });

            const data = await response.json();

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.message,
                products: data.products,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date(),
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className={styles.container}>
            {/* Chat Button */}
            <button
                className={styles.chatButton}
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? 'Close chat' : 'Open chat'}
            >
                {isOpen ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className={styles.chatWindow}>
                    <div className={styles.header}>
                        <div className={styles.headerInfo}>
                            <span className={styles.title}>Shopping Assistant</span>
                            <span className={styles.subtitle}>We typically reply instantly</span>
                        </div>
                        <button
                            className={styles.closeButton}
                            onClick={() => setIsOpen(false)}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className={styles.messages}>
                        {messages.map((msg, idx) => (
                            <ChatMessage key={idx} message={msg} />
                        ))}
                        {isLoading && (
                            <div className={styles.typing}>
                                <span></span><span></span><span></span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggested queries */}
                    {messages.length <= 1 && config?.suggestedQueries && (
                        <div className={styles.suggestions}>
                            {config.suggestedQueries.map((query, idx) => (
                                <button
                                    key={idx}
                                    className={styles.suggestion}
                                    onClick={() => sendMessage(query)}
                                >
                                    {query}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className={styles.inputContainer}>
                        <input
                            type="text"
                            className={styles.input}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder={config?.placeholder || 'Type a message...'}
                            disabled={isLoading}
                        />
                        <button
                            className={styles.sendButton}
                            onClick={() => sendMessage()}
                            disabled={!input.trim() || isLoading}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
