import { useState, useEffect, useCallback } from 'react'
import { StockQuote } from '../../../types/stock'

// Mock API service for renderer process - will be replaced with IPC calls
class MockStockApiService {
  async getStockQuote(symbol: string): Promise<StockQuote> {
    // Simulate API delay (shorter for better UX)
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Mock data with realistic values
    const mockData: Record<string, Partial<StockQuote>> = {
      'AAPL': { price: 150.25, change: 3.45, changePercent: 2.35, volume: 45623000 },
      'TSLA': { price: 248.50, change: -2.85, changePercent: -1.13, volume: 52341000 },
      'NVDA': { price: 875.30, change: 48.20, changePercent: 5.83, volume: 38954000 },
      'MSFT': { price: 342.15, change: 1.25, changePercent: 0.37, volume: 23456000 },
      'GOOGL': { price: 127.85, change: -1.15, changePercent: -0.89, volume: 28734000 }
    }

    const baseData = mockData[symbol.toUpperCase()] || { price: 100, change: 0, changePercent: 0, volume: 1000000 }
    
    return {
      symbol: symbol.toUpperCase(),
      price: baseData.price! + (Math.random() - 0.5) * 2, // Add some variance
      change: baseData.change!,
      changePercent: baseData.changePercent!,
      volume: baseData.volume!,
      previousClose: baseData.price! - baseData.change!,
      open: baseData.price! - baseData.change! + (Math.random() - 0.5),
      high: baseData.price! + Math.random() * 5,
      low: baseData.price! - Math.random() * 5,
      timestamp: new Date()
    }
  }

  async getMultipleQuotes(symbols: string[]): Promise<StockQuote[]> {
    const promises = symbols.map(symbol => this.getStockQuote(symbol))
    return Promise.all(promises)
  }
}

const mockApi = new MockStockApiService()

export interface UseStockDataResult {
  quotes: StockQuote[]
  loading: boolean
  error: string | null
  refreshQuotes: () => void
  addSymbol: (symbol: string) => void
  removeSymbol: (symbol: string) => void
}

export function useStockData(symbols: string[] = ['AAPL', 'TSLA', 'NVDA']): UseStockDataResult {
  const [quotes, setQuotes] = useState<StockQuote[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQuotes = useCallback(async () => {
    if (symbols.length === 0) {
      setQuotes([])
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const newQuotes = await mockApi.getMultipleQuotes(symbols)
      setQuotes(newQuotes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stock data')
      console.error('Error fetching stock quotes:', err)
    } finally {
      setLoading(false)
    }
  }, [symbols])

  const refreshQuotes = useCallback(() => {
    fetchQuotes()
  }, [fetchQuotes])

  const addSymbol = useCallback((symbol: string) => {
    // This is now handled by the watchlist hook
    console.log('addSymbol called - should be handled by watchlist')
  }, [])

  const removeSymbol = useCallback((symbol: string) => {
    // This is now handled by the watchlist hook
    console.log('removeSymbol called - should be handled by watchlist')
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchQuotes()
  }, [fetchQuotes])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchQuotes, 30000)
    return () => clearInterval(interval)
  }, [fetchQuotes])

  return {
    quotes,
    loading,
    error,
    refreshQuotes,
    addSymbol,
    removeSymbol
  }
}