import { useState, useEffect, useCallback } from 'react'

export interface UseWatchlistResult {
  symbols: string[]
  addSymbol: (symbol: string) => boolean
  removeSymbol: (symbol: string) => void
  clearAll: () => void
  hasSymbol: (symbol: string) => boolean
  exportWatchlist: () => string
  importWatchlist: (data: string) => boolean
}

const STORAGE_KEY = 'stock-scanner-watchlist'
const DEFAULT_SYMBOLS = ['AAPL', 'TSLA', 'NVDA']

// Basic stock symbol validation
const isValidSymbol = (symbol: string): boolean => {
  const cleaned = symbol.trim().toUpperCase()
  return /^[A-Z]{1,5}$/.test(cleaned) && cleaned.length >= 1
}

export function useWatchlist(): UseWatchlistResult {
  const [symbols, setSymbols] = useState<string[]>([])

  // Load watchlist from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSymbols(parsed)
          return
        }
      }
    } catch (error) {
      console.error('Error loading watchlist:', error)
    }
    
    // Use default symbols if nothing saved or error
    setSymbols(DEFAULT_SYMBOLS)
  }, [])

  // Save to localStorage whenever symbols change
  useEffect(() => {
    if (symbols.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(symbols))
      } catch (error) {
        console.error('Error saving watchlist:', error)
      }
    }
  }, [symbols])

  const addSymbol = useCallback((symbol: string): boolean => {
    const cleaned = symbol.trim().toUpperCase()
    
    if (!isValidSymbol(cleaned)) {
      return false
    }

    setSymbols(prev => {
      if (prev.includes(cleaned)) {
        return prev // Already exists
      }
      if (prev.length >= 20) {
        return prev // Max limit reached
      }
      return [...prev, cleaned]
    })
    
    return true
  }, [])

  const removeSymbol = useCallback((symbol: string) => {
    setSymbols(prev => prev.filter(s => s !== symbol.toUpperCase()))
  }, [])

  const clearAll = useCallback(() => {
    setSymbols([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const hasSymbol = useCallback((symbol: string): boolean => {
    return symbols.includes(symbol.toUpperCase())
  }, [symbols])

  const exportWatchlist = useCallback((): string => {
    return JSON.stringify({
      version: 1,
      exported: new Date().toISOString(),
      symbols: symbols
    }, null, 2)
  }, [symbols])

  const importWatchlist = useCallback((data: string): boolean => {
    try {
      const parsed = JSON.parse(data)
      
      if (parsed.symbols && Array.isArray(parsed.symbols)) {
        const validSymbols = parsed.symbols
          .filter((s: any) => typeof s === 'string' && isValidSymbol(s))
          .map((s: string) => s.toUpperCase())
          .slice(0, 20) // Limit to 20 symbols
        
        if (validSymbols.length > 0) {
          setSymbols(validSymbols)
          return true
        }
      }
    } catch (error) {
      console.error('Error importing watchlist:', error)
    }
    
    return false
  }, [])

  return {
    symbols,
    addSymbol,
    removeSymbol,
    clearAll,
    hasSymbol,
    exportWatchlist,
    importWatchlist
  }
}