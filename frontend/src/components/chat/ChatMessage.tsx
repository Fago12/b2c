'use client';

import Image from 'next/image';
import Link from 'next/link';
import styles from './ChatMessage.module.css';
import { formatPrice } from '@/lib/utils';

export interface Message {
    role: 'user' | 'assistant';
    content: string;
    products?: Array<{
        id: string;
        name: string;
        price: number;
        images: string[];
        category: string;
        regional?: {
            symbol: string;
            finalPrice: number;
        };
    }>;
    timestamp: Date;
}

interface ChatMessageProps {
    message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
    const isUser = message.role === 'user';

    return (
        <div className={`${styles.message} ${isUser ? styles.user : styles.assistant}`}>
            <div className={styles.bubble}>
                <p className={styles.content}>{message.content}</p>

                {/* Product Cards */}
                {message.products && message.products.length > 0 && (
                    <div className={styles.products}>
                        {message.products.map((product) => (
                            <Link
                                key={product.id}
                                href={`/product/${product.id}`}
                                className={styles.productCard}
                            >
                                <div className={styles.productImage}>
                                    {product.images[0] ? (
                                        <Image
                                            src={product.images[0]}
                                            alt={product.name}
                                            fill
                                            sizes="80px"
                                            className={styles.image}
                                        />
                                    ) : (
                                        <div className={styles.placeholder}>No Image</div>
                                    )}
                                </div>
                                <div className={styles.productInfo}>
                                    <span className={styles.productName}>{product.name}</span>
                                    <span className={styles.productCategory}>{product.category}</span>
                                    <span className={styles.productPrice}>
                                        {formatPrice(
                                            product.regional?.finalPrice || product.price,
                                            product.regional ? 'NGN' : 'NGN' // Default to NGN for chat if not specified, 
                                            // or use a smarter default. Given the context, NGN is the most likely target for chat.
                                        )}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
            <span className={styles.time}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
        </div>
    );
}
