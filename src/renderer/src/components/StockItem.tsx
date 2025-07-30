import React from 'react'
import { StockQuote } from '../../../types/stock'
import { X, TrendingUp, TrendingDown } from 'lucide-react'

interface StockItemProps {
  quote: StockQuote
  onRemove: (symbol: string) => void
  onClick: (symbol: string) => void
  isSelected?: boolean
}

export const StockItem: React.FC<StockItemProps> = ({ 
  quote, 
  onRemove, 
  onClick, 
  isSelected = false 
}) => {
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

  const isPositive = quote.change >= 0
  const TrendIcon = isPositive ? TrendingUp : TrendingDown

  return (
    <div 
      className={`stock-item ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(quote.symbol)}
    >
      <div className="stock-header">
        <div className="stock-symbol-container">
          <span className="symbol">{quote.symbol}</span>
          <TrendIcon 
            size={12} 
            className={`trend-icon ${isPositive ? 'positive' : 'negative'}`} 
          />
        </div>
        <button 
          className="remove-btn"
          onClick={(e) => {
            e.stopPropagation()
            onRemove(quote.symbol)
          }}
          title="Remove from watchlist"
        >
          <X size={14} />
        </button>
      </div>
      
      <div className="stock-price">
        <span className="price">{formatPrice(quote.price)}</span>
        <span className={`change ${isPositive ? 'positive' : 'negative'}`}>
          {formatChange(quote.change, quote.changePercent)}
        </span>
      </div>
      
      <div className="stock-details">
        <div className="stock-volume">
          Vol: {formatVolume(quote.volume)}
        </div>
        <div className="stock-range">
          {formatPrice(quote.low)} - {formatPrice(quote.high)}
        </div>
      </div>
    </div>
  )
}