'use client'
import { useEffect, useState } from 'react'

const COLORES = ['#2BACE2', '#F59E0B', '#FBBF24', '#22c55e', '#ffffff', '#534AB7', '#A8336E']

// Estalla confeti cuando `trigger` (un contador) cambia a un valor > 0.
// Se limpia solo. pointer-events none → no bloquea la UI.
export default function Confeti({ trigger }) {
  const [piezas, setPiezas] = useState([])

  useEffect(() => {
    if (!trigger) return
    const arr = Array.from({ length: 90 }, (_, i) => ({
      id: `${trigger}-${i}`,
      left: Math.random() * 100,
      delay: Math.random() * 0.35,
      dur: 1.5 + Math.random() * 1.3,
      color: COLORES[Math.floor(Math.random() * COLORES.length)],
      size: 6 + Math.random() * 7,
      rot: Math.random() * 360
    }))
    setPiezas(arr)
    const t = setTimeout(() => setPiezas([]), 3000)
    return () => clearTimeout(t)
  }, [trigger])

  if (!piezas.length) return null

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
      {piezas.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            top: '-5vh',
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            borderRadius: 2,
            transform: `rotate(${p.rot}deg)`,
            animation: `confeti-fall ${p.dur}s ${p.delay}s cubic-bezier(0.4,0.2,0.6,1) forwards`
          }}
        />
      ))}
    </div>
  )
}
