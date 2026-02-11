'use client';

import Script from 'next/script';

export function UmamiAnalytics() {
    const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
    const umamiUrl = process.env.NEXT_PUBLIC_UMAMI_URL || 'https://cloud.umami.is/script.js';

    if (!websiteId) {
        return null;
    }

    return (
        <Script
            src={umamiUrl}
            data-website-id={websiteId}
            strategy="lazyOnload"
        />
    );
}

// Analytics helper functions for event tracking
export const analytics = {
    /**
     * Track a custom event
     */
    track: (eventName: string, data?: Record<string, string | number>) => {
        if (typeof window !== 'undefined' && (window as any).umami) {
            (window as any).umami.track(eventName, data);
        }
    },

    /**
     * Track page view (automatic with Umami, but can be called manually for SPAs)
     */
    pageView: (url?: string, referrer?: string) => {
        if (typeof window !== 'undefined' && (window as any).umami) {
            (window as any).umami.track('pageview', {
                url: url || window.location.pathname,
                referrer: referrer || document.referrer,
            });
        }
    },

    /**
     * Track add to cart event
     */
    addToCart: (productId: string, productName: string, price: number, quantity: number = 1) => {
        analytics.track('add_to_cart', {
            product_id: productId,
            product_name: productName,
            price: price,
            quantity: quantity,
        });
    },

    /**
     * Track remove from cart event
     */
    removeFromCart: (productId: string, productName: string) => {
        analytics.track('remove_from_cart', {
            product_id: productId,
            product_name: productName,
        });
    },

    /**
     * Track begin checkout event
     */
    beginCheckout: (cartTotal: number, itemCount: number) => {
        analytics.track('begin_checkout', {
            cart_total: cartTotal,
            item_count: itemCount,
        });
    },

    /**
     * Track purchase event
     */
    purchase: (orderId: string, total: number, itemCount: number) => {
        analytics.track('purchase', {
            order_id: orderId,
            total: total,
            item_count: itemCount,
        });
    },

    /**
     * Track product view event
     */
    viewProduct: (productId: string, productName: string, price: number, category?: string) => {
        analytics.track('view_product', {
            product_id: productId,
            product_name: productName,
            price: price,
            category: category || '',
        });
    },

    /**
     * Track search event
     */
    search: (query: string, resultsCount: number) => {
        analytics.track('search', {
            query: query,
            results_count: resultsCount,
        });
    },

    /**
     * Track sign up event
     */
    signUp: (method: 'email' | 'google' | 'apple') => {
        analytics.track('sign_up', { method });
    },

    /**
     * Track login event
     */
    login: (method: 'email' | 'google' | 'apple') => {
        analytics.track('login', { method });
    },

    /**
     * Track coupon applied event
     */
    applyCoupon: (couponCode: string, discount: number) => {
        analytics.track('apply_coupon', {
            coupon_code: couponCode,
            discount: discount,
        });
    },
};

export default UmamiAnalytics;
