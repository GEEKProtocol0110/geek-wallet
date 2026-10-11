/**
 * Price API utilities for fetching cryptocurrency price data
 */

interface CoinGeckoPrice {
  prices: [number, number][]; // [timestamp, price]
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

interface CoinGeckoMarketData {
  id: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  circulating_supply: number;
  price_change_percentage_24h: number;
}

export interface PriceData {
  timestamp: number;
  price: number;
}

export interface MarketStats {
  currentPrice: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  priceChange24h: number;
}

/**
 * Get Kaspa price history for a given time range
 */
export async function getKaspaPriceHistory(days: number): Promise<PriceData[]> {
  try {
    const response = await fetch(
      `/api/kaspa/price-history?days=${days}`,
      { cache: 'no-store' } // Disable caching to get fresh data
    );
    
    if (!response.ok) {
      console.warn(`Price history API returned ${response.status}`);
      return []; // Return empty array instead of throwing
    }
    
    const data: CoinGeckoPrice = await response.json();
    
    if (!data.prices || data.prices.length === 0) {
      console.warn('No price data available');
      return [];
    }
    
    return data.prices.map(([timestamp, price]) => ({
      timestamp,
      price,
    }));
  } catch (error) {
    console.error('Failed to fetch price history:', error);
    return []; // Return empty array instead of throwing
  }
}

/**
 * Get current Kaspa market data
 */
export async function getKaspaMarketData(): Promise<MarketStats> {
  try {
    const response = await fetch(
      `/api/kaspa/market-data`,
      { cache: 'no-store' } // Disable caching to get fresh data
    );
    
    if (!response.ok) {
      console.warn(`Market data API returned ${response.status}`);
      // Return default values instead of throwing
      return {
        currentPrice: 0.15,
        marketCap: 3510000000,
        volume24h: 12000000,
        circulatingSupply: 23400000000,
        priceChange24h: 0,
      };
    }
    
    const data: CoinGeckoMarketData[] = await response.json();
    
    if (!data || data.length === 0) {
      console.warn('No market data available');
      return {
        currentPrice: 0.15,
        marketCap: 3510000000,
        volume24h: 12000000,
        circulatingSupply: 23400000000,
        priceChange24h: 0,
      };
    }
    
    const kaspa = data[0];
    
    return {
      currentPrice: kaspa.current_price || 0.15,
      marketCap: kaspa.market_cap || 3510000000,
      volume24h: kaspa.total_volume || 12000000,
      circulatingSupply: kaspa.circulating_supply || 23400000000,
      priceChange24h: kaspa.price_change_percentage_24h || 0,
    };
  } catch (error) {
    console.error('Failed to fetch market data:', error);
    // Return default values instead of throwing
    return {
      currentPrice: 0.15,
      marketCap: 3510000000,
      volume24h: 12000000,
      circulatingSupply: 23400000000,
      priceChange24h: 0,
    };
  }
}

/**
 * Format large numbers with appropriate suffixes (K, M, B, T)
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1e12) {
    return (num / 1e12).toFixed(2) + 'T';
  }
  if (num >= 1e9) {
    return (num / 1e9).toFixed(2) + 'B';
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + 'M';
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + 'K';
  }
  return num.toFixed(2);
}
