'use client'
import { useState } from 'react'
import Image from 'next/image'

// Bloque skeleton con shimmer (usar mientras algo carga).
export function Shimmer({ className = '' }) {
  return <div className={`skeleton rounded-xl ${className}`} />
}

// Imagen que muestra shimmer hasta cargar y luego hace fade-in. Debe ir dentro
// de un contenedor `relative` (usa fill). Reemplaza <Image fill> en las tarjetas.
export function ImagenSuave({ src, alt = '', sizes, priority = false, className = '' }) {
  const [cargada, setCargada] = useState(false)
  return (
    <>
      {!cargada && <div className="absolute inset-0 skeleton" />}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onLoad={() => setCargada(true)}
        onError={() => setCargada(true)}
        className={`object-cover transition-opacity duration-500 ${cargada ? 'opacity-100' : 'opacity-0'} ${className}`}
      />
    </>
  )
}
