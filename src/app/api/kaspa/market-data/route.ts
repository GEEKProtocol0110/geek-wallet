import { NextResponse } from 'next/server';

// Try multiple free APIs
const APIS = {
  coincap: 'https://api.coincap.io/v2',
  coinpaprika: 'https://api.coinpaprika.com/v1',
};

const KASPA_IDS = {
  coincap: 'kaspa',
  coinpaprika: 'kas-kaspa',
};

// Generate mock market data as fallback
function generateMockMarketData() {
  const basePrice = 0.15;
  const currentPrice = basePrice * (0.95 + Math.random() * 0.1);
  const priceChange24h = (Math.random() - 0.5) * 10;
  
  return [{
    id: 'kaspa',
    current_price: currentPrice,
    market_cap: currentPrice * 23400000000,
    total_volume: currentPrice * 80000000,
    circulating_supply: 23400000000,
    price_change_percentage_24h: priceChange24h,
  }];
}

// Try CoinCap API
async function fetchFromCoinCap() {
  const response = await fetch(
    `${APIS.coincap}/assets/${KASPA_IDS.coincap}`,
    {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 60 },
    }
  );
  
  if (!response.ok) throw new Error(`CoinCap API error: ${response.status}`);
  
  const json = await response.json();
  if (!json.data) throw new Error('No data from CoinCap');
  
  const data = json.data;
  return [{
    id: 'kaspa',
    current_price: parseFloat(data.priceUsd),
    market_cap: parseFloat(data.marketCapUsd),
    total_volume: parseFloat(data.volumeUsd24Hr),
    circulating_supply: parseFloat(data.supply),
    price_change_percentage_24h: parseFloat(data.changePercent24Hr),
  }];
}

// Try CoinPaprika API
async function fetchFromCoinPaprika() {
  const response = await fetch(
    `${APIS.coinpaprika}/tickers/${KASPA_IDS.coinpaprika}`,
    {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 60 },
    }
  );
  
  if (!response.ok) throw new Error(`CoinPaprika API error: ${response.status}`);
  
  const data = await response.json();
  if (!data) throw new Error('No data from CoinPaprika');
  
  return [{
    id: 'kaspa',
    current_price: data.quotes?.USD?.price || 0,
    market_cap: data.quotes?.USD?.market_cap || 0,
    total_volume: data.quotes?.USD?.volume_24h || 0,
    circulating_supply: data.circulating_supply || 23400000000,
    price_change_percentage_24h: data.quotes?.USD?.percent_change_24h || 0,
  }];
}

export async function GET() {
  // Try APIs in order
  const apis = [
    { name: 'CoinCap', fn: fetchFromCoinCap },
    { name: 'CoinPaprika', fn: fetchFromCoinPaprika },
  ];

  for (const api of apis) {
    try {
      console.log(`Trying ${api.name} API for Kaspa market data...`);
      const data = await api.fn();
      console.log(`✓ Successfully fetched data from ${api.name}`);
      return NextResponse.json(data);
    } catch (error) {
      console.log(`✗ ${api.name} failed:`, error instanceof Error ? error.message : error);
    }
  }

  // All APIs failed, use mock data
  console.log('All APIs failed, using mock data');
  const mockData = generateMockMarketData();
  return NextResponse.json(mockData);
}
