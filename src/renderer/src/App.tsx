import React, { useState } from 'react'
import { TrendingUp, AlertTriangle, BarChart3, Newspaper, RefreshCw, Plus } from 'lucide-react'
import { useStockData } from './hooks/useStockData'

const App: React.FC = () => {
  const { quotes, loading, error, refreshQuotes, addSymbol, removeSymbol } = useStockData()
  const [newSymbol, setNewSymbol] = useState('')

  const handleAddSymbol = (e: React.FormEvent) => {
    e.preventDefault()
    if (newSymbol.trim()) {
      addSymbol(newSymbol.trim())
      setNewSymbol('')
    }
  }

  const formatPrice = (price: number) => `$${price.toFixed(2)}`
  const formatChange = (change: number, changePercent: number) => {
    const sign = change >= 0 ? '+' : ''
    return `${sign}${changePercent.toFixed(2)}%`
  }
  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`
    if (volume >= 1000) return `${(volume / 1000).toFixed(0)}K`
    return volume.toString()
  }

  return (
    <div className="app">
      <header className="header">
        <h1>
          <TrendingUp className="logo" />
          Stock Scanner
        </h1>
        <div className="header-controls">
          <button 
            className="refresh-btn" 
            onClick={refreshQuotes}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            Refresh
          </button>
        </div>
      </header>
      
      <div className="main-layout">
        <aside className="sidebar">
          <div className="panel">
            <h2>
              <BarChart3 size={16} />
              Watchlist
            </h2>
            
            <form className="add-symbol-form" onSubmit={handleAddSymbol}>
              <input
                type="text"
                placeholder="Add symbol (e.g., AAPL)"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                className="symbol-input"
              />
              <button type="submit" className="add-btn">
                <Plus size={14} />
              </button>
            </form>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="watchlist">
              {loading && quotes.length === 0 ? (
                <div className="loading">Loading...</div>
              ) : (
                quotes.map((quote) => (
                  <div key={quote.symbol} className="stock-item">
                    <div className="stock-header">
                      <span className="symbol">{quote.symbol}</span>
                      <button 
                        className="remove-btn"
                        onClick={() => removeSymbol(quote.symbol)}
                        title="Remove from watchlist"
                      >
                        ×
                      </button>
                    </div>
                    <div className="stock-price">
                      <span className="price">{formatPrice(quote.price)}</span>
                      <span className={`change ${quote.change >= 0 ? 'positive' : 'negative'}`}>
                        {formatChange(quote.change, quote.changePercent)}
                      </span>
                    </div>
                    <div className="stock-volume">
                      Vol: {formatVolume(quote.volume)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="panel">
            <h2>
              <AlertTriangle size={16} />
              Active Alerts
            </h2>
            <div className="alerts">
              <div className="alert-item">
                <span className="alert-symbol">AAPL</span>
                <span className="alert-text">Volume spike: 2.5X avg</span>
              </div>
              <div className="alert-item">
                <span className="alert-symbol">NVDA</span>
                <span className="alert-text">Price moved &gt;5% in 15min</span>
              </div>
            </div>
          </div>
        </aside>
        
        <main className="content">
          <div className="panel chart-panel">
            <h2>Chart View</h2>
            <div className="chart-placeholder">
              <p>Chart will be displayed here</p>
            </div>
          </div>
          
          <div className="panel news-panel">
            <h2>
              <Newspaper size={16} />
              Breaking News
            </h2>
            <div className="news-list">
              <div className="news-item">
                <span className="news-time">10:30 AM</span>
                <span className="news-text">Apple announces Q4 earnings beat expectations</span>
              </div>
              <div className="news-item">
                <span className="news-time">09:45 AM</span>
                <span className="news-text">Tesla stock surges on production milestone</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App