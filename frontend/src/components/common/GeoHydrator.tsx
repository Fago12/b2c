
"use client";

import { useEffect } from 'react';
import { detectUserRegion } from '@/lib/geo';
import { useCart } from '@/lib/store/cart';
import { fetchApi } from '@/lib/api';

export function GeoHydrator() {
    const { fetchCart } = useCart();

    useEffect(() => {
        const hydrate = async () => {
            // Check if region is already set in cookies
            const cookies = document.cookie.split(';').reduce((acc, c) => {
                const [k, v] = c.trim().split('=');
                acc[k] = v;
                return acc;
            }, {} as any);

            const currentRegion = cookies['region_code'];
            const hasDetectedThisSession = sessionStorage.getItem('geo_detected');

            // If no region OR it's 'US' (the default) and we haven't checked this session
            if (!currentRegion || (currentRegion === 'US' && !hasDetectedThisSession)) {
                console.log('[GeoHydrator] Detecting region...');
                const detectedRegion = await detectUserRegion();
                sessionStorage.setItem('geo_detected', 'true');

                if (detectedRegion !== currentRegion) {
                    console.log(`[GeoHydrator] Changing region from ${currentRegion} to ${detectedRegion}`);
                    try {
                        await fetchApi('/cart/region', {
                            method: 'POST',
                            body: JSON.stringify({ regionCode: detectedRegion })
                        });
                        await fetchCart();
                        // Force a reload to ensure all pricing and Server Components refresh with new cookie
                        window.location.reload();
                    } catch (err) {
                        console.error('[GeoHydrator] Failed to sync region', err);
                    }
                }
            }
        };

        hydrate();
    }, [fetchCart]);

    return null;
}
