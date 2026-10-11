'use client';

import { useEffect, useState, useRef } from 'react';
import { Card } from '../ui/Card';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getKaspaPriceHistory, getKaspaMarketData, formatLargeNumber, type PriceData, type MarketStats } from '@/lib/price-api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y';

export function KaspaPriceChart() {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [marketStats, setMarketStats] = useState<MarketStats | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [priceChangePercent, setPriceChangePercent] = useState<number>(0);
  const [timeRange, setTimeRange] = useState<TimeRange>('1D');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Map time ranges to days
  const getDaysForRange = (range: TimeRange): number => {
    switch (range) {
      case '1D': return 1;
      case '1W': return 7;
      case '1M': return 30;
      case '3M': return 90;
      case '1Y': return 365;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const days = getDaysForRange(timeRange);
        
        // Fetch price history and market data in parallel
        const [priceHistory, marketData] = await Promise.all([
          getKaspaPriceHistory(days),
          getKaspaMarketData(),
        ]);
        
        // Check if we got valid data
        if (!priceHistory || priceHistory.length === 0) {
          setError('Unable to load price data. Please try again later.');
          setIsLoading(false);
          return;
        }
        
        setPriceData(priceHistory);
        setMarketStats(marketData);
        setCurrentPrice(marketData.currentPrice);
        setPriceChangePercent(marketData.priceChange24h);
        
        // Calculate price change for selected range
        if (priceHistory.length > 0) {
          const firstPrice = priceHistory[0].price;
          const lastPrice = priceHistory[priceHistory.length - 1].price;
          const rangeChange = lastPrice - firstPrice;
          const rangeChangePercent = (rangeChange / firstPrice) * 100;
          
          setPriceChange(rangeChange);
          // Only update percentage if not 1D (use 24h change from API for 1D)
          if (timeRange !== '1D') {
            setPriceChangePercent(rangeChangePercent);
          }
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch price data:', err);
        setError('Failed to load price data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchData();

    // Refresh data every 60 seconds
    intervalRef.current = setInterval(() => {
      fetchData();
    }, 60000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timeRange]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    if (timeRange === '1D') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (timeRange === '1W') {
      return date.toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const chartData = {
    labels: priceData.map(d => formatTime(d.timestamp)),
    datasets: [
      {
        label: 'KAS Price (USD)',
        data: priceData.map(d => d.price),
        borderColor: priceChange >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
        backgroundColor: priceChange >= 0 
          ? 'rgba(34, 197, 94, 0.1)' 
          : 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: priceChange >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            return `$${(context.parsed.y ?? 0).toFixed(4)}`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 6,
          color: '#9CA3AF',
        },
      },
      y: {
        display: true,
        position: 'right',
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
        ticks: {
          callback: (value) => {
            return '$' + Number(value).toFixed(4);
          },
          color: '#9CA3AF',
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  const timeRanges: TimeRange[] = ['1D', '1W', '1M', '3M', '1Y'];

  if (isLoading) {
    return (
      <Card>
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="h-80 flex flex-col items-center justify-center">
          <svg className="w-12 h-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Retry
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Kaspa (KAS)
              </h3>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-semibold ${
                priceChange >= 0 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                {priceChange >= 0 ? '▲' : '▼'}
                {Math.abs(priceChangePercent).toFixed(2)}%
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              ${currentPrice.toFixed(4)}
            </div>
            <div className={`text-sm mt-1 ${
              priceChange >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {priceChange >= 0 ? '+' : ''}${priceChange.toFixed(4)} ({timeRange})
            </div>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                  timeRange === range
                    ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="h-64">
          <Line data={chartData} options={options} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Market Cap</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              ${marketStats ? formatLargeNumber(marketStats.marketCap) : '—'}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">24h Volume</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              ${marketStats ? formatLargeNumber(marketStats.volume24h) : '—'}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Circulating Supply</div>
            <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {marketStats ? formatLargeNumber(marketStats.circulatingSupply) : '—'} KAS
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
