'use client'

export default function GlobalError({ error, reset }) {
  return (
    <html lang="es-EC">
      <body style={{ fontFamily: 'Inter, system-ui, sans-serif', margin: 0, padding: 24, background: '#FAFAFB' }}>
        <div style={{ maxWidth: 480, margin: '10vh auto', background: 'white', borderRadius: 24, padding: 32, textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: 40 }}>⚠️</div>
          <h1 style={{ fontSize: 20, marginTop: 12 }}>Error grave en NearUs</h1>
          <p style={{ color: '#71717a', fontSize: 14, marginTop: 8 }}>
            Algo no funcionó como esperábamos. Vuelve a intentar.
          </p>
          {error?.message && (
            <pre style={{ marginTop: 16, fontSize: 11, color: '#dc2626', background: '#fef2f2', padding: 12, borderRadius: 8, textAlign: 'left', overflow: 'auto' }}>
              {error.message}
            </pre>
          )}
          <button
            onClick={() => reset()}
            style={{ marginTop: 16, background: '#534AB7', color: 'white', border: 'none', padding: '10px 24px', borderRadius: 999, fontWeight: 500, cursor: 'pointer' }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  )
}
