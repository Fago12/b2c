
/**
 * Maps a country code (e.g. from geo-detection) to a supported region code.
 */
export function mapCountryToRegion(countryCode: string | null): string {
  if (!countryCode) return 'US';
  
  const upperCode = countryCode.toUpperCase();
  
  const mapping: Record<string, string> = {
    'NG': 'NG',
    'GH': 'GH',
    'IN': 'IN',
    'CN': 'CN',
    'GB': 'GB', // If supported in future
    'US': 'US'
  };

  return mapping[upperCode] || 'US';
}

export const REGION_COOKIE_NAME = 'region_code';

/**
 * Gets the current region code from cookies.
 * This works on the client. 
 * For server side, use next/headers cookies().
 */
export function getRegionCodeClient(): string {
  if (typeof document === 'undefined') return 'US';
  
  const cookies = document.cookie.split(';');
  const regionCookie = cookies.find(c => c.trim().startsWith(`${REGION_COOKIE_NAME}=`));
  
  if (regionCookie) {
    return regionCookie.split('=')[1].trim();
  }
  
  return 'US'; // Default
}

/**
 * Sets the region code in a cookie.
 */
export function setRegionCode(code: string) {
  if (typeof document === 'undefined') return;
  
  // Set for 30 days
  const expires = new Date();
  expires.setTime(expires.getTime() + (30 * 24 * 60 * 60 * 1000));
  
  document.cookie = `${REGION_COOKIE_NAME}=${code};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}
