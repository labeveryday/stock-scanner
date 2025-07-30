import React, { useState } from 'react'
import { TrendingUp, AlertTriangle, BarChart3, Newspaper, RefreshCw } from 'lucide-react'
import { useStockData } from './hooks/useStockData'
import { useWatchlist } from './hooks/useWatchlist'
import { StockItem } from './components/StockItem'
import { WatchlistControls } from './components/WatchlistControls'

const App: React.FC = () => {
  const watchlist = useWatchlist()
  const { quotes, loading, error, refreshQuotes } = useStockData(watchlist.symbols)
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)

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
            
            <WatchlistControls
              onAddSymbol={watchlist.addSymbol}
              onClearAll={watchlist.clearAll}
              onExport={watchlist.exportWatchlist}
              onImport={watchlist.importWatchlist}
              symbolCount={watchlist.symbols.length}
            />

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
                  <StockItem
                    key={quote.symbol}
                    quote={quote}
                    onRemove={watchlist.removeSymbol}
                    onClick={setSelectedSymbol}
                    isSelected={selectedSymbol === quote.symbol}
                  />
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