import Image from 'next/image'

export default function Logo({ size = 'md', invertido = false, soloIcono = false }) {
  const tamaños = {
    sm: { h: 28, w: 90 },
    md: { h: 36, w: 120 },
    lg: { h: 52, w: 175 },
    xl: { h: 72, w: 240 }
  }
  const { h, w } = tamaños[size] || tamaños.md

  if (soloIcono) {
    return (
      <div
        className={`grid place-items-center rounded-2xl font-bold shrink-0 ${
          invertido ? 'bg-marca-500 text-white' : 'bg-black text-white'
        }`}
        style={{ width: h, height: h }}
      >
        <PinIcono size={h * 0.6} color={invertido ? 'white' : '#2BACE2'} />
      </div>
    )
  }

  return (
    <div
      className={`inline-flex items-center font-extrabold tracking-tight select-none ${
        invertido ? 'text-white' : 'text-black'
      }`}
      style={{ fontSize: h * 0.7, lineHeight: 1 }}
    >
      <PinIcono size={h * 0.85} color={invertido ? 'white' : 'currentColor'} className="mr-1.5" />
      <span style={{ letterSpacing: '-0.02em' }}>NEAR</span>
      <span className="text-marca-500" style={{ letterSpacing: '-0.02em' }}>US</span>
    </div>
  )
}

function PinIcono({ size = 32, color = 'black', className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <path
        d="M12 22s8-7.5 8-13a8 8 0 1 0-16 0c0 5.5 8 13 8 13Z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9" r="2.5" stroke={color} strokeWidth="2" />
    </svg>
  )
}
