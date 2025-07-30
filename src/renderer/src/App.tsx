import React from 'react'
import { TrendingUp, AlertTriangle, BarChart3, Newspaper } from 'lucide-react'

const App: React.FC = () => {
  return (
    <div className="app">
      <header className="header">
        <h1>
          <TrendingUp className="logo" />
          Stock Scanner
        </h1>
      </header>
      
      <div className="main-layout">
        <aside className="sidebar">
          <div className="panel">
            <h2>
              <BarChart3 size={16} />
              Watchlist
            </h2>
            <div className="watchlist">
              <div className="stock-item">
                <span className="symbol">AAPL</span>
                <span className="price">$150.25</span>
                <span className="change positive">+2.4%</span>
              </div>
              <div className="stock-item">
                <span className="symbol">TSLA</span>
                <span className="price">$248.50</span>
                <span className="change negative">-1.2%</span>
              </div>
              <div className="stock-item">
                <span className="symbol">NVDA</span>
                <span className="price">$875.30</span>
                <span className="change positive">+5.8%</span>
              </div>
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