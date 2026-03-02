
export async function detectUserRegion() {
  try {
    // Try ipapi.co first
    const res = await fetch('https://ipapi.co/json/');
    const data = await res.json();
    if (data.country_code) return mapCountryToRegion(data.country_code);

    // Fallback to ip-api.com
    const res2 = await fetch('http://ip-api.com/json/');
    const data2 = await res2.json();
    if (data2.countryCode) return mapCountryToRegion(data2.countryCode);

    return 'US';
  } catch (err) {
    console.error('Geo-detection failed', err);
    return 'US';
  }
}

function mapCountryToRegion(code: string): string {
  const mapping: Record<string, string> = {
    'NG': 'NG',
    'GH': 'GH',
    'IN': 'IN',
    'CN': 'CN',
    'GB': 'GB',
    'CA': 'CA',
    'US': 'US'
  };
  return mapping[code.toUpperCase()] || 'US';
}
