import { useState, useCallback } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Products from './pages/Products.jsx'
import Trends from './pages/Trends.jsx'
import DataTable from './pages/DataTable.jsx'
import UploadPage from './pages/UploadPage.jsx'

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

async function parseError(res, fallbackMessage) {
  try {
    const payload = await res.json()
    return payload?.detail || payload?.message || fallbackMessage
  } catch {
    return fallbackMessage
  }
}

export default function App() {
  const [page, setPage] = useState('upload')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadDemo = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API}/api/demo`)
      if (!res.ok) {
        throw new Error(await parseError(res, 'Failed to load demo data'))
      }
      const json = await res.json()
      setData(json)
      setPage('dashboard')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const uploadFile = useCallback(async (file) => {
    setLoading(true)
    setError(null)
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await fetch(`${API}/api/upload`, { method: 'POST', body: form })
      if (!res.ok) {
        throw new Error(await parseError(res, 'Upload failed'))
      }
      const json = await res.json()
      setData(json)
      setPage('dashboard')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const pageProps = { data, loading, error }
  const safePage = data ? page : 'upload'

  return (
    <div className="app-shell">
      <Sidebar page={safePage} setPage={setPage} hasData={!!data} />
      <main className="app-main">
        {safePage === 'upload' && <UploadPage onDemo={loadDemo} onUpload={uploadFile} loading={loading} error={error} />}
        {safePage === 'dashboard' && <Dashboard {...pageProps} />}
        {safePage === 'products' && <Products {...pageProps} />}
        {safePage === 'trends' && <Trends {...pageProps} />}
        {safePage === 'data' && <DataTable {...pageProps} />}
      </main>
    </div>
  )
}
