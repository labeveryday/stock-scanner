import React, { useState, useRef } from 'react'
import { Plus, Trash2, Download, Upload, AlertCircle } from 'lucide-react'

interface WatchlistControlsProps {
  onAddSymbol: (symbol: string) => boolean
  onClearAll: () => void
  onExport: () => string
  onImport: (data: string) => boolean
  symbolCount: number
}

export const WatchlistControls: React.FC<WatchlistControlsProps> = ({
  onAddSymbol,
  onClearAll,
  onExport,
  onImport,
  symbolCount
}) => {
  const [newSymbol, setNewSymbol] = useState('')
  const [error, setError] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAddSymbol = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!newSymbol.trim()) {
      setError('Please enter a stock symbol')
      return
    }

    const success = onAddSymbol(newSymbol.trim())
    if (success) {
      setNewSymbol('')
    } else {
      setError('Invalid symbol or already in watchlist')
    }
  }

  const handleExport = () => {
    const data = onExport()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stock-watchlist-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const data = event.target?.result as string
        const success = onImport(data)
        if (!success) {
          setError('Invalid watchlist file format')
        }
      }
      reader.readAsText(file)
    }
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClearAll = () => {
    if (showConfirm) {
      onClearAll()
      setShowConfirm(false)
    } else {
      setShowConfirm(true)
      setTimeout(() => setShowConfirm(false), 3000)
    }
  }

  return (
    <div className="watchlist-controls">
      <form className="add-symbol-form" onSubmit={handleAddSymbol}>
        <input
          type="text"
          placeholder="Add symbol (e.g., AAPL)"
          value={newSymbol}
          onChange={(e) => {
            setNewSymbol(e.target.value.toUpperCase())
            setError('')
          }}
          className="symbol-input"
          maxLength={5}
        />
        <button type="submit" className="add-btn" title="Add to watchlist">
          <Plus size={14} />
        </button>
      </form>

      {error && (
        <div className="error-message">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <div className="watchlist-actions">
        <div className="action-group">
          <button 
            className="action-btn export-btn" 
            onClick={handleExport}
            title="Export watchlist"
            disabled={symbolCount === 0}
          >
            <Download size={14} />
            Export
          </button>
          
          <button 
            className="action-btn import-btn" 
            onClick={() => fileInputRef.current?.click()}
            title="Import watchlist"
          >
            <Upload size={14} />
            Import
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </div>

        <button 
          className={`action-btn clear-btn ${showConfirm ? 'confirm' : ''}`}
          onClick={handleClearAll}
          title={showConfirm ? 'Click again to confirm' : 'Clear all symbols'}
          disabled={symbolCount === 0}
        >
          <Trash2 size={14} />
          {showConfirm ? 'Confirm?' : 'Clear All'}
        </button>
      </div>

      <div className="watchlist-info">
        {symbolCount}/20 symbols
      </div>
    </div>
  )
}