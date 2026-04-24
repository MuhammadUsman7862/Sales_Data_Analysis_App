import { useEffect, useState, useRef } from 'react'
import { Upload, Zap, FileText, AlertCircle, Loader } from 'lucide-react'

export default function UploadPage({ onDemo, onUpload, loading, error }) {
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState(null)
  const [datasetFiles, setDatasetFiles] = useState([])
  const [selectedDataset, setSelectedDataset] = useState('')
  const inputRef = useRef()

  const handleFile = (file) => {
    if (!file) return
    setFileName(file.name)
    onUpload(file)
  }

  const useSampleDataset = async () => {
    try {
      const res = await fetch('/sample-sales-dataset.csv')
      if (!res.ok) throw new Error('Could not load bundled sample dataset')
      const blob = await res.blob()
      const file = new File([blob], 'sample-sales-dataset.csv', { type: 'text/csv' })
      handleFile(file)
    } catch {
      // Let existing API error handling show any backend-side issue after upload.
    }
  }

  useEffect(() => {
    const loadDatasetIndex = async () => {
      try {
        const res = await fetch('/test-datasets/index.json')
        if (!res.ok) return
        const json = await res.json()
        const files = Array.isArray(json?.files) ? json.files : []
        setDatasetFiles(files)
        if (files.length > 0) {
          setSelectedDataset(files[0])
        }
      } catch {
        setDatasetFiles([])
      }
    }
    loadDatasetIndex()
  }, [])

  const loadDatasetFromLibrary = async () => {
    if (!selectedDataset) return
    try {
      const path = `/test-datasets/${selectedDataset}`
      const res = await fetch(path)
      if (!res.ok) throw new Error('Could not load selected test dataset')
      const blob = await res.blob()
      const file = new File([blob], selectedDataset, { type: 'text/csv' })
      handleFile(file)
    } catch {
      // Existing error state is handled by backend upload response.
    }
  }

  return (
    <div style={{
      minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div className="fade-up" style={{ width: '100%', maxWidth: 560 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
            marginBottom: 20, animation: 'pulse-ring 2s infinite',
          }}>
            <Zap size={28} color="#fff" />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-head)', fontSize: 34, fontWeight: 800,
            background: 'linear-gradient(90deg, #f1f5f9, #94a3b8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 10,
          }}>
            Sales Data Analysis
          </h1>
          <p style={{ color: 'var(--text3)', fontSize: 15, maxWidth: 380, margin: '0 auto' }}>
            Upload your CSV/Excel sales dataset or explore with the built-in demo data.
          </p>
        </div>

        {/* Demo button */}
        <button
          onClick={onDemo}
          disabled={loading}
          style={{
            width: '100%', padding: '14px', borderRadius: 'var(--radius)',
            background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
            border: 'none', cursor: loading ? 'wait' : 'pointer',
            color: '#fff', fontFamily: 'var(--font-head)', fontSize: 15, fontWeight: 700,
            marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'opacity 0.2s', opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? <><Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> Loading...</> : <><Zap size={16} /> Try Demo Dataset</>}
        </button>

        <button
          onClick={useSampleDataset}
          disabled={loading}
          style={{
            width: '100%', padding: '12px', borderRadius: 'var(--radius)',
            background: 'var(--surface)', border: '1px solid var(--border)',
            cursor: loading ? 'wait' : 'pointer',
            color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
            marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.2s', opacity: loading ? 0.7 : 1,
          }}
        >
          <FileText size={15} />
          Use Included Sample CSV
        </button>

        <a
          href="/sample-sales-dataset.csv"
          download="sample-sales-dataset.csv"
          style={{
            width: '100%', padding: '12px', borderRadius: 'var(--radius)',
            background: 'transparent', border: '1px solid var(--border)',
            cursor: 'pointer',
            color: 'var(--text2)', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
            marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            textDecoration: 'none',
          }}
        >
          <FileText size={15} />
          Download Sample Dataset
        </a>

        {datasetFiles.length > 0 && (
          <div style={{
            marginBottom: 16, padding: '12px', borderRadius: 'var(--radius)',
            background: 'var(--surface)', border: '1px solid var(--border)',
            display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 10,
          }}>
            <select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              style={{
                background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8,
                color: 'var(--text)', padding: '10px 12px', fontSize: 13,
              }}
            >
              {datasetFiles.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
            <button
              onClick={loadDatasetFromLibrary}
              disabled={loading || !selectedDataset}
              style={{
                border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px',
                background: 'transparent', color: 'var(--text2)', cursor: 'pointer', fontWeight: 600,
              }}
            >
              Use file
            </button>
            <a
              href={selectedDataset ? `/test-datasets/${selectedDataset}` : '/test-datasets/'}
              download={selectedDataset}
              style={{
                border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px',
                background: 'transparent', color: 'var(--text2)', textDecoration: 'none', fontWeight: 600,
                display: 'inline-flex', alignItems: 'center',
              }}
            >
              Download
            </a>
          </div>
        )}

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: 12, color: 'var(--text3)' }}>OR</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* Drop zone */}
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
          onClick={() => inputRef.current.click()}
          style={{
            border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '36px 24px',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragOver ? 'rgba(59,130,246,0.05)' : 'var(--surface)',
            transition: 'all 0.2s',
          }}
        >
          <input
            ref={inputRef} type="file" accept=".csv,.txt,.xlsx,.xls"
            style={{ display: 'none' }}
            onChange={e => handleFile(e.target.files[0])}
          />
          <Upload size={28} color={dragOver ? 'var(--accent)' : 'var(--text3)'} style={{ marginBottom: 12 }} />
          <div style={{ fontWeight: 500, marginBottom: 6, color: dragOver ? 'var(--accent)' : 'var(--text)' }}>
            {fileName ? fileName : 'Drop your file here'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)' }}>Supports CSV, TXT, XLSX · Click to browse</div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginTop: 16, padding: '12px 16px', borderRadius: 'var(--radius)',
            background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.3)',
            display: 'flex', alignItems: 'center', gap: 10,
            color: '#f87171', fontSize: 13,
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Expected columns hint */}
        <div style={{
          marginTop: 20, padding: '14px 18px', borderRadius: 'var(--radius)',
          background: 'var(--surface)', border: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <FileText size={14} color="var(--text3)" />
            <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>Expected CSV columns</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {['date', 'product', 'category', 'region', 'quantity', 'unit_price', 'revenue'].map(col => (
              <span key={col} style={{
                padding: '2px 10px', borderRadius: 999,
                background: 'rgba(59,130,246,0.1)', color: 'var(--accent)',
                fontSize: 11, fontFamily: 'monospace',
              }}>
                {col}
              </span>
            ))}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text3)' }}>
            Test dataset library is loaded from:
            <span style={{ color: 'var(--text2)' }}> /test-datasets/index.json</span>
          </div>
        </div>
      </div>
    </div>
  )
}
