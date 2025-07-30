import { app, BrowserWindow } from 'electron'
import * as path from 'path'

const isDev = process.env.NODE_ENV === 'development'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false // Allow loading from any localhost port in dev
    },
    titleBarStyle: 'hiddenInset',
    show: false
  })

  if (isDev) {
    // Try different ports that Vite might use
    const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:3000'
    console.log('Loading dev URL:', devUrl)
    
    const tryUrl = async (url: string) => {
      try {
        await mainWindow.loadURL(url)
        console.log(`Successfully loaded: ${url}`)
        mainWindow.webContents.openDevTools()
      } catch (error) {
        console.log(`Failed to load ${url}, trying next...`)
        throw error
      }
    }
    
    // Try multiple ports in sequence
    tryUrl(devUrl).catch(() => {
      tryUrl('http://localhost:3001').catch(() => {
        tryUrl('http://localhost:3002').catch(() => {
          console.error('Could not connect to Vite dev server on any port')
          // Load a simple error page
          mainWindow.loadURL(`data:text/html,
            <html>
              <body style="font-family: Arial; padding: 20px; background: #1a1a1a; color: white;">
                <h1>Development Server Error</h1>
                <p>Could not connect to Vite dev server.</p>
                <p>Make sure the dev server is running with: <code>npm run dev:renderer</code></p>
                <p>Or try the old dev command: <code>npm run dev:old</code></p>
              </body>
            </html>
          `)
        })
      })
    })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
  
  // Add debugging for blank window
  mainWindow.webContents.on('dom-ready', () => {
    console.log('DOM ready')
  })
  
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page finished loading')
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})