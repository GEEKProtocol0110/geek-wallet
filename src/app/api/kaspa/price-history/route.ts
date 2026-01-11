import { NextRequest, NextResponse } from 'next/server';

// Try multiple free APIs in order of preference
const APIS = {
  coincap: 'https://api.coincap.io/v2',
  coinpaprika: 'https://api.coinpaprika.com/v1',
};

const KASPA_IDS = {
  coincap: 'kaspa',
  coinpaprika: 'kas-kaspa',
};

// Generate mock data as fallback
function generateMockPriceData(days: number) {
  const now = Date.now();
  const points = days === 1 ? 24 : days <= 7 ? days * 24 : days <= 30 ? days * 4 : days;
  const interval = days === 1 ? 3600000 : days <= 7 ? 3600000 : days <= 30 ? 21600000 : 86400000;
  
  const basePrice = 0.15;
  const volatility = 0.02;
  
  const prices: [number, number][] = [];
  let price = basePrice * (0.95 + Math.random() * 0.1);
  
  for (let i = points; i >= 0; i--) {
    const timestamp = now - (i * interval);
    const change = (Math.random() - 0.5) * volatility * basePrice;
    price = Math.max(0.01, price + change);
    prices.push([timestamp, price]);
  }
  
  return {
    prices,
    market_caps: prices.map(([ts, p]) => [ts, p * 23400000000]),
    total_volumes: prices.map(([ts, p]) => [ts, p * 80000000]),
  };
}

// Try CoinCap API
async function fetchFromCoinCap(days: number) {
  const interval = days === 1 ? 'h1' : days <= 7 ? 'h6' : 'd1';
  const end = Date.now();
  const start = end - (days * 24 * 60 * 60 * 1000);
  
  const response = await fetch(
    `${APIS.coincap}/assets/${KASPA_IDS.coincap}/history?interval=${interval}&start=${start}&end=${end}`,
    {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 60 },
    }
  );
  
  if (!response.ok) throw new Error(`CoinCap API error: ${response.status}`);
  
  const json = await response.json();
  if (!json.data || json.data.length === 0) throw new Error('No data from CoinCap');
  
  return {
    prices: json.data.map((item: any) => [item.time, parseFloat(item.priceUsd)]),
    market_caps: json.data.map((item: any) => [item.time, parseFloat(item.priceUsd) * 23400000000]),
    total_volumes: json.data.map((item: any) => [item.time, parseFloat(item.priceUsd) * 80000000]),
  };
}

// Try CoinPaprika API
async function fetchFromCoinPaprika(days: number) {
  const end = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
  const start = startDate.toISOString().split('T')[0];
  
  const response = await fetch(
    `${APIS.coinpaprika}/coins/${KASPA_IDS.coinpaprika}/ohlcv/historical?start=${start}&end=${end}`,
    {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 60 },
    }
  );
  
  if (!response.ok) throw new Error(`CoinPaprika API error: ${response.status}`);
  
  const json = await response.json();
  if (!json || json.length === 0) throw new Error('No data from CoinPaprika');
  
  return {
    prices: json.map((item: any) => [new Date(item.time_close).getTime(), item.close]),
    market_caps: json.map((item: any) => [new Date(item.time_close).getTime(), item.close * 23400000000]),
    total_volumes: json.map((item: any) => [new Date(item.time_close).getTime(), item.volume || item.close * 80000000]),
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const days = parseInt(searchParams.get('days') || '1');

  // Try APIs in order
  const apis = [
    { name: 'CoinCap', fn: () => fetchFromCoinCap(days) },
    { name: 'CoinPaprika', fn: () => fetchFromCoinPaprika(days) },
  ];

  for (const api of apis) {
    try {
      console.log(`Trying ${api.name} API for Kaspa price data...`);
      const data = await api.fn();
      console.log(`✓ Successfully fetched data from ${api.name}`);
      return NextResponse.json(data);
    } catch (error) {
      console.log(`✗ ${api.name} failed:`, error instanceof Error ? error.message : error);
    }
  }

  // All APIs failed, use mock data
  console.log('All APIs failed, using mock data');
  const mockData = generateMockPriceData(days);
  return NextResponse.json(mockData);
}
