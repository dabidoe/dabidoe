import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

console.log('🚀 main.jsx loading...')
console.log('✅ React imported:', !!React)
console.log('✅ ReactDOM imported:', !!ReactDOM)
console.log('✅ App component imported:', !!App)

const rootElement = document.getElementById('root')
console.log('✅ Root element found:', !!rootElement)

if (!rootElement) {
  console.error('❌ FATAL: #root element not found in DOM!')
  document.body.innerHTML = '<div style="color: red; padding: 20px; font-family: monospace;">ERROR: #root element not found. Check index.html</div>'
} else {
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
    console.log('✅ React app rendered successfully')
  } catch (error) {
    console.error('❌ Error rendering app:', error)
    rootElement.innerHTML = '<div style="color: red; padding: 20px; font-family: monospace;">ERROR: ' + error.message + '</div>'
  }
}
