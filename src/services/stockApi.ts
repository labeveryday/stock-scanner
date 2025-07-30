import { StockQuote, StockTimeSeriesData, AlphaVantageQuoteResponse, AlphaVantageTimeSeriesResponse } from '../types/stock'

const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query'
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo'

export class StockApiService {
  private static instance: StockApiService
  private cache = new Map<string, { data: any, timestamp: number }>()
  private readonly CACHE_DURATION = 60000 // 1 minute cache

  static getInstance(): StockApiService {
    if (!StockApiService.instance) {
      StockApiService.instance = new StockApiService()
    }
    return StockApiService.instance
  }

  private async fetchFromApi(params: Record<string, string>): Promise<any> {
    const url = new URL(ALPHA_VANTAGE_BASE_URL)
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })

    const response = await fetch(url.toString())
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    const data = await response.json()
    
    // Check for API error messages
    if (data['Error Message']) {
      throw new Error(`Alpha Vantage API Error: ${data['Error Message']}`)
    }
    
    if (data['Note']) {
      throw new Error(`Alpha Vantage API Rate Limit: ${data['Note']}`)
    }

    return data
  }

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }
    return null
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  async getStockQuote(symbol: string): Promise<StockQuote> {
    const cacheKey = `quote_${symbol}`
    const cached = this.getCachedData(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const data: AlphaVantageQuoteResponse = await this.fetchFromApi({
        function: 'GLOBAL_QUOTE',
        symbol: symbol.toUpperCase(),
        apikey: API_KEY
      })

      const quote = data['Global Quote']
      if (!quote) {
        throw new Error('Invalid response format from Alpha Vantage')
      }

      const stockQuote: StockQuote = {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        previousClose: parseFloat(quote['08. previous close']),
        open: parseFloat(quote['02. open']),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        timestamp: new Date(quote['07. latest trading day'])
      }

      this.setCachedData(cacheKey, stockQuote)
      return stockQuote
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error)
      throw error
    }
  }

  async getIntradayData(symbol: string, interval: '1min' | '5min' | '15min' = '1min'): Promise<StockTimeSeriesData[]> {
    const cacheKey = `intraday_${symbol}_${interval}`
    const cached = this.getCachedData(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const data: AlphaVantageTimeSeriesResponse = await this.fetchFromApi({
        function: 'TIME_SERIES_INTRADAY',
        symbol: symbol.toUpperCase(),
        interval,
        apikey: API_KEY,
        outputsize: 'compact'
      })

      const timeSeries = data[`Time Series (${interval})`]
      if (!timeSeries) {
        throw new Error('Invalid response format from Alpha Vantage')
      }

      const timeSeriesData: StockTimeSeriesData[] = Object.entries(timeSeries)
        .map(([timestamp, values]) => ({
          symbol: symbol.toUpperCase(),
          timestamp: new Date(timestamp),
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume'])
        }))
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()) // Most recent first

      this.setCachedData(cacheKey, timeSeriesData)
      return timeSeriesData
    } catch (error) {
      console.error(`Error fetching intraday data for ${symbol}:`, error)
      throw error
    }
  }

  async getMultipleQuotes(symbols: string[]): Promise<StockQuote[]> {
    const promises = symbols.map(symbol => 
      this.getStockQuote(symbol).catch(error => {
        console.error(`Failed to fetch ${symbol}:`, error)
        return null
      })
    )
    
    const results = await Promise.all(promises)
    return results.filter((quote): quote is StockQuote => quote !== null)
  }

  clearCache(): void {
    this.cache.clear()
  }
}