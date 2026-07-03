'use client'
// Envuelve cada ruta del cliente. Al navegar, `template` se re-monta, así que
// la animación de entrada corre en cada cambio de pantalla (transición suave).
export default function Template({ children }) {
  return <div className="animate-page">{children}</div>
}
