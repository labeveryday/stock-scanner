import { useState, useEffect, useCallback } from 'react'
import { StockQuote } from '../../../types/stock'

// Mock API service for renderer process - will be replaced with IPC calls
class MockStockApiService {
  async getStockQuote(symbol: string): Promise<StockQuote> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
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

export function useStockData(initialSymbols: string[] = ['AAPL', 'TSLA', 'NVDA']): UseStockDataResult {
  const [symbols, setSymbols] = useState<string[]>(initialSymbols)
  const [quotes, setQuotes] = useState<StockQuote[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQuotes = useCallback(async () => {
    if (symbols.length === 0) return

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
    const upperSymbol = symbol.toUpperCase()
    setSymbols(prev => {
      if (prev.includes(upperSymbol)) return prev
      return [...prev, upperSymbol]
    })
  }, [])

  const removeSymbol = useCallback((symbol: string) => {
    setSymbols(prev => prev.filter(s => s !== symbol.toUpperCase()))
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